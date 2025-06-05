import axios from "axios";
import { Device, getDeviceById } from "./DeviceService";

const BASE_API_URL = `${import.meta.env.VITE_BASE_URL}`;

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

export interface PduCommandResponseItem {
  deviceId: number;
  name: string;
  status: number;
  data: any;
}

const PDU_DEVICE_TYPE_IDENTIFIER = "PDU";

export const fetchPDUData = async (): Promise<PDUData[]> => {
  const response = await axios.get<PDUData[]>(`${BASE_API_URL}/pdu-data`);
  return response.data;
};

export type OutletAction = "POWER_ON" | "POWER_OFF" | "REBOOT";

export const toggleOutletPower = async (
  device: Device,
  outletId: number | string,
  powerState: OutletAction
): Promise<PduCommandResponseItem[]> => {
  if (device.type !== PDU_DEVICE_TYPE_IDENTIFIER) {
    const errorMessage = `Device '${device.name}' (type: ${device.type}) is not a recognized PDU device. Cannot toggle outlet power. Expected type '${PDU_DEVICE_TYPE_IDENTIFIER}'.`;
    console.error(errorMessage);
    throw new Error(errorMessage);
  }

  if (!device.serviceUrl) {
    const errorMessage = `PDU Device '${device.name}' (ID: ${device.id}) is missing the required 'serviceUrl' for PDU operations.`;
    console.error(errorMessage);
    throw new Error(errorMessage);
  }

  try {
    const payload = {
      parameters: {
        outlets: {
          [outletId]: { state: powerState },
        },
      },
    };
    const response = await axios.post<PduCommandResponseItem[]>(
      `${BASE_API_URL}/pdu/${device.serviceUrl}`,
      payload
    );
    return response.data;
  } catch (err) {
    console.error(
      `Error toggling outlet ${outletId} to ${powerState} for PDU (Device ID: ${device.id}, Service URL: ${device.serviceUrl}):`,
      err
    );
    throw err;
  }
};

export interface DeviceMetricPoint {
  x: string;
  y: number;
}

export const fetchDeviceMetrics = async (
  deviceId: number,
  metricType: string,
  limit: number = 100
): Promise<DeviceMetricPoint[]> => {
  try {
    const response = await axios.get<DeviceMetricPoint[]>(
      `${BASE_API_URL}/pdu/metrics/${deviceId}`,
      {
        params: {
          metricType,
          limit,
        },
      }
    );
    return response.data;
  } catch (err) {
    console.error(
      `Error fetching metrics for device ${deviceId} (type: ${metricType}):`,
      err
    );
    throw err;
  }
};
