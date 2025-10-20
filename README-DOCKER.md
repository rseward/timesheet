# Timesheet Application - Docker Container Setup

This document provides instructions for building and running the Timesheet application using Docker containers.

## Overview

The Timesheet application is packaged as a multi-stage Docker container that includes:
- Python FastAPI backend
- Vue.js frontend (built and served as static files)
- NGINX proxy for routing and static file serving
- SQLite database support with volume mounting

## Quick Start

### Prerequisites
- Docker or Podman installed
- Make (optional, for using Makefile targets)

### Build and Run

```bash
# Build the container
make docker

# Run the application
make run

# Access the application
open http://localhost:8080
```

## Manual Docker Commands

### Build Container
```bash
# Using the build script
./.github/workflows/build_hosting_container.sh

# Or directly with Docker
docker build -t timesheet-app:latest .
```

### Run Container
```bash
# Create data directory
mkdir -p ./data

# Run the container
docker run -d \
  --name timesheet-app \
  -p 8080:80 \
  -v $(pwd)/data:/data \
  -e TIMESHEET_SQLITE=/data/timesheet.sqlite \
  -e TIMESHEET_SRC_HOME=/app/src \
  -e TIMESHEET_SA_URL=sqlite:///data/timesheet.sqlite \
  timesheet-app:latest
```

## Using Docker Compose

### Production Mode
```bash
# Start the application
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the application
docker-compose down
```

### Development Mode
```bash
# Start with development profile
docker-compose --profile dev up -d timesheet-dev

# This provides:
# - Live reload for backend changes
# - Hot module replacement for frontend
# - Separate database for development
```

## Makefile Targets

The included Makefile provides convenient targets for container management:

| Target | Description |
|--------|-------------|
| `make docker` | Build the hosting container |
| `make run` | Run the application container |
| `make test` | Build and run tests in container |
| `make clean` | Remove containers and images |
| `make logs` | Display container logs |
| `make stop` | Stop the running container |
| `make status` | Show container status |
| `make restart` | Restart the container |
| `make shell` | Open shell in container |
| `make exec COMMAND="cmd"` | Execute command in container |

### Database Management
| Target | Description |
|--------|-------------|
| `make db-backup` | Backup the database |
| `make db-restore BACKUP_FILE=file` | Restore from backup |

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `TIMESHEET_SQLITE` | `/data/timesheet.sqlite` | SQLite database file path |
| `TIMESHEET_SRC_HOME` | `/app/src` | Source code location |
| `TIMESHEET_SA_URL` | `sqlite:///data/timesheet.sqlite` | SQLAlchemy database URL |

## Volume Mounts

| Host Path | Container Path | Purpose |
|-----------|----------------|---------|
| `./data` | `/data` | SQLite database storage |
| `./logs` | `/var/log/supervisor` | Application logs (optional) |

## Container Architecture

### Multi-stage Build Process

1. **Frontend Builder** (`node:20-bookworm`)
   - Installs Node.js dependencies
   - Builds Vue.js application
   - Outputs to `/app/frontend/dist`

2. **Backend Builder** (`python:3.11-slim-bookworm`)
   - Installs Python dependencies using `uv`
   - Prepares FastAPI application

3. **Runtime** (`python:3.11-slim-bookworm`)
   - Combines built frontend and backend
   - Installs NGINX and Supervisor
   - Configures routing and process management

### Process Management

The container uses Supervisor to manage multiple processes:
- **NGINX**: Serves static files and proxies API requests
- **FastAPI**: Handles backend API requests

### Networking

- **Port 80**: NGINX entry point (mapped to host port 8080)
- **Internal Port 8080**: FastAPI backend (not exposed)

## Development Workflow

### Local Development
For active development, use the development setup instead of containers:
```bash
# Terminal 1: Backend
cd backend && uvicorn main:app --reload --port 8080

# Terminal 2: Frontend  
cd frontend/web && npm run dev
```

### Container Development
For testing containerized deployment:
```bash
# Build and test
make docker
make run
make logs  # Monitor for issues

# Cleanup when done
make stop
make clean
```

## Troubleshooting

### Container Won't Start
```bash
# Check container logs
make logs

# Check container status
make status

# Verify build completed successfully
docker images | grep timesheet-app
```

### Database Issues
```bash
# Check database file permissions
make exec COMMAND="ls -la /data/"

# Verify database connectivity
make exec COMMAND="python -c \"import sqlite3; print('DB OK')\" "
```

### Network Issues
```bash
# Test internal connectivity
make exec COMMAND="curl -f http://localhost/api/health"

# Check NGINX configuration
make exec COMMAND="nginx -t"
```

### Port Conflicts
If port 8080 is in use, modify the port mapping:
```bash
# Use different port
docker run -p 8081:80 ... timesheet-app:latest
```

## Production Deployment

### Security Considerations
- Use non-root user (configured in container)
- Mount database directory with appropriate permissions
- Consider using secrets management for sensitive data
- Regular security updates for base images

### Monitoring
- Health check endpoint: `/api/health`
- NGINX health check: `/nginx-health`
- Container health check configured with 30s interval

### Scaling
- Container is designed for single-instance deployment
- SQLite database limits horizontal scaling
- Consider PostgreSQL for multi-instance deployments

## CI/CD Integration

### GitHub Actions
The included `.github/workflows/docker-build.yml` provides:
- Automated builds on push/PR
- Multi-architecture support (amd64, arm64)
- Container registry publishing
- Vulnerability scanning with Trivy

### Custom CI/CD
Use the build script in your CI/CD pipeline:
```bash
./.github/workflows/build_hosting_container.sh --name myapp --tag $BUILD_NUMBER
```

## File Structure

```
timesheet/
├── Dockerfile                          # Multi-stage container definition
├── docker-compose.yml                  # Compose configuration
├── .dockerignore                       # Docker ignore rules
├── Makefile                            # Container management targets
├── docker/
│   ├── nginx.conf                      # NGINX configuration
│   ├── supervisord.conf                # Process management
│   └── start.sh                        # Container startup script
├── .github/workflows/
│   ├── build_hosting_container.sh      # Build orchestration script
│   └── docker-build.yml                # GitHub Actions workflow
└── scripts/
    └── container-init.sh               # Initialization utilities
```

## Support

For issues with containerization:
1. Check this documentation
2. Review container logs: `make logs`
3. Verify build process: `make clean && make docker`
4. Test with fresh database: remove `./data/timesheet.sqlite` and restart