import { describe, it, expect } from 'bun:test';
import { 
  alertCreateSchema,
  alertUpdateSchema,
  alertBulkOperationSchema 
} from '../../src/routes/alerts/alertsValidationSchemas';

describe('Alert Validation Schemas', () => {
  describe('alertCreateSchema', () => {
    it('should validate a valid alert', () => {
      const validAlert = {
        level: 'CRITICAL',
        message: 'CPU temperature exceeds threshold',
        source: 'Device Monitor',
        deviceId: 1,
        siteId: 1,
        metricType: 'cpu_temp',
        currentValue: 85,
        thresholdValue: 80
      };
      
      const result = alertCreateSchema.safeParse(validAlert);
      expect(result.success).toBe(true);
    });
    
    it('should reject invalid severity level', () => {
      const invalidAlert = {
        level: 'INVALID',
        message: 'Test alert',
        source: 'Test'
      };
      
      const result = alertCreateSchema.safeParse(invalidAlert);
      expect(result.success).toBe(false);
    });
    
    it('should require message field', () => {
      const invalidAlert = {
        level: 'WARNING',
        source: 'Test'
        // missing message
      };
      
      const result = alertCreateSchema.safeParse(invalidAlert);
      expect(result.success).toBe(false);
    });
  });
  
  describe('alertUpdateSchema', () => {
    it('should allow status updates', () => {
      const update = {
        status: 'acknowledged',
        acknowledgedBy: 'user@example.com'
      };
      
      const result = alertUpdateSchema.safeParse(update);
      expect(result.success).toBe(true);
    });
    
    it('should allow resolution updates', () => {
      const update = {
        status: 'resolved',
        resolvedBy: 'admin@example.com',
        resolutionNotes: 'Restarted service'
      };
      
      const result = alertUpdateSchema.safeParse(update);
      expect(result.success).toBe(true);
    });
  });
  
  describe('alertBulkOperationSchema', () => {
    it('should validate bulk acknowledge operation', () => {
      const bulkOp = {
        alertIds: [1, 2, 3, 4, 5],
        operation: 'acknowledge',
        performedBy: 'user@example.com'
      };
      
      const result = alertBulkOperationSchema.safeParse(bulkOp);
      expect(result.success).toBe(true);
    });
    
    it('should reject empty alert IDs array', () => {
      const bulkOp = {
        alertIds: [],
        operation: 'resolve'
      };
      
      const result = alertBulkOperationSchema.safeParse(bulkOp);
      expect(result.success).toBe(false);
    });
  });
});