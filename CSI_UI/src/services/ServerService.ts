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
    cpus?: Record<
      string,
      {
        id?: string;
        utilization_percent?: number;
        current_rate_hz?: number;
        max_rate_Hz?: number;
        temperature_c?: number;
      }
    >;
    gpus?: Record<
      string,
      {
        id?: string;
        utilization_percent?: number;
        memory_total_bytes?: number;
        memory_used_bytes?: number;
        temperature_c?: number;
      }
    >;
    drives?: Record<string, { utilization_percent?: number }>;
    ram?: {
      utilization_percent?: string;
      total_bytes?: string;
      cached_bytes?: string;
    };
    nics?: Record<
      string,
      {
        mtu?: number;
        mac?: string;
        index?: number;
        administrative_status?: string;
        operational_status?: string;
        max_speed_bps?: number;
        current_speed_bps?: number;
      }
    >;
  };
  parameters?: Record<string, unknown>;
}

export async function fetchServerData(): Promise<ServerData> {
  const resp = await axios.get<ServerData>(`${BASE_API_URL}/mock/server`);
  return resp.data;
}
