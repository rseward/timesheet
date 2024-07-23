from fastapi import FastAPI, APIRouter, Depends, HTTPException

import pprint
import sqlalchemy
import bluestone.timesheet.config as cfg
#from bluestone.timesheet.data.models import project
from bluestone.timesheet.jsonmodels import ProjectJson

from bluestone.timesheet.data.daos import getDaoFactory
#from api.depends.auth import validate_is_authenticated
from bluestone.timesheet.auth.auth_bearer import JWTBearer, JWT_SECRET_KEY_ALGORITHMS

daos = getDaoFactory()

router = APIRouter(
    prefix="/api/projects",
    tags=["projects"],
    responses={404: {"description": "Not found"}},
)

@router.get(
    "/",
    response_model=dict[str, dict[int, ProjectJson]],
    dependencies=[Depends(JWTBearer())],    
#    dependencies=[Depends(validate_is_authenticated)],
)

# FastAPI handles JSON marshalling for us. We simply use built-in python and Pydantic types
def index(client_id: int = None) -> dict[str, dict[int, ProjectJson]]:
        cmap = {}
        projectDao = daos.getProjectDao()
        
        projects = []
        if client_id is None:
            projects = projectDao.getAll()
        else:
            projects = projectDao.getByClientId(client_id)
        
        for dbproject in projects:
            (dbproj, client_name) = dbproject
            j = projectDao.toJson(dbproj, client_name)
            cmap[ j.project_id ] = j
            
        res = {"projects": cmap}
        pprint.pprint(res)
        return res

@router.get(
    "/{project_id}",
    response_model=dict[str, ProjectJson],
    dependencies=[Depends(JWTBearer())],    
#    dependencies=[Depends(validate_is_authenticated)],
)
# @app.get("/projects/{project_id}")
def project_by_id(project_id: int) -> dict[str, ProjectJson] :
        projectDao = daos.getProjectDao()
        dbproject = projectDao.getById(project_id)
        
        if not(dbproject):
            raise HTTPException( status_code=404, detail=f"project with project_id={project_id} does not exist.")
        (dbproj, client_name) = dbproject
        return { "project": projectDao.toJson(dbproj, client_name) }


@router.post(
    "/",
    response_model=dict[str, ProjectJson],
    dependencies=[Depends(JWTBearer())],    
#    dependencies=[Depends(validate_is_authenticated)],
)
#@app.post("/projects/")
def project_add(js: ProjectJson) -> dict[ str, ProjectJson]:
    projectDao = daos.getProjectDao()
    if js.project_id == 0:
        js.project_id=None
    
    if js.project_id: 
        dbrec = projectDao.getById(js.project_id)
        if dbrec:
            raise HTTPException(status_code=400, detail=f"project with project_id={js.project_id} already exists.")
        
    dbrec = projectDao.toModel(js)
    try:
        #dbrec.proj_status = dbrec.proj_status.lower()
        projectDao.save(dbrec)
        projectDao.flush()
        projectDao.refresh(dbrec)
        js.project_id = dbrec.project_id
        projectDao.commit()
        return { "added": js}
    except:
        projectDao.rollback()
        raise
        #return { "failed": "More detail here?" }
    
    

@router.put(
    "/",
    response_model=dict[str, ProjectJson],
    dependencies=[Depends(JWTBearer())],    
#    dependencies=[Depends(validate_is_authenticated)],
)        
#@app.put("/projects/")
def project_update(js: ProjectJson) -> dict[ str, ProjectJson]:
    projectDao = daos.getProjectDao()
    (dbrec, client_name) = projectDao.getById(js.project_id)
    
    try:    
        dbrec = projectDao.update(dbrec, js)
        projectDao.commit()
    except:
        projectDao.rollback()
        
    return { "updated": projectDao.toJson(dbrec, client_name) }

@router.delete(
    "/",
    response_model=dict[str, ProjectJson],
    dependencies=[Depends(JWTBearer())],    
#    dependencies=[Depends(validate_is_authenticated)],
)        
#@app.delete("/projects/{project_id}")
def project_delete(project_id: int) -> dict[str, ProjectJson]:
    projectDao = daos.getProjectDao()
    (dbrec, client_name) = projectDao.getById(project_id)
    
    if dbrec is None:
        raise HTTPException(status_code=400, detail=f"project with {project_id=} does not exist.")
        
    projectDao.delete(dbrec.project_id)
    projectDao.commit()
    
    return { "deleted": projectDao.toJson(dbrec, client_name)}    
    

