import { Hono, Context } from "hono";
import "dotenv/config";
import { db } from "../../db";
import { PduResponseSchema, CreatePduSchema } from "./pduValidationSchemas";
import { z } from "zod";

const app = new Hono();

// Define a schema for the expected POST body structure for fetching PDUs
const FetchPduBodySchema = z.object({
  parameters: z.record(z.any()).optional().default({}), // parameters should be an object
});

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
  let validatedBody: { parameters: Record<string, any> } | undefined =
    undefined;
  if (method === "POST") {
    try {
      const rawBody = await c.req.json();
      const validation = FetchPduBodySchema.safeParse(rawBody);
      if (!validation.success) {
        return c.json(
          {
            error: "Invalid JSON body or parameters structure",
            details: validation.error.issues,
          },
          400
        );
      }
      validatedBody = validation.data;
    } catch (e) {
      return c.json({ error: "Invalid JSON body" }, 400);
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
      if (method === "POST" && validatedBody) {
        init.body = JSON.stringify({
          payload: JSON.stringify({ parameters: validatedBody.parameters }),
        });
      }

      const res = await fetch(url, init);
      const responseText = await res.text();

      let responseData: any = responseText;
      try {
        responseData = JSON.parse(responseText);
        console.log("Parsed response data:", responseData);
      } catch (e) {
        console.warn(
          "Response was not valid JSON, keeping as text",
          responseText
        );
      }

      return {
        deviceId: dev.id,
        name: dev.name,
        status: res.status,
        data: responseData,
      };
    })
  );
  return c.json(results);
}
app.get("/:serviceUrl", (c) => fetchAllPdus(c, "GET"));
app.post("/:serviceUrl", (c) => fetchAllPdus(c, "POST"));

export default app;
