import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { DeviceService } from '../../services/DeviceService';

vi.mock('axios');

describe('DeviceService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  describe('getDevices', () => {
    it('should fetch devices successfully', async () => {
      const mockDevices = [
        { id: 1, name: 'Device 1', type: 'Server' },
        { id: 2, name: 'Device 2', type: 'PDU' }
      ];
      
      vi.mocked(axios.get).mockResolvedValue({ data: mockDevices });
      
      const result = await DeviceService.getDevices();
      
      expect(axios.get).toHaveBeenCalledWith('/api/devices', expect.any(Object));
      expect(result).toEqual(mockDevices);
    });
    
    it('should handle API errors', async () => {
      vi.mocked(axios.get).mockRejectedValue(new Error('Network error'));
      
      await expect(DeviceService.getDevices()).rejects.toThrow('Network error');
    });
  });
  
  describe('createDevice', () => {
    it('should create a new device', async () => {
      const newDevice = {
        name: 'New Device',
        type: 'Server',
        serviceUrl: 'http://device.local',
        siteId: 1
      };
      
      const createdDevice = { id: 3, ...newDevice };
      vi.mocked(axios.post).mockResolvedValue({ data: createdDevice });
      
      const result = await DeviceService.createDevice(newDevice);
      
      expect(axios.post).toHaveBeenCalledWith('/api/devices', newDevice, expect.any(Object));
      expect(result).toEqual(createdDevice);
    });
    
    it('should handle validation errors', async () => {
      const invalidDevice = { name: '' }; // Missing required fields
      
      vi.mocked(axios.post).mockRejectedValue({
        response: {
          status: 400,
          data: { error: 'Validation failed' }
        }
      });
      
      await expect(DeviceService.createDevice(invalidDevice)).rejects.toThrow();
    });
  });
  
  describe('updateDevice', () => {
    it('should update device successfully', async () => {
      const deviceId = 1;
      const updates = { name: 'Updated Device' };
      const updatedDevice = { id: deviceId, ...updates };
      
      vi.mocked(axios.put).mockResolvedValue({ data: updatedDevice });
      
      const result = await DeviceService.updateDevice(deviceId, updates);
      
      expect(axios.put).toHaveBeenCalledWith(`/api/devices/${deviceId}`, updates, expect.any(Object));
      expect(result).toEqual(updatedDevice);
    });
  });
  
  describe('deleteDevice', () => {
    it('should delete device successfully', async () => {
      const deviceId = 1;
      vi.mocked(axios.delete).mockResolvedValue({ data: { success: true } });
      
      await DeviceService.deleteDevice(deviceId);
      
      expect(axios.delete).toHaveBeenCalledWith(`/api/devices/${deviceId}`, expect.any(Object));
    });
  });
  
  describe('getDeviceMetrics', () => {
    it('should fetch device metrics with time range', async () => {
      const deviceId = 1;
      const startTime = '2024-01-01T00:00:00Z';
      const endTime = '2024-01-01T12:00:00Z';
      
      const mockMetrics = {
        cpu: [{ timestamp: startTime, value: 45 }],
        memory: [{ timestamp: startTime, value: 60 }]
      };
      
      vi.mocked(axios.get).mockResolvedValue({ data: mockMetrics });
      
      const result = await DeviceService.getDeviceMetrics(deviceId, startTime, endTime);
      
      expect(axios.get).toHaveBeenCalledWith(
        `/api/devices/${deviceId}/metrics`,
        expect.objectContaining({
          params: { startTime, endTime }
        })
      );
      expect(result).toEqual(mockMetrics);
    });
  });
});