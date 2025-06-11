import { Hono } from "hono";

const baseServerData = {
  device: {
    label: "",
    comms: {
      ip: "0.0.0.0",
      read_community: "public",
      write_community: "private",
      snmp_version: 1,
      network_port: null,
      driver: null,
    },
    make: "Linux mitre-dayton-server-0x02 6.11.0-17-generic #17~24.04.2-Ubuntu SMP PREEMPT_DYNAMIC Mon Jan 20 22:48:29 UTC 2 x86_64",
  },
  sensors: {
    cpus: {
      "196608": {
        index: 196608,
        unique_id: "1c9e234d-3ecd-4f7d-8ccf-44d8d8f9f786",
        utilization_percent: 0.85,
        current_rate_hz: 14000000.0,
        max_rate_Hz: 1700000000.0,
        temperature_c: 24.0,
      },
      "196609": {
        index: 196609,
        unique_id: "ec0b600e-ae81-4bf0-8fa8-9f570e1aae76",
        utilization_percent: 0.79,
        current_rate_hz: 13000000.0,
        max_rate_Hz: 1700000000.0,
        temperature_c: 21.0,
      },
      "196610": {
        index: 196610,
        unique_id: "757b8303-75a8-4491-bf16-d5fc3d66798b",
        utilization_percent: 0.74,
        current_rate_hz: 13000000.0,
        max_rate_Hz: 1700000000.0,
        temperature_c: 22.0,
      },
      "196611": {
        index: 196611,
        unique_id: "e1112ff6-bf59-49c5-8dcd-a135d696ee03",
        utilization_percent: 0.72,
        current_rate_hz: 12000000.0,
        max_rate_Hz: 1700000000.0,
        temperature_c: 22.0,
      },
      "196612": {
        index: 196612,
        unique_id: "1fdd057d-465e-4c3e-96ba-514f8a0c5137",
        utilization_percent: 0.71,
        current_rate_hz: 12000000.0,
        max_rate_Hz: 1700000000.0,
        temperature_c: 23.0,
      },
      "196613": {
        index: 196613,
        unique_id: "9f0e9862-d3cf-41fd-a83d-1fb66b6dae8a",
        utilization_percent: 0.71,
        current_rate_hz: 12000000.0,
        max_rate_Hz: 1700000000.0,
        temperature_c: 23.0,
      },
    },
    drives: {
      "35": {
        index: 35,
        unique_id: "014be00e-02cf-41dd-9417-c27ec97f3efd",
        max_storage_bytes: 6730985472.0,
        utilization_percent: 0.038,
      },
      "36": {
        index: 36,
        unique_id: "05f96d60-5870-4180-b4a3-54e83ff4e72b",
        max_storage_bytes: 983347249152.0,
        utilization_percent: 9.2,
      },
      "38": {
        index: 38,
        unique_id: "c84663c8-3854-4c3e-b1a9-252f102b2cbd",
        max_storage_bytes: 33654906880.0,
        utilization_percent: 0.001,
      },
      "39": {
        index: 39,
        unique_id: "5c5f3b95-223f-49c1-8831-5b8c60734b7a",
        max_storage_bytes: 5242880.0,
        utilization_percent: 0.0,
      },
      "51": {
        index: 51,
        unique_id: "865f8458-b5c4-4df1-b85e-d3b4a890ea0a",
        max_storage_bytes: 983347249152.0,
        utilization_percent: 9.2,
      },
      "58": {
        index: 58,
        unique_id: "7f5347fc-169c-49fa-b19f-1bafa23b6367",
        max_storage_bytes: 6730985472.0,
        utilization_percent: 0.038,
      },
      "75": {
        index: 75,
        unique_id: "00044adb-53e5-449e-8f6b-650361883ba7",
        max_storage_bytes: 6730981376.0,
        utilization_percent: 0.0024,
      },
    },
    nics: {
      "1": {
        index: 1,
        unique_id: "37ff6877-6dee-4758-b4ed-e44937bc968d",
        max_speed_bps: 10000000.0,
        current_speed_bps: null,
        administrative_status: "UP",
        operational_status: "UP",
        mac: "",
        mtu: 65536,
      },
      "2": {
        index: 2,
        unique_id: "661bd470-c21b-48c5-956a-11a91f6337bf",
        max_speed_bps: 1000000000.0,
        current_speed_bps: null,
        administrative_status: "UP",
        operational_status: "UP",
        mac: "3c:ec:ef:01:d8:f0",
        mtu: 1500,
      },
      "3": {
        index: 3,
        unique_id: "027a3711-9853-4faf-9fe2-8b149b0a57d0",
        max_speed_bps: 0.0,
        current_speed_bps: null,
        administrative_status: "UP",
        operational_status: "DOWN",
        mac: "3c:ec:ef:01:d8:f1",
        mtu: 1500,
      },
      "4": {
        index: 4,
        unique_id: "faa0bdc2-18c5-44b7-9c9a-b5f508380e64",
        max_speed_bps: 4294967295.0,
        current_speed_bps: null,
        administrative_status: "UP",
        operational_status: "UP",
        mac: "00:10:86:83:70:c8",
        mtu: 1500,
      },
      "5": {
        index: 5,
        unique_id: "39363733-5aed-4eab-ba0c-9afb85f93a2c",
        max_speed_bps: 4294967295.0,
        current_speed_bps: null,
        administrative_status: "UP",
        operational_status: "UP",
        mac: "00:10:86:83:70:c9",
        mtu: 1500,
      },
      "6": {
        index: 6,
        unique_id: "5ec0318f-c923-40d4-ae08-39ad729b996f",
        max_speed_bps: 4294967295.0,
        current_speed_bps: null,
        administrative_status: "UP",
        operational_status: "UP",
        mac: "62:1c:7f:6f:ef:7d",
        mtu: 1500,
      },
      "451": {
        index: 451,
        unique_id: "d780a957-f155-4bfc-af6e-15d2cfc588e1",
        max_speed_bps: 4294967295.0,
        current_speed_bps: null,
        administrative_status: "UP",
        operational_status: "UP",
        mac: "ae:b5:8f:52:07:ed",
        mtu: 1500,
      },
      "476": {
        index: 476,
        unique_id: "865b42c8-5fd1-416f-87cb-1f747224307b",
        max_speed_bps: 4294967295.0,
        current_speed_bps: null,
        administrative_status: "DOWN",
        operational_status: "DOWN",
        mac: "0e:25:87:63:61:1c",
        mtu: 1500,
      },
      "477": {
        index: 477,
        unique_id: "028f521e-8a2f-42ad-ae74-2d8158d3bf6f",
        max_speed_bps: 4294967295.0,
        current_speed_bps: null,
        administrative_status: "DOWN",
        operational_status: "DOWN",
        mac: "26:b8:dd:21:03:24",
        mtu: 1500,
      },
    },
    uptime: null,
    os_description: null,
    os_version: null,
    applications: {},
    ram: {
      utilization_percent: "98.98",
      total_bytes: "67309817856",
      cached_bytes: "60301217792",
    },
    gpus: {
      "1": {
        index: 1,
        unique_id: "gpu-nvidia-rtx4090-001",
        name: "NVIDIA GeForce RTX 4090",
        utilization_percent: 0.45,
        temperature_c: 65.0,
        memory_total_bytes: 25769803776,
        memory_used_bytes: 8589934592,
        power_draw_watts: 320.5,
        fan_speed_percent: 60.0,
      },
      "2": {
        index: 2,
        unique_id: "gpu-nvidia-rtx4080-002",
        name: "NVIDIA GeForce RTX 4080",
        utilization_percent: 0.32,
        temperature_c: 58.0,
        memory_total_bytes: 17179869184,
        memory_used_bytes: 5368709120,
        power_draw_watts: 245.2,
        fan_speed_percent: 45.0,
      },
    },
    fans: {
      "1": {
        index: 1,
        unique_id: "fan-system-001",
        current_speed_rpm: 1500,
        max_speed_rpm: 2000,
        speed_percent: 45.0,
        status: "NORMAL",
      },
      "2": {
        index: 2,
        unique_id: "fan-cpu-001",
        current_speed_rpm: 1600,
        max_speed_rpm: 2200,
        speed_percent: 60.0,
        status: "NORMAL",
      },
      "3": {
        index: 3,
        unique_id: "fan-case-front-001",
        current_speed_rpm: 1400,
        max_speed_rpm: 1800,
        speed_percent: 40.0,
        status: "NORMAL",
      },
      "4": {
        index: 4,
        unique_id: "fan-case-rear-001",
        current_speed_rpm: 1500,
        max_speed_rpm: 2000,
        speed_percent: 50.0,
        status: "NORMAL",
      },
      "5": {
        index: 5,
        unique_id: "fan-psu-001",
        current_speed_rpm: 1200,
        max_speed_rpm: 1800,
        speed_percent: 30.0,
        status: "WARNING",
      },
    },
    processes: {
      "1234": {
        pid: 1234,
        name: "systemd",
        cpu_percent: 0.1,
        memory_bytes: 8388608,
        status: "RUNNING",
        user: "root",
        command: "/lib/systemd/systemd --system --deserialize 31",
        start_time: "2025-06-05T08:00:00Z",
      },
      "5678": {
        pid: 5678,
        name: "postgres",
        cpu_percent: 2.5,
        memory_bytes: 134217728,
        status: "RUNNING",
        user: "postgres",
        command:
          "/usr/lib/postgresql/14/bin/postgres -D /var/lib/postgresql/14/main",
        start_time: "2025-06-05T08:01:30Z",
      },
      "9012": {
        pid: 9012,
        name: "nginx",
        cpu_percent: 0.8,
        memory_bytes: 33554432,
        status: "RUNNING",
        user: "www-data",
        command:
          "nginx: master process /usr/sbin/nginx -g daemon on; master_process on;",
        start_time: "2025-06-05T08:02:15Z",
      },
      "3456": {
        pid: 3456,
        name: "docker",
        cpu_percent: 1.2,
        memory_bytes: 67108864,
        status: "RUNNING",
        user: "root",
        command:
          "/usr/bin/dockerd -H fd:// --containerd=/run/containerd/containerd.sock",
        start_time: "2025-06-05T08:03:00Z",
      },
      "7890": {
        pid: 7890,
        name: "node",
        cpu_percent: 15.3,
        memory_bytes: 268435456,
        status: "RUNNING",
        user: "app",
        command: "node /app/server.js",
        start_time: "2025-06-05T09:15:22Z",
      },
    },
    peripherials: {
      "usb-001": {
        device_id: "usb-001",
        unique_id: "usb-logitech-mouse-001",
        name: "Logitech MX Master 3",
        type: "USB_MOUSE",
        vendor: "Logitech",
        product_id: "0x4082",
        vendor_id: "0x046d",
        status: "CONNECTED",
        port: "USB1",
        power_draw_watts: 0.5,
      },
      "usb-002": {
        device_id: "usb-002",
        unique_id: "usb-keyboard-001",
        name: "Mechanical Keyboard",
        type: "USB_KEYBOARD",
        vendor: "Corsair",
        product_id: "0x1b3c",
        vendor_id: "0x1b1c",
        status: "CONNECTED",
        port: "USB2",
        power_draw_watts: 0.8,
      },
      "usb-003": {
        device_id: "usb-003",
        unique_id: "usb-webcam-001",
        name: "HD Webcam C920",
        type: "USB_CAMERA",
        vendor: "Logitech",
        product_id: "0x082d",
        vendor_id: "0x046d",
        status: "CONNECTED",
        port: "USB3",
        power_draw_watts: 2.1,
      },
      "usb-004": {
        device_id: "usb-004",
        unique_id: "usb-storage-001",
        name: "External SSD",
        type: "USB_STORAGE",
        vendor: "Samsung",
        product_id: "0x6174",
        vendor_id: "0x04e8",
        status: "CONNECTED",
        port: "USB4",
        power_draw_watts: 3.2,
        capacity_bytes: 1099511627776,
      },
      "serial-001": {
        device_id: "serial-001",
        unique_id: "serial-ups-001",
        name: "UPS Monitor",
        type: "SERIAL_UPS",
        vendor: "APC",
        product_id: "0x0002",
        vendor_id: "0x051d",
        status: "CONNECTED",
        port: "COM1",
        power_draw_watts: 0.0,
      },
    },
  },
  heartbeat: { update_interval_msec: null, last_sent: null },
  log: { escalation_levels: "INFO", state: "UNKNOWN", entries: {} },
  parameters: {
    ready: "INITIALIZING",
    power_state: "SHUTDOWN",
    averaging_interval_ms: 10000,
  },
};

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function generateMockServerData() {
  const data = JSON.parse(JSON.stringify(baseServerData));

  if (data.sensors?.cpus) {
    Object.values(data.sensors.cpus).forEach((cpu: any) => {
      cpu.utilization_percent = Number(rand(5, 95).toFixed(1));
      const utilizationDecimal = cpu.utilization_percent / 100;
      cpu.current_rate_hz = Math.floor(cpu.max_rate_Hz * utilizationDecimal);

      const baseTemp = 25;
      const maxTempIncrease = 100;
      cpu.temperature_c = Number(
        (baseTemp + utilizationDecimal * maxTempIncrease).toFixed(1)
      );
    });
  }

  if (data.sensors?.drives) {
    Object.values(data.sensors.drives).forEach((drive: any) => {
      drive.utilization_percent = Number(rand(0, 80).toFixed(2));
    });
  }

  if (data.sensors?.nics) {
    Object.values(data.sensors.nics).forEach((nic: any) => {
      if (nic.max_speed_bps) {
        nic.current_speed_bps = Math.floor(rand(0, nic.max_speed_bps));
      }
    });
  }

  if (data.sensors?.ram) {
    data.sensors.ram.utilization_percent = rand(40, 99).toFixed(2);
  }

  if (data.sensors?.gpus) {
    Object.values(data.sensors.gpus).forEach((gpu: any) => {
      gpu.utilization_percent = Number(rand(0.3, 0.9).toFixed(2));
      gpu.temperature_c = Number(rand(30, 80).toFixed(1));
    });
  }

  if (data.sensors?.fans) {
    Object.values(data.sensors.fans).forEach((fan: any) => {
      fan.speed_percent = Number(rand(20, 80).toFixed(1));
      // Randomly assign status with higher probability for NORMAL
      const statusRandom = Math.random();
      if (statusRandom < 0.8) {
        fan.status = "NORMAL";
      } else if (statusRandom < 0.95) {
        fan.status = "WARNING";
      } else {
        fan.status = "CRITICAL";
      }
    });
  }

  if (data.sensors?.processes) {
    Object.values(data.sensors.processes).forEach((process: any) => {
      process.cpu_percent = Number(rand(0.1, 25).toFixed(1));
      process.memory_bytes = Math.floor(rand(10, 512) * 1024 * 1024);
      process.status = Math.random() < 0.9 ? "RUNNING" : "STOPPED";
      process.start_time = new Date(
        Date.now() - Math.floor(rand(0, 3600) * 1000)
      ).toISOString();
    });
  }

  return data;
}

const app = new Hono();

// Simple endpoint to return randomized mock server data
app.get("/server", (c) => c.json(generateMockServerData()));

export default app;
