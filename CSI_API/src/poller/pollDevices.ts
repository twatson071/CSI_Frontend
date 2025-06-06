import { db } from "../db";
import { devices, metrics, alerts } from "../db/schema";
import { eq } from "drizzle-orm";
import { fetchExternalDeviceDetails } from "../routes/devices/deviceRoutes";

async function pollDevicesAndStore() {
  const allDevices = await db.query.devices.findMany();
  console.log(`Polling ${allDevices.length} devices.`);
  for (const device of allDevices) {
    try {
      const externalData = await fetchExternalDeviceDetails(device.serviceUrl);

      if (device.type === "PDU") {
        if (externalData && externalData.sensors) {
          const wattsValue = externalData.sensors.total_draw_w;
          const ampsValue = externalData.sensors.total_draw_a;
          if (wattsValue !== undefined) {
            await db.insert(metrics).values({
              deviceId: device.id,
              metricType: "watts",
              value: Number(wattsValue) || 0,
              createdAt: new Date().toISOString(),
            });
          } else {
            console.log(
              `Watts data (total_draw_w) missing for PDU ${device.id}`
            );
          }

          if (ampsValue !== undefined) {
            await db.insert(metrics).values({
              deviceId: device.id, // Corrected from 'device' to 'deviceId'
              metricType: "amps",
              value: Number(ampsValue) || 0,
              createdAt: new Date().toISOString(),
            });
          } else {
            console.log(
              `Amps data (total_draw_a) missing for PDU ${device.id}`
            );
          }
        } else {
          console.log(
            `Sensor data missing in externalData for PDU ${device.id}. External data:`,
            externalData
          );
        }
      }
      if (device.type === "Server") {
        if (externalData && externalData.sensors) {
          const { cpus, ram, nics, drives, gpus } = externalData.sensors;

          // CPU metrics
          if (cpus) {
            let totalCpuUtilization = 0;
            let totalCpuTemp = 0;
            let cpuCount = 0;

            for (const cpuId in cpus) {
              const cpu = cpus[cpuId];

              // Store per-core CPU utilization
              if (cpu.utilization_percent !== undefined) {
                await db.insert(metrics).values({
                  deviceId: device.id,
                  metricType: `cpu_utilization_core_${cpuId}`,
                  value: Number(cpu.utilization_percent) || 0,
                  createdAt: new Date().toISOString(),
                });

                totalCpuUtilization += Number(cpu.utilization_percent) || 0;
                cpuCount++;
              }

              // Store per-core CPU temperature
              if (cpu.temperature_c !== undefined) {
                await db.insert(metrics).values({
                  deviceId: device.id,
                  metricType: `cpu_temperature_core_${cpuId}`,
                  value: Number(cpu.temperature_c) || 0,
                  createdAt: new Date().toISOString(),
                });

                totalCpuTemp += Number(cpu.temperature_c) || 0;
              }
            }

            if (cpuCount > 0) {
              // Store average CPU utilization (keep for backward compatibility)
              await db.insert(metrics).values({
                deviceId: device.id,
                metricType: "cpu_utilization",
                value: totalCpuUtilization / cpuCount,
                createdAt: new Date().toISOString(),
              });

              // Store average CPU temperature (keep for backward compatibility)
              await db.insert(metrics).values({
                deviceId: device.id,
                metricType: "cpu_temperature",
                value: totalCpuTemp / cpuCount,
                createdAt: new Date().toISOString(),
              });
            }
          }

          // RAM metrics
          if (ram && ram.utilization_percent !== undefined) {
            await db.insert(metrics).values({
              deviceId: device.id,
              metricType: "memory_utilization",
              value: Number(ram.utilization_percent) || 0,
              createdAt: new Date().toISOString(),
            });
          }

          // Network metrics
          if (nics) {
            let totalNetworkSpeed = 0;
            for (const nicId in nics) {
              const nic = nics[nicId];
              if (nic.current_speed_bps !== undefined) {
                totalNetworkSpeed += Number(nic.current_speed_bps) || 0;
              }
            }

            await db.insert(metrics).values({
              deviceId: device.id,
              metricType: "network_speed",
              value: totalNetworkSpeed,
              createdAt: new Date().toISOString(),
            });
          }

          // Storage metrics
          if (drives) {
            let totalStorageUtilization = 0;
            let driveCount = 0;

            for (const driveId in drives) {
              const drive = drives[driveId];
              if (drive.utilization_percent !== undefined) {
                totalStorageUtilization +=
                  Number(drive.utilization_percent) || 0;
                driveCount++;
              }
            }

            if (driveCount > 0) {
              await db.insert(metrics).values({
                deviceId: device.id,
                metricType: "storage_utilization",
                value: totalStorageUtilization / driveCount,
                createdAt: new Date().toISOString(),
              });
            }
          }

          // GPU metrics
          if (gpus) {
            let totalGpuTemp = 0;
            let gpuCount = 0;

            for (const gpuId in gpus) {
              const gpu = gpus[gpuId];
              if (gpu.temperature_c !== undefined) {
                totalGpuTemp += Number(gpu.temperature_c) || 0;
                gpuCount++;
              }
            }

            if (gpuCount > 0) {
              await db.insert(metrics).values({
                deviceId: device.id,
                metricType: "gpu_temperature",
                value: totalGpuTemp / gpuCount,
                createdAt: new Date().toISOString(),
              });
            }
          }
        } else {
          console.log(
            `Sensor data missing in externalData for Server ${device.id}. External data:`,
            externalData
          );
        }
      }
      if (
        externalData &&
        externalData.status &&
        device.status !== externalData.status
      ) {
        await db.insert(alerts).values({
          type: "status_change",
          message: `Device ${device.name} status changed from ${device.status} to ${externalData.status}`,
          severity: "caution",
          deviceId: device.id,
          siteId: device.siteId,
          createdAt: new Date(),
        });
      } else if (externalData && !externalData.status) {
        console.log(
          `External data for device ${device.id} missing status property.`
        );
      }

      // Update device status in DB
      if (externalData && externalData.status) {
        await db
          .update(devices)
          .set({ status: externalData.status, updatedAt: new Date() }) // Also update timestamp
          .where(eq(devices.id, device.id));
      }
    } catch (err) {
      console.error(`Error polling device ${device.id} (${device.name}):`, err);
      // Optionally, insert an error alert
      try {
        await db.insert(alerts).values({
          type: "polling_error",
          message: `Error polling device ${device.name} (ID: ${device.id}): ${
            (err as Error).message
          }`,
          severity: "error",
          deviceId: device.id,
          siteId: device.siteId,
          createdAt: new Date(),
        });
      } catch (alertErr) {
        console.error(
          `Failed to insert polling error alert for device ${device.id}:`,
          alertErr
        );
      }
    }
  }
  console.log("Device polling cycle complete.");
}

console.log("Initial device poll starting...");
pollDevicesAndStore().catch((err) => {
  console.error("Error during initial device poll:", err);
});

const POLLING_INTERVAL_MS = 30 * 1000; // 30 seconds
setInterval(() => {
  console.log(
    `Scheduled device poll starting (every ${
      POLLING_INTERVAL_MS / 1000
    } seconds)...`
  );
  pollDevicesAndStore().catch((err) => {
    console.error("Error during scheduled device poll:", err);
  });
}, POLLING_INTERVAL_MS);

console.log(
  `Device polling scheduled to run every ${POLLING_INTERVAL_MS / 1000} seconds.`
);
