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
