#!/bin/bash
set -e

echo "Starting Timesheet Application..."

# Create data directory if it doesn't exist
mkdir -p /data

# Initialize database if it doesn't exist
if [ ! -f "$TIMESHEET_SQLITE" ]; then
    echo "Creating new SQLite database at $TIMESHEET_SQLITE"
    # You may want to run database initialization scripts here
    touch "$TIMESHEET_SQLITE"
fi

# Set proper permissions
chown app:app /data "$TIMESHEET_SQLITE" 2>/dev/null || true

# Start supervisor which will manage nginx and fastapi
echo "Starting services..."
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf