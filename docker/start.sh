#!/bin/bash
set -e

echo "Starting Timesheet Application..."

# Create data directory if it doesn't exist
mkdir -p /data

# Initialize database if it doesn't exist
if [ ! -f "$TIMESHEET_SQLITE" ]; then
    echo "Creating new SQLite database at $TIMESHEET_SQLITE"
    touch "$TIMESHEET_SQLITE"
fi

# Set proper permissions
chown app:app /data "$TIMESHEET_SQLITE" 2>/dev/null || true

# Run alembic migrations (idempotent — no-op if already at head)
# This ensures the schema is initialized on first boot with a fresh database
# and upgrades to the latest revision on existing databases.
echo "Running database migrations..."
cd /app/backend && alembic upgrade head
cd /app

# Start supervisor which will manage nginx and fastapi
echo "Starting services..."
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf