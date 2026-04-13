from fastapi import APIRouter, Depends

from bluestone.timesheet.jsonmodels import TimekeeperJson
from bluestone.timesheet.data.daos import getDaoFactory
from bluestone.timesheet.auth.auth_bearer import JWTBearer

daos = getDaoFactory()

router = APIRouter(
    prefix="/api/timekeepers",
    tags=["timekeepers"],
    responses={404: {"description": "Not found"}},
)


@router.get(
    "/",
    response_model=dict[str, dict[str, TimekeeperJson]],
    dependencies=[Depends(JWTBearer())],
)
def list_timekeepers():
    """List all timekeepers."""
    tk_dao = daos.getTimekeeperDao()
    result = {}
    for tk in tk_dao.getAll():
        j = tk_dao.toJson(tk)
        result[str(j.timekeeper_id)] = j
    
    return {"timekeepers": result}


@router.get(
    "/{timekeeper_id}",
    response_model=dict[str, TimekeeperJson],
    dependencies=[Depends(JWTBearer())],
)
def get_timekeeper(timekeeper_id: int):
    """Get a specific timekeeper by ID."""
    tk_dao = daos.getTimekeeperDao()
    tk = tk_dao.getById(timekeeper_id)
    
    if tk is None:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail=f"Timekeeper with id={timekeeper_id} not found")
    
    return {"timekeeper": tk_dao.toJson(tk)}