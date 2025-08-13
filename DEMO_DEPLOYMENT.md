# CSI Application Demo Deployment Guide

This guide provides instructions for deploying the CSI monitoring application as a demo with dummy data on free cloud platforms.

## 🎯 Quick Start

The application includes pre-configured demo data and credentials for easy testing:

**Demo Credentials:**
- Email: `demo@csi.mil`
- Password: `DemoPass123!`

## 🚀 Deployment Options

### Option 1: Local Docker Deployment (Fastest)

Perfect for local testing and development.

```bash
# Build and run with Docker Compose
docker-compose -f docker-compose.demo.yml up -d

# Access at http://localhost
```

**Pros:**
- Instant deployment
- Full control
- No cloud account needed

**Cons:**
- Requires Docker installed locally
- Not accessible externally

### Option 2: AWS EC2 Free Tier

Deploy to AWS EC2 t2.micro instance (free tier eligible).

```bash
# Make script executable
chmod +x deploy-aws-free.sh

# Run deployment
./deploy-aws-free.sh
```

**Free Tier Limits:**
- 750 hours/month of t2.micro instance
- 30 GB EBS storage
- 15 GB bandwidth

**Requirements:**
- AWS account
- AWS CLI installed and configured
- Docker installed locally (for building)

### Option 3: Azure App Service Free Tier

Deploy to Azure App Service F1 tier (free).

```bash
# Make script executable
chmod +x deploy-azure-free.sh

# Run deployment
./deploy-azure-free.sh
```

**Free Tier Limits:**
- 60 CPU minutes/day
- 1 GB memory
- 1 GB storage
- Apps sleep after 20 mins inactivity

**Requirements:**
- Azure account
- Azure CLI installed
- Docker installed locally

### Option 4: Railway.app (Simplest)

Deploy with one click to Railway (free tier available).

1. Fork this repository
2. Sign up at [Railway.app](https://railway.app)
3. Create new project → Deploy from GitHub
4. Select your forked repository
5. Add environment variables:
   ```
   DEMO_MODE=true
   DEMO_USER=demo@csi.mil
   DEMO_PASSWORD=DemoPass123!
   ```
6. Deploy!

**Free Tier:**
- $5 free credit/month
- ~500 hours of usage
- Automatic HTTPS

### Option 5: Render.com

Deploy to Render's free tier.

1. Fork this repository
2. Sign up at [Render.com](https://render.com)
3. New → Web Service
4. Connect GitHub repository
5. Configure:
   - Build Command: `docker build -f Dockerfile.demo -t app .`
   - Start Command: `docker run -p 80:80 app`
6. Add environment variables (same as Railway)
7. Deploy!

**Free Tier:**
- 750 hours/month
- Spins down after 15 mins inactivity
- Automatic HTTPS

## 📦 What's Included in Demo

The demo deployment includes:

### Pre-configured Data:
- 4 Sites with different locations
- 20+ Devices including:
  - PDUs with outlet control
  - UPS systems
  - Network switches with port status
  - Servers with performance metrics
  - RF equipment
  - Spectrum analyzers
  - Security cameras
- Sample metrics and thresholds
- Alert configurations

### Features:
- ✅ Real-time device monitoring
- ✅ PDU outlet control
- ✅ Network port management
- ✅ Alert system with thresholds
- ✅ Site hierarchy
- ✅ User role management
- ✅ Performance dashboards
- ✅ Device discovery simulation

## 🛠️ Manual Docker Deployment

If you prefer to build and deploy manually:

```bash
# Build the demo image
docker build -f Dockerfile.demo -t csi-demo:latest .

# Run the container
docker run -d \
  --name csi-demo \
  -p 80:80 \
  -e DEMO_MODE=true \
  -e DEMO_USER=demo@csi.mil \
  -e DEMO_PASSWORD=DemoPass123! \
  -v csi-data:/app/data \
  csi-demo:latest

# Check logs
docker logs csi-demo

# Access at http://localhost
```

## 🔧 Environment Variables

All deployment methods support these environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `DEMO_MODE` | `true` | Enable demo mode with relaxed auth |
| `DEMO_USER` | `demo@csi.mil` | Demo user email |
| `DEMO_PASSWORD` | `DemoPass123!` | Demo user password |
| `NODE_ENV` | `production` | Environment mode |
| `DATABASE_URL` | `/app/data/demo.db` | SQLite database path |
| `BETTER_AUTH_SECRET` | (generated) | Auth secret key |
| `PORT` | `3001` | API server port |

## 📊 Demo Data Details

### Sites:
1. **Primary Data Center** - Main facility with servers and PDUs
2. **Secondary Operations Center** - Network infrastructure
3. **RF Communication Hub** - RF equipment and spectrum analyzers
4. **Security Operations Center** - Cameras and monitoring

### Device Types:
- **PDUs**: 2 units with 8-12 outlets each
- **UPS**: 1 unit with battery monitoring
- **Switches**: 2 units with 24-48 ports
- **Servers**: 4 units with CPU/RAM metrics
- **RF Equipment**: 4 units including converters
- **Storage**: 1 NAS unit
- **Cameras**: 2 security cameras

## 🔒 Security Notes

⚠️ **For Demo Only**: The provided credentials and configuration are for demonstration purposes only. For production:

1. Change all default passwords
2. Use proper SSL certificates
3. Configure proper authentication
4. Remove demo mode flags
5. Set strong secret keys
6. Implement proper backup strategies

## 🐛 Troubleshooting

### Container won't start
```bash
# Check logs
docker logs csi-demo

# Verify ports are available
lsof -i :80
```

### Can't login with demo credentials
```bash
# Recreate the database
docker exec csi-demo rm -f /app/data/demo.db
docker restart csi-demo
```

### AWS deployment fails
- Verify AWS CLI is configured: `aws configure`
- Check your region settings
- Ensure you have appropriate IAM permissions

### Azure deployment fails
- Login to Azure: `az login`
- Verify subscription: `az account show`
- Check resource quota limits

## 📞 Support

For issues or questions:
1. Check the logs first
2. Verify environment variables
3. Ensure ports are not blocked
4. Try rebuilding the Docker image

## 🎯 Next Steps

After successful deployment:

1. **Test the Application**
   - Login with demo credentials
   - Explore device monitoring
   - Test PDU outlet control
   - View performance metrics

2. **Customize for Your Needs**
   - Modify device configurations
   - Add custom sites
   - Configure alert thresholds
   - Integrate with real devices

3. **Production Deployment**
   - Review security settings
   - Configure proper authentication
   - Set up monitoring
   - Implement backup strategy

## 📝 License

This demo deployment is provided as-is for evaluation purposes.