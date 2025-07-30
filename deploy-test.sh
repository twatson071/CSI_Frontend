#!/bin/bash

# CSI Frontend Test Deployment Script
# Quickly deploy the application with dummy data for testing

# Source utilities if available
if [ -f "$(dirname "$0")/dev-utils.sh" ]; then
    source "$(dirname "$0")/dev-utils.sh"
else
    # Fallback colors and functions
    RED='\033[0;31m'
    GREEN='\033[0;32m'
    YELLOW='\033[1;33m'
    BLUE='\033[0;34m'
    NC='\033[0m'
    
    print_status() { echo -e "${GREEN}✅ $1${NC}"; }
    print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
    print_error() { echo -e "${RED}❌ $1${NC}"; }
    print_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
fi

# Deployment options
DEPLOY_MODE="standalone"  # standalone, docker, pm2
BUILD_FRONTEND=true
SEED_DATA=true
PORT_BACKEND=3001
PORT_FRONTEND=3002
ENV_FILE=".env.test"

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --docker)
            DEPLOY_MODE="docker"
            shift
            ;;
        --pm2)
            DEPLOY_MODE="pm2"
            shift
            ;;
        --no-build)
            BUILD_FRONTEND=false
            shift
            ;;
        --no-seed)
            SEED_DATA=false
            shift
            ;;
        --backend-port)
            PORT_BACKEND=$2
            shift 2
            ;;
        --frontend-port)
            PORT_FRONTEND=$2
            shift 2
            ;;
        --env)
            ENV_FILE=$2
            shift 2
            ;;
        --help|-h)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Quick deployment script for testing CSI Frontend with dummy data"
            echo ""
            echo "Options:"
            echo "  --docker         Deploy using Docker Compose"
            echo "  --pm2            Deploy using PM2 process manager"
            echo "  --no-build       Skip frontend build"
            echo "  --no-seed        Skip database seeding"
            echo "  --backend-port   Backend port (default: 3001)"
            echo "  --frontend-port  Frontend port (default: 3002)"
            echo "  --env FILE       Environment file (default: .env.test)"
            echo ""
            echo "Deployment modes:"
            echo "  standalone (default) - Run directly with Node/Bun"
            echo "  docker              - Use Docker Compose"
            echo "  pm2                 - Use PM2 for process management"
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Create test environment file
create_test_env() {
    print_info "Creating test environment configuration..."
    
    # Backend env
    cat > CSI_API/$ENV_FILE << EOF
# Test Deployment Configuration
DB_FILE_NAME=test.db
EXTERNAL_BASE_URL=http://localhost:8092
SYSTEM_OPERATOR_KEY=TestSystemOperator-1
HUB_KEY=TestHub-1
NODE_ENV=test
PORT=$PORT_BACKEND

# CORS Configuration
CORS_ORIGIN=http://localhost:$PORT_FRONTEND

# Optional: External service mock
MOCK_EXTERNAL_SERVICE=true
EOF

    # Frontend env
    cat > CSI_UI/.env.test << EOF
# Test Frontend Configuration
VITE_API_URL=http://localhost:$PORT_BACKEND
VITE_APP_ENV=test
EOF

    print_status "Test environment files created"
}

# Deploy standalone
deploy_standalone() {
    print_info "Deploying in standalone mode..."
    
    # Setup backend
    cd CSI_API
    print_info "Installing backend dependencies..."
    bun install --production
    
    if [ "$SEED_DATA" = true ]; then
        print_info "Setting up test database with dummy data..."
        cp $ENV_FILE .env
        bun x drizzle-kit migrate
        bun run seed:force
        print_status "Test database ready"
    fi
    
    # Start backend
    print_info "Starting backend server on port $PORT_BACKEND..."
    PORT=$PORT_BACKEND bun run src/index.ts &
    BACKEND_PID=$!
    cd ..
    
    # Setup frontend
    if [ "$BUILD_FRONTEND" = true ]; then
        cd CSI_UI
        print_info "Installing frontend dependencies..."
        npm install --production
        
        print_info "Building frontend..."
        npm run build
        cd ..
    fi
    
    # Serve frontend
    cd CSI_UI
    print_info "Starting frontend server on port $PORT_FRONTEND..."
    npx vite preview --port $PORT_FRONTEND --host &
    FRONTEND_PID=$!
    cd ..
    
    print_status "Deployment complete!"
    echo ""
    echo "Test environment is running:"
    echo "  Backend:  http://localhost:$PORT_BACKEND"
    echo "  Frontend: http://localhost:$PORT_FRONTEND"
    echo "  Login:    dev@localhost.com / password"
    echo ""
    echo "Press Ctrl+C to stop"
    
    # Wait for interrupt
    trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT
    wait
}

# Deploy with Docker
deploy_docker() {
    print_info "Deploying with Docker..."
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed"
        exit 1
    fi
    
    # Check for docker-compose.yml
    if [ ! -f "docker-compose.test.yml" ]; then
        print_error "docker-compose.test.yml not found. Creating one..."
        create_docker_compose
    fi
    
    # Build and run
    print_info "Building Docker images..."
    docker-compose -f docker-compose.test.yml build
    
    print_info "Starting containers..."
    docker-compose -f docker-compose.test.yml up -d
    
    print_status "Docker deployment complete!"
    echo ""
    echo "Services are running:"
    echo "  Backend:  http://localhost:$PORT_BACKEND"
    echo "  Frontend: http://localhost:$PORT_FRONTEND"
    echo "  Login:    dev@localhost.com / password"
    echo ""
    echo "To stop: docker-compose -f docker-compose.test.yml down"
}

# Deploy with PM2
deploy_pm2() {
    print_info "Deploying with PM2..."
    
    # Check PM2
    if ! command -v pm2 &> /dev/null; then
        print_error "PM2 is not installed"
        echo "Install with: npm install -g pm2"
        exit 1
    fi
    
    # Create PM2 ecosystem file
    cat > ecosystem.config.js << EOF
module.exports = {
  apps: [
    {
      name: 'csi-backend',
      cwd: './CSI_API',
      script: 'bun',
      args: 'run src/index.ts',
      env: {
        NODE_ENV: 'test',
        PORT: $PORT_BACKEND
      }
    },
    {
      name: 'csi-frontend',
      cwd: './CSI_UI',
      script: 'npm',
      args: 'run preview -- --port $PORT_FRONTEND --host',
      env: {
        NODE_ENV: 'test'
      }
    },
    {
      name: 'csi-mock-api',
      cwd: './CSI_API',
      script: 'bun',
      args: 'run scripts/mock-external-service.ts',
      env: {
        PORT: 8092
      }
    }
  ]
};
EOF

    # Setup
    if [ "$BUILD_FRONTEND" = true ]; then
        print_info "Building frontend..."
        cd CSI_UI && npm install && npm run build && cd ..
    fi
    
    if [ "$SEED_DATA" = true ]; then
        print_info "Setting up database..."
        cd CSI_API
        cp $ENV_FILE .env
        bun install
        bun x drizzle-kit migrate
        bun run seed:force
        cd ..
    fi
    
    # Start with PM2
    print_info "Starting services with PM2..."
    pm2 start ecosystem.config.js
    
    print_status "PM2 deployment complete!"
    echo ""
    echo "Services are running:"
    echo "  Backend:  http://localhost:$PORT_BACKEND"
    echo "  Frontend: http://localhost:$PORT_FRONTEND"
    echo "  Login:    dev@localhost.com / password"
    echo ""
    echo "PM2 commands:"
    echo "  Status:  pm2 status"
    echo "  Logs:    pm2 logs"
    echo "  Stop:    pm2 stop all"
    echo "  Restart: pm2 restart all"
}

# Create docker-compose file
create_docker_compose() {
    cat > docker-compose.test.yml << 'EOF'
version: '3.8'

services:
  backend:
    build:
      context: ./CSI_API
      dockerfile: Dockerfile.test
    ports:
      - "${PORT_BACKEND:-3000}:3000"
    environment:
      - NODE_ENV=test
      - DB_FILE_NAME=/data/test.db
      - EXTERNAL_BASE_URL=http://mock-api:8092
    volumes:
      - ./data:/data
    depends_on:
      - mock-api
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    build:
      context: ./CSI_UI
      dockerfile: Dockerfile.test
    ports:
      - "${PORT_FRONTEND:-3002}:80"
    environment:
      - VITE_API_URL=http://localhost:${PORT_BACKEND:-3000}
    depends_on:
      - backend

  mock-api:
    build:
      context: ./CSI_API
      dockerfile: Dockerfile.mock
    ports:
      - "8092:8092"
    environment:
      - PORT=8092

volumes:
  data:
EOF

    # Create Dockerfiles
    cat > CSI_API/Dockerfile.test << 'EOF'
FROM oven/bun:latest
WORKDIR /app
COPY package.json bun.lockb ./
RUN bun install --production
COPY . .
RUN bun x drizzle-kit migrate
RUN bun run seed:force
EXPOSE 3000
CMD ["bun", "run", "src/index.ts"]
EOF

    cat > CSI_UI/Dockerfile.test << 'EOF'
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
EOF

    cat > CSI_API/Dockerfile.mock << 'EOF'
FROM oven/bun:latest
WORKDIR /app
COPY package.json bun.lockb ./
RUN bun install
COPY scripts/mock-external-service.ts ./scripts/
EXPOSE 8092
CMD ["bun", "run", "scripts/mock-external-service.ts"]
EOF

    # Create nginx config
    cat > CSI_UI/nginx.conf << 'EOF'
server {
    listen 80;
    location / {
        root /usr/share/nginx/html;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
    location /api {
        proxy_pass http://backend:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
EOF

    print_status "Docker Compose files created"
}

# Main execution
main() {
    echo "🚀 CSI Frontend Test Deployment"
    echo "==============================="
    
    # Create test environment
    create_test_env
    
    # Deploy based on mode
    case $DEPLOY_MODE in
        standalone)
            deploy_standalone
            ;;
        docker)
            deploy_docker
            ;;
        pm2)
            deploy_pm2
            ;;
        *)
            print_error "Unknown deployment mode: $DEPLOY_MODE"
            exit 1
            ;;
    esac
}

# Run main
main