# CSI Production Deployment Guide

This guide explains how to deploy the CSI application in a production-ready Docker container.

## Overview

The production deployment packages both the frontend (React/Vite) and backend (Bun/Hono) into a single Docker container using nginx as a reverse proxy. This simplifies deployment for demos and testing purposes.

## Architecture

```
┌─────────────────────────────────────┐
│         Docker Container            │
│                                     │
│  ┌─────────────┐   ┌─────────────┐ │
│  │    nginx    │   │   Backend   │ │
│  │   (port 80) │──▶│ (port 3001) │ │
│  └─────────────┘   └─────────────┘ │
│         │                  │        │
│         ▼                  ▼        │
│  ┌─────────────┐   ┌─────────────┐ │
│  │   Frontend  │   │   SQLite    │ │
│  │   (static)  │   │  Database   │ │
│  └─────────────┘   └─────────────┘ │
└─────────────────────────────────────┘
```

## Prerequisites

- Docker (version 20.10 or higher)
- Docker Compose (version 1.29 or higher)
- 2GB free disk space
- Port 8080 available (configurable)

## Quick Start

1. **Clone the repository** (if not already done):
   ```bash
   git clone <repository-url>
   cd CSI_Frontend
   ```

2. **Deploy the application**:
   ```bash
   ./deploy-production.sh
   ```

   The script will:
   - Build the Docker image
   - Start the container
   - Make the application available at http://localhost:8080

## Deployment Options

### Basic Deployment
```bash
./deploy-production.sh
```

### Custom Port
```bash
./deploy-production.sh --port 9090
```

### Build Only (without running)
```bash
./deploy-production.sh --build-only
```

### Run in Foreground (see logs)
```bash
./deploy-production.sh --attach
```

## Configuration

### Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.production.example .env.production
   ```

2. Edit `.env.production` with your settings:
   - `BETTER_AUTH_SECRET`: Change this to a secure random string
   - `SESSION_SECRET`: Change this to another secure random string
   - Configure any external services (SMTP, etc.)

### Docker Compose Override

For advanced configuration, create a `docker-compose.override.yml`:

```yaml
version: '3.8'
services:
  csi-app:
    environment:
      - CUSTOM_VAR=value
    volumes:
      - ./custom-config:/app/config
```

## Managing the Deployment

### View Logs
```bash
# All logs
docker logs -f csi-production

# Last 100 lines
docker logs --tail 100 csi-production

# Specific service logs
docker exec csi-production tail -f /var/log/supervisor/backend-stdout.log
docker exec csi-production tail -f /var/log/supervisor/nginx-error.log
```

### Stop the Application
```bash
docker-compose -f docker-compose.production.yml down
```

### Restart the Application
```bash
docker-compose -f docker-compose.production.yml restart
```

### Update the Application
```bash
# Pull latest changes
git pull

# Rebuild and restart
./deploy-production.sh
```

### Access the Container
```bash
docker exec -it csi-production sh
```

## Data Persistence

The application uses Docker volumes for persistent data:

- `csi-data`: SQLite database and application data
- `csi-logs`: Application logs

### Backup Data
```bash
# Backup database
docker cp csi-production:/app/data/production.db ./backup-$(date +%Y%m%d).db

# Backup all data
docker run --rm -v csi-data:/data -v $(pwd):/backup alpine tar czf /backup/csi-data-backup-$(date +%Y%m%d).tar.gz -C /data .
```

### Restore Data
```bash
# Restore database
docker cp ./backup-20240120.db csi-production:/app/data/production.db

# Restore all data
docker run --rm -v csi-data:/data -v $(pwd):/backup alpine tar xzf /backup/csi-data-backup-20240120.tar.gz -C /data
```

## Health Monitoring

The container includes health checks:

```bash
# Check health status
docker inspect csi-production --format='{{.State.Health.Status}}'

# Manual health check
curl http://localhost:8080/health
curl http://localhost:8080/api/health
```

## Troubleshooting

### Container Won't Start
1. Check if ports are in use: `lsof -i :8080`
2. View logs: `docker logs csi-production`
3. Check disk space: `df -h`

### Database Issues
1. Check database file permissions:
   ```bash
   docker exec csi-production ls -la /app/data/
   ```
2. Reset database (WARNING: loses all data):
   ```bash
   docker-compose -f docker-compose.production.yml down -v
   ./deploy-production.sh
   ```

### Performance Issues
1. Check resource usage:
   ```bash
   docker stats csi-production
   ```
2. Increase container resources in docker-compose.production.yml:
   ```yaml
   services:
     csi-app:
       deploy:
         resources:
           limits:
             cpus: '2'
             memory: 2G
   ```

## Security Considerations

1. **Change default secrets** in production
2. **Use HTTPS** - put a reverse proxy (nginx, Traefik) in front with SSL
3. **Firewall** - only expose necessary ports
4. **Regular updates** - keep Docker and dependencies updated
5. **Backup regularly** - automate database backups

## Production Checklist

- [ ] Changed `BETTER_AUTH_SECRET` from default
- [ ] Changed `SESSION_SECRET` from default
- [ ] Configured proper CORS origins
- [ ] Set up SSL/TLS (HTTPS)
- [ ] Configured firewall rules
- [ ] Set up monitoring/alerting
- [ ] Configured automated backups
- [ ] Tested restore procedure
- [ ] Documented deployment specifics

## Support

For issues or questions:
1. Check the logs first
2. Review this documentation
3. Check the main README.md
4. Open an issue in the repository