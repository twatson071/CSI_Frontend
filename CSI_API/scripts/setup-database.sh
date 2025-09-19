#!/bin/bash

# Database Setup Script
# Handles complete database initialization for production/demo

set -e

echo "======================================"
echo "Database Setup for CSI Application"
echo "======================================"

# Get database file from environment
DB_FILE="${DB_FILE_NAME:-${DATABASE_URL:-/app/data/demo.db}}"
DB_DIR=$(dirname "$DB_FILE")

echo "Database location: $DB_FILE"

# Create directory if needed
if [ ! -d "$DB_DIR" ]; then
    echo "Creating database directory: $DB_DIR"
    mkdir -p "$DB_DIR"
fi

# Check if database exists and has tables
if [ -f "$DB_FILE" ]; then
    TABLE_COUNT=$(echo "SELECT COUNT(*) FROM sqlite_master WHERE type='table';" | bun x sqlite3 "$DB_FILE" 2>/dev/null || echo "0")
    echo "Existing database found with $TABLE_COUNT tables"

    if [ "$TABLE_COUNT" -gt "0" ]; then
        echo "Database already initialized with tables"

        # Check if we need to run migrations
        echo "Checking for pending migrations..."
        bun x drizzle-kit migrate --config=drizzle.config.ts 2>&1 | grep -v "No migrations" || true

        # In demo mode, check if data exists
        if [ "$DEMO_MODE" = "true" ]; then
            DEVICE_COUNT=$(echo "SELECT COUNT(*) FROM devices;" | bun x sqlite3 "$DB_FILE" 2>/dev/null || echo "0")
            if [ "$DEVICE_COUNT" = "0" ]; then
                echo "Demo mode: Seeding database with demo data..."
                bun run scripts/seed-dummy-data.ts
            else
                echo "Demo data already exists ($DEVICE_COUNT devices)"
            fi
        fi

        echo "✅ Database is ready"
        exit 0
    else
        echo "Database file exists but has no tables - removing and recreating"
        rm -f "$DB_FILE" "${DB_FILE}-shm" "${DB_FILE}-wal"
    fi
fi

# Database doesn't exist or is empty - create it
echo "Creating new database..."

# Use drizzle-kit push for initial schema creation
echo "Applying database schema..."
bun x drizzle-kit push --config=drizzle.config.ts

# Verify tables were created
TABLE_COUNT=$(echo "SELECT COUNT(*) FROM sqlite_master WHERE type='table';" | bun x sqlite3 "$DB_FILE" 2>/dev/null || echo "0")
if [ "$TABLE_COUNT" = "0" ]; then
    echo "❌ Failed to create database tables"
    exit 1
fi

echo "✅ Created $TABLE_COUNT tables"

# In demo mode, seed data
if [ "$DEMO_MODE" = "true" ]; then
    echo "Seeding database with demo data..."
    bun run scripts/seed-dummy-data.ts

    # Verify data was seeded
    DEVICE_COUNT=$(echo "SELECT COUNT(*) FROM devices;" | bun x sqlite3 "$DB_FILE" 2>/dev/null || echo "0")
    SITE_COUNT=$(echo "SELECT COUNT(*) FROM sites;" | bun x sqlite3 "$DB_FILE" 2>/dev/null || echo "0")
    echo "✅ Seeded database with $DEVICE_COUNT devices and $SITE_COUNT sites"
fi

echo "✅ Database setup complete"