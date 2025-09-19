import React, { useState, useEffect, useMemo } from "react";
import {
  RuxContainer,
  RuxButton,
  RuxInput,
  RuxIcon,
  RuxCard,
  RuxPopUp,
  RuxMenu,
  RuxMenuItem,
  RuxDialog,
  RuxStatus,
} from "@astrouxds/react";
import { usePermissions } from "../../hooks/usePermissions";
import EnhancedAlertsList from "./EnhancedAlertsList";
import type { Alert } from "../../services/AlertService";
import { getDevices, type Device } from "../../services/DeviceService";
import { fetchSiteSummaries, type SiteSummary } from "../../services/SiteService";
import "./EnhancedAlertsPanel.css";

type SortField = "severity" | "timestamp" | "site" | "device" | "status";
type SortDirection = "asc" | "desc";
type ViewMode = "list" | "grid" | "timeline";
type TimeFilter = "all" | "1h" | "4h" | "24h" | "7d" | "30d";

interface EnhancedAlertsPanelProps {
  alerts?: Alert[];
  onAcknowledge?: (id: number) => void;
  onBulkAcknowledge?: (ids: number[]) => void;
  onResolve?: (id: number, reason?: string) => void;
  onDelete?: (id: number) => void;
  isLoading?: boolean;
  enableBulkOperations?: boolean;
  enableExport?: boolean;
}

const EnhancedAlertsPanel: React.FC<EnhancedAlertsPanelProps> = ({
  alerts = [],
  onAcknowledge,
  onBulkAcknowledge,
  onResolve,
  onDelete,
  isLoading = false,
  enableBulkOperations = true,
  enableExport = true,
}) => {
  const permissions = usePermissions();
  
  // Filter states
  const [severityFilter, setSeverityFilter] = useState<string[]>([]);
  const [deviceTypeFilter, setDeviceTypeFilter] = useState<string>("ALL");
  const [siteFilter, setSiteFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  // View states
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [sortField, setSortField] = useState<SortField>("timestamp");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [selectedAlerts, setSelectedAlerts] = useState<Set<number>>(new Set());
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  const [bulkAction, setBulkAction] = useState<string>("");
  
  // Data states
  const [devices, setDevices] = useState<Device[]>([]);
  const [sites, setSites] = useState<SiteSummary[]>([]);
  
  useEffect(() => {
    Promise.all([
      getDevices().catch(() => []),
      fetchSiteSummaries().catch(() => [])
    ]).then(([devicesData, sitesData]) => {
      setDevices(devicesData);
      setSites(sitesData);
    });
  }, []);

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

  const getTimeFilterDate = (filter: TimeFilter): Date | null => {
    if (filter === "all") return null;
    const now = new Date();
    const hours = {
      "1h": 1,
      "4h": 4,
      "24h": 24,
      "7d": 168,
      "30d": 720
    }[filter];
    return new Date(now.getTime() - hours * 60 * 60 * 1000);
  };

  const filteredAlerts = useMemo(() => {
    const filtered = alerts.filter((alert) => {
      // Severity filter
      if (severityFilter.length > 0 && !severityFilter.includes(alert.severity)) {
        return false;
      }
      
      // Device type filter
      if (deviceTypeFilter !== "ALL") {
        const device = alert.deviceId ? deviceMap[alert.deviceId] : undefined;
        if (device?.type !== deviceTypeFilter) return false;
      }
      
      // Site filter
      if (siteFilter !== "ALL") {
        if (String(alert.siteId) !== siteFilter) return false;
      }
      
      // Status filter
      if (statusFilter !== "ALL") {
        const isAcknowledged = !!alert.acknowledged;
        const isResolved = !!alert.isResolved;
        
        if (statusFilter === "UNACKNOWLEDGED" && isAcknowledged) return false;
        if (statusFilter === "ACKNOWLEDGED" && !isAcknowledged) return false;
        if (statusFilter === "RESOLVED" && !isResolved) return false;
        if (statusFilter === "UNRESOLVED" && isResolved) return false;
      }
      
      // Time filter
      const timeFilterDate = getTimeFilterDate(timeFilter);
      if (timeFilterDate && new Date(alert.createdAt) < timeFilterDate) {
        return false;
      }
      
      // Search term
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const device = alert.deviceId ? deviceMap[alert.deviceId] : undefined;
        const site = alert.siteId ? siteMap[alert.siteId] : undefined;
        
        const searchableText = [
          alert.message,
          alert.severity,
          alert.type,
          device?.name,
          site?.name,
        ].filter(Boolean).join(" ").toLowerCase();
        
        if (!searchableText.includes(searchLower)) return false;
      }
      
      return true;
    });

    // Apply sorting
    return filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      const severityOrder = { CRITICAL: 4, SERIOUS: 3, CAUTION: 2, INFO: 1 };

      switch (sortField) {
        case "severity":
          aValue = severityOrder[a.severity as keyof typeof severityOrder];
          bValue = severityOrder[b.severity as keyof typeof severityOrder];
          break;
        case "timestamp":
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case "site":
          aValue = a.siteId ? siteMap[a.siteId]?.name || "" : "";
          bValue = b.siteId ? siteMap[b.siteId]?.name || "" : "";
          break;
        case "device":
          aValue = a.deviceId ? deviceMap[a.deviceId]?.name || "" : "";
          bValue = b.deviceId ? deviceMap[b.deviceId]?.name || "" : "";
          break;
        case "status":
          aValue = a.acknowledged ? 1 : 0;
          bValue = b.acknowledged ? 1 : 0;
          break;
        default:
          return 0;
      }

      if (sortDirection === "desc") {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      } else {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      }
    });
  }, [
    alerts,
    severityFilter,
    deviceTypeFilter,
    siteFilter,
    statusFilter,
    timeFilter,
    searchTerm,
    deviceMap,
    siteMap,
    sortField,
    sortDirection,
  ]);

  const severityCounts = useMemo(() => {
    const counts = { CRITICAL: 0, SERIOUS: 0, CAUTION: 0, INFO: 0 };
    alerts.forEach((alert) => {
      if (Object.prototype.hasOwnProperty.call(counts, alert.severity)) {
        counts[alert.severity as keyof typeof counts]++;
      }
    });
    return counts;
  }, [alerts]);

  const statusCounts = useMemo(() => {
    const acknowledged = alerts.filter(a => a.acknowledged).length;
    const resolved = alerts.filter(a => a.isResolved).length;
    const active = alerts.length - acknowledged - resolved;
    return { active, acknowledged, resolved, total: alerts.length };
  }, [alerts]);

  const toggleSeverityFilter = (severity: string) => {
    setSeverityFilter(prev => 
      prev.includes(severity) 
        ? prev.filter(s => s !== severity)
        : [...prev, severity]
    );
  };

  const toggleSelectAlert = (alertId: number) => {
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

  const selectAllVisible = () => {
    setSelectedAlerts(new Set(filteredAlerts.map(a => a.id)));
  };

  const clearSelection = () => {
    setSelectedAlerts(new Set());
  };

  const handleBulkOperation = async (action: string) => {
    const selectedIds = Array.from(selectedAlerts);
    
    switch (action) {
      case "acknowledge":
        if (onBulkAcknowledge) {
          await onBulkAcknowledge(selectedIds);
        }
        break;
      case "delete":
        if (onDelete) {
          await Promise.all(selectedIds.map(id => onDelete(id)));
        }
        break;
      case "export":
        handleExport();
        break;
    }
    
    setSelectedAlerts(new Set());
    setShowBulkDialog(false);
  };

  const handleExport = () => {
    const selectedAlertsData = filteredAlerts.filter(a => selectedAlerts.has(a.id));
    const exportData = {
      exportDate: new Date().toISOString(),
      totalAlerts: selectedAlertsData.length,
      filters: {
        severity: severityFilter,
        deviceType: deviceTypeFilter,
        site: siteFilter,
        status: statusFilter,
        timeRange: timeFilter,
        searchTerm
      },
      alerts: selectedAlertsData.map(alert => ({
        ...alert,
        deviceName: alert.deviceId ? deviceMap[alert.deviceId]?.name : null,
        siteName: alert.siteId ? siteMap[alert.siteId]?.name : null,
      }))
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `alerts_export_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearAllFilters = () => {
    setSeverityFilter([]);
    setDeviceTypeFilter("ALL");
    setSiteFilter("ALL");
    setStatusFilter("ALL");
    setTimeFilter("all");
    setSearchTerm("");
  };

  const hasActiveFilters = 
    severityFilter.length > 0 ||
    deviceTypeFilter !== "ALL" ||
    siteFilter !== "ALL" ||
    statusFilter !== "ALL" ||
    timeFilter !== "all" ||
    searchTerm !== "";

  const uniqueDeviceTypes = useMemo(() => {
    return Array.from(new Set(devices.map(d => d.type)));
  }, [devices]);

  return (
    <RuxContainer className="enhanced-alerts-panel">
      <div slot="header">
        <div className="alerts-header">
          <div className="alerts-summary">
            <span style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weights-medium)' }}>Alerts</span>
            <div className="summary-stats">
              <div className="stat-card total">
                <span className="stat-number">{filteredAlerts.length}</span>
                <span className="stat-label">Total</span>
              </div>
              {statusCounts.active > 0 && (
                <div className="stat-card active">
                  <span className="stat-number">{statusCounts.active}</span>
                  <span className="stat-label">Active</span>
                </div>
              )}
              {severityCounts.CRITICAL > 0 && (
                <div className="stat-card critical">
                  <span className="stat-number">{severityCounts.CRITICAL}</span>
                  <span className="stat-label">Critical</span>
                </div>
              )}
            </div>
          </div>

          <div className="alerts-actions">

            {selectedAlerts.size > 0 && (
              <RuxButton
                size="small"
                secondary
                onClick={clearSelection}
              >
                Clear {selectedAlerts.size} Selected
              </RuxButton>
            )}
            {hasActiveFilters && (
              <RuxButton
                size="small"
                secondary
                onClick={clearAllFilters}
              >
                Clear Filters
              </RuxButton>
            )}
          </div>
        </div>

      </div>

      <div className="alerts-content">
        <div className="alerts-filters" style={{ padding: 'var(--spacing-2)', borderBottom: '1px solid var(--color-border-interactive-muted)' }}>
          <div className="quick-filters" style={{ display: 'flex', gap: 'var(--spacing-2)', alignItems: 'center' }}>
            <RuxInput
              type="search"
              placeholder="Search alerts..."
              value={searchTerm}
              onRuxinput={(e: CustomEvent<{value: string}>) => setSearchTerm(e.detail.value)}
              style={{ flex: 1, maxWidth: '300px' }}
            />

            <select
              value={severityFilter.length === 1 ? severityFilter[0] : "ALL"}
              onChange={(e) => setSeverityFilter(e.target.value === "ALL" ? [] : [e.target.value])}
              style={{ padding: 'var(--spacing-1) var(--spacing-2)', background: 'var(--color-background-surface-default)', border: '1px solid var(--color-border-interactive-muted)', borderRadius: '4px', color: 'var(--color-text-primary)' }}
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="SERIOUS">Serious</option>
              <option value="CAUTION">Caution</option>
              <option value="INFO">Info</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ padding: 'var(--spacing-1) var(--spacing-2)', background: 'var(--color-background-surface-default)', border: '1px solid var(--color-border-interactive-muted)', borderRadius: '4px', color: 'var(--color-text-primary)' }}
            >
              <option value="ALL">All Status</option>
              <option value="UNACKNOWLEDGED">Unacknowledged</option>
              <option value="ACKNOWLEDGED">Acknowledged</option>
              <option value="RESOLVED">Resolved</option>
            </select>

            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value as TimeFilter)}
              style={{ padding: 'var(--spacing-1) var(--spacing-2)', background: 'var(--color-background-surface-default)', border: '1px solid var(--color-border-interactive-muted)', borderRadius: '4px', color: 'var(--color-text-primary)' }}
            >
              <option value="all">All Time</option>
              <option value="1h">Last Hour</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
            </select>
          </div>
        </div>

        <div className="alerts-list-container">
          {isLoading ? (
            <div className="loading-state">
              <RuxIcon icon="refresh" className="spinning" />
              <span>Loading alerts...</span>
            </div>
          ) : filteredAlerts.length === 0 ? (
            <div className="empty-state">
              {hasActiveFilters ? (
                <>
                  <RuxIcon icon="search-off" size="large" />
                  <h3>No alerts match your filters</h3>
                  <p>Try adjusting your search criteria or clearing filters.</p>
                  <RuxButton onClick={clearAllFilters}>Clear All Filters</RuxButton>
                </>
              ) : (
                <>
                  <RuxIcon icon="check-circle" size="large" />
                  <h3>All clear!</h3>
                  <p>No active alerts. System is operating normally.</p>
                </>
              )}
            </div>
          ) : (
            <EnhancedAlertsList
              alerts={filteredAlerts}
              deviceMap={deviceMap}
              siteMap={siteMap}
              selectedAlerts={selectedAlerts}
              viewMode={viewMode}
              sortField={sortField}
              sortDirection={sortDirection}
              onAcknowledge={onAcknowledge}
              onResolve={onResolve}
              onDelete={onDelete}
              onToggleSelect={toggleSelectAlert}
              onSelectAll={selectAllVisible}
              onClearSelection={clearSelection}
              onSort={(field) => {
                if (sortField === field) {
                  setSortDirection(prev => prev === "asc" ? "desc" : "asc");
                } else {
                  setSortField(field);
                  setSortDirection("desc");
                }
              }}
              enableBulkOperations={enableBulkOperations}
            />
          )}
        </div>
      </div>

      <RuxDialog
        open={showBulkDialog}
        onRuxdialogclosed={(e: CustomEvent) => {
          if (e.detail === 'confirm') {
            handleBulkOperation(bulkAction);
          }
          setShowBulkDialog(false);
        }}
        confirmText={bulkAction === "delete" ? "Delete" : "Confirm"}
        denyText="Cancel"
      >
        <div slot="header">Bulk {bulkAction}</div>
        <p>
          Are you sure you want to {bulkAction} {selectedAlerts.size} selected alert{selectedAlerts.size > 1 ? "s" : ""}?
          {bulkAction === "delete" && " This action cannot be undone."}
        </p>
      </RuxDialog>
    </RuxContainer>
  );
};

export default EnhancedAlertsPanel;