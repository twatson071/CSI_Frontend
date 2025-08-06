import { describe, it, expect } from 'bun:test';
import { 
  CreateDeviceSchema, 
  UpdateDeviceSchema 
} from '../../src/routes/devices/deviceValidationSchemas';

describe('Device Validation Schemas', () => {
  describe('CreateDeviceSchema', () => {
    it('should validate a valid device', () => {
      const validDevice = {
        name: 'Test Server',
        type: 'Server',
        serviceUrl: 'http://192.168.1.100:8080/api',
        siteId: 1,
        ipAddress: '192.168.1.100',
        status: 'normal'
      };
      
      const result = CreateDeviceSchema.safeParse(validDevice);
      expect(result.success).toBe(true);
    });
    
    it('should reject invalid IP address', () => {
      const invalidDevice = {
        name: 'Test Server',
        type: 'Server',
        serviceUrl: 'http://192.168.1.100:8080/api',
        ipAddress: 'not-an-ip'
      };
      
      const result = CreateDeviceSchema.safeParse(invalidDevice);
      expect(result.success).toBe(false);
    });
    
    it('should reject missing required fields', () => {
      const invalidDevice = {
        name: 'Test Server',
        // missing type and serviceUrl
      };
      
      const result = CreateDeviceSchema.safeParse(invalidDevice);
      expect(result.success).toBe(false);
    });
    
    it('should accept valid status values', () => {
      const validStatuses = ['off', 'standby', 'normal', 'caution', 'serious', 'critical'];
      
      validStatuses.forEach(status => {
        const device = {
          name: 'Test Device',
          type: 'Server',
          serviceUrl: 'http://test.com',
          status
        };
        
        const result = CreateDeviceSchema.safeParse(device);
        expect(result.success).toBe(true);
      });
    });
    
    it('should reject invalid status', () => {
      const invalidDevice = {
        name: 'Test Device',
        type: 'Server',
        serviceUrl: 'http://test.com',
        status: 'invalid-status'
      };
      
      const result = CreateDeviceSchema.safeParse(invalidDevice);
      expect(result.success).toBe(false);
    });
  });
  
  describe('UpdateDeviceSchema', () => {
    it('should allow partial updates', () => {
      const partialUpdate = {
        name: 'Updated Name'
      };
      
      const result = UpdateDeviceSchema.safeParse(partialUpdate);
      expect(result.success).toBe(true);
    });
    
    it('should validate status enum on updates', () => {
      const statusUpdate = {
        status: 'critical'
      };
      
      const result = UpdateDeviceSchema.safeParse(statusUpdate);
      expect(result.success).toBe(true);
      
      const invalidStatus = {
        status: 'invalid-status'
      };
      
      const invalidResult = UpdateDeviceSchema.safeParse(invalidStatus);
      expect(invalidResult.success).toBe(false);
    });
  });
});