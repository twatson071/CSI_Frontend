"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var bun_test_1 = require("bun:test");
var deviceValidationSchemas_1 = require("../../src/routes/devices/deviceValidationSchemas");
(0, bun_test_1.describe)('Device Validation Schemas', function () {
    (0, bun_test_1.describe)('CreateDeviceSchema', function () {
        (0, bun_test_1.it)('should validate a valid device', function () {
            var validDevice = {
                name: 'Test Server',
                type: 'Server',
                serviceUrl: 'http://192.168.1.100:8080/api',
                siteId: 1,
                ipAddress: '192.168.1.100',
                status: 'normal'
            };
            var result = deviceValidationSchemas_1.CreateDeviceSchema.safeParse(validDevice);
            (0, bun_test_1.expect)(result.success).toBe(true);
        });
        (0, bun_test_1.it)('should reject invalid IP address', function () {
            var invalidDevice = {
                name: 'Test Server',
                type: 'Server',
                serviceUrl: 'http://192.168.1.100:8080/api',
                ipAddress: 'not-an-ip'
            };
            var result = deviceValidationSchemas_1.CreateDeviceSchema.safeParse(invalidDevice);
            (0, bun_test_1.expect)(result.success).toBe(false);
        });
        (0, bun_test_1.it)('should reject missing required fields', function () {
            var invalidDevice = {
                name: 'Test Server',
                // missing type and serviceUrl
            };
            var result = deviceValidationSchemas_1.CreateDeviceSchema.safeParse(invalidDevice);
            (0, bun_test_1.expect)(result.success).toBe(false);
        });
        (0, bun_test_1.it)('should accept valid status values', function () {
            var validStatuses = ['off', 'standby', 'normal', 'caution', 'serious', 'critical'];
            validStatuses.forEach(function (status) {
                var device = {
                    name: 'Test Device',
                    type: 'Server',
                    serviceUrl: 'http://test.com',
                    status: status
                };
                var result = deviceValidationSchemas_1.CreateDeviceSchema.safeParse(device);
                (0, bun_test_1.expect)(result.success).toBe(true);
            });
        });
        (0, bun_test_1.it)('should reject invalid status', function () {
            var invalidDevice = {
                name: 'Test Device',
                type: 'Server',
                serviceUrl: 'http://test.com',
                status: 'invalid-status'
            };
            var result = deviceValidationSchemas_1.CreateDeviceSchema.safeParse(invalidDevice);
            (0, bun_test_1.expect)(result.success).toBe(false);
        });
    });
    (0, bun_test_1.describe)('UpdateDeviceSchema', function () {
        (0, bun_test_1.it)('should allow partial updates', function () {
            var partialUpdate = {
                name: 'Updated Name'
            };
            var result = deviceValidationSchemas_1.UpdateDeviceSchema.safeParse(partialUpdate);
            (0, bun_test_1.expect)(result.success).toBe(true);
        });
        (0, bun_test_1.it)('should validate status enum on updates', function () {
            var statusUpdate = {
                status: 'critical'
            };
            var result = deviceValidationSchemas_1.UpdateDeviceSchema.safeParse(statusUpdate);
            (0, bun_test_1.expect)(result.success).toBe(true);
            var invalidStatus = {
                status: 'invalid-status'
            };
            var invalidResult = deviceValidationSchemas_1.UpdateDeviceSchema.safeParse(invalidStatus);
            (0, bun_test_1.expect)(invalidResult.success).toBe(false);
        });
    });
});
