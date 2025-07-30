/**
 * useConfigPersistence Hook
 * Manages persistent configuration for various UI components
 */

import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { useSessionStorage } from './useSessionStorage';

export interface TableConfig {
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
  pageSize?: number;
  columnVisibility?: Record<string, boolean>;
  columnOrder?: string[];
  filters?: Record<string, any>;
}

export interface ViewConfig {
  mode?: 'table' | 'grid' | 'cards' | 'list';
  density?: 'compact' | 'normal' | 'comfortable';
  sidebarCollapsed?: boolean;
  panelSizes?: Record<string, number>;
}

export interface FilterConfig {
  savedFilters?: Array<{
    id: string;
    name: string;
    filters: Record<string, any>;
    isDefault?: boolean;
  }>;
  recentSearches?: string[];
  activeFilterId?: string;
}

export interface ChartConfig {
  timeRange?: string;
  refreshInterval?: number;
  chartType?: string;
  metrics?: string[];
  aggregation?: string;
}

export interface UIConfig {
  theme?: 'light' | 'dark' | 'auto';
  language?: string;
  timezone?: string;
  dateFormat?: string;
  numberFormat?: string;
  animations?: boolean;
  soundEnabled?: boolean;
}

export interface ConfigPersistenceOptions {
  namespace?: string;
  storage?: 'local' | 'session';
  syncAcrossTabs?: boolean;
  version?: number;
}

const DEFAULT_OPTIONS: ConfigPersistenceOptions = {
  namespace: 'csi-config',
  storage: 'local',
  syncAcrossTabs: true,
  version: 1,
};

export function useConfigPersistence<T extends Record<string, any>>(
  configKey: string,
  defaultConfig: T,
  options: ConfigPersistenceOptions = {}
): {
  config: T;
  updateConfig: (updates: Partial<T>) => void;
  resetConfig: () => void;
  exportConfig: () => string;
  importConfig: (configJson: string) => boolean;
} {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const storageKey = `${opts.namespace}:${configKey}:v${opts.version}`;

  // Choose storage based on options
  const useStorage = opts.storage === 'session' ? useSessionStorage : useLocalStorage;
  
  const [config, setConfig, removeConfig] = useStorage<T>(storageKey, defaultConfig);

  // Update config with partial updates
  const updateConfig = useCallback(
    (updates: Partial<T>) => {
      setConfig((current) => ({
        ...current,
        ...updates,
      }));
    },
    [setConfig]
  );

  // Reset to default config
  const resetConfig = useCallback(() => {
    removeConfig();
  }, [removeConfig]);

  // Export config as JSON string
  const exportConfig = useCallback((): string => {
    return JSON.stringify({
      version: opts.version,
      timestamp: new Date().toISOString(),
      key: configKey,
      config,
    }, null, 2);
  }, [config, configKey, opts.version]);

  // Import config from JSON string
  const importConfig = useCallback((configJson: string): boolean => {
    try {
      const imported = JSON.parse(configJson);
      
      // Validate import
      if (imported.key !== configKey) {
        console.error('Config key mismatch');
        return false;
      }
      
      if (imported.version !== opts.version) {
        console.warn('Config version mismatch, attempting migration...');
        // Here you could implement version migration logic
      }
      
      setConfig(imported.config);
      return true;
    } catch (error) {
      console.error('Failed to import config:', error);
      return false;
    }
  }, [configKey, opts.version, setConfig]);

  return {
    config,
    updateConfig,
    resetConfig,
    exportConfig,
    importConfig,
  };
}

// Specialized hooks for common configurations

export function useTableConfig(tableId: string, defaults?: Partial<TableConfig>) {
  return useConfigPersistence<TableConfig>(`table:${tableId}`, {
    pageSize: 20,
    sortDirection: 'asc',
    ...defaults,
  });
}

export function useViewConfig(viewId: string, defaults?: Partial<ViewConfig>) {
  return useConfigPersistence<ViewConfig>(`view:${viewId}`, {
    mode: 'table',
    density: 'normal',
    sidebarCollapsed: false,
    ...defaults,
  });
}

export function useFilterConfig(componentId: string) {
  return useConfigPersistence<FilterConfig>(`filter:${componentId}`, {
    savedFilters: [],
    recentSearches: [],
  });
}

export function useChartConfig(chartId: string, defaults?: Partial<ChartConfig>) {
  return useConfigPersistence<ChartConfig>(`chart:${chartId}`, {
    timeRange: '1h',
    refreshInterval: 30000,
    chartType: 'line',
    ...defaults,
  });
}

export function useUIConfig() {
  return useConfigPersistence<UIConfig>('ui', {
    theme: 'dark',
    language: 'en',
    timezone: 'local',
    dateFormat: 'MM/DD/YYYY',
    numberFormat: 'en-US',
    animations: true,
    soundEnabled: false,
  });
}

// Hook for managing all configurations
export function useAllConfigs() {
  const exportAllConfigs = useCallback((): string => {
    const configs: Record<string, unknown> = {};
    
    // Collect all configs from localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('csi-config:')) {
        try {
          configs[key] = JSON.parse(localStorage.getItem(key) || '{}');
        } catch (e) {
          console.error(`Failed to parse config ${key}:`, e);
        }
      }
    }
    
    return JSON.stringify({
      version: 1,
      timestamp: new Date().toISOString(),
      configs,
    }, null, 2);
  }, []);

  const importAllConfigs = useCallback((configsJson: string): boolean => {
    try {
      const imported = JSON.parse(configsJson);
      
      // Clear existing configs
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('csi-config:')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      // Import new configs
      Object.entries(imported.configs).forEach(([key, value]) => {
        localStorage.setItem(key, JSON.stringify(value));
      });
      
      // Trigger update
      window.dispatchEvent(new Event('local-storage'));
      
      return true;
    } catch (error) {
      console.error('Failed to import all configs:', error);
      return false;
    }
  }, []);

  const resetAllConfigs = useCallback(() => {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('csi-config:')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    window.dispatchEvent(new Event('local-storage'));
  }, []);

  return {
    exportAllConfigs,
    importAllConfigs,
    resetAllConfigs,
  };
}