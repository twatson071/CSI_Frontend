import { db } from "../db";
import { devices, metrics, alerts } from "../db/schema";

async function pollDevicesAndStore() {
  const allDevices = await db.query.devices.findMany();
  for (const device of allDevices) {
    try {
      const externalData = await fetchExternalDeviceDetails(device.serviceUrl);
      // Store metrics (example for PDU)
      if (device.type === "PDU" && externalData.sensors) {
        await db.insert(metrics).values({
          deviceId: device.id,
          metricType: "watts",
          value: Number(externalData.sensors.total_draw_w) || 0,
        });
        await db.insert(metrics).values({
          deviceId: device.id,
          metricType: "amps",
          value: Number(externalData.sensors.total_draw_a) || 0,
        });
      }
      // Generate alerts if status changed or error detected
      if (device.status !== externalData.status) {
        await db.insert(alerts).values({
          type: "status_change",
          message: `Device ${device.name} status changed from ${device.status} to ${externalData.status}`,
          severity: "caution",
          deviceId: device.id,
          siteId: device.siteId,
        });
      }
      // Update device status in DB
      await db
        .update(devices)
        .set({ status: externalData.status })
        .where(eq(devices.id, device.id));
    } catch (err) {
      console.error(`Error polling device ${device.id}:`, err);
    }
  }
}
