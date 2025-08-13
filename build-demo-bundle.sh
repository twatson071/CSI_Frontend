#!/bin/bash

# Build a production bundle for demo deployment
# This creates a lightweight deployment package with pre-built assets

set -e

echo "🏗️  Building CSI Demo Production Bundle..."

# Clean previous builds
rm -rf demo-bundle
mkdir -p demo-bundle

# 1. Build Frontend
echo "📦 Building frontend..."
cd CSI_UI
npm ci --legacy-peer-deps
npm run build
cd ..

# 2. Build Backend
echo "📦 Building backend..."
cd CSI_API
bun install
bun build ./src/index.ts --target=bun --outdir=./dist --minify
cd ..

# 3. Copy production files only
echo "📋 Assembling production bundle..."

# Frontend dist
cp -r CSI_UI/dist demo-bundle/frontend

# Backend dist + essentials
mkdir -p demo-bundle/backend
cp -r CSI_API/dist demo-bundle/backend/
cp -r CSI_API/drizzle demo-bundle/backend/
cp -r CSI_API/scripts demo-bundle/backend/
cp CSI_API/package.json demo-bundle/backend/

# Copy only production dependencies for backend
cd CSI_API
npm ci --production --legacy-peer-deps --prefix ../demo-bundle/backend
cd ..

# 4. Create runtime Dockerfile (much simpler)
cat > demo-bundle/Dockerfile << 'EOF'
FROM node:20-alpine

# Install nginx and supervisor
RUN apk add --no-cache nginx supervisor sqlite bash

WORKDIR /app

# Copy pre-built files
COPY frontend /usr/share/nginx/html
COPY backend /app/backend
COPY nginx.conf /etc/nginx/http.d/default.conf
COPY supervisord.conf /etc/supervisord.conf
COPY start.sh /app/start.sh

# Setup script
RUN chmod +x /app/start.sh && \
    mkdir -p /app/data /var/log/supervisor

# Environment
ENV NODE_ENV=production
ENV DATABASE_URL=/app/data/demo.db
ENV DB_FILE_NAME=/app/data/demo.db
ENV PORT=3001
ENV DEMO_MODE=true

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s \
  CMD wget -q --spider http://localhost/health || exit 1

CMD ["/app/start.sh"]
EOF

# 5. Create start script
cat > demo-bundle/start.sh << 'EOF'
#!/bin/sh
set -e

# Initialize database if needed
if [ ! -f /app/data/demo.db ]; then
    echo "🚀 First run - initializing database..."
    cd /app/backend
    
    # Run migrations
    node -e "require('./dist/index.js')" || true
    
    # Seed demo data
    if [ -f scripts/seed-dummy-data.ts ]; then
        bun scripts/seed-dummy-data.ts || \
        node scripts/seed-dummy-data.js || \
        echo "Seeding skipped"
    fi
fi

# Start services
/usr/bin/supervisord -n -c /etc/supervisord.conf
EOF

# 6. Copy configs
cp nginx.production.conf demo-bundle/nginx.conf
cp supervisord.conf demo-bundle/supervisord.conf

# 7. Create docker-compose for easy deployment
cat > demo-bundle/docker-compose.yml << 'EOF'
version: '3.8'

services:
  csi-demo:
    build: .
    container_name: csi-demo-prod
    ports:
      - "80:80"
    volumes:
      - demo-data:/app/data
    environment:
      - NODE_ENV=production
      - DEMO_MODE=true
      - DEMO_USER=demo@csi.mil
      - DEMO_PASSWORD=DemoPass123!
    restart: unless-stopped

volumes:
  demo-data:
    driver: local
EOF

# 8. Create tarball
echo "📦 Creating deployment package..."
tar -czf csi-demo-bundle.tar.gz demo-bundle/

echo "✅ Production bundle created: csi-demo-bundle.tar.gz"
echo ""
echo "📤 To deploy to EC2:"
echo "  1. scp -i csi-demo-key.pem csi-demo-bundle.tar.gz ec2-user@[EC2-IP]:~/"
echo "  2. ssh -i csi-demo-key.pem ec2-user@[EC2-IP]"
echo "  3. tar -xzf csi-demo-bundle.tar.gz"
echo "  4. cd demo-bundle && docker-compose up -d"
echo ""
echo "Bundle size: $(du -h csi-demo-bundle.tar.gz | cut -f1)"