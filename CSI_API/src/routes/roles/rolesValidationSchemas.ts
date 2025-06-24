import { z } from "zod";

export const RoleSchema = z.object({
  name: z.string().min(1, "Role name is required"),
  permissions: z.string().min(1, "Permissions are required"),
});

export const UpdateRoleSchema = z.object({
  name: z.string().min(1, "Role name is required").optional(),
  permissions: z.string().min(1, "Permissions are required").optional(),
});
