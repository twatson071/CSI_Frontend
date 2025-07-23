import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  RuxTable,
  RuxTableBody,
  RuxTableHeaderRow,
  RuxTableHeaderCell,
  RuxTableRow,
  RuxTableCell,
  RuxCheckbox,
  RuxButton,
  RuxIcon,
  RuxPopUp,
  RuxMenu,
  RuxMenuItem,
  RuxCard,
  RuxStatus,
} from "@astrouxds/react";
import { usePermissions } from "../../hooks/usePermissions";
import type { Alert } from "../../services/AlertService";
import "./EnhancedAlertsList.css";

type SortField = "severity" | "timestamp" | "site" | "device";
type SortDirection = "asc" | "desc";
type ViewMode = "list" | "grid" | "timeline";

interface EnhancedAlertsListProps {
  alerts: Alert[];
  deviceMap: Record<number, { name: string; type: string }>;
  siteMap: Record<number, { name: string }>;
  selectedAlerts: Set<number>;
  viewMode: ViewMode;
  sortField: SortField;
  sortDirection: SortDirection;
  onAcknowledge?: (id: number) => void;
  onResolve?: (id: number, reason?: string) => void;
  onDelete?: (id: number) => void;
  onToggleSelect: (alertId: number) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onSort: (field: SortField) => void;
  enableBulkOperations?: boolean;
}

const getSeverityIcon = (severity: string) => {
  switch (severity) {
    case "CRITICAL": return "error";
    case "SERIOUS": return "warning";
    case "CAUTION": return "info";
    case "INFO": return "info-outline";
    default: return "help";
  }
};

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case "CRITICAL": return "var(--color-status-critical)";
    case "SERIOUS": return "var(--color-status-serious)";
    case "CAUTION": return "var(--color-status-caution)";
    case "INFO": return "var(--color-palette-brightblue-400)";
    default: return "var(--color-text-secondary)";
  }
};

const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

const AlertListView: React.FC<EnhancedAlertsListProps> = React.memo(({
  alerts,
  deviceMap,
  siteMap,
  selectedAlerts,
  sortField,
  sortDirection,
  onAcknowledge,
  onResolve,
  onDelete,
  onToggleSelect,
  onSelectAll,
  onClearSelection,
  onSort,
  enableBulkOperations,
}) => {
  const permissions = usePermissions();
  const [visibleAlerts, setVisibleAlerts] = useState<Alert[]>([]);
  const [loadedCount, setLoadedCount] = useState(20); // Initial load of 20 items
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  
  // Update visible alerts when alerts or loadedCount changes
  useEffect(() => {
    setVisibleAlerts(alerts.slice(0, loadedCount));
  }, [alerts, loadedCount]);
  
  // Reset loaded count when alerts change
  useEffect(() => {
    setLoadedCount(20);
  }, [alerts]);
  
  // Intersection observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && loadedCount < alerts.length) {
          // Load 20 more items
          setLoadedCount(prev => Math.min(prev + 20, alerts.length));
        }
      },
      { threshold: 0.1 }
    );
    
    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }
    
    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current);
      }
    };
  }, [loadedCount, alerts.length]);

  const renderSortHeader = (field: SortField, label: string, className?: string) => (
    <RuxTableHeaderCell className={className || ""}>
      <div 
        className={`sortable ${sortField === field ? "sorted" : ""}`}
        onClick={() => onSort(field)}
      >
        <span>{label}</span>
        {sortField === field && (
          <RuxIcon 
            icon={sortDirection === "asc" ? "arrow-upward" : "arrow-downward"} 
            size="extra-small" 
          />
        )}
      </div>
    </RuxTableHeaderCell>
  );

  return (
    <div className="alerts-list-view">
      {enableBulkOperations && (
        <div className="bulk-controls">
          <RuxCheckbox
            checked={selectedAlerts.size === alerts.length && alerts.length > 0}
            indeterminate={selectedAlerts.size > 0 && selectedAlerts.size < alerts.length}
            onRuxchange={selectedAlerts.size === alerts.length ? onClearSelection : onSelectAll}
          >
            Select All ({alerts.length})
          </RuxCheckbox>
          {selectedAlerts.size > 0 && (
            <span className="selection-count">
              {selectedAlerts.size} selected
            </span>
          )}
        </div>
      )}

      <div className="table-scroll-container" ref={scrollContainerRef}>
        <RuxTable className="enhanced-alerts-table">
          <RuxTableHeaderRow>
              {enableBulkOperations && (
                <RuxTableHeaderCell className="checkbox-column">
                  <RuxCheckbox
                    checked={selectedAlerts.size === alerts.length && alerts.length > 0}
                    indeterminate={selectedAlerts.size > 0 && selectedAlerts.size < alerts.length}
                    onRuxchange={selectedAlerts.size === alerts.length ? onClearSelection : onSelectAll}
                  />
                </RuxTableHeaderCell>
              )}
              {renderSortHeader("severity", "Severity", "severity-column")}
              <RuxTableHeaderCell className="alert-column">Alert</RuxTableHeaderCell>
              {renderSortHeader("device", "Device", "device-column")}
              {renderSortHeader("site", "Site", "site-column")}
              {renderSortHeader("timestamp", "Time", "time-column")}
              <RuxTableHeaderCell className="actions-column">Actions</RuxTableHeaderCell>
          </RuxTableHeaderRow>
          <RuxTableBody>
            {visibleAlerts.map((alert) => {
            const device = alert.deviceId ? deviceMap[alert.deviceId] : undefined;
            const site = alert.siteId ? siteMap[alert.siteId] : undefined;
            const isSelected = selectedAlerts.has(alert.id);
            
            return (
              <RuxTableRow 
                key={alert.id} 
                className={`alert-row ${isSelected ? "selected" : ""} severity-${alert.severity.toLowerCase()}`}
              >
                {enableBulkOperations && (
                  <RuxTableCell className="checkbox-column">
                    <RuxCheckbox
                      checked={isSelected}
                      onRuxchange={() => onToggleSelect(alert.id)}
                    />
                  </RuxTableCell>
                )}
                
                <RuxTableCell className="severity-column">
                  <RuxStatus status={
                    alert.severity === "CRITICAL" ? "critical" :
                    alert.severity === "SERIOUS" ? "serious" :
                    alert.severity === "CAUTION" ? "caution" : "normal"
                  }>
                    {alert.severity}
                  </RuxStatus>
                </RuxTableCell>

                <RuxTableCell className="alert-column">
                  <div className="alert-content">
                    <div className="alert-header">
                      <span className="alert-type">{alert.type}</span>
                      <div className="alert-status-indicators">
                        {alert.acknowledged && (
                          <RuxStatus status="normal">
                            <RuxIcon icon="check" size="extra-small" />
                            ACK
                          </RuxStatus>
                        )}
                        {alert.isResolved && (
                          <RuxStatus status="normal">
                            <RuxIcon icon="task-alt" size="extra-small" />
                            RESOLVED
                          </RuxStatus>
                        )}
                      </div>
                    </div>
                    <span className="alert-message">{alert.message}</span>
                    {alert.metricId && (
                      <RuxStatus status="normal">Metric #{alert.metricId}</RuxStatus>
                    )}
                  </div>
                </RuxTableCell>

                <RuxTableCell className="device-column">
                  <div className="device-info">
                    {device ? (
                      <>
                        <span className="device-name">{device.name}</span>
                        <span className="device-type">{device.type}</span>
                      </>
                    ) : (
                      <span className="no-device">—</span>
                    )}
                  </div>
                </RuxTableCell>

                <RuxTableCell className="site-column">
                  {site ? site.name : "—"}
                </RuxTableCell>

                <RuxTableCell className="time-column">
                  <div className="time-info">
                    <span className="relative-time">{formatRelativeTime(alert.createdAt)}</span>
                    <span className="absolute-time">
                      {new Date(alert.createdAt).toLocaleString()}
                    </span>
                  </div>
                </RuxTableCell>

                <RuxTableCell className="actions-column">
                  <div className="alert-actions">
                    {!alert.acknowledged && permissions.can.acknowledgeAlerts() && (
                      <RuxButton 
                        size="small" 
                        onClick={() => onAcknowledge?.(alert.id)}
                        title="Acknowledge alert"
                      >
                        <RuxIcon icon="check" size="extra-small" />
                      </RuxButton>
                    )}
                    
                    <RuxPopUp closeOnSelect placement="bottom-end">
                      <RuxButton size="small" slot="trigger">
                        <RuxIcon icon="more-vert" size="extra-small" />
                      </RuxButton>
                      <RuxMenu>
                        <RuxMenuItem>
                          <RuxIcon icon="visibility" slot="start" />
                          View Details
                        </RuxMenuItem>
                        {!alert.acknowledged && permissions.can.acknowledgeAlerts() && (
                          <RuxMenuItem onClick={() => onAcknowledge?.(alert.id)}>
                            <RuxIcon icon="check" slot="start" />
                            Acknowledge
                          </RuxMenuItem>
                        )}
                        {!alert.isResolved && permissions.can.editAlerts() && (
                          <RuxMenuItem onClick={() => onResolve?.(alert.id)}>
                            <RuxIcon icon="task-alt" slot="start" />
                            Mark as Resolved
                          </RuxMenuItem>
                        )}
                        {permissions.can.deleteAlerts() && (
                          <RuxMenuItem 
                            onClick={() => onDelete?.(alert.id)}
                            className="danger-menu-item"
                          >
                            <RuxIcon icon="delete" slot="start" />
                            Delete Alert
                          </RuxMenuItem>
                        )}
                      </RuxMenu>
                    </RuxPopUp>
                  </div>
                </RuxTableCell>
              </RuxTableRow>
            );
          })}
          </RuxTableBody>
        </RuxTable>
        
        {/* Lazy loading indicator */}
        {loadedCount < alerts.length && (
          <div 
            ref={loadMoreRef} 
            className="lazy-load-trigger"
            style={{ 
              textAlign: 'center', 
              padding: '1rem',
              color: 'var(--color-text-secondary)'
            }}
          >
            Loading more alerts... ({loadedCount} of {alerts.length})
          </div>
        )}
        
        {visibleAlerts.length === 0 && (
          <div className="no-alerts-message" style={{ 
            textAlign: 'center', 
            padding: '2rem',
            color: 'var(--color-text-secondary)'
          }}>
            No alerts found
          </div>
        )}
      </div>
    </div>
  );
});

const AlertGridView: React.FC<EnhancedAlertsListProps> = ({
  alerts,
  deviceMap,
  siteMap,
  selectedAlerts,
  onAcknowledge,
  onResolve,
  onDelete,
  onToggleSelect,
  enableBulkOperations,
}) => {
  const permissions = usePermissions();

  return (
    <div className="alerts-grid-view">
      {alerts.map((alert) => {
        const device = alert.deviceId ? deviceMap[alert.deviceId] : undefined;
        const site = alert.siteId ? siteMap[alert.siteId] : undefined;
        const isSelected = selectedAlerts.has(alert.id);
        
        return (
          <RuxCard 
            key={alert.id} 
            className={`alert-card ${isSelected ? "selected" : ""} severity-${alert.severity.toLowerCase()}`}
          >
            <div className="alert-card-header">
              {enableBulkOperations && (
                <RuxCheckbox
                  checked={isSelected}
                  onRuxchange={() => onToggleSelect(alert.id)}
                />
              )}
              <div className="severity-badge">
                <RuxIcon 
                  icon={getSeverityIcon(alert.severity)}
                  style={{ color: getSeverityColor(alert.severity) }}
                />
                <span>{alert.severity}</span>
              </div>
              <div className="card-actions">
                {!alert.acknowledged && permissions.can.acknowledgeAlerts() && (
                  <RuxButton 
                    size="small" 
                    onClick={() => onAcknowledge?.(alert.id)}
                    title="Acknowledge alert"
                  >
                    <RuxIcon icon="check" size="extra-small" />
                  </RuxButton>
                )}
                <RuxPopUp closeOnSelect placement="bottom-end">
                  <RuxButton size="small" slot="trigger">
                    <RuxIcon icon="more-vert" size="extra-small" />
                  </RuxButton>
                  <RuxMenu>
                    <RuxMenuItem>View Details</RuxMenuItem>
                    {!alert.acknowledged && permissions.can.acknowledgeAlerts() && (
                      <RuxMenuItem onClick={() => onAcknowledge?.(alert.id)}>
                        Acknowledge
                      </RuxMenuItem>
                    )}
                    {!alert.isResolved && permissions.can.editAlerts() && (
                      <RuxMenuItem onClick={() => onResolve?.(alert.id)}>
                        Mark as Resolved
                      </RuxMenuItem>
                    )}
                    {permissions.can.deleteAlerts() && (
                      <RuxMenuItem 
                        onClick={() => onDelete?.(alert.id)}
                        className="danger-menu-item"
                      >
                        Delete Alert
                      </RuxMenuItem>
                    )}
                  </RuxMenu>
                </RuxPopUp>
              </div>
            </div>

            <div className="alert-card-body">
              <div className="alert-title">{alert.type}</div>
              <div className="alert-message">{alert.message}</div>
              
              <div className="alert-meta">
                {device && (
                  <div className="meta-item">
                    <RuxIcon icon="developer-board" size="extra-small" />
                    <span>{device.name} ({device.type})</span>
                  </div>
                )}
                {site && (
                  <div className="meta-item">
                    <RuxIcon icon="location-on" size="extra-small" />
                    <span>{site.name}</span>
                  </div>
                )}
                <div className="meta-item">
                  <RuxIcon icon="schedule" size="extra-small" />
                  <span>{formatRelativeTime(alert.createdAt)}</span>
                </div>
              </div>

              <div className="alert-status">
                {alert.acknowledged ? (
                  <RuxStatus status="normal">
                    Acknowledged
                  </RuxStatus>
                ) : (
                  <RuxStatus status="caution">
                    Active
                  </RuxStatus>
                )}
                {alert.isResolved && (
                  <RuxStatus status="normal">
                    Resolved
                  </RuxStatus>
                )}
              </div>
            </div>
          </RuxCard>
        );
      })}
    </div>
  );
};

const AlertTimelineView: React.FC<EnhancedAlertsListProps> = ({
  alerts,
  deviceMap,
  siteMap,
  selectedAlerts,
  onAcknowledge,
  onResolve,
  onDelete,
  onToggleSelect,
  enableBulkOperations,
}) => {
  const permissions = usePermissions();
  
  // Group alerts by date
  const alertsByDate = alerts.reduce((acc, alert) => {
    const date = new Date(alert.createdAt).toDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(alert);
    return acc;
  }, {} as Record<string, Alert[]>);

  return (
    <div className="alerts-timeline-view">
      {Object.entries(alertsByDate).map(([date, dayAlerts]) => (
        <div key={date} className="timeline-day">
          <div className="timeline-date-header">
            <h3>{date}</h3>
            <span className="day-count">{dayAlerts.length} alerts</span>
          </div>
          
          <div className="timeline-alerts">
            {dayAlerts.map((alert) => {
              const device = alert.deviceId ? deviceMap[alert.deviceId] : undefined;
              const site = alert.siteId ? siteMap[alert.siteId] : undefined;
              const isSelected = selectedAlerts.has(alert.id);
              
              return (
                <div 
                  key={alert.id} 
                  className={`timeline-alert ${isSelected ? "selected" : ""} severity-${alert.severity.toLowerCase()}`}
                >
                  <div className="timeline-marker">
                    <div className="timeline-time">
                      {new Date(alert.createdAt).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                    <div className="timeline-dot"></div>
                  </div>
                  
                  <div className="timeline-content">
                    <div className="timeline-header">
                      {enableBulkOperations && (
                        <RuxCheckbox
                          checked={isSelected}
                          onRuxchange={() => onToggleSelect(alert.id)}
                        />
                      )}
                      <div className="severity-indicator">
                        <RuxIcon 
                          icon={getSeverityIcon(alert.severity)}
                          style={{ color: getSeverityColor(alert.severity) }}
                        />
                        <span>{alert.severity}</span>
                      </div>
                      <span className="alert-type">{alert.type}</span>
                    </div>
                    
                    <div className="timeline-message">
                      {alert.message}
                    </div>
                    
                    <div className="timeline-meta">
                      {device && <span>Device: {device.name}</span>}
                      {site && <span>Site: {site.name}</span>}
                      {alert.acknowledged && <span>Acknowledged</span>}
                      {alert.isResolved && <span>Resolved</span>}
                    </div>
                    
                    <div className="timeline-actions">
                      {!alert.acknowledged && permissions.can.acknowledgeAlerts() && (
                        <RuxButton 
                          size="small" 
                          onClick={() => onAcknowledge?.(alert.id)}
                        >
                          Acknowledge
                        </RuxButton>
                      )}
                      {!alert.isResolved && permissions.can.editAlerts() && (
                        <RuxButton 
                          size="small" 
                          secondary
                          onClick={() => onResolve?.(alert.id)}
                        >
                          Resolve
                        </RuxButton>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

const EnhancedAlertsList: React.FC<EnhancedAlertsListProps> = (props) => {
  switch (props.viewMode) {
    case "grid":
      return <AlertGridView {...props} />;
    case "timeline":
      return <AlertTimelineView {...props} />;
    case "list":
    default:
      return <AlertListView {...props} />;
  }
};

export default EnhancedAlertsList;