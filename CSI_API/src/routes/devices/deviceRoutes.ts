import { Hono, Context } from "hono";
import { eq } from "drizzle-orm";
import "dotenv/config";
import { db } from "../../db";
import { devices } from "../../db/schema";

const app = new Hono();
//TODO update a device once we get the data from CSI
async function getDevice(c: Context) {
  const devices = await db.query.devices.findMany();
  return c.json(devices);
}
async function updateDevice(deviceId: number, data: Array<any>) {
  return await db
    .update(devices)
    .set({ data: data })
    .where(eq(devices.id, deviceId));
}
async function createDevice(c: Context) {
  const body = await c.req.parseBody();
  return await db.insert(devices).values({
    name: body.name,
    type: body.type,
    ipAddress: body.ipAddress,
    serviceUrl: body.serviceUrl,
    siteId: body.siteId,
    parameters: body.parameters,
    data: body.data,
  });
}
app.get("/", (c) => getDevice(c));
app.post("/", (c) => createDevice(c));

export default app;
