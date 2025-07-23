/**
 * Dummy Device Data
 * Comprehensive dummy data for all device types in the inventory
 */

import { Device } from '../types/device';

// Site definitions
export interface Site {
  id: string;
  name: string;
  location: string;
  description: string;
  coordinates?: { lat: number; lng: number };
}

export const dummySites: Site[] = [
  {
    id: 'site-001',
    name: 'Primary Data Center',
    location: 'Building A - Floor 3',
    description: 'Main data center hosting critical infrastructure',
    coordinates: { lat: 40.7128, lng: -74.0060 }
  },
  {
    id: 'site-002',
    name: 'Secondary Operations Center',
    location: 'Building B - Floor 2',
    description: 'Backup operations center with redundant systems',
    coordinates: { lat: 40.7580, lng: -73.9855 }
  },
  {
    id: 'site-003',
    name: 'RF Communication Hub',
    location: 'Tower Complex - East Wing',
    description: 'Radio frequency equipment and communication systems',
    coordinates: { lat: 40.7505, lng: -73.9934 }
  },
  {
    id: 'site-004',
    name: 'Security Operations Center',
    location: 'Building C - Ground Floor',
    description: 'Security monitoring and surveillance center',
    coordinates: { lat: 40.7614, lng: -73.9776 }
  }
];

// Comprehensive dummy device data
export const dummyDevices: Device[] = [
  // PDU Devices
  {
    id: 'pdu-001',
    name: 'PDU 1 AP7921B',
    type: 'PDU',
    model: 'AP7921B',
    manufacturer: 'APC',
    status: 'normal',
    lastSeen: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
    location: 'Rack A1 - Position 42U',
    siteId: 'site-001',
    ipAddress: '192.168.1.101',
    macAddress: '00:C0:B7:12:34:56',
    firmwareVersion: '6.9.4',
    serialNumber: 'ZA1234567890',
    powerDrawWatts: 0, // PDU doesn't consume power, it distributes it
    temperature: 24.5,
    configuration: {
      outletCount: 24,
      maxCurrent: 16,
      voltageRating: 230,
      phaseType: 'Single Phase',
      ratedPower: 3680,
      switchable: true,
      monitored: true,
      currentLoad: 8.5,
      loadPercentage: 53
    }
  },
  {
    id: 'pdu-002',
    name: 'PDU 2 AP8870',
    type: 'PDU',
    model: 'AP8870',
    manufacturer: 'APC',
    status: 'normal',
    lastSeen: new Date(Date.now() - 180000).toISOString(), // 3 minutes ago
    location: 'Rack A2 - Position 42U',
    siteId: 'site-001',
    ipAddress: '192.168.1.102',
    macAddress: '00:C0:B7:23:45:67',
    firmwareVersion: '6.9.4',
    serialNumber: 'ZA1234567891',
    powerDrawWatts: 0,
    temperature: 25.1,
    configuration: {
      outletCount: 36,
      maxCurrent: 32,
      voltageRating: 230,
      phaseType: 'Three Phase',
      ratedPower: 11040,
      switchable: true,
      monitored: true,
      currentLoad: 15.2,
      loadPercentage: 47
    }
  },

  // UPS Device
  {
    id: 'ups-001',
    name: 'UPS 1 SMX3000RMHV2U',
    type: 'UPS',
    model: 'SMX3000RMHV2U',
    manufacturer: 'APC',
    status: 'normal',
    lastSeen: new Date(Date.now() - 120000).toISOString(), // 2 minutes ago
    location: 'Rack A3 - Position 1-2U',
    siteId: 'site-001',
    ipAddress: '192.168.1.103',
    macAddress: '00:C0:B7:34:56:78',
    firmwareVersion: '1.6.2',
    serialNumber: 'AS1234567892',
    powerDrawWatts: 2850,
    temperature: 28.3,
    configuration: {
      capacity: 3000,
      batteryCapacity: 100,
      inputVoltage: 230,
      outputVoltage: 230,
      frequency: 50,
      batteryRuntime: 8.5,
      loadPercentage: 85,
      batteryHealth: 'Good',
      lastBatteryTest: new Date(Date.now() - 604800000).toISOString(), // 1 week ago
      nextBatteryTest: new Date(Date.now() + 2592000000).toISOString() // 1 month
    }
  },

  // Network Switches
  {
    id: 'switch-001',
    name: 'Switch 1 C9300-24T',
    type: 'Switch',
    model: 'Catalyst 9300-24T',
    manufacturer: 'Cisco',
    status: 'normal',
    lastSeen: new Date(Date.now() - 60000).toISOString(), // 1 minute ago
    location: 'Rack B1 - Position 20U',
    siteId: 'site-002',
    ipAddress: '192.168.1.201',
    macAddress: '00:1E:F7:12:34:56',
    firmwareVersion: '16.12.08',
    serialNumber: 'FDO2234567893',
    powerDrawWatts: 65,
    temperature: 32.1,
    configuration: {
      portCount: 24,
      portSpeed: '1000',
      stackable: true,
      poeEnabled: true,
      poePower: 370,
      vlanCount: 15,
      activePortCount: 18,
      managementProtocol: 'SNMP',
      uptime: 2847600 // seconds
    }
  },
  {
    id: 'switch-002',
    name: 'Switch 2 C9300-48P',
    type: 'Switch',
    model: 'Catalyst 9300-48P',
    manufacturer: 'Cisco',
    status: 'normal',
    lastSeen: new Date(Date.now() - 45000).toISOString(),
    location: 'Rack B2 - Position 20U',
    siteId: 'site-002',
    ipAddress: '192.168.1.202',
    macAddress: '00:1E:F7:23:45:67',
    firmwareVersion: '16.12.08',
    serialNumber: 'FDO2234567894',
    powerDrawWatts: 95,
    temperature: 33.4,
    configuration: {
      portCount: 48,
      portSpeed: '1000',
      stackable: true,
      poeEnabled: true,
      poePower: 740,
      vlanCount: 22,
      activePortCount: 42,
      managementProtocol: 'SNMP',
      uptime: 2847600
    }
  },

  // Server Devices
  {
    id: 'server-001',
    name: 'Server 1 RAX XS4-11E3',
    type: 'Server',
    model: 'RAX XS4-11E3',
    manufacturer: 'Generic',
    status: 'normal',
    lastSeen: new Date(Date.now() - 30000).toISOString(),
    location: 'Rack C1 - Position 10-11U',
    siteId: 'site-001',
    ipAddress: '192.168.1.301',
    macAddress: '00:50:56:12:34:56',
    firmwareVersion: '2.1.0',
    serialNumber: 'SRV1234567895',
    powerDrawWatts: 280,
    temperature: 45.2,
    configuration: {
      cpuCores: 16,
      ramGB: 64,
      storageGB: 2000,
      cpuUsage: 35,
      ramUsage: 68,
      diskUsage: 42,
      networkInterfaces: 4,
      operatingSystem: 'Ubuntu Server 22.04',
      uptime: 1234567,
      services: ['web-server', 'database', 'monitoring']
    }
  },
  {
    id: 'server-002',
    name: 'Server 2 Z2 G9 Mini',
    type: 'Server',
    model: 'Z2 G9 Mini',
    manufacturer: 'HP',
    status: 'normal',
    lastSeen: new Date(Date.now() - 25000).toISOString(),
    location: 'Rack C2 - Position 8U',
    siteId: 'site-001',
    ipAddress: '192.168.1.302',
    macAddress: '00:50:56:23:45:67',
    firmwareVersion: '3.2.1',
    serialNumber: 'HP1234567896',
    powerDrawWatts: 180,
    temperature: 41.8,
    configuration: {
      cpuCores: 8,
      ramGB: 32,
      storageGB: 1000,
      cpuUsage: 22,
      ramUsage: 45,
      diskUsage: 38,
      networkInterfaces: 2,
      operatingSystem: 'Windows Server 2022',
      uptime: 987654,
      services: ['file-server', 'backup']
    }
  },
  {
    id: 'server-003',
    name: 'Cape Server',
    type: 'Server',
    model: 'Cape Custom',
    manufacturer: 'Cape Systems',
    status: 'normal',
    lastSeen: new Date(Date.now() - 40000).toISOString(),
    location: 'Rack C3 - Position 5-8U',
    siteId: 'site-003',
    ipAddress: '192.168.3.301',
    macAddress: '00:50:56:34:56:78',
    firmwareVersion: '1.0.5',
    serialNumber: 'CAPE1234567897',
    powerDrawWatts: 320,
    temperature: 38.5,
    configuration: {
      cpuCores: 24,
      ramGB: 128,
      storageGB: 4000,
      cpuUsage: 55,
      ramUsage: 72,
      diskUsage: 28,
      networkInterfaces: 6,
      operatingSystem: 'CentOS 8',
      uptime: 2345678,
      services: ['signal-processing', 'data-analysis', 'communications']
    }
  },
  {
    id: 'server-004',
    name: 'Time Server',
    type: 'Server',
    model: 'NTP-1000',
    manufacturer: 'TimeKeeper',
    status: 'normal',
    lastSeen: new Date(Date.now() - 15000).toISOString(),
    location: 'Rack D1 - Position 1U',
    siteId: 'site-002',
    ipAddress: '192.168.2.401',
    macAddress: '00:50:56:45:67:89',
    firmwareVersion: '4.2.7',
    serialNumber: 'TIME1234567898',
    powerDrawWatts: 45,
    temperature: 35.2,
    configuration: {
      ntpServers: ['pool.ntp.org', 'time.google.com'],
      accuracy: '±1ms',
      syncStatus: 'synchronized',
      stratum: 2,
      lastSync: new Date(Date.now() - 300).toISOString(),
      clientCount: 85,
      precision: -18
    }
  },

  // RF Equipment
  {
    id: 'rf-001',
    name: 'RF Matrix Switch',
    type: 'RF Equipment',
    model: 'RF-Matrix-32x16',
    manufacturer: 'RF Systems',
    status: 'normal',
    lastSeen: new Date(Date.now() - 50000).toISOString(),
    location: 'RF Rack 1 - Position 15-18U',
    siteId: 'site-003',
    ipAddress: '192.168.3.501',
    macAddress: '00:A0:C9:12:34:56',
    firmwareVersion: '2.3.1',
    serialNumber: 'RFM1234567899',
    powerDrawWatts: 150,
    temperature: 42.1,
    configuration: {
      inputPorts: 32,
      outputPorts: 16,
      frequencyRange: '1-6000 MHz',
      insertionLoss: '< 3dB',
      isolation: '> 80dB',
      switchingSpeed: '< 10ms',
      activeConnections: 12,
      controlProtocol: 'Ethernet'
    }
  },
  {
    id: 'rf-002',
    name: 'GNS-196-1U Signal Generator',
    type: 'RF Equipment',
    model: 'GNS-196-1U',
    manufacturer: 'Signal Dynamics',
    status: 'normal',
    lastSeen: new Date(Date.now() - 35000).toISOString(),
    location: 'RF Rack 2 - Position 5U',
    siteId: 'site-003',
    ipAddress: '192.168.3.502',
    macAddress: '00:A0:C9:23:45:67',
    firmwareVersion: '1.8.2',
    serialNumber: 'GNS1234567900',
    powerDrawWatts: 85,
    temperature: 38.9,
    configuration: {
      frequencyRange: '100 kHz - 20 GHz',
      outputPower: '+20 dBm',
      phaseNoise: '< -110 dBc/Hz',
      modulation: ['AM', 'FM', 'PM', 'PSK', 'QAM'],
      outputEnabled: true,
      currentFrequency: '2.4 GHz',
      currentPower: '-10 dBm'
    }
  },
  {
    id: 'rf-003',
    name: 'Cape SDR System',
    type: 'RF Equipment',
    model: 'Cape-SDR-V3',
    manufacturer: 'Cape Systems',
    status: 'normal',
    lastSeen: new Date(Date.now() - 20000).toISOString(),
    location: 'RF Rack 3 - Position 10-15U',
    siteId: 'site-003',
    ipAddress: '192.168.3.503',
    macAddress: '00:A0:C9:34:56:78',
    firmwareVersion: '3.1.4',
    serialNumber: 'CSDR1234567901',
    powerDrawWatts: 200,
    temperature: 44.3,
    configuration: {
      channels: 16,
      bandwidth: '100 MHz',
      frequencyRange: '70 MHz - 6 GHz',
      adcBits: 14,
      sampleRate: '250 MSPS',
      activeChannels: 8,
      processingMode: 'Real-time',
      dataFormat: 'IQ'
    }
  },

  // Spectrum Analyzer
  {
    id: 'sa-001',
    name: 'Spectrum Analyzer 9010B',
    type: 'Spectrum Analyzer',
    model: '9010B',
    manufacturer: 'Keysight',
    status: 'normal',
    lastSeen: new Date(Date.now() - 70000).toISOString(),
    location: 'Test Bench 1',
    siteId: 'site-003',
    ipAddress: '192.168.3.601',
    macAddress: '00:BB:3A:12:34:56',
    firmwareVersion: '10.25.02',
    serialNumber: 'SA1234567902',
    powerDrawWatts: 120,
    temperature: 36.7,
    configuration: {
      frequencyRange: '9 kHz - 26.5 GHz',
      dynamicRange: '165 dB',
      phaseNoise: '< -110 dBc/Hz',
      sweepTime: '1 ms',
      rbw: '1 Hz - 8 MHz',
      currentSpan: '1 GHz',
      centerFrequency: '2.4 GHz',
      measurementMode: 'Swept'
    }
  },

  // Storage Device
  {
    id: 'storage-001',
    name: 'NAS Storage ME5012',
    type: 'Storage',
    model: 'ME5012',
    manufacturer: 'Dell EMC',
    status: 'normal',
    lastSeen: new Date(Date.now() - 90000).toISOString(),
    location: 'Storage Rack 1 - Position 25-36U',
    siteId: 'site-001',
    ipAddress: '192.168.1.701',
    macAddress: '00:14:22:12:34:56',
    firmwareVersion: '5.1.8',
    serialNumber: 'DELL1234567903',
    powerDrawWatts: 450,
    temperature: 35.8,
    configuration: {
      capacity: 48000, // GB
      usedSpace: 32000,
      availableSpace: 16000,
      raidLevel: 'RAID 6',
      diskCount: 24,
      diskType: 'SAS',
      diskSize: 2000,
      performanceMode: 'Balanced',
      replicationEnabled: true,
      snapshotCount: 156
    }
  },

  // Security Cameras
  {
    id: 'camera-001',
    name: 'Security Camera 1',
    type: 'Camera',
    model: 'IP-CAM-4K-001',
    manufacturer: 'SecureTech',
    status: 'normal',
    lastSeen: new Date(Date.now() - 10000).toISOString(),
    location: 'Main Entrance',
    siteId: 'site-004',
    ipAddress: '192.168.4.801',
    macAddress: '00:12:17:12:34:56',
    firmwareVersion: '2.1.3',
    serialNumber: 'CAM1234567904',
    powerDrawWatts: 12,
    temperature: 28.5,
    configuration: {
      resolution: '3840x2160',
      frameRate: 30,
      compressionFormat: 'H.265',
      nightVision: true,
      motionDetection: true,
      audioRecording: true,
      ptzCapable: false,
      recordingEnabled: true,
      streamUrl: 'rtsp://192.168.4.801:554/stream1'
    }
  },
  {
    id: 'camera-002',
    name: 'Security Camera 2',
    type: 'Camera',
    model: 'IP-CAM-PTZ-002',
    manufacturer: 'SecureTech',
    status: 'normal',
    lastSeen: new Date(Date.now() - 8000).toISOString(),
    location: 'Data Center Floor',
    siteId: 'site-001',
    ipAddress: '192.168.1.802',
    macAddress: '00:12:17:23:45:67',
    firmwareVersion: '2.1.3',
    serialNumber: 'CAM1234567905',
    powerDrawWatts: 25,
    temperature: 29.1,
    configuration: {
      resolution: '1920x1080',
      frameRate: 60,
      compressionFormat: 'H.264',
      nightVision: true,
      motionDetection: true,
      audioRecording: false,
      ptzCapable: true,
      panRange: 360,
      tiltRange: 180,
      zoomRange: '20X',
      recordingEnabled: true,
      streamUrl: 'rtsp://192.168.1.802:554/stream1'
    }
  }
];

// Helper function to get devices by site
export const getDevicesBySite = (siteId: string): Device[] => {
  return dummyDevices.filter(device => device.siteId === siteId);
};

// Helper function to get devices by type
export const getDevicesByType = (type: string): Device[] => {
  return dummyDevices.filter(device => device.type === type);
};

// Helper function to get device statistics
export const getDeviceStats = () => {
  const stats = {
    total: dummyDevices.length,
    online: dummyDevices.filter(d => d.status === 'normal' || d.status === 'online').length,
    offline: dummyDevices.filter(d => d.status === 'off' || d.status === 'offline').length,
    warning: dummyDevices.filter(d => d.status === 'caution' || d.status === 'warning').length,
    critical: dummyDevices.filter(d => d.status === 'critical' || d.status === 'error').length,
    byType: {} as Record<string, number>,
    bySite: {} as Record<string, number>
  };

  // Count by type
  dummyDevices.forEach(device => {
    stats.byType[device.type] = (stats.byType[device.type] || 0) + 1;
  });

  // Count by site
  dummyDevices.forEach(device => {
    if (device.siteId) {
      stats.bySite[device.siteId] = (stats.bySite[device.siteId] || 0) + 1;
    }
  });

  return stats;
};