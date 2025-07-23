# CSI Frontend Development Setup Guide

This guide will help you set up the CSI Frontend project locally for development.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Bun** (JavaScript runtime and package manager)
  ```bash
  curl -fsSL https://bun.sh/install | bash
  ```
- **Node.js** (v18+ for frontend compatibility)
- **Git**

## Project Structure

```
CSI_Frontend/
├── CSI_API/          # Backend API (Bun + Hono + SQLite + Drizzle ORM)
└── CSI_UI/           # Frontend React App (Vite + React 19 + TypeScript)
```

## Quick Start

### Option 1: Automated Setup (Recommended)

For the fastest setup, use the automated setup script:

```bash
# From the CSI_Frontend root directory
./setup-dev.sh

# Start both servers
./start-dev.sh
```

This script will automatically:
- Check prerequisites (Bun, Node.js)
- Set up backend with database migrations
- Seed comprehensive dummy data
- Install frontend dependencies
- Create development scripts
- Verify everything is working

### Option 2: Manual Setup

If you prefer to set up manually or need to troubleshoot:

#### 1. Clone and Setup Backend (CSI_API)

```bash
# Navigate to the API directory
cd CSI_Frontend/CSI_API

# Install dependencies
bun install

# Set up environment variables
cp .env.example .env  # If .env.example exists, otherwise create .env

# Create .env with the following content:
echo "DB_FILE_NAME=local.db
EXTERNAL_BASE_URL=http://localhost:8090
SYSTEM_OPERATOR_KEY=SystemOperator-1
HUB_KEY=Hub-1
NODE_ENV=development" > .env

# Apply database migrations
bun x drizzle-kit migrate

# Seed the database with dummy data
bun run seed

# Start the development server
bun run dev
```

The API will be running at `http://localhost:3000`

#### 2. Setup Frontend (CSI_UI)

```bash
# Navigate to the UI directory
cd ../CSI_UI

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will be running at `http://localhost:5173`

### Option 3: Development Scripts

If you've already set up the project, you can use these convenience scripts:

```bash
# Start both servers simultaneously
./start-dev.sh

# Or start individually
./start-backend.sh    # Backend only
./start-frontend.sh   # Frontend only
```

## Database Management

### Available Scripts

```bash
# Seed database with comprehensive dummy data
bun run seed

# Verify seeded data and relationships
bun run verify

# Generate new migrations after schema changes
bun x drizzle-kit generate

# Apply migrations
bun x drizzle-kit migrate

# Open Drizzle Studio (database GUI)
bun x drizzle-kit studio
```

### Default User Account

The seeder creates a default user account for development:

- **Email**: `dev@localhost.com`
- **Password**: Use the actual password from your authentication system
- **Role**: Admin (full permissions)
- **Site Access**: All 4 seeded sites

### Seeded Data Overview

The database is populated with:

- **4 Sites**:
  - Primary Data Center (Building A - Floor 3)
  - Secondary Operations Center (Building B - Floor 2)  
  - RF Communication Hub (Tower Complex - East Wing)
  - Security Operations Center (Building C - Ground Floor)

- **16 Devices** across multiple types:
  - PDU (4): Power Distribution Units
  - Server (4): Various server types including Cape Server, Time Server
  - RF Equipment (3): RF Matrix Switch, Signal Generator, SDR System
  - Switch (2): Cisco Catalyst network switches
  - Camera (2): Security cameras with different capabilities
  - UPS (1): Uninterruptible Power Supply
  - Spectrum Analyzer (1): Keysight 9010B
  - Storage (1): Dell EMC NAS system

- **Sample Metrics**: Performance metrics for monitoring
- **Alert Thresholds**: Configurable warning/critical thresholds
- **User-Site Relationships**: Default user has access to all sites

## Development Workflow

### Making Database Schema Changes

1. Edit `src/db/schema.ts`
2. Generate migration: `bun x drizzle-kit generate`
3. Apply migration: `bun x drizzle-kit migrate`
4. Update seeder if needed: `scripts/seed-dummy-data.ts`
5. Reseed database: `bun run seed`

### API Development

- **Framework**: Hono (lightweight web framework)
- **Database**: SQLite with Drizzle ORM
- **Authentication**: Better Auth
- **Real-time**: Socket.IO for alerts

### Frontend Development  

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **UI Components**: Astro UXDS React components
- **State Management**: React Context + hooks
- **Styling**: CSS modules + Astro UXDS variables

## Environment Configuration

### Backend (.env)

```bash
DB_FILE_NAME=local.db
EXTERNAL_BASE_URL=http://localhost:8090
SYSTEM_OPERATOR_KEY=SystemOperator-1
HUB_KEY=Hub-1
NODE_ENV=development
```

### Frontend Environment Variables

Check `CSI_UI/.env` or `CSI_UI/.env.local` for frontend-specific variables:

```bash
VITE_BASE_URL=http://localhost:3000
VITE_LOCAL_LOGIN=true
VITE_ALERT_SERVICE_URL=http://localhost:8081
```

## Troubleshooting

### Database Issues

```bash
# Reset database completely
rm local.db
bun x drizzle-kit migrate
bun run seed

# Check database schema
echo ".schema" | sqlite3 local.db

# Verify data
bun run verify
```

### Migration Issues

```bash
# Check migration status
echo "SELECT * FROM __drizzle_migrations;" | sqlite3 local.db

# Manually apply specific migration
echo ".read drizzle/XXXX_migration_name.sql" | sqlite3 local.db
```

### Port Conflicts

- API: Change port in `src/index.ts`
- Frontend: Change port in `vite.config.ts` or use `--port` flag
- Database Studio: Use different port with `--port` flag

## Additional Resources

- **Drizzle ORM Docs**: https://orm.drizzle.team/
- **Hono Docs**: https://hono.dev/
- **Astro UXDS**: https://astrouxds.com/
- **React 19 Docs**: https://react.dev/

## Getting Help

1. Check this documentation first
2. Verify your environment setup
3. Check the console for error messages
4. Review the database state with `bun run verify`
5. Try reseeding the database with `bun run seed`

---

**Happy Coding! 🚀**