#!/usr/bin/env python

from enum import Enum

from fastapi import FastAPI, HTTPException


import api.routers.client
import api.routers.user
import api.routers.auth

from api.schemas.authmodels import LoginRequest


from bluestone.timesheet.data.daos import getDaoFactory

app = FastAPI()
daos = getDaoFactory()

@app.get("/")
async def root():
    return {"message":"Goede Dag!"}

@app.get("/login")
async def login(username: str, password: str):
    creds=LoginRequest(username=username, password=password)
    return api.routers.auth.login(creds=creds)
    
@app.get("/logout")
async def logout():
    return api.routers.auth.logout()


app.include_router(api.routers.auth.router)
app.include_router(api.routers.client.router)
app.include_router(api.routers.user.router)

        
    
        
            
            
        
        
        
        
    
    