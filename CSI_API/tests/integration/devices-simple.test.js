"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var bun_test_1 = require("bun:test");
var deviceValidationSchemas_1 = require("../../src/routes/devices/deviceValidationSchemas");
(0, bun_test_1.describe)('Device Schema Integration Tests', function () {
    (0, bun_test_1.describe)('CreateDeviceSchema validation', function () {
        (0, bun_test_1.it)('should validate complete device object', function () {
            var device = {
                name: 'Production Server',
                type: 'Server',
                serviceUrl: 'http://192.168.1.100:8080/api',
                siteId: 1,
                ipAddress: '192.168.1.100',
                status: 'normal',
                parameters: [],
                data: { custom: 'data' }
            };
            var result = deviceValidationSchemas_1.CreateDeviceSchema.safeParse(device);
            (0, bun_test_1.expect)(result.success).toBe(true);
            if (result.success) {
                (0, bun_test_1.expect)(result.data.name).toBe('Production Server');
                (0, bun_test_1.expect)(result.data.type).toBe('Server');
            }
        });
        (0, bun_test_1.it)('should handle minimal valid device', function () {
            var device = {
                name: 'Minimal Device',
                type: 'PDU',
                serviceUrl: 'http://pdu.local/api'
            };
            var result = deviceValidationSchemas_1.CreateDeviceSchema.safeParse(device);
            (0, bun_test_1.expect)(result.success).toBe(true);
        });
    });
    (0, bun_test_1.describe)('UpdateDeviceSchema validation', function () {
        (0, bun_test_1.it)('should allow empty updates', function () {
            var update = {};
            var result = deviceValidationSchemas_1.UpdateDeviceSchema.safeParse(update);
            (0, bun_test_1.expect)(result.success).toBe(true);
        });
        (0, bun_test_1.it)('should validate partial updates with new values', function () {
            var update = {
                name: 'Updated Device Name',
                status: 'caution',
                ipAddress: '10.0.0.1'
            };
            var result = deviceValidationSchemas_1.UpdateDeviceSchema.safeParse(update);
            (0, bun_test_1.expect)(result.success).toBe(true);
            if (result.success) {
                (0, bun_test_1.expect)(result.data.name).toBe('Updated Device Name');
                (0, bun_test_1.expect)(result.data.status).toBe('caution');
            }
        });
    });
});
