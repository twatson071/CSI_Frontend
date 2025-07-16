import { STATUS_COLORS, StatusType, StatusColor } from "./statusColors";

/**
 * Device-specific status mappings
 */
export interface DeviceStatus {
  id: string;
  name: string;
  status: StatusType;
  lastSeen?: Date;
  metrics?: Record<string, number>;
  alerts?: string[];
}

/**
 * Get device status color based on device state
 * @param device Device object with status information
 * @returns StatusColor object
 */
export const getDeviceStatusColor = (device: DeviceStatus): StatusColor => {
  return STATUS_COLORS[device.status];
};

/**
 * Determine device status based on various health metrics
 * @param metrics Device metrics object
 * @param thresholds Optional thresholds for different metrics
 * @returns StatusType
 */
export const determineDeviceHealthStatus = (
  metrics: Record<string, number>,
  thresholds?: {
    cpu?: { warning: number; critical: number };
    memory?: { warning: number; critical: number };
    temperature?: { warning: number; critical: number };
    diskUsage?: { warning: number; critical: number };
  }
): StatusType => {
  if (!metrics || Object.keys(metrics).length === 0) {
    return "OFF";
  }

  const defaultThresholds = {
    cpu: { warning: 70, critical: 90 },
    memory: { warning: 80, critical: 95 },
    temperature: { warning: 70, critical: 85 },
    diskUsage: { warning: 80, critical: 95 },
  };

  const finalThresholds = { ...defaultThresholds, ...thresholds };

  // Check critical conditions first
  if (
    (metrics.cpu && metrics.cpu >= finalThresholds.cpu.critical) ||
    (metrics.memory && metrics.memory >= finalThresholds.memory.critical) ||
    (metrics.temperature &&
      metrics.temperature >= finalThresholds.temperature.critical) ||
    (metrics.diskUsage &&
      metrics.diskUsage >= finalThresholds.diskUsage.critical)
  ) {
    return "CRITICAL";
  }

  // Check serious conditions (multiple warnings or approaching critical)
  const warningCount = [
    metrics.cpu && metrics.cpu >= finalThresholds.cpu.warning,
    metrics.memory && metrics.memory >= finalThresholds.memory.warning,
    metrics.temperature &&
      metrics.temperature >= finalThresholds.temperature.warning,
    metrics.diskUsage && metrics.diskUsage >= finalThresholds.diskUsage.warning,
  ].filter(Boolean).length;

  if (warningCount >= 2) {
    return "SERIOUS";
  }

  // Check warning conditions
  if (
    (metrics.cpu && metrics.cpu >= finalThresholds.cpu.warning) ||
    (metrics.memory && metrics.memory >= finalThresholds.memory.warning) ||
    (metrics.temperature &&
      metrics.temperature >= finalThresholds.temperature.warning) ||
    (metrics.diskUsage &&
      metrics.diskUsage >= finalThresholds.diskUsage.warning)
  ) {
    return "CAUTION";
  }

  return "NORMAL";
};

/**
 * Get status color for network connectivity
 * @param isConnected Whether device is connected
 * @param lastSeenMinutesAgo Minutes since last seen
 * @returns StatusColor object
 */
export const getNetworkStatusColor = (
  isConnected: boolean,
  lastSeenMinutesAgo: number = 0
): StatusColor => {
  if (!isConnected) {
    return STATUS_COLORS.OFF;
  }

  if (lastSeenMinutesAgo <= 1) {
    return STATUS_COLORS.NORMAL;
  }

  if (lastSeenMinutesAgo <= 5) {
    return STATUS_COLORS.STANDBY;
  }

  if (lastSeenMinutesAgo <= 15) {
    return STATUS_COLORS.CAUTION;
  }

  return STATUS_COLORS.SERIOUS;
};

/**
 * Get status badge text for device
 * @param device Device object
 * @returns Human-readable status text
 */
export const getDeviceStatusText = (device: DeviceStatus): string => {
  const statusMap: Record<StatusType, string> = {
    CRITICAL: "Critical",
    SERIOUS: "Alert",
    CAUTION: "Warning",
    NORMAL: "Healthy",
    STANDBY: "Standby",
    OFF: "Offline",
  };

  return statusMap[device.status] || "Unknown";
};

/**
 * Generate status colors for PDU outlets
 * @param power Current power draw in watts
 * @param maxPower Maximum power capacity in watts
 * @returns StatusColor object
 */
export const getPDUOutletStatusColor = (
  power: number,
  maxPower: number
): StatusColor => {
  const utilization = (power / maxPower) * 100;

  if (utilization >= 95) {
    return STATUS_COLORS.CRITICAL;
  }

  if (utilization >= 85) {
    return STATUS_COLORS.SERIOUS;
  }

  if (utilization >= 75) {
    return STATUS_COLORS.CAUTION;
  }

  if (power > 0) {
    return STATUS_COLORS.NORMAL;
  }

  return STATUS_COLORS.OFF;
};

/**
 * Alert severity to status color mapping
 */
export const getAlertStatusColor = (severity: string): StatusColor => {
  const severityMap: Record<string, StatusType> = {
    critical: "CRITICAL",
    high: "SERIOUS",
    medium: "CAUTION",
    low: "STANDBY",
    info: "NORMAL",
  };

  const statusType = severityMap[severity.toLowerCase()] || "NORMAL";
  return STATUS_COLORS[statusType];
};
