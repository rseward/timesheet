# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is a Python/Django-based timesheet application for client timetracking and invoice generation. It's a full-stack Python implementation using FastAPI backend and Flet (Python GUI framework) frontend, with SQLAlchemy/Alembic for database management.

## Development Setup Commands

### Initial Environment Setup
```bash
# Set up project paths and virtual environment
TIME_SRC=/bluestone/src/github/timesheet/
TIME_PYVE=/bluestone/pyve/timesheet/

mkdir -p $TIME_PYVE
virtualenv $TIME_PYVE
cd $TIME_SRC
. $TIME_PYVE/bin/activate
. env  # Set the location of the sqlite3 database

# Install dependencies and run tests
cd backend
make install
make test
```

### Development Commands

#### Backend Development
```bash
# Install/reinstall backend package
cd backend/
make install

# Alternative install using uv (preferred)
make install  # Uses uv pip install --reinstall .

# Run all unit tests
make test

# Run integration tests
make integration_tests
# OR directly:
tests/testFastApi.py

# Start FastAPI backend server
make run
# OR directly:
./run.sh
# This runs: uvicorn main:app --port 8080 --reload

# Database operations
make migratedb           # Check database status
make query              # Open litecli for SQLite queries
scripts/alembic-upgrade.sh  # Run database migrations
```

#### Code Quality
```bash
cd backend/
make lint   # Runs ruff check and ruff format in src/
```

#### Frontend Development
```bash
cd frontend/flet/
# Install frontend dependencies
pip install -r requirements.txt

# Run Flet application
python main.py
```

### Running Individual Tests
Individual test files can be run directly as Python scripts:
```bash
cd backend/
tests/testModelEnums.py
tests/testModels.py
tests/testJsonModels.py
tests/testDaos.py
tests/testBillingEventDao.py
tests/testFastApiAuth.py
tests/testFastApiBillingEvent.py
tests/testFastApiClient.py
tests/testFastApiProject.py
tests/testFastApiTask.py

# Test user preferences functionality
python test_preferences.py

# Test hours calculation logic
python test_hours_calculation.py

# Test view initialization order fix
python test_hours_view_init.py

# Test user preferences integration in hours view
python test_hours_preferences.py
```

## Architecture Overview

### Backend Architecture
The backend follows a layered architecture with clear separation between API, data access, and models:

**Core Layers:**
- **FastAPI Layer** (`backend/fastapi/`): REST API endpoints and routing
- **Data Access Layer** (`backend/src/bluestone/timesheet/data/`): DAOs (Data Access Objects) for database operations
- **Model Layer**: Two separate model systems for different purposes:
  - **SQLAlchemy Models** (`data/models.py`): Database schema definitions
  - **Pydantic Models** (`jsonmodels.py`): JSON validation and API serialization

**Key Components:**
- **Authentication** (`auth/`): JWT-based authentication with bearer tokens
- **Database Migrations** (`alembic/`): Schema versioning and migrations
- **API Routers**: Modular endpoint organization by entity (client, user, project, task, billingevent, reports, preferences)

### Data Model Entities
Core business entities with their relationships:
- **User/Timekeeper**: Authentication and user management
- **Client**: Organizations that hire for projects
- **Project**: Work initiatives tied to clients with status tracking
- **Task**: Granular work items within projects
- **BillingEvent**: Time tracking entries linking timekeepers, projects, and tasks
- **UserPreference**: Key-value pairs for storing user-specific preferences (e.g., default work hours)

### Frontend Architecture
- **Flet Framework**: Python-based GUI using Flutter widgets
- **Router Pattern** (`views/FletRouter.py`): Navigation management
- **Service Layer** (`service/`): API communication and business logic
- **View Layer** (`views/`): UI components for different screens (login, clients, projects, tasks, hours, reports)
- **User Controls** (`user_controls/`): Reusable UI components

### Database Management
- **SQLAlchemy**: ORM for database operations
- **Alembic**: Database migration management
- **SQLite/PostgreSQL**: Configurable database backends
- **Environment Configuration**: Database path set via `env` file

## Development Patterns

### Model Architecture Pattern
The project uses a dual-model approach:
1. **SQLAlchemy Models**: Focus on database relationships, constraints, and ORM functionality
2. **Pydantic Models**: Handle JSON validation, API serialization, and input constraints

This separation allows each model system to optimize for its primary purpose without compromise.

### API Structure
FastAPI routers are organized by business entity, each providing standard CRUD operations:
- GET endpoints for listing and individual entity retrieval
- POST endpoints for entity creation
- Authentication integration across all protected endpoints

### Testing Strategy
- **Unit Tests**: Test individual DAOs, models, and utilities
- **Integration Tests**: Test FastAPI endpoints with actual HTTP requests
- **Test Base URL**: `http://127.0.0.1:8000/api` (configurable in test files)

## Important Files and Directories

### Configuration Files
- `backend/requirements.txt`: Python dependencies
- `backend/alembic.ini`: Database migration configuration
- `backend/setup.py`: Package installation configuration
- `env`: Environment variables (database path, etc.)

### Key Source Files
- `backend/fastapi/main.py`: FastAPI application entry point
- `backend/src/bluestone/timesheet/data/models.py`: SQLAlchemy database models
- `backend/src/bluestone/timesheet/jsonmodels.py`: Pydantic API models
- `backend/src/bluestone/timesheet/data/daos.py`: Database access object factory
- `frontend/flet/main.py`: Flet application entry point

### Development Scripts
- `backend/run.sh`: Start FastAPI development server
- `backend/scripts/alembic-upgrade.sh`: Run database migrations
- `backend/Makefile`: Development task automation

## Environment Requirements
- Python 3.10+
- Virtual environment management
- SQLite3 or PostgreSQL
- UV package manager (preferred) or pip