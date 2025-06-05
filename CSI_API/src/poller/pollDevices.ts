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
          const cpuSensors = externalData.sensors.cpus;
          if (cpuSensors) {
            for (const cpuId in cpuSensors) {
              const cpu = cpuSensors[cpuId];
              if (cpu.utilization_percent !== undefined) {
                await db.insert(metrics).values({
                  deviceId: device.id,
                  metricType: "cpu_utilization",
                  value: Number(cpu.utilization_percent) || 0,
                  createdAt: new Date().toISOString(),
                });
              } else {
                console.log(
                  `CPU utilization data missing for Server ${device.id} CPU ${cpuId}`
                );
              }
            }
          } else {
            console.log(
              `CPU sensors data missing for Server ${device.id}. External data:`,
              externalData
            );
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
