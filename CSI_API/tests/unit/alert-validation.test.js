"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var bun_test_1 = require("bun:test");
var alertsValidationSchemas_1 = require("../../src/routes/alerts/alertsValidationSchemas");
(0, bun_test_1.describe)('Alert Validation Schemas', function () {
    (0, bun_test_1.describe)('alertCreateSchema', function () {
        (0, bun_test_1.it)('should validate a valid alert', function () {
            var validAlert = {
                level: 'CRITICAL',
                message: 'CPU temperature exceeds threshold',
                source: 'Device Monitor',
                deviceId: 1,
                siteId: 1,
                metricType: 'cpu_temp',
                currentValue: 85,
                thresholdValue: 80
            };
            var result = alertsValidationSchemas_1.alertCreateSchema.safeParse(validAlert);
            (0, bun_test_1.expect)(result.success).toBe(true);
        });
        (0, bun_test_1.it)('should reject invalid severity level', function () {
            var invalidAlert = {
                level: 'INVALID',
                message: 'Test alert',
                source: 'Test'
            };
            var result = alertsValidationSchemas_1.alertCreateSchema.safeParse(invalidAlert);
            (0, bun_test_1.expect)(result.success).toBe(false);
        });
        (0, bun_test_1.it)('should require message field', function () {
            var invalidAlert = {
                level: 'WARNING',
                source: 'Test'
                // missing message
            };
            var result = alertsValidationSchemas_1.alertCreateSchema.safeParse(invalidAlert);
            (0, bun_test_1.expect)(result.success).toBe(false);
        });
    });
    (0, bun_test_1.describe)('alertUpdateSchema', function () {
        (0, bun_test_1.it)('should allow status updates', function () {
            var update = {
                status: 'acknowledged',
                acknowledgedBy: 'user@example.com'
            };
            var result = alertsValidationSchemas_1.alertUpdateSchema.safeParse(update);
            (0, bun_test_1.expect)(result.success).toBe(true);
        });
        (0, bun_test_1.it)('should allow resolution updates', function () {
            var update = {
                status: 'resolved',
                resolvedBy: 'admin@example.com',
                resolutionNotes: 'Restarted service'
            };
            var result = alertsValidationSchemas_1.alertUpdateSchema.safeParse(update);
            (0, bun_test_1.expect)(result.success).toBe(true);
        });
    });
    (0, bun_test_1.describe)('alertBulkOperationSchema', function () {
        (0, bun_test_1.it)('should validate bulk acknowledge operation', function () {
            var bulkOp = {
                alertIds: [1, 2, 3, 4, 5],
                operation: 'acknowledge',
                performedBy: 'user@example.com'
            };
            var result = alertsValidationSchemas_1.alertBulkOperationSchema.safeParse(bulkOp);
            (0, bun_test_1.expect)(result.success).toBe(true);
        });
        (0, bun_test_1.it)('should reject empty alert IDs array', function () {
            var bulkOp = {
                alertIds: [],
                operation: 'resolve'
            };
            var result = alertsValidationSchemas_1.alertBulkOperationSchema.safeParse(bulkOp);
            (0, bun_test_1.expect)(result.success).toBe(false);
        });
    });
});
