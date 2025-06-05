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

      console.log(
        `Polling device ID ${device.id} (${device.name}), type: ${device.type}`
      );

      // Store metrics (example for PDU)
      if (device.type === "PDU") {
        console.log(`Device ${device.id} is PDU. Checking for sensor data.`);
        if (externalData && externalData.sensors) {
          console.log(
            `Sensor data for PDU ${device.id}:`,
            externalData.sensors
          );
          const wattsValue = externalData.sensors.total_draw_w;
          const ampsValue = externalData.sensors.total_draw_a;

          console.log(
            `Raw PDU metrics - Watts: ${wattsValue}, Amps: ${ampsValue}`
          );

          if (wattsValue !== undefined) {
            await db.insert(metrics).values({
              deviceId: device.id,
              metricType: "watts",
              value: Number(wattsValue) || 0,
              createdAt: new Date().toISOString(),
            });
            console.log(
              `Stored watts metric for PDU ${device.id}: ${
                Number(wattsValue) || 0
              }`
            );
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
            console.log(
              `Stored amps metric for PDU ${device.id}: ${
                Number(ampsValue) || 0
              }`
            );
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

      // Generate alerts if status changed or error detected
      if (
        externalData &&
        externalData.status &&
        device.status !== externalData.status
      ) {
        console.log(
          `Status change for device ${device.id}: ${device.status} -> ${externalData.status}`
        );
        await db.insert(alerts).values({
          type: "status_change",
          message: `Device ${device.name} status changed from ${device.status} to ${externalData.status}`,
          severity: "caution",
          deviceId: device.id,
          siteId: device.siteId,
          createdAt: new Date(), // Explicitly set createdAt
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
        console.log(
          `Updated status for device ${device.id} to ${externalData.status}`
        );
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
