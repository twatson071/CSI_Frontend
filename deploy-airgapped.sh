#!/bin/bash

# Airgapped Deployment Script
# This script builds and packages the application for deployment in airgapped environments
# The output is a single Docker image that can be transferred via USB/offline media

set -e

echo "======================================"
echo "CSI Airgapped Deployment Builder"
echo "======================================"

# Configuration
IMAGE_NAME="csi-airgapped"
IMAGE_TAG="${1:-latest}"
OUTPUT_DIR="./airgapped-deployment"
ARCHIVE_NAME="csi-airgapped-${IMAGE_TAG}-$(date +%Y%m%d-%H%M%S).tar"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

# Clean up function
cleanup() {
    print_status "Cleaning up temporary files..."
    rm -rf "${OUTPUT_DIR}/temp"
}

trap cleanup EXIT

# Step 1: Create output directory
print_status "Creating output directory..."
mkdir -p "${OUTPUT_DIR}"

# Step 2: Build the production Docker image
print_status "Building Docker image..."
# Use the airgapped nginx config if it exists, otherwise use production
if [ -f "nginx.airgapped.conf" ]; then
    print_status "Using airgapped nginx configuration..."
    cp nginx.airgapped.conf nginx.production.conf.bak
    cp nginx.airgapped.conf nginx.production.conf
fi

docker build -f Dockerfile.production -t ${IMAGE_NAME}:${IMAGE_TAG} .

# Restore original nginx config if we backed it up
if [ -f "nginx.production.conf.bak" ]; then
    mv nginx.production.conf.bak nginx.production.conf
fi

if [ $? -ne 0 ]; then
    print_error "Docker build failed"
    exit 1
fi

# Step 3: Save Docker image to tarball
print_status "Saving Docker image to tarball..."
docker save ${IMAGE_NAME}:${IMAGE_TAG} > "${OUTPUT_DIR}/${ARCHIVE_NAME}"

if [ $? -ne 0 ]; then
    print_error "Failed to save Docker image"
    exit 1
fi

# Step 4: Create deployment package with instructions
print_status "Creating deployment package..."

cat > "${OUTPUT_DIR}/README.md" << 'EOF'
# CSI Airgapped Deployment Instructions

## Contents
- Docker image tarball containing the complete CSI application
- This README with deployment instructions

## Requirements on Target System
- Docker or Podman installed
- At least 2GB free disk space
- Port 80 available (or configure alternative port)

## Deployment Steps

1. **Transfer the package to the target system**
   - Copy this entire folder to the airgapped system via USB or approved media

2. **Load the Docker image**
   ```bash
   docker load < csi-airgapped-*.tar
   ```

3. **Run the application**
   ```bash
   # Basic run (port 80)
   docker run -d \
     --name csi-app \
     -p 80:80 \
     -v csi-data:/app/data \
     --restart unless-stopped \
     csi-airgapped:latest

   # Custom port (e.g., 8080)
   docker run -d \
     --name csi-app \
     -p 8080:80 \
     -v csi-data:/app/data \
     --restart unless-stopped \
     csi-airgapped:latest
   ```

4. **Access the application**
   - Open browser to: http://localhost (or http://localhost:8080 if using custom port)
   - Default credentials are configured in the application

## Data Persistence
- Application data is stored in the `csi-data` Docker volume
- To backup: `docker run --rm -v csi-data:/data -v $(pwd):/backup alpine tar czf /backup/csi-backup.tar.gz /data`
- To restore: `docker run --rm -v csi-data:/data -v $(pwd):/backup alpine tar xzf /backup/csi-backup.tar.gz -C /`

## Troubleshooting

### Check application status
```bash
docker ps
docker logs csi-app
```

### Restart application
```bash
docker restart csi-app
```

### Stop and remove application
```bash
docker stop csi-app
docker rm csi-app
```

## Security Notes
- The application runs entirely offline
- No external network connectivity required
- All data remains on the local system
- Ensure proper access controls on the host system

EOF

# Step 5: Create deployment script for target system
cat > "${OUTPUT_DIR}/deploy.sh" << 'EOF'
#!/bin/bash

# Quick deployment script for airgapped environment

set -e

echo "CSI Airgapped Deployment"
echo "========================"

# Find the tar file
TAR_FILE=$(ls csi-airgapped-*.tar 2>/dev/null | head -n1)

if [ -z "$TAR_FILE" ]; then
    echo "Error: No Docker image tar file found"
    exit 1
fi

echo "Loading Docker image from $TAR_FILE..."
docker load < "$TAR_FILE"

echo "Starting CSI application..."
docker run -d \
  --name csi-app \
  -p ${CSI_PORT:-80}:80 \
  -v csi-data:/app/data \
  --restart unless-stopped \
  csi-airgapped:latest

echo ""
echo "Deployment complete!"
echo "Access the application at: http://localhost:${CSI_PORT:-80}"
echo ""
echo "To check status: docker ps"
echo "To view logs: docker logs csi-app"
EOF

chmod +x "${OUTPUT_DIR}/deploy.sh"

# Step 6: Create configuration file
cat > "${OUTPUT_DIR}/config.env" << EOF
# CSI Configuration
# Modify these values as needed before deployment

# Port configuration
CSI_PORT=80

# Database settings (for external database)
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=csi
# DB_USER=csi_user

# Performance tuning
# MAX_WORKERS=4
# MEMORY_LIMIT=2048m
EOF

# Step 7: Calculate package size and create manifest
SIZE=$(du -sh "${OUTPUT_DIR}/${ARCHIVE_NAME}" | cut -f1)
SHA256=$(sha256sum "${OUTPUT_DIR}/${ARCHIVE_NAME}" | cut -d' ' -f1)

cat > "${OUTPUT_DIR}/manifest.txt" << EOF
CSI Airgapped Deployment Package
=================================
Build Date: $(date)
Image Tag: ${IMAGE_TAG}
Archive: ${ARCHIVE_NAME}
Size: ${SIZE}
SHA256: ${SHA256}
EOF

# Summary
echo ""
print_status "Airgapped deployment package created successfully!"
echo ""
echo "Package location: ${OUTPUT_DIR}/"
echo "Package contents:"
echo "  - ${ARCHIVE_NAME} (${SIZE})"
echo "  - README.md (deployment instructions)"
echo "  - deploy.sh (quick deployment script)"
echo "  - config.env (configuration file)"
echo "  - manifest.txt (package details)"
echo ""
echo "Transfer the entire '${OUTPUT_DIR}' folder to your airgapped environment"
echo "and follow the instructions in README.md"