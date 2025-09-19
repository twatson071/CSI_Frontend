import "dotenv/config";
import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import * as schema from "./db/schema";
import { existsSync } from "fs";

const raw = process.env.DB_FILE_NAME!;
const filename = raw.startsWith("file:") ? raw.slice(5) : raw;

console.log(`Opening database: ${filename}`);

// Check if database exists and has tables
let needsInit = false;
if (!existsSync(filename)) {
  console.log("Database file does not exist, will be created");
  needsInit = true;
}

// Open database with proper settings
const sqlite = new Database(filename, {
  create: true,
  readwrite: true,
});

// Enable WAL mode for better concurrent access
sqlite.exec("PRAGMA journal_mode = WAL;");
sqlite.exec("PRAGMA busy_timeout = 5000;"); // Wait up to 5 seconds if database is locked
sqlite.exec("PRAGMA synchronous = NORMAL;"); // Better performance with acceptable safety

// Check if tables exist
if (!needsInit) {
  const tables = sqlite.prepare("SELECT COUNT(*) as count FROM sqlite_master WHERE type='table'").get() as any;
  if (tables.count === 0) {
    console.error("⚠️  Database exists but has no tables!");
    console.error("Run: bun x drizzle-kit push --config=drizzle.config.ts");
    needsInit = true;
  } else {
    console.log(`✅ Database has ${tables.count} tables`);
  }
}

if (needsInit && (process.env.NODE_ENV === 'production' || process.env.DEMO_MODE === 'true')) {
  console.error("❌ Database not initialized in production/demo mode!");
  console.error("Please ensure database setup runs before starting the application.");
  // Don't exit immediately - let supervisor retry
  setTimeout(() => process.exit(1), 5000);
}

export const db = drizzle({ client: sqlite, schema });
