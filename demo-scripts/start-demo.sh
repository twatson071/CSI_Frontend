#!/bin/sh

echo "Starting CSI Demo Application..."

# Create necessary directories
mkdir -p /app/data /var/log/supervisor

# Set environment for database
export DATABASE_URL=/app/data/demo.db
export DB_FILE_NAME=/app/data/demo.db
export DEMO_MODE=true

cd /app/backend

# Check if database exists and has tables
if [ -f /app/data/demo.db ]; then
  TABLE_COUNT=$(echo "SELECT COUNT(*) FROM sqlite_master WHERE type='table';" | bun x sqlite3 /app/data/demo.db 2>/dev/null || echo "0")
  echo "Database exists with $TABLE_COUNT tables"
else
  TABLE_COUNT="0"
  echo "Database does not exist"
fi

# If no tables, run migrations
if [ "$TABLE_COUNT" = "0" ] || [ "$TABLE_COUNT" -lt "10" ]; then
  echo "Initializing database with migrations..."
  bun run scripts/run-migrations.ts || {
    echo "Migration script failed, using fallback..."
    # Fallback to drizzle-kit if migrations fail
    bun x drizzle-kit push --config=drizzle.config.ts 2>&1 || true
  }
fi

# Seed database if in demo mode and no data exists
if [ "$DEMO_MODE" = "true" ]; then
  DEVICE_COUNT=$(echo "SELECT COUNT(*) FROM devices;" | bun x sqlite3 /app/data/demo.db 2>/dev/null || echo "0")
  if [ "$DEVICE_COUNT" = "0" ]; then
    echo "Seeding demo data..."
    bun run scripts/seed-dummy-data.ts || echo "Seeding completed with some warnings"
  else
    echo "Demo data already exists ($DEVICE_COUNT devices)"
  fi
fi

echo "Starting services with supervisor..."
# Start supervisor
exec /usr/bin/supervisord -n -c /etc/supervisord.conf