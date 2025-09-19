"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
require("dotenv/config");
var bun_sqlite_1 = require("bun:sqlite");
var bun_sqlite_2 = require("drizzle-orm/bun-sqlite");
var schema = require("./db/schema");
var fs_1 = require("fs");
var raw = process.env.DB_FILE_NAME;
var filename = raw.startsWith("file:") ? raw.slice(5) : raw;
console.log("Opening database: ".concat(filename));
// Check if database exists and has tables
var needsInit = false;
if (!(0, fs_1.existsSync)(filename)) {
    console.log("Database file does not exist, will be created");
    needsInit = true;
}
// Open database with proper settings
var sqlite = new bun_sqlite_1.Database(filename, {
    create: true,
    readwrite: true,
});
// Enable WAL mode for better concurrent access
sqlite.exec("PRAGMA journal_mode = WAL;");
sqlite.exec("PRAGMA busy_timeout = 5000;"); // Wait up to 5 seconds if database is locked
sqlite.exec("PRAGMA synchronous = NORMAL;"); // Better performance with acceptable safety
// Check if tables exist
if (!needsInit) {
    var tables = sqlite.prepare("SELECT COUNT(*) as count FROM sqlite_master WHERE type='table'").get();
    if (tables.count === 0) {
        console.error("⚠️  Database exists but has no tables!");
        console.error("Run: bun x drizzle-kit push --config=drizzle.config.ts");
        needsInit = true;
    }
    else {
        console.log("\u2705 Database has ".concat(tables.count, " tables"));
    }
}
if (needsInit && (process.env.NODE_ENV === 'production' || process.env.DEMO_MODE === 'true')) {
    console.error("❌ Database not initialized in production/demo mode!");
    console.error("Please ensure database setup runs before starting the application.");
    // Don't exit immediately - let supervisor retry
    setTimeout(function () { return process.exit(1); }, 5000);
}
exports.db = (0, bun_sqlite_2.drizzle)({ client: sqlite, schema: schema });
