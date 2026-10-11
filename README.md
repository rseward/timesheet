# timesheet

Any software consultancy needs to track time spent on client tasks. This project aims to
provide this capability in as simple manner as possible. The project should enable easy generation of invoices for client work.

Early in the life cycle of my company, I used the quasi open source timesheet.php project. It provided the capability I needed to track time spent on client tasks and prepare invoices for clients.

This project seeks to provide a modernized open source project for these purposes.

## Goals

A Python / vue.js re-implementation of the classic timesheet.php project used for
client timetracking.

A secondary purpose is to gain experience on common full stack python development tools and frameworks.

## Overview

Project components:

- python3.10+
- alembic (to manage the schema)
- sqlalchemy
- sqllite3 or postgres
- vue.js
- fastapi
- docker to easily host the project in a container

## Project Development Setup

### Bare Metal development

#### Do initial setup and run unit tests

```
TIME_SRC=/bluestone/src/github/timesheet/
TIME_PYVE=/bluestone/pyve/timesheet/

mkdir -p $TIME_PYVE
virtualenv $TIME_PYVE
cd $TIME_SRC
. $TIME_PYVE/bin/activate
. env  # Set the location of the sqlite3 database

cd backend
make install
make test
```

#### Start the Fastapi backend

```
cd $TIME_SRC
. env
cd backend/
./run.sh
```

#### Run the integration tests

```
cd $TIME_SRC/backend
tests/testFastapi.py
```

#### Build the Vue.js frontend

The frontend lives in `frontend/web/` and has its own Makefile. From a clean
checkout the full sequence is:

```
cd $TIME_SRC/frontend/web

make install      # npm ci — clean install from package-lock.json
make type-check   # vue-tsc --noEmit — TypeScript type checking
make test         # vitest — unit tests
make prod-build   # vue-tsc && vite build — production build to dist/
```

Or as a single target:

```
make build        # install + type-check + test + prod-build (fresh checkout)
```

If `node_modules` is already current and you just need to rebuild after pulling
the latest commit:

```
make prod-build   # skips install/test, just runs vue-tsc && vite build
```

The production build output lands in `frontend/web/dist/` — that is the
deployable SPA served by nginx or any static file server.

#### Deploy with Docker/Podman

The containerized deployment builds the frontend, bundles the FastAPI backend,
and serves everything behind nginx in a single image:

```
cd $TIME_SRC

make docker       # Build timesheet-app:latest (multi-stage: frontend + backend + nginx)
make stop         # Stop existing container if running
make run          # Start container on http://localhost:8080
make logs         # Tail container logs
make status       # Check container status
```

The Dockerfile performs the Vue.js build internally (`npx vite build`), copies
`dist/` into the nginx serve path, and runs FastAPI + nginx under supervisord.
This is the simplest path to a running deployment — one command rebuilds
everything.

#### Deploy with pre-built image (ghcr.io)

Pre-built images are published to `ghcr.io/rseward/timesheet` by GitHub Actions
on every push to `main` and on `v*` tags. To deploy with podman:

```
podman pull ghcr.io/rseward/timesheet:v0.3.3

podman run -d --name timesheet-app \
  -p 8082:80 \
  -v /home/rseward/data/timesheet:/data:Z \
  -e TIMESHEET_SQLITE=/data/timesheet.sqlite \
  -e TIMESHEET_SRC_HOME=/app/src \
  -e TIMESHEET_SA_URL=sqlite:////data/timesheet.sqlite \
  ghcr.io/rseward/timesheet:v0.3.3

# Verify
curl -s http://localhost:8082/api/health
```

**Important:** `TIMESHEET_SA_URL` must use four slashes for an absolute path
(`sqlite:////data/timesheet.sqlite`), not three. With three slashes SQLAlchemy
interprets the path as relative (`data/timesheet.sqlite`) and the container
will fail with "unable to open database file". The Dockerfile sets this
correctly as a default, but if you pass `-e TIMESHEET_SA_URL` explicitly
in your `podman run` command, make sure to use four slashes.

For a reverse proxy with TLS, point Nginx Proxy Manager (or equivalent) at
`localhost:8082`. See `docs/deploy-podman2024.md` for a full deployment
walkthrough including DNS and Nginx Proxy Manager setup.

#### Deploy bare metal (frontend only)

If you are already running the FastAPI backend on port 8080 via
`backend/run.sh`, build the frontend as shown above and serve the `dist/`
directory with nginx. A reference nginx config that serves the SPA and proxies
`/api/` to the backend is in `docker/nginx.conf`. For quick local preview
without nginx:

```
cd $TIME_SRC/frontend/web
make preview      # Builds for production then runs vite preview
```

## Project Source Layout

### backend

Backend components including fastapi

#### backend/fastapi

Fastapi specific classes

#### alembic

Alembic database definitions and migrations

#### backend/src

Pydantic Models, SQLAlchemy data model and other support classes

### frontend

Frontend components including vue.js

#### frontend/web

Vue.js UI

#### frontend/flet

python flet UI frontend. First UI implementation used to prototype the UI.

## Contributions

Bluestone welcomes contributors for this project.

Please contact rseward@bluestone-consulting.com or make PRs as you prefer.
