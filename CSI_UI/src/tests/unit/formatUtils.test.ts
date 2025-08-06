import { describe, it, expect } from 'vitest';
import { 
  formatBytes, 
  formatBandwidth,
  formatSpeed,
  formatTemperature,
  formatUtilization,
  formatDateTime
} from '../../utils/FormatUtils';

describe('FormatUtils', () => {
  describe('formatBytes', () => {
    it('formats bytes correctly', () => {
      expect(formatBytes(0)).toBe('N/A');
      expect(formatBytes(null)).toBe('N/A');
      expect(formatBytes(undefined)).toBe('N/A');
      expect(formatBytes(1024)).toBe('1 KB');
      expect(formatBytes(1048576)).toBe('1 MB');
      expect(formatBytes(1073741824)).toBe('1 GB');
      expect(formatBytes(512)).toBe('512 B');
    });
  });
  
  describe('formatBandwidth', () => {
    it('formats bandwidth correctly', () => {
      expect(formatBandwidth(0)).toBe('N/A');
      expect(formatBandwidth(null)).toBe('N/A');
      expect(formatBandwidth(1000)).toBe('1 Kbps');
      expect(formatBandwidth(1000000)).toBe('1 Mbps');
      expect(formatBandwidth(1000000000)).toBe('1 Gbps');
    });
  });
  
  describe('formatSpeed', () => {
    it('formats speed correctly', () => {
      expect(formatSpeed(0)).toBe('N/A');
      expect(formatSpeed(null)).toBe('N/A');
      expect(formatSpeed(1000)).toBe('1 Khz');
      expect(formatSpeed(1000000)).toBe('1 Mhz');
      expect(formatSpeed(1000000000)).toBe('1 Ghz');
    });
  });
  
  describe('formatTemperature', () => {
    it('formats temperature correctly', () => {
      expect(formatTemperature(null)).toBe('N/A');
      expect(formatTemperature(undefined)).toBe('N/A');
      expect(formatTemperature(0)).toBe('0.0 °C');
      expect(formatTemperature(25.5)).toBe('25.5 °C');
      expect(formatTemperature(100)).toBe('100.0 °C');
    });
  });
  
  describe('formatUtilization', () => {
    it('formats utilization percentage correctly', () => {
      expect(formatUtilization(null)).toBe('N/A');
      expect(formatUtilization(undefined)).toBe('N/A');
      expect(formatUtilization(0)).toBe('0.00%');
      expect(formatUtilization(0.5)).toBe('50.00%');
      expect(formatUtilization(1)).toBe('100.00%');
      expect(formatUtilization(0.12345)).toBe('12.35%');
    });
  });
  
  describe('formatDateTime', () => {
    it('formats datetime correctly', () => {
      // Use a fixed date to avoid timezone issues in tests
      const timestamp = '2024-01-15T10:30:45Z';
      const formatted = formatDateTime(timestamp);
      // Check that it contains time components
      expect(formatted).toMatch(/\d{1,2}:\d{2}:\d{2}/);
    });
  });
});