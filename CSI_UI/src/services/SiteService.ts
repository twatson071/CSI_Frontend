import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export interface DeviceResponse {
  deviceId: number;
  name: string;
  status: string;
  data: any;
  type: string;
  serviceUrl: string;
}

export interface SiteCreateData {
  name: string;
  location: string;
}

export interface SiteSummary {
  siteId: number;
  siteName: string;
  location: string;
}

export interface SiteWithOptionalDevices extends SiteSummary {
  devices: DeviceResponse[];
  devicesLoaded?: boolean;
}

export async function createSite(siteData: SiteCreateData) {
  const resp = await axios.post<SiteSummary>(`${BASE_URL}/sites`, siteData);
  return resp.data;
}

export async function fetchSiteSummaries(): Promise<SiteSummary[]> {
  const resp = await axios.get<SiteSummary[]>(`${BASE_URL}/sites`);
  return resp.data;
}

// Fetches devices for a specific site ID
export async function fetchDevicesForSite(
  siteId: number
): Promise<DeviceResponse[]> {
  const resp = await axios.get<DeviceResponse[]>(
    `${BASE_URL}/sites/${siteId}/devices`
  );
  return resp.data;
}

export async function updateSite(siteId: number, data: SiteCreateData): Promise<SiteSummary> {
  const resp = await axios.put<SiteSummary>(`${BASE_URL}/sites/${siteId}`, data);
  return resp.data;
}

export async function deleteSite(siteId: number): Promise<void> {
  await axios.delete(`${BASE_URL}/sites/${siteId}`);
}
