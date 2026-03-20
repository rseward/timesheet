#!/usr/bin/env python

import os
import sys
import logging
from enum import Enum

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware

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
import api.routers.time_entry
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

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # Vite dev server and common dev ports
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

daos = getDaoFactory()

# Debug route to check if our routes are working
@app.get("/debug")
async def debug_info():
    return {
        "message": "FastAPI is running",
        "routes": [route.path for route in app.routes]
    }

# Root route will be handled by SPA serving below

# Removed non-API routes to avoid conflicts with SPA routing
# All auth endpoints are now under /api/ prefix

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


# Include API routers
# NOTE: auth router is not included because we have explicit /api/* wrapper endpoints above
# app.include_router(api.routers.auth.router)
app.include_router(api.routers.client.router)
app.include_router(api.routers.user.router)
app.include_router(api.routers.project.router)
app.include_router(api.routers.task.router)
app.include_router(api.routers.billingevent.router)
app.include_router(api.routers.reports.router)
app.include_router(api.routers.preferences.router)
app.include_router(api.routers.time_entry.router)

# Serve Vue.js static files - use absolute paths
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(current_dir)  # Go up from fastapi/ to backend/
project_root = os.path.dirname(backend_dir)  # Go up from backend/ to project root
vue_dist_path = os.path.join(project_root, "frontend", "web", "dist")
absolute_index_file_path = os.path.join(vue_dist_path, "index.html")

logger.info(f"Vue.js dist path: {vue_dist_path}")
logger.info(f"Vue.js index file: {absolute_index_file_path}")
logger.info(f"Vue.js dist path exists: {os.path.exists(vue_dist_path)}")
logger.info(f"Index file exists: {os.path.exists(absolute_index_file_path)}")

if os.path.exists(vue_dist_path):
    logger.info("Mounting static files and SPA routes...")
    
    # Mount static assets
    assets_path = os.path.join(vue_dist_path, "assets")
    app.mount("/assets", StaticFiles(directory=assets_path), name="assets")
    logger.info(f"Mounted /assets static files from {assets_path}")
    
    # Handle favicon.ico specifically
    @app.get("/favicon.ico", response_class=FileResponse)
    async def favicon():
        favicon_path = os.path.join(vue_dist_path, "favicon.ico")
        return FileResponse(favicon_path)
    
else:
    logger.error(f"Vue.js dist directory not found: {vue_dist_path}")

# Define SPA routes AFTER all API routes and static file mounting
# These will only be registered if the Vue.js files exist
logger.info(f"About to register SPA routes. Vue dist exists: {os.path.exists(vue_dist_path)}")

@app.get("/", response_class=FileResponse, include_in_schema=False)
async def serve_spa_root():
    logger.info("Serving SPA root route")
    if os.path.exists(absolute_index_file_path):
        return FileResponse(absolute_index_file_path)
    else:
        raise HTTPException(status_code=404, detail="Vue.js application not found")

@app.get("/{path:path}", response_class=FileResponse, include_in_schema=False) 
async def serve_spa(path: str):
    logger.info(f"SPA catch-all route hit with path: {path}")
    # Prevent API routes and assets from being caught by SPA routing
    if (path.startswith("api/") or path.startswith("docs") or 
        path.startswith("openapi.json") or path.startswith("redoc") or
        path.startswith("debug")):
        logger.info(f"Rejecting API/docs path: {path}")
        raise HTTPException(status_code=404, detail="Route not found")
    # Serve the Vue.js SPA for all other routes
    logger.info(f"Serving SPA for path: {path}")
    if os.path.exists(absolute_index_file_path):
        return FileResponse(absolute_index_file_path)
    else:
        raise HTTPException(status_code=404, detail="Vue.js application not found")

logger.info("SPA routes registered")

