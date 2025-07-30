// Device type definitions
export interface Device {
  id: number;
  name: string;
  type: string;
  status: string;
  ipAddress?: string;
  serviceUrl?: string;
  siteId?: number;
  createdAt?: string;
  updatedAt?: string;
  data?: any;
}

export type DeviceType = 'PDU' | 'UPS' | 'Server' | 'Camera' | 'Switch' | 'RF Equipment' | 'Storage';

export interface DeviceStatus {
  normal: string;
  caution: string;
  serious: string;
  critical: string;
  off: string;
  standby: string;
}