"""
Admin router for database backup and restore operations.

Backup:  GET /api/admin/backup  -> StreamingResponse of gzipped SQLite DB
Restore: POST /api/admin/restore (multipart file) -> replaces the live DB file
"""

import os
import gzip
import shutil
import tempfile
import sqlite3
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import StreamingResponse

import bluestone.timesheet.config as cfg
from bluestone.timesheet.auth.auth_bearer import JWTBearer

router = APIRouter(
    prefix="/api/admin",
    tags=["admin"],
    responses={404: {"description": "Not found"}},
)


def _get_db_path() -> str:
    """Extract the filesystem path of the SQLite database from the SA URL."""
    saurl = cfg.saurl
    if not saurl:
        raise HTTPException(status_code=500, detail="TIMESHEET_SA_URL is not configured")

    # Handle sqlite:///path/to/db.sqlite and sqlite://path
    if saurl.startswith("sqlite:///"):
        return saurl.replace("sqlite:///", "", 1)
    elif saurl.startswith("sqlite://"):
        return saurl.replace("sqlite://", "", 1)
    else:
        raise HTTPException(
            status_code=500,
            detail=f"Only SQLite databases are supported for backup/restore, got: {saurl}",
        )


@router.get(
    "/backup",
    dependencies=[Depends(JWTBearer())],
)
async def backup_database():
    """
    Download a gzipped copy of the SQLite database.

    Returns a StreamingResponse with Content-Type application/gzip
    and a Content-Disposition header suggesting a timestamped filename.
    """
    db_path = _get_db_path()

    if not os.path.exists(db_path):
        raise HTTPException(status_code=404, detail=f"Database file not found: {db_path}")

    # Create a temporary gzipped copy
    tmp_fd, tmp_path = tempfile.mkstemp(suffix=".db.gz")
    os.close(tmp_fd)

    try:
        # Use SQLite backup API for a safe, consistent snapshot
        src = sqlite3.connect(db_path)
        dst = sqlite3.connect(tmp_path.replace(".gz", ""))
        src.backup(dst)
        dst.close()
        src.close()

        # Gzip the snapshot
        with open(tmp_path.replace(".gz", ""), "rb") as f_in:
            with gzip.open(tmp_path, "wb") as f_out:
                shutil.copyfileobj(f_in, f_out)

        # Clean up the ungzipped snapshot
        os.unlink(tmp_path.replace(".gz", ""))

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"timesheet_backup_{timestamp}.db.gz"

        def file_iterator(path: str, chunk_size: int = 64 * 1024):
            with open(path, "rb") as f:
                while True:
                    chunk = f.read(chunk_size)
                    if not chunk:
                        break
                    yield chunk
            # Clean up temp file after streaming is done
            try:
                os.unlink(path)
            except OSError:
                pass

        return StreamingResponse(
            file_iterator(tmp_path),
            media_type="application/gzip",
            headers={
                "Content-Disposition": f'attachment; filename="{filename}"',
            },
        )
    except Exception as e:
        # Clean up temp files on error
        for p in (tmp_path, tmp_path.replace(".gz", "")):
            try:
                os.unlink(p)
            except OSError:
                pass
        raise HTTPException(status_code=500, detail=f"Backup failed: {str(e)}")


@router.post(
    "/restore",
    dependencies=[Depends(JWTBearer())],
)
async def restore_database(file: UploadFile = File(...)):
    """
    Restore the SQLite database from an uploaded gzipped backup file.

    The uploaded file must be a gzip-compressed SQLite database.
    The current database is backed up to a .bak file before replacement.
    """
    db_path = _get_db_path()

    if not os.path.exists(db_path):
        raise HTTPException(status_code=404, detail=f"Database file not found: {db_path}")

    # Read the uploaded file
    contents = await file.read()
    if not contents:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")

    # Decompress the gzip data
    try:
        decompressed = gzip.decompress(contents)
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Failed to decompress file. Ensure the upload is a valid gzip archive.",
        )

    # Validate the decompressed data is a valid SQLite database
    tmp_fd, tmp_db_path = tempfile.mkstemp(suffix=".db")
    os.close(tmp_fd)
    try:
        with open(tmp_db_path, "wb") as f:
            f.write(decompressed)

        # Validate it's a real SQLite database
        try:
            conn = sqlite3.connect(tmp_db_path)
            conn.execute("SELECT name FROM sqlite_master WHERE type='table' LIMIT 1")
            conn.close()
        except sqlite3.DatabaseError:
            raise HTTPException(
                status_code=400,
                detail="The decompressed file is not a valid SQLite database.",
            )

        # Back up the current database
        bak_path = db_path + ".bak"
        shutil.copy2(db_path, bak_path)

        # Replace the current database with the restored one
        shutil.move(tmp_db_path, db_path)

        return {
            "status": "success",
            "message": "Database restored successfully. A backup of the previous database was saved as .bak",
            "backup_file": bak_path,
        }
    except HTTPException:
        raise
    except Exception as e:
        # Clean up temp file
        try:
            os.unlink(tmp_db_path)
        except OSError:
            pass
        raise HTTPException(status_code=500, detail=f"Restore failed: {str(e)}")