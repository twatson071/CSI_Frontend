// Mock data for different device types
export const mockDeviceData = {
  PDU: {
    parameters: {
      outlets: {
        "1": { state: "POWER_ON", name: "Server 1", current_draw: 2.5 },
        "2": { state: "POWER_ON", name: "Server 2", current_draw: 2.8 },
        "3": { state: "POWER_OFF", name: "Spare", current_draw: 0 },
        "4": { state: "POWER_ON", name: "Switch 1", current_draw: 0.5 },
        "5": { state: "POWER_ON", name: "Switch 2", current_draw: 0.5 },
        "6": { state: "POWER_ON", name: "Router", current_draw: 0.3 },
        "7": { state: "POWER_OFF", name: "Spare", current_draw: 0 },
        "8": { state: "POWER_ON", name: "Storage", current_draw: 1.2 }
      },
      total_outlets: 8,
      model: "APC AP7921B",
      firmware_version: "2.1.3",
      maxCurrent: 16,
      voltageRating: 230,
      phaseType: "Single Phase",
      ratedPower: 3680
    },
    sensors: {
      total_draw_w: 1850 + Math.random() * 200 - 100,
      total_draw_a: 8.5 + Math.random() * 1 - 0.5,
      voltage: 230 + Math.random() * 5 - 2.5,
      temperature_c: 24 + Math.random() * 4 - 2,
      humidity: 45 + Math.random() * 10 - 5
    },
    status: "normal"
  },

  UPS: {
    parameters: {
      model: "APC SMX3000",
      capacity: 3000,
      batteryCapacity: 100,
      inputVoltage: 230,
      outputVoltage: 230,
      loadPercentage: 65 + Math.random() * 20,
      battery_status: "Good",
      battery_charge: 95 + Math.random() * 5,
      runtime_minutes: 42 + Math.random() * 10
    },
    sensors: {
      total_draw_w: 1950 + Math.random() * 100,
      battery_voltage: 48,
      input_frequency: 50,
      output_frequency: 50,
      temperature_c: 26 + Math.random() * 2
    },
    alarms: {
      on_battery: false,
      battery_low: false,
      overload: false,
      replace_battery: false
    },
    status: "normal"
  },

  SWITCH: {
    parameters: {
      model: "Cisco Catalyst 9300",
      firmware_version: "16.12.4",
      total_ports: 24,
      poe_capable_ports: 24,
      uptime_hours: Math.floor(Math.random() * 8760),
      mac_address: "00:1a:2b:3c:4d:5e",
      management_vlan: 1
    },
    port_status: generateSwitchPorts(24),
    statistics: {
      total_traffic_gb: Math.floor(Math.random() * 50000),
      active_ports: Math.floor(15 + Math.random() * 9),
      poe_power_used_w: Math.floor(100 + Math.random() * 300),
      cpu_usage_percent: Math.floor(10 + Math.random() * 40),
      memory_usage_percent: Math.floor(30 + Math.random() * 40),
      temperature_c: Math.floor(35 + Math.random() * 15)
    },
    status: "normal"
  },

  Server: {
    parameters: {
      cpuCores: "16",
      ramGB: "64",
      storageGB: "2000",
      cpuUsage: Math.floor(20 + Math.random() * 60),
      ramUsage: Math.floor(40 + Math.random() * 40),
      diskUsage: Math.floor(30 + Math.random() * 50)
    },
    sensors: {
      cpu_temp: Math.floor(45 + Math.random() * 20),
      system_temp: Math.floor(35 + Math.random() * 10),
      fan_speeds: [
        Math.floor(2000 + Math.random() * 1000),
        Math.floor(2000 + Math.random() * 1000),
        Math.floor(2000 + Math.random() * 1000)
      ]
    },
    processes: {
      total: Math.floor(100 + Math.random() * 200),
      running: Math.floor(50 + Math.random() * 50),
      sleeping: Math.floor(50 + Math.random() * 100)
    },
    network: {
      rx_bytes: Math.floor(Math.random() * 1000000000),
      tx_bytes: Math.floor(Math.random() * 1000000000),
      rx_packets: Math.floor(Math.random() * 10000000),
      tx_packets: Math.floor(Math.random() * 10000000)
    },
    status: "normal"
  },

  "RF Equipment": {
    parameters: {
      frequencyRange: "1-6000 MHz",
      outputPower: "+20 dBm",
      inputPorts: "32",
      outputPorts: "16",
      insertionLoss: "< 3dB",
      activeConnections: Math.floor(8 + Math.random() * 8)
    },
    measurements: {
      current_frequency_mhz: 2450 + Math.random() * 100,
      current_power_dbm: -30 + Math.random() * 10,
      vswr: 1.2 + Math.random() * 0.3,
      return_loss_db: -20 + Math.random() * 5
    },
    status: "normal"
  },

  RF_FIBER: {
    parameters: {
      model: "Opticomm OTS-2x2",
      channels: 2,
      frequency_range: "50 MHz - 3 GHz",
      optical_wavelength: "1550 nm",
      link_distance: "up to 40 km"
    },
    channel_status: {
      channel_1: {
        input_power_dbm: -15 + Math.random() * 5,
        output_power_dbm: 2 + Math.random() * 2,
        optical_power_mw: 3.2 + Math.random() * 0.5,
        link_status: "active",
        ber: "< 10^-12",
        rf_gain_db: 12,
        optical_loss_db: 0.5 + Math.random() * 0.3
      },
      channel_2: {
        input_power_dbm: -18 + Math.random() * 5,
        output_power_dbm: 1 + Math.random() * 2,
        optical_power_mw: 2.8 + Math.random() * 0.5,
        link_status: "active",
        ber: "< 10^-12",
        rf_gain_db: 12,
        optical_loss_db: 0.7 + Math.random() * 0.3
      }
    },
    alarms: {
      temperature: false,
      input_loss: false,
      laser_fault: false,
      optical_loss: false
    },
    status: "normal"
  },

  SPECTRUM: {
    parameters: {
      model: "Keysight N9030B",
      frequency_range: "3 Hz - 50 GHz",
      resolution_bandwidth: "1 Hz - 8 MHz",
      dynamic_range: "165 dB",
      phase_noise: "< -110 dBc/Hz"
    },
    current_measurement: {
      center_frequency_mhz: 2450,
      span_mhz: 100,
      rbw_khz: 100,
      vbw_khz: 100,
      reference_level_dbm: 0,
      peak_power_dbm: -35 + Math.random() * 10,
      noise_floor_dbm: -95,
      marker_frequency_mhz: 2442,
      marker_amplitude_dbm: -35 + Math.random() * 5
    },
    sweep_status: {
      sweep_time_ms: 250,
      sweep_count: Math.floor(Math.random() * 10000),
      averaging: true,
      trace_mode: "max_hold",
      detector: "peak"
    },
    traces: {
      trace1: "max_hold",
      trace2: "average",
      trace3: "min_hold"
    },
    status: "normal"
  },

  Storage: {
    parameters: {
      capacity: "48000",
      usedSpace: Math.floor(20000 + Math.random() * 20000),
      availableSpace: 0, // Will be calculated
      raidLevel: "RAID 6",
      diskCount: "24"
    },
    disks: generateDiskStatus(24),
    performance: {
      read_iops: Math.floor(5000 + Math.random() * 5000),
      write_iops: Math.floor(3000 + Math.random() * 3000),
      read_mbps: Math.floor(500 + Math.random() * 500),
      write_mbps: Math.floor(300 + Math.random() * 300),
      latency_ms: 1 + Math.random() * 3
    },
    status: "normal"
  },

  Camera: {
    parameters: {
      resolution: "3840x2160",
      frameRate: "30",
      compressionFormat: "H.265",
      nightVision: "true",
      motionDetection: "true",
      ptzCapable: Math.random() > 0.5 ? "true" : "false",
      zoomRange: "20X"
    },
    stream_status: {
      bitrate_mbps: 8 + Math.random() * 4,
      frames_dropped: Math.floor(Math.random() * 10),
      uptime_hours: Math.floor(Math.random() * 720),
      recording: true,
      motion_detected: Math.random() > 0.8
    },
    sensors: {
      temperature_c: 35 + Math.random() * 10,
      ir_led_status: "active",
      lens_status: "clean"
    },
    status: "normal"
  }
};

// Helper function to generate switch port status
function generateSwitchPorts(count: number) {
  const ports: any = {};
  const vlans = [1, 10, 20, 30, 40, 50, 100, 999];
  const devices = ["Workstation", "Access Point", "IP Phone", "Camera", "Server", "Printer", "IoT Device"];

  for (let i = 1; i <= count; i++) {
    const connected = Math.random() > 0.3;
    ports[`port_${i}`] = {
      status: connected ? "connected" : "disconnected",
      speed: connected ? (Math.random() > 0.5 ? "1000Mbps" : "100Mbps") : "auto",
      vlan: i === count ? "trunk" : vlans[Math.floor(Math.random() * vlans.length)],
      power_over_ethernet: connected && Math.random() > 0.5 ? "active" : "inactive",
      device: connected ? `${devices[Math.floor(Math.random() * devices.length)]} ${Math.floor(Math.random() * 10)}` : undefined
    };
  }

  return ports;
}

// Helper function to generate disk status
function generateDiskStatus(count: number) {
  const disks = [];
  for (let i = 0; i < count; i++) {
    disks.push({
      id: i,
      status: Math.random() > 0.95 ? "warning" : "healthy",
      temperature_c: 35 + Math.random() * 15,
      power_on_hours: Math.floor(Math.random() * 50000),
      capacity_gb: 2000,
      smart_status: "passed"
    });
  }
  return disks;
}

// Function to get mock data for a specific device
export function getMockDataForDevice(deviceType: string): any {
  const baseData = mockDeviceData[deviceType as keyof typeof mockDeviceData] || mockDeviceData.Server;

  // Deep clone and add some randomization
  const data = JSON.parse(JSON.stringify(baseData));

  // Update calculated fields
  if (deviceType === "Storage" && data.parameters) {
    data.parameters.availableSpace = data.parameters.capacity - data.parameters.usedSpace;
  }

  return data;
}