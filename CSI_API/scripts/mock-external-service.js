#!/usr/bin/env bun
"use strict";
/**
 * Mock External Service API
 *
 * This service mocks the external third-party APIs that the CSI system depends on.
 * It runs on port 8090 and provides realistic dummy data for all device types.
 */
Object.defineProperty(exports, "__esModule", { value: true });
var hono_1 = require("hono");
var bun_1 = require("bun");
var app = new hono_1.Hono();
// Utility functions
function rand(min, max) {
    return Math.random() * (max - min) + min;
}
function randomChoice(items) {
    return items[Math.floor(Math.random() * items.length)];
}
function generateTimestamp() {
    return new Date().toISOString();
}
// Mock data generators for different device types
// PDU Mock Data Generator
function generatePDUData() {
    var outletCount = Math.floor(rand(8, 24));
    var outlets = {};
    for (var i = 1; i <= outletCount; i++) {
        outlets[i.toString()] = {
            state: randomChoice(['POWER_ON', 'POWER_OFF'])
        };
    }
    var totalWatts = Number(rand(500, 3000).toFixed(1));
    var totalAmps = Number(rand(2, 15).toFixed(2));
    return {
        parameters: {
            make: randomChoice(['APC', 'Raritan', 'Vertiv']),
            model: randomChoice(['AP7921B', 'AP8870', 'AP9630']),
            label: "Power Distribution Unit ".concat(Math.floor(rand(1, 10))),
            numOfOutlets: outletCount,
            outlets: outlets,
            totalDrawWatts: totalWatts.toString(),
            totalDrawAmps: totalAmps.toString(),
            ratingAmps: Math.floor(rand(15, 30)),
            loadState: totalAmps > 12 ? 'high' : totalAmps > 8 ? 'medium' : 'low'
        },
        sensors: {
            total_draw_w: totalWatts,
            total_draw_a: totalAmps,
            load_state: totalAmps > 12 ? 'high' : totalAmps > 8 ? 'medium' : 'low'
        }
    };
}
// UPS Mock Data Generator  
function generateUPSData() {
    var batteryCharge = Number(rand(85, 100).toFixed(1));
    var isOnBattery = Math.random() < 0.1; // 10% chance on battery
    var outletCount = Math.floor(rand(4, 8));
    var outlets = {};
    for (var i = 1; i <= outletCount; i++) {
        outlets[i.toString()] = {
            state: randomChoice(['POWER_ON', 'POWER_OFF'])
        };
    }
    var totalWatts = Number(rand(800, 2500).toFixed(1));
    var totalAmps = Number(rand(5, 15).toFixed(2));
    return {
        parameters: {
            make: randomChoice(['APC', 'Eaton', 'CyberPower']),
            model: randomChoice(['SMX3000RMHV2U', 'SMT2200RM2U', 'SRT3000XLA']),
            label: "Uninterruptible Power Supply ".concat(Math.floor(rand(1, 5))),
            numOfOutlets: outletCount,
            outlets: outlets,
            totalDrawWatts: totalWatts.toString(),
            totalDrawAmps: totalAmps.toString(),
            ratingAmps: Math.floor(rand(20, 40)),
            loadState: totalAmps > 12 ? 'high' : totalAmps > 8 ? 'medium' : 'low',
            // UPS-specific parameters
            battery_status: batteryCharge,
            battery_charge: batteryCharge,
            runtime_minutes: Math.floor(rand(15, 180)),
            on_battery: isOnBattery,
            input_voltage: isOnBattery ? 0 : Number(rand(115, 125).toFixed(1)),
            output_voltage: Number(rand(115, 125).toFixed(1))
        },
        sensors: {
            total_draw_w: totalWatts,
            total_draw_a: totalAmps,
            load_state: totalAmps > 12 ? 'high' : totalAmps > 8 ? 'medium' : 'low',
            battery_charge: batteryCharge
        }
    };
}
// Network Switch Mock Data Generator
function generateSwitchData() {
    var portCount = randomChoice([24, 48]);
    var poeCapablePorts = Math.floor(portCount * 0.6); // 60% PoE capable
    var port_status = {};
    var activePorts = 0;
    var totalTrafficGb = 0;
    var poeUsedW = 0;
    for (var i = 1; i <= portCount; i++) {
        var isActive = Math.random() < 0.7; // 70% chance port is active
        var isPoeCapable = i <= poeCapablePorts;
        var poeActive = isPoeCapable && isActive && Math.random() < 0.4;
        if (isActive) {
            activePorts++;
            totalTrafficGb += Number(rand(0.1, 50).toFixed(2));
        }
        if (poeActive) {
            poeUsedW += Number(rand(5, 25).toFixed(1));
        }
        port_status["port_".concat(i)] = {
            status: isActive ? 'connected' : 'disconnected',
            speed: isActive ? randomChoice(['100M', '1G', '10G']) : 'N/A',
            vlan: isActive ? randomChoice([1, 100, 200]) : 1,
            power_over_ethernet: isPoeCapable ? (poeActive ? 'active' : 'inactive') : false,
            device: isActive && Math.random() < 0.5 ? randomChoice(['Workstation', 'Server', 'Access Point', 'Camera']) : undefined
        };
    }
    return {
        parameters: {
            model: randomChoice(['C9300-24T', 'C9300-48P', 'C2960X-48FPD-L']),
            firmware_version: randomChoice(['16.12.07', '16.12.08', '17.03.04a']),
            total_ports: portCount,
            poe_capable_ports: poeCapablePorts,
            uptime_hours: Math.floor(rand(24, 8760)) // 1 day to 1 year
        },
        port_status: port_status,
        statistics: {
            total_traffic_gb: Number(totalTrafficGb.toFixed(2)),
            active_ports: activePorts,
            poe_power_used_w: Number(poeUsedW.toFixed(1)),
            cpu_usage_percent: Number(rand(5, 45).toFixed(1)),
            memory_usage_percent: Number(rand(20, 80).toFixed(1)),
            temperature_c: Number(rand(25, 55).toFixed(1))
        }
    };
}
// RF Equipment Mock Data Generator
function generateRFEquipmentData() {
    var equipmentType = randomChoice(['matrix', 'sdr', 'signal_gen']);
    if (equipmentType === 'matrix') {
        return {
            parameters: {
                model: randomChoice(['RF Matrix 8x8', 'RF Matrix 16x16', 'RF Matrix 32x32']),
                firmware_version: randomChoice(['v2.1.4', 'v2.3.1', 'v3.0.2']),
                inputPorts: randomChoice([8, 16, 32]),
                outputPorts: randomChoice([8, 16, 32]),
                activeConnections: Math.floor(rand(2, 12)),
                insertionLoss: "".concat(Number(rand(0.5, 3.0).toFixed(1)), " dB"),
                frequencyRange: randomChoice(['DC-18GHz', 'DC-26.5GHz', '100MHz-6GHz'])
            }
        };
    }
    else if (equipmentType === 'sdr') {
        var channels = randomChoice([2, 4, 8, 16]);
        return {
            parameters: {
                model: randomChoice(['USRP B210', 'BladeRF 2.0', 'HackRF One']),
                firmware_version: randomChoice(['v4.1.0', 'v4.2.1', 'v4.3.0']),
                channels: channels,
                activeChannels: Math.floor(rand(1, channels)),
                bandwidth: randomChoice(['56MHz', '61.44MHz', '20MHz']),
                sampleRate: randomChoice(['61.44 MSPS', '56 MSPS', '20 MSPS']),
                frequencyRange: randomChoice(['70MHz-6GHz', '47MHz-6GHz', '1MHz-6GHz'])
            },
            channel_status: Array.from({ length: channels }, function (_, i) { return ({
                channel: i + 1,
                frequency_mhz: Number(rand(100, 6000).toFixed(2)),
                gain_db: Number(rand(0, 40).toFixed(1)),
                status: randomChoice(['active', 'idle', 'error'])
            }); })
        };
    }
    else {
        return {
            parameters: {
                model: randomChoice(['Keysight E8257D', 'R&S SMW200A', 'Anritsu MG3692C']),
                firmware_version: randomChoice(['v3.1.2', 'v3.2.0', 'v3.3.1']),
                frequencyRange: randomChoice(['250kHz-20GHz', '100kHz-12.75GHz', '10MHz-40GHz']),
                outputPower: randomChoice(['+20dBm', '+24dBm', '+18dBm']),
                currentFrequency: "".concat(Number(rand(100, 6000).toFixed(2)), " MHz"),
                currentPower: "".concat(Number(rand(-20, 15).toFixed(1)), " dBm"),
                phaseNoise: "".concat(Number(rand(-110, -100).toFixed(1)), " dBc/Hz @ 10kHz")
            }
        };
    }
}
// RF to Fiber Converter Mock Data Generator
function generateRFToFiberData() {
    var channelCount = randomChoice([4, 8, 16]);
    var channels = {};
    for (var i = 1; i <= channelCount; i++) {
        var channelKey = "channel_".concat(i);
        channels[channelKey] = {
            input_power_dbm: Number(rand(-20, 10).toFixed(1)),
            output_power_dbm: Number(rand(-15, 15).toFixed(1)),
            optical_power_mw: Number(rand(0.1, 5.0).toFixed(2)),
            link_status: randomChoice(['active', 'inactive', 'error']),
            ber: Number((Math.random() * 1e-9).toExponential(2)),
            rf_gain_db: Number(rand(10, 30).toFixed(1)),
            optical_loss_db: Number(rand(0.1, 3.0).toFixed(2))
        };
    }
    return {
        parameters: {
            model: randomChoice(['RF-2000-F', 'OptiLink-16', 'FiberRF-Pro']),
            firmware_version: randomChoice(['v2.1.4', 'v2.3.1', 'v3.0.2']),
            channels: channelCount,
            frequency_range: randomChoice(['50MHz-6GHz', '100MHz-3GHz', '500MHz-18GHz']),
            optical_wavelength: randomChoice(['1310nm', '1550nm']),
            link_distance: randomChoice(['10km', '20km', '40km', '80km'])
        },
        channel_status: channels,
        alarms: {
            temperature: Math.random() < 0.1,
            input_loss: Math.random() < 0.05,
            laser_fault: Math.random() < 0.02,
            optical_loss: Math.random() < 0.08
        }
    };
}
// Spectrum Analyzer Mock Data Generator
function generateSpectrumAnalyzerData() {
    var centerFreq = Number(rand(1000, 6000).toFixed(2));
    var span = Number(rand(100, 2000).toFixed(2));
    var rbw = Number(rand(1, 100).toFixed(1));
    var vbw = Number(rand(1, 100).toFixed(1));
    var refLevel = Number(rand(-30, 10).toFixed(1));
    var peakPower = Number(rand(-60, refLevel).toFixed(1));
    var noiseFloor = Number(rand(-90, -70).toFixed(1));
    return {
        parameters: {
            model: randomChoice(['Keysight E4407B', 'R&S FSW', 'Anritsu MS2692A']),
            firmware_version: randomChoice(['v2.1.0', 'v2.2.1', 'v3.0.0']),
            frequency_range: randomChoice(['9 kHz - 26.5 GHz', '10 Hz - 50 GHz', '100 kHz - 8.5 GHz']),
            resolution_bandwidth: randomChoice(['1 Hz - 10 MHz', '0.1 Hz - 5 MHz', '10 Hz - 3 MHz']),
            dynamic_range: randomChoice(['70 dB', '80 dB', '90 dB']),
            phase_noise: randomChoice(['-108 dBc/Hz @ 10 kHz', '-115 dBc/Hz @ 10 kHz', '-110 dBc/Hz @ 10 kHz'])
        },
        current_measurement: {
            center_frequency_mhz: centerFreq,
            span_mhz: span,
            rbw_khz: rbw,
            vbw_khz: vbw,
            reference_level_dbm: refLevel,
            peak_power_dbm: peakPower,
            noise_floor_dbm: noiseFloor,
            marker_frequency_mhz: Number(rand(centerFreq - span / 2, centerFreq + span / 2).toFixed(2)),
            marker_amplitude_dbm: Number(rand(noiseFloor, peakPower).toFixed(1))
        },
        sweep_status: {
            sweep_time_ms: Math.floor(rand(100, 5000)),
            sweep_count: Math.floor(rand(1, 1000)),
            averaging: Math.random() < 0.3,
            trace_mode: randomChoice(['normal', 'max_hold', 'min_hold', 'average']),
            detector: randomChoice(['peak', 'average', 'rms'])
        },
        traces: {
            trace1: 'normal',
            trace2: Math.random() < 0.4 ? 'max_hold' : undefined,
            trace3: Math.random() < 0.2 ? 'average' : undefined
        }
    };
}
// Storage/NAS Mock Data Generator
function generateStorageData() {
    var diskCount = Math.floor(rand(4, 12));
    var disks = Array.from({ length: diskCount }, function (_, i) {
        var capacity = randomChoice([1, 2, 4, 8, 16]) * 1024 * 1024 * 1024 * 1024; // TB in bytes
        var used = Math.floor(capacity * rand(0.1, 0.8));
        return {
            disk_id: i + 1,
            model: randomChoice(['WD Red Pro', 'Seagate IronWolf', 'Samsung 980 Pro']),
            serial_number: "DSK".concat(Math.floor(rand(100000, 999999))),
            capacity_bytes: capacity,
            used_bytes: used,
            free_bytes: capacity - used,
            health_status: randomChoice(['healthy', 'warning', 'critical']),
            temperature_c: Number(rand(25, 45).toFixed(1)),
            hours_powered: Math.floor(rand(1000, 50000)),
            read_errors: Math.floor(rand(0, 5)),
            write_errors: Math.floor(rand(0, 3))
        };
    });
    var volumes = [
        {
            volume_id: 'vol1',
            name: 'System',
            raid_level: 'RAID1',
            capacity_bytes: Math.floor(disks.reduce(function (sum, d) { return sum + d.capacity_bytes; }, 0) * 0.3),
            used_bytes: Math.floor(disks.reduce(function (sum, d) { return sum + d.used_bytes; }, 0) * 0.3),
            status: randomChoice(['healthy', 'degraded']),
            disk_members: [1, 2]
        },
        {
            volume_id: 'vol2',
            name: 'Data',
            raid_level: 'RAID5',
            capacity_bytes: Math.floor(disks.reduce(function (sum, d) { return sum + d.capacity_bytes; }, 0) * 0.7),
            used_bytes: Math.floor(disks.reduce(function (sum, d) { return sum + d.used_bytes; }, 0) * 0.7),
            status: 'healthy',
            disk_members: [3, 4, 5, 6]
        }
    ];
    return {
        device_info: {
            model: randomChoice(['ME5012', 'DS920+', 'ReadyNAS 4312S']),
            firmware_version: randomChoice(['v7.1.1', 'v7.2.0', 'v8.0.1']),
            serial_number: "NAS".concat(Math.floor(rand(100000, 999999))),
            uptime_seconds: Math.floor(rand(86400, 2592000))
        },
        storage_summary: {
            total_capacity_bytes: disks.reduce(function (sum, d) { return sum + d.capacity_bytes; }, 0),
            total_used_bytes: disks.reduce(function (sum, d) { return sum + d.used_bytes; }, 0),
            total_free_bytes: disks.reduce(function (sum, d) { return sum + d.free_bytes; }, 0),
            disk_count: diskCount,
            volume_count: volumes.length
        },
        disks: disks,
        volumes: volumes,
        performance: {
            read_iops: Math.floor(rand(100, 5000)),
            write_iops: Math.floor(rand(50, 2000)),
            read_throughput_mbps: Number(rand(50, 500).toFixed(1)),
            write_throughput_mbps: Number(rand(25, 250).toFixed(1)),
            queue_depth: Math.floor(rand(1, 32))
        },
        network_shares: [
            {
                share_name: 'Public',
                protocol: 'SMB',
                path: '/volume1/Public',
                access_rights: 'read_write',
                connected_users: Math.floor(rand(0, 10))
            },
            {
                share_name: 'Backup',
                protocol: 'NFS',
                path: '/volume2/Backup',
                access_rights: 'read_only',
                connected_users: Math.floor(rand(0, 5))
            }
        ],
        system_status: {
            cpu_usage_percent: Number(rand(5, 35).toFixed(1)),
            memory_usage_percent: Number(rand(20, 80).toFixed(1)),
            temperature_c: Number(rand(30, 55).toFixed(1)),
            fan_speed_rpm: Math.floor(rand(800, 2000))
        },
        status: randomChoice(['normal', 'caution']),
        last_updated: generateTimestamp()
    };
}
// Camera Mock Data Generator
function generateCameraData() {
    return {
        parameters: {
            model: randomChoice(['DS-2CD2185FWD-I', 'AXIS M3007-PV', 'Dahua IPC-HFW4431R-Z']),
            firmware_version: randomChoice(['v5.6.0', 'v5.7.1', 'v6.0.2']),
            resolution: randomChoice(['1920x1080', '2592x1944', '3840x2160']),
            frame_rate: randomChoice([15, 25, 30]),
            bitrate_kbps: Math.floor(rand(2000, 8000)),
            codec: randomChoice(['H.264', 'H.265']),
            stream_url: 'rtsp://192.168.1.802:554/stream1'
        },
        device_info: {
            model: randomChoice(['DS-2CD2185FWD-I', 'AXIS M3007-PV', 'Dahua IPC-HFW4431R-Z']),
            firmware_version: randomChoice(['v5.6.0', 'v5.7.1', 'v6.0.2']),
            serial_number: "CAM".concat(Math.floor(rand(100000, 999999))),
            uptime_seconds: Math.floor(rand(86400, 2592000)),
            mac_address: Array.from({ length: 6 }, function () { return Math.floor(rand(0, 255)).toString(16).padStart(2, '0'); }).join(':')
        },
        video_settings: {
            resolution: randomChoice(['1920x1080', '2592x1944', '3840x2160']),
            frame_rate: randomChoice([15, 25, 30]),
            bitrate_kbps: Math.floor(rand(2000, 8000)),
            codec: randomChoice(['H.264', 'H.265']),
            stream_status: randomChoice(['active', 'inactive'])
        },
        rtsp_streams: [
            {
                stream_id: 1,
                name: 'Main Stream',
                url: 'rtsp://192.168.1.802:554/stream1',
                resolution: '1920x1080',
                bitrate_kbps: Math.floor(rand(4000, 8000)),
                status: 'active'
            },
            {
                stream_id: 2,
                name: 'Sub Stream',
                url: 'rtsp://192.168.1.802:554/stream2',
                resolution: '704x576',
                bitrate_kbps: Math.floor(rand(500, 1500)),
                status: 'active'
            }
        ],
        image_settings: {
            brightness: Math.floor(rand(40, 60)),
            contrast: Math.floor(rand(40, 60)),
            saturation: Math.floor(rand(40, 60)),
            sharpness: Math.floor(rand(40, 60)),
            white_balance: randomChoice(['auto', 'daylight', 'fluorescent'])
        },
        ptz_capabilities: {
            pan_range_degrees: 360,
            tilt_range_degrees: 90,
            zoom_range: '1x-32x',
            preset_positions: Math.floor(rand(4, 20))
        },
        motion_detection: {
            enabled: Math.random() < 0.8,
            sensitivity: Math.floor(rand(1, 10)),
            detection_zones: Math.floor(rand(1, 4)),
            current_motion: Math.random() < 0.1
        },
        environmental: {
            temperature_c: Number(rand(-10, 50).toFixed(1)),
            humidity_percent: Number(rand(20, 90).toFixed(1))
        },
        network_status: {
            ip_address: "192.168.1.".concat(Math.floor(rand(800, 899))),
            gateway: '192.168.1.1',
            dns_primary: '8.8.8.8',
            connection_status: randomChoice(['connected', 'disconnected'])
        },
        storage: {
            sd_card_present: Math.random() < 0.6,
            sd_card_capacity_gb: Math.random() < 0.6 ? randomChoice([32, 64, 128, 256]) : null,
            sd_card_used_percent: Math.random() < 0.6 ? Number(rand(10, 90).toFixed(1)) : null,
            recording_status: Math.random() < 0.5 ? 'recording' : 'stopped'
        },
        status: randomChoice(['normal', 'caution']),
        last_updated: generateTimestamp()
    };
}
// Server data (reuse existing mock)
function generateServerData() {
    // Use the existing server mock data from mockRoutes.ts
    var baseServerData = {
        device: {
            label: "Mock Server",
            comms: {
                ip: "192.168.1.301",
                read_community: "public",
                write_community: "private",
                snmp_version: 1,
                network_port: null,
                driver: null,
            },
            make: "Linux server 6.11.0-17-generic x86_64",
        },
        sensors: {
            cpus: {
                "196608": {
                    index: 196608,
                    unique_id: "cpu-001",
                    utilization_percent: Number(rand(5, 95).toFixed(1)),
                    current_rate_hz: 1400000000.0,
                    max_rate_Hz: 1700000000.0,
                    temperature_c: Number(rand(25, 85).toFixed(1)),
                }
            },
            ram: {
                utilization_percent: rand(40, 99).toFixed(2),
                total_bytes: "67309817856",
                cached_bytes: "60301217792",
            },
        },
        parameters: {
            ready: "READY",
            power_state: "ONLINE",
            averaging_interval_ms: 10000,
        },
        status: randomChoice(['normal', 'caution']),
        last_updated: generateTimestamp()
    };
    return baseServerData;
}
// Route handlers for different service types
app.get('/service/*', function (c) {
    var fullUrl = c.req.url;
    var serviceUrl = fullUrl.split('/service/')[1] || '';
    console.log("Mock service request for: ".concat(serviceUrl));
    try {
        // Determine device type based on service URL patterns
        if (serviceUrl.includes('/snmp') && (serviceUrl.includes('101') || serviceUrl.includes('102'))) {
            // PDU devices
            return c.json(generatePDUData());
        }
        else if (serviceUrl.includes('/snmp') && serviceUrl.includes('103')) {
            // UPS devices  
            return c.json(generateUPSData());
        }
        else if (serviceUrl.includes('/snmp') && (serviceUrl.includes('201') || serviceUrl.includes('202'))) {
            // Network Switch devices
            return c.json(generateSwitchData());
        }
        else if (serviceUrl.includes('/api') && (serviceUrl.includes('301') || serviceUrl.includes('302') || serviceUrl.includes('401'))) {
            // Server devices
            return c.json(generateServerData());
        }
        else if (serviceUrl.includes('/api') && (serviceUrl.includes('501') || serviceUrl.includes('503'))) {
            // RF Equipment
            return c.json(generateRFEquipmentData());
        }
        else if (serviceUrl.includes('/api') && (serviceUrl.includes('601') || serviceUrl.includes('602'))) {
            // RF to Fiber converters
            return c.json(generateRFToFiberData());
        }
        else if (serviceUrl.includes('/scpi')) {
            // SCPI devices (Spectrum Analyzers, RF Equipment)
            if (serviceUrl.includes('701')) {
                return c.json(generateSpectrumAnalyzerData());
            }
            else {
                return c.json(generateRFEquipmentData());
            }
        }
        else if (serviceUrl.includes('/api') && serviceUrl.includes('701')) {
            // Storage/NAS devices
            return c.json(generateStorageData());
        }
        else if (serviceUrl.startsWith('rtsp://')) {
            // Camera devices
            return c.json(generateCameraData());
        }
        else if (serviceUrl.includes('/ntp')) {
            // NTP Time servers
            return c.json({
                device_info: {
                    model: 'NTP Time Server',
                    version: 'ntpd 4.2.8',
                    uptime_seconds: Math.floor(rand(86400, 2592000))
                },
                time_sync: {
                    current_time: generateTimestamp(),
                    stratum: randomChoice([1, 2, 3]),
                    reference_clock: randomChoice(['GPS', 'ATOMIC', 'INTERNET']),
                    offset_ms: Number(rand(-5, 5).toFixed(3)),
                    jitter_ms: Number(rand(0.1, 2.0).toFixed(3)),
                    sync_status: randomChoice(['synchronized', 'unsynchronized'])
                },
                status: 'normal',
                last_updated: generateTimestamp()
            });
        }
        else {
            // Generic fallback
            return c.json({
                device_info: {
                    model: 'Unknown Device',
                    status: 'unknown',
                    message: "Mock data for service: ".concat(serviceUrl)
                },
                status: 'normal',
                last_updated: generateTimestamp()
            });
        }
    }
    catch (error) {
        console.error("Error generating mock data for ".concat(serviceUrl, ":"), error);
        return c.json({ error: 'Mock service error', service_url: serviceUrl }, 500);
    }
});
// Health check endpoint
app.get('/health', function (c) {
    return c.json({
        status: 'healthy',
        service: 'mock-external-service',
        timestamp: generateTimestamp()
    });
});
// Start the mock service
var port = 8092;
console.log("\uD83D\uDE80 Mock External Service starting on port ".concat(port));
console.log("\uD83D\uDCE1 Ready to serve mock data for CSI device polling");
(0, bun_1.serve)({
    fetch: app.fetch,
    port: port,
});
