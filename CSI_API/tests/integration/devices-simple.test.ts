import { describe, it, expect } from 'bun:test';
import { CreateDeviceSchema, UpdateDeviceSchema } from '../../src/routes/devices/deviceValidationSchemas';

describe('Device Schema Integration Tests', () => {
  describe('CreateDeviceSchema validation', () => {
    it('should validate complete device object', () => {
      const device = {
        name: 'Production Server',
        type: 'Server',
        serviceUrl: 'http://192.168.1.100:8080/api',
        siteId: 1,
        ipAddress: '192.168.1.100',
        status: 'normal',
        parameters: [],
        data: { custom: 'data' }
      };
      
      const result = CreateDeviceSchema.safeParse(device);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('Production Server');
        expect(result.data.type).toBe('Server');
      }
    });
    
    it('should handle minimal valid device', () => {
      const device = {
        name: 'Minimal Device',
        type: 'PDU',
        serviceUrl: 'http://pdu.local/api'
      };
      
      const result = CreateDeviceSchema.safeParse(device);
      expect(result.success).toBe(true);
    });
  });
  
  describe('UpdateDeviceSchema validation', () => {
    it('should allow empty updates', () => {
      const update = {};
      const result = UpdateDeviceSchema.safeParse(update);
      expect(result.success).toBe(true);
    });
    
    it('should validate partial updates with new values', () => {
      const update = {
        name: 'Updated Device Name',
        status: 'caution',
        ipAddress: '10.0.0.1'
      };
      
      const result = UpdateDeviceSchema.safeParse(update);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('Updated Device Name');
        expect(result.data.status).toBe('caution');
      }
    });
  });
});