import { db } from "../db";
import {
  devices,
  metrics,
  alerts,
  metricThresholds,
  sites,
} from "../db/schema";
import { eq, and } from "drizzle-orm";
import { fetchExternalDeviceDetails } from "../routes/devices/deviceRoutes";
import {
  broadcastCriticalAlert,
  broadcastAlert,
  type AlertNotification,
} from "../services/alertNotificationService";

// Add threshold evaluation function
async function evaluateThresholds(
  deviceId: number,
  metricType: string,
  value: number,
  metricId: number
) {
  // Get active thresholds for this device and metric type
  const thresholds = await db.query.metricThresholds.findMany({
    where: and(
      eq(metricThresholds.deviceId, deviceId),
      eq(metricThresholds.metricType, metricType),
      eq(metricThresholds.isActive, 1)
    ),
  });

  for (const threshold of thresholds) {
    const { criticalThreshold, seriousThreshold, cautionThreshold, operator } =
      threshold;

    // Check critical threshold first (highest priority)
    if (criticalThreshold !== null && criticalThreshold !== undefined) {
      let exceedsCritical = false;

      switch (operator) {
        case "greater_than":
          exceedsCritical = value > criticalThreshold;
          break;
        case "less_than":
          exceedsCritical = value < criticalThreshold;
          break;
        case "equals":
          exceedsCritical = value === criticalThreshold;
          break;
        default:
          exceedsCritical = value > criticalThreshold;
      }

      if (exceedsCritical) {
        // Check if we already have a recent critical alert for this metric to avoid spam
        const recentAlert = await db.query.alerts.findFirst({
          where: and(
            eq(alerts.deviceId, deviceId),
            eq(alerts.metricId, metricId),
            eq(alerts.thresholdId, threshold.id),
            eq(alerts.severity, "CRITICAL"),
            eq(alerts.acknowledged, 0)
          ),
        });

        if (!recentAlert) {
          // Get device details for the alert message
          const device = await db.query.devices.findFirst({
            where: eq(devices.id, deviceId),
          });

          // Create critical alert
          const alertResult = await db
            .insert(alerts)
            .values({
              type: "threshold_exceeded",
              message: `Critical threshold exceeded: ${
                device?.name || `Device ${deviceId}`
              } ${metricType} is ${value} (threshold: ${criticalThreshold})`,
              severity: "CRITICAL",
              deviceId: deviceId,
              siteId: device?.siteId || undefined,
              metricId: metricId,
              thresholdId: threshold.id,
              createdAt: new Date().toISOString(),
            })
            .returning();

          // Broadcast critical alert via WebSocket
          if (alertResult[0]) {
            const site = device?.siteId
              ? await db.query.sites.findFirst({
                  where: eq(sites.id, device.siteId),
                })
              : null;

            const criticalAlert: AlertNotification = {
              id: alertResult[0].id,
              type: "threshold_exceeded",
              message: alertResult[0].message,
              severity: "CRITICAL",
              deviceId: deviceId,
              deviceName: device?.name,
              siteId: device?.siteId || undefined,
              siteName: site?.name,
              metricType: metricType,
              metricValue: value,
              threshold: criticalThreshold as number,
              timestamp: alertResult[0].createdAt || new Date().toISOString(),
            };

            broadcastCriticalAlert(criticalAlert);
            broadcastAlert(criticalAlert);
          }

          // Update device status based on new alert
          await updateDeviceStatusFromAlerts(deviceId);

          console.log(
            `CRITICAL ALERT: Device ${deviceId} ${metricType} exceeded critical threshold (${value} > ${criticalThreshold})`
          );
        }

        // If critical threshold is exceeded, don't check lower severity thresholds
        continue;
      }
    }

    // Check serious threshold if critical wasn't exceeded
    if (seriousThreshold !== null && seriousThreshold !== undefined) {
      let exceedsSerious = false;

      switch (operator) {
        case "greater_than":
          exceedsSerious = value > seriousThreshold;
          break;
        case "less_than":
          exceedsSerious = value < seriousThreshold;
          break;
        case "equals":
          exceedsSerious = value === seriousThreshold;
          break;
        default:
          exceedsSerious = value > seriousThreshold;
      }

      if (exceedsSerious) {
        // Check if we already have a recent serious alert for this metric
        const recentAlert = await db.query.alerts.findFirst({
          where: and(
            eq(alerts.deviceId, deviceId),
            eq(alerts.metricId, metricId),
            eq(alerts.thresholdId, threshold.id),
            eq(alerts.severity, "SERIOUS"),
            eq(alerts.acknowledged, 0)
          ),
        });

        if (!recentAlert) {
          // Get device details for the alert message
          const device = await db.query.devices.findFirst({
            where: eq(devices.id, deviceId),
          });

          // Create serious alert
          const seriousResult = await db
            .insert(alerts)
            .values({
              type: "threshold_exceeded",
              message: `Serious threshold exceeded: ${
                device?.name || `Device ${deviceId}`
              } ${metricType} is ${value} (threshold: ${seriousThreshold})`,
              severity: "SERIOUS",
              deviceId: deviceId,
              siteId: device?.siteId || undefined,
              metricId: metricId,
              thresholdId: threshold.id,
              createdAt: new Date().toISOString(),
            })
            .returning();

          if (seriousResult[0]) {
            const site = device?.siteId
              ? await db.query.sites.findFirst({
                  where: eq(sites.id, device.siteId),
                })
              : null;

            const seriousAlert: AlertNotification = {
              id: seriousResult[0].id,
              type: "threshold_exceeded",
              message: seriousResult[0].message,
              severity: "SERIOUS",
              deviceId: deviceId,
              deviceName: device?.name,
              siteId: device?.siteId || undefined,
              siteName: site?.name,
              metricType,
              metricValue: value,
              threshold: seriousThreshold as number,
              timestamp: seriousResult[0].createdAt || new Date().toISOString(),
            };

            broadcastAlert(seriousAlert);
          }

          // Update device status based on new alert
          await updateDeviceStatusFromAlerts(deviceId);

          console.log(
            `SERIOUS ALERT: Device ${deviceId} ${metricType} exceeded serious threshold (${value} > ${seriousThreshold})`
          );
        }

        // If serious threshold is exceeded, don't check caution threshold
        continue;
      }
    }

    // Check caution threshold if neither critical nor serious were exceeded
    if (cautionThreshold !== null && cautionThreshold !== undefined) {
      let exceedsCaution = false;

      switch (operator) {
        case "greater_than":
          exceedsCaution = value > cautionThreshold;
          break;
        case "less_than":
          exceedsCaution = value < cautionThreshold;
          break;
        case "equals":
          exceedsCaution = value === cautionThreshold;
          break;
        default:
          exceedsCaution = value > cautionThreshold;
      }

      if (exceedsCaution) {
        // Check if we already have a recent caution alert for this metric
        const recentAlert = await db.query.alerts.findFirst({
          where: and(
            eq(alerts.deviceId, deviceId),
            eq(alerts.metricId, metricId),
            eq(alerts.thresholdId, threshold.id),
            eq(alerts.severity, "CAUTION"),
            eq(alerts.acknowledged, 0)
          ),
        });

        if (!recentAlert) {
          // Get device details for the alert message
          const device = await db.query.devices.findFirst({
            where: eq(devices.id, deviceId),
          });

          // Create caution alert
          const cautionResult = await db
            .insert(alerts)
            .values({
              type: "threshold_exceeded",
              message: `Caution threshold exceeded: ${
                device?.name || `Device ${deviceId}`
              } ${metricType} is ${value} (threshold: ${cautionThreshold})`,
              severity: "CAUTION",
              deviceId: deviceId,
              siteId: device?.siteId || undefined,
              metricId: metricId,
              thresholdId: threshold.id,
              createdAt: new Date().toISOString(),
            })
            .returning();

          if (cautionResult[0]) {
            const site = device?.siteId
              ? await db.query.sites.findFirst({
                  where: eq(sites.id, device.siteId),
                })
              : null;

            const cautionAlert: AlertNotification = {
              id: cautionResult[0].id,
              type: "threshold_exceeded",
              message: cautionResult[0].message,
              severity: "CAUTION",
              deviceId: deviceId,
              deviceName: device?.name,
              siteId: device?.siteId || undefined,
              siteName: site?.name,
              metricType,
              metricValue: value,
              threshold: cautionThreshold as number,
              timestamp: cautionResult[0].createdAt || new Date().toISOString(),
            };

            broadcastAlert(cautionAlert);
          }

          // Update device status based on new alert
          await updateDeviceStatusFromAlerts(deviceId);

          console.log(
            `CAUTION ALERT: Device ${deviceId} ${metricType} exceeded caution threshold (${value} > ${cautionThreshold})`
          );
        }
      }
    }
  }
}

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
            const metricResult = await db
              .insert(metrics)
              .values({
                deviceId: device.id,
                metricType: "watts",
                value: Number(wattsValue) || 0,
                createdAt: new Date().toISOString(),
              })
              .returning();

            // Evaluate thresholds immediately after inserting metric
            if (metricResult[0]) {
              await evaluateThresholds(
                device.id,
                "watts",
                Number(wattsValue) || 0,
                metricResult[0].id
              );
            }
          } else {
            console.log(
              `Watts data (total_draw_w) missing for PDU ${device.id}`
            );
          }

          if (ampsValue !== undefined) {
            const metricResult = await db
              .insert(metrics)
              .values({
                deviceId: device.id, // Corrected from 'device' to 'deviceId'
                metricType: "amps",
                value: Number(ampsValue) || 0,
                createdAt: new Date().toISOString(),
              })
              .returning();

            // Evaluate thresholds immediately after inserting metric
            if (metricResult[0]) {
              await evaluateThresholds(
                device.id,
                "amps",
                Number(ampsValue) || 0,
                metricResult[0].id
              );
            }
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
                const metricResult = await db
                  .insert(metrics)
                  .values({
                    deviceId: device.id,
                    metricType: `cpu_utilization_core_${cpuId}`,
                    value: Number(cpu.utilization_percent) || 0,
                    createdAt: new Date().toISOString(),
                  })
                  .returning();

                // Evaluate thresholds immediately after inserting metric
                if (metricResult[0]) {
                  await evaluateThresholds(
                    device.id,
                    `cpu_utilization_core_${cpuId}`,
                    Number(cpu.utilization_percent) || 0,
                    metricResult[0].id
                  );
                }

                totalCpuUtilization += Number(cpu.utilization_percent) || 0;
                cpuCount++;
              }

              // Store per-core CPU temperature
              if (cpu.temperature_c !== undefined) {
                const metricResult = await db
                  .insert(metrics)
                  .values({
                    deviceId: device.id,
                    metricType: `cpu_temperature_core_${cpuId}`,
                    value: Number(cpu.temperature_c) || 0,
                    createdAt: new Date().toISOString(),
                  })
                  .returning();

                // Evaluate thresholds immediately after inserting metric
                if (metricResult[0]) {
                  await evaluateThresholds(
                    device.id,
                    `cpu_temperature_core_${cpuId}`,
                    Number(cpu.temperature_c) || 0,
                    metricResult[0].id
                  );
                }

                totalCpuTemp += Number(cpu.temperature_c) || 0;
              }
            }

            if (cpuCount > 0) {
              // Store average CPU utilization (keep for backward compatibility)
              const avgCpuUtilResult = await db
                .insert(metrics)
                .values({
                  deviceId: device.id,
                  metricType: "cpu_utilization",
                  value: totalCpuUtilization / cpuCount,
                  createdAt: new Date().toISOString(),
                })
                .returning();

              // Evaluate thresholds for average CPU utilization
              if (avgCpuUtilResult[0]) {
                await evaluateThresholds(
                  device.id,
                  "cpu_utilization",
                  totalCpuUtilization / cpuCount,
                  avgCpuUtilResult[0].id
                );
              }

              // Store average CPU temperature (keep for backward compatibility)
              const avgCpuTempResult = await db
                .insert(metrics)
                .values({
                  deviceId: device.id,
                  metricType: "cpu_temperature",
                  value: totalCpuTemp / cpuCount,
                  createdAt: new Date().toISOString(),
                })
                .returning();

              // Evaluate thresholds for average CPU temperature
              if (avgCpuTempResult[0]) {
                await evaluateThresholds(
                  device.id,
                  "cpu_temperature",
                  totalCpuTemp / cpuCount,
                  avgCpuTempResult[0].id
                );
              }
            }
          }

          // RAM metrics
          if (ram && ram.utilization_percent !== undefined) {
            const memoryResult = await db
              .insert(metrics)
              .values({
                deviceId: device.id,
                metricType: "memory_utilization",
                value: Number(ram.utilization_percent) || 0,
                createdAt: new Date().toISOString(),
              })
              .returning();

            // Evaluate thresholds immediately after inserting metric
            if (memoryResult[0]) {
              await evaluateThresholds(
                device.id,
                "memory_utilization",
                Number(ram.utilization_percent) || 0,
                memoryResult[0].id
              );
            }
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

            const networkResult = await db
              .insert(metrics)
              .values({
                deviceId: device.id,
                metricType: "network_speed",
                value: totalNetworkSpeed,
                createdAt: new Date().toISOString(),
              })
              .returning();

            // Evaluate thresholds immediately after inserting metric
            if (networkResult[0]) {
              await evaluateThresholds(
                device.id,
                "network_speed",
                totalNetworkSpeed,
                networkResult[0].id
              );
            }
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
              const storageResult = await db
                .insert(metrics)
                .values({
                  deviceId: device.id,
                  metricType: "storage_utilization",
                  value: totalStorageUtilization / driveCount,
                  createdAt: new Date().toISOString(),
                })
                .returning();

              // Evaluate thresholds immediately after inserting metric
              if (storageResult[0]) {
                await evaluateThresholds(
                  device.id,
                  "storage_utilization",
                  totalStorageUtilization / driveCount,
                  storageResult[0].id
                );
              }
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
              const gpuResult = await db
                .insert(metrics)
                .values({
                  deviceId: device.id,
                  metricType: "gpu_temperature",
                  value: totalGpuTemp / gpuCount,
                  createdAt: new Date().toISOString(),
                })
                .returning();

              // Evaluate thresholds immediately after inserting metric
              if (gpuResult[0]) {
                await evaluateThresholds(
                  device.id,
                  "gpu_temperature",
                  totalGpuTemp / gpuCount,
                  gpuResult[0].id
                );
              }
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
          severity: "CAUTION",
          deviceId: device.id,
          siteId: device.siteId || undefined,
          createdAt: new Date().toISOString(),
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
          .set({
            status: externalData.status,
            updatedAt: new Date().toISOString(),
          }) // Also update timestamp
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
          severity: "CRITICAL",
          deviceId: device.id,
          siteId: device.siteId || undefined,
          createdAt: new Date().toISOString(),
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

// Function to determine device status based on highest alert severity
async function updateDeviceStatusFromAlerts(deviceId: number) {
  try {
    // Get all unacknowledged alerts for this device, ordered by severity priority
    const deviceAlerts = await db.query.alerts.findMany({
      where: and(eq(alerts.deviceId, deviceId), eq(alerts.acknowledged, 0)),
      orderBy: (a, { desc }) => desc(a.createdAt),
    });

    let newStatus:
      | "off"
      | "standby"
      | "normal"
      | "caution"
      | "serious"
      | "critical" = "normal"; // Default status when no alerts

    if (deviceAlerts.length > 0) {
      // Determine highest severity alert
      const severityPriority = {
        CRITICAL: 4,
        SERIOUS: 3,
        CAUTION: 2,
        INFO: 1,
      };

      let highestSeverity = "INFO";
      let highestPriority = 0;

      for (const alert of deviceAlerts) {
        const priority =
          severityPriority[alert.severity as keyof typeof severityPriority] ||
          0;
        if (priority > highestPriority) {
          highestPriority = priority;
          highestSeverity = alert.severity;
        }
      }

      // Map alert severity to device status
      const severityToStatus = {
        CRITICAL: "critical" as const,
        SERIOUS: "serious" as const,
        CAUTION: "caution" as const,
        INFO: "normal" as const,
      };

      newStatus =
        severityToStatus[highestSeverity as keyof typeof severityToStatus] ||
        "normal";
    }

    // Update device status in database
    await db
      .update(devices)
      .set({
        status: newStatus,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(devices.id, deviceId));

    console.log(`Device ${deviceId} status updated to: ${newStatus}`);
    return newStatus;
  } catch (error) {
    console.error(`Error updating device ${deviceId} status:`, error);
    return null;
  }
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

// Export functions for use in other modules
export { updateDeviceStatusFromAlerts };
