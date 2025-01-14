from fastapi import FastAPI, APIRouter, Depends, HTTPException

import pprint
import sqlalchemy
import bluestone.timesheet.config as cfg
from bluestone.timesheet.data.models import *
from bluestone.timesheet.jsonmodels import *
from bluestone.timesheet.auth.auth_bearer import JWTBearer, JWT_SECRET_KEY_ALGORITHMS

from bluestone.timesheet.data.daos import getDaoFactory
from api.depends.auth import validate_is_authenticated

daos = getDaoFactory()

router = APIRouter(
    prefix="/api/users",
    tags=["users"],
    responses={404: {"description": "Not found"}},
)

@router.get(
    "/",
    response_model=dict[str, dict[int, UserJson]],
    dependencies=[Depends(JWTBearer())],    
)

# FastAPI handles JSON marshalling for us. We simply use built-in python and Pydantic types
def index(active: bool = True) -> dict[str, dict[int, UserJson]]:
        cmap = {}
        userDao = daos.getUserDao()
        for dbuser in userDao.getAll(include_inactive=not(active)):
            j = userDao.toJson(dbuser)
            cmap[ j.user_id ] = j
            
        res = {"users": cmap}
        pprint.pprint(res)
        return res

@router.get(
    "/{user_id}",
    response_model=dict[str, UserJson],
    dependencies=[Depends(JWTBearer())],    
)
# @app.get("/users/{user_id}")
def user_by_id(user_id: int) -> dict[str, UserJson] :
        userDao = daos.getUserDao()
        dbuser = userDao.getById(user_id)
        
        if not(dbuser):
            raise HTTPException( status_code=404, detail=f"User with user_id={user_id} does not exist.")
        return { "user": userDao.toJson(dbuser) }

@router.post(
    "/",
    response_model=dict[str, UserJson],
    dependencies=[Depends(JWTBearer())],    
)
#@app.post("/users/")
def user_add(js: UserJson) -> dict[ str, UserJson]:
        userDao = daos.getUserDao()
        dbrec = userDao.getById(js.user_id)
        
        if dbrec:
            raise HTTPException(status_code=400, detail=f"User with user_id={js.user_id} already exists.")
            
        dbrec = userDao.toModel(js)
        try:
            userDao.save(dbrec)
            js.user_id = dbrec.user_id
            userDao.commit()
        except:
            userDao.rollback()
        
        return { "added": js}

@router.put(
    "/",
    response_model=dict[str, UserJson],
    dependencies=[Depends(JWTBearer())],    
)        
#@app.put("/users/")
def client_update(js: UserJson) -> dict[ str, UserJson]:
    userDao = daos.getUserDao()
    dbrec = userDao.getById(js.user_id)
        
    dbrec = userDao.update(dbrec, js)
    userDao.commit()
        
    return { "updated": userDao.toJson(dbrec) }

@router.delete(
    "/{uid}",
    response_model=dict[str, UserJson],
    dependencies=[Depends(JWTBearer())],    
)        
#@app.delete("/userss/{user_id}")
def user_delete(user_id: int) -> dict[str, UserJson]:
    userDao = daos.getClientDao()
    dbrec = userDao.getById(user_id)
    
    if dbrec == None:
        raise HTTPException(status_code=400, detail=f"User with {user_id=} does not exist.")
        
    userDao.delete(dbrec.user_id)
    userDao.commit()
    
    return { "deleted": userDao.toJson(dbrec)}    
    

