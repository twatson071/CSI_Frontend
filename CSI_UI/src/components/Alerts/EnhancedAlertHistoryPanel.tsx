import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  RuxContainer,
  RuxButton,
  RuxInput,
  RuxIcon,
  RuxPopUp,
  RuxMenu,
  RuxMenuItem,
  RuxMenuItemDivider,
  RuxDialog,
  RuxProgress,
  RuxStatus,
} from "@astrouxds/react";
import { usePermissions } from "../../hooks/usePermissions";
import EnhancedAlertsList from "./EnhancedAlertsList";
import { 
  getAlertHistory, 
  getAlertHistoryStats,
  bulkUpdateAlerts,
  bulkDeleteAlerts,
  clearAlertHistory,
  exportAlertHistory,
  performCleanup,
  getAlertHistorySettings,
  type AlertHistoryFilter,
  type AlertHistorySettings,
} from "../../utils/alertHistoryDB";
import { getDevices, type Device } from "../../services/DeviceService";
import { fetchSiteSummaries, type SiteSummary } from "../../services/SiteService";
import type { Alert } from "../../services/AlertService";
import "./EnhancedAlertHistoryPanel.css";

interface EnhancedAlertHistoryPanelProps {
  onBulkAcknowledge?: (ids: number[]) => void;
}

const EnhancedAlertHistoryPanel: React.FC<EnhancedAlertHistoryPanelProps> = ({
  onBulkAcknowledge,
}) => {
  const permissions = usePermissions();
  
  // State
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [sites, setSites] = useState<SiteSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{
    total: number;
    storageSize: number;
    oldestAlert?: string;
    bySeverity: Record<string, number>;
  } | null>(null);
  const [selectedAlerts, setSelectedAlerts] = useState<Set<number>>(new Set());
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [severityFilter, setSeverityFilter] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [dateRange, setDateRange] = useState<{ start?: string; end?: string }>({});
  
  // UI states
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  const [showCleanupDialog, setShowCleanupDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [bulkAction, setBulkAction] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(50);
  
  // Settings
  const [settings, setSettings] = useState<AlertHistorySettings | null>(null);
  const [cleanupProgress, setCleanupProgress] = useState<{
    inProgress: boolean;
    deleted: number;
    freedSpace: number;
  }>({ inProgress: false, deleted: 0, freedSpace: 0 });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [alertsData, devicesData, sitesData, statsData] = await Promise.all([
        getAlertHistory({ limit: pageSize, offset: currentPage * pageSize }),
        getDevices().catch(() => []),
        fetchSiteSummaries().catch(() => []),
        getAlertHistoryStats(),
      ]);
      
      setAlerts(alertsData);
      setDevices(devicesData);
      setSites(sitesData);
      setStats(statsData);
    } catch (error) {
      console.error("Failed to load alert history:", error);
    } finally {
      setLoading(false);
    }
  }, [pageSize, currentPage]);

  const applyFilters = useCallback(async () => {
    try {
      setLoading(true);
      const appliedFilter: AlertHistoryFilter = {
        search: searchTerm || undefined,
        severity: severityFilter.length > 0 ? severityFilter : undefined,
        acknowledged: statusFilter === "ACKNOWLEDGED" ? true : statusFilter === "UNACKNOWLEDGED" ? false : undefined,
        isResolved: statusFilter === "RESOLVED" ? true : statusFilter === "UNRESOLVED" ? false : undefined,
        startDate: dateRange.start,
        endDate: dateRange.end,
        limit: pageSize,
        offset: currentPage * pageSize,
      };
      
      const filteredAlerts = await getAlertHistory(appliedFilter);
      setAlerts(filteredAlerts);
    } catch (error) {
      console.error("Failed to apply filters:", error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, severityFilter, statusFilter, dateRange, pageSize, currentPage]);

  const loadSettings = async () => {
    try {
      const settingsData = await getAlertHistorySettings();
      setSettings(settingsData);
    } catch (error) {
      console.error("Failed to load settings:", error);
    }
  };

  useEffect(() => {
    loadData();
    loadSettings();
  }, [loadData]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const deviceMap = useMemo(() => {
    return devices.reduce<Record<number, { name: string; type: string }>>(
      (acc, d) => {
        acc[d.id] = { name: d.name, type: d.type };
        return acc;
      },
      {}
    );
  }, [devices]);

  const siteMap = useMemo(() => {
    return sites.reduce<Record<number, { name: string }>>((acc, s) => {
      acc[s.siteId] = { name: s.siteName };
      return acc;
    }, {});
  }, [sites]);

  const handleSelectAlert = (alertId: number) => {
    setSelectedAlerts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(alertId)) {
        newSet.delete(alertId);
      } else {
        newSet.add(alertId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    setSelectedAlerts(new Set(alerts.map(a => a.id)));
  };

  const handleClearSelection = () => {
    setSelectedAlerts(new Set());
  };

  const handleBulkOperation = async (action: string) => {
    const selectedIds = Array.from(selectedAlerts);
    
    try {
      switch (action) {
        case "acknowledge":
          await bulkUpdateAlerts(selectedIds, { 
            acknowledged: 1,
            acknowledgedAt: new Date().toISOString()
          });
          if (onBulkAcknowledge) {
            onBulkAcknowledge(selectedIds);
          }
          break;
        case "resolve":
          await bulkUpdateAlerts(selectedIds, { 
            isResolved: true,
            resolvedAt: new Date().toISOString()
          });
          break;
        case "delete":
          await bulkDeleteAlerts(selectedIds);
          break;
        case "export-json":
          await handleExport("json");
          break;
        case "export-csv":
          await handleExport("csv");
          break;
      }
      
      if (action !== "export-json" && action !== "export-csv") {
        setSelectedAlerts(new Set());
        await loadData(); // Refresh data
      }
    } catch (error) {
      console.error(`Failed to perform bulk ${action}:`, error);
    } finally {
      setShowBulkDialog(false);
    }
  };

  const handleExport = async (format: "json" | "csv") => {
    try {
      const currentFilter: AlertHistoryFilter = {
        severity: severityFilter.length > 0 ? severityFilter : undefined,
        search: searchTerm || undefined,
        acknowledged: statusFilter === "ACKNOWLEDGED" ? true : statusFilter === "UNACKNOWLEDGED" ? false : undefined,
        isResolved: statusFilter === "RESOLVED" ? true : statusFilter === "UNRESOLVED" ? false : undefined,
        startDate: dateRange.start,
        endDate: dateRange.end,
      };
      
      const blob = await exportAlertHistory(currentFilter, format);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `alert_history_${new Date().toISOString().split('T')[0]}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(`Failed to export as ${format}:`, error);
    }
  };

  const handleCleanup = async () => {
    try {
      setCleanupProgress({ inProgress: true, deleted: 0, freedSpace: 0 });
      const result = await performCleanup();
      setCleanupProgress({ 
        inProgress: false, 
        deleted: result.deletedCount,
        freedSpace: result.freedSpace 
      });
      await loadData(); // Refresh data
      await loadSettings(); // Refresh settings
    } catch (error) {
      console.error("Failed to perform cleanup:", error);
      setCleanupProgress({ inProgress: false, deleted: 0, freedSpace: 0 });
    } finally {
      setShowCleanupDialog(false);
    }
  };

  const handleClearAll = async () => {
    try {
      await clearAlertHistory();
      await loadData();
    } catch (error) {
      console.error("Failed to clear all alerts:", error);
    }
  };

  const toggleSeverityFilter = (severity: string) => {
    setSeverityFilter(prev => 
      prev.includes(severity) 
        ? prev.filter(s => s !== severity)
        : [...prev, severity]
    );
  };

  const formatStorageSize = (bytes: number): string => {
    const mb = bytes / (1024 * 1024);
    return mb < 1 ? `${(mb * 1024).toFixed(1)} KB` : `${mb.toFixed(1)} MB`;
  };

  if (loading && alerts.length === 0) {
    return (
      <div className="loading-state">
        <RuxIcon icon="refresh" className="spinning" />
        <span>Loading alert history...</span>
      </div>
    );
  }

  return (
    <RuxContainer className="enhanced-alert-history-panel">
      <div slot="header">
        <div className="history-header">
          <div className="history-info">
            <h2>Alert History</h2>
            {stats && (
              <div className="history-stats">
                <div className="stat-item">
                  <span className="stat-number">{stats!.total}</span>
                  <span className="stat-label">Total Alerts</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{formatStorageSize(stats!.storageSize)}</span>
                  <span className="stat-label">Storage Used</span>
                </div>
                {stats!.oldestAlert && (
                  <div className="stat-item">
                    <span className="stat-number">
                      {Math.floor((new Date().getTime() - new Date(stats!.oldestAlert).getTime()) / (1000 * 60 * 60 * 24))}d
                    </span>
                    <span className="stat-label">Oldest Record</span>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="history-actions">
            {selectedAlerts.size > 0 && (
              <div className="bulk-actions-info">
                <RuxStatus status="normal">{selectedAlerts.size}</RuxStatus>
                <span>selected</span>
              </div>
            )}
            
            <RuxPopUp closeOnSelect>
              <RuxButton slot="trigger" secondary>
                <RuxIcon icon="more-vert" slot="start" />
                Actions
              </RuxButton>
              <RuxMenu>
                {selectedAlerts.size > 0 && (
                  <>
                    {permissions.can.acknowledgeAlerts() && (
                      <RuxMenuItem onClick={() => {
                        setBulkAction("acknowledge");
                        setShowBulkDialog(true);
                      }}>
                        <RuxIcon icon="check" slot="start" />
                        Acknowledge Selected
                      </RuxMenuItem>
                    )}
                    {permissions.can.editAlerts() && (
                      <RuxMenuItem onClick={() => {
                        setBulkAction("resolve");
                        setShowBulkDialog(true);
                      }}>
                        <RuxIcon icon="task-alt" slot="start" />
                        Resolve Selected
                      </RuxMenuItem>
                    )}
                    {permissions.can.deleteAlerts() && (
                      <RuxMenuItem onClick={() => {
                        setBulkAction("delete");
                        setShowBulkDialog(true);
                      }} className="danger-item">
                        <RuxIcon icon="delete" slot="start" />
                        Delete Selected
                      </RuxMenuItem>
                    )}
                    <RuxMenuItemDivider />
                  </>
                )}
                
                {permissions.can.exportAlerts() && (
                  <>
                    <RuxMenuItem onClick={() => handleExport("json")}>
                      <RuxIcon icon="download" slot="start" />
                      Export as JSON
                    </RuxMenuItem>
                    <RuxMenuItem onClick={() => handleExport("csv")}>
                      <RuxIcon icon="download" slot="start" />
                      Export as CSV
                    </RuxMenuItem>
                    <RuxMenuItemDivider />
                  </>
                )}
                
                {permissions.can.manageAlerts() && (
                  <>
                    <RuxMenuItem onClick={() => setShowCleanupDialog(true)}>
                      <RuxIcon icon="cleaning-services" slot="start" />
                      Cleanup Old Alerts
                    </RuxMenuItem>
                    <RuxMenuItem onClick={() => setShowSettingsDialog(true)}>
                      <RuxIcon icon="settings" slot="start" />
                      History Settings
                    </RuxMenuItem>
                    <RuxMenuItem onClick={handleClearAll} className="danger-item">
                      <RuxIcon icon="delete-sweep" slot="start" />
                      Clear All History
                    </RuxMenuItem>
                  </>
                )}
              </RuxMenu>
            </RuxPopUp>
          </div>
        </div>

        {stats && (
          <div className="severity-summary">
            <div className="severity-counts">
              {Object.entries(stats!.bySeverity).map(([severity, count]) => (
                <div
                  key={severity}
                  className={`severity-chip severity-${severity.toLowerCase()} ${
                    severityFilter.includes(severity) ? "active" : ""
                  }`}
                  onClick={() => toggleSeverityFilter(severity)}
                >
                  <span className="severity-label">{severity}</span>
                  <span className="severity-count">{count as number}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="history-content">
        <div className="history-filters">
          <div className="filter-row">
            <RuxInput
              type="search"
              placeholder="Search alert history..."
              value={searchTerm}
              onRuxinput={(e: CustomEvent<{value: string}>) => setSearchTerm(e.detail.value)}
              className="search-input"
            >
              <RuxIcon icon="search" slot="prefix" />
            </RuxInput>

            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="status-filter"
            >
              <option value="ALL">All Status</option>
              <option value="UNACKNOWLEDGED">Unacknowledged</option>
              <option value="ACKNOWLEDGED">Acknowledged</option>
              <option value="RESOLVED">Resolved</option>
              <option value="UNRESOLVED">Unresolved</option>
            </select>

            <RuxInput
              type="date"
              label="From"
              value={dateRange.start || ""}
              onRuxinput={(e: CustomEvent<{value: string}>) => setDateRange(prev => ({ ...prev, start: e.detail.value }))}
            />

            <RuxInput
              type="date"
              label="To"
              value={dateRange.end || ""}
              onRuxinput={(e: CustomEvent<{value: string}>) => setDateRange(prev => ({ ...prev, end: e.detail.value }))}
            />

            {(searchTerm || severityFilter.length > 0 || statusFilter !== "ALL" || dateRange.start || dateRange.end) && (
              <RuxButton 
                size="small" 
                secondary
                onClick={() => {
                  setSearchTerm("");
                  setSeverityFilter([]);
                  setStatusFilter("ALL");
                  setDateRange({});
                }}
              >
                <RuxIcon icon="clear" slot="start" />
                Clear
              </RuxButton>
            )}
          </div>
        </div>

        <div className="history-list-container">
          {alerts.length === 0 ? (
            <div className="empty-state">
              <RuxIcon icon="history" size="large" />
              <h3>No Alert History</h3>
              <p>No alerts found matching your criteria.</p>
            </div>
          ) : (
            <EnhancedAlertsList
              alerts={alerts}
              deviceMap={deviceMap}
              siteMap={siteMap}
              selectedAlerts={selectedAlerts}
              viewMode="list"
              sortField="timestamp"
              sortDirection="desc"
              onToggleSelect={handleSelectAlert}
              onSelectAll={handleSelectAll}
              onClearSelection={handleClearSelection}
              onSort={() => {}} // History is always sorted by time
              enableBulkOperations={permissions.can.bulkManageAlerts()}
            />
          )}
        </div>

        {alerts.length > 0 && (
          <div className="history-pagination">
            <div className="pagination-info">
              Showing {currentPage * pageSize + 1}-{Math.min((currentPage + 1) * pageSize, stats?.total || 0)} of {stats?.total || 0}
            </div>
            <div className="pagination-controls">
              <RuxButton 
                size="small" 
                secondary
                disabled={currentPage === 0}
                onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
              >
                Previous
              </RuxButton>
              <span className="page-indicator">Page {currentPage + 1}</span>
              <RuxButton 
                size="small" 
                secondary
                disabled={alerts.length < pageSize}
                onClick={() => setCurrentPage(prev => prev + 1)}
              >
                Next
              </RuxButton>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Action Dialog */}
      <RuxDialog
        open={showBulkDialog}
        onRuxdialogclosed={(e: CustomEvent) => {
          if (e.detail === 'confirm') {
            handleBulkOperation(bulkAction);
          }
          setShowBulkDialog(false);
        }}
        confirmText="Confirm"
        denyText="Cancel"
      >
        <div slot="header">Bulk {bulkAction}</div>
        <p>
          Are you sure you want to {bulkAction} {selectedAlerts.size} selected alert{selectedAlerts.size > 1 ? "s" : ""}?
          {bulkAction === "delete" && " This action cannot be undone."}
        </p>
      </RuxDialog>

      {/* Cleanup Dialog */}
      <RuxDialog
        open={showCleanupDialog}
        onRuxdialogclosed={(e: CustomEvent) => {
          if (e.detail === 'confirm') {
            handleCleanup();
          }
          setShowCleanupDialog(false);
        }}
        confirmText="Start Cleanup"
        denyText="Cancel"
      >
        <div slot="header">Cleanup Old Alerts</div>
        <div className="cleanup-dialog-content">
          {cleanupProgress.inProgress ? (
            <div className="cleanup-progress">
              <RuxProgress />
              <p>Cleaning up old alerts...</p>
            </div>
          ) : cleanupProgress.deleted > 0 ? (
            <div className="cleanup-results">
              <p>Cleanup completed successfully!</p>
              <p>Deleted {cleanupProgress.deleted} old alerts</p>
              <p>Freed {formatStorageSize(cleanupProgress.freedSpace)} of storage</p>
            </div>
          ) : (
            <div>
              <p>This will remove alerts older than {settings?.retentionDays || 90} days.</p>
              <p>This action cannot be undone.</p>
            </div>
          )}
        </div>
      </RuxDialog>

      {/* Settings Dialog - TODO: Implement settings functionality */}
      <RuxDialog
        open={showSettingsDialog}
        onRuxdialogclosed={() => setShowSettingsDialog(false)}
        confirmText="Close"
        denyText=""
      >
        <div slot="header">History Settings</div>
        <div className="settings-dialog-content">
          {settings && (
            <>
              <p><strong>Retention Days:</strong> {settings.retentionDays}</p>
              <p><strong>Max Storage Size:</strong> {settings.maxStorageSize} MB</p>
              <p><strong>Auto Cleanup:</strong> {settings.autoCleanup ? 'Enabled' : 'Disabled'}</p>
              {settings.lastCleanup && (
                <p><strong>Last Cleanup:</strong> {new Date(settings.lastCleanup).toLocaleDateString()}</p>
              )}
            </>
          )}
        </div>
      </RuxDialog>
    </RuxContainer>
  );
};

export default EnhancedAlertHistoryPanel;