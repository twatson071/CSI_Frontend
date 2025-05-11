// User-Sites Join Table
export const userSites = sqliteTable("user_sites", {
  userId: int().references(() => users.id), // Foreign key to users table
  siteId: int().references(() => sites.id), // Foreign key to sites table
  createdAt: text().default("CURRENT_TIMESTAMP"),
  primaryKey: ["userId", "siteId"], // Composite primary key
});
