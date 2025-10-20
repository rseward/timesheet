from fastapi import FastAPI, APIRouter, Depends, HTTPException

import pprint
import sqlalchemy
import datetime
import bluestone.timesheet.config as cfg
from bluestone.timesheet.jsonmodels import BillingEventJson

from bluestone.timesheet.data.daos import getDaoFactory
from bluestone.timesheet.auth.auth_bearer import JWTBearer, JWT_SECRET_KEY_ALGORITHMS

daos = getDaoFactory()

router = APIRouter(
    prefix="/api/events",
    tags=["billingevents"],
    responses={404: {"description": "Not found"}},
)

# FastAPI handles JSON marshalling for us. We simply use built-in python and Pydantic types
@router.get(
    "/",
    response_model=dict[str, dict[str, BillingEventJson]],
    dependencies=[Depends(JWTBearer())],    
)
def index(client_id: int = None, project_id: int = None, start_date: str = None, end_date: str = None, active: bool = True) -> dict[str, dict[str, BillingEventJson]]:
        cmap = {}
        if start_date is not None:
            start_date = datetime.datetime.fromisoformat(start_date)
        if end_date is not None:
            end_date = datetime.datetime.fromisoformat(end_date) + datetime.timedelta(days=1)
        
        BillingEventDao = daos.getBillingEventDao()
        for row in BillingEventDao.getAll(client_id, project_id, start_date, end_date, include_inactive=not(active)):
            j = BillingEventDao.toJson(row[0], row[1], row[2])
            cmap[ j.uid ] = j
            
        res = {"events": cmap}
        pprint.pprint(res)
        return res

@router.get(
    "/{uid}",
    response_model=dict[str, BillingEventJson],
    dependencies=[Depends(JWTBearer())],    
)
# @app.get("/events/{uid}")
def event_by_id(uid: str) -> dict[str, BillingEventJson] :
        eventDao = daos.getBillingEventDao()
        result = eventDao.getById(uid)
        
        if result is None:
            raise HTTPException(status_code=404, detail=f"event with uid={uid} does not exist.")
        
        (dbevent, project_name, task_name) = result
        return { "event": eventDao.toJson(dbevent, project_name, task_name) }


@router.post(
    "/",
    response_model=dict[str, BillingEventJson],
    dependencies=[Depends(JWTBearer())],    
)
#@app.post("/events/")
def event_add(js: BillingEventJson) -> dict[ str, BillingEventJson]:
    eventDao = daos.getBillingEventDao()
    if js.uid == 0:
        js.uid=None
    
    if js.uid: 
        result = eventDao.getById(js.uid)
        if result is not None:
            (dbrec, _, _) = result
            if dbrec:
                raise HTTPException(status_code=400, detail=f"event with uid={js.uid} already exists.")
        
    dbrec = eventDao.toModel(js)
    try:
        eventDao.save(dbrec)
        eventDao.flush()
        eventDao.refresh(dbrec)
        js.uid = dbrec.uid
        eventDao.commit()
        return { "added": js}
    except:
        eventDao.rollback()
        raise
        #return { "failed": "More detail here?" }
    
    

@router.put(
    "/",
    response_model=dict[str, BillingEventJson],
    dependencies=[Depends(JWTBearer())],    
)        
#@app.put("/events/")
def event_update(js: BillingEventJson) -> dict[ str, BillingEventJson]:
    eventDao = daos.getBillingEventDao()
    result = eventDao.getById(js.uid)
    
    if result is None:
        raise HTTPException(status_code=404, detail=f"event with uid={js.uid} does not exist.")
    
    (dbrec, project_name, task_name) = result
    
    try:    
        dbrec = eventDao.update(dbrec, js)
        eventDao.commit()
        return { "updated": eventDao.toJson(dbrec, project_name, task_name) }
    except Exception as e:
        eventDao.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update event: {str(e)}")

#@app.delete("/events/{uid}")
@router.delete(
    "/{uid}",
    response_model=dict[str, BillingEventJson],
    dependencies=[Depends(JWTBearer())],    
)
def event_delete(uid: str) -> dict[str, BillingEventJson]:
    eventDao = daos.getBillingEventDao()
    result = eventDao.getById(uid)
    
    if result is None:
        raise HTTPException(status_code=404, detail=f"event with uid={uid} does not exist.")
    
    (dbrec, project_name, task_name) = result
        
    print(f"deleting event with uid={uid}")
    eventDao.delete(dbrec.uid)
    eventDao.commit()
    
    return { "deleted": eventDao.toJson(dbrec, project_name, task_name) }
    

@router.get(
    "/nextid/{timekeeper_id}/{project_id}/{task_id}",
    response_model=dict[str, int],
    dependencies=[Depends(JWTBearer())],
)
def next_id(timekeeper_id: int, project_id: int, task_id: int) -> dict[str, int]:
    eventDao = daos.getBillingEventDao()
    return { 
        "timekeeper_id": timekeeper_id,
        "project_id": project_id,
        "task_id": task_id,
        "next_trans_num": eventDao.nextTransNum(timekeeper_id, project_id, task_id) 
        }
