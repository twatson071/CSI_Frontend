import "dotenv/config";
import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import * as schema from "./db/schema";

const raw = process.env.DB_FILE_NAME!;
const filename = raw.startsWith("file:") ? raw.slice(5) : raw;

console.log(`Opening database: ${filename}`);

// Open database with proper settings
const sqlite = new Database(filename, {
  create: true,
  readwrite: true,
});

// Enable WAL mode for better concurrent access
sqlite.exec("PRAGMA journal_mode = WAL;");
sqlite.exec("PRAGMA busy_timeout = 5000;"); // Wait up to 5 seconds if database is locked

export const db = drizzle({ client: sqlite, schema });
