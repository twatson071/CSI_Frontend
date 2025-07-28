import { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { addToast } from "../utils/toast";
import type { Alert } from "../services/AlertService";
import {
  getAlerts,
  acknowledgeAlert,
  resolveAlert,
  deleteAlert,
  bulkAcknowledgeAlerts,
  bulkResolveAlerts,
  bulkDeleteAlerts,
  getAlertCount,
} from "../services/AlertService";
import { addAlertsToHistory } from "../utils/alertHistoryDB";

export function useAlerts(serverUrl: string = "http://localhost:8081") {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [alertCount, setAlertCount] = useState<number>(0);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    setAlerts([]);
    setAlertCount(0);

    Promise.all([getAlerts(), getAlertCount()])
      .then(([fetchedAlerts, count]) => {
        setAlerts(fetchedAlerts);
        setAlertCount(count);
        addAlertsToHistory(fetchedAlerts); // Store in IndexedDB
      })
      .catch((err) => {
        console.error("Failed to fetch alerts or count", err);
      });

    const socket = io(serverUrl, {
      transports: ["websocket", "polling"],
      timeout: 5000,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    socketRef.current = socket;

    socket.on("alert", (alert: Alert) => {
      // Instead of just adding to existing alerts, refetch from DB to get current state
      Promise.all([getAlerts(), getAlertCount()])
        .then(([fetchedAlerts, count]) => {
          setAlerts(fetchedAlerts);
          setAlertCount(count);
          addAlertsToHistory(fetchedAlerts); // Store in IndexedDB
        })
        .catch((err) => {
          console.error("Failed to refetch alerts after new alert", err);
        });

      addToast(alert.message, false, 5000, "alerts");
    });

    // Listen for alert resolution/removal
    socket.on("alert_resolved", (alertId: number) => {
      setAlerts((prev) => prev.filter((a) => a.id !== alertId));
      setAlertCount((prev) => prev - 1);
    });

    socket.on("connect_error", (error: Error) => {
      console.error("Alert socket connection error:", error);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [serverUrl]);

  const acknowledge = async (id: number) => {
    try {
      // Call the API to acknowledge the alert in the database
      await acknowledgeAlert(id);
      // Update local state to mark alert as acknowledged
      setAlerts((prev) => prev.map(alert => 
        alert.id === id 
          ? { ...alert, acknowledged: 1, acknowledgedAt: new Date().toISOString() }
          : alert
      ));
      addToast("Alert acknowledged", true, 3000, "alerts");
    } catch (error) {
      console.error("Failed to acknowledge alert:", error);
      addToast("Failed to acknowledge alert", false, 5000, "alerts");
    }
  };

  const resolve = async (id: number, reason?: string) => {
    try {
      await resolveAlert(id, reason);
      setAlerts((prev) => prev.map(alert => 
        alert.id === id 
          ? { ...alert, isResolved: true, resolvedAt: new Date().toISOString(), resolutionReason: reason }
          : alert
      ));
      addToast("Alert resolved", true, 3000, "alerts");
    } catch (error) {
      console.error("Failed to resolve alert:", error);
      addToast("Failed to resolve alert", false, 5000, "alerts");
    }
  };

  const remove = async (id: number) => {
    try {
      await deleteAlert(id);
      setAlerts((prev) => prev.filter((a) => a.id !== id));
      setAlertCount((prev) => prev - 1);
      addToast("Alert deleted", true, 3000, "alerts");
    } catch (error) {
      console.error("Failed to delete alert:", error);
      addToast("Failed to delete alert", false, 5000, "alerts");
    }
  };

  const bulkAcknowledge = async (ids: number[]) => {
    try {
      await bulkAcknowledgeAlerts(ids);
      const acknowledgedAt = new Date().toISOString();
      setAlerts((prev) => prev.map(alert => 
        ids.includes(alert.id) 
          ? { ...alert, acknowledged: 1, acknowledgedAt }
          : alert
      ));
      addToast(`${ids.length} alerts acknowledged`, true, 3000, "alerts");
    } catch (error) {
      console.error("Failed to bulk acknowledge alerts:", error);
      addToast("Failed to acknowledge alerts", false, 5000, "alerts");
    }
  };

  const bulkResolve = async (ids: number[], reason?: string) => {
    try {
      await bulkResolveAlerts(ids, reason);
      const resolvedAt = new Date().toISOString();
      setAlerts((prev) => prev.map(alert => 
        ids.includes(alert.id) 
          ? { ...alert, isResolved: true, resolvedAt, resolutionReason: reason }
          : alert
      ));
      addToast(`${ids.length} alerts resolved`, true, 3000, "alerts");
    } catch (error) {
      console.error("Failed to bulk resolve alerts:", error);
      addToast("Failed to resolve alerts", false, 5000, "alerts");
    }
  };

  const bulkDelete = async (ids: number[]) => {
    try {
      await bulkDeleteAlerts(ids);
      setAlerts((prev) => prev.filter((a) => !ids.includes(a.id)));
      setAlertCount((prev) => prev - ids.length);
      addToast(`${ids.length} alerts deleted`, true, 3000, "alerts");
    } catch (error) {
      console.error("Failed to bulk delete alerts:", error);
      addToast("Failed to delete alerts", false, 5000, "alerts");
    }
  };

  return { 
    alerts, 
    alertCount, 
    acknowledge, 
    resolve, 
    remove, 
    bulkAcknowledge, 
    bulkResolve, 
    bulkDelete 
  };
}
