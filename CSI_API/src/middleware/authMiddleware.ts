import { createMiddleware } from "hono/factory";
import { auth } from "../auth";
import { db } from "../db";
import { eq } from "drizzle-orm";
import { users } from "../db/schema";

type UserWithRole = Awaited<ReturnType<typeof getUserWithRole>>;

async function getUserWithRole(userId: number) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    with: {
      role: true,
    },
  });
  return user;
}

export const authMiddleware = createMiddleware<{
  Variables: {
    user: UserWithRole;
  };
}>(async (c, next) => {
  const session = await auth.getSession(c.req.raw);
  if (!session?.user?.id) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const user = await getUserWithRole(session.user.id);

  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  c.set("user", user);
  await next();
});

export const permissionMiddleware = (permission: string) => {
  return createMiddleware(async (c, next) => {
    const user = c.get("user") as UserWithRole;

    if (!user?.role?.permissions) {
      return c.json({ error: "Forbidden" }, 403);
    }

    const permissions = user.role.permissions.split(",");
    if (!permissions.includes(permission)) {
      return c.json({ error: "Forbidden" }, 403);
    }

    await next();
  });
};
