import { Database } from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from '../src/db/schema';

// Create an in-memory test database
export function createTestDatabase() {
  const sqlite = new (require('better-sqlite3'))(':memory:');
  const db = drizzle(sqlite, { schema });
  
  // Run migrations or create tables
  // You might need to adjust this based on your migration setup
  return { db, sqlite };
}

// Helper to create test user
export async function createTestUser(db: any, userData = {}) {
  const defaultUser = {
    email: 'test@example.com',
    name: 'Test User',
    role: 'user',
    ...userData
  };
  
  // Insert user and return
  // Adjust based on your actual user creation logic
  return defaultUser;
}

// Helper to clean up database after tests
export function cleanupTestDatabase(sqlite: Database) {
  sqlite.close();
}