import axios from "axios";

const API_URL = `${import.meta.env.VITE_BASE_URL}`;

export interface MetricThreshold {
  id: number;
  deviceId: number;
  metricType: string;
  warningThreshold?: number | null;
  criticalThreshold?: number | null;
  operator?: string | null;
  isActive?: number | null;
}

export type CreateMetricThresholdPayload = Omit<MetricThreshold, "id">;
export type UpdateMetricThresholdPayload = Partial<CreateMetricThresholdPayload>;

export async function getThresholdsForDevice(deviceId: number): Promise<MetricThreshold[]> {
  const resp = await axios.get<MetricThreshold[]>(`${API_URL}/metric-thresholds/device/${deviceId}`);
  return resp.data;
}

export async function createMetricThreshold(data: CreateMetricThresholdPayload): Promise<MetricThreshold> {
  const resp = await axios.post<MetricThreshold>(`${API_URL}/metric-thresholds`, data);
  return resp.data;
}

export async function updateMetricThreshold(id: number, data: UpdateMetricThresholdPayload): Promise<MetricThreshold> {
  const resp = await axios.put<MetricThreshold>(`${API_URL}/metric-thresholds/${id}`, data);
  return resp.data;
}

export async function deleteMetricThreshold(id: number): Promise<void> {
  await axios.delete(`${API_URL}/metric-thresholds/${id}`);
}
