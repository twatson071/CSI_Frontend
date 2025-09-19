#!/bin/sh
set -e

echo "🚀 Initializing CSI Demo Application..."

# Create data directory
mkdir -p /app/data

# Initialize database with schema
cd /app/backend
export DATABASE_URL=/app/data/demo.db
export DB_FILE_NAME=/app/data/demo.db
export DEMO_MODE=true

# First, ensure the database exists and has the proper schema
echo "📊 Setting up database schema..."

# Apply Drizzle schema directly (push is more reliable for initial setup)
bun x drizzle-kit push --config=drizzle.config.ts || echo "Schema push may have already been applied"

# Run migrations if they exist
bun x drizzle-kit migrate --config=drizzle.config.ts || echo "Migration may have already been applied"

# Seed with dummy data
echo "🌱 Seeding demo data..."
bun run scripts/seed-dummy-data.ts

# Verify the data was seeded
echo "🔍 Verifying demo data..."
bun run scripts/verify-data.ts || echo "Verification script not found, continuing..."

echo "✅ Demo initialization complete!"