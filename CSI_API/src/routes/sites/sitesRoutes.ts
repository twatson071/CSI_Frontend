import { Hono, Context } from "hono";
import "dotenv/config";
import { db } from "../../db";

const app = new Hono();

async function fetchSitesWithDevices(c: Context) {
  const EXTERNAL_BASE_URL = process.env.EXTERNAL_BASE_URL!;
  const SYSTEM_OPERATOR_KEY = process.env.SYSTEM_OPERATOR_KEY!;
  const HUB_KEY = process.env.HUB_KEY!;

  // 1) load all sites
  const siteRows = await db.query.sites.findMany();

  // 2) for each site, load its devices and proxy the external call
  const results = await Promise.all(
    siteRows.map(async (site) => {
      // load devices belonging to this site
      const devRows = await db.query.devices.findMany({
        where: (d, { eq }) => eq(d.siteId, site.id),
      });

      // for each device hit the external API
      const devices = await Promise.all(
        devRows.map(async (dev) => {
          const url = `${EXTERNAL_BASE_URL}/service/${dev.serviceUrl}`;
          const init: RequestInit = {
            method: "GET",
            headers: {
              "X-API-Key-CSI-Maestro-SystemOperator": SYSTEM_OPERATOR_KEY,
              "X-API-Key-CSI-Maestro-Hub": HUB_KEY,
            },
          };
          const res = await fetch(url, init);
          const data = await res.json();
          return {
            deviceId: dev.id,
            name: dev.name,
            status: res.status,
            data,
          };
        })
      );

      return {
        siteId: site.id,
        siteName: site.name,
        devices,
      };
    })
  );

  return c.json(results);
}

app.get("/", (c) => fetchSitesWithDevices(c));

export default app;
