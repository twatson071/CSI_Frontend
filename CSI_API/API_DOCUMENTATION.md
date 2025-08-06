# CSI Frontend API Documentation

## Overview

The CSI Frontend API provides a RESTful interface for managing devices, sites, users, alerts, and system metrics. The API is built with Hono framework and uses SQLite with Drizzle ORM for data persistence.

## Base URL

```
Development: http://localhost:3001
Production: https://your-domain.com/api
```

## Authentication

The API uses Better Auth for authentication. Most endpoints require authentication via session cookies or API keys.

### Authentication Endpoints

- `POST /api/auth/sign-in` - Sign in with email and password
- `POST /api/auth/sign-out` - Sign out current session
- `GET /api/auth/session` - Get current session info

## API Documentation

### Interactive Documentation

- Swagger UI: `http://localhost:3001/api/swagger`
- OpenAPI JSON: `http://localhost:3001/api/doc`

### Main Endpoints

#### Devices

- `GET /api/devices` - List all devices
- `POST /api/devices` - Create a new device
- `GET /api/devices/:id` - Get device by ID
- `PUT /api/devices/:id` - Update device
- `DELETE /api/devices/:id` - Delete device
- `GET /api/devices/:id/metrics` - Get device metrics
- `GET /api/devices/:id/status` - Get device status

#### Sites

- `GET /api/sites` - List all sites
- `POST /api/sites` - Create a new site
- `GET /api/sites/:id` - Get site by ID
- `PUT /api/sites/:id` - Update site
- `DELETE /api/sites/:id` - Delete site
- `GET /api/sites/:id/devices` - Get devices for a site

#### Users

- `GET /api/users` - List all users
- `POST /api/users` - Create a new user
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `POST /api/users/:id/sites` - Assign user to sites

#### Alerts

- `GET /api/alerts` - List all alerts
- `POST /api/alerts` - Create a new alert
- `GET /api/alerts/:id` - Get alert by ID
- `PUT /api/alerts/:id/acknowledge` - Acknowledge alert
- `PUT /api/alerts/:id/resolve` - Resolve alert
- `DELETE /api/alerts/:id` - Delete alert

#### PDU (Power Distribution Unit)

- `GET /api/pdu/:id/outlets` - Get PDU outlet status
- `POST /api/pdu/:id/outlets/:outlet/power` - Control outlet power
- `POST /api/pdu/:id/outlets/:outlet/reboot` - Reboot outlet

#### Metrics & Thresholds

- `GET /api/metric-thresholds` - List all thresholds
- `POST /api/metric-thresholds` - Create threshold
- `PUT /api/metric-thresholds/:id` - Update threshold
- `DELETE /api/metric-thresholds/:id` - Delete threshold

## Request & Response Formats

### Common Headers

```
Content-Type: application/json
Accept: application/json
```

### Error Response Format

```json
{
  "error": "Error type",
  "message": "Human-readable error message",
  "details": {} // Optional additional error details
}
```

### Success Response Format

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {} // Response data
}
```

### Pagination

List endpoints support pagination via query parameters:

- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)

Example: `GET /api/devices?page=2&limit=50`

## WebSocket Events

The API provides real-time updates via Socket.IO on port 8081.

### Events

- `critical-alert` - Emitted when a critical alert is triggered
- `device-status-change` - Emitted when device status changes
- `metric-update` - Emitted when new metrics are available

### Connection

```javascript
const socket = io('http://localhost:8081');

socket.on('critical-alert', (alert) => {
  console.log('Critical alert:', alert);
});
```

## Rate Limiting

- Default: 100 requests per minute per IP
- Authentication endpoints: 20 requests per minute per IP

## Development

### Running Tests

```bash
cd CSI_API
bun test
```

### Seeding Test Data

```bash
bun run seed
```

### API Documentation Updates

The API documentation is auto-generated from OpenAPI schemas. To update:

1. Modify schemas in `src/openapi/`
2. Restart the development server
3. View changes at `/api/swagger`