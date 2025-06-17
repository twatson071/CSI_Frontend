// Alert Notification Service for broadcasting critical alerts
import { Server } from "socket.io";
import { createServer } from "http";

export interface AlertNotification {
  id: number;
  type: string;
  message: string;
  severity: "INFO" | "CAUTION" | "SERIOUS" | "CRITICAL";
  deviceId: number;
  deviceName?: string;
  siteId?: number;
  siteName?: string;
  metricType: string;
  metricValue: number;
  threshold: number;
  timestamp: string;
}

// Store Socket.IO server instance
let io: Server | null = null;

export function initializeAlertNotificationService(port: number = 8081) {
  const httpServer = createServer();
  io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("Client connected to alert notification service:", socket.id);

    // Send a welcome message
    socket.emit("connection", {
      type: "connection",
      message: "Connected to critical alert notifications",
      timestamp: new Date().toISOString(),
    });

    socket.on("disconnect", () => {
      console.log(
        "Client disconnected from alert notification service:",
        socket.id
      );
    });

    socket.on("error", (error: Error) => {
      console.error("Socket error:", error);
    });
  });

  httpServer.listen(port, () => {
    console.log(`Alert notification service listening on port ${port}`);
  });
}

// Broadcast critical alert to all connected clients
export function broadcastCriticalAlert(alert: AlertNotification) {
  if (!io) {
    console.warn("Alert notification service not initialized");
    return;
  }

  console.log(`Broadcasting critical alert to connected clients`);

  // Emit to all connected clients
  io.emit("critical_alert", alert);
}

export function broadcastAlert(alert: AlertNotification) {
  if (!io) {
    console.warn("Alert notification service not initialized");
    return;
  }
  io.emit("alert", alert);
}

// Get count of connected clients
export function getConnectedClientsCount(): number {
  return io ? io.sockets.sockets.size : 0;
}

// Cleanup function
export function shutdownAlertNotificationService() {
  if (io) {
    io.close();
    io = null;
    console.log("Alert notification service shut down");
  }
}
