import { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { addToast } from "../utils/toast";
import type { Alert } from "../services/AlertService";
import { getAlerts, acknowledgeAlert } from "../services/AlertService";

export function useAlerts(serverUrl: string = "http://localhost:8081") {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    getAlerts()
      .then(setAlerts)
      .catch((err) => {
        console.error("Failed to fetch alerts", err);
      });

    const socket = io(serverUrl, {
      transports: ["websocket", "polling"],
      timeout: 5000,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    socketRef.current = socket;

    socket.on("alert", (alert: Alert) => {
      setAlerts((prev) => {
        if (prev.some((a) => a.id === alert.id)) {
          return prev;
        }
        return [alert, ...prev];
      });
      addToast(alert.message, false, 5000);
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
      // Remove the acknowledged alert from the local state
      setAlerts((prev) => prev.filter((a) => a.id !== id));
      addToast("Alert acknowledged", true, 3000);
    } catch (error) {
      console.error("Failed to acknowledge alert:", error);
      addToast("Failed to acknowledge alert", false, 5000);
    }
  };

  return { alerts, acknowledge };
}
