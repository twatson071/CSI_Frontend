#!/bin/bash

# EC2 Deployment Script
# Simple, direct deployment to AWS EC2 instance

set -e

# Configuration
EC2_HOST="${1}"
EC2_USER="${2:-ubuntu}"
KEY_PATH="${3:-~/.ssh/id_rsa}"
APP_PORT="${4:-80}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Function to print colored output
print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
    exit 1
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

print_info() {
    echo -e "${BLUE}[i]${NC} $1"
}

# Usage information
if [ -z "$EC2_HOST" ]; then
    echo "Usage: $0 <EC2_HOST> [EC2_USER] [KEY_PATH] [APP_PORT]"
    echo ""
    echo "Arguments:"
    echo "  EC2_HOST    - EC2 instance IP or hostname (required)"
    echo "  EC2_USER    - SSH user (default: ubuntu)"
    echo "  KEY_PATH    - Path to SSH key (default: ~/.ssh/id_rsa)"
    echo "  APP_PORT    - Application port (default: 80)"
    echo ""
    echo "Example:"
    echo "  $0 ec2-54-123-45-67.compute-1.amazonaws.com"
    echo "  $0 54.123.45.67 ec2-user ~/.ssh/my-key.pem 8080"
    exit 1
fi

echo "======================================"
echo "CSI EC2 Deployment"
echo "======================================"
echo "Target: ${EC2_USER}@${EC2_HOST}"
echo "Port: ${APP_PORT}"
echo ""

# Step 1: Test SSH connection
print_status "Testing SSH connection..."
ssh -o ConnectTimeout=10 -i "${KEY_PATH}" "${EC2_USER}@${EC2_HOST}" "echo 'SSH connection successful'" || print_error "Cannot connect to EC2 instance"

# Step 2: Build production Docker image locally
print_status "Building Docker image..."
docker build -f Dockerfile.production -t csi-app:latest . || print_error "Docker build failed"

# Step 3: Save Docker image
print_status "Saving Docker image..."
docker save csi-app:latest | gzip > csi-app.tar.gz || print_error "Failed to save Docker image"

# Step 4: Calculate file size for progress tracking
FILE_SIZE=$(du -h csi-app.tar.gz | cut -f1)
print_info "Image size: ${FILE_SIZE}"

# Step 5: Transfer Docker image to EC2
print_status "Transferring Docker image to EC2 (this may take a few minutes)..."
scp -i "${KEY_PATH}" csi-app.tar.gz "${EC2_USER}@${EC2_HOST}:~/" || print_error "Failed to transfer Docker image"

# Step 6: Deploy on EC2
print_status "Deploying on EC2..."

ssh -i "${KEY_PATH}" "${EC2_USER}@${EC2_HOST}" << ENDSSH
set -e

echo "Setting up Docker if not installed..."
if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker \$USER
    rm get-docker.sh
    echo "Docker installed. You may need to log out and back in for group changes to take effect."
    
    # Use sudo for docker commands since group change hasn't taken effect yet
    DOCKER_CMD="sudo docker"
else
    DOCKER_CMD="docker"
fi

echo "Stopping existing container if running..."
\$DOCKER_CMD stop csi-app 2>/dev/null || true
\$DOCKER_CMD rm csi-app 2>/dev/null || true

echo "Loading new Docker image..."
gunzip -c csi-app.tar.gz | \$DOCKER_CMD load

echo "Starting CSI application..."
\$DOCKER_CMD run -d \
  --name csi-app \
  -p ${APP_PORT}:80 \
  -v csi-data:/app/data \
  --restart unless-stopped \
  --memory="2g" \
  --cpus="2" \
  csi-app:latest

echo "Cleaning up..."
rm -f csi-app.tar.gz

echo "Verifying deployment..."
sleep 5
\$DOCKER_CMD ps | grep csi-app

echo "Checking application health..."
curl -f http://localhost:${APP_PORT}/health || echo "Health check failed - application may still be starting"

ENDSSH

# Step 7: Clean up local files
print_status "Cleaning up local files..."
rm -f csi-app.tar.gz

# Step 8: Configure EC2 Security Group reminder
print_warning "IMPORTANT: Ensure your EC2 Security Group allows:"
echo "  - Inbound TCP on port ${APP_PORT} (from your IP or 0.0.0.0/0)"
echo "  - Inbound TCP on port 22 for SSH (already configured if you connected)"

# Step 9: Setup systemd service for auto-restart
print_status "Setting up systemd service for auto-restart..."

ssh -i "${KEY_PATH}" "${EC2_USER}@${EC2_HOST}" << 'ENDSSH'
# Create systemd service
sudo tee /etc/systemd/system/csi-app.service > /dev/null << 'EOF'
[Unit]
Description=CSI Application
After=docker.service
Requires=docker.service

[Service]
Type=simple
Restart=always
RestartSec=10
ExecStart=/usr/bin/docker start -a csi-app
ExecStop=/usr/bin/docker stop csi-app

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable csi-app.service
echo "Systemd service configured for auto-restart on reboot"
ENDSSH

# Step 10: Display success message and access information
echo ""
print_status "Deployment complete!"
echo ""
echo "======================================"
echo "Access your application at:"
echo "  http://${EC2_HOST}:${APP_PORT}"
echo ""
echo "Useful commands on EC2:"
echo "  Check status:  docker ps"
echo "  View logs:     docker logs csi-app"
echo "  Restart:       docker restart csi-app"
echo "  Stop:          docker stop csi-app"
echo ""
echo "For HTTPS setup, consider using:"
echo "  - AWS Application Load Balancer with ACM certificate"
echo "  - Nginx reverse proxy with Let's Encrypt"
echo "  - CloudFront distribution"
echo "======================================"

# Optional: Open application in browser
if command -v xdg-open &> /dev/null; then
    print_info "Opening application in browser..."
    xdg-open "http://${EC2_HOST}:${APP_PORT}" 2>/dev/null &
elif command -v open &> /dev/null; then
    print_info "Opening application in browser..."
    open "http://${EC2_HOST}:${APP_PORT}" 2>/dev/null &
fi