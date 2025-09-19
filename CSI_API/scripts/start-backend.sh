#!/bin/sh

# Backend startup script with database health check

echo "Backend starting..."

# Wait for database to be ready
MAX_TRIES=30
TRIES=0

while [ $TRIES -lt $MAX_TRIES ]; do
    if [ -f "${DB_FILE_NAME:-/app/data/demo.db}" ]; then
        # Check if we can query the database
        TABLE_COUNT=$(echo "SELECT COUNT(*) FROM sqlite_master WHERE type='table';" | bun x sqlite3 "${DB_FILE_NAME:-/app/data/demo.db}" 2>/dev/null || echo "0")

        if [ "$TABLE_COUNT" -gt "0" ]; then
            echo "✅ Database is ready with $TABLE_COUNT tables"
            break
        fi
    fi

    TRIES=$((TRIES + 1))
    echo "Waiting for database... (attempt $TRIES/$MAX_TRIES)"
    sleep 2
done

if [ $TRIES -eq $MAX_TRIES ]; then
    echo "❌ Database not ready after $MAX_TRIES attempts"
    exit 1
fi

# Start the backend
echo "Starting backend server..."
exec bun run dist/index.js