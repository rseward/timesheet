#!/usr/bin/env python

from enum import Enum

from fastapi import FastAPI, HTTPException


import api.routers.client
import api.routers.user


from bluestone.timesheet.data.daos import getDaoFactory

app = FastAPI()
daos = getDaoFactory()

@app.get("/")
async def root():
    return {"message":"Goede Dag!"}

app.include_router(api.routers.client.router)
app.include_router(api.routers.user.router)

        
    
        
            
            
        
        
        
        
    
    