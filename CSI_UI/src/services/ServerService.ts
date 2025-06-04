import axios from "axios";

const BASE_API_URL = `${import.meta.env.VITE_BASE_URL}`;

export interface ServerData {
  device?: {
    label?: string;
    comms?: {
      ip?: string;
    };
    make?: string;
  };
  sensors?: {
    cpus?: Record<string, { utilization_percent?: number }>;
    drives?: Record<string, { utilization_percent?: number }>;
    ram?: {
      utilization_percent?: string;
      total_bytes?: string;
      cached_bytes?: string;
    };
  };
  parameters?: Record<string, unknown>;
}

export async function fetchServerData(): Promise<ServerData> {
  const resp = await axios.get<ServerData>(`${BASE_API_URL}/mock/server`);
  return resp.data;
}
