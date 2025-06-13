# Status Colors System

This utility provides a centralized way to manage status colors throughout the CSI Frontend application. It ensures consistency across components and makes it easy to update colors globally.

## Available Status Colors

- **CRITICAL** (`#FF3838`) - Critical, severe, alert, form error, emergency, urgent
- **SERIOUS** (`#FFB302`) - Serious, distress, error, needs attention
- **CAUTION** (`#FCE83A`) - Caution, warning, unstable, unsatisfactory, watch
- **NORMAL** (`#56F000`) - Normal, on, ok, fine, go, satisfactory
- **STANDBY** (`#2DCCFF`) - Standby, available, enabled
- **OFF** (`#A4ABB6`) - Off, unavailable, disabled

## Usage Examples

### Basic Color Access

```typescript
import { STATUS_COLORS, getStatusColor } from "../utils/statusColors";

// Direct access
const criticalColor = STATUS_COLORS.CRITICAL.hex; // #FF3838

// Via helper function
const normalColor = getStatusColor("NORMAL").hex; // #56F000
```

### Threshold-based Status

```typescript
import { getStatusByThreshold } from "../utils/statusColors";

const currentValue = 85;
const warningThreshold = 70;
const criticalThreshold = 90;

const status = getStatusByThreshold(
  currentValue,
  warningThreshold,
  criticalThreshold
);
// Returns STATUS_COLORS.CAUTION since 85 is >= 70 but < 90
```

### Threshold Indicators

```typescript
import { getThresholdStatusColor } from "../utils/statusColors";

const warningColor = getThresholdStatusColor("warning"); // CAUTION color
const criticalColor = getThresholdStatusColor("critical"); // CRITICAL color
```

### UI Components

```typescript
import { StatusIndicator, StatusLegend, ThresholdColorBar } from '../components/common/StatusIndicators';

// Simple status dot
<StatusIndicator status="CRITICAL" size="medium" showLabel />

// Status legend for help/documentation
<StatusLegend />

// Threshold visualization bar
<ThresholdColorBar
  warningThreshold={70}
  criticalThreshold={90}
  currentValue={85}
/>
```

## Integration with Thresholds

The ManageDevices component now uses these colors to provide visual indicators for threshold inputs:

- Warning threshold inputs have a yellow (`#FCE83A`) indicator bar
- Critical threshold inputs have a red (`#FF3838`) indicator bar

This helps users understand at a glance what type of threshold they're setting.

## CSS Variables

Each color is also available as a CSS variable for use in stylesheets:

- `--color-status-critical`
- `--color-status-serious`
- `--color-status-caution`
- `--color-status-normal`
- `--color-status-standby`
- `--color-status-off`

## Best Practices

1. **Use the utility functions** rather than hardcoding hex values
2. **Import from services/index.ts** to get the centralized exports
3. **Use STATUS_COLORS constants** instead of magic strings
4. **Consider semantic meaning** when choosing colors (e.g., CAUTION for warnings, CRITICAL for errors)
5. **Use StatusIndicator components** for consistent visual representation
