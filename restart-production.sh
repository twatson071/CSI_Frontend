#!/bin/bash

# Quick restart script for production container

echo "🔄 Restarting CSI Production Container"
echo "====================================="

# Stop the container
echo "🛑 Stopping existing container..."
docker-compose -f docker-compose.production.yml down

# Rebuild and start
echo "🔨 Rebuilding and starting..."
./deploy-production.sh

echo "✅ Restart complete!"