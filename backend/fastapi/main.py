#!/usr/bin/env python

from enum import Enum

from fastapi import FastAPI, HTTPException

import sqlalchemy
import bluestone.timesheet.config as cfg
from bluestone.timesheet.data.models import *
from bluestone.timesheet.jsonmodels import *

from bluestone.timesheet.data.daos import getDaoFactory

app = FastAPI()
daos = getDaoFactory()


    
# FastAPI handles JSON marshalling for us. We simply use built-in python and Pydantic types
@app.get("/clients/")
def index() -> dict[str, dict[int, ClientJson]]:
        cmap = {}
        clientDao = daos.getClientDao()
        for dbclient in clientDao.getAll():
            j = clientDao.toJson(dbclient)
            cmap[ j.client_id ] = j
            
        return {"clients": cmap}
        
@app.get("/clients/{client_id}")
def client_by_id(client_id: int) -> dict[str, ClientJson] :
        clientDao = daos.getClientDao()
        dbclient = clientDao.getById(client_id)
        
        if not(dbclient):
            raise HTTPException( status_code=404, detail=f"Client with client_id={client_id} does not exist.")
        return { "client": clientDao.toJson(dbclient) }
        
@app.post("/clients/")
def client_add(js: ClientJson) -> dict[ str, ClientJson]:
        clientDao = daos.getClientDao()
        dbrec = clientDao.getById(js.client_id)
        
        if dbrec:
            raise HTTPException(status_code=400, detail=f"Client with client_id={js.client_id} already exists.")
            
        dbrec = clientDao.toModel(js)
        try:
            clientDao.save(dbrec)
            js.client_id = dbrec.client_id
            clientDao.commit()
        except:
            clientDao.rollback()
        
        return { "added": js}
        
@app.put("/clients/")
def client_update(js: ClientJson) -> dict[ str, ClientJson]:
    clientDao = daos.getClientDao()
    dbrec = clientDao.getById(js.client_id)
        
    dbrec = clientDao.update(dbrec, js)
    clientDao.commit()
        
    return { "updated": clientDao.toJson(dbrec) }
        
@app.delete("/clients/{client_id}")
def client_delete(client_id: int) -> dict[str, ClientJson]:
    clientDao = daos.getClientDao()
    dbrec = clientDao.getById(client_id)
    
    if dbrec == None:
        raise HTTPException(status_code=400, detail=f"Client with {client_id=} does not exist.")
        
    clientDao.delete(dbrec.client_id)
    clientDao.commit()
    
    return { "deleted": clientDao.toJson(dbrec)}
    
    

        
    
        
            
            
        
        
        
        
    
    