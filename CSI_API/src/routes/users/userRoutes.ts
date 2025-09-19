import { Hono, Context } from "hono";
import { db } from "../../db";
import { users } from "../../db/schema";
import { eq, asc } from "drizzle-orm";
import {
  UserResponseSchema,
  CreateUserSchema,
  UpdateUserSchema,
} from "./userValidationSchemas"; // Updated import
import { z } from "zod";

const app = new Hono();

// Get all users
app.get("/", async (c: Context) => {
  try {
    const allUsers = await db.select().from(users).orderBy(asc(users.id));
    // const validation = z.array(UserResponseSchema).safeParse(allUsers); // Response validation can be added
    // if (!validation.success) {
    //   console.error("Error validating all users response:", validation.error.issues);
    //   return c.json({ error: "Internal server error during response validation" }, 500);
    // }
    return c.json(
      allUsers.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        roleId: u.roleId,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
      }))
    ); // Selectively return fields
  } catch (error) {
    console.error("Error fetching users:", error);
    return c.json({ error: "Failed to fetch users" }, 500);
  }
});

// Get user by ID
app.get("/:id", async (c: Context) => {
  const id = parseInt(c.req.param("id"));
  if (isNaN(id)) {
    return c.json({ error: "Invalid user ID" }, 400);
  }
  try {
    const user = await db.select().from(users).where({
      where: eq(users.id, id),
    });
    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }
    // const validation = UserResponseSchema.safeParse(user); // Response validation
    // if (!validation.success) {
    //   console.error("Error validating user response:", validation.error.issues);
    //   return c.json({ error: "Internal server error during response validation" }, 500);
    // }
    return c.json({
      id: user.id,
      name: user.name,
      email: user.email,
      roleId: user.roleId,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }); // Selectively return fields
  } catch (error) {
    console.error("Error fetching user:", error);
    return c.json({ error: "Failed to fetch user" }, 500);
  }
});

// Create a new user
app.post("/", async (c: Context) => {
  const body = await c.req.json();
  const validation = CreateUserSchema.safeParse(body);

  if (!validation.success) {
    return c.json(
      { error: "Invalid input", details: validation.error.issues },
      400
    );
  }

  const { name, email, passwordHash, roleId } = validation.data;

  try {
    const existingUser = await db.select().from(users).where({
      where: eq(users.email, email),
    });
    if (existingUser) {
      return c.json({ error: "Email already in use" }, 409);
    }

    const newUserResult = await db
      .insert(users)
      .values({
        name,
        email,
        passwordHash,
        roleId,
      })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        roleId: users.roleId,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      });

    if (newUserResult.length === 0) {
      return c.json({ error: "Failed to create user" }, 500);
    }
    // const responseValidation = UserResponseSchema.safeParse(newUserResult[0]); // Response validation
    // if (!responseValidation.success) {
    //   console.error("Error validating create user response:", responseValidation.error.issues);
    //   return c.json({ error: "Internal server error during response validation" }, 500);
    // }
    return c.json(newUserResult[0], 201);
  } catch (error) {
    console.error("Error creating user:", error);
    return c.json({ error: "Failed to create user" }, 500);
  }
});

// Update a user
app.put("/:id", async (c: Context) => {
  const id = parseInt(c.req.param("id"));
  if (isNaN(id)) {
    return c.json({ error: "Invalid user ID" }, 400);
  }
  const body = await c.req.json();
  const validation = UpdateUserSchema.safeParse(body);

  if (!validation.success) {
    return c.json(
      { error: "Invalid input", details: validation.error.issues },
      400
    );
  }

  if (Object.keys(validation.data).length === 0) {
    return c.json({ error: "No fields to update" }, 400);
  }

  const dataToUpdate = validation.data;

  if (dataToUpdate.email) {
    const currentUser = await db.select().from(users).where({
      where: eq(users.id, id),
    });
    if (!currentUser) {
      return c.json({ error: "User not found" }, 404);
    }
    if (currentUser.email !== dataToUpdate.email) {
      const existingUserWithEmail = await db.select().from(users).where({
        where: eq(users.email, dataToUpdate.email),
      });
      if (existingUserWithEmail) {
        return c.json(
          { error: "Email already in use by another account" },
          409
        );
      }
    }
  }

  try {
    const updatedUserResult = await db
      .update(users)
      .set(dataToUpdate)
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        roleId: users.roleId,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      });

    if (updatedUserResult.length === 0) {
      return c.json({ error: "User not found or no changes made" }, 404);
    }
    // const responseValidation = UserResponseSchema.safeParse(updatedUserResult[0]); // Response validation
    // if (!responseValidation.success) {
    //   console.error("Error validating update user response:", responseValidation.error.issues);
    //   return c.json({ error: "Internal server error during response validation" }, 500);
    // }
    return c.json(updatedUserResult[0]);
  } catch (error) {
    console.error("Error updating user:", error);
    return c.json({ error: "Failed to update user" }, 500);
  }
});

// Delete a user
app.delete("/:id", async (c: Context) => {
  const id = parseInt(c.req.param("id"));
  if (isNaN(id)) {
    return c.json({ error: "Invalid user ID" }, 400);
  }
  try {
    const deletedUser = await db
      .delete(users)
      .where(eq(users.id, id))
      .returning({ id: users.id });
    if (deletedUser.length === 0) {
      return c.json({ error: "User not found" }, 404);
    }
    return c.json({
      message: "User deleted successfully",
      userId: deletedUser[0].id,
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return c.json({ error: "Failed to delete user" }, 500);
  }
});

// --- Notification Preferences Endpoints ---

// Default notification types
const DEFAULT_NOTIFICATION_PREFERENCES = {
  alerts: true,
  critical: true,
  device: true,
  info: true,
  system: true,
};

// Get user notification preferences
app.get("/:id/preferences", async (c: Context) => {
  const id = parseInt(c.req.param("id"));
  if (isNaN(id)) {
    return c.json({ error: "Invalid user ID" }, 400);
  }
  try {
    const user = await db.select().from(users).where({ where: eq(users.id, id) });
    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }
    let prefs = user.notificationPreferences;
    if (!prefs || Object.keys(prefs).length === 0) {
      prefs = DEFAULT_NOTIFICATION_PREFERENCES;
    } else {
      // Fill in any missing keys with defaults
      prefs = { ...DEFAULT_NOTIFICATION_PREFERENCES, ...prefs };
    }
    return c.json(prefs);
  } catch (error) {
    console.error("Error fetching notification preferences:", error);
    return c.json({ error: "Failed to fetch notification preferences" }, 500);
  }
});

// Update user notification preferences
app.put("/:id/preferences", async (c: Context) => {
  const id = parseInt(c.req.param("id"));
  if (isNaN(id)) {
    return c.json({ error: "Invalid user ID" }, 400);
  }
  const body = await c.req.json();
  // Validate: must be an object with boolean values for known types
  const allowedKeys = Object.keys(DEFAULT_NOTIFICATION_PREFERENCES);
  const isValid =
    typeof body === "object" &&
    Object.keys(body).every(
      (k) => allowedKeys.includes(k) && typeof body[k] === "boolean"
    );
  if (!isValid) {
    return c.json({ error: "Invalid preferences format" }, 400);
  }
  try {
    const updated = await db
      .update(users)
      .set({ notificationPreferences: body })
      .where(eq(users.id, id))
      .returning({ notificationPreferences: users.notificationPreferences });
    if (updated.length === 0) {
      return c.json({ error: "User not found" }, 404);
    }
    return c.json(updated[0].notificationPreferences);
  } catch (error) {
    console.error("Error updating notification preferences:", error);
    return c.json({ error: "Failed to update notification preferences" }, 500);
  }
});

export default app;
