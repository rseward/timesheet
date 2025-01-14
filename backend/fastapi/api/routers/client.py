from fastapi import FastAPI, APIRouter, Depends, HTTPException

import pprint
import sqlalchemy
import bluestone.timesheet.config as cfg
from bluestone.timesheet.jsonmodels import ClientJson

from bluestone.timesheet.data.daos import getDaoFactory
from bluestone.timesheet.auth.auth_bearer import JWTBearer, JWT_SECRET_KEY_ALGORITHMS

daos = getDaoFactory()

router = APIRouter(
    prefix="/api/clients",
    tags=["clients"],
    responses={404: {"description": "Not found"}},
)

@router.get(
    "/",
    response_model=dict[str, dict[int, ClientJson]],
    dependencies=[Depends(JWTBearer())],    
)

# FastAPI handles JSON marshalling for us. We simply use built-in python and Pydantic types
def index(active: bool = True) -> dict[str, dict[int, ClientJson]]:
        cmap = {}
        clientDao = daos.getClientDao()
        for dbclient in clientDao.getAll(include_inactive=not(active)):
            j = clientDao.toJson(dbclient)
            cmap[ j.client_id ] = j
            
        res = {"clients": cmap}
        pprint.pprint(res)
        return res

@router.get(
    "/{client_id}",
    response_model=dict[str, ClientJson],
    dependencies=[Depends(JWTBearer())],    
)
# @app.get("/clients/{client_id}")
def client_by_id(client_id: int) -> dict[str, ClientJson] :
        clientDao = daos.getClientDao()
        dbclient = clientDao.getById(client_id)
        
        if not(dbclient):
            raise HTTPException( status_code=404, detail=f"Client with client_id={client_id} does not exist.")
        return { "client": clientDao.toJson(dbclient) }

"""
{
  "client_id": 0,
  "organisation": "BraveSoft Inc.",
  "description": "Ann Arbor Software Consultancy",
  "address1": "301 Liberty St.",
  "address2": "",
  "city": "Ann Arbor",
  "state": "MI",
  "country": "USA",
  "postal_code": "48104",
  "contact_first_name": "Tom",
  "contact_last_name": "Wood",
  "username": "twood",
  "contact_email": "twood@bravesoft.com",
  "phone_number": "877.734.2780",
  "fax_number": "",
  "gsm_number": "",
  "http_url": "https://bravesoft.com"
}
"""

@router.post(
    "/",
    response_model=dict[str, ClientJson],
    dependencies=[Depends(JWTBearer())],    
)
#@app.post("/clients/")
def client_add(js: ClientJson) -> dict[ str, ClientJson]:
    clientDao = daos.getClientDao()
    if js.client_id == 0:
        js.client_id=None
    
    if js.client_id: 
        dbrec = clientDao.getById(js.client_id)
        if dbrec:
            raise HTTPException(status_code=400, detail=f"Client with client_id={js.client_id} already exists.")
        
    dbrec = clientDao.toModel(js)
    try:
        clientDao.save(dbrec)
        clientDao.flush()
        clientDao.refresh(dbrec)
        js.client_id = dbrec.client_id
        clientDao.commit()
        return { "added": js}
    except:
        clientDao.rollback()
        raise
        #return { "failed": "More detail here?" }
    
    

@router.put(
    "/",
    response_model=dict[str, ClientJson],
    dependencies=[Depends(JWTBearer())],    
)        
#@app.put("/clients/")
def client_update(js: ClientJson) -> dict[ str, ClientJson]:
    clientDao = daos.getClientDao()
    dbrec = clientDao.getById(js.client_id)
    
    try:    
        dbrec = clientDao.update(dbrec, js)
        clientDao.commit()
    except:
        clientDao.rollback()
        
    return { "updated": clientDao.toJson(dbrec) }

#@app.delete("/clients/{client_id}")
@router.delete(
    "/{client_id}",
    response_model=dict[str, ClientJson],
    dependencies=[Depends(JWTBearer())],    
)        
def client_delete(client_id: int) -> dict[str, ClientJson]:
    clientDao = daos.getClientDao()
    dbrec = clientDao.getById(client_id)
    
    if dbrec is None:
        raise HTTPException(status_code=400, detail=f"Client with {client_id=} does not exist.")
        
    clientDao.delete(dbrec.client_id)
    clientDao.commit()
    
    return { "deleted": clientDao.toJson(dbrec)}    
    

