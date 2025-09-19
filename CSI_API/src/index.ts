import { Hono } from "hono";
import { cors } from "hono/cors";
import "./db"; // ensure .env loads & db.ts runs
import pdu from "./routes/PDUroutes/pduRoutes";
import sites from "./routes/sites/sitesRoutes";
import devices from "./routes/devices/deviceRoutes";
import metricThresholds from "./routes/metricThresholds/metricThresholdRoutes";
import alerts from "./routes/alerts/alertsRoutes";
import mock from "./routes/mock/mockRoutes";
import roles from "./routes/roles/rolesRoutes";
import users from "./routes/users/userRoutes";
import settings from "./routes/settings/settingsRoutes";
import { initializeAlertNotificationService } from "./services/alertNotificationService";
import "./poller/pollDevices";
import { auth } from "./auth";

// Initialize the critical alert notification service
initializeAlertNotificationService(8081);

const app = new Hono();

// Configure CORS properly for production and demo deployments
// Simple CORS configuration that allows all origins
app.use("*", cors({
  origin: '*',
  credentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'x-user-id', 'X-User-Id'],
}));

// Health check endpoint
app.get("/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.route("/pdu", pdu);
app.route("/sites", sites);
app.route("/devices", devices);
app.route("/metric-thresholds", metricThresholds);
app.route("/alerts", alerts);
app.route("/mock", mock);
app.route("/roles", roles);
app.route("/users", users);
app.route("/settings", settings);
app.use("/auth/*", async (c) => {
  return auth.handler(c.req.raw);
});

export default {
  port: process.env.PORT || 4000,
  fetch: app.fetch,
};
