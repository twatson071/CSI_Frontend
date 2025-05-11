import { Hono, Context } from "hono";
import "dotenv/config";
import { db } from "../../db";

const app = new Hono();
async function fetchAllPdus(c: Context, method: "GET" | "POST") {
  const EXTERNAL_BASE_URL = process.env.EXTERNAL_BASE_URL!;
  const SYSTEM_OPERATOR_KEY = process.env.SYSTEM_OPERATOR_KEY!;
  const HUB_KEY = process.env.HUB_KEY!;

  // Extract serviceUrl from the route parameter
  const serviceUrl = c.req.param("serviceUrl");
  if (!serviceUrl) {
    return c.text("Missing serviceUrl parameter", 400);
  }

  const pduDevices = await db.query.devices.findMany({
    where: (devices, { eq }) => eq(devices.serviceUrl, serviceUrl),
  });

  if (pduDevices.length === 0) {
    return c.text(`No devices found for serviceUrl: ${serviceUrl}`, 404);
  }

  // if POST, parse body once up-front (so we don’t consume the stream multiple times)
  let bodyObj: unknown = undefined;
  if (method === "POST") {
    try {
      bodyObj = await c.req.json();
    } catch {
      return c.text("Invalid JSON body", 400);
    }
  }

  const results = await Promise.all(
    pduDevices.map(async (dev) => {
      const url = `${EXTERNAL_BASE_URL}/service/${dev.serviceUrl}`;
      const init: RequestInit = {
        method,
        headers: {
          "X-API-Key-CSI-Maestro-SystemOperator": SYSTEM_OPERATOR_KEY,
          "X-API-Key-CSI-Maestro-Hub": HUB_KEY,
          ...(method === "POST" && { "Content-Type": "application/json" }),
        },
      };
      if (method === "POST") {
        const client = bodyObj as Record<string, any>;
        const parameters = client.parameters || {}; // Ensure parameters is always an object
        if (typeof parameters !== "object") {
          console.error("Invalid parameters:", parameters); // Debug log
          return c.text("Missing or invalid parameters", 400);
        }
        init.body = JSON.stringify({
          payload: JSON.stringify({ parameters }), // Convert payload to a string
        });
      }

      const res = await fetch(url, init);
      const responseText = await res.text(); // Read the response as text
      return {
        deviceId: dev.id,
        name: dev.name,
        status: res.status,
        data: responseText,
      };
    })
  );

  return c.json(results);
}
app.get("/:serviceUrl", (c) => fetchAllPdus(c, "GET"));
app.post("/:serviceUrl", (c) => fetchAllPdus(c, "POST"));

export default app;
