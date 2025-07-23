#!/usr/bin/env bun
/**
 * Mock External Service API
 * 
 * This service mocks the external third-party APIs that the CSI system depends on.
 * It runs on port 8090 and provides realistic dummy data for all device types.
 */

import { Hono } from 'hono';
import { serve } from 'bun';

const app = new Hono();

// Utility functions
function rand(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function randomChoice<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function generateTimestamp(): string {
  return new Date().toISOString();
}

// Mock data generators for different device types

// PDU Mock Data Generator
function generatePDUData() {
  const outletCount = Math.floor(rand(8, 24));
  const outlets = [];
  
  for (let i = 1; i <= outletCount; i++) {
    outlets.push({
      outlet_id: i,
      name: `Outlet ${i}`,
      state: randomChoice(['on', 'off']),
      current_amps: Number(rand(0.5, 8.5).toFixed(2)),
      voltage_volts: Number(rand(110, 125).toFixed(1)),
      power_watts: Number(rand(50, 1000).toFixed(1)),
      power_factor: Number(rand(0.85, 0.99).toFixed(2))
    });
  }

  return {
    device_info: {
      model: randomChoice(['AP7921B', 'AP8870', 'AP9630']),
      firmware_version: randomChoice(['v6.7.4', 'v6.8.1', 'v7.0.2']),
      serial_number: `PDU${Math.floor(rand(100000, 999999))}`,
      uptime_seconds: Math.floor(rand(86400, 2592000))
    },
    power_summary: {
      total_current_amps: Number(outlets.reduce((sum, o) => sum + o.current_amps, 0).toFixed(2)),
      total_power_watts: Number(outlets.reduce((sum, o) => sum + o.power_watts, 0).toFixed(1)),
      input_voltage: Number(rand(115, 125).toFixed(1)),
      frequency_hz: Number(rand(59.8, 60.2).toFixed(1))
    },
    outlets,
    environmental: {
      temperature_c: Number(rand(18, 35).toFixed(1)),
      humidity_percent: Number(rand(30, 70).toFixed(1))
    },
    status: randomChoice(['normal', 'caution']),
    last_updated: generateTimestamp()
  };
}

// UPS Mock Data Generator  
function generateUPSData() {
  const batteryCharge = Number(rand(85, 100).toFixed(1));
  const isOnBattery = Math.random() < 0.1; // 10% chance on battery
  
  return {
    device_info: {
      model: randomChoice(['SMX3000RMHV2U', 'SMT2200RM2U', 'SRT3000XLA']),
      firmware_version: randomChoice(['UPS 09.2', 'UPS 09.4', 'UPS 10.1']),
      serial_number: `UPS${Math.floor(rand(100000, 999999))}`,
      uptime_seconds: Math.floor(rand(86400, 2592000))
    },
    power_status: {
      input_voltage: isOnBattery ? 0 : Number(rand(115, 125).toFixed(1)),
      output_voltage: Number(rand(115, 125).toFixed(1)),
      output_current: Number(rand(5, 15).toFixed(2)),
      output_power_watts: Number(rand(800, 2500).toFixed(0)),
      load_percent: Number(rand(25, 85).toFixed(1)),
      frequency_hz: Number(rand(59.8, 60.2).toFixed(1))
    },
    battery_status: {
      charge_percent: batteryCharge,
      runtime_minutes: Math.floor(rand(15, 180)),
      voltage: Number(rand(48, 54).toFixed(1)),
      temperature_c: Number(rand(20, 35).toFixed(1)),
      last_test_date: new Date(Date.now() - Math.floor(rand(1, 30)) * 86400000).toISOString(),
      status: batteryCharge > 90 ? 'normal' : 'caution'
    },
    system_status: {
      on_battery: isOnBattery,
      alarm_active: Math.random() < 0.05,
      status: isOnBattery ? 'caution' : 'normal'
    },
    environmental: {
      temperature_c: Number(rand(18, 40).toFixed(1)),
      humidity_percent: Number(rand(30, 70).toFixed(1))
    },
    last_updated: generateTimestamp()
  };
}

// Network Switch Mock Data Generator
function generateSwitchData() {
  const portCount = randomChoice([24, 48]);
  const ports = [];
  
  for (let i = 1; i <= portCount; i++) {
    const isActive = Math.random() < 0.7; // 70% chance port is active
    ports.push({
      port_number: i,
      name: `Port ${i}`,
      status: isActive ? 'up' : 'down',
      speed_mbps: isActive ? randomChoice([100, 1000, 10000]) : 0,
      duplex: isActive ? 'full' : 'unknown',
      rx_bytes: isActive ? Math.floor(rand(1000000, 999999999)) : 0,
      tx_bytes: isActive ? Math.floor(rand(1000000, 999999999)) : 0,
      rx_packets: isActive ? Math.floor(rand(1000, 9999999)) : 0,
      tx_packets: isActive ? Math.floor(rand(1000, 9999999)) : 0,
      errors: Math.floor(rand(0, 10)),
      last_change: new Date(Date.now() - Math.floor(rand(0, 86400)) * 1000).toISOString()
    });
  }

  return {
    device_info: {
      model: randomChoice(['C9300-24T', 'C9300-48P', 'C2960X-48FPD-L']),
      firmware_version: randomChoice(['16.12.07', '16.12.08', '17.03.04a']),
      serial_number: `SW${Math.floor(rand(100000, 999999))}`,
      uptime_seconds: Math.floor(rand(86400, 2592000)),
      mac_address: Array.from({length: 6}, () => Math.floor(rand(0, 255)).toString(16).padStart(2, '0')).join(':')
    },
    system_stats: {
      cpu_utilization_percent: Number(rand(5, 45).toFixed(1)),
      memory_utilization_percent: Number(rand(20, 80).toFixed(1)),
      temperature_c: Number(rand(25, 55).toFixed(1)),
      fan_status: randomChoice(['normal', 'warning']),
      power_consumption_watts: Number(rand(150, 400).toFixed(1))
    },
    network_stats: {
      total_ports: portCount,
      active_ports: ports.filter(p => p.status === 'up').length,
      total_rx_bytes: ports.reduce((sum, p) => sum + p.rx_bytes, 0),
      total_tx_bytes: ports.reduce((sum, p) => sum + p.tx_bytes, 0)
    },
    ports,
    vlans: [
      { vlan_id: 1, name: 'default', ports: [1, 2, 3, 4, 5] },
      { vlan_id: 100, name: 'servers', ports: [10, 11, 12] },
      { vlan_id: 200, name: 'workstations', ports: [13, 14, 15, 16] }
    ],
    status: randomChoice(['normal', 'caution']),
    last_updated: generateTimestamp()
  };
}

// RF Equipment Mock Data Generator
function generateRFEquipmentData() {
  return {
    device_info: {
      model: randomChoice(['GNS-196-1U', 'Cape SDR System', 'RF Matrix Switch']),
      firmware_version: randomChoice(['v2.1.4', 'v3.0.1', 'v1.8.2']),
      serial_number: `RF${Math.floor(rand(100000, 999999))}`,
      uptime_seconds: Math.floor(rand(86400, 2592000))
    },
    rf_parameters: {
      frequency_mhz: Number(rand(100, 6000).toFixed(2)),
      power_dbm: Number(rand(-20, 30).toFixed(1)),
      gain_db: Number(rand(0, 40).toFixed(1)),
      noise_figure_db: Number(rand(1, 8).toFixed(2)),
      temperature_c: Number(rand(25, 65).toFixed(1))
    },
    channels: Array.from({length: rand(4, 16)}, (_, i) => ({
      channel_id: i + 1,
      frequency_mhz: Number(rand(100, 6000).toFixed(2)),
      power_dbm: Number(rand(-10, 20).toFixed(1)),
      status: randomChoice(['active', 'inactive', 'error']),
      snr_db: Number(rand(10, 40).toFixed(1))
    })),
    system_status: {
      lock_status: randomChoice(['locked', 'unlocked']),
      reference_source: randomChoice(['internal', 'external', 'gps']),
      alarm_status: Math.random() < 0.1 ? 'alarm' : 'normal'
    },
    status: randomChoice(['normal', 'caution']),
    last_updated: generateTimestamp()
  };
}

// RF to Fiber Converter Mock Data Generator
function generateRFToFiberData() {
  return {
    device_info: {
      model: 'RF to Fiber Converter',
      firmware_version: randomChoice(['v1.2.3', 'v1.3.1', 'v1.4.0']),
      serial_number: `RFC${Math.floor(rand(100000, 999999))}`,
      uptime_seconds: Math.floor(rand(86400, 2592000))
    },
    optical_parameters: {
      optical_power_dbm: Number(rand(-15, 5).toFixed(2)),
      wavelength_nm: randomChoice([1310, 1550]),
      fiber_type: randomChoice(['single_mode', 'multi_mode']),
      link_status: randomChoice(['up', 'down']),
      ber: Number((Math.random() * 1e-9).toExponential(2))
    },
    rf_parameters: {
      rf_frequency_mhz: Number(rand(100, 6000).toFixed(2)),
      rf_power_dbm: Number(rand(-10, 20).toFixed(1)),
      gain_db: Number(rand(0, 30).toFixed(1)),
      noise_figure_db: Number(rand(2, 10).toFixed(2))
    },
    environmental: {
      temperature_c: Number(rand(20, 50).toFixed(1)),
      humidity_percent: Number(rand(30, 70).toFixed(1))
    },
    alarms: [],
    status: randomChoice(['normal', 'caution']),
    last_updated: generateTimestamp()
  };
}

// Spectrum Analyzer Mock Data Generator
function generateSpectrumAnalyzerData() {
  const sweepPoints = 401;
  const startFreq = 1000; // MHz
  const stopFreq = 6000; // MHz
  const span = stopFreq - startFreq;
  
  const spectrum = Array.from({length: sweepPoints}, (_, i) => {
    const freq = startFreq + (i / (sweepPoints - 1)) * span;
    // Generate realistic spectrum with some peaks
    let amplitude = -80 + Math.random() * 10; // Base noise floor
    
    // Add some signal peaks
    if (Math.random() < 0.05) {
      amplitude += rand(20, 60);
    }
    
    return {
      frequency_mhz: Number(freq.toFixed(2)),
      amplitude_dbm: Number(amplitude.toFixed(1))
    };
  });

  return {
    device_info: {
      model: randomChoice(['9010B', 'E4407B', 'FSW-43']),
      firmware_version: randomChoice(['v2.1.0', 'v2.2.1', 'v3.0.0']),
      serial_number: `SA${Math.floor(rand(100000, 999999))}`,
      uptime_seconds: Math.floor(rand(86400, 2592000))
    },
    measurement_settings: {
      start_frequency_mhz: startFreq,
      stop_frequency_mhz: stopFreq,
      resolution_bandwidth_hz: randomChoice([1000, 3000, 10000, 30000]),
      video_bandwidth_hz: randomChoice([1000, 3000, 10000, 30000]),
      sweep_time_ms: Number(rand(100, 5000).toFixed(0)),
      reference_level_dbm: randomChoice([0, -10, -20, -30])
    },
    spectrum_data: spectrum,
    peak_analysis: {
      peak_frequency_mhz: Number(rand(startFreq, stopFreq).toFixed(2)),
      peak_amplitude_dbm: Number(rand(-40, 10).toFixed(1)),
      noise_floor_dbm: Number(rand(-85, -75).toFixed(1))
    },
    system_status: {
      calibration_status: randomChoice(['calibrated', 'needs_cal']),
      temperature_c: Number(rand(25, 45).toFixed(1)),
      internal_reference: randomChoice(['locked', 'unlocked'])
    },
    status: randomChoice(['normal', 'caution']),
    last_updated: generateTimestamp()
  };
}

// Storage/NAS Mock Data Generator
function generateStorageData() {
  const diskCount = Math.floor(rand(4, 12));
  const disks = Array.from({length: diskCount}, (_, i) => {
    const capacity = randomChoice([1, 2, 4, 8, 16]) * 1024 * 1024 * 1024 * 1024; // TB in bytes
    const used = Math.floor(capacity * rand(0.1, 0.8));
    
    return {
      disk_id: i + 1,
      model: randomChoice(['WD Red Pro', 'Seagate IronWolf', 'Samsung 980 Pro']),
      serial_number: `DSK${Math.floor(rand(100000, 999999))}`,
      capacity_bytes: capacity,
      used_bytes: used,
      free_bytes: capacity - used,
      health_status: randomChoice(['healthy', 'warning', 'critical']),
      temperature_c: Number(rand(25, 45).toFixed(1)),
      hours_powered: Math.floor(rand(1000, 50000)),
      read_errors: Math.floor(rand(0, 5)),
      write_errors: Math.floor(rand(0, 3))
    };
  });

  const volumes = [
    {
      volume_id: 'vol1',
      name: 'System',
      raid_level: 'RAID1',
      capacity_bytes: Math.floor(disks.reduce((sum, d) => sum + d.capacity_bytes, 0) * 0.3),
      used_bytes: Math.floor(disks.reduce((sum, d) => sum + d.used_bytes, 0) * 0.3),
      status: randomChoice(['healthy', 'degraded']),
      disk_members: [1, 2]
    },
    {
      volume_id: 'vol2', 
      name: 'Data',
      raid_level: 'RAID5',
      capacity_bytes: Math.floor(disks.reduce((sum, d) => sum + d.capacity_bytes, 0) * 0.7),
      used_bytes: Math.floor(disks.reduce((sum, d) => sum + d.used_bytes, 0) * 0.7),
      status: 'healthy',
      disk_members: [3, 4, 5, 6]
    }
  ];

  return {
    device_info: {
      model: randomChoice(['ME5012', 'DS920+', 'ReadyNAS 4312S']),
      firmware_version: randomChoice(['v7.1.1', 'v7.2.0', 'v8.0.1']),
      serial_number: `NAS${Math.floor(rand(100000, 999999))}`,
      uptime_seconds: Math.floor(rand(86400, 2592000))
    },
    storage_summary: {
      total_capacity_bytes: disks.reduce((sum, d) => sum + d.capacity_bytes, 0),
      total_used_bytes: disks.reduce((sum, d) => sum + d.used_bytes, 0),
      total_free_bytes: disks.reduce((sum, d) => sum + d.free_bytes, 0),
      disk_count: diskCount,
      volume_count: volumes.length
    },
    disks,
    volumes,
    performance: {
      read_iops: Math.floor(rand(100, 5000)),
      write_iops: Math.floor(rand(50, 2000)),
      read_throughput_mbps: Number(rand(50, 500).toFixed(1)),
      write_throughput_mbps: Number(rand(25, 250).toFixed(1)),
      queue_depth: Math.floor(rand(1, 32))
    },
    network_shares: [
      {
        share_name: 'Public',
        protocol: 'SMB',
        path: '/volume1/Public',
        access_rights: 'read_write',
        connected_users: Math.floor(rand(0, 10))
      },
      {
        share_name: 'Backup',
        protocol: 'NFS',
        path: '/volume2/Backup',
        access_rights: 'read_only',
        connected_users: Math.floor(rand(0, 5))
      }
    ],
    system_status: {
      cpu_usage_percent: Number(rand(5, 35).toFixed(1)),
      memory_usage_percent: Number(rand(20, 80).toFixed(1)),
      temperature_c: Number(rand(30, 55).toFixed(1)),
      fan_speed_rpm: Math.floor(rand(800, 2000))
    },
    status: randomChoice(['normal', 'caution']),
    last_updated: generateTimestamp()
  };
}

// Camera Mock Data Generator
function generateCameraData() {
  return {
    device_info: {
      model: randomChoice(['DS-2CD2185FWD-I', 'AXIS M3007-PV', 'Dahua IPC-HFW4431R-Z']),
      firmware_version: randomChoice(['v5.6.0', 'v5.7.1', 'v6.0.2']),
      serial_number: `CAM${Math.floor(rand(100000, 999999))}`,
      uptime_seconds: Math.floor(rand(86400, 2592000)),
      mac_address: Array.from({length: 6}, () => Math.floor(rand(0, 255)).toString(16).padStart(2, '0')).join(':')
    },
    video_settings: {
      resolution: randomChoice(['1920x1080', '2592x1944', '3840x2160']),
      frame_rate: randomChoice([15, 25, 30]),
      bitrate_kbps: Math.floor(rand(2000, 8000)),
      codec: randomChoice(['H.264', 'H.265']),
      stream_status: randomChoice(['active', 'inactive'])
    },
    rtsp_streams: [
      {
        stream_id: 1,
        name: 'Main Stream',
        url: 'rtsp://192.168.1.802:554/stream1',
        resolution: '1920x1080',
        bitrate_kbps: Math.floor(rand(4000, 8000)),
        status: 'active'
      },
      {
        stream_id: 2,
        name: 'Sub Stream',
        url: 'rtsp://192.168.1.802:554/stream2',
        resolution: '704x576',
        bitrate_kbps: Math.floor(rand(500, 1500)),
        status: 'active'
      }
    ],
    image_settings: {
      brightness: Math.floor(rand(40, 60)),
      contrast: Math.floor(rand(40, 60)),
      saturation: Math.floor(rand(40, 60)),
      sharpness: Math.floor(rand(40, 60)),
      white_balance: randomChoice(['auto', 'daylight', 'fluorescent'])
    },
    ptz_capabilities: {
      pan_range_degrees: 360,
      tilt_range_degrees: 90,
      zoom_range: '1x-32x',
      preset_positions: Math.floor(rand(4, 20))
    },
    motion_detection: {
      enabled: Math.random() < 0.8,
      sensitivity: Math.floor(rand(1, 10)),
      detection_zones: Math.floor(rand(1, 4)),
      current_motion: Math.random() < 0.1
    },
    environmental: {
      temperature_c: Number(rand(-10, 50).toFixed(1)),
      humidity_percent: Number(rand(20, 90).toFixed(1))
    },
    network_status: {
      ip_address: `192.168.1.${Math.floor(rand(800, 899))}`,
      gateway: '192.168.1.1',
      dns_primary: '8.8.8.8',
      connection_status: randomChoice(['connected', 'disconnected'])
    },
    storage: {
      sd_card_present: Math.random() < 0.6,
      sd_card_capacity_gb: Math.random() < 0.6 ? randomChoice([32, 64, 128, 256]) : null,
      sd_card_used_percent: Math.random() < 0.6 ? Number(rand(10, 90).toFixed(1)) : null,
      recording_status: Math.random() < 0.5 ? 'recording' : 'stopped'
    },
    status: randomChoice(['normal', 'caution']),
    last_updated: generateTimestamp()
  };
}

// Server data (reuse existing mock)
function generateServerData() {
  // Use the existing server mock data from mockRoutes.ts
  const baseServerData = {
    device: {
      label: "Mock Server",
      comms: {
        ip: "192.168.1.301",
        read_community: "public",
        write_community: "private",
        snmp_version: 1,
        network_port: null,
        driver: null,
      },
      make: "Linux server 6.11.0-17-generic x86_64",
    },
    sensors: {
      cpus: {
        "196608": {
          index: 196608,
          unique_id: "cpu-001",
          utilization_percent: Number(rand(5, 95).toFixed(1)),
          current_rate_hz: 1400000000.0,
          max_rate_Hz: 1700000000.0,
          temperature_c: Number(rand(25, 85).toFixed(1)),
        }
      },
      ram: {
        utilization_percent: rand(40, 99).toFixed(2),
        total_bytes: "67309817856",
        cached_bytes: "60301217792",
      },
    },
    parameters: {
      ready: "READY",
      power_state: "ONLINE",
      averaging_interval_ms: 10000,
    },
    status: randomChoice(['normal', 'caution']),
    last_updated: generateTimestamp()
  };
  
  return baseServerData;
}

// Route handlers for different service types
app.get('/service/*', (c) => {
  const fullUrl = c.req.url;
  const serviceUrl = fullUrl.split('/service/')[1] || '';
  console.log(`Mock service request for: ${serviceUrl}`);
  
  try {
    // Determine device type based on service URL patterns
    if (serviceUrl.includes('/snmp') && (serviceUrl.includes('101') || serviceUrl.includes('102'))) {
      // PDU devices
      return c.json(generatePDUData());
    } else if (serviceUrl.includes('/snmp') && serviceUrl.includes('103')) {
      // UPS devices  
      return c.json(generateUPSData());
    } else if (serviceUrl.includes('/snmp') && (serviceUrl.includes('201') || serviceUrl.includes('202'))) {
      // Network Switch devices
      return c.json(generateSwitchData());
    } else if (serviceUrl.includes('/api') && (serviceUrl.includes('301') || serviceUrl.includes('302') || serviceUrl.includes('401'))) {
      // Server devices
      return c.json(generateServerData());
    } else if (serviceUrl.includes('/api') && (serviceUrl.includes('501') || serviceUrl.includes('503'))) {
      // RF Equipment
      return c.json(generateRFEquipmentData());
    } else if (serviceUrl.includes('/api') && (serviceUrl.includes('601') || serviceUrl.includes('602'))) {
      // RF to Fiber converters
      return c.json(generateRFToFiberData());
    } else if (serviceUrl.includes('/scpi')) {
      // SCPI devices (Spectrum Analyzers, RF Equipment)
      if (serviceUrl.includes('701')) {
        return c.json(generateSpectrumAnalyzerData());
      } else {
        return c.json(generateRFEquipmentData());
      }
    } else if (serviceUrl.includes('/api') && serviceUrl.includes('701')) {
      // Storage/NAS devices
      return c.json(generateStorageData());
    } else if (serviceUrl.startsWith('rtsp://')) {
      // Camera devices
      return c.json(generateCameraData());
    } else if (serviceUrl.includes('/ntp')) {
      // NTP Time servers
      return c.json({
        device_info: {
          model: 'NTP Time Server',
          version: 'ntpd 4.2.8',
          uptime_seconds: Math.floor(rand(86400, 2592000))
        },
        time_sync: {
          current_time: generateTimestamp(),
          stratum: randomChoice([1, 2, 3]),
          reference_clock: randomChoice(['GPS', 'ATOMIC', 'INTERNET']),
          offset_ms: Number(rand(-5, 5).toFixed(3)),
          jitter_ms: Number(rand(0.1, 2.0).toFixed(3)),
          sync_status: randomChoice(['synchronized', 'unsynchronized'])
        },
        status: 'normal',
        last_updated: generateTimestamp()
      });
    } else {
      // Generic fallback
      return c.json({
        device_info: {
          model: 'Unknown Device',
          status: 'unknown',
          message: `Mock data for service: ${serviceUrl}`
        },
        status: 'normal',
        last_updated: generateTimestamp()
      });
    }
  } catch (error) {
    console.error(`Error generating mock data for ${serviceUrl}:`, error);
    return c.json({ error: 'Mock service error', service_url: serviceUrl }, 500);
  }
});

// Health check endpoint
app.get('/health', (c) => {
  return c.json({ 
    status: 'healthy', 
    service: 'mock-external-service',
    timestamp: generateTimestamp()
  });
});

// Start the mock service
const port = 8091;
console.log(`🚀 Mock External Service starting on port ${port}`);
console.log(`📡 Ready to serve mock data for CSI device polling`);

serve({
  fetch: app.fetch,
  port: port,
});