import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";
import * as schema from "./db/schema";
import { eq } from "drizzle-orm";

export const auth = betterAuth({
  baseURL: "http://localhost:3000/auth",
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema,
    usePlural: true,
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  user: {
    additionalFields: {
      roleId: { type: "number" },
    },
  },
  hooks: {
    before: async (ctx) => {
      if (ctx.path === "/sign-up/email") {
        const email = ctx.body.email as string;
        if (!email.endsWith(".mil")) {
          return ctx.json({ message: "Email must end with .mil" }, { status: 400 });
        }
      }
    },
    after: async (ctx) => {
      if (ctx.path === "/sign-up/email" && ctx.returned?.user) {
        await db
          .update(schema.users)
          .set({ roleId: 1 })
          .where(eq(schema.users.id, ctx.returned.user.id));
      }
    },
  },
});
