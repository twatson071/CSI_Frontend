import { Context } from "hono";

export async function parseRequestBody(c: Context) {
  let body = await c.req.json();

  // If the payload is already wrapped and stringified, just return as-is
  if (body && typeof body.payload === "string") {
    return body;
  }

  // Otherwise, wrap and stringify as required by the PDK
  if (body && typeof body === "object") {
    return { payload: JSON.stringify(body) };
  }

  throw new Error("Missing or invalid payload");
}
