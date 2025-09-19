#!/usr/bin/env bun
/**
 * Database Initialization Script
 * Ensures database exists and has proper schema before application starts
 */

import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import * as schema from "../src/db/schema";
import { existsSync } from "fs";
import { mkdir } from "fs/promises";
import path from "path";

const initDatabase = async () => {
  console.log("🔧 Database Initialization Starting...");

  try {
    // Get database path from environment
    const dbPath = process.env.DB_FILE_NAME || process.env.DATABASE_URL || "./local.db";
    const dbDir = path.dirname(dbPath);

    // Ensure directory exists
    if (!existsSync(dbDir)) {
      console.log(`📁 Creating database directory: ${dbDir}`);
      await mkdir(dbDir, { recursive: true });
    }

    console.log(`📊 Initializing database at: ${dbPath}`);

    // Open database connection
    const sqlite = new Database(dbPath);
    const db = drizzle({ client: sqlite, schema });

    // Check if tables exist
    const tables = sqlite.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
    console.log(`📋 Found ${tables.length} existing tables`);

    if (tables.length === 0) {
      console.log("⚠️  No tables found. Database needs initialization.");
      console.log("💡 Please run: bun x drizzle-kit push");
      process.exit(1);
    }

    // Verify critical tables exist
    const requiredTables = ['users', 'sites', 'devices', 'roles', 'alerts'];
    const tableNames = tables.map((t: any) => t.name);
    const missingTables = requiredTables.filter(t => !tableNames.includes(t));

    if (missingTables.length > 0) {
      console.log(`❌ Missing required tables: ${missingTables.join(', ')}`);
      console.log("💡 Please run: bun x drizzle-kit push");
      process.exit(1);
    }

    console.log("✅ Database schema verified successfully");

    // Check if database has data
    const deviceCount = sqlite.prepare("SELECT COUNT(*) as count FROM devices").get() as any;
    const siteCount = sqlite.prepare("SELECT COUNT(*) as count FROM sites").get() as any;

    console.log(`📊 Database contains: ${deviceCount.count} devices, ${siteCount.count} sites`);

    if (deviceCount.count === 0 && process.env.DEMO_MODE === 'true') {
      console.log("💡 No data found in demo mode. Run: bun run scripts/seed-dummy-data.ts");
    }

    // Close connection
    sqlite.close();
    console.log("✅ Database initialization complete");

  } catch (error) {
    console.error("❌ Database initialization failed:", error);
    process.exit(1);
  }
};

// Run if called directly
if (import.meta.main) {
  initDatabase();
}