#!/bin/bash

# Simple build script for production Docker image

set -e

echo "🔨 Building CSI Production Docker Image"
echo "======================================"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Build the image
echo "📦 Building Docker image..."
docker build -f Dockerfile.production -t csi-production:latest .

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build successful!"
    echo ""
    echo "To run the container:"
    echo "  ./deploy-production.sh"
    echo ""
    echo "Or manually:"
    echo "  docker run -p 8080:80 -v csi-data:/app/data csi-production:latest"
else
    echo ""
    echo "❌ Build failed. Check the error messages above."
    exit 1
fi