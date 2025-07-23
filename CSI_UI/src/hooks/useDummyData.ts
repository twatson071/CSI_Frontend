/**
 * Dummy Data Management Hook
 * Provides integration between dummy data and the device management system
 */

import { useState, useEffect, useCallback } from 'react';
import { Device } from '../types/device';
import { dummyDevices, dummySites, Site, getDevicesBySite, getDevicesByType, getDeviceStats } from '../data/dummyDeviceData';

interface UseDummyDataReturn {
  devices: Device[];
  sites: Site[];
  loadDummyData: () => void;
  clearData: () => void;
  addDevice: (device: Device) => void;
  updateDevice: (id: string, updates: Partial<Device>) => void;
  removeDevice: (id: string) => void;
  getDevicesBySite: (siteId: string) => Device[];
  getDevicesByType: (type: string) => Device[];
  getStats: () => ReturnType<typeof getDeviceStats>;
  isLoaded: boolean;
}

const STORAGE_KEY = 'csi-dummy-devices';
const SITES_STORAGE_KEY = 'csi-dummy-sites';

export function useDummyData(): UseDummyDataReturn {
  const [devices, setDevices] = useState<Device[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load data from localStorage or use dummy data
  useEffect(() => {
    const storedDevices = localStorage.getItem(STORAGE_KEY);
    const storedSites = localStorage.getItem(SITES_STORAGE_KEY);

    if (storedDevices && storedSites) {
      try {
        setDevices(JSON.parse(storedDevices));
        setSites(JSON.parse(storedSites));
        setIsLoaded(true);
      } catch (error) {
        console.error('Error parsing stored data:', error);
        loadDummyData();
      }
    } else {
      loadDummyData();
    }
  }, []);

  // Save devices to localStorage whenever they change
  useEffect(() => {
    if (devices.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(devices));
    }
  }, [devices]);

  // Save sites to localStorage whenever they change
  useEffect(() => {
    if (sites.length > 0) {
      localStorage.setItem(SITES_STORAGE_KEY, JSON.stringify(sites));
    }
  }, [sites]);

  const loadDummyData = useCallback(() => {
    setDevices([...dummyDevices]);
    setSites([...dummySites]);
    setIsLoaded(true);
    
    // Also save to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dummyDevices));
    localStorage.setItem(SITES_STORAGE_KEY, JSON.stringify(dummySites));
  }, []);

  const clearData = useCallback(() => {
    setDevices([]);
    setSites([]);
    setIsLoaded(false);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(SITES_STORAGE_KEY);
  }, []);

  const addDevice = useCallback((device: Device) => {
    setDevices(prev => [...prev, device]);
  }, []);

  const updateDevice = useCallback((id: string, updates: Partial<Device>) => {
    setDevices(prev => prev.map(device => 
      device.id === id ? { ...device, ...updates } : device
    ));
  }, []);

  const removeDevice = useCallback((id: string) => {
    setDevices(prev => prev.filter(device => device.id !== id));
  }, []);

  const getDevicesBySiteCallback = useCallback((siteId: string) => {
    return devices.filter(device => device.siteId === siteId);
  }, [devices]);

  const getDevicesByTypeCallback = useCallback((type: string) => {
    return devices.filter(device => device.type === type);
  }, [devices]);

  const getStats = useCallback(() => {
    const stats = {
      total: devices.length,
      online: devices.filter(d => d.status === 'normal' || d.status === 'online').length,
      offline: devices.filter(d => d.status === 'off' || d.status === 'offline').length,
      warning: devices.filter(d => d.status === 'caution' || d.status === 'warning').length,
      critical: devices.filter(d => d.status === 'critical' || d.status === 'error').length,
      byType: {} as Record<string, number>,
      bySite: {} as Record<string, number>
    };

    // Count by type
    devices.forEach(device => {
      stats.byType[device.type] = (stats.byType[device.type] || 0) + 1;
    });

    // Count by site
    devices.forEach(device => {
      if (device.siteId) {
        stats.bySite[device.siteId] = (stats.bySite[device.siteId] || 0) + 1;
      }
    });

    return stats;
  }, [devices]);

  return {
    devices,
    sites,
    loadDummyData,
    clearData,
    addDevice,
    updateDevice,
    removeDevice,
    getDevicesBySite: getDevicesBySiteCallback,
    getDevicesByType: getDevicesByTypeCallback,
    getStats,
    isLoaded
  };
}