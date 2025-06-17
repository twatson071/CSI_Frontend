import axios from "axios";

const API_URL = `${import.meta.env.VITE_BASE_URL}`;

export interface Alert {
  id: number;
  type: string;
  message: string;
  severity: "INFO" | "WARNING" | "CRITICAL";
  deviceId: number | null;
  siteId?: number | null;
  metricId?: number | null;
  thresholdId?: number | null;
  createdAt: string;
  acknowledged?: number;
  acknowledgedBy?: number | null;
  acknowledgedAt?: string | null;
}

export async function getAlerts(): Promise<Alert[]> {
  const resp = await axios.get<Alert[]>(`${API_URL}/alerts`);
  return resp.data;
}

export async function acknowledgeAlert(id: number): Promise<Alert> {
  const resp = await axios.put<Alert>(`${API_URL}/alerts/${id}`, {
    acknowledged: 1,
    acknowledgedAt: new Date().toISOString(),
  });
  return resp.data;
}
