"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeAlertNotificationService = initializeAlertNotificationService;
exports.broadcastCriticalAlert = broadcastCriticalAlert;
exports.broadcastAlert = broadcastAlert;
exports.broadcastAlertResolution = broadcastAlertResolution;
exports.broadcastAlertAcknowledgment = broadcastAlertAcknowledgment;
exports.broadcastThresholdUpdate = broadcastThresholdUpdate;
exports.getConnectedClientsCount = getConnectedClientsCount;
exports.shutdownAlertNotificationService = shutdownAlertNotificationService;
// Alert Notification Service for broadcasting critical alerts
var socket_io_1 = require("socket.io");
var http_1 = require("http");
// Store Socket.IO server instance
var io = null;
function initializeAlertNotificationService(port) {
    if (port === void 0) { port = 8081; }
    var httpServer = (0, http_1.createServer)();
    io = new socket_io_1.Server(httpServer, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
        },
    });
    io.on("connection", function (socket) {
        console.log("Client connected to alert notification service:", socket.id);
        // Send a welcome message
        socket.emit("connection", {
            type: "connection",
            message: "Connected to critical alert notifications",
            timestamp: new Date().toISOString(),
        });
        socket.on("disconnect", function () {
            console.log("Client disconnected from alert notification service:", socket.id);
        });
        socket.on("error", function (error) {
            console.error("Socket error:", error);
        });
    });
    httpServer.listen(port, function () {
        console.log("Alert notification service listening on port ".concat(port));
    });
}
// Broadcast critical alert to all connected clients (only if not resolved/acknowledged)
function broadcastCriticalAlert(alert) {
    if (!io) {
        console.warn("Alert notification service not initialized");
        return;
    }
    // Only broadcast if alert is not resolved and not acknowledged
    if (alert.isResolved || alert.acknowledged) {
        console.log("Skipping broadcast for resolved/acknowledged alert ".concat(alert.id));
        return;
    }
    console.log("Broadcasting critical alert ".concat(alert.id, " to connected clients"));
    // Emit to all connected clients
    io.emit("critical_alert", alert);
}
function broadcastAlert(alert) {
    if (!io) {
        console.warn("Alert notification service not initialized");
        return;
    }
    // Only broadcast if alert is not resolved and not acknowledged
    if (alert.isResolved || alert.acknowledged) {
        console.log("Skipping broadcast for resolved/acknowledged alert ".concat(alert.id));
        return;
    }
    console.log("Broadcasting alert ".concat(alert.id, " (").concat(alert.severity, ") to connected clients"));
    io.emit("alert", alert);
}
// Broadcast alert resolution to inform clients to remove the alert
function broadcastAlertResolution(alertId, reason) {
    if (reason === void 0) { reason = "resolved"; }
    if (!io) {
        console.warn("Alert notification service not initialized");
        return;
    }
    console.log("Broadcasting alert resolution for alert ".concat(alertId));
    io.emit("alert_resolved", {
        id: alertId,
        reason: reason,
        timestamp: new Date().toISOString(),
    });
}
// Broadcast alert acknowledgment to inform clients to remove the alert
function broadcastAlertAcknowledgment(alertId, acknowledgedBy) {
    if (!io) {
        console.warn("Alert notification service not initialized");
        return;
    }
    console.log("Broadcasting alert acknowledgment for alert ".concat(alertId));
    io.emit("alert_acknowledged", {
        id: alertId,
        acknowledgedBy: acknowledgedBy,
        timestamp: new Date().toISOString(),
    });
}
function broadcastThresholdUpdate(deviceId) {
    if (!io) {
        console.warn("Alert notification service not initialized");
        return;
    }
    io.emit("thresholds_updated", {
        deviceId: deviceId,
        timestamp: new Date().toISOString(),
    });
}
// Get count of connected clients
function getConnectedClientsCount() {
    return io ? io.sockets.sockets.size : 0;
}
// Cleanup function
function shutdownAlertNotificationService() {
    if (io) {
        io.close();
        io = null;
        console.log("Alert notification service shut down");
    }
}
