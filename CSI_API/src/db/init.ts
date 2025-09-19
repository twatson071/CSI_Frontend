/**
 * Database initialization helper
 * Ensures database is properly initialized before use
 */

import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import * as schema from "./schema";

export const initializeDatabase = (dbPath: string) => {
  console.log(`Opening database: ${dbPath}`);

  try {
    const sqlite = new Database(dbPath);

    // Check if tables exist
    const tables = sqlite.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();

    if (tables.length === 0) {
      console.error("❌ Database has no tables!");
      console.error("Please run: bun x drizzle-kit push");

      // In production/demo, this is fatal
      if (process.env.NODE_ENV === 'production' || process.env.DEMO_MODE === 'true') {
        throw new Error("Database not initialized. Please run database migrations.");
      }
    }

    // Create drizzle instance
    const db = drizzle({ client: sqlite, schema });

    console.log(`✅ Database initialized with ${tables.length} tables`);

    return { db, sqlite };
  } catch (error) {
    console.error("Failed to initialize database:", error);
    throw error;
  }
};

/**
 * Wait for database to be ready
 * Useful for startup sequences
 */
export const waitForDatabase = async (dbPath: string, maxRetries = 30): Promise<boolean> => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const sqlite = new Database(dbPath);
      const tables = sqlite.prepare("SELECT COUNT(*) as count FROM sqlite_master WHERE type='table'").get() as any;
      sqlite.close();

      if (tables.count > 0) {
        return true;
      }
    } catch (error) {
      // Database not ready yet
    }

    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  return false;
};