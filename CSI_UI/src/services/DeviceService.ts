import axios from "axios";

const API_URL = `${import.meta.env.VITE_BASE_URL}`;

export interface Device {
  id: number;
  name: string;
  type: string;
  serviceUrl: string | null;
  siteId: number;
  parameters: Record<string, any> | null;
  data: Record<string, any> | null;
  ipAddress: string | null;
  status: "off" | "standby" | "normal" | "caution" | "serious" | "critical";
  createdAt?: string;
  updatedAt?: string;
  lastSeen?: string; // Add lastSeen for UI purposes (can be derived from updatedAt or latest metric)
}

export interface CreateDevicePayload {
  name: string;
  type: string;
  serviceUrl: string;
  siteId: number;
}

export type UpdateDevicePayload = Partial<Omit<Device, "id">>;

export async function getServiceList(): Promise<string[]> {
  const resp = await axios.get<string[]>(`${API_URL}/devices/services`);
  return resp.data;
}
export async function getRelatedSites(
  deviceId: number
): Promise<{ id: number; name: string }[]> {
  const resp = await axios.get<{ id: number; name: string }[]>(
    `${API_URL}/devices/${deviceId}/sites`
  );
  return resp.data;
}
export async function createDevice(
  deviceData: CreateDevicePayload
): Promise<Device> {
  const resp = await axios.post<Device>(`${API_URL}/devices`, deviceData);
  return resp.data;
}

export async function getDevices(): Promise<Device[]> {
  const resp = await axios.get<Device[]>(`${API_URL}/devices`);
  return resp.data;
}

export async function updateDevice(
  deviceId: number,
  payload: UpdateDevicePayload
): Promise<Device> {
  const resp = await axios.put<Device>(
    `${API_URL}/devices/${deviceId}`,
    payload
  );
  return resp.data;
}
export async function fetchDeviceMetrics(deviceId: number) {
  const resp = await axios.get<
    {
      metricType: string;
      value: number;
      createdAt: string;
    }[]
  >(`${API_URL}/devices/${deviceId}/metrics`);
  return resp.data;
}

export async function fetchMetricTypes(deviceId: number): Promise<string[]> {
  const resp = await axios.get<string[]>(
    `${API_URL}/devices/${deviceId}/metric-types`
  );
  return resp.data;
}

export async function deleteDevice(deviceId: number): Promise<void> {
  await axios.delete(`${API_URL}/devices/${deviceId}`);
}

export async function updateDeviceStatusFromAlerts(
  deviceId: number
): Promise<{ status: string } | null> {
  try {
    const resp = await axios.post<{ status: string }>(
      `${API_URL}/devices/${deviceId}/update-status`
    );
    return resp.data;
  } catch (error) {
    console.error(`Failed to update device ${deviceId} status:`, error);
    return null;
  }
}

/**
 * Determine device status based on alert severity priority
 * This function can be used across the application for consistent status logic
 */
export function getDeviceStatusFromAlerts(
  alerts: Array<{
    severity: "INFO" | "CAUTION" | "SERIOUS" | "CRITICAL";
    acknowledged?: number;
  }>
): Device["status"] {
  // Filter out acknowledged alerts
  const activeAlerts = alerts.filter((alert) => !alert.acknowledged);

  if (activeAlerts.length === 0) return "normal";

  // Priority mapping for alert severities
  const severityPriority = {
    CRITICAL: 4,
    SERIOUS: 3,
    CAUTION: 2,
    INFO: 1,
  };

  // Find the highest severity alert
  let highestSeverity = "INFO";
  let highestPriority = 0;

  for (const alert of activeAlerts) {
    const priority = severityPriority[alert.severity] || 0;
    if (priority > highestPriority) {
      highestPriority = priority;
      highestSeverity = alert.severity;
    }
  }

  // Map alert severity to device status
  const severityToStatus: Record<string, Device["status"]> = {
    CRITICAL: "critical",
    SERIOUS: "serious",
    CAUTION: "caution",
    INFO: "normal",
  };

  return severityToStatus[highestSeverity] || "normal";
}

/**
 * Get device status priority for sorting and comparison
 */
export function getDeviceStatusPriority(status: Device["status"]): number {
  const priorities = {
    critical: 5,
    serious: 4,
    caution: 3,
    normal: 2,
    standby: 1,
    off: 0,
  };
  return priorities[status] || 0;
}
