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
  status: string;
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

export async function deleteDevice(deviceId: number): Promise<void> {
  await axios.delete(`${API_URL}/devices/${deviceId}`);
}
