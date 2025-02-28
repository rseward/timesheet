from re import S
from fastapi import FastAPI, APIRouter, Depends, HTTPException

import pprint
import sqlalchemy
import bluestone.timesheet.config as cfg
from bluestone.timesheet.jsonmodels import ProjectJson

from bluestone.timesheet.data.daos import getDaoFactory
from bluestone.timesheet.auth.auth_bearer import JWTBearer, JWT_SECRET_KEY_ALGORITHMS

daos = getDaoFactory()

router = APIRouter(
    prefix="/api/reports",
    tags=["reports"],
    responses={404: {"description": "Not found"}},
)

@router.get(
    "/",
    response_model=dict[str, dict[int, ProjectJson]],
    dependencies=[Depends(JWTBearer())],    
)
def index(client_id: int = None, project_id: int = None, active: bool = True) -> dict[str, dict[int, str] ]:     
    cmap = {}
    # TODO: consider the design of the json data for the report results. The results should be easily convertible to Excel or CSV.
    #TaskDao = daos.getTaskDao()