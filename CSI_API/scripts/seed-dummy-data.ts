#!/usr/bin/env bun
/**
 * Database Seeder Script for CSI Frontend Demo Data
 * Seeds the database with comprehensive dummy devices and sites
 */

import "dotenv/config";
import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { like, eq } from "drizzle-orm";
import * as schema from "../src/db/schema";

// Database setup
const raw = process.env.DB_FILE_NAME!;
const filename = raw.startsWith("file:") ? raw.slice(5) : raw;
const sqlite = new Database(filename);
const db = drizzle({ client: sqlite, schema });

// Site data
const siteData = [
  {
    name: 'Primary Data Center',
    location: 'Building A - Floor 3'
  },
  {
    name: 'Secondary Operations Center',
    location: 'Building B - Floor 2'
  },
  {
    name: 'RF Communication Hub',
    location: 'Tower Complex - East Wing'
  },
  {
    name: 'Security Operations Center',
    location: 'Building C - Ground Floor'
  }
];

// Device data with all the inventory devices
const deviceData = [
  // PDU Devices
  {
    name: 'PDU 1 AP7921B',
    type: 'PDU',
    ipAddress: '192.168.1.101',
    serviceUrl: 'http://192.168.1.101/snmp',
    status: 'normal' as const,
    siteIndex: 0,
    parameters: ['outletCount', 'maxCurrent', 'voltageRating', 'phaseType', 'ratedPower'],
    data: ['24', '16', '230', 'Single Phase', '3680']
  },
  {
    name: 'PDU 2 AP8870',
    type: 'PDU',
    ipAddress: '192.168.1.102',
    serviceUrl: 'http://192.168.1.102/snmp',
    status: 'normal' as const,
    siteIndex: 0,
    parameters: ['outletCount', 'maxCurrent', 'voltageRating', 'phaseType', 'ratedPower'],
    data: ['36', '32', '230', 'Three Phase', '11040']
  },

  // UPS Device
  {
    name: 'UPS 1 SMX3000RMHV2U',
    type: 'UPS',
    ipAddress: '192.168.1.103',
    serviceUrl: 'http://192.168.1.103/snmp',
    status: 'normal' as const,
    siteIndex: 0,
    parameters: ['capacity', 'batteryCapacity', 'inputVoltage', 'outputVoltage', 'loadPercentage'],
    data: ['3000', '100', '230', '230', '85']
  },

  // Network Switches
  {
    name: 'Switch 1 C9300-24T',
    type: 'Switch',
    ipAddress: '192.168.1.201',
    serviceUrl: 'http://192.168.1.201/snmp',
    status: 'normal' as const,
    siteIndex: 1,
    parameters: ['portCount', 'portSpeed', 'poeEnabled', 'poePower', 'activePortCount'],
    data: ['24', '1000', 'true', '370', '18']
  },
  {
    name: 'Switch 2 C9300-48P',
    type: 'Switch',
    ipAddress: '192.168.1.202',
    serviceUrl: 'http://192.168.1.202/snmp',
    status: 'normal' as const,
    siteIndex: 1,
    parameters: ['portCount', 'portSpeed', 'poeEnabled', 'poePower', 'activePortCount'],
    data: ['48', '1000', 'true', '740', '42']
  },

  // Server Devices
  {
    name: 'Server 1 RAX XS4-11E3',
    type: 'Server',
    ipAddress: '192.168.1.301',
    serviceUrl: 'http://192.168.1.301/api',
    status: 'normal' as const,
    siteIndex: 0,
    parameters: ['cpuCores', 'ramGB', 'storageGB', 'cpuUsage', 'ramUsage'],
    data: ['16', '64', '2000', '35', '68']
  },
  {
    name: 'Server 2 Z2 G9 Mini',
    type: 'Server',
    ipAddress: '192.168.1.302',
    serviceUrl: 'http://192.168.1.302/api',
    status: 'normal' as const,
    siteIndex: 0,
    parameters: ['cpuCores', 'ramGB', 'storageGB', 'cpuUsage', 'ramUsage'],
    data: ['8', '32', '1000', '22', '45']
  },
  {
    name: 'Cape Server',
    type: 'Server',
    ipAddress: '192.168.3.301',
    serviceUrl: 'http://192.168.3.301/api',
    status: 'normal' as const,
    siteIndex: 2,
    parameters: ['cpuCores', 'ramGB', 'storageGB', 'cpuUsage', 'ramUsage'],
    data: ['24', '128', '4000', '55', '72']
  },
  {
    name: 'Time Server',
    type: 'Server',
    ipAddress: '192.168.2.401',
    serviceUrl: 'http://192.168.2.401/ntp',
    status: 'normal' as const,
    siteIndex: 1,
    parameters: ['ntpServers', 'accuracy', 'syncStatus', 'stratum', 'clientCount'],
    data: ['2', '±1ms', 'synchronized', '2', '85']
  },

  // RF Equipment
  {
    name: 'RF Matrix Switch',
    type: 'RF Equipment',
    ipAddress: '192.168.3.501',
    serviceUrl: 'http://192.168.3.501/api',
    status: 'normal' as const,
    siteIndex: 2,
    parameters: ['inputPorts', 'outputPorts', 'frequencyRange', 'insertionLoss', 'activeConnections'],
    data: ['32', '16', '1-6000 MHz', '< 3dB', '12']
  },
  {
    name: 'GNS-196-1U Signal Generator',
    type: 'RF Equipment',
    ipAddress: '192.168.3.502',
    serviceUrl: 'http://192.168.3.502/scpi',
    status: 'normal' as const,
    siteIndex: 2,
    parameters: ['frequencyRange', 'outputPower', 'phaseNoise', 'currentFrequency', 'currentPower'],
    data: ['100 kHz - 20 GHz', '+20 dBm', '< -110 dBc/Hz', '2.4 GHz', '-10 dBm']
  },
  {
    name: 'Cape SDR System',
    type: 'RF Equipment',
    ipAddress: '192.168.3.503',
    serviceUrl: 'http://192.168.3.503/api',
    status: 'normal' as const,
    siteIndex: 2,
    parameters: ['channels', 'bandwidth', 'frequencyRange', 'sampleRate', 'activeChannels'],
    data: ['16', '100 MHz', '70 MHz - 6 GHz', '250 MSPS', '8']
  },

  // Spectrum Analyzer
  {
    name: 'Spectrum Analyzer 9010B',
    type: 'Spectrum Analyzer',
    ipAddress: '192.168.3.601',
    serviceUrl: 'http://192.168.3.601/scpi',
    status: 'normal' as const,
    siteIndex: 2,
    parameters: ['frequencyRange', 'dynamicRange', 'phaseNoise', 'currentSpan', 'centerFrequency'],
    data: ['9 kHz - 26.5 GHz', '165 dB', '< -110 dBc/Hz', '1 GHz', '2.4 GHz']
  },

  // Storage Device
  {
    name: 'NAS Storage ME5012',
    type: 'Storage',
    ipAddress: '192.168.1.701',
    serviceUrl: 'http://192.168.1.701/api',
    status: 'normal' as const,
    siteIndex: 0,
    parameters: ['capacity', 'usedSpace', 'availableSpace', 'raidLevel', 'diskCount'],
    data: ['48000', '32000', '16000', 'RAID 6', '24']
  },

  // Security Cameras
  {
    name: 'Security Camera 1',
    type: 'Camera',
    ipAddress: '192.168.4.801',
    serviceUrl: 'rtsp://192.168.4.801:554/stream1',
    status: 'normal' as const,
    siteIndex: 3,
    parameters: ['resolution', 'frameRate', 'compressionFormat', 'nightVision', 'motionDetection'],
    data: ['3840x2160', '30', 'H.265', 'true', 'true']
  },
  {
    name: 'Security Camera 2',
    type: 'Camera',
    ipAddress: '192.168.1.802',
    serviceUrl: 'rtsp://192.168.1.802:554/stream1',
    status: 'normal' as const,
    siteIndex: 0,
    parameters: ['resolution', 'frameRate', 'compressionFormat', 'ptzCapable', 'zoomRange'],
    data: ['1920x1080', '60', 'H.264', 'true', '20X']
  }
];

async function seedDatabase() {
  console.log('🌱 Starting database seeding...');

  try {
    // Clear existing data (optional - remove if you want to keep existing data)
    console.log('🧹 Clearing existing dummy data...');
    
    // Clear user-site relationships first (foreign key constraint)
    await db.delete(schema.userSites);
    await db.delete(schema.devices).where(like(schema.devices.name, '%PDU%'));
    await db.delete(schema.devices).where(like(schema.devices.name, '%UPS%'));
    await db.delete(schema.devices).where(like(schema.devices.name, '%Switch%'));
    await db.delete(schema.devices).where(like(schema.devices.name, '%Server%'));
    await db.delete(schema.devices).where(like(schema.devices.name, '%Cape%'));
    await db.delete(schema.devices).where(like(schema.devices.name, '%Time Server%'));
    await db.delete(schema.devices).where(like(schema.devices.name, '%RF%'));
    await db.delete(schema.devices).where(like(schema.devices.name, '%GNS%'));
    await db.delete(schema.devices).where(like(schema.devices.name, '%Spectrum%'));
    await db.delete(schema.devices).where(like(schema.devices.name, '%NAS%'));
    await db.delete(schema.devices).where(like(schema.devices.name, '%Camera%'));
    await db.delete(schema.sites).where(like(schema.sites.name, '%Data Center%'));
    await db.delete(schema.sites).where(like(schema.sites.name, '%Operations Center%'));
    await db.delete(schema.sites).where(like(schema.sites.name, '%Communication Hub%'));

    // Create default role if it doesn't exist
    console.log('👤 Setting up default role...');
    let defaultRole;
    try {
      [defaultRole] = await db.insert(schema.roles).values({
        name: 'Admin',
        permissions: JSON.stringify(['all'])
      }).returning();
    } catch (error) {
      // Role might already exist, get it
      const existingRole = await db.select().from(schema.roles).where(eq(schema.roles.name, 'Admin')).limit(1);
      if (existingRole.length > 0) {
        defaultRole = existingRole[0];
      } else {
        throw error;
      }
    }
    console.log(`✅ Default role ready: ${defaultRole.name}`);

    // Create default user if it doesn't exist  
    console.log('👤 Setting up default user...');
    let defaultUser;
    try {
      [defaultUser] = await db.insert(schema.users).values({
        name: 'Dev User',
        email: 'dev@localhost.com',
        passwordHash: '$2a$10$dummy.hash.for.development.only',
        roleId: defaultRole.id
      }).returning();
    } catch (error) {
      // User might already exist, get it
      const existingUser = await db.select().from(schema.users).where(eq(schema.users.email, 'dev@localhost.com')).limit(1);
      if (existingUser.length > 0) {
        defaultUser = existingUser[0];
      } else {
        throw error;
      }
    }
    console.log(`✅ Default user ready: ${defaultUser.name} (ID: ${defaultUser.id})`);

    // Insert sites
    console.log('📍 Inserting sites...');
    const insertedSites = await db.insert(schema.sites).values(siteData).returning();
    console.log(`✅ Inserted ${insertedSites.length} sites`);

    // Insert devices
    console.log('🖥️  Inserting devices...');
    const devicesWithSiteIds = deviceData.map(device => ({
      name: device.name,
      type: device.type,
      ipAddress: device.ipAddress,
      serviceUrl: device.serviceUrl,
      status: device.status,
      siteId: insertedSites[device.siteIndex].id,
      parameters: JSON.stringify(device.parameters),
      data: JSON.stringify(device.data)
    }));

    const insertedDevices = await db.insert(schema.devices).values(devicesWithSiteIds).returning();
    console.log(`✅ Inserted ${insertedDevices.length} devices`);

    // Insert some sample metrics for devices
    console.log('📊 Inserting sample metrics...');
    const metricsData = [];
    for (const device of insertedDevices) {
      // Add different metrics based on device type
      if (device.type === 'PDU') {
        metricsData.push(
          { deviceId: device.id, metricType: 'current_load', value: Math.random() * 15 + 5 },
          { deviceId: device.id, metricType: 'power_draw', value: Math.random() * 3000 + 1000 },
          { deviceId: device.id, metricType: 'temperature', value: Math.random() * 10 + 20 }
        );
      } else if (device.type === 'UPS') {
        metricsData.push(
          { deviceId: device.id, metricType: 'battery_level', value: Math.random() * 20 + 80 },
          { deviceId: device.id, metricType: 'load_percentage', value: Math.random() * 30 + 60 },
          { deviceId: device.id, metricType: 'temperature', value: Math.random() * 15 + 25 }
        );
      } else if (device.type === 'Server') {
        metricsData.push(
          { deviceId: device.id, metricType: 'cpu_usage', value: Math.random() * 40 + 20 },
          { deviceId: device.id, metricType: 'memory_usage', value: Math.random() * 30 + 40 },
          { deviceId: device.id, metricType: 'temperature', value: Math.random() * 20 + 30 }
        );
      } else if (device.type === 'Switch') {
        metricsData.push(
          { deviceId: device.id, metricType: 'port_utilization', value: Math.random() * 50 + 30 },
          { deviceId: device.id, metricType: 'power_consumption', value: Math.random() * 50 + 50 },
          { deviceId: device.id, metricType: 'temperature', value: Math.random() * 15 + 25 }
        );
      }
    }

    if (metricsData.length > 0) {
      await db.insert(schema.metrics).values(metricsData);
      console.log(`✅ Inserted ${metricsData.length} sample metrics`);
    }

    // Insert some sample metric thresholds
    console.log('⚠️  Inserting metric thresholds...');
    const thresholdsData = [];
    for (const device of insertedDevices) {
      if (device.type === 'PDU') {
        thresholdsData.push({
          deviceId: device.id,
          metricType: 'current_load',
          cautionThreshold: 12.0,
          seriousThreshold: 14.0,
          criticalThreshold: 15.5,
          operator: 'greater_than' as const
        });
      } else if (device.type === 'UPS') {
        thresholdsData.push({
          deviceId: device.id,
          metricType: 'battery_level',
          cautionThreshold: 30.0,
          seriousThreshold: 20.0,
          criticalThreshold: 10.0,
          operator: 'less_than' as const
        });
      } else if (device.type === 'Server') {
        thresholdsData.push({
          deviceId: device.id,
          metricType: 'cpu_usage',
          cautionThreshold: 80.0,
          seriousThreshold: 90.0,
          criticalThreshold: 95.0,
          operator: 'greater_than' as const
        });
      }
    }

    if (thresholdsData.length > 0) {
      await db.insert(schema.metricThresholds).values(thresholdsData);
      console.log(`✅ Inserted ${thresholdsData.length} metric thresholds`);
    }

    // Associate default user with all sites
    console.log('🔗 Creating user-site relationships...');
    const userSiteData = insertedSites.map(site => ({
      userId: defaultUser.id,
      siteId: site.id
    }));
    
    await db.insert(schema.userSites).values(userSiteData);
    console.log(`✅ Associated user ${defaultUser.name} with ${userSiteData.length} sites`);

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`   User: ${defaultUser.name} (${defaultUser.email})`);
    console.log(`   Role: ${defaultRole.name}`);
    console.log(`   Sites: ${insertedSites.length}`);
    console.log(`   Devices: ${insertedDevices.length}`);
    console.log(`   User-Site Relations: ${userSiteData.length}`);
    console.log(`   Metrics: ${metricsData.length}`);
    console.log(`   Thresholds: ${thresholdsData.length}`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    sqlite.close();
  }
}

// Run the seeder if this script is executed directly
if (import.meta.main) {
  await seedDatabase();
}