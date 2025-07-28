import { useState, useEffect } from "react";
import {
  getDevices,
  updateDeviceStatusFromAlerts,
  getDeviceStatusFromAlerts,
  type Device,
} from "../services/DeviceService";
import { useAlerts } from "./useAlerts";

export function useDeviceStatus() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const { alerts } = useAlerts();

  // Function to refresh device status
  const refreshDevices = async () => {
    try {
      setLoading(true);
      const fetchedDevices = await getDevices();
      setDevices(fetchedDevices);
      setLastRefresh(new Date());
      setError(null);
    } catch (err) {
      console.error("Failed to fetch devices:", err);
      setError("Failed to fetch devices");
    } finally {
      setLoading(false);
    }
  };

  // Function to update a specific device's status based on alerts
  const updateDeviceStatus = async (deviceId: number) => {
    try {
      const result = await updateDeviceStatusFromAlerts(deviceId);
      if (result) {
        // Update the local device state
        setDevices((prevDevices) =>
          prevDevices.map((device) =>
            device.id === deviceId
              ? {
                  ...device,
                  status: result.status as Device["status"],
                  updatedAt: new Date().toISOString(),
                }
              : device
          )
        );
        return result.status;
      }
    } catch (error) {
      console.error(`Failed to update status for device ${deviceId}:`, error);
    }
    return null;
  };

  // Function to determine device status based on highest alert severity for a specific device
  const getDeviceStatusFromAlertsLocal = (
    deviceId: number
  ): Device["status"] => {
    const deviceAlerts = alerts.filter(
      (alert) => alert.deviceId === deviceId && !alert.acknowledged
    );

    return getDeviceStatusFromAlerts(deviceAlerts);
  };

  // Initial load
  useEffect(() => {
    refreshDevices();
  }, []);

  // Update device status when alerts change
  useEffect(() => {
    const updateDeviceStatuses = async () => {
      // Get unique device IDs from alerts
      const deviceIds = [
        ...new Set(
          alerts
            .filter((alert) => alert.deviceId !== null && !alert.acknowledged)
            .map((alert) => alert.deviceId!)
        ),
      ];

      // Update status for each device that has unacknowledged alerts
      for (const deviceId of deviceIds) {
        await updateDeviceStatus(deviceId);
      }

      // Also check devices that might have had all alerts acknowledged
      // and should return to normal status
      const devicesWithAlerts = new Set(deviceIds);
      const allDeviceIds = devices.map((d) => d.id);

      for (const deviceId of allDeviceIds) {
        if (!devicesWithAlerts.has(deviceId)) {
          // This device has no unacknowledged alerts, should be normal
          const currentDevice = devices.find((d) => d.id === deviceId);
          if (currentDevice && currentDevice.status !== "normal") {
            await updateDeviceStatus(deviceId);
          }
        }
      }
    };

    if (alerts.length > 0 && devices.length > 0) {
      updateDeviceStatuses();
    }
  }, [alerts]); // Remove devices from dependencies to prevent infinite loop

  // Get device status with priority mapping
  const getDeviceStatusPriority = (status: string): number => {
    const priorities = {
      critical: 5,
      serious: 4,
      caution: 3,
      normal: 2,
      standby: 1,
      off: 0,
    };
    return priorities[status.toLowerCase() as keyof typeof priorities] || 0;
  };

  // Get overall system health
  const getSystemHealth = () => {
    if (devices.length === 0) return { percentage: 100, status: "normal" };

    const statusCounts = devices.reduce((counts, device) => {
      const status = device.status?.toLowerCase() || "unknown";
      counts[status] = (counts[status] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);

    // Calculate health percentage (normal + standby devices)
    const healthyCount =
      (statusCounts.normal || 0) + (statusCounts.standby || 0);
    const percentage = Math.round((healthyCount / devices.length) * 100);

    // Determine overall system status based on highest priority alert
    let overallStatus = "normal";
    let highestPriority = 0;

    Object.keys(statusCounts).forEach((status) => {
      const priority = getDeviceStatusPriority(status);
      if (priority > highestPriority) {
        highestPriority = priority;
        overallStatus = status;
      }
    });

    return { percentage, status: overallStatus, statusCounts };
  };

  return {
    devices,
    loading,
    error,
    lastRefresh,
    refreshDevices,
    updateDeviceStatus,
    getDeviceStatusFromAlerts: getDeviceStatusFromAlertsLocal,
    getSystemHealth,
    getDeviceStatusPriority, // This is imported from DeviceService
  };
}
