#!/usr/bin/env python

import sys
import logging
from enum import Enum

from fastapi import FastAPI, HTTPException, Request

import api.routers.client
import api.routers.user
import api.routers.auth
import api.routers.project
import api.routers.task
import api.routers.billingevent
import api.routers.reports
""
from api.schemas.authmodels import LoginRequest

from bluestone.timesheet.data.daos import getDaoFactory

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)
stream_handler = logging.StreamHandler(sys.stdout)
log_formatter = logging.Formatter("%(asctime)s [%(processName)s: %(process)d] [%(threadName)s: %(thread)d] [%(levelname)s] %(name)s: %(message)s")
stream_handler.setFormatter(log_formatter)
logger.addHandler(stream_handler)

logger.info(f"{__name__} is starting")


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
async def logout(request: Request):
    return api.routers.auth.logout(request)

@app.get("/refresh")
async def refresh(refreshtoken: str):
    return api.routers.auth.refresh(refreshtoken)

@app.get("/userinfo")
async def userinfo():
    return api.routers.auth.userinfo()


app.include_router(api.routers.auth.router)
app.include_router(api.routers.client.router)
app.include_router(api.routers.user.router)
app.include_router(api.routers.project.router)
app.include_router(api.routers.task.router)
app.include_router(api.routers.billingevent.router)
app.include_router(api.routers.reports.router)

