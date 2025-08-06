# CSI Frontend Component Documentation

## Overview

This document provides an overview of the key components in the CSI Frontend UI. For interactive documentation and live examples, run Storybook:

```bash
npm run storybook
```

## Component Library

### Status Components

#### DeviceStatus
Displays the current status of a device with color-coded indicators.

**Props:**
- `status`: 'online' | 'offline' | 'warning' | 'error'
- `isLoading?`: boolean

**Usage:**
```tsx
<DeviceStatus status="online" />
```

#### StatusBadge
A versatile badge component for showing various status levels.

**Props:**
- `status`: 'standby' | 'normal' | 'caution' | 'serious' | 'critical' | 'off'
- `label?`: string
- `showIcon?`: boolean
- `pulse?`: boolean
- `size?`: 'small' | 'medium' | 'large'

**Usage:**
```tsx
<StatusBadge status="critical" label="System Alert" pulse />
```

### Data Display Components

#### MetricCard
Displays a metric with current value and historical chart.

**Props:**
- `title`: string
- `value`: string | number
- `unit`: string
- `data`: Array<{x: string, y: number}>
- `color?`: string
- `showTrend?`: boolean
- `trendUp?`: boolean
- `isLoading?`: boolean

**Usage:**
```tsx
<MetricCard
  title="CPU Usage"
  value="45"
  unit="%"
  data={cpuData}
  color="#4ade80"
/>
```

#### GenericHeatmap
Displays data in a heatmap visualization using Nivo.

**Props:**
- `data`: HeatmapData
- `width?`: number
- `height?`: number
- `margin?`: object
- `colorScheme?`: string

### Device Management Components

#### DeviceForm
Form for creating and editing devices.

**Props:**
- `device?`: Device
- `onSubmit`: (data: DeviceFormData) => void
- `onCancel`: () => void
- `isLoading?`: boolean

#### DeviceListItem
Displays a single device in a list view.

**Props:**
- `device`: Device
- `onEdit`: (device: Device) => void
- `onDelete`: (id: number) => void
- `onViewDetails`: (device: Device) => void

### Alert Components

#### AlertsPanel
Main panel for displaying and managing alerts.

**Props:**
- `alerts`: Alert[]
- `onAcknowledge`: (id: number) => void
- `onResolve`: (id: number) => void
- `onFilter`: (filters: AlertFilters) => void

#### AlertListItem
Individual alert item display.

**Props:**
- `alert`: Alert
- `onAcknowledge`: () => void
- `onResolve`: () => void
- `isExpanded?`: boolean

### Layout Components

#### ResizableGrid
Provides a resizable grid layout for dashboard views.

**Props:**
- `children`: React.ReactNode
- `columns?`: number
- `gap?`: number
- `minItemWidth?`: number

### Chart Components

#### GenericLineChart
Flexible line chart component using Nivo.

**Props:**
- `data`: LineChartData[]
- `xLabel?`: string
- `yLabel?`: string
- `height?`: number
- `enableArea?`: boolean

#### CPUCoreTempHeatmap
Specialized heatmap for CPU core temperatures.

**Props:**
- `data`: CPUTempData
- `cores`: number
- `height?`: number

## Design Patterns

### State Management
- Components use React hooks for local state
- Global state managed via Context API (AuthContext, PreferencesContext)
- Server state handled with custom hooks (useDeviceStatus, useAlerts)

### Styling
- CSS modules for component-specific styles
- Astro UXDS design system integration
- CSS custom properties for theming

### Error Handling
- ErrorBoundary component for graceful error handling
- Toast notifications for user feedback
- Loading states for async operations

### Performance
- React.memo for expensive components
- Lazy loading for route-based code splitting
- Virtualization for large lists

## Testing

Components include unit tests using Vitest and React Testing Library:

```bash
npm test
```

Test files are located alongside components with `.test.tsx` extension.

## Best Practices

1. **Props Interface**: Always define TypeScript interfaces for props
2. **Default Props**: Use default parameters for optional props
3. **Accessibility**: Include ARIA labels and keyboard navigation
4. **Documentation**: Add JSDoc comments for complex components
5. **Storybook**: Create stories for all UI components

## Adding New Components

1. Create component file in appropriate directory
2. Add TypeScript interface for props
3. Implement component with proper error handling
4. Add CSS module for styling
5. Create unit tests
6. Add Storybook story
7. Update this documentation