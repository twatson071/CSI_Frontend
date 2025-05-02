import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export interface PDUData {
  make: string;
  model: string;
  statuses: string[];
}
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
export const fetchPDUData = async (): Promise<PDUData> => {
  try {
    const response = await axios.get(`${BASE_URL}/csi_tripplite_pdumh20/`);
    const { device, parameters } = response.data;

    // Extract make and model from the device object
    const make = device?.make || "Unknown";
    const model = device?.model || "Unknown";

    // Extract the number of outlets and their states
    const numOfOutlets = parameters?.num_of_outlets || 0;
    const outlets = parameters?.outlets || {};

    // Dynamically create the statuses array based on the number of outlets
    const statuses = Array.from({ length: numOfOutlets }, (_, index) => {
      const outlet = outlets[index + 1]; // Outlets are 1-indexed
      return outlet?.state === "POWER_ON" ? "normal" : "off";
    });

    return { make, model, statuses };
  } catch (error) {
    console.error("Error fetching PDU data:", error);
    return { make: "Unknown", model: "Unknown", statuses: [] }; // Fallback to default
  }
};
