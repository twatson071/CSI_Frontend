import { describe, it, expect } from 'vitest';
import { 
  getDeviceStatusColor,
  getDeviceStatusIcon,
  getMetricStatusColor,
  isDeviceHealthy,
  getOverallHealth
} from '../../utils/deviceStatusColors';

describe('Device Status Colors Utility', () => {
  describe('getDeviceStatusColor', () => {
    it('should return correct colors for status levels', () => {
      expect(getDeviceStatusColor('online')).toBe('#4ade80');
      expect(getDeviceStatusColor('offline')).toBe('#ef4444');
      expect(getDeviceStatusColor('warning')).toBe('#f59e0b');
      expect(getDeviceStatusColor('error')).toBe('#dc2626');
      expect(getDeviceStatusColor('unknown')).toBe('#6b7280');
    });
  });
  
  describe('getDeviceStatusIcon', () => {
    it('should return correct icons for status levels', () => {
      expect(getDeviceStatusIcon('online')).toBe('check-circle');
      expect(getDeviceStatusIcon('offline')).toBe('x-circle');
      expect(getDeviceStatusIcon('warning')).toBe('alert-triangle');
      expect(getDeviceStatusIcon('error')).toBe('alert-circle');
    });
  });
  
  describe('getMetricStatusColor', () => {
    it('should return color based on metric value and thresholds', () => {
      const thresholds = { warning: 80, critical: 90 };
      
      expect(getMetricStatusColor(50, thresholds)).toBe('#4ade80'); // Normal
      expect(getMetricStatusColor(85, thresholds)).toBe('#f59e0b'); // Warning
      expect(getMetricStatusColor(95, thresholds)).toBe('#ef4444'); // Critical
    });
    
    it('should handle inverse thresholds (lower is worse)', () => {
      const thresholds = { warning: 20, critical: 10, inverse: true };
      
      expect(getMetricStatusColor(50, thresholds)).toBe('#4ade80'); // Normal
      expect(getMetricStatusColor(15, thresholds)).toBe('#f59e0b'); // Warning
      expect(getMetricStatusColor(5, thresholds)).toBe('#ef4444'); // Critical
    });
  });
  
  describe('isDeviceHealthy', () => {
    it('should determine device health based on metrics', () => {
      const healthyDevice = {
        status: 'online',
        metrics: {
          cpu: 45,
          memory: 60,
          temperature: 65
        }
      };
      
      const unhealthyDevice = {
        status: 'online',
        metrics: {
          cpu: 95,
          memory: 98,
          temperature: 85
        }
      };
      
      expect(isDeviceHealthy(healthyDevice)).toBe(true);
      expect(isDeviceHealthy(unhealthyDevice)).toBe(false);
    });
    
    it('should consider offline devices as unhealthy', () => {
      const offlineDevice = {
        status: 'offline',
        metrics: { cpu: 0, memory: 0 }
      };
      
      expect(isDeviceHealthy(offlineDevice)).toBe(false);
    });
  });
  
  describe('getOverallHealth', () => {
    it('should calculate overall health percentage', () => {
      const devices = [
        { id: 1, status: 'online', healthy: true },
        { id: 2, status: 'online', healthy: true },
        { id: 3, status: 'warning', healthy: false },
        { id: 4, status: 'offline', healthy: false }
      ];
      
      expect(getOverallHealth(devices)).toBe(50); // 2 out of 4 healthy
    });
    
    it('should handle empty device array', () => {
      expect(getOverallHealth([])).toBe(100);
    });
  });
});