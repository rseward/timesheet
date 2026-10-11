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

# Run alembic migrations
# On a fresh database, upgrade head creates all tables from scratch.
# On a database copied from another instance (e.g. bare metal) the tables
# may already exist but the alembic_version table may be behind. In that case
# upgrade head fails with "table already exists". We catch that and stamp
# head instead, telling alembic the schema is already current.
echo "Running database migrations..."
cd /app/backend
if ! alembic upgrade head 2>&1; then
    echo "Alembic upgrade failed — attempting to stamp head for pre-existing schema..."
    alembic stamp head
    echo "Stamped alembic to head."
fi
cd /app

# Start supervisor which will manage nginx and fastapi
echo "Starting services..."
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf