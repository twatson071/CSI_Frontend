/**
 * Status color definitions based on design system tokens
 * These colors represent different severity levels and states
 */

export interface StatusColor {
  hex: string;
  rgb: string;
  token: string;
  cssVar: string;
  description: string;
}

export const STATUS_COLORS = {
  CRITICAL: {
    hex: "#FF3838",
    rgb: "255,56,56",
    token: "color-status-critical",
    cssVar: "--color-status-critical",
    description: "Critical, severe, alert, form error, emergency, urgent",
  },
  SERIOUS: {
    hex: "#FFB302",
    rgb: "255,179,2",
    token: "color-status-serious",
    cssVar: "--color-status-serious",
    description: "Serious, distress, error, needs attention",
  },
  CAUTION: {
    hex: "#FCE83A",
    rgb: "252,232,58",
    token: "color-status-caution",
    cssVar: "--color-status-caution",
    description: "Caution, warning, unstable, unsatisfactory, watch",
  },
  NORMAL: {
    hex: "#56F000",
    rgb: "86,240,0",
    token: "color-status-normal",
    cssVar: "--color-status-normal",
    description: "Normal, on, ok, fine, go, satisfactory",
  },
  STANDBY: {
    hex: "#2DCCFF",
    rgb: "45,204,255",
    token: "color-status-standby",
    cssVar: "--color-status-standby",
    description: "Standby, available, enabled",
  },
  OFF: {
    hex: "#A4ABB6",
    rgb: "164,171,182",
    token: "color-status-off",
    cssVar: "--color-status-off",
    description: "Off, unavailable, disabled",
  },
} as const;

export type StatusType = keyof typeof STATUS_COLORS;

/**
 * Get status color by threshold value
 * @param value Current metric value
 * @param warningThreshold Warning threshold value
 * @param criticalThreshold Critical threshold value
 * @returns StatusColor object
 */
export const getStatusByThreshold = (
  value: number,
  warningThreshold?: number,
  criticalThreshold?: number
): StatusColor => {
  if (criticalThreshold !== undefined && value >= criticalThreshold) {
    return STATUS_COLORS.CRITICAL;
  }
  if (warningThreshold !== undefined && value >= warningThreshold) {
    return STATUS_COLORS.CAUTION;
  }
  return STATUS_COLORS.NORMAL;
};

/**
 * Get status color for threshold indicators
 * @param thresholdType Type of threshold (warning or critical)
 * @returns StatusColor object
 */
export const getThresholdStatusColor = (
  thresholdType: "warning" | "critical"
): StatusColor => {
  return thresholdType === "critical"
    ? STATUS_COLORS.CRITICAL
    : STATUS_COLORS.CAUTION;
};

/**
 * Get all status colors as an array for UI components
 */
export const getAllStatusColors = (): StatusColor[] => {
  return Object.values(STATUS_COLORS);
};

/**
 * Get status color by name
 */
export const getStatusColor = (status: StatusType): StatusColor => {
  return STATUS_COLORS[status];
};
