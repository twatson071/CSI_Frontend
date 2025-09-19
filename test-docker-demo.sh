#!/bin/bash

# Test Docker Demo Build and Run Script

echo "================================================"
echo "CSI Demo - Docker Test Script"
echo "================================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Stop and remove existing container if it exists
echo -e "${YELLOW}Step 1: Cleaning up existing containers...${NC}"
sudo docker stop csi-demo 2>/dev/null && echo "Stopped existing csi-demo container"
sudo docker rm csi-demo 2>/dev/null && echo "Removed existing csi-demo container"
echo ""

# Step 2: Build the Docker image
echo -e "${YELLOW}Step 2: Building Docker image...${NC}"
echo "Command: sudo docker build -f Dockerfile.demo -t csi-demo:latest ."
echo ""
if sudo docker build -f Dockerfile.demo -t csi-demo:latest .; then
    echo -e "${GREEN}✓ Docker image built successfully!${NC}"
else
    echo -e "${RED}✗ Failed to build Docker image${NC}"
    exit 1
fi
echo ""

# Step 3: Run the container
echo -e "${YELLOW}Step 3: Starting Docker container...${NC}"
echo "Running container with:"
echo "  - Port 80 mapped to localhost:8080"
echo "  - Name: csi-demo"
echo ""
if sudo docker run -d \
    --name csi-demo \
    -p 8080:80 \
    csi-demo:latest; then
    echo -e "${GREEN}✓ Container started successfully!${NC}"
else
    echo -e "${RED}✗ Failed to start container${NC}"
    exit 1
fi
echo ""

# Step 4: Wait for services to start
echo -e "${YELLOW}Step 4: Waiting for services to start...${NC}"
echo -n "Waiting for container to be healthy"
for i in {1..30}; do
    sleep 2
    echo -n "."
    if sudo docker exec csi-demo curl -f http://localhost/health &>/dev/null; then
        echo ""
        echo -e "${GREEN}✓ Container is healthy!${NC}"
        break
    fi
    if [ $i -eq 30 ]; then
        echo ""
        echo -e "${RED}✗ Container health check timeout${NC}"
        echo "Container logs:"
        sudo docker logs csi-demo --tail 50
        exit 1
    fi
done
echo ""

# Step 5: Test the endpoints
echo -e "${YELLOW}Step 5: Testing endpoints...${NC}"
echo ""

# Test frontend health
echo -n "Testing frontend (http://localhost:8080/): "
if curl -f -s http://localhost:8080/ > /dev/null; then
    echo -e "${GREEN}✓ OK${NC}"
else
    echo -e "${RED}✗ FAILED${NC}"
fi

# Test API health
echo -n "Testing API health (http://localhost:8080/api/health): "
if curl -f -s http://localhost:8080/api/health > /dev/null; then
    echo -e "${GREEN}✓ OK${NC}"
else
    echo -e "${RED}✗ FAILED${NC}"
fi

# Test API devices endpoint
echo -n "Testing API devices (http://localhost:8080/api/devices): "
RESPONSE=$(curl -s -H "x-user-id: demo-user" http://localhost:8080/api/devices)
if echo "$RESPONSE" | grep -q "id"; then
    DEVICE_COUNT=$(echo "$RESPONSE" | grep -o '"id"' | wc -l)
    echo -e "${GREEN}✓ OK (${DEVICE_COUNT} devices)${NC}"
else
    echo -e "${RED}✗ FAILED${NC}"
fi

# Test mock data endpoints
echo -n "Testing mock PDU data (http://localhost:8080/api/mock/pdu): "
if curl -f -s http://localhost:8080/api/mock/pdu | grep -q "model"; then
    echo -e "${GREEN}✓ OK${NC}"
else
    echo -e "${RED}✗ FAILED${NC}"
fi

echo -n "Testing mock Switch data (http://localhost:8080/api/mock/switch): "
if curl -f -s http://localhost:8080/api/mock/switch | grep -q "model"; then
    echo -e "${GREEN}✓ OK${NC}"
else
    echo -e "${RED}✗ FAILED${NC}"
fi

echo ""
echo "================================================"
echo -e "${GREEN}Docker demo is running!${NC}"
echo "================================================"
echo ""
echo "Access the application at: http://localhost:8080"
echo ""
echo "To view logs:"
echo "  sudo docker logs -f csi-demo"
echo ""
echo "To stop the container:"
echo "  sudo docker stop csi-demo"
echo ""
echo "To remove the container:"
echo "  sudo docker rm csi-demo"
echo ""
echo "To access the container shell:"
echo "  sudo docker exec -it csi-demo sh"
echo ""