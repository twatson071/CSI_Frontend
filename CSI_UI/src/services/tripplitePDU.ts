import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export interface PDUData {
  make: string;
  model: string;
  label?: string;
  statuses: string[];
  totalDrawWatts?: number;
  totalDrawAmps?: number;
  ratingAmps?: number;
  loadState?: string;
  outletSensors?: Record<string, { index: string; state?: string }>;
}

export const fetchPDUData = async (): Promise<PDUData> => {
  try {
    const response = await axios.get(`${BASE_URL}/csi_tripplite_pdumh20/`);
    const { device, parameters, sensors } = response.data;

    // Extract make and model from the device object
    const make = device?.make || "Unknown";
    const model = device?.model || "Unknown";
    const label = device?.label || "Unknown";

    // Extract the number of outlets and their states
    const numOfOutlets = parameters?.num_of_outlets || 0;
    const outlets = parameters?.outlets || {};

    // Dynamically create the statuses array based on the number of outlets
    const statuses = Array.from({ length: numOfOutlets }, (_, index) => {
      const outlet = outlets[index + 1]; // Outlets are 1-indexed
      return outlet?.state === "POWER_ON" ? "normal" : "off";
    });

    // Extract sensor data
    const totalDrawWatts = parseFloat(sensors?.total_draw_w || "0");
    const totalDrawAmps = parseFloat(sensors?.total_draw_a || "0");
    const ratingAmps = sensors?.rating_a || 0;
    const loadState = sensors?.load_state || "UNKNOWN";

    // Extract outlet-specific sensors if available
    const outletSensors = sensors?.outlets || {};

    return {
      make,
      model,
      label,
      statuses,
      totalDrawWatts,
      totalDrawAmps,
      ratingAmps,
      loadState,
      outletSensors,
    };
  } catch (error) {
    console.error("Error fetching PDU data:", error);
    return {
      make: "Unknown",
      model: "Unknown",
      statuses: [],
      totalDrawWatts: 0,
      totalDrawAmps: 0,
      ratingAmps: 0,
      loadState: "UNKNOWN",
      outletSensors: {},
    }; // Fallback to default
  }
};
export const toggleOutletPower = async (
  outletId: number,
  powerState: string
): Promise<void> => {
  try {
    const payload = {
      parameters: {
        outlets: {
          [outletId]: { state: powerState },
        },
      },
    };
    const response = await axios.post(
      `${BASE_URL}/csi_tripplite_pdumh20`,
      payload
    );
    if (response.status === 200) {
      console.log(`Outlet ${outletId} power state changed to ${powerState}`);
    } else {
      console.error(`Failed to change power state for outlet ${outletId}`);
    }
  } catch (error) {
    console.error(`Error changing power state for outlet ${outletId}:`, error);
  }
};
