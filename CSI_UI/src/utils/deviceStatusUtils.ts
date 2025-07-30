/**
 * Device status utilities
 * Maps various device status strings to valid RuxStatus component values
 */

export type ValidDeviceStatus = "normal" | "critical" | "caution" | "serious" | "off" | "standby";

/**
 * Maps device status strings to valid RuxStatus component values
 * @param status The device status string
 * @returns A valid status value for RuxStatus component
 */
export const mapDeviceStatus = (
  status: string | undefined
): ValidDeviceStatus => {
  if (!status) return "off";
  
  const lowerStatus = status.toLowerCase();
  
  // Debug log for troubleshooting
  if (lowerStatus === "ready") {
    console.warn(`Mapping device status "READY" to "normal"`);
  }
  
  switch (lowerStatus) {
    case "normal":
    case "online":
    case "ready":
    case "ok":
    case "active":
    case "running":
    case "connected":
      return "normal";
      
    case "critical":
    case "error":
    case "failed":
    case "down":
      return "critical";
      
    case "caution":
    case "warning":
    case "warn":
      return "caution";
      
    case "serious":
    case "fault":
    case "alert":
      return "serious";
      
    case "standby":
    case "idle":
    case "waiting":
    case "pending":
      return "standby";
      
    case "off":
    case "offline":
    case "disconnected":
    case "inactive":
    case "disabled":
      return "off";
      
    default:
      // Default to standby for unknown statuses
      console.warn(`Unknown device status: ${status}, defaulting to standby`);
      return "standby";
  }
};

/**
 * Get a human-readable label for a device status
 * @param status The device status
 * @returns A human-readable label
 */
export const getStatusLabel = (status: string): string => {
  const mapped = mapDeviceStatus(status);
  return mapped.charAt(0).toUpperCase() + mapped.slice(1);
};