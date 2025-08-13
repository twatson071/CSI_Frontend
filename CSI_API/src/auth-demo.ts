// Demo authentication configuration with relaxed requirements
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";
import * as schema from "./db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

// Demo credentials
const DEMO_CREDENTIALS = {
  email: "demo@csi.mil",
  password: "DemoPass123!"
};

export const authDemo = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3001",
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
      // In demo mode, allow any .mil email or the demo email
      if (ctx.path === "/sign-up/email") {
        const email = ctx.body.email as string;
        
        // Allow demo email or any .mil email
        if (email !== DEMO_CREDENTIALS.email && !email.endsWith(".mil")) {
          return ctx.json({ 
            message: "Demo mode: Use demo@csi.mil or any .mil email" 
          }, { status: 400 });
        }
      }
      
      // Auto-login for demo credentials
      if (ctx.path === "/sign-in/email" && process.env.DEMO_MODE === "true") {
        const { email, password } = ctx.body as { email: string; password: string };
        
        if (email === DEMO_CREDENTIALS.email && password === DEMO_CREDENTIALS.password) {
          // Get or create demo user
          const users = await db.select().from(schema.users)
            .where(eq(schema.users.email, DEMO_CREDENTIALS.email))
            .limit(1);
          
          if (users.length === 0) {
            // Create demo user if doesn't exist
            const hashedPassword = await bcrypt.hash(DEMO_CREDENTIALS.password, 10);
            
            // Get or create admin role
            let adminRole = await db.select().from(schema.roles)
              .where(eq(schema.roles.name, "Admin"))
              .limit(1);
            
            if (adminRole.length === 0) {
              const [newRole] = await db.insert(schema.roles).values({
                name: "Admin",
                permissions: JSON.stringify(["all"])
              }).returning();
              adminRole = [newRole];
            }
            
            await db.insert(schema.users).values({
              name: "Demo User",
              email: DEMO_CREDENTIALS.email,
              passwordHash: hashedPassword,
              roleId: adminRole[0].id
            });
          }
        }
      }
    },
    after: async (ctx) => {
      // Set default role for new users
      if (ctx.path === "/sign-up/email" && ctx.returned?.user) {
        // Get or create default role
        let defaultRole = await db.select().from(schema.roles)
          .where(eq(schema.roles.name, "Viewer"))
          .limit(1);
        
        if (defaultRole.length === 0) {
          const [newRole] = await db.insert(schema.roles).values({
            name: "Viewer",
            permissions: JSON.stringify(["read"])
          }).returning();
          defaultRole = [newRole];
        }
        
        await db
          .update(schema.users)
          .set({ roleId: defaultRole[0].id })
          .where(eq(schema.users.id, ctx.returned.user.id));
      }
    },
  },
});

// Export demo credentials for reference
export const DEMO_INFO = {
  credentials: DEMO_CREDENTIALS,
  message: "Use demo@csi.mil / DemoPass123! to login",
  note: "This is a demo instance with sample data"
};