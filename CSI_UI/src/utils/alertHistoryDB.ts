// Enhanced IndexedDB utility for alert history with advanced querying
import type { Alert } from "../services/AlertService";

const DB_NAME = "alertHistoryDB";
const STORE_NAME = "alerts";
const SETTINGS_STORE = "settings";
const DB_VERSION = 2;

interface AlertHistorySettings {
  id: string;
  maxStorageSize: number; // in MB
  retentionDays: number;
  autoCleanup: boolean;
  lastCleanup?: string;
}

const DEFAULT_SETTINGS: AlertHistorySettings = {
  id: "default",
  maxStorageSize: 50, // 50MB
  retentionDays: 90, // 3 months
  autoCleanup: true,
};

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onupgradeneeded = (event) => {
      const db = request.result;
      const oldVersion = event.oldVersion;
      
      // Create alerts store with indexes
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const alertStore = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        alertStore.createIndex("severity", "severity", { unique: false });
        alertStore.createIndex("deviceId", "deviceId", { unique: false });
        alertStore.createIndex("siteId", "siteId", { unique: false });
        alertStore.createIndex("createdAt", "createdAt", { unique: false });
        alertStore.createIndex("acknowledged", "acknowledged", { unique: false });
        alertStore.createIndex("isResolved", "isResolved", { unique: false });
        alertStore.createIndex("type", "type", { unique: false });
      }
      
      // Create settings store
      if (!db.objectStoreNames.contains(SETTINGS_STORE)) {
        db.createObjectStore(SETTINGS_STORE, { keyPath: "id" });
      }
      
      // Upgrade from version 1 to 2 - add indexes if missing
      if (oldVersion === 1) {
        const transaction = request.transaction;
        const alertStore = transaction?.objectStore(STORE_NAME);
        if (alertStore && !alertStore.indexNames.contains("severity")) {
          alertStore.createIndex("severity", "severity", { unique: false });
          alertStore.createIndex("deviceId", "deviceId", { unique: false });
          alertStore.createIndex("siteId", "siteId", { unique: false });
          alertStore.createIndex("createdAt", "createdAt", { unique: false });
          alertStore.createIndex("acknowledged", "acknowledged", { unique: false });
          alertStore.createIndex("isResolved", "isResolved", { unique: false });
          alertStore.createIndex("type", "type", { unique: false });
        }
      }
    };
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Settings management
export async function getAlertHistorySettings(): Promise<AlertHistorySettings> {
  try {
    const db = await openDB();
    const tx = db.transaction(SETTINGS_STORE, "readonly");
    const store = tx.objectStore(SETTINGS_STORE);
    const request = store.get("default");
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        db.close();
        resolve(request.result || DEFAULT_SETTINGS);
      };
      request.onerror = () => {
        db.close();
        reject(request.error);
      };
    });
  } catch (error) {
    console.warn("Failed to get alert history settings, using defaults:", error);
    return DEFAULT_SETTINGS;
  }
}

export async function updateAlertHistorySettings(settings: Partial<AlertHistorySettings>): Promise<void> {
  const db = await openDB();
  const currentSettings = await getAlertHistorySettings();
  const updatedSettings = { ...currentSettings, ...settings };
  
  const tx = db.transaction(SETTINGS_STORE, "readwrite");
  const store = tx.objectStore(SETTINGS_STORE);
  store.put(updatedSettings);
  
  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
  });
}

// Enhanced alert storage with deduplication
export async function addAlertsToHistory(alerts: Alert[]): Promise<void> {
  if (!alerts || alerts.length === 0) return;
  
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);
  
  for (const alert of alerts) {
    const enhancedAlert = {
      ...alert,
      storedAt: new Date().toISOString(),
    };
    store.put(enhancedAlert);
  }
  
  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = async () => {
      db.close();
      // Trigger cleanup if auto-cleanup is enabled
      const settings = await getAlertHistorySettings();
      if (settings.autoCleanup) {
        await performCleanup();
      }
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
  });
}

// Enhanced querying with filters
export interface AlertHistoryFilter {
  severity?: string[];
  deviceId?: number[];
  siteId?: number[];
  acknowledged?: boolean;
  isResolved?: boolean;
  type?: string[];
  startDate?: string;
  endDate?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export async function getAlertHistory(filter?: AlertHistoryFilter): Promise<Alert[]> {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, "readonly");
  const store = tx.objectStore(STORE_NAME);
  
  let request: IDBRequest<Alert[]>;
  
  // Use indexes for better performance when possible
  if (filter?.severity && filter.severity.length === 1) {
    const index = store.index("severity");
    request = index.getAll(filter.severity[0]);
  } else if (filter?.deviceId && filter.deviceId.length === 1) {
    const index = store.index("deviceId");
    request = index.getAll(filter.deviceId[0]);
  } else if (filter?.siteId && filter.siteId.length === 1) {
    const index = store.index("siteId");
    request = index.getAll(filter.siteId[0]);
  } else {
    request = store.getAll();
  }
  
  return new Promise((resolve, reject) => {
    request.onsuccess = () => {
      db.close();
      let results = request.result;
      
      // Apply additional filters
      if (filter) {
        results = results.filter(alert => {
          // Severity filter
          if (filter.severity && filter.severity.length > 0 && !filter.severity.includes(alert.severity)) {
            return false;
          }
          
          // Device filter
          if (filter.deviceId && filter.deviceId.length > 0 && !filter.deviceId.includes(alert.deviceId || 0)) {
            return false;
          }
          
          // Site filter
          if (filter.siteId && filter.siteId.length > 0 && !filter.siteId.includes(alert.siteId || 0)) {
            return false;
          }
          
          // Acknowledged filter
          if (filter.acknowledged !== undefined && !!alert.acknowledged !== filter.acknowledged) {
            return false;
          }
          
          // Resolved filter
          if (filter.isResolved !== undefined && !!alert.isResolved !== filter.isResolved) {
            return false;
          }
          
          // Type filter
          if (filter.type && filter.type.length > 0 && !filter.type.includes(alert.type)) {
            return false;
          }
          
          // Date range filter
          if (filter.startDate && new Date(alert.createdAt) < new Date(filter.startDate)) {
            return false;
          }
          if (filter.endDate && new Date(alert.createdAt) > new Date(filter.endDate)) {
            return false;
          }
          
          // Search filter
          if (filter.search) {
            const searchTerm = filter.search.toLowerCase();
            const searchableText = [
              alert.message,
              alert.type,
              alert.severity
            ].filter(Boolean).join(" ").toLowerCase();
            
            if (!searchableText.includes(searchTerm)) {
              return false;
            }
          }
          
          return true;
        });
        
        // Sort by creation date (newest first)
        results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        // Apply pagination
        if (filter.offset || filter.limit) {
          const start = filter.offset || 0;
          const end = filter.limit ? start + filter.limit : undefined;
          results = results.slice(start, end);
        }
      }
      
      resolve(results);
    };
    request.onerror = () => {
      db.close();
      reject(request.error);
    };
  });
}

// Get alert statistics
export async function getAlertHistoryStats(): Promise<{
  total: number;
  bySeverity: Record<string, number>;
  byStatus: { acknowledged: number; unacknowledged: number; resolved: number };
  storageSize: number;
  oldestAlert?: string;
  newestAlert?: string;
}> {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, "readonly");
  const store = tx.objectStore(STORE_NAME);
  const request = store.getAll();
  
  return new Promise((resolve, reject) => {
    request.onsuccess = () => {
      db.close();
      const alerts = request.result;
      
      const bySeverity = alerts.reduce((acc, alert) => {
        acc[alert.severity] = (acc[alert.severity] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const acknowledged = alerts.filter(a => a.acknowledged).length;
      const resolved = alerts.filter(a => a.isResolved).length;
      const unacknowledged = alerts.length - acknowledged - resolved;
      
      const dates = alerts.map(a => new Date(a.createdAt).getTime()).sort((a, b) => a - b);
      
      // Estimate storage size (rough calculation)
      const storageSize = JSON.stringify(alerts).length;
      
      resolve({
        total: alerts.length,
        bySeverity,
        byStatus: { acknowledged, unacknowledged, resolved },
        storageSize,
        oldestAlert: dates.length > 0 ? new Date(dates[0]).toISOString() : undefined,
        newestAlert: dates.length > 0 ? new Date(dates[dates.length - 1]).toISOString() : undefined,
      });
    };
    request.onerror = () => {
      db.close();
      reject(request.error);
    };
  });
}

// Bulk operations
export async function bulkUpdateAlerts(alertIds: number[], updates: Partial<Alert>): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);
  
  for (const id of alertIds) {
    const getRequest = store.get(id);
    getRequest.onsuccess = () => {
      const alert = getRequest.result;
      if (alert) {
        const updatedAlert = { ...alert, ...updates };
        store.put(updatedAlert);
      }
    };
  }
  
  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
  });
}

export async function bulkDeleteAlerts(alertIds: number[]): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);
  
  for (const id of alertIds) {
    store.delete(id);
  }
  
  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
  });
}

// Cleanup old alerts based on settings
export async function performCleanup(): Promise<{ deletedCount: number; freedSpace: number }> {
  const settings = await getAlertHistorySettings();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - settings.retentionDays);
  
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);
  const index = store.index("createdAt");
  
  // Get all alerts older than retention period
  const range = IDBKeyRange.upperBound(cutoffDate.toISOString());
  const request = index.openCursor(range);
  
  let deletedCount = 0;
  let freedSpace = 0;
  
  return new Promise((resolve, reject) => {
    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result as IDBCursorWithValue;
      if (cursor) {
        const alert = cursor.value;
        freedSpace += JSON.stringify(alert).length;
        cursor.delete();
        deletedCount++;
        cursor.continue();
      } else {
        // Update last cleanup time
        updateAlertHistorySettings({ lastCleanup: new Date().toISOString() });
        db.close();
        resolve({ deletedCount, freedSpace });
      }
    };
    request.onerror = () => {
      db.close();
      reject(request.error);
    };
  });
}

// Clear all alert history
export async function clearAlertHistory(): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  tx.objectStore(STORE_NAME).clear();
  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
  });
}

// Export alerts to various formats
export async function exportAlertHistory(
  filter?: AlertHistoryFilter,
  format: "json" | "csv" = "json"
): Promise<Blob> {
  const alerts = await getAlertHistory(filter);
  
  if (format === "csv") {
    const headers = [
      "ID", "Type", "Message", "Severity", "Device ID", "Site ID", 
      "Created At", "Acknowledged", "Resolved", "Metric ID"
    ];
    
    const csvContent = [
      headers.join(","),
      ...alerts.map(alert => [
        alert.id,
        `"${alert.type}"`,
        `"${alert.message.replace(/"/g, '""')}"`,
        alert.severity,
        alert.deviceId || "",
        alert.siteId || "",
        alert.createdAt,
        alert.acknowledged ? "Yes" : "No",
        alert.isResolved ? "Yes" : "No",
        alert.metricId || ""
      ].join(","))
    ].join("\n");
    
    return new Blob([csvContent], { type: "text/csv" });
  } else {
    const exportData = {
      exportDate: new Date().toISOString(),
      totalAlerts: alerts.length,
      filters: filter,
      alerts
    };
    
    return new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
  }
}
