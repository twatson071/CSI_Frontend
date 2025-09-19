import { Hono, Context } from "hono";
import "dotenv/config";
import { db } from "../../db";
import { sites, userSites } from "../../db/schema";
import { devices } from "../../db/schema";
import { eq } from "drizzle-orm";
import {
  CreateSitePayloadSchema,
  SitesWithDevicesResponseSchema,
  DeviceSchema,
} from "./sitesValidationSchemas";
import { z } from "zod";

const app = new Hono();
async function getSiteById(c: Context) {
  const siteIdParam = c.req.param("siteId");
  const siteId = parseInt(siteIdParam);
  if (isNaN(siteId)) {
    return c.json({ error: "Invalid Site ID format" }, 400);
  }
  try {
    const site = await db.query.sites.findFirst({
      where: (s, { eq }) => eq(s.id, siteId),
      with: {
        userSites: {
          where: (us, { eq }) => eq(us.siteId, siteId),
          with: {
            user: true,
          },
        },
      },
    });
    if (!site) {
      return c.json({ error: "Site not found" }, 404);
    }
    const siteData = {
      siteId: site.id,
      siteName: site.name ?? "Unnamed Site",
      location: site.location ?? "No location provided",
    };
    return c.json(siteData);
  } catch (error) {
    console.error(`Error fetching site with ID ${siteId}:`, error);
    return c.json({ error: "Failed to fetch site" }, 500);
  }
}
async function fetchSitesWithDevices(c: Context) {
  const EXTERNAL_BASE_URL = process.env.EXTERNAL_BASE_URL!;
  const SYSTEM_OPERATOR_KEY = process.env.SYSTEM_OPERATOR_KEY!;
  const HUB_KEY = process.env.HUB_KEY!;

  let userIdString = c.req.header("x-user-id");

  let userId: number;

  // Default to userId = 1 if not provided (for local testing)
  if (!userIdString) {
    if (
      process.env.NODE_ENV === "development" ||
      process.env.NODE_ENV === "local"
    ) {
      userId = 1;
    } else {
      return c.json({ error: "User ID is required" }, 400);
    }
  } else {
    userId = parseInt(userIdString);
    if (isNaN(userId)) {
      return c.json({ error: "Invalid User ID format" }, 400);
    }
  }

  try {
    const userSiteRows = await db.query.userSites.findMany({
      where: (us, { eq }) => eq(us.userId, userId),
      with: {
        site: true,
      },
    });

    const results = await Promise.all(
      userSiteRows.map(async (userSite) => {
        if (!userSite.site) {
          console.error(
            `Site data missing for userSite entry with userId: ${userSite.userId} and siteId: ${userSite.siteId}`
          );
          return null;
        }
        const site = userSite.site;

        const devRows = await db.query.devices.findMany({
          where: (d, { eq }) => eq(d.siteId, site.id),
        });

        const devicesData = await Promise.all(
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
              let externalData: any = null;
              let textResponse = "";
              if (res.ok) {
                textResponse = await res.text();
                try {
                  externalData = JSON.parse(textResponse);
                } catch (parseError) {
                  console.error(
                    `Failed to parse JSON for device ${dev.id} from ${url}: ${textResponse}`,
                    parseError
                  );
                }
              }

              let finalStatus = dev.status || "offline"; // Default to offline if no status
              let dataToStore = externalData;
              let parametersToStore = null;
              let ipAddressToStore = null;

              if (res.ok && externalData !== null) {
                // Logic to determine status and data based on device type and externalData
                if (dev.type === "PDU") {
                  parametersToStore = externalData.parameters || {};
                  dataToStore = externalData;
                  ipAddressToStore = externalData.device?.comms?.ip || null;

                  if (externalData.sensors?.load_state) {
                    finalStatus = externalData.sensors.load_state.toLowerCase();
                  } else if (externalData.parameters?.ready === "READY") {
                    finalStatus = "normal";
                  } else {
                    finalStatus = "READY";
                  }
                } else {
                  // For other device types
                  parametersToStore = externalData.parameters || {};
                  dataToStore = externalData.data || externalData;
                  ipAddressToStore = externalData.ipAddress || null;
                  finalStatus = externalData.status || dev.status || "READY";
                }

                // Update the database
                try {
                  await db
                    .update(devices)
                    .set({
                      status: finalStatus,
                      data: dataToStore,
                      parameters: parametersToStore,
                      ipAddress: ipAddressToStore,
                      lastSeen: new Date(),
                    })
                    .where(eq(devices.id, dev.id));
                } catch (dbUpdateError) {
                  console.error(
                    `Failed to update device ${dev.id} in DB:`,
                    dbUpdateError
                  );
                }
              } else if (!res.ok) {
                finalStatus = "error";
              }

              return {
                deviceId: dev.id,
                name: dev.name ?? "Unnamed Device",
                status: finalStatus,
                data: dataToStore,
                type: dev.type ?? "unknown",
                serviceUrl: dev.serviceUrl ?? "",
              };
            } catch (fetchError) {
              console.error(
                `Error fetching data for device ${dev.id} from ${url}:`,
                fetchError
              );
              return {
                deviceId: dev.id,
                name: dev.name ?? "Unnamed Device",
                status: "error", // Indicate a fetch error
                data: null,
                type: dev.type ?? "unknown",
                serviceUrl: dev.serviceUrl ?? "",
              };
            }
          })
        );
        return {
          siteId: site.id,
          siteName: site.name ?? "Unnamed Site",
          location: site.location ?? "No location provided",
          devices: devicesData,
        };
      })
    );
    const validResults = results.filter((result) => result !== null);
    const validationResult =
      SitesWithDevicesResponseSchema.safeParse(validResults);

    if (!validationResult.success) {
      console.error("Zod validation error:", validationResult.error.flatten());
      return c.json(
        {
          error: "Data validation failed",
          details: validationResult.error.flatten(),
        },
        500
      );
    }

    return c.json(validationResult.data);
  } catch (error) {
    console.error("Error fetching sites or devices:", error);
    return c.json({ error: "Failed to fetch sites or devices" }, 500);
  }
}

async function createSite(c: Context) {
  let userIdString = c.req.header("x-user-id");
  let userId: number;

  if (!userIdString) {
    if (
      process.env.NODE_ENV === "development" ||
      process.env.NODE_ENV === "local"
    ) {
      userId = 1; // Default for local testing
    } else {
      return c.json({ error: "User ID is required for creating a site" }, 400);
    }
  } else {
    userId = parseInt(userIdString);
    if (isNaN(userId)) {
      return c.json({ error: "Invalid User ID format" }, 400);
    }
  }

  const body = await c.req.json();
  const validation = CreateSitePayloadSchema.safeParse(body);

  if (!validation.success) {
    console.error("Zod validation error:", validation.error.flatten());
    return c.json(
      {
        error: "Data validation failed",
        details: validation.error.flatten(),
      },
      400
    );
  }

  try {
    const newSite = await db.transaction(async (tx) => {
      const insertedSite = await tx
        .insert(sites)
        .values({
          name: validation.data.name,
          location: validation.data.location,
        })
        .returning({
          id: sites.id,
          name: sites.name,
          location: sites.location,
        });

      if (!insertedSite || insertedSite.length === 0) {
        throw new Error("Failed to create site record.");
      }
      const newSiteId = insertedSite[0].id;

      await tx.insert(userSites).values({
        userId: userId,
        siteId: newSiteId,
      });

      return insertedSite[0];
    });

    return c.json(
      {
        message: "Site created and associated with user successfully",
        site: newSite,
      },
      201
    );
  } catch (error) {
    console.error("Error creating site or associating with user:", error);
    return c.json(
      {
        error: "Failed to create site",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      500
    );
  }
}

async function fetchDevicesForSite(c: Context) {
  const EXTERNAL_BASE_URL = process.env.EXTERNAL_BASE_URL!;
  const SYSTEM_OPERATOR_KEY = process.env.SYSTEM_OPERATOR_KEY!;
  const HUB_KEY = process.env.HUB_KEY!;

  const siteIdParam = c.req.param("siteId");
  const siteId = parseInt(siteIdParam);

  if (isNaN(siteId)) {
    return c.json({ error: "Invalid Site ID format" }, 400);
  }

  try {
    const devRows = await db.query.devices.findMany({
      where: (d, { eq }) => eq(d.siteId, siteId),
    });

    if (!devRows || devRows.length === 0) {
      return c.json([]);
    }

    const devicesData = await Promise.all(
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
          let externalData: any = null;
          if (res.ok) {
            const textResponse = await res.text();
            try {
              externalData = JSON.parse(textResponse);
            } catch (parseError) {
              console.error(
                `Failed to parse JSON for device ${dev.id} from ${url}: ${textResponse}`,
                parseError
              );
            }
          }

          return {
            deviceId: dev.id,
            name: dev.name ?? "Unnamed Device",
            type: dev.type ?? "unknown",
            serviceUrl: dev.serviceUrl ?? "",
            status:
              res.ok && externalData !== null
                ? externalData.status || dev.status || "READY"
                : "critical", // Default to critical if fetch fails
            data: externalData,
          };
        } catch (fetchError) {
          console.error(
            `Error fetching data for device ${dev.id} from ${url}:`,
            fetchError
          );
          return {
            deviceId: dev.id,
            name: dev.name ?? "Unnamed Device",
            status: "error",
            data: null,
            type: dev.type ?? "unknown",
            serviceUrl: dev.serviceUrl ?? "",
          };
        }
      })
    );

    const DevicesArraySchema = z.array(DeviceSchema);
    const validationResult = DevicesArraySchema.safeParse(devicesData);

    if (!validationResult.success) {
      console.error(
        "Zod validation error for devices list:",
        validationResult.error.flatten()
      );
      return c.json(
        {
          error: "Device data validation failed",
          details: validationResult.error.flatten(),
        },
        500
      );
    }

    return c.json(validationResult.data);
  } catch (error) {
    console.error(`Error fetching devices for site ${siteId}:`, error);
    return c.json({ error: "Failed to fetch devices" }, 500);
  }
}

app.get("/", fetchSitesWithDevices); // Changed to pass function reference
app.post("/", createSite); // Changed to pass function reference
app.get("/:siteId", getSiteById); // New route to get site by ID
app.get("/:siteId/devices", fetchDevicesForSite); // New route

export default app;
