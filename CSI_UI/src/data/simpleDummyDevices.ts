import { Device } from '../types/device';

export const dummyDevices: Device[] = [
  {
    id: 1001,
    name: 'PDU 1 AP7921B',
    type: 'PDU',
    status: 'normal',
    siteId: 1,
    ipAddress: '192.168.1.101',
    data: { 
      temperature: 24.5,
      outletCount: 24,
      currentLoad: 8.5
    }
  },
  {
    id: 1002,
    name: 'PDU 2 AP8870',
    type: 'PDU',
    status: 'normal',
    siteId: 1,
    ipAddress: '192.168.1.102',
    data: {
      temperature: 25.1,
      outletCount: 36,
      currentLoad: 15.2
    }
  },
  {
    id: 2001,
    name: 'UPS 1 SMX3000RMHV2U',
    type: 'UPS',
    status: 'normal',
    siteId: 1,
    ipAddress: '192.168.1.103',
    data: {
      temperature: 28.3,
      capacity: 3000,
      batteryCapacity: 100
    }
  },
  {
    id: 3001,
    name: 'Switch 1 C9300-24T',
    type: 'Switch',
    status: 'normal',
    siteId: 2,
    ipAddress: '192.168.1.201',
    data: {
      temperature: 32.1,
      portCount: 24,
      activePortCount: 18
    }
  },
  {
    id: 3002,
    name: 'Switch 2 C9300-48P',
    type: 'Switch',
    status: 'normal',
    siteId: 2,
    ipAddress: '192.168.1.202',
    data: {
      temperature: 33.4,
      portCount: 48,
      activePortCount: 42
    }
  },
  {
    id: 4001,
    name: 'Server 1 RAX XS4-11E3',
    type: 'Server',
    status: 'normal',
    siteId: 1,
    ipAddress: '192.168.1.301',
    data: {
      temperature: 45.2,
      cpuCores: 16,
      ramGB: 64
    }
  },
  {
    id: 4002,
    name: 'Server 2 Z2 G9 Mini',
    type: 'Server',
    status: 'normal',
    siteId: 1,
    ipAddress: '192.168.1.302',
    data: {
      temperature: 41.8,
      cpuCores: 8,
      ramGB: 32
    }
  },
  {
    id: 4003,
    name: 'Cape Server',
    type: 'Server',
    status: 'normal',
    siteId: 3,
    ipAddress: '192.168.3.301',
    data: {
      temperature: 38.5,
      cpuCores: 24,
      ramGB: 128
    }
  },
  {
    id: 4004,
    name: 'Time Server',
    type: 'Server',
    status: 'normal',
    siteId: 2,
    ipAddress: '192.168.2.401',
    data: {
      temperature: 35.2,
      ntpServers: ['pool.ntp.org', 'time.google.com'],
      syncStatus: 'synchronized'
    }
  },
  {
    id: 5001,
    name: 'RF Matrix Switch',
    type: 'RF Equipment',
    status: 'normal',
    siteId: 3,
    ipAddress: '192.168.3.501',
    data: {
      temperature: 42.1,
      inputPorts: 32,
      outputPorts: 16
    }
  },
  {
    id: 5002,
    name: 'GNS-196-1U Signal Generator',
    type: 'RF Equipment',
    status: 'normal',
    siteId: 3,
    ipAddress: '192.168.3.502',
    data: {
      temperature: 38.9,
      frequencyRange: '100 kHz - 20 GHz',
      currentFrequency: '2.4 GHz'
    }
  },
  {
    id: 5003,
    name: 'Cape SDR System',
    type: 'RF Equipment',
    status: 'normal',
    siteId: 3,
    ipAddress: '192.168.3.503',
    data: {
      temperature: 44.3,
      channels: 16,
      activeChannels: 8
    }
  },
  {
    id: 5004,
    name: 'Spectrum Analyzer 9010B',
    type: 'Spectrum Analyzer',
    status: 'normal',
    siteId: 3,
    ipAddress: '192.168.3.601',
    data: {
      temperature: 36.7,
      frequencyRange: '9 kHz - 26.5 GHz',
      currentSpan: '1 GHz'
    }
  },
  {
    id: 6001,
    name: 'NAS Storage ME5012',
    type: 'Storage',
    status: 'normal',
    siteId: 1,
    ipAddress: '192.168.1.701',
    data: {
      temperature: 35.8,
      capacity: 48000,
      usedSpace: 32000
    }
  },
  {
    id: 7001,
    name: 'Security Camera 1',
    type: 'Camera',
    status: 'normal',
    siteId: 4,
    ipAddress: '192.168.4.801',
    data: {
      temperature: 28.5,
      resolution: '3840x2160',
      frameRate: 30
    }
  },
  {
    id: 7002,
    name: 'Security Camera 2',
    type: 'Camera',
    status: 'normal',
    siteId: 1,
    ipAddress: '192.168.1.802',
    data: {
      temperature: 29.1,
      resolution: '1920x1080',
      frameRate: 60
    }
  }
];