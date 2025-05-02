import { Hono } from "hono/quick";
import { swaggerUI } from "@hono/swagger-ui";
import { tripplitePDUSpec } from "./docs/tripplitePDU.openapi";
import tripplitePDURoutes from "./routes/pdu/tripplitePDURoutes";

const app = new Hono();

// CORS middleware
app.use("*", async (c, next) => {
  c.header("Access-Control-Allow-Origin", "*");
  c.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  c.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-API-Key-CSI-Maestro-SystemOperator, X-API-Key-CSI-Maestro-Hub"
  );
  await next();
});

// Handle preflight OPTIONS requests
app.options("*", (c) => {
  c.header("Access-Control-Allow-Origin", "*");
  c.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  c.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-API-Key-CSI-Maestro-SystemOperator, X-API-Key-CSI-Maestro-Hub"
  );
  return c.body(null, 204);
});

// Custom header middleware (if you need to add headers to outgoing requests)
app.use("*", (c, next) => {
  c.req.header["X-API-Key-CSI-Maestro-SystemOperator"] = "SystemOperator-1";
  c.req.header["X-API-Key-CSI-Maestro-Hub"] = "Hub-1";
  return next();
});

// Routes for the PDU service
app.get("/ui", swaggerUI({ url: "/doc" }));
app.get("/doc", (c) => c.json(tripplitePDUSpec));
// Mount the Tripplite PDU routes
app.route("/", tripplitePDURoutes);
// Use the middleware to serve Swagger UI at /ui
app.get("/ui", swaggerUI({ url: "/doc" }));

app.fire();
