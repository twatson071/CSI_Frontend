import { z } from "zod";

export const DeviceSchema = z.object({
  deviceId: z.number(),
  name: z.string(),
  type: z.string(),
  serviceUrl: z.string(),
  status: z.string(),
  data: z.any().nullable(),
});
export const CreateSitePayloadSchema = z.object({
  name: z.string(),
  location: z.string(),
});

export const SiteWithDevicesSchema = z.object({
  siteId: z.number(),
  siteName: z.string(),
  devices: z.array(DeviceSchema),
});

export const SitesWithDevicesResponseSchema = z.array(SiteWithDevicesSchema);
