# Critical Alert Threshold Monitoring System

## Overview

We have successfully implemented a comprehensive critical alert system that automatically monitors device metrics and propagates alerts when thresholds reach "critical" levels.

## Components Implemented

### Backend (API)

1. **Enhanced Poller (`src/poller/pollDevices.ts`)**

   - Added `evaluateThresholds()` function that checks critical and warning thresholds
   - Real-time threshold evaluation after each metric insertion
   - Prevents duplicate alerts for the same threshold breach
   - Supports different operators: greater_than, less_than, equals

2. **Alert Notification Service (`src/services/alertNotificationService.ts`)**

   - Socket.IO-based real-time notification system
   - Broadcasts critical alerts to all connected clients
   - Runs on port 8081 by default
   - Automatic client connection management

3. **Database Integration**
   - Enhanced alerts table with metric and threshold references
   - Automatic alert creation with device and site context
   - Severity levels: INFO, WARNING, CRITICAL

### Frontend (UI)

1. **Critical Alerts Hook (`src/hooks/useCriticalAlerts.ts`)**

   - React hook for consuming real-time alert notifications
   - Browser notification support with permission handling
   - Audio alert support (optional)
   - Connection status monitoring
   - Alert acknowledgment and management

2. **Critical Alert Notifications Component (`src/components/Alerts/CriticalAlertNotifications.tsx`)**

   - Floating notification overlay
   - Real-time critical alert display
   - Minimize/expand functionality
   - Alert acknowledgment buttons
   - Responsive design with multiple positioning options

3. **Enhanced Status Badge (`src/components/common/StatusBadge.tsx`)**
   - Pulsing animation for critical status indicators
   - Visual attention-grabbing for critical alerts

## Key Features

### Real-time Monitoring

- Metrics are evaluated against thresholds immediately after collection
- No delay between threshold breach and alert generation
- Socket.IO for instant client notification

### Smart Alert Management

- Duplicate alert prevention for the same metric/threshold
- Alert acknowledgment to remove from display
- Connection status monitoring
- Browser notifications with sound alerts

### Threshold Support

- Critical and warning threshold levels
- Multiple comparison operators (>, <, =)
- Per-device, per-metric configuration
- Group threshold management for similar metrics

### User Experience

- Floating notification overlay that doesn't interfere with main UI
- Minimizable alert panel
- Visual and audio notifications
- Connection status indicators
- Responsive design for mobile devices

## Usage

### Setting Up Thresholds

1. Navigate to Manage Devices
2. Select a device to edit
3. Configure warning and critical thresholds for metrics
4. Thresholds are applied in real-time during polling

### Receiving Alerts

1. Critical alerts appear automatically in the top-right corner
2. Browser notifications (if permission granted)
3. Optional audio alerts
4. Click acknowledge button to dismiss individual alerts
5. Use clear all button to dismiss all alerts

### Monitoring Connection

- Green dot: Connected and monitoring
- Yellow dot: Connecting
- Red dot: Connection error
- Gray dot: Disconnected

## Environment Configuration

Create `.env` file in CSI_UI:

```
VITE_BASE_URL=http://localhost:3000
VITE_ALERT_SERVICE_URL=http://localhost:8081
```

## Dependencies Added

- `socket.io` (API server)
- `socket.io-client` (UI client)

## Next Steps

1. Add email/SMS notification integration
2. Implement alert escalation policies
3. Add alert history and reporting
4. Configure different alert sounds for different severity levels
5. Add alert filtering and grouping options
