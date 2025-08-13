#!/bin/sh
set -e

echo "🚀 Initializing CSI Demo Application..."

# Create data directory
mkdir -p /app/data

# Initialize database with schema
cd /app/backend
export DATABASE_URL=/app/data/demo.db
export DB_FILE_NAME=/app/data/demo.db

# Run migrations
echo "📊 Setting up database schema..."
bun x drizzle-kit migrate || echo "Migration may have already been applied"

# Seed with dummy data
echo "🌱 Seeding demo data..."
bun run scripts/seed-dummy-data.ts

echo "✅ Demo initialization complete!"