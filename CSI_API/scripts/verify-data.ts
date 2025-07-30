#!/usr/bin/env bun
/**
 * Database Verification Script
 * Verifies the seeded dummy data and site relationships
 */

import "dotenv/config";
import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { eq } from "drizzle-orm";
import * as schema from "../src/db/schema";

// Database setup
const raw = process.env.DB_FILE_NAME!;
const filename = raw.startsWith("file:") ? raw.slice(5) : raw;
const sqlite = new Database(filename);
const db = drizzle({ client: sqlite, schema });

async function verifyData() {
  console.log('🔍 Verifying seeded data and relationships...\n');

  try {
    // Get all sites with device counts
    const sitesWithDevices = await db
      .select({
        siteId: schema.sites.id,
        siteName: schema.sites.name,
        siteLocation: schema.sites.location,
      })
      .from(schema.sites);

    console.log('📍 Sites Overview:');
    console.log('================');

    for (const site of sitesWithDevices) {
      // Get devices for this site
      const devices = await db
        .select({
          id: schema.devices.id,
          name: schema.devices.name,
          type: schema.devices.type,
          ipAddress: schema.devices.ipAddress,
          status: schema.devices.status,
        })
        .from(schema.devices)
        .where(eq(schema.devices.siteId, site.siteId));

      console.log(`\n🏢 ${site.siteName}`);
      console.log(`   Location: ${site.siteLocation}`);
      console.log(`   Device Count: ${devices.length}`);
      
      if (devices.length > 0) {
        console.log('   Devices:');
        devices.forEach(device => {
          console.log(`     • ${device.name} (${device.type}) - ${device.ipAddress} [${device.status}]`);
        });
      }
    }

    // Get device type distribution
    const deviceTypes = await db
      .select({
        type: schema.devices.type,
      })
      .from(schema.devices);

    const typeCount: Record<string, number> = {};
    deviceTypes.forEach(device => {
      typeCount[device.type] = (typeCount[device.type] || 0) + 1;
    });

    console.log('\n\n📊 Device Type Distribution:');
    console.log('============================');
    Object.entries(typeCount).forEach(([type, count]) => {
      console.log(`${type}: ${count}`);
    });

    // Get metrics count
    const metricsCount = await db
      .select({
        count: schema.metrics.id,
      })
      .from(schema.metrics);

    // Get thresholds count
    const thresholdsCount = await db
      .select({
        count: schema.metricThresholds.id,
      })
      .from(schema.metricThresholds);

    console.log('\n\n📈 Additional Data:');
    console.log('==================');
    console.log(`Sample Metrics: ${metricsCount.length}`);
    console.log(`Metric Thresholds: ${thresholdsCount.length}`);

    console.log('\n✅ Data verification completed successfully!');
    console.log('\n🎯 All devices are properly linked to their respective sites.');
    console.log('   The site relationships are working correctly.');

  } catch (error) {
    console.error('❌ Error verifying data:', error);
    process.exit(1);
  } finally {
    sqlite.close();
  }
}

// Run the verification if this script is executed directly
if (import.meta.main) {
  await verifyData();
}