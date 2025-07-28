# CSI Frontend Test Deployment Guide

This guide explains how to quickly deploy the CSI Frontend application with dummy data for testing purposes.

## Quick Start

The easiest way to deploy for testing:

```bash
# Clone the repository
git clone <repository-url>
cd CSI_Frontend

# Run the deployment script
./deploy-test.sh
```

This will:
- Set up the backend with a test database
- Seed the database with dummy data (4 sites, 16 devices)
- Build and serve the frontend
- Start a mock external API service

## Deployment Options

### 1. Standalone Deployment (Default)

```bash
./deploy-test.sh
```

- Runs directly with Bun (backend) and Node.js (frontend)
- Suitable for quick local testing
- No additional dependencies required

### 2. Docker Deployment

```bash
./deploy-test.sh --docker

# Or use docker-compose directly
docker-compose -f docker-compose.test.yml up
```

- Containerized deployment
- Isolated environment
- Requires Docker and Docker Compose

### 3. PM2 Deployment

```bash
./deploy-test.sh --pm2
```

- Process management with PM2
- Auto-restart on crashes
- Better for longer-running tests
- Requires PM2: `npm install -g pm2`

## Configuration Options

### Custom Ports

```bash
# Change backend port (default: 3001)
./deploy-test.sh --backend-port 3005

# Change frontend port (default: 3002)
./deploy-test.sh --frontend-port 8080
```

### Skip Build/Seed

```bash
# Skip frontend build (use existing build)
./deploy-test.sh --no-build

# Skip database seeding (use existing data)
./deploy-test.sh --no-seed
```

### Custom Environment

```bash
# Use custom environment file
./deploy-test.sh --env .env.staging
```

## Test Data

The deployment includes comprehensive dummy data:

### Sites
- **Site Alpha** - Primary operations center
- **Site Beta** - Secondary facility
- **Site Gamma** - Remote location
- **Site Delta** - Backup site

### Devices (16 total)
- 4 PDUs (Power Distribution Units)
- 4 Servers
- 4 RF devices
- 4 Cameras

### Default User
- Email: `dev@localhost.com`
- Password: `password`
- Access: All sites

## Docker Deployment Details

### Using Docker Compose

```bash
# Start all services
docker-compose -f docker-compose.test.yml up -d

# View logs
docker-compose -f docker-compose.test.yml logs -f

# Stop all services
docker-compose -f docker-compose.test.yml down

# Reset data (remove volumes)
docker-compose -f docker-compose.test.yml down -v
```

### Services
1. **mock-api** - Mock external service (port 8092)
2. **backend** - API server (port 3001)
3. **frontend** - Development server (port 3002)
4. **frontend-prod** - Production build with nginx (port 8080, optional)

### Production-like Frontend

```bash
# Include production frontend build
docker-compose -f docker-compose.test.yml --profile production up
```

## PM2 Deployment Details

### PM2 Commands

```bash
# View status
pm2 status

# View logs
pm2 logs

# Restart services
pm2 restart all

# Stop services
pm2 stop all

# Remove from PM2
pm2 delete all
```

### Managed Processes
- `csi-backend` - Backend API
- `csi-frontend` - Frontend server
- `csi-mock-api` - Mock external service

## Environment Variables

### Backend (.env.test)
```env
DB_FILE_NAME=test.db
EXTERNAL_BASE_URL=http://localhost:8090
SYSTEM_OPERATOR_KEY=TestSystemOperator-1
HUB_KEY=TestHub-1
NODE_ENV=test
PORT=3001
CORS_ORIGIN=http://localhost:3002
```

### Frontend (.env.test)
```env
VITE_API_URL=http://localhost:3001
VITE_APP_ENV=test
```

## Manual Deployment

If you prefer manual deployment:

### Backend Setup
```bash
cd CSI_API
bun install
cp .env.test .env
bun x drizzle-kit migrate
bun run seed:force
bun run dev
```

### Frontend Setup
```bash
cd CSI_UI
npm install
npm run build
npm run preview
```

### Mock Service
```bash
cd CSI_API
bun run mock-service
```

## Troubleshooting

### Port Already in Use
```bash
# Kill process on specific port
lsof -ti:3001 | xargs kill -9

# Or use different ports
./deploy-test.sh --backend-port 3001 --frontend-port 8080
```

### Docker Issues
```bash
# Clean up Docker resources
docker-compose -f docker-compose.test.yml down -v
docker system prune -f

# Rebuild images
docker-compose -f docker-compose.test.yml build --no-cache
```

### Database Issues
```bash
# Reset database
./reset-dev.sh db

# Force reseed
cd CSI_API && bun run seed:force
```

### Missing Dependencies
```bash
# Install Bun
curl -fsSL https://bun.sh/install | bash

# Install Node.js
# Visit https://nodejs.org

# Install PM2
npm install -g pm2

# Install Docker
# Visit https://docs.docker.com/get-docker/
```

## Health Checks

All deployment methods include health checks:

- Backend: `http://localhost:3001/health`
- Mock API: `http://localhost:8092/health`
- Frontend: `http://localhost:3002`

## Security Notes

⚠️ **For Testing Only**: This deployment uses:
- Default credentials
- Permissive CORS settings
- Development security keys
- Unencrypted database

Do not use these settings in production!

## Next Steps

After deployment:

1. Access the frontend at `http://localhost:3002`
2. Login with `dev@localhost.com` / `password`
3. Explore the dummy data and test features
4. Check the API at `http://localhost:3001`
5. View mock service at `http://localhost:8092`

For development setup, see [DEV_SETUP.md](CSI_API/DEV_SETUP.md)