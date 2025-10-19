#!/usr/bin/env python

import os
import sys
import logging
from enum import Enum

from fastapi import FastAPI, HTTPException, Request

# Host the web frontend static files
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

import api.routers.client
import api.routers.user
import api.routers.auth
import api.routers.project
import api.routers.task
import api.routers.billingevent
import api.routers.reports
import api.routers.preferences
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

@app.get("/api/health")
async def health():
    return {"status": "healthy"}

@app.get("/api/login")
async def api_login(username: str, password: str):
    creds=LoginRequest(username=username, password=password)
    return api.routers.auth.login(creds=creds)

@app.get("/api/logout")
async def api_logout(request: Request):
    return api.routers.auth.logout(request)

@app.get("/api/refresh")
async def api_refresh(refreshtoken: str):
    return api.routers.auth.refresh(refreshtoken)

@app.get("/api/userinfo")
async def api_userinfo(request: Request):
    # Extract the Authorization header and pass it to the auth router
    from fastapi import Depends
    from bluestone.timesheet.auth.auth_bearer import JWTBearer
    
    # Extract token from Authorization header
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        raise HTTPException(status_code=403, detail="Missing or invalid authorization header")
    
    token = auth_header.split(' ')[1]
    
    # Validate token using JWTBearer logic
    from bluestone.timesheet.auth.auth_bearer import decodeJWT
    payload = decodeJWT(token)
    if not payload:
        raise HTTPException(status_code=403, detail="Invalid token or expired token")
    
    return api.routers.auth.userinfo(dependencies=token)


app.include_router(api.routers.auth.router)
app.include_router(api.routers.client.router)
app.include_router(api.routers.user.router)
app.include_router(api.routers.project.router)
app.include_router(api.routers.task.router)
app.include_router(api.routers.billingevent.router)
app.include_router(api.routers.reports.router)
app.include_router(api.routers.preferences.router)

# Serve Vue.js static files
if os.path.exists("../frontend/web/dist"):
    app.mount("/assets", StaticFiles(directory="../frontend/web/dist/assets"), name="assets")
    
    @app.get("/", response_class=FileResponse)
    @app.get("/{path:path}")
    async def serve_spa(path: str = ""):
        # Prevent API routes from being caught by SPA routing
        if path.startswith("api/"):
            raise HTTPException(status_code=404, detail="API route not found")
        return FileResponse("../../frontend/web/dist/index.html")

