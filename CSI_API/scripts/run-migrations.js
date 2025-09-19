#!/usr/bin/env bun
"use strict";
/**
 * Run database migrations
 * This script applies all SQL migrations in the correct order
 */
Object.defineProperty(exports, "__esModule", { value: true });
var bun_sqlite_1 = require("bun:sqlite");
var fs_1 = require("fs");
var path_1 = require("path");
var dbPath = process.env.DB_FILE_NAME || process.env.DATABASE_URL || "./local.db";
var migrationsDir = path_1.default.join(import.meta.dir, "../drizzle");
console.log("🔧 Running database migrations...");
console.log("Database: ".concat(dbPath));
console.log("Migrations directory: ".concat(migrationsDir));
// Ensure database file exists
var db = new bun_sqlite_1.Database(dbPath);
// Enable foreign keys
db.exec("PRAGMA foreign_keys = ON;");
// Create migrations table if it doesn't exist
db.exec("\n  CREATE TABLE IF NOT EXISTS __drizzle_migrations (\n    id INTEGER PRIMARY KEY AUTOINCREMENT,\n    hash TEXT NOT NULL UNIQUE,\n    created_at INTEGER DEFAULT (unixepoch())\n  )\n");
// Get list of applied migrations
var appliedMigrations = db
    .prepare("SELECT hash FROM __drizzle_migrations")
    .all();
var appliedHashes = new Set(appliedMigrations.map(function (m) { return m.hash; }));
// Get migration files
var migrationFiles = [
    "0000_volatile_vermin.sql",
    "0001_living_young_avengers.sql",
    "0002_giant_galactus.sql"
].filter(function (file) {
    var filePath = path_1.default.join(migrationsDir, file);
    if (!(0, fs_1.existsSync)(filePath)) {
        console.log("\u26A0\uFE0F Migration file not found: ".concat(file));
        return false;
    }
    return true;
});
console.log("Found ".concat(migrationFiles.length, " migration files"));
// Apply migrations in order
var appliedCount = 0;
for (var _i = 0, migrationFiles_1 = migrationFiles; _i < migrationFiles_1.length; _i++) {
    var file = migrationFiles_1[_i];
    var hash = file.replace('.sql', '');
    if (appliedHashes.has(hash)) {
        console.log("\u2713 Already applied: ".concat(file));
        continue;
    }
    console.log("\uD83D\uDCDD Applying migration: ".concat(file));
    try {
        var filePath = path_1.default.join(migrationsDir, file);
        var sql = (0, fs_1.readFileSync)(filePath, 'utf-8');
        // Split by statement-breakpoint and execute each statement
        var statements = sql.split('--> statement-breakpoint');
        for (var _a = 0, statements_1 = statements; _a < statements_1.length; _a++) {
            var statement = statements_1[_a];
            var cleanedStatement = statement.trim();
            if (cleanedStatement) {
                try {
                    db.exec(cleanedStatement);
                }
                catch (error) {
                    // Ignore errors for already existing tables/indexes
                    if (!error.message.includes('already exists')) {
                        console.error("Error executing statement: ".concat(error.message));
                        console.error("Statement: ".concat(cleanedStatement.substring(0, 100), "..."));
                    }
                }
            }
        }
        // Mark migration as applied
        db.prepare("INSERT INTO __drizzle_migrations (hash) VALUES (?)").run(hash);
        console.log("\u2705 Applied: ".concat(file));
        appliedCount++;
    }
    catch (error) {
        console.error("\u274C Failed to apply ".concat(file, ":"), error);
        process.exit(1);
    }
}
// Verify tables exist
var tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log("\n\uD83D\uDCCA Database has ".concat(tables.length, " tables:"));
console.log(tables.map(function (t) { return t.name; }).join(', '));
// Check for critical tables
var criticalTables = ['users', 'sites', 'devices', 'roles', 'alerts', 'user_sites'];
var missingTables = criticalTables.filter(function (t) { return !tables.some(function (table) { return table.name === t; }); });
if (missingTables.length > 0) {
    console.error("\n\u274C Missing critical tables: ".concat(missingTables.join(', ')));
    process.exit(1);
}
db.close();
console.log("\n\u2705 Migrations complete! Applied ".concat(appliedCount, " new migrations."));
