import { Hono, Context } from "hono";
import { eq } from "drizzle-orm";
import "dotenv/config";
import { db } from "../../db";
import { devices } from "../../db/schema";
import {
  CreateDeviceClientPayloadSchema,
  UpdateDeviceSchema,
} from "./deviceValidationSchemas";

const app = new Hono();

async function getDevice(c: Context) {
  const allDevices = await db.query.devices.findMany();
  return c.json(allDevices);
}
async function getServiceList(c: Context, method: "GET") {
  const EXTERNAL_BASE_URL = process.env.EXTERNAL_BASE_URL!;
  const SYSTEM_OPERATOR_KEY = process.env.SYSTEM_OPERATOR_KEY!;
  const HUB_KEY = process.env.HUB_KEY!;

  try {
    const response = await fetch(`${EXTERNAL_BASE_URL}/services`, {
      method,
      headers: {
        "X-API-Key-CSI-Maestro-SystemOperator": SYSTEM_OPERATOR_KEY,
        "X-API-Key-CSI-Maestro-Hub": HUB_KEY,
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch services: ${response.statusText}`);
    }
    const externalServices = await response.json();

    if (!Array.isArray(externalServices)) {
      console.error(
        "External services response is not an array:",
        externalServices
      );
      return c.json(
        { error: "Invalid format for external services list" },
        500
      );
    }
    const usedDeviceUrls = await db
      .selectDistinct({ serviceUrl: devices.serviceUrl })
      .from(devices)
      .where(eq(devices.serviceUrl, devices.serviceUrl));

    const usedUrlsSet = new Set(
      usedDeviceUrls
        .map((device) => device.serviceUrl)
        .filter(
          (url): url is string => typeof url === "string" && url.length > 0
        )
    );
    const availableServices = externalServices.filter(
      (serviceName: any) =>
        typeof serviceName === "string" && !usedUrlsSet.has(serviceName)
    );

    return c.json(availableServices);
  } catch (error) {
    console.error("Error fetching or processing services:", error);
    // Check if error is an instance of Error to safely access message
    const errorMessage =
      error instanceof Error ? error.message : "Failed to fetch services";
    return c.json({ error: errorMessage }, 500);
  }
}
async function updateDevice(c: Context) {
  const deviceId = parseInt(c.req.param("id"));
  if (isNaN(deviceId)) {
    return c.json({ error: "Invalid device ID" }, 400);
  }
  const body = await c.req.json();
  const validation = UpdateDeviceSchema.safeParse(body);
  if (!validation.success) {
    return c.json(
      { error: "Invalid input", details: validation.error.issues },
      400
    );
  }

  const dataToUpdate: Partial<typeof devices.$inferInsert> = {};
  // Only include fields that are present in the validated data
  if (validation.data.name !== undefined)
    dataToUpdate.name = validation.data.name;
  if (validation.data.type !== undefined)
    dataToUpdate.type = validation.data.type;
  if (validation.data.serviceUrl !== undefined)
    dataToUpdate.serviceUrl = validation.data.serviceUrl;
  if (validation.data.siteId !== undefined)
    dataToUpdate.siteId = validation.data.siteId;
  if (validation.data.parameters !== undefined)
    dataToUpdate.parameters = validation.data.parameters as any; // Adjust type as per schema.ts
  if (validation.data.data !== undefined)
    dataToUpdate.data = validation.data.data as any; // Adjust type as per schema.ts
  if (validation.data.ipAddress !== undefined)
    dataToUpdate.ipAddress = validation.data.ipAddress;
  if (validation.data.status !== undefined)
    dataToUpdate.status = validation.data.status;

  if (Object.keys(dataToUpdate).length === 0) {
    return c.json({ error: "No valid fields to update" }, 400);
  }

  try {
    const updatedDevice = await db
      .update(devices)
      .set(dataToUpdate)
      .where(eq(devices.id, deviceId))
      .returning();
    if (updatedDevice.length === 0) {
      return c.json({ error: "Device not found" }, 404);
    }
    return c.json(updatedDevice[0]);
  } catch (error) {
    console.error("Error updating device:", error);
    return c.json({ error: "Failed to update device" }, 500);
  }
}

export async function fetchExternalDeviceDetails(serviceUrl: string) {
  const EXTERNAL_BASE_URL = process.env.EXTERNAL_BASE_URL;
  const SYSTEM_OPERATOR_KEY = process.env.SYSTEM_OPERATOR_KEY;
  const HUB_KEY = process.env.HUB_KEY;

  if (!EXTERNAL_BASE_URL || !SYSTEM_OPERATOR_KEY || !HUB_KEY) {
    console.error("External service URL or API key is not configured.");
    throw new Error("External service configuration error.");
  }

  const fullExternalUrl = `${EXTERNAL_BASE_URL}/service/${serviceUrl}`;

  const response = await fetch(fullExternalUrl, {
    method: "GET",
    headers: {
      "X-API-Key-CSI-Maestro-SystemOperator": SYSTEM_OPERATOR_KEY,
      "X-API-Key-CSI-Maestro-Hub": HUB_KEY,
    },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(
      `Failed to fetch details from external service ${fullExternalUrl}: ${response.status} ${response.statusText}`,
      errorBody
    );
    throw new Error(`External service request failed: ${response.statusText}`);
  }

  const externalData = await response.json(); // Fetch and parse JSON

  // Attempt to find and update an existing device with this serviceUrl
  if (externalData) {
    try {
      const existingDevice = await db.query.devices.findFirst({
        where: eq(devices.serviceUrl, serviceUrl),
      });

      if (existingDevice) {
        let dbParameters: any = {};
        let dbDataField: any = {};
        let dbIpAddress: string | null = existingDevice.ipAddress; // Default to existing
        let dbStatus: string = existingDevice.status || "online"; // Default to existing

        const deviceType = existingDevice.type; // Use the type of the existing device

        if (deviceType === "PDU") {
          dbParameters = externalData.parameters || {};
          dbDataField = externalData; // Store the whole response
          dbIpAddress =
            externalData.device?.comms?.ip || existingDevice.ipAddress;

          if (externalData.sensors?.load_state) {
            dbStatus = externalData.sensors.load_state.toLowerCase();
          } else if (externalData.parameters?.ready === "READY") {
            dbStatus = "normal";
          } else {
            // Keep existing status if no new status info from external data
            dbStatus = existingDevice.status || "online";
          }
        } else {
          // Generic handling for other device types
          dbParameters = externalData.parameters || {};
          dbDataField = externalData.data || externalData;
          dbIpAddress = externalData.ipAddress || existingDevice.ipAddress;
          dbStatus = externalData.status || existingDevice.status || "online";
        }

        const dataToUpdate: Partial<typeof devices.$inferInsert> = {
          parameters: dbParameters,
          data: dbDataField,
          ipAddress: dbIpAddress,
          status: dbStatus,
        };

        Object.keys(dataToUpdate).forEach((key) => {
          if (dataToUpdate[key as keyof typeof dataToUpdate] === undefined) {
            delete dataToUpdate[key as keyof typeof dataToUpdate];
          }
        });

        if (Object.keys(dataToUpdate).length > 0) {
          await db
            .update(devices)
            .set(dataToUpdate)
            .where(eq(devices.id, existingDevice.id));
          console.log(
            `Device with serviceUrl ${serviceUrl} (ID: ${existingDevice.id}) updated with fetched details.`
          );
        }
      }
    } catch (dbError) {
      console.error(
        `Error during DB query or update for serviceUrl ${serviceUrl}:`,
        dbError
      );
    }
  }

  return externalData;
}

async function createDevice(c: Context) {
  const body = await c.req.json();
  const clientValidation = CreateDeviceClientPayloadSchema.safeParse(body);

  if (!clientValidation.success) {
    return c.json(
      { error: "Invalid client input", details: clientValidation.error.issues },
      400
    );
  }

  const { name, type, serviceUrl, siteId } = clientValidation.data;

  try {
    const externalDetails = await fetchExternalDeviceDetails(serviceUrl);

    let dbParameters: any = {};
    let dbData: any = {};
    let dbIpAddress: string | null = null;
    let dbStatus: string = "online";

    if (type === "PDU") {
      dbParameters = externalDetails.parameters || {};
      dbData = externalDetails;
      dbIpAddress = externalDetails.device?.comms?.ip || null;

      // Determine status for PDU
      if (externalDetails.sensors?.load_state) {
        dbStatus = externalDetails.sensors.load_state.toLowerCase();
      } else if (externalDetails.parameters?.ready === "READY") {
        dbStatus = "normal";
      } else {
        dbStatus = "online"; // Fallback
      }
    } else {
      dbParameters = externalDetails.parameters || {};

      dbData = externalDetails.data || externalDetails;
      dbIpAddress = externalDetails.ipAddress || null;
      dbStatus = externalDetails.status || "online";
    }

    const deviceToInsert = {
      name,
      type,
      serviceUrl,
      siteId,
      parameters: dbParameters,
      data: dbData,
      ipAddress: dbIpAddress,
      status: dbStatus,
    };

    const newDevice = await db
      .insert(devices)
      .values(deviceToInsert)
      .returning();

    return c.json(newDevice[0], 201);
  } catch (error: any) {
    console.error(
      "Error creating device or processing external details:",
      error
    );
    const message =
      error.message ||
      "Failed to create device due to an internal or external error.";
    return c.json({ error: message }, 500);
  }
}
const getDeviceById = async (c: Context) => {
  const deviceId = parseInt(c.req.param("id"));
  if (isNaN(deviceId)) {
    return c.json({ error: "Invalid device ID" }, 400);
  }
  const device = await db.query.devices.findFirst({
    where: eq(devices.id, deviceId),
  });

  if (!device) {
    return c.json({ error: "Device not found" }, 404);
  } else if (device.serviceUrl) {
    const externalDetails = await fetchExternalDeviceDetails(device.serviceUrl);
    if (externalDetails) {
      updateDevice(c);
      return c.json({ ...device, externalDetails });
    }
  }
  return c.json(device);
};

app.get("/", getDevice);
app.get("/services", (c) => getServiceList(c, "GET"));
app.get("/:id", getDeviceById);
app.post("/", createDevice);
app.put("/:id", updateDevice);

export default app;
