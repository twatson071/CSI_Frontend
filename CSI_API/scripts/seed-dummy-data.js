#!/usr/bin/env bun
"use strict";
/**
 * Database Seeder Script for CSI Frontend Demo Data
 * Seeds the database with comprehensive dummy devices and sites
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
var bun_sqlite_1 = require("bun:sqlite");
var bun_sqlite_2 = require("drizzle-orm/bun-sqlite");
var drizzle_orm_1 = require("drizzle-orm");
var schema = require("../src/db/schema");
// Database setup
var raw = process.env.DB_FILE_NAME;
var filename = raw.startsWith("file:") ? raw.slice(5) : raw;
var sqlite = new bun_sqlite_1.Database(filename);
var db = (0, bun_sqlite_2.drizzle)({ client: sqlite, schema: schema });
// Site data
var siteData = [
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
var deviceData = [
    // PDU Devices
    {
        name: 'PDU 1 AP7921B',
        type: 'PDU',
        ipAddress: '192.168.1.101',
        serviceUrl: 'http://192.168.1.101/snmp',
        status: 'normal',
        siteIndex: 0,
        parameters: {
            outlets: {
                "1": { state: "POWER_ON", name: "Server 1" },
                "2": { state: "POWER_ON", name: "Server 2" },
                "3": { state: "POWER_OFF", name: "Spare" },
                "4": { state: "POWER_ON", name: "Switch 1" },
                "5": { state: "POWER_ON", name: "Switch 2" },
                "6": { state: "POWER_ON", name: "Router" },
                "7": { state: "POWER_OFF", name: "Spare" },
                "8": { state: "POWER_ON", name: "NAS Storage" }
            },
            total_outlets: 8,
            model: "APC AP7921B",
            firmware_version: "2.1.3",
            maxCurrent: 16,
            voltageRating: 230,
            phaseType: "Single Phase",
            ratedPower: 3680
        },
        sensors: {
            total_draw_w: 1850,
            total_draw_a: 8.5,
            voltage: 230,
            temperature_c: 24,
            humidity: 45
        }
    },
    {
        name: 'PDU 2 AP8870',
        type: 'PDU',
        ipAddress: '192.168.1.102',
        serviceUrl: 'http://192.168.1.102/snmp',
        status: 'normal',
        siteIndex: 0,
        parameters: {
            outlets: {
                "1": { state: "POWER_ON", name: "Rack Server 1" },
                "2": { state: "POWER_ON", name: "Rack Server 2" },
                "3": { state: "POWER_ON", name: "Rack Server 3" },
                "4": { state: "POWER_ON", name: "Rack Server 4" },
                "5": { state: "POWER_OFF", name: "Spare" },
                "6": { state: "POWER_ON", name: "Core Switch" },
                "7": { state: "POWER_ON", name: "Firewall" },
                "8": { state: "POWER_ON", name: "Load Balancer" },
                "9": { state: "POWER_ON", name: "SAN Storage" },
                "10": { state: "POWER_ON", name: "Backup Server" },
                "11": { state: "POWER_OFF", name: "Test Server" },
                "12": { state: "POWER_ON", name: "Management Console" }
            },
            total_outlets: 12,
            model: "APC AP8870",
            firmware_version: "3.2.1",
            maxCurrent: 32,
            voltageRating: 230,
            phaseType: "Three Phase",
            ratedPower: 11040
        },
        sensors: {
            total_draw_w: 8200,
            total_draw_a: 24.5,
            voltage: 230,
            temperature_c: 28,
            humidity: 42
        }
    },
    // UPS Device
    {
        name: 'UPS 1 SMX3000RMHV2U',
        type: 'UPS',
        ipAddress: '192.168.1.103',
        serviceUrl: 'http://192.168.1.103/snmp',
        status: 'normal',
        siteIndex: 0,
        parameters: {
            outlets: {
                "1": { state: "POWER_ON", name: "Critical Server 1" },
                "2": { state: "POWER_ON", name: "Critical Server 2" },
                "3": { state: "POWER_ON", name: "Core Network" },
                "4": { state: "POWER_ON", name: "Security System" },
                "5": { state: "POWER_OFF", name: "Backup" },
                "6": { state: "POWER_ON", name: "Monitoring" }
            },
            total_outlets: 6,
            model: "APC SMX3000RMHV2U",
            firmware_version: "3.2.1",
            capacity: 3000,
            batteryCapacity: 100,
            inputVoltage: 230,
            outputVoltage: 230,
            loadPercentage: 85,
            battery_status: "Good",
            battery_charge: 98,
            runtime_minutes: 42
        },
        sensors: {
            total_draw_w: 2550,
            total_draw_a: 11.1,
            voltage: 230,
            temperature_c: 26,
            battery_voltage: 48,
            input_frequency: 50.0,
            output_frequency: 50.0
        }
    },
    // Network Switches
    {
        name: 'Switch 1 C9300-24T',
        type: 'SWITCH',
        ipAddress: '192.168.1.201',
        serviceUrl: 'http://192.168.1.201/snmp',
        status: 'normal',
        siteIndex: 1,
        parameters: {
            model: "Cisco Catalyst 9300-24T",
            firmware_version: "16.12.4",
            total_ports: 24,
            poe_capable_ports: 24,
            uptime_hours: 2184,
            mac_address: "00:1a:2b:3c:4d:5e",
            management_vlan: 1
        },
        port_status: {
            port_1: { status: "connected", speed: "1000Mbps", vlan: 10, power_over_ethernet: "active", device: "Access Point 1" },
            port_2: { status: "connected", speed: "1000Mbps", vlan: 10, power_over_ethernet: "active", device: "Access Point 2" },
            port_3: { status: "connected", speed: "100Mbps", vlan: 20, power_over_ethernet: "inactive", device: "Printer" },
            port_4: { status: "disconnected", speed: "auto", vlan: 1, power_over_ethernet: "inactive" },
            port_5: { status: "connected", speed: "1000Mbps", vlan: 30, power_over_ethernet: "active", device: "IP Phone 1" },
            port_6: { status: "connected", speed: "1000Mbps", vlan: 30, power_over_ethernet: "active", device: "IP Phone 2" },
            port_7: { status: "connected", speed: "1000Mbps", vlan: 10, power_over_ethernet: "inactive", device: "Workstation 1" },
            port_8: { status: "connected", speed: "1000Mbps", vlan: 10, power_over_ethernet: "inactive", device: "Workstation 2" },
            port_9: { status: "disconnected", speed: "auto", vlan: 1, power_over_ethernet: "inactive" },
            port_10: { status: "connected", speed: "1000Mbps", vlan: 100, power_over_ethernet: "inactive", device: "Server Link" },
            port_11: { status: "connected", speed: "1000Mbps", vlan: 40, power_over_ethernet: "active", device: "Camera 1" },
            port_12: { status: "connected", speed: "1000Mbps", vlan: 40, power_over_ethernet: "active", device: "Camera 2" },
            port_13: { status: "disconnected", speed: "auto", vlan: 1, power_over_ethernet: "inactive" },
            port_14: { status: "disconnected", speed: "auto", vlan: 1, power_over_ethernet: "inactive" },
            port_15: { status: "connected", speed: "100Mbps", vlan: 10, power_over_ethernet: "inactive", device: "IoT Device" },
            port_16: { status: "connected", speed: "1000Mbps", vlan: 10, power_over_ethernet: "inactive", device: "Workstation 3" },
            port_17: { status: "disconnected", speed: "auto", vlan: 1, power_over_ethernet: "inactive" },
            port_18: { status: "connected", speed: "1000Mbps", vlan: 10, power_over_ethernet: "inactive", device: "Workstation 4" },
            port_19: { status: "disconnected", speed: "auto", vlan: 1, power_over_ethernet: "inactive" },
            port_20: { status: "disconnected", speed: "auto", vlan: 1, power_over_ethernet: "inactive" },
            port_21: { status: "disconnected", speed: "auto", vlan: 1, power_over_ethernet: "inactive" },
            port_22: { status: "connected", speed: "1000Mbps", vlan: 999, power_over_ethernet: "inactive", device: "Management" },
            port_23: { status: "connected", speed: "1000Mbps", vlan: "trunk", power_over_ethernet: "inactive", device: "Uplink to Core" },
            port_24: { status: "connected", speed: "1000Mbps", vlan: "trunk", power_over_ethernet: "inactive", device: "Uplink to Core 2" }
        },
        statistics: {
            total_traffic_gb: 8543,
            active_ports: 15,
            poe_power_used_w: 185,
            cpu_usage_percent: 22,
            memory_usage_percent: 45,
            temperature_c: 42
        }
    },
    {
        name: 'Switch 2 C9300-48P',
        type: 'SWITCH',
        ipAddress: '192.168.1.202',
        serviceUrl: 'http://192.168.1.202/snmp',
        status: 'normal',
        siteIndex: 1,
        parameters: {
            model: "Cisco Catalyst 9300-48P",
            firmware_version: "16.12.4",
            total_ports: 48,
            poe_capable_ports: 48,
            uptime_hours: 2184,
            mac_address: "00:1a:2b:3c:4d:5f",
            management_vlan: 1
        },
        port_status: {
            port_1: { status: "connected", speed: "1000Mbps", vlan: 10, power_over_ethernet: "active" },
            port_2: { status: "connected", speed: "1000Mbps", vlan: 10, power_over_ethernet: "active" },
            port_3: { status: "connected", speed: "1000Mbps", vlan: 10, power_over_ethernet: "inactive" },
            port_4: { status: "connected", speed: "1000Mbps", vlan: 10, power_over_ethernet: "inactive" },
            port_5: { status: "connected", speed: "1000Mbps", vlan: 20, power_over_ethernet: "active" },
            port_6: { status: "connected", speed: "1000Mbps", vlan: 20, power_over_ethernet: "active" },
            port_7: { status: "connected", speed: "1000Mbps", vlan: 20, power_over_ethernet: "inactive" },
            port_8: { status: "connected", speed: "1000Mbps", vlan: 20, power_over_ethernet: "inactive" },
            port_9: { status: "connected", speed: "100Mbps", vlan: 30, power_over_ethernet: "active" },
            port_10: { status: "connected", speed: "100Mbps", vlan: 30, power_over_ethernet: "active" },
            port_11: { status: "disconnected", speed: "auto", vlan: 1, power_over_ethernet: "inactive" },
            port_12: { status: "disconnected", speed: "auto", vlan: 1, power_over_ethernet: "inactive" },
            port_13: { status: "connected", speed: "1000Mbps", vlan: 40, power_over_ethernet: "active" },
            port_14: { status: "connected", speed: "1000Mbps", vlan: 40, power_over_ethernet: "active" },
            port_15: { status: "connected", speed: "1000Mbps", vlan: 40, power_over_ethernet: "active" },
            port_16: { status: "connected", speed: "1000Mbps", vlan: 40, power_over_ethernet: "active" },
            port_17: { status: "connected", speed: "1000Mbps", vlan: 50, power_over_ethernet: "inactive" },
            port_18: { status: "connected", speed: "1000Mbps", vlan: 50, power_over_ethernet: "inactive" },
            port_19: { status: "connected", speed: "1000Mbps", vlan: 50, power_over_ethernet: "inactive" },
            port_20: { status: "connected", speed: "1000Mbps", vlan: 50, power_over_ethernet: "inactive" },
            port_21: { status: "connected", speed: "1000Mbps", vlan: 60, power_over_ethernet: "active" },
            port_22: { status: "connected", speed: "1000Mbps", vlan: 60, power_over_ethernet: "active" },
            port_23: { status: "connected", speed: "1000Mbps", vlan: 60, power_over_ethernet: "active" },
            port_24: { status: "connected", speed: "1000Mbps", vlan: 60, power_over_ethernet: "active" },
            port_25: { status: "disconnected", speed: "auto", vlan: 1, power_over_ethernet: "inactive" },
            port_26: { status: "disconnected", speed: "auto", vlan: 1, power_over_ethernet: "inactive" },
            port_27: { status: "connected", speed: "100Mbps", vlan: 70, power_over_ethernet: "inactive" },
            port_28: { status: "connected", speed: "100Mbps", vlan: 70, power_over_ethernet: "inactive" },
            port_29: { status: "connected", speed: "1000Mbps", vlan: 80, power_over_ethernet: "inactive" },
            port_30: { status: "connected", speed: "1000Mbps", vlan: 80, power_over_ethernet: "inactive" },
            port_31: { status: "connected", speed: "1000Mbps", vlan: 80, power_over_ethernet: "inactive" },
            port_32: { status: "connected", speed: "1000Mbps", vlan: 80, power_over_ethernet: "inactive" },
            port_33: { status: "disconnected", speed: "auto", vlan: 1, power_over_ethernet: "inactive" },
            port_34: { status: "disconnected", speed: "auto", vlan: 1, power_over_ethernet: "inactive" },
            port_35: { status: "disconnected", speed: "auto", vlan: 1, power_over_ethernet: "inactive" },
            port_36: { status: "disconnected", speed: "auto", vlan: 1, power_over_ethernet: "inactive" },
            port_37: { status: "connected", speed: "1000Mbps", vlan: 90, power_over_ethernet: "active" },
            port_38: { status: "connected", speed: "1000Mbps", vlan: 90, power_over_ethernet: "active" },
            port_39: { status: "connected", speed: "1000Mbps", vlan: 90, power_over_ethernet: "active" },
            port_40: { status: "connected", speed: "1000Mbps", vlan: 90, power_over_ethernet: "active" },
            port_41: { status: "disconnected", speed: "auto", vlan: 1, power_over_ethernet: "inactive" },
            port_42: { status: "disconnected", speed: "auto", vlan: 1, power_over_ethernet: "inactive" },
            port_43: { status: "disconnected", speed: "auto", vlan: 1, power_over_ethernet: "inactive" },
            port_44: { status: "disconnected", speed: "auto", vlan: 1, power_over_ethernet: "inactive" },
            port_45: { status: "connected", speed: "1000Mbps", vlan: 999, power_over_ethernet: "inactive" },
            port_46: { status: "connected", speed: "1000Mbps", vlan: 999, power_over_ethernet: "inactive" },
            port_47: { status: "connected", speed: "10Gbps", vlan: "trunk", power_over_ethernet: "inactive" },
            port_48: { status: "connected", speed: "10Gbps", vlan: "trunk", power_over_ethernet: "inactive" }
        },
        statistics: {
            total_traffic_gb: 24567,
            active_ports: 35,
            poe_power_used_w: 420,
            cpu_usage_percent: 35,
            memory_usage_percent: 52,
            temperature_c: 45
        }
    },
    // Server Devices
    {
        name: 'Server 1 RAX XS4-11E3',
        type: 'Server',
        ipAddress: '192.168.1.301',
        serviceUrl: 'http://192.168.1.301/api',
        status: 'normal',
        siteIndex: 0,
        parameters: ['cpuCores', 'ramGB', 'storageGB', 'cpuUsage', 'ramUsage'],
        data: ['16', '64', '2000', '35', '68']
    },
    {
        name: 'Server 2 Z2 G9 Mini',
        type: 'Server',
        ipAddress: '192.168.1.302',
        serviceUrl: 'http://192.168.1.302/api',
        status: 'normal',
        siteIndex: 0,
        parameters: ['cpuCores', 'ramGB', 'storageGB', 'cpuUsage', 'ramUsage'],
        data: ['8', '32', '1000', '22', '45']
    },
    {
        name: 'Cape Server',
        type: 'Server',
        ipAddress: '192.168.3.301',
        serviceUrl: 'http://192.168.3.301/api',
        status: 'normal',
        siteIndex: 2,
        parameters: ['cpuCores', 'ramGB', 'storageGB', 'cpuUsage', 'ramUsage'],
        data: ['24', '128', '4000', '55', '72']
    },
    {
        name: 'Time Server',
        type: 'Server',
        ipAddress: '192.168.2.401',
        serviceUrl: 'http://192.168.2.401/ntp',
        status: 'normal',
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
        status: 'normal',
        siteIndex: 2,
        parameters: ['inputPorts', 'outputPorts', 'frequencyRange', 'insertionLoss', 'activeConnections'],
        data: ['32', '16', '1-6000 MHz', '< 3dB', '12']
    },
    // RF to Fiber Converters
    {
        name: 'RF to Fiber Converter 1',
        type: 'RF_FIBER',
        ipAddress: '192.168.3.601',
        serviceUrl: 'http://192.168.3.601/api',
        status: 'normal',
        siteIndex: 2,
        parameters: {
            model: "Opticomm-Emcore OTS-2x2",
            firmware_version: "1.4.2",
            channels: 2,
            frequency_range: "50 MHz - 3 GHz",
            optical_wavelength: "1550 nm",
            link_distance: "up to 40 km"
        },
        channel_status: {
            channel_1: {
                input_power_dbm: -15,
                output_power_dbm: 2,
                optical_power_mw: 3.2,
                link_status: "active",
                ber: "< 10^-12",
                rf_gain_db: 12,
                optical_loss_db: 0.5
            },
            channel_2: {
                input_power_dbm: -18,
                output_power_dbm: 1,
                optical_power_mw: 2.8,
                link_status: "active",
                ber: "< 10^-12",
                rf_gain_db: 12,
                optical_loss_db: 0.7
            }
        },
        alarms: {
            temperature: false,
            input_loss: false,
            laser_fault: false,
            optical_loss: false
        }
    },
    {
        name: 'RF to Fiber Converter 2',
        type: 'RF_FIBER',
        ipAddress: '192.168.3.602',
        serviceUrl: 'http://192.168.3.602/api',
        status: 'normal',
        siteIndex: 2,
        parameters: {
            model: "Foxcom PL7220T",
            firmware_version: "2.1.0",
            channels: 1,
            frequency_range: "10 MHz - 2.5 GHz",
            optical_wavelength: "1310 nm",
            link_distance: "up to 20 km"
        },
        channel_status: {
            channel_1: {
                input_power_dbm: -12,
                output_power_dbm: 3,
                optical_power_mw: 4.1,
                link_status: "active",
                ber: "< 10^-11",
                rf_gain_db: 15,
                optical_loss_db: 0.3
            }
        },
        alarms: {
            temperature: false,
            input_loss: false,
            laser_fault: false,
            optical_loss: false
        }
    },
    {
        name: 'GNS-196-1U Signal Generator',
        type: 'RF Equipment',
        ipAddress: '192.168.3.502',
        serviceUrl: 'http://192.168.3.502/scpi',
        status: 'normal',
        siteIndex: 2,
        parameters: ['frequencyRange', 'outputPower', 'phaseNoise', 'currentFrequency', 'currentPower'],
        data: ['100 kHz - 20 GHz', '+20 dBm', '< -110 dBc/Hz', '2.4 GHz', '-10 dBm']
    },
    {
        name: 'Cape SDR System',
        type: 'RF Equipment',
        ipAddress: '192.168.3.503',
        serviceUrl: 'http://192.168.3.503/api',
        status: 'normal',
        siteIndex: 2,
        parameters: ['channels', 'bandwidth', 'frequencyRange', 'sampleRate', 'activeChannels'],
        data: ['16', '100 MHz', '70 MHz - 6 GHz', '250 MSPS', '8']
    },
    // Spectrum Analyzer
    {
        name: 'Spectrum Analyzer 9010B',
        type: 'SPECTRUM',
        ipAddress: '192.168.3.701',
        serviceUrl: 'http://192.168.3.701/scpi',
        status: 'normal',
        siteIndex: 2,
        parameters: {
            model: "Keysight N9030B",
            firmware_version: "A.20.14",
            frequency_range: "3 Hz - 50 GHz",
            resolution_bandwidth: "1 Hz - 8 MHz",
            dynamic_range: "165 dB",
            phase_noise: "< -110 dBc/Hz"
        },
        current_measurement: {
            center_frequency_mhz: 2450,
            span_mhz: 100,
            rbw_khz: 100,
            vbw_khz: 100,
            reference_level_dbm: 0,
            peak_power_dbm: -35,
            noise_floor_dbm: -95,
            marker_frequency_mhz: 2442,
            marker_amplitude_dbm: -35
        },
        sweep_status: {
            sweep_time_ms: 250,
            sweep_count: 1523,
            averaging: true,
            trace_mode: "max_hold",
            detector: "peak"
        },
        traces: {
            trace1: "max_hold",
            trace2: "average",
            trace3: "min_hold"
        }
    },
    // Storage Device
    {
        name: 'NAS Storage ME5012',
        type: 'Storage',
        ipAddress: '192.168.1.701',
        serviceUrl: 'http://192.168.1.701/api',
        status: 'normal',
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
        status: 'normal',
        siteIndex: 3,
        parameters: ['resolution', 'frameRate', 'compressionFormat', 'nightVision', 'motionDetection'],
        data: ['3840x2160', '30', 'H.265', 'true', 'true']
    },
    {
        name: 'Security Camera 2',
        type: 'Camera',
        ipAddress: '192.168.1.802',
        serviceUrl: 'rtsp://192.168.1.802:554/stream1',
        status: 'normal',
        siteIndex: 0,
        parameters: ['resolution', 'frameRate', 'compressionFormat', 'ptzCapable', 'zoomRange'],
        data: ['1920x1080', '60', 'H.264', 'true', '20X']
    }
];
function seedDatabase() {
    return __awaiter(this, void 0, void 0, function () {
        var tableCheck, tableNames, defaultRole, error_1, existingRole, defaultUser_1, error_2, existingUser, insertedSites_1, devicesWithSiteIds, insertedDevices, metricsData, _i, insertedDevices_1, device, thresholdsData, _a, insertedDevices_2, device, userSiteData, tableCheck2, error_3;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    console.log('🌱 Starting database seeding...');
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 38, 39, 40]);
                    tableCheck = sqlite.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
                    tableNames = tableCheck.map(function (t) { return t.name; });
                    console.log("Found ".concat(tableNames.length, " tables: ").concat(tableNames.join(', ')));
                    if (!tableNames.includes('users') || !tableNames.includes('sites') || !tableNames.includes('devices')) {
                        console.error('❌ Required tables are missing! Please run: bun x drizzle-kit push');
                        process.exit(1);
                    }
                    // Clear existing data (optional - remove if you want to keep existing data)
                    console.log('🧹 Clearing existing dummy data...');
                    if (!tableNames.includes('user_sites')) return [3 /*break*/, 3];
                    return [4 /*yield*/, db.delete(schema.userSites)];
                case 2:
                    _b.sent();
                    return [3 /*break*/, 4];
                case 3:
                    console.log('⚠️ user_sites table not found, skipping...');
                    _b.label = 4;
                case 4: return [4 /*yield*/, db.delete(schema.devices).where((0, drizzle_orm_1.like)(schema.devices.name, '%PDU%'))];
                case 5:
                    _b.sent();
                    return [4 /*yield*/, db.delete(schema.devices).where((0, drizzle_orm_1.like)(schema.devices.name, '%UPS%'))];
                case 6:
                    _b.sent();
                    return [4 /*yield*/, db.delete(schema.devices).where((0, drizzle_orm_1.like)(schema.devices.name, '%Switch%'))];
                case 7:
                    _b.sent();
                    return [4 /*yield*/, db.delete(schema.devices).where((0, drizzle_orm_1.like)(schema.devices.name, '%Server%'))];
                case 8:
                    _b.sent();
                    return [4 /*yield*/, db.delete(schema.devices).where((0, drizzle_orm_1.like)(schema.devices.name, '%Cape%'))];
                case 9:
                    _b.sent();
                    return [4 /*yield*/, db.delete(schema.devices).where((0, drizzle_orm_1.like)(schema.devices.name, '%Time Server%'))];
                case 10:
                    _b.sent();
                    return [4 /*yield*/, db.delete(schema.devices).where((0, drizzle_orm_1.like)(schema.devices.name, '%RF%'))];
                case 11:
                    _b.sent();
                    return [4 /*yield*/, db.delete(schema.devices).where((0, drizzle_orm_1.like)(schema.devices.name, '%GNS%'))];
                case 12:
                    _b.sent();
                    return [4 /*yield*/, db.delete(schema.devices).where((0, drizzle_orm_1.like)(schema.devices.name, '%Spectrum%'))];
                case 13:
                    _b.sent();
                    return [4 /*yield*/, db.delete(schema.devices).where((0, drizzle_orm_1.like)(schema.devices.name, '%NAS%'))];
                case 14:
                    _b.sent();
                    return [4 /*yield*/, db.delete(schema.devices).where((0, drizzle_orm_1.like)(schema.devices.name, '%Camera%'))];
                case 15:
                    _b.sent();
                    return [4 /*yield*/, db.delete(schema.sites).where((0, drizzle_orm_1.like)(schema.sites.name, '%Data Center%'))];
                case 16:
                    _b.sent();
                    return [4 /*yield*/, db.delete(schema.sites).where((0, drizzle_orm_1.like)(schema.sites.name, '%Operations Center%'))];
                case 17:
                    _b.sent();
                    return [4 /*yield*/, db.delete(schema.sites).where((0, drizzle_orm_1.like)(schema.sites.name, '%Communication Hub%'))];
                case 18:
                    _b.sent();
                    // Create default role if it doesn't exist
                    console.log('👤 Setting up default role...');
                    defaultRole = void 0;
                    _b.label = 19;
                case 19:
                    _b.trys.push([19, 21, , 23]);
                    return [4 /*yield*/, db.insert(schema.roles).values({
                            name: 'Admin',
                            permissions: JSON.stringify(['all'])
                        }).returning()];
                case 20:
                    defaultRole = (_b.sent())[0];
                    return [3 /*break*/, 23];
                case 21:
                    error_1 = _b.sent();
                    return [4 /*yield*/, db.select().from(schema.roles).where((0, drizzle_orm_1.eq)(schema.roles.name, 'Admin')).limit(1)];
                case 22:
                    existingRole = _b.sent();
                    if (existingRole.length > 0) {
                        defaultRole = existingRole[0];
                    }
                    else {
                        throw error_1;
                    }
                    return [3 /*break*/, 23];
                case 23:
                    console.log("\u2705 Default role ready: ".concat(defaultRole.name));
                    // Create default user if it doesn't exist  
                    console.log('👤 Setting up default user...');
                    _b.label = 24;
                case 24:
                    _b.trys.push([24, 26, , 28]);
                    return [4 /*yield*/, db.insert(schema.users).values({
                            name: 'Dev User',
                            email: 'dev@localhost.com',
                            passwordHash: '$2a$10$dummy.hash.for.development.only',
                            roleId: defaultRole.id
                        }).returning()];
                case 25:
                    defaultUser_1 = (_b.sent())[0];
                    return [3 /*break*/, 28];
                case 26:
                    error_2 = _b.sent();
                    return [4 /*yield*/, db.select().from(schema.users).where((0, drizzle_orm_1.eq)(schema.users.email, 'dev@localhost.com')).limit(1)];
                case 27:
                    existingUser = _b.sent();
                    if (existingUser.length > 0) {
                        defaultUser_1 = existingUser[0];
                    }
                    else {
                        throw error_2;
                    }
                    return [3 /*break*/, 28];
                case 28:
                    console.log("\u2705 Default user ready: ".concat(defaultUser_1.name, " (ID: ").concat(defaultUser_1.id, ")"));
                    // Insert sites
                    console.log('📍 Inserting sites...');
                    return [4 /*yield*/, db.insert(schema.sites).values(siteData).returning()];
                case 29:
                    insertedSites_1 = _b.sent();
                    console.log("\u2705 Inserted ".concat(insertedSites_1.length, " sites"));
                    // Insert devices
                    console.log('🖥️  Inserting devices...');
                    devicesWithSiteIds = deviceData.map(function (device) {
                        // For devices with the new structure (parameters as object)
                        if (typeof device.parameters === 'object' && !Array.isArray(device.parameters)) {
                            return {
                                name: device.name,
                                type: device.type,
                                ipAddress: device.ipAddress,
                                serviceUrl: device.serviceUrl,
                                status: device.status,
                                siteId: insertedSites_1[device.siteIndex].id,
                                parameters: JSON.stringify(device.parameters),
                                data: JSON.stringify({
                                    parameters: device.parameters,
                                    sensors: device.sensors || {},
                                    channel_status: device.channel_status || {},
                                    port_status: device.port_status || {},
                                    statistics: device.statistics || {},
                                    current_measurement: device.current_measurement || {},
                                    sweep_status: device.sweep_status || {},
                                    traces: device.traces || {},
                                    alarms: device.alarms || {}
                                })
                            };
                        }
                        // For devices with the old structure (parameters as array)
                        else {
                            var paramsObj_1 = {};
                            device.parameters.forEach(function (key, index) {
                                paramsObj_1[key] = device.data[index];
                            });
                            return {
                                name: device.name,
                                type: device.type,
                                ipAddress: device.ipAddress,
                                serviceUrl: device.serviceUrl,
                                status: device.status,
                                siteId: insertedSites_1[device.siteIndex].id,
                                parameters: JSON.stringify(paramsObj_1),
                                data: JSON.stringify({ parameters: paramsObj_1 })
                            };
                        }
                    });
                    return [4 /*yield*/, db.insert(schema.devices).values(devicesWithSiteIds).returning()];
                case 30:
                    insertedDevices = _b.sent();
                    console.log("\u2705 Inserted ".concat(insertedDevices.length, " devices"));
                    // Insert some sample metrics for devices
                    console.log('📊 Inserting sample metrics...');
                    metricsData = [];
                    for (_i = 0, insertedDevices_1 = insertedDevices; _i < insertedDevices_1.length; _i++) {
                        device = insertedDevices_1[_i];
                        // Add different metrics based on device type
                        if (device.type === 'PDU') {
                            metricsData.push({ deviceId: device.id, metricType: 'current_load', value: Math.random() * 15 + 5 }, { deviceId: device.id, metricType: 'power_draw', value: Math.random() * 3000 + 1000 }, { deviceId: device.id, metricType: 'temperature', value: Math.random() * 10 + 20 });
                        }
                        else if (device.type === 'UPS') {
                            metricsData.push({ deviceId: device.id, metricType: 'battery_level', value: Math.random() * 20 + 80 }, { deviceId: device.id, metricType: 'load_percentage', value: Math.random() * 30 + 60 }, { deviceId: device.id, metricType: 'temperature', value: Math.random() * 15 + 25 });
                        }
                        else if (device.type === 'Server') {
                            metricsData.push({ deviceId: device.id, metricType: 'cpu_usage', value: Math.random() * 40 + 20 }, { deviceId: device.id, metricType: 'memory_usage', value: Math.random() * 30 + 40 }, { deviceId: device.id, metricType: 'temperature', value: Math.random() * 20 + 30 });
                        }
                        else if (device.type === 'Switch') {
                            metricsData.push({ deviceId: device.id, metricType: 'port_utilization', value: Math.random() * 50 + 30 }, { deviceId: device.id, metricType: 'power_consumption', value: Math.random() * 50 + 50 }, { deviceId: device.id, metricType: 'temperature', value: Math.random() * 15 + 25 });
                        }
                    }
                    if (!(metricsData.length > 0)) return [3 /*break*/, 32];
                    return [4 /*yield*/, db.insert(schema.metrics).values(metricsData)];
                case 31:
                    _b.sent();
                    console.log("\u2705 Inserted ".concat(metricsData.length, " sample metrics"));
                    _b.label = 32;
                case 32:
                    // Insert some sample metric thresholds
                    console.log('⚠️  Inserting metric thresholds...');
                    thresholdsData = [];
                    for (_a = 0, insertedDevices_2 = insertedDevices; _a < insertedDevices_2.length; _a++) {
                        device = insertedDevices_2[_a];
                        if (device.type === 'PDU') {
                            thresholdsData.push({
                                deviceId: device.id,
                                metricType: 'current_load',
                                cautionThreshold: 12.0,
                                seriousThreshold: 14.0,
                                criticalThreshold: 15.5,
                                operator: 'greater_than'
                            });
                        }
                        else if (device.type === 'UPS') {
                            thresholdsData.push({
                                deviceId: device.id,
                                metricType: 'battery_level',
                                cautionThreshold: 30.0,
                                seriousThreshold: 20.0,
                                criticalThreshold: 10.0,
                                operator: 'less_than'
                            });
                        }
                        else if (device.type === 'Server') {
                            thresholdsData.push({
                                deviceId: device.id,
                                metricType: 'cpu_usage',
                                cautionThreshold: 80.0,
                                seriousThreshold: 90.0,
                                criticalThreshold: 95.0,
                                operator: 'greater_than'
                            });
                        }
                    }
                    if (!(thresholdsData.length > 0)) return [3 /*break*/, 34];
                    return [4 /*yield*/, db.insert(schema.metricThresholds).values(thresholdsData)];
                case 33:
                    _b.sent();
                    console.log("\u2705 Inserted ".concat(thresholdsData.length, " metric thresholds"));
                    _b.label = 34;
                case 34:
                    // Associate default user with all sites
                    console.log('🔗 Creating user-site relationships...');
                    userSiteData = insertedSites_1.map(function (site) { return ({
                        userId: defaultUser_1.id,
                        siteId: site.id
                    }); });
                    tableCheck2 = sqlite.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='user_sites'").all();
                    if (!(tableCheck2.length > 0)) return [3 /*break*/, 36];
                    return [4 /*yield*/, db.insert(schema.userSites).values(userSiteData)];
                case 35:
                    _b.sent();
                    console.log("\u2705 Associated user ".concat(defaultUser_1.name, " with ").concat(userSiteData.length, " sites"));
                    return [3 /*break*/, 37];
                case 36:
                    console.log('⚠️ Skipping user-site associations (user_sites table not found)');
                    _b.label = 37;
                case 37:
                    console.log('🎉 Database seeding completed successfully!');
                    console.log('\n📋 Summary:');
                    console.log("   User: ".concat(defaultUser_1.name, " (").concat(defaultUser_1.email, ")"));
                    console.log("   Role: ".concat(defaultRole.name));
                    console.log("   Sites: ".concat(insertedSites_1.length));
                    console.log("   Devices: ".concat(insertedDevices.length));
                    console.log("   User-Site Relations: ".concat(userSiteData.length));
                    console.log("   Metrics: ".concat(metricsData.length));
                    console.log("   Thresholds: ".concat(thresholdsData.length));
                    return [3 /*break*/, 40];
                case 38:
                    error_3 = _b.sent();
                    console.error('❌ Error seeding database:', error_3);
                    process.exit(1);
                    return [3 /*break*/, 40];
                case 39:
                    sqlite.close();
                    return [7 /*endfinally*/];
                case 40: return [2 /*return*/];
            }
        });
    });
}
// Run the seeder if this script is executed directly
if (import.meta.main) {
    await seedDatabase();
}
