# Timesheet Container Specification 

## Overview
This document specifies the containerization of the Timesheet application, which consists of:
- Python FastAPI backend
- Vue.js frontend
- SQLite database

## Container Architecture

### Base Images
- **Build Stage**: `node:20-bookworm` for frontend builds and dependency installation
- **Runtime Stage**: `python:3.11-slim-bookworm` for the production environment

### Multi-stage Build
1. **Frontend Builder**: Installs Node.js dependencies and builds the Vue.js application
2. **Backend Builder**: Installs Python dependencies using uv
3. **Runtime**: Production container with only necessary components and source code used to build the container

## Configuration

### Environment Variables
- `TIMESHEET_SQLITE`: the location of the sqlite database file
- `TIMESHEET_SRC_HOME`: the location of the application source code used to build the hosting container
- `TIMESHEET_SA_URL`:  E.g "sqlite:///data/timesheet.sqlite"

### Volumes
- `/data`: Mount point for SQLite database file
- `/app/static`: Static files served by NGINX
- `/app/src`: Source code used to build the hosting container


Create a docker container to host the python fastapi, vue.js components and nginx proxy.

## Build Container

Select a suitable base image to host a stable version of python, including it's uv dependency management tool and the vue.js component.

Construct the container, to have a build stage. In the build stage compile python dependencies and the javascript/typescript dependencies. Compile the vue.js application.

Deploy the compiled application components into the hosting container.

## Hosting Container

The hosting container will host an NGINX proxy for the fastapi application and serve the vue.js application.

It is expected that the user will pass in a location for the sqlite database for the contained timesheet application to use. Otherwise the app should create a new database and use that inside the container. (A new database is especially useful for test runs.) Use configuration to place the database file in a convenient
place to be mounted as a seperate volume.

## Build and Development Tools

Create a .github/workflows/build_hosting_container.sh script to orchestrate this process. Also create .github/workflows/docker-build.yml to build the container.

Create a Makefile in the root of the timesheet project. The Makefile will have the following targets for a local build.
- `docker`: execute the build_hosting_container.sh script to build the host container (detect podman or docker tools to do this)
- `run`: use podman or docker to run the applicatin in the hosting container
- `test`: use the hosting container to run the python unit/integration tests and the typescript component tests within the container.
- `clean`: remove the build and runtime containers and other artifacts
- `test`: Build the hostinc container and run the tests within the container.
- `logs`: Display the logs of the running container
- `stop`: Stop the running container
- `status`: Display the status of the running container
- `restart`: Restart the running container
- `shell`: Open a shell into the running container
- `exec`: Execute a command in the running container

