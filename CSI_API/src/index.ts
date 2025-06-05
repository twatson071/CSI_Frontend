import { Hono } from "hono";
import { cors } from "hono/cors";
import "./db"; // ensure .env loads & db.ts runs
import pdu from "./routes/PDUroutes/pduRoutes";
import sites from "./routes/sites/sitesRoutes";
import devices from "./routes/devices/deviceRoutes";
import mock from "./routes/mock/mockRoutes";
import "./poller/pollDevices";

const app = new Hono();
app.use("*", cors({ origin: "*" })); // Enable CORS for all routes

app.route("/pdu", pdu);
app.route("/sites", sites);
app.route("/devices", devices);
app.route("/mock", mock);
export default app;
