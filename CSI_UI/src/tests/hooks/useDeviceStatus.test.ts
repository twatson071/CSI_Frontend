import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useDeviceStatus } from '../../hooks/useDeviceStatus';
import * as DeviceService from '../../services/DeviceService';

// Mock the DeviceService
vi.mock('../../services/DeviceService');

describe('useDeviceStatus Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('should fetch device status on mount', async () => {
    const mockDevices = [
      { id: 1, name: 'Device 1', status: 'online' },
      { id: 2, name: 'Device 2', status: 'offline' }
    ];
    
    vi.mocked(DeviceService.getAllDeviceStatus).mockResolvedValue(mockDevices);
    
    const { result } = renderHook(() => useDeviceStatus());
    
    // Initially loading
    expect(result.current.loading).toBe(true);
    expect(result.current.devices).toEqual([]);
    
    // Wait for data to load
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(result.current.devices).toEqual(mockDevices);
    expect(result.current.error).toBeNull();
  });
  
  it('should handle fetch errors', async () => {
    const mockError = new Error('Failed to fetch devices');
    vi.mocked(DeviceService.getAllDeviceStatus).mockRejectedValue(mockError);
    
    const { result } = renderHook(() => useDeviceStatus());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(result.current.devices).toEqual([]);
    expect(result.current.error).toBe('Failed to fetch devices');
  });
  
  it('should poll for updates at specified interval', async () => {
    const mockDevices = [{ id: 1, name: 'Device 1', status: 'online' }];
    vi.mocked(DeviceService.getAllDeviceStatus).mockResolvedValue(mockDevices);
    
    // Use fake timers
    vi.useFakeTimers();
    
    const { result } = renderHook(() => useDeviceStatus(1000)); // 1 second interval
    
    // Wait for initial load
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(DeviceService.getAllDeviceStatus).toHaveBeenCalledTimes(1);
    
    // Advance timer
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    
    await waitFor(() => {
      expect(DeviceService.getAllDeviceStatus).toHaveBeenCalledTimes(2);
    });
    
    vi.useRealTimers();
  });
  
  it('should filter devices by site', async () => {
    const mockDevices = [
      { id: 1, name: 'Device 1', status: 'online', siteId: 1 },
      { id: 2, name: 'Device 2', status: 'offline', siteId: 2 },
      { id: 3, name: 'Device 3', status: 'online', siteId: 1 }
    ];
    
    vi.mocked(DeviceService.getAllDeviceStatus).mockResolvedValue(mockDevices);
    
    const { result } = renderHook(() => useDeviceStatus(null, 1));
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    // Should only return devices from site 1
    expect(result.current.devices).toHaveLength(2);
    expect(result.current.devices.every(d => d.siteId === 1)).toBe(true);
  });
});