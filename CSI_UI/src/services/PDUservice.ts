import axios from "axios";
const BASE_URL = import.meta.env.VITE_BASE_URL;

export interface PDUData {
  deviceId: number;
  name: string;
  status: number;
  make?: string;
  model?: string;
  label?: string;
  numOfOutlets?: number;
  outlets?: Record<string, { state?: string }>;
  totalDrawWatts?: string;
  totalDrawAmps?: string;
  ratingAmps?: number;
  loadState?: string;
}

export const fetchPDUData = async (): Promise<PDUData[]> => {
  const response = await axios.get<PDUData[]>("/api/pdu-data");
  return response.data;
};

export const toggleOutletPower = async (
  serviceUrl: string,
  outletId: number,
  powerState: "POWER_ON" | "POWER_OFF"
): Promise<void> => {
  try {
    const payload = {
      parameters: {
        outlets: {
          [outletId]: { state: powerState },
        },
      },
    };
    const resp = await axios.post(`${BASE_URL}/service/${serviceUrl}`, payload);
    if (resp.status !== 200) {
      console.error(`Toggle failed for ${serviceUrl}: status ${resp.status}`);
    }
  } catch (err) {
    console.error(`Error toggling outlet ${outletId} for ${serviceUrl}:`, err);
  }
};
