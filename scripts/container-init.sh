#!/bin/bash
# Container initialization script for timesheet application
# This script initializes the database and sets up the environment

set -e

echo "Initializing Timesheet Application Container..."

# Environment variables with defaults
TIMESHEET_SQLITE=${TIMESHEET_SQLITE:-/data/timesheet.sqlite}
TIMESHEET_SRC_HOME=${TIMESHEET_SRC_HOME:-/app/src}
TIMESHEET_SA_URL=${TIMESHEET_SA_URL:-sqlite:///data/timesheet.sqlite}

echo "Configuration:"
echo "  Database: $TIMESHEET_SQLITE"
echo "  Source Home: $TIMESHEET_SRC_HOME"
echo "  SQLAlchemy URL: $TIMESHEET_SA_URL"

# Create data directory
mkdir -p "$(dirname "$TIMESHEET_SQLITE")"

# Initialize database if it doesn't exist
if [ ! -f "$TIMESHEET_SQLITE" ]; then
    echo "Database does not exist, creating new database..."
    
    # Navigate to backend directory
    cd /app/backend
    
    # Run database initialization (if script exists)
    if [ -f "init_db.py" ]; then
        echo "Running database initialization script..."
        python init_db.py
    else
        echo "No init_db.py found, creating empty database file..."
        touch "$TIMESHEET_SQLITE"
    fi
else
    echo "Database already exists at $TIMESHEET_SQLITE"
fi

# Set proper permissions
chown -R app:app "$(dirname "$TIMESHEET_SQLITE")" 2>/dev/null || true

# Verify database accessibility
if [ -r "$TIMESHEET_SQLITE" ]; then
    echo "✅ Database is readable"
else
    echo "❌ Warning: Database is not readable"
fi

if [ -w "$TIMESHEET_SQLITE" ]; then
    echo "✅ Database is writable"
else
    echo "❌ Warning: Database is not writable"
fi

# Verify frontend build
if [ -d "/app/frontend/web/dist" ] && [ -f "/app/frontend/web/dist/index.html" ]; then
    echo "✅ Frontend build found"
else
    echo "❌ Warning: Frontend build not found or incomplete"
fi

# Verify backend dependencies
cd /app/backend
if python -c "import fastapi, uvicorn" 2>/dev/null; then
    echo "✅ Backend dependencies available"
else
    echo "❌ Warning: Backend dependencies missing"
fi

echo "Container initialization complete!"
echo ""
echo "To access the application:"
echo "  - Web UI: http://localhost:8080"
echo "  - API Health: http://localhost:8080/api/health"
echo "  - API Docs: http://localhost:8080/docs"
echo ""
echo "To monitor logs:"
echo "  - All logs: docker logs -f timesheet-app"
echo "  - Supervisor logs: docker exec timesheet-app tail -f /var/log/supervisor/supervisord.log"
echo "  - FastAPI logs: docker exec timesheet-app tail -f /var/log/supervisor/fastapi.log"
echo "  - Nginx logs: docker exec timesheet-app tail -f /var/log/supervisor/nginx.log"