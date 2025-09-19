#!/bin/bash

# Deploy to EC2 Script
set -e

echo "================================================"
echo "CSI Demo - Deploy to EC2"
echo "================================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration - Update these with your EC2 details
EC2_HOST="${EC2_HOST:-}"
EC2_USER="${EC2_USER:-ubuntu}"
EC2_KEY_PATH="${EC2_KEY_PATH:-}"
DOCKER_IMAGE_NAME="csi-demo"
DOCKER_IMAGE_TAG="latest"
REMOTE_PORT="80"

# Check required environment variables
if [ -z "$EC2_HOST" ]; then
    echo -e "${RED}Error: EC2_HOST environment variable is not set${NC}"
    echo "Usage: EC2_HOST=your-ec2-ip EC2_KEY_PATH=/path/to/key.pem ./deploy-to-ec2.sh"
    exit 1
fi

if [ -z "$EC2_KEY_PATH" ]; then
    echo -e "${RED}Error: EC2_KEY_PATH environment variable is not set${NC}"
    echo "Usage: EC2_HOST=your-ec2-ip EC2_KEY_PATH=/path/to/key.pem ./deploy-to-ec2.sh"
    exit 1
fi

# Step 1: Build Docker image locally
echo -e "${YELLOW}Step 1: Building Docker image locally...${NC}"
if sudo docker build -f Dockerfile.demo -t ${DOCKER_IMAGE_NAME}:${DOCKER_IMAGE_TAG} .; then
    echo -e "${GREEN}✓ Docker image built successfully!${NC}"
else
    echo -e "${RED}✗ Failed to build Docker image${NC}"
    exit 1
fi
echo ""

# Step 2: Save Docker image to tar file
echo -e "${YELLOW}Step 2: Saving Docker image to tar file...${NC}"
sudo docker save ${DOCKER_IMAGE_NAME}:${DOCKER_IMAGE_TAG} | gzip > csi-demo.tar.gz
echo -e "${GREEN}✓ Docker image saved to csi-demo.tar.gz${NC}"
echo ""

# Step 3: Upload image to EC2
echo -e "${YELLOW}Step 3: Uploading Docker image to EC2...${NC}"
echo "This may take a few minutes depending on your connection speed..."
if scp -i "$EC2_KEY_PATH" csi-demo.tar.gz ${EC2_USER}@${EC2_HOST}:~/; then
    echo -e "${GREEN}✓ Docker image uploaded successfully!${NC}"
else
    echo -e "${RED}✗ Failed to upload Docker image${NC}"
    exit 1
fi
echo ""

# Step 4: Deploy on EC2
echo -e "${YELLOW}Step 4: Deploying on EC2...${NC}"
ssh -i "$EC2_KEY_PATH" ${EC2_USER}@${EC2_HOST} << 'EOF'
    # Load the Docker image
    echo "Loading Docker image..."
    gunzip -c ~/csi-demo.tar.gz | sudo docker load

    # Stop and remove existing container if it exists
    echo "Stopping existing container (if any)..."
    sudo docker stop csi-demo 2>/dev/null || true
    sudo docker rm csi-demo 2>/dev/null || true

    # Run the new container
    echo "Starting new container..."
    sudo docker run -d \
        --name csi-demo \
        --restart unless-stopped \
        -p 80:80 \
        csi-demo:latest

    # Wait for container to be healthy
    echo "Waiting for container to start..."
    sleep 5

    # Check if container is running
    if sudo docker ps | grep -q csi-demo; then
        echo "✓ Container is running!"

        # Check health endpoint
        if curl -f http://localhost/health &>/dev/null; then
            echo "✓ Health check passed!"
        else
            echo "⚠ Health check failed, but container is running"
        fi
    else
        echo "✗ Container failed to start"
        echo "Container logs:"
        sudo docker logs csi-demo --tail 50
        exit 1
    fi

    # Clean up the uploaded tar file
    echo "Cleaning up..."
    rm -f ~/csi-demo.tar.gz
EOF

if [ $? -eq 0 ]; then
    echo ""
    echo "================================================"
    echo -e "${GREEN}Deployment successful!${NC}"
    echo "================================================"
    echo ""
    echo "Your application is now running at:"
    echo "  http://${EC2_HOST}"
    echo ""
    echo "To view logs on the EC2 instance:"
    echo "  ssh -i $EC2_KEY_PATH ${EC2_USER}@${EC2_HOST} 'sudo docker logs -f csi-demo'"
    echo ""
    echo "To access the EC2 instance:"
    echo "  ssh -i $EC2_KEY_PATH ${EC2_USER}@${EC2_HOST}"
    echo ""
else
    echo ""
    echo -e "${RED}Deployment failed!${NC}"
    exit 1
fi

# Clean up local tar file
rm -f csi-demo.tar.gz