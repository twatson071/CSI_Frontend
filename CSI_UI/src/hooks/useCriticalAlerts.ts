import { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import {
  acknowledgeAlert as acknowledgeAlertAPI,
  getAlerts,
} from "../services/AlertService";
import type { Alert } from "../services/AlertService";

export interface CriticalAlert {
  id: number;
  type: string;
  message: string;
  severity: "CRITICAL";
  deviceId: number;
  deviceName?: string;
  siteId?: number;
  siteName?: string;
  metricType: string;
  metricValue: number;
  threshold: number;
  timestamp: string;
}

interface UseCriticalAlertsReturn {
  alerts: CriticalAlert[];
  isConnected: boolean;
  acknowledgeAlert: (alertId: number) => void;
  clearAllAlerts: () => void;
  connectionStatus: "connecting" | "connected" | "disconnected" | "error";
}

export function useCriticalAlerts(
  serverUrl: string = "http://localhost:8081"
): UseCriticalAlertsReturn {
  const [alerts, setAlerts] = useState<CriticalAlert[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    "connecting" | "connected" | "disconnected" | "error"
  >("disconnected");
  const socketRef = useRef<Socket | null>(null);

  // Load initial critical alerts that are unacknowledged and unresolved
  useEffect(() => {
    const loadInitialAlerts = async () => {
      try {
        const allAlerts = await getAlerts();
        // Filter for critical alerts that are unacknowledged and unresolved
        const criticalAlerts = allAlerts
          .filter(
            (alert: Alert) =>
              alert.severity === "CRITICAL" &&
              !alert.acknowledged &&
              // Note: isResolved might not be in the Alert interface yet,
              // you may need to add it to the AlertService interface
              !('isResolved' in alert && alert.isResolved)
          )
          .map((alert: Alert) => ({
            ...alert,
            severity: "CRITICAL" as const,
            deviceName: alert.deviceId?.toString(), // You might want to fetch device name
            metricType: "", // These fields might need to be added to the Alert interface
            metricValue: 0,
            threshold: 0,
            timestamp: alert.createdAt,
          }));

        setAlerts(criticalAlerts);
      } catch (error) {
        console.error("Failed to load initial critical alerts:", error);
      }
    };

    loadInitialAlerts();
  }, []);

  useEffect(() => {
    // Initialize socket connection
    setConnectionStatus("connecting");
    const socket = io(serverUrl, {
      transports: ["websocket", "polling"],
      timeout: 5000,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    // Connection event handlers
    socket.on("connect", () => {
      console.log("Connected to critical alerts service");
      setIsConnected(true);
      setConnectionStatus("connected");
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from critical alerts service");
      setIsConnected(false);
      setConnectionStatus("disconnected");
    });

    socket.on("connect_error", (error: Error) => {
      console.error("Connection error:", error);
      setIsConnected(false);
      setConnectionStatus("error");
    });

    // Listen for critical alerts
    socket.on("critical_alert", (alert: CriticalAlert) => {
      console.log("Received critical alert:", alert);
      setAlerts((prev) => {
        // Avoid duplicates
        if (prev.some((a) => a.id === alert.id)) {
          return prev;
        }
        // Add new alert to the beginning of the array
        return [alert, ...prev];
      });

      // Show browser notification if permission granted
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification(
          `Critical Alert: ${alert.deviceName || alert.deviceId}`,
          {
            body: alert.message,
            icon: "/favicon.ico",
            tag: `critical-alert-${alert.id}`, // Prevents duplicate notifications
            requireInteraction: true, // Keep notification visible until user interacts
          }
        );
      }

      // Play alert sound (optional)
      try {
        const audio = new Audio("/alert-sound.mp3"); // Add an alert sound file to public folder
        audio.volume = 0.5;
        audio.play().catch(() => {
          // Ignore audio play errors (browser may block autoplay)
        });
      } catch {
        // Audio not available, continue silently
      }
    });

    // Listen for alert resolution events
    socket.on("alert", (notification: { type?: string; data?: { id?: number } }) => {
      if (notification.type === "alert_resolved") {
        console.log("Alert resolved:", notification);
        // Remove resolved alert from local state
        setAlerts((prev) =>
          prev.filter((alert) => alert.id !== notification.id)
        );
      }
    });

    socket.on("connection", (data: unknown) => {
      console.log("Connection confirmed:", data);
    });

    // Request notification permission on mount
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().then((permission) => {
        console.log("Notification permission:", permission);
      });
    }

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [serverUrl]);

  const acknowledgeAlert = async (alertId: number) => {
    try {
      // Call the API to acknowledge the alert in the database
      await acknowledgeAlertAPI(alertId);
      // Remove the acknowledged alert from the local state
      setAlerts((prev) => prev.filter((alert) => alert.id !== alertId));
    } catch (error) {
      console.error("Failed to acknowledge critical alert:", error);
      // Still remove from local state even if API call fails
      setAlerts((prev) => prev.filter((alert) => alert.id !== alertId));
    }
  };

  const clearAllAlerts = () => {
    // Acknowledge all alerts instead of just clearing them locally
    alerts.forEach((alert) => {
      acknowledgeAlert(alert.id);
    });
  };

  return {
    alerts,
    isConnected,
    acknowledgeAlert,
    clearAllAlerts,
    connectionStatus,
  };
}
