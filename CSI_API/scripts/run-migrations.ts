#!/usr/bin/env bun
/**
 * Run database migrations
 * This script applies all SQL migrations in the correct order
 */

import { Database } from "bun:sqlite";
import { readFileSync, existsSync } from "fs";
import path from "path";

const dbPath = process.env.DB_FILE_NAME || process.env.DATABASE_URL || "./local.db";
const migrationsDir = path.join(import.meta.dir, "../drizzle");

console.log("🔧 Running database migrations...");
console.log(`Database: ${dbPath}`);
console.log(`Migrations directory: ${migrationsDir}`);

// Ensure database file exists
const db = new Database(dbPath);

// Enable foreign keys
db.exec("PRAGMA foreign_keys = ON;");

// Create migrations table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS __drizzle_migrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    hash TEXT NOT NULL UNIQUE,
    created_at INTEGER DEFAULT (unixepoch())
  )
`);

// Get list of applied migrations
const appliedMigrations = db
  .prepare("SELECT hash FROM __drizzle_migrations")
  .all() as { hash: string }[];

const appliedHashes = new Set(appliedMigrations.map(m => m.hash));

// Get migration files
const migrationFiles = [
  "0000_volatile_vermin.sql",
  "0001_living_young_avengers.sql",
  "0002_giant_galactus.sql"
].filter(file => {
  const filePath = path.join(migrationsDir, file);
  if (!existsSync(filePath)) {
    console.log(`⚠️ Migration file not found: ${file}`);
    return false;
  }
  return true;
});

console.log(`Found ${migrationFiles.length} migration files`);

// Apply migrations in order
let appliedCount = 0;
for (const file of migrationFiles) {
  const hash = file.replace('.sql', '');

  if (appliedHashes.has(hash)) {
    console.log(`✓ Already applied: ${file}`);
    continue;
  }

  console.log(`📝 Applying migration: ${file}`);

  try {
    const filePath = path.join(migrationsDir, file);
    const sql = readFileSync(filePath, 'utf-8');

    // Split by statement-breakpoint and execute each statement
    const statements = sql.split('--> statement-breakpoint');

    for (const statement of statements) {
      const cleanedStatement = statement.trim();
      if (cleanedStatement) {
        try {
          db.exec(cleanedStatement);
        } catch (error: any) {
          // Ignore errors for already existing tables/indexes
          if (!error.message.includes('already exists')) {
            console.error(`Error executing statement: ${error.message}`);
            console.error(`Statement: ${cleanedStatement.substring(0, 100)}...`);
          }
        }
      }
    }

    // Mark migration as applied
    db.prepare("INSERT INTO __drizzle_migrations (hash) VALUES (?)").run(hash);
    console.log(`✅ Applied: ${file}`);
    appliedCount++;
  } catch (error) {
    console.error(`❌ Failed to apply ${file}:`, error);
    process.exit(1);
  }
}

// Verify tables exist
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all() as { name: string }[];
console.log(`\n📊 Database has ${tables.length} tables:`);
console.log(tables.map(t => t.name).join(', '));

// Check for critical tables
const criticalTables = ['users', 'sites', 'devices', 'roles', 'alerts', 'user_sites'];
const missingTables = criticalTables.filter(t => !tables.some(table => table.name === t));

if (missingTables.length > 0) {
  console.error(`\n❌ Missing critical tables: ${missingTables.join(', ')}`);
  process.exit(1);
}

db.close();

console.log(`\n✅ Migrations complete! Applied ${appliedCount} new migrations.`);