import axios from "axios";
import { authClient } from "../lib/auth-client";

const BASE_URL = import.meta.env.VITE_BASE_URL;

// Helper function to get current user ID
async function getUserId(): Promise<string> {
  try {
    const session = await authClient.getSession();
    if (session?.user?.id) {
      return String(session.user.id);
    }
  } catch (error) {
    console.warn("Could not get user session:", error);
  }
  // Default to 1 for local development
  return "1";
}

export interface DeviceResponse {
  deviceId: number;
  name: string;
  status: string;
  data: Record<string, unknown>;
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
  const userId = await getUserId();
  const resp = await axios.post<SiteSummary>(`${BASE_URL}/sites`, siteData, {
    headers: {
      "x-user-id": userId,
    },
  });
  return resp.data;
}

export async function fetchSiteSummaries(): Promise<SiteSummary[]> {
  const userId = await getUserId();
  const resp = await axios.get<SiteSummary[]>(`${BASE_URL}/sites`, {
    headers: {
      "x-user-id": userId,
    },
  });
  return resp.data;
}

// Fetches devices for a specific site ID
export async function fetchDevicesForSite(
  siteId: number
): Promise<DeviceResponse[]> {
  const userId = await getUserId();
  const resp = await axios.get<DeviceResponse[]>(
    `${BASE_URL}/sites/${siteId}/devices`,
    {
      headers: {
        "x-user-id": userId,
      },
    }
  );
  return resp.data;
}

export async function updateSite(siteId: number, data: SiteCreateData): Promise<SiteSummary> {
  const userId = await getUserId();
  const resp = await axios.put<SiteSummary>(`${BASE_URL}/sites/${siteId}`, data, {
    headers: {
      "x-user-id": userId,
    },
  });
  return resp.data;
}

export async function deleteSite(siteId: number): Promise<void> {
  const userId = await getUserId();
  await axios.delete(`${BASE_URL}/sites/${siteId}`, {
    headers: {
      "x-user-id": userId,
    },
  });
}
