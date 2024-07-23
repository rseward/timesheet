from fastapi import FastAPI, APIRouter, Depends, HTTPException

import pprint
import sqlalchemy
import bluestone.timesheet.config as cfg
#from bluestone.timesheet.data.models import task
from bluestone.timesheet.jsonmodels import TaskJson

from bluestone.timesheet.data.daos import getDaoFactory
#from api.depends.auth import validate_is_authenticated
from bluestone.timesheet.auth.auth_bearer import JWTBearer, JWT_SECRET_KEY_ALGORITHMS

daos = getDaoFactory()

router = APIRouter(
    prefix="/api/tasks",
    tags=["tasks"],
    responses={404: {"description": "Not found"}},
)

@router.get(
    "/",
    response_model=dict[str, dict[int, TaskJson]],
#    dependencies=[Depends(JWTBearer())],    
#    dependencies=[Depends(validate_is_authenticated)],
)

# FastAPI handles JSON marshalling for us. We simply use built-in python and Pydantic types
def index(client_id: int = None, project_id: int = None) -> dict[str, dict[int, TaskJson]]:     
    cmap = {}
    TaskDao = daos.getTaskDao()
    for row in TaskDao.getAll(client_id=client_id, project_id=project_id):
        (dbtask, project_name) = row
        j = TaskDao.toJson(dbtask, project_name)
        cmap[ j.task_id ] = j
        
    res = {"tasks": cmap}
    pprint.pprint(res)
    return res

@router.get(
    "/{task_id}",
    response_model=dict[str, TaskJson],
    #dependencies=[Depends(JWTBearer())],    
#    dependencies=[Depends(validate_is_authenticated)],
)
# @app.get("/tasks/{task_id}")
def task_by_id(task_id: int) -> dict[str, TaskJson] :
        taskDao = daos.getTaskDao()
        (dbtask, project_name) = taskDao.getById(task_id)
        
        if not(dbtask):
            raise HTTPException( status_code=404, detail=f"task with task_id={task_id} does not exist.")
        return { "task": taskDao.toJson(dbtask, project_name) }


@router.post(
    "/",
    response_model=dict[str, TaskJson],
#    dependencies=[Depends(JWTBearer())],    
#    dependencies=[Depends(validate_is_authenticated)],
)
#@app.post("/tasks/")
def task_add(js: TaskJson) -> dict[ str, TaskJson]:
    taskDao = daos.getTaskDao()
    if js.task_id == 0:
        js.task_id=None
    
    if js.task_id: 
        (dbrec, project_name) = taskDao.getById(js.task_id)
        if dbrec:
            raise HTTPException(
                status_code=400, 
                detail=f"task with task_id={js.task_id} already exists."
            )
        
    dbrec = taskDao.toModel(js)
    try:
        taskDao.save(dbrec)
        taskDao.flush()
        taskDao.refresh(dbrec)
        js.task_id = dbrec.task_id
        taskDao.commit()
        return { "added": js}
    except:
        taskDao.rollback()
        raise
        #return { "failed": "More detail here?" }
    
    

@router.put(
    "/",
    response_model=dict[str, TaskJson],
#    dependencies=[Depends(JWTBearer())],    
#    dependencies=[Depends(validate_is_authenticated)],
)        
#@app.put("/tasks/")
def task_update(js: TaskJson) -> dict[ str, TaskJson]:
    taskDao = daos.getTaskDao()
    (dbrec, project_name) = taskDao.getById(js.task_id)
    
    try:    
        dbrec = taskDao.update(dbrec, js)
        taskDao.commit()
    except:
        taskDao.rollback()
        
    return { "updated": taskDao.toJson(dbrec, project_name) }

@router.delete(
    "/",
    response_model=dict[str, TaskJson],
    dependencies=[Depends(JWTBearer())],    
#    dependencies=[Depends(validate_is_authenticated)],
)        
#@app.delete("/tasks/{task_id}")
def task_delete(task_id: int) -> dict[str, TaskJson]:
    taskDao = daos.getTaskDao()
    dbrec = taskDao.getById(task_id)
    
    if dbrec is None:
        raise HTTPException(status_code=400, detail=f"task with {task_id=} does not exist.")
        
    taskDao.delete(dbrec.task_id)
    taskDao.commit()
    
    return { "deleted": taskDao.toJson(dbrec)}    
    

