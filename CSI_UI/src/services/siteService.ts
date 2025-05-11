import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export interface DeviceResponse {
  deviceId: number;
  name: string;
  status: number;
  data: any;
}

export interface SiteWithDevices {
  siteId: number;
  siteName: string;
  devices: DeviceResponse[];
}

export async function fetchSitesWithDevices(): Promise<SiteWithDevices[]> {
  const resp = await axios.get<SiteWithDevices[]>(`${BASE_URL}/sites`);
  return resp.data;
}
