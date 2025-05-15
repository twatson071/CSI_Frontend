import { Hono, Context } from "hono";
import "dotenv/config";
import { db } from "../../db";
import { sites } from "../../db/schema";
import { devices } from "../../db/schema";
import { eq } from "drizzle-orm";

const app = new Hono();

async function fetchSitesWithDevices(c: Context) {
  const EXTERNAL_BASE_URL = process.env.EXTERNAL_BASE_URL!;
  const SYSTEM_OPERATOR_KEY = process.env.SYSTEM_OPERATOR_KEY!;
  const HUB_KEY = process.env.HUB_KEY!;

  const siteRows = await db.query.sites.findMany();

  const results = await Promise.all(
    siteRows.map(async (site) => {
      // load devices belonging to this site
      const devRows = await db.query.devices.findMany({
        where: (d, { eq }) => eq(d.siteId, site.id),
      });
      // for each device hit the external API
      let remoteDevices = await Promise.all(
        devRows.map(async (dev) => {
          const url = `${EXTERNAL_BASE_URL}/service/${dev.serviceUrl}`;
          const init: RequestInit = {
            method: "GET",
            headers: {
              "X-API-Key-CSI-Maestro-SystemOperator": SYSTEM_OPERATOR_KEY,
              "X-API-Key-CSI-Maestro-Hub": HUB_KEY,
            },
          };
          try {
            const res = await fetch(url, init);
            const data = await res.json();
            //Call the device update here?
            /**Display the latest known data but if we fail the call or the device is offline
             * we will need to show that we may have stale data, cannot interact with device
             **/

            await db
              .update(devices)
              .set({ data: data })
              .where(eq(devices.id, dev.id));
            return {
              deviceId: dev.id,
              name: dev.name,
              status: res.status,
              data,
            };
          } catch (err) {
            console.error("Proxy is down or service name is wrong:", err);
          }
        })
      );
      //TODO setup a default empty device object that includes the information from CSI
      return {
        siteId: site.id,
        siteName: site.name,
        devices: devRows,
        siteLocation: site.location,
      };
    })
  );
  return c.json(results);
}
async function createSite(c: Context) {
  const body = await c.req.parseBody();
  console.log(body.location);
  await db.insert(sites).values({ name: body.name, location: body.location });
}
app.get("/", (c) => fetchSitesWithDevices(c));
app.post("/", (c) => createSite(c));

export default app;
