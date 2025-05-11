import { Hono } from "hono";
import "./db"; // ensure .env loads & db.ts runs
import pdu from "./routes/PDUroutes/pduRoutes";
import sites from "./routes/sites/sitesRoutes";

const app = new Hono();
app.route("/pdu", pdu);
app.route("/sites", sites);
export default app;
