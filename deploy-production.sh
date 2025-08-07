#!/bin/bash

# CSI Production Deployment Script
# This script builds and deploys the CSI application in a single Docker container

set -e

echo "🚀 CSI Production Deployment Script"
echo "=================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Parse command line arguments
BUILD_ONLY=false
DETACH=true
PORT=8080

while [[ $# -gt 0 ]]; do
    case $1 in
        --build-only)
            BUILD_ONLY=true
            shift
            ;;
        --attach)
            DETACH=false
            shift
            ;;
        --port)
            PORT="$2"
            shift 2
            ;;
        --help)
            echo "Usage: $0 [options]"
            echo "Options:"
            echo "  --build-only    Only build the Docker image, don't run it"
            echo "  --attach        Run in foreground (don't detach)"
            echo "  --port PORT     Specify the host port (default: 8080)"
            echo "  --help          Show this help message"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            echo "Run '$0 --help' for usage information"
            exit 1
            ;;
    esac
done

# Determine docker compose command
if docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
else
    DOCKER_COMPOSE="docker-compose"
fi

echo "📦 Building CSI production container..."
echo "Using port: $PORT"

# Update the port in docker-compose file if different from default
if [ "$PORT" != "8080" ]; then
    echo "Configuring port $PORT..."
    # Create a temporary override file
    cat > docker-compose.override.yml << EOF
version: '3.8'
services:
  csi-app:
    ports:
      - "$PORT:80"
EOF
fi

# Build the container
$DOCKER_COMPOSE -f docker-compose.production.yml build

if [ "$BUILD_ONLY" = true ]; then
    echo "✅ Build complete!"
    echo "To run the container, execute: $0"
    exit 0
fi

# Stop any existing container
echo "🛑 Stopping existing containers..."
$DOCKER_COMPOSE -f docker-compose.production.yml down

# Start the container
echo "🚀 Starting CSI production container..."
if [ "$DETACH" = true ]; then
    $DOCKER_COMPOSE -f docker-compose.production.yml up -d
    
    echo "⏳ Waiting for services to start..."
    sleep 5
    
    # Check if container is running
    if docker ps | grep -q csi-production; then
        echo "✅ CSI application is running!"
        echo ""
        echo "🌐 Access the application at: http://localhost:$PORT"
        echo "📊 View logs: docker logs -f csi-production"
        echo "🛑 Stop the application: $DOCKER_COMPOSE -f docker-compose.production.yml down"
        echo ""
        
        # Check health
        echo "🏥 Checking application health..."
        if curl -s -o /dev/null -w "%{http_code}" http://localhost:$PORT/health | grep -q "200"; then
            echo "✅ Application is healthy!"
        else
            echo "⚠️  Application might still be starting up. Check logs if issues persist."
        fi
    else
        echo "❌ Failed to start container. Check logs with: docker logs csi-production"
        exit 1
    fi
else
    $DOCKER_COMPOSE -f docker-compose.production.yml up
fi

# Clean up override file if created
if [ -f docker-compose.override.yml ]; then
    rm docker-compose.override.yml
fi