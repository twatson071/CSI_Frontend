import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { RoleSchema, UpdateRoleSchema } from "./rolesValidationSchemas";
import { db } from "../../db";
import { roles } from "../../db/schema";
import { eq } from "drizzle-orm";
import {
  authMiddleware,
  permissionMiddleware,
} from "../../middleware/authMiddleware";

const rolesRoutes = new Hono();

rolesRoutes.use("*", authMiddleware);

// GET /roles
rolesRoutes.get("/", permissionMiddleware("view_roles"), async (c) => {
  const allRoles = await db.select().from(roles);
  return c.json(allRoles);
});

// GET /roles/:id
rolesRoutes.get("/:id", permissionMiddleware("view_roles"), async (c) => {
  const id = parseInt(c.req.param("id"));
  const role = await db.select().from(roles).where(eq(roles.id, id));
  if (role.length === 0) {
    return c.json({ error: "Role not found" }, 404);
  }
  return c.json(role[0]);
});

// POST /roles
rolesRoutes.post(
  "/",
  permissionMiddleware("manage_roles"),
  zValidator("json", RoleSchema),
  async (c) => {
    const newRole = c.req.valid("json");
    const [insertedRole] = await db.insert(roles).values(newRole).returning();
    return c.json(insertedRole, 201);
  }
);

// PUT /roles/:id
rolesRoutes.put(
  "/:id",
  permissionMiddleware("manage_roles"),
  zValidator("json", UpdateRoleSchema),
  async (c) => {
    const id = parseInt(c.req.param("id"));
    const updatedRole = c.req.valid("json");
    const [result] = await db
      .update(roles)
      .set(updatedRole)
      .where(eq(roles.id, id))
      .returning();
    if (!result) {
      return c.json({ error: "Role not found" }, 404);
    }
    return c.json(result);
  }
);

// DELETE /roles/:id
rolesRoutes.delete("/:id", permissionMiddleware("manage_roles"), async (c) => {
  const id = parseInt(c.req.param("id"));
  const [result] = await db.delete(roles).where(eq(roles.id, id)).returning();
  if (!result) {
    return c.json({ error: "Role not found" }, 404);
  }
  return c.json({ message: "Role deleted successfully" });
});

export default rolesRoutes;
