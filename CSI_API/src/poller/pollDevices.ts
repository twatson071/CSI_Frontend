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
  broadcastAlertResolution,
  type AlertNotification,
} from "../services/alertNotificationService";

// Add threshold evaluation function
async function evaluateThresholds(
  deviceId: number,
  metricType: string,
  value: number,
  metricId: number
) {
  // First, check for auto-resolution of existing alerts
  await checkAndResolveAlerts(deviceId, metricType, value);

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
              isResolved: false,
              acknowledged: 0,
            };

            broadcastCriticalAlert(criticalAlert);
            broadcastAlert(criticalAlert);
          }

          // Update device status based on new alert
          await updateDeviceStatusFromAlerts(deviceId);
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
            eq(alerts.acknowledged, 0),
            eq(alerts.isResolved, false)
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
            eq(alerts.acknowledged, 0),
            eq(alerts.isResolved, false)
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
        }
      }
    }
  }
}

async function pollDevicesAndStore() {
  const allDevices = await db.query.devices.findMany();
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
          }

          if (ampsValue !== undefined) {
            const metricResult = await db
              .insert(metrics)
              .values({
                deviceId: device.id,
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
          }
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
        }
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
}

// Function to check and resolve alerts
async function checkAndResolveAlerts(
  deviceId: number,
  metricType: string,
  currentValue: number
) {
  // Get all unresolved alerts for this device and metric type
  const unresolvedAlerts = await db.query.alerts.findMany({
    where: and(
      eq(alerts.deviceId, deviceId),
      eq(alerts.type, "threshold_exceeded"),
      eq(alerts.acknowledged, 0),
      eq(alerts.isResolved, false)
    ),
  });

  console.log(
    `Checking ${unresolvedAlerts.length} unresolved alerts for device ${deviceId}, metric ${metricType}`
  );

  for (const alert of unresolvedAlerts) {
    // Get the threshold information separately if relation isn't working
    const threshold = await db.query.metricThresholds.findFirst({
      where: eq(metricThresholds.id, alert.thresholdId!),
    });

    if (!threshold) {
      console.log(
        `No threshold found for alert ${alert.id}, thresholdId: ${alert.thresholdId}`
      );
      continue;
    }

    // Only check alerts that match the current metric type
    if (threshold.metricType !== metricType) {
      continue;
    }

    const { operator } = threshold;
    let shouldResolve = false;

    // Check if current value no longer violates the threshold
    switch (alert.severity) {
      case "CRITICAL":
        if (threshold.criticalThreshold !== null) {
          shouldResolve = !exceedsThreshold(
            currentValue,
            threshold.criticalThreshold,
            operator
          );
        }
        break;
      case "SERIOUS":
        if (threshold.seriousThreshold !== null) {
          shouldResolve = !exceedsThreshold(
            currentValue,
            threshold.seriousThreshold,
            operator
          );
        }
        break;
      case "CAUTION":
        if (threshold.cautionThreshold !== null) {
          shouldResolve = !exceedsThreshold(
            currentValue,
            threshold.cautionThreshold,
            operator
          );
        }
        break;
    }

    if (shouldResolve) {
      console.log(
        `Auto-resolving alert ${alert.id} for device ${deviceId}, metric ${metricType}`
      );

      // Auto-resolve the alert
      await db
        .update(alerts)
        .set({
          isResolved: true,
          resolvedAt: new Date().toISOString(),
          resolutionReason: "auto_resolved",
        })
        .where(eq(alerts.id, alert.id));

      // Broadcast resolution notification
      broadcastAlertResolution(alert.id, "auto_resolved");
    }
  }

  // Update device status after resolving alerts
  await updateDeviceStatusFromAlerts(deviceId);
}

// Helper function to check if value exceeds threshold
function exceedsThreshold(
  value: number,
  threshold: number,
  operator: string
): boolean {
  switch (operator) {
    case "greater_than":
      return value > threshold;
    case "less_than":
      return value < threshold;
    case "equals":
      return value === threshold;
    default:
      return value > threshold;
  }
}

// Update the device status function to only consider unresolved alerts
async function updateDeviceStatusFromAlerts(deviceId: number) {
  try {
    // Get all unacknowledged AND unresolved alerts for this device
    const deviceAlerts = await db.query.alerts.findMany({
      where: and(
        eq(alerts.deviceId, deviceId),
        eq(alerts.acknowledged, 0),
        eq(alerts.isResolved, false) // Only consider unresolved alerts
      ),
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
  pollDevicesAndStore().catch((err) => {
    console.error("Error during scheduled device poll:", err);
  });
}, POLLING_INTERVAL_MS);

// Export functions for use in other modules
export { updateDeviceStatusFromAlerts };
