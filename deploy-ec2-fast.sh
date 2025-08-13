#!/bin/bash

# Fast EC2 deployment with pre-built production bundle
# Builds locally, deploys only the production files

set -e

echo "🚀 Fast EC2 Deployment for CSI Demo"
echo "===================================="

# Check for key file
if [ ! -f "csi-demo-key.pem" ]; then
    echo "❌ SSH key not found: csi-demo-key.pem"
    echo "   Run ./deploy-aws-free.sh first to create the EC2 instance"
    exit 1
fi

# Get EC2 public IP
echo "🔍 Finding EC2 instance..."
EC2_IP=$(aws ec2 describe-instances \
    --filters "Name=tag:Name,Values=CSI-Demo-Instance" \
    --query "Reservations[0].Instances[0].PublicIpAddress" \
    --output text)

if [ -z "$EC2_IP" ] || [ "$EC2_IP" == "None" ]; then
    echo "❌ No EC2 instance found. Run ./deploy-aws-free.sh first"
    exit 1
fi

echo "✅ Found EC2 at: $EC2_IP"

# Build production assets locally
echo "📦 Building production bundle locally..."

# 1. Build frontend
echo "  Building frontend..."
cd CSI_UI
npm ci --legacy-peer-deps --silent
npm run build
cd ..

# 2. Prepare minimal deployment
echo "📤 Preparing deployment package..."
rm -rf .deploy-temp
mkdir -p .deploy-temp

# Copy only essential files
cp -r CSI_UI/dist .deploy-temp/frontend
mkdir -p .deploy-temp/backend
cp -r CSI_API/src .deploy-temp/backend/
cp -r CSI_API/drizzle .deploy-temp/backend/
cp -r CSI_API/scripts .deploy-temp/backend/
cp CSI_API/package.json .deploy-temp/backend/
cp nginx.production.conf .deploy-temp/
cp supervisord.conf .deploy-temp/

# 3. Create simple deployment script
cat > .deploy-temp/deploy.sh << 'EOF'
#!/bin/bash
set -e

echo "🔧 Setting up CSI Demo on EC2..."

# Install dependencies if needed
if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    sudo yum install -y docker
    sudo service docker start
    sudo usermod -a -G docker ec2-user
    echo "Please log out and back in for Docker permissions"
    exit 1
fi

# Create Dockerfile
cat > Dockerfile << 'DOCKERFILE'
FROM node:20-alpine

RUN apk add --no-cache nginx supervisor sqlite bash bun

WORKDIR /app

# Copy files
COPY frontend /usr/share/nginx/html
COPY backend /app/backend
COPY nginx.production.conf /etc/nginx/conf.d/default.conf
COPY supervisord.conf /etc/supervisord.conf

# Install backend dependencies
WORKDIR /app/backend
RUN bun install --production

# Setup database
RUN mkdir -p /app/data && \
    bun run drizzle-kit generate:sqlite && \
    bun run scripts/seed-dummy-data.ts || true

WORKDIR /app

# Start script
RUN echo '#!/bin/sh' > /start.sh && \
    echo 'cd /app/backend && bun src/index.ts &' >> /start.sh && \
    echo 'nginx -g "daemon off;"' >> /start.sh && \
    chmod +x /start.sh

ENV NODE_ENV=production
ENV DATABASE_URL=/app/data/demo.db
ENV PORT=3001
ENV DEMO_MODE=true

EXPOSE 80

CMD ["/start.sh"]
DOCKERFILE

# Build and run
docker build -t csi-demo .
docker stop csi-demo 2>/dev/null || true
docker rm csi-demo 2>/dev/null || true
docker run -d \
    --name csi-demo \
    -p 80:80 \
    -e DEMO_MODE=true \
    -e DEMO_USER=demo@csi.mil \
    -e DEMO_PASSWORD=DemoPass123! \
    -v csi-data:/app/data \
    --restart unless-stopped \
    csi-demo

echo "✅ Deployment complete!"
echo "🌐 Access at: http://$(curl -s ifconfig.me)"
docker logs csi-demo
EOF

chmod +x .deploy-temp/deploy.sh

# 4. Create tarball
echo "📦 Creating deployment archive..."
cd .deploy-temp
tar -czf ../deploy.tar.gz .
cd ..

# 5. Upload to EC2
echo "📤 Uploading to EC2 (this may take a minute)..."
scp -i csi-demo-key.pem -o StrictHostKeyChecking=no deploy.tar.gz ec2-user@$EC2_IP:~/

# 6. Deploy on EC2
echo "🚀 Deploying on EC2..."
ssh -i csi-demo-key.pem -o StrictHostKeyChecking=no ec2-user@$EC2_IP << 'REMOTE_SCRIPT'
set -e
cd ~
rm -rf csi-deploy
mkdir csi-deploy
cd csi-deploy
tar -xzf ../deploy.tar.gz
./deploy.sh
REMOTE_SCRIPT

# Cleanup
rm -rf .deploy-temp deploy.tar.gz

echo ""
echo "========================================="
echo "✅ Deployment Complete!"
echo "========================================="
echo ""
echo "🌐 Application URL: http://$EC2_IP"
echo ""
echo "🔐 Demo Credentials:"
echo "   Email: demo@csi.mil"
echo "   Password: DemoPass123!"
echo ""
echo "📊 View logs:"
echo "   ssh -i csi-demo-key.pem ec2-user@$EC2_IP"
echo "   docker logs csi-demo"
echo ""