import datetime
from typing import Optional, List
from fastapi import FastAPI, APIRouter, Depends, HTTPException, Query

import pprint
import sqlalchemy
import bluestone.timesheet.config as cfg
from bluestone.timesheet.jsonmodels import (
    ProjectJson,
    ReportRowJson,
    TimePeriodReportRequest,
    ClientPeriodReportRequest,
    TimekeeperPeriodReportRequest,
)

from bluestone.timesheet.data.daos import getDaoFactory
from bluestone.timesheet.data.models import BillingEvent, Project, Task, Timekeeper, Client
from bluestone.timesheet.auth.auth_bearer import JWTBearer, JWT_SECRET_KEY_ALGORITHMS

daos = getDaoFactory()

router = APIRouter(
    prefix="/api/reports",
    tags=["reports"],
    responses={404: {"description": "Not found"}},
)


def _calculate_hours(start_time: datetime.datetime, end_time: datetime.datetime) -> float:
    """Calculate hours between two datetimes, rounded to 1 decimal."""
    delta = end_time - start_time
    return round(delta.total_seconds() / 3600, 1)


def _build_time_period_rows(start_date: datetime.datetime, end_date: datetime.datetime) -> List[dict]:
    """Build report rows for Time Period Report.

    Returns all active billing events in the date range, enriched with
    client name, resource name, project title, hours, and bill rate.
    """
    session = daos.getBillingEventDao().getSession()

    q = session.query(
        BillingEvent, Project.title, Task.name, Timekeeper.first_name,
        Timekeeper.last_name, Timekeeper.bill_rate, Client.organisation
    )
    q = q.filter(BillingEvent.project_id == Project.project_id)
    q = q.filter(BillingEvent.task_id == Task.task_id)
    q = q.filter(BillingEvent.timekeeper_id == Timekeeper.timekeeper_id)
    q = q.filter(Project.client_id == Client.client_id)
    q = q.filter(BillingEvent.start_time >= start_date)
    q = q.filter(BillingEvent.start_time <= end_date)
    q = q.filter(BillingEvent.active)
    q = q.order_by(Client.organisation, Project.title, Timekeeper.last_name, BillingEvent.start_time)

    results = q.all()
    rows = []
    for row in results:
        event = row[0]
        project_title = row[1]
        task_name = row[2]
        first_name = row[3]
        last_name = row[4]
        bill_rate = row[5]
        client_org = row[6]

        hours = _calculate_hours(event.start_time, event.end_time)
        date_str = event.start_time.date().isoformat() if hasattr(event.start_time, 'date') else str(event.start_time)[:10]

        rows.append({
            "client": client_org,
            "resource": f"{first_name} {last_name}",
            "date": date_str,
            "hours": hours,
            "bill_rate": bill_rate,
            "task": event.log_message or task_name,
            "project": project_title,
        })

    return rows


def _build_client_period_rows(start_date: datetime.datetime, end_date: datetime.datetime,
                               client_id: int, project_id: Optional[int] = None) -> List[dict]:
    """Build report rows for Client Period Report.

    Returns active billing events for a specific client (and optionally project)
    in the date range.
    """
    session = daos.getBillingEventDao().getSession()

    q = session.query(
        BillingEvent, Project.title, Task.name, Timekeeper.first_name,
        Timekeeper.last_name, Timekeeper.bill_rate, Client.organisation
    )
    q = q.filter(BillingEvent.project_id == Project.project_id)
    q = q.filter(BillingEvent.task_id == Task.task_id)
    q = q.filter(BillingEvent.timekeeper_id == Timekeeper.timekeeper_id)
    q = q.filter(Project.client_id == Client.client_id)
    q = q.filter(Client.client_id == client_id)
    q = q.filter(BillingEvent.start_time >= start_date)
    q = q.filter(BillingEvent.start_time <= end_date)
    q = q.filter(BillingEvent.active)

    if project_id is not None:
        q = q.filter(BillingEvent.project_id == project_id)

    q = q.order_by(Project.title, Timekeeper.last_name, BillingEvent.start_time)

    results = q.all()
    rows = []
    for row in results:
        event = row[0]
        project_title = row[1]
        task_name = row[2]
        first_name = row[3]
        last_name = row[4]
        bill_rate = row[5]
        client_org = row[6]

        hours = _calculate_hours(event.start_time, event.end_time)
        date_str = event.start_time.date().isoformat() if hasattr(event.start_time, 'date') else str(event.start_time)[:10]

        rows.append({
            "client": client_org,
            "resource": f"{first_name} {last_name}",
            "date": date_str,
            "hours": hours,
            "bill_rate": bill_rate,
            "task": event.log_message or task_name,
            "project": project_title,
        })

    return rows


def _build_timekeeper_period_rows(start_date: datetime.datetime, end_date: datetime.datetime,
                                   timekeeper_id: int) -> List[dict]:
    """Build report rows for TimeKeeper Period Report.

    Returns active billing events for a specific timekeeper in the date range.
    """
    session = daos.getBillingEventDao().getSession()

    q = session.query(
        BillingEvent, Project.title, Task.name, Timekeeper.first_name,
        Timekeeper.last_name, Timekeeper.bill_rate, Client.organisation
    )
    q = q.filter(BillingEvent.project_id == Project.project_id)
    q = q.filter(BillingEvent.task_id == Task.task_id)
    q = q.filter(BillingEvent.timekeeper_id == Timekeeper.timekeeper_id)
    q = q.filter(Project.client_id == Client.client_id)
    q = q.filter(BillingEvent.timekeeper_id == timekeeper_id)
    q = q.filter(BillingEvent.start_time >= start_date)
    q = q.filter(BillingEvent.start_time <= end_date)
    q = q.filter(BillingEvent.active)
    q = q.order_by(BillingEvent.start_time)

    results = q.all()
    rows = []
    for row in results:
        event = row[0]
        project_title = row[1]
        task_name = row[2]
        first_name = row[3]
        last_name = row[4]
        bill_rate = row[5]
        client_org = row[6]

        hours = _calculate_hours(event.start_time, event.end_time)
        date_str = event.start_time.date().isoformat() if hasattr(event.start_time, 'date') else str(event.start_time)[:10]

        rows.append({
            "client": client_org,
            "resource": f"{first_name} {last_name}",
            "date": date_str,
            "hours": hours,
            "bill_rate": bill_rate,
            "task": event.log_message or task_name,
            "project": project_title,
        })

    return rows


def _compute_summary(rows: List[dict]) -> dict:
    """Compute summary statistics from report rows."""
    if not rows:
        return {
            "total_hours": 0.0,
            "total_rows": 0,
            "unique_resources": 0,
            "unique_projects": 0,
            "unique_clients": 0,
            "date_range": {"start": None, "end": None},
        }

    total_hours = sum(r["hours"] for r in rows)
    dates = [r["date"] for r in rows]

    return {
        "total_hours": round(total_hours, 1),
        "total_rows": len(rows),
        "unique_resources": len(set(r["resource"] for r in rows)),
        "unique_projects": len(set(r["project"] for r in rows if r.get("project"))),
        "unique_clients": len(set(r["client"] for r in rows if r.get("client"))),
        "date_range": {
            "start": min(dates),
            "end": max(dates),
        },
    }


@router.get(
    "/",
    response_model=dict,
    dependencies=[Depends(JWTBearer())],
)
def index() -> dict:
    """List available report types."""
    return {
        "reports": [
            {
                "type": "client-period",
                "name": "Client Period Report",
                "description": "Generate reports for specific clients within a date range",
                "endpoint": "/api/reports/client-period",
                "params": ["start_date", "end_date", "client_id", "project_id (optional)"],
            },
            {
                "type": "timekeeper-period",
                "name": "TimeKeeper Period Report",
                "description": "Comprehensive time tracking report for a specific timekeeper",
                "endpoint": "/api/reports/timekeeper-period",
                "params": ["start_date", "end_date", "timekeeper_id"],
            },
            {
                "type": "time-period",
                "name": "Time Period Report",
                "description": "General time analysis across all clients and resources",
                "endpoint": "/api/reports/time-period",
                "params": ["start_date", "end_date"],
            },
        ]
    }


@router.get(
    "/time-period",
    response_model=dict,
    dependencies=[Depends(JWTBearer())],
)
def time_period_report(
    start_date: str = Query(..., description="Start date (YYYY-MM-DD)"),
    end_date: str = Query(..., description="End date (YYYY-MM-DD)"),
) -> dict:
    """Generate a Time Period Report.

    Returns all billing events within the specified date range,
    including client, resource, date, hours, bill rate, task, and project.
    Also returns summary statistics.
    """
    try:
        sd = datetime.date.fromisoformat(start_date)
        ed = datetime.date.fromisoformat(end_date)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD.")

    if sd > ed:
        raise HTTPException(status_code=400, detail="start_date must be on or before end_date.")

    start_dt = datetime.datetime.combine(sd, datetime.time(0, 0))
    end_dt = datetime.datetime.combine(ed, datetime.time(23, 59, 59))

    rows = _build_time_period_rows(start_dt, end_dt)
    summary = _compute_summary(rows)

    return {
        "report_type": "time-period",
        "start_date": start_date,
        "end_date": end_date,
        "summary": summary,
        "rows": rows,
    }


@router.get(
    "/client-period",
    response_model=dict,
    dependencies=[Depends(JWTBearer())],
)
def client_period_report(
    start_date: str = Query(..., description="Start date (YYYY-MM-DD)"),
    end_date: str = Query(..., description="End date (YYYY-MM-DD)"),
    client_id: int = Query(..., description="Client ID"),
    project_id: Optional[int] = Query(None, description="Project ID (optional filter)"),
) -> dict:
    """Generate a Client Period Report.

    Returns billing events for a specific client within the date range.
    Optionally filter by project_id.
    """
    try:
        sd = datetime.date.fromisoformat(start_date)
        ed = datetime.date.fromisoformat(end_date)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD.")

    if sd > ed:
        raise HTTPException(status_code=400, detail="start_date must be on or before end_date.")

    start_dt = datetime.datetime.combine(sd, datetime.time(0, 0))
    end_dt = datetime.datetime.combine(ed, datetime.time(23, 59, 59))

    rows = _build_client_period_rows(start_dt, end_dt, client_id, project_id)
    summary = _compute_summary(rows)

    return {
        "report_type": "client-period",
        "start_date": start_date,
        "end_date": end_date,
        "client_id": client_id,
        "project_id": project_id,
        "summary": summary,
        "rows": rows,
    }


@router.get(
    "/timekeeper-period",
    response_model=dict,
    dependencies=[Depends(JWTBearer())],
)
def timekeeper_period_report(
    start_date: str = Query(..., description="Start date (YYYY-MM-DD)"),
    end_date: str = Query(..., description="End date (YYYY-MM-DD)"),
    timekeeper_id: int = Query(..., description="Timekeeper ID"),
) -> dict:
    """Generate a TimeKeeper Period Report.

    Returns billing events for a specific timekeeper within the date range.
    """
    try:
        sd = datetime.date.fromisoformat(start_date)
        ed = datetime.date.fromisoformat(end_date)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD.")

    if sd > ed:
        raise HTTPException(status_code=400, detail="start_date must be on or before end_date.")

    start_dt = datetime.datetime.combine(sd, datetime.time(0, 0))
    end_dt = datetime.datetime.combine(ed, datetime.time(23, 59, 59))

    rows = _build_timekeeper_period_rows(start_dt, end_dt, timekeeper_id)
    summary = _compute_summary(rows)

    return {
        "report_type": "timekeeper-period",
        "start_date": start_date,
        "end_date": end_date,
        "timekeeper_id": timekeeper_id,
        "summary": summary,
        "rows": rows,
    }


@router.get(
    "/time-period/csv",
    dependencies=[Depends(JWTBearer())],
)
def time_period_report_csv(
    start_date: str = Query(..., description="Start date (YYYY-MM-DD)"),
    end_date: str = Query(..., description="End date (YYYY-MM-DD)"),
):
    """Generate a Time Period Report as CSV download."""
    from fastapi.responses import StreamingResponse
    import io
    import csv

    try:
        sd = datetime.date.fromisoformat(start_date)
        ed = datetime.date.fromisoformat(end_date)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD.")

    start_dt = datetime.datetime.combine(sd, datetime.time(0, 0))
    end_dt = datetime.datetime.combine(ed, datetime.time(23, 59, 59))

    rows = _build_time_period_rows(start_dt, end_dt)

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Client", "Resource", "Date", "Hours", "Billing Rate", "Task", "Project"])
    for row in rows:
        writer.writerow([
            row["client"] or "",
            row["resource"],
            row["date"],
            row["hours"],
            row["bill_rate"] or "",
            row["task"] or "",
            row["project"] or "",
        ])

    output.seek(0)
    filename = f"time-period-report-{start_date}-to-{end_date}.csv"

    return StreamingResponse(
        io.BytesIO(output.getvalue().encode("utf-8")),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )


@router.get(
    "/client-period/csv",
    dependencies=[Depends(JWTBearer())],
)
def client_period_report_csv(
    start_date: str = Query(..., description="Start date (YYYY-MM-DD)"),
    end_date: str = Query(..., description="End date (YYYY-MM-DD)"),
    client_id: int = Query(..., description="Client ID"),
    project_id: Optional[int] = Query(None, description="Project ID (optional)"),
):
    """Generate a Client Period Report as CSV download."""
    from fastapi.responses import StreamingResponse
    import io
    import csv

    try:
        sd = datetime.date.fromisoformat(start_date)
        ed = datetime.date.fromisoformat(end_date)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD.")

    start_dt = datetime.datetime.combine(sd, datetime.time(0, 0))
    end_dt = datetime.datetime.combine(ed, datetime.time(23, 59, 59))

    rows = _build_client_period_rows(start_dt, end_dt, client_id, project_id)

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Client", "Resource", "Date", "Hours", "Billing Rate", "Task", "Project"])
    for row in rows:
        writer.writerow([
            row["client"] or "",
            row["resource"],
            row["date"],
            row["hours"],
            row["bill_rate"] or "",
            row["task"] or "",
            row["project"] or "",
        ])

    output.seek(0)
    filename = f"client-period-report-{start_date}-to-{end_date}.csv"

    return StreamingResponse(
        io.BytesIO(output.getvalue().encode("utf-8")),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )


@router.get(
    "/timekeeper-period/csv",
    dependencies=[Depends(JWTBearer())],
)
def timekeeper_period_report_csv(
    start_date: str = Query(..., description="Start date (YYYY-MM-DD)"),
    end_date: str = Query(..., description="End date (YYYY-MM-DD)"),
    timekeeper_id: int = Query(..., description="Timekeeper ID"),
):
    """Generate a TimeKeeper Period Report as CSV download."""
    from fastapi.responses import StreamingResponse
    import io
    import csv

    try:
        sd = datetime.date.fromisoformat(start_date)
        ed = datetime.date.fromisoformat(end_date)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD.")

    start_dt = datetime.datetime.combine(sd, datetime.time(0, 0))
    end_dt = datetime.datetime.combine(ed, datetime.time(23, 59, 59))

    rows = _build_timekeeper_period_rows(start_dt, end_dt, timekeeper_id)

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Client", "Resource", "Date", "Hours", "Billing Rate", "Task", "Project"])
    for row in rows:
        writer.writerow([
            row["client"] or "",
            row["resource"],
            row["date"],
            row["hours"],
            row["bill_rate"] or "",
            row["task"] or "",
            row["project"] or "",
        ])

    output.seek(0)
    filename = f"timekeeper-period-report-{start_date}-to-{end_date}.csv"

    return StreamingResponse(
        io.BytesIO(output.getvalue().encode("utf-8")),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )


@router.get(
    "/clients",
    dependencies=[Depends(JWTBearer())],
)
def list_clients():
    """List all active clients for report parameter selection."""
    ClientDao = daos.getClientDao()
    clients = ClientDao.getAll(include_inactive=False)
    return {
        "clients": [
            {"client_id": c.client_id, "organisation": c.organisation}
            for c in clients
        ]
    }


@router.get(
    "/timekeepers",
    dependencies=[Depends(JWTBearer())],
)
def list_timekeepers():
    """List all timekeepers for report parameter selection."""
    TimekeeperDao = daos.getTimekeeperDao()
    timekeepers = TimekeeperDao.getAll()
    return {
        "timekeepers": [
            {
                "timekeeper_id": t.timekeeper_id,
                "name": f"{t.first_name} {t.last_name}",
                "username": t.username,
            }
            for t in timekeepers
        ]
    }


@router.get(
    "/projects",
    dependencies=[Depends(JWTBearer())],
)
def list_projects(client_id: Optional[int] = Query(None, description="Filter by client ID")):
    """List all active projects for report parameter selection. Optionally filter by client_id."""
    ProjectDao = daos.getProjectDao()
    results = ProjectDao.getAll(include_inactive=False)

    projects = []
    for row in results:
        project = row[0]
        org = row[1]
        if client_id is not None and project.client_id != client_id:
            continue
        projects.append({
            "project_id": project.project_id,
            "title": project.title,
            "client_id": project.client_id,
            "client_name": org,
        })

    return {"projects": projects}