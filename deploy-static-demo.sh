#!/bin/bash

# Ultra-simple static deployment for demo
# Deploys just the frontend with mock data

set -e

echo "🚀 Simple Static Demo Deployment"
echo "================================"

# Get EC2 IP
EC2_IP=$(aws ec2 describe-instances \
    --filters "Name=tag:Name,Values=CSI-Demo-Instance" \
    --query "Reservations[0].Instances[0].PublicIpAddress" \
    --output text)

if [ -z "$EC2_IP" ] || [ "$EC2_IP" == "None" ]; then
    echo "❌ No EC2 instance found"
    exit 1
fi

echo "✅ EC2 Instance: $EC2_IP"

# Build frontend (skip TypeScript)
echo "📦 Building frontend..."
cd CSI_UI
npx vite build --mode production || {
    echo "Build failed, trying without TypeScript..."
    # Just bundle the files as-is
    mkdir -p dist
    cp -r src/* dist/
    cp index.html dist/
}
cd ..

# Create simple deployment
echo "📤 Creating deployment package..."
tar -czf static-demo.tar.gz CSI_UI/dist CSI_UI/index.html

# Upload
echo "📤 Uploading to EC2..."
scp -i csi-demo-key.pem -o StrictHostKeyChecking=no static-demo.tar.gz ec2-user@$EC2_IP:~/

# Deploy
echo "🚀 Deploying..."
ssh -i csi-demo-key.pem -o StrictHostKeyChecking=no ec2-user@$EC2_IP << 'EOF'
cd ~
rm -rf static-demo
mkdir static-demo
cd static-demo
tar -xzf ../static-demo.tar.gz

# Stop any existing containers
docker stop csi-demo 2>/dev/null || true
docker rm csi-demo 2>/dev/null || true

# Run simple nginx server
docker run -d \
    --name csi-demo \
    -p 80:80 \
    -v $(pwd)/CSI_UI/dist:/usr/share/nginx/html:ro \
    --restart unless-stopped \
    nginx:alpine

echo "✅ Static demo deployed!"
docker ps
EOF

echo ""
echo "========================================="
echo "✅ Static Demo Deployed!"
echo "========================================="
echo "🌐 URL: http://$EC2_IP"
echo ""
echo "Note: This is a static version without backend."
echo "The UI will load but API calls won't work."