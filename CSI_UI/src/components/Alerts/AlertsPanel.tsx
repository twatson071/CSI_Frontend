import {
  RuxContainer,
  RuxIcon,
} from "@astrouxds/react";
import { useState, useEffect, useMemo } from "react";
import AlertsList from "./AlertsList";
import type { Alert } from "../../services/AlertService";
import { getDevices, type Device } from "../../services/DeviceService";
import {
  fetchSiteSummaries,
  type SiteSummary,
} from "../../services/SiteService";
import "./AlertsPanel.css";

type SortField = "severity" | "time" | "site" | "device";
type SortDirection = "asc" | "desc";

interface AlertsPanelProps {
  alerts?: Alert[]; // Make alerts optional
  onAcknowledge?: (id: number) => void; // Add acknowledge callback
  isLoading?: boolean;
}

const AlertsPanel = ({
  alerts = [],
  onAcknowledge,
  isLoading = false,
}: AlertsPanelProps) => {
  const [severityFilter, setSeverityFilter] = useState<string>("ALL");
  const [deviceTypeFilter] = useState<string>("ALL");
  const [searchTerm] = useState("");
  const [devices, setDevices] = useState<Device[]>([]);
  const [sites, setSites] = useState<SiteSummary[]>([]);
  const [sortField] = useState<SortField>("time");
  const [sortDirection] = useState<SortDirection>("desc");
  const [showAcknowledged] = useState(false);

  useEffect(() => {
    getDevices()
      .then((d) => setDevices(d))
      .catch((err) => console.error("Failed to load devices", err));
    fetchSiteSummaries()
      .then(setSites)
      .catch((err) => console.error("Failed to load sites", err));
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

  const filteredAlerts = useMemo(() => {
    const filtered = alerts
      .filter((a) => severityFilter === "ALL" || a.severity === severityFilter)
      .filter((a) => {
        if (deviceTypeFilter === "ALL") return true;
        const device = a.deviceId ? deviceMap[a.deviceId] : undefined;
        return device?.type === deviceTypeFilter;
      })
      .filter((a) => {
        const device = a.deviceId ? deviceMap[a.deviceId] : undefined;
        const site = a.siteId ? siteMap[a.siteId] : undefined;
        const deviceName = device ? device.name : "";
        const siteName = site ? site.name : "";
        const searchTermLower = searchTerm.toLowerCase();
        return (
          (a.message && a.message.toLowerCase().includes(searchTermLower)) ||
          (deviceName && deviceName.toLowerCase().includes(searchTermLower)) ||
          (siteName && siteName.toLowerCase().includes(searchTermLower))
        );
      })
      .filter((a) => showAcknowledged || !a.acknowledged);

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
        case "time":
          aValue = a.createdAt;
          bValue = b.createdAt;
          break;
        case "site":
          aValue = a.siteId ? siteMap[a.siteId]?.name || "" : "";
          bValue = b.siteId ? siteMap[b.siteId]?.name || "" : "";
          break;
        case "device":
          aValue = a.deviceId ? deviceMap[a.deviceId]?.name || "" : "";
          bValue = b.deviceId ? deviceMap[b.deviceId]?.name || "" : "";
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
    searchTerm,
    deviceMap,
    siteMap,
    showAcknowledged,
    sortField,
    sortDirection,
  ]);


  // Get severity counts for better UX
  const severityCounts = useMemo(() => {
    const counts = { CRITICAL: 0, SERIOUS: 0, CAUTION: 0, INFO: 0 };
    filteredAlerts.forEach((alert) => {
      if (Object.prototype.hasOwnProperty.call(counts, alert.severity)) {
        counts[alert.severity as keyof typeof counts]++;
      }
    });
    return counts;
  }, [filteredAlerts]);

  const totalCounts = useMemo(() => {
    const counts = { CRITICAL: 0, SERIOUS: 0, CAUTION: 0, INFO: 0 };
    alerts.forEach((alert) => {
      if (Object.prototype.hasOwnProperty.call(counts, alert.severity)) {
        counts[alert.severity as keyof typeof counts]++;
      }
    });
    return counts;
  }, [alerts]);



  const hasActiveFilters =
    severityFilter !== "ALL" ||
    deviceTypeFilter !== "ALL" ||
    searchTerm !== "" ||
    showAcknowledged;

  const totalUnacknowledged = alerts.filter((a) => !a.acknowledged).length;

  return (
    <RuxContainer className="alerts-panel">
      <div slot="header">
        <div className="header-top">
          <div className="active-alerts">
            <div className="alert-count">
              <span className="count-number">{filteredAlerts.length}</span>
              <span className="count-label">
                {hasActiveFilters ? "Filtered" : "Active"} Alerts
                {hasActiveFilters && (
                  <span className="total-count"> of {alerts.length} total</span>
                )}
              </span>
            </div>
            {totalUnacknowledged > 0 && (
              <div
                className="unacknowledged-badge"
                role="status"
                aria-live="polite"
              >
                <RuxIcon icon="warning" size="small" />
                {totalUnacknowledged} unacknowledged
              </div>
            )}
          </div>
        </div>
        <div className="severity-summary">
          <div
            className="severity-counts"
            role="group"
            aria-label="Alert severity breakdown"
          >
            {Object.entries(severityCounts).map(([severity, count]) => {
              const totalCount =
                totalCounts[severity as keyof typeof totalCounts];
              const isFiltered = hasActiveFilters && count !== totalCount;
              return (
                <div
                  key={severity}
                  className={`severity-count severity-${severity.toLowerCase()} ${
                    severityFilter === severity ? "active" : ""
                  }`}
                  onClick={() =>
                    setSeverityFilter(
                      severityFilter === severity ? "ALL" : severity
                    )
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSeverityFilter(
                        severityFilter === severity ? "ALL" : severity
                      );
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={`Filter by ${severity} alerts (${count} alerts)`}
                  title={`Click to ${
                    severityFilter === severity ? "clear" : "filter by"
                  } ${severity} alerts`}
                >
                  <span className="severity-label">{severity}</span>
                  <span className="severity-number">
                    {count}
                    {isFiltered && (
                      <span className="total-indicator">/{totalCount}</span>
                    )}
                  </span>
                  {severityFilter === severity && (
                    <span className="active-badge">Active</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="alerts-list-wrapper">
        {isLoading ? (
          <div className="loading-state" role="status" aria-live="polite">
            <RuxIcon icon="autorenew" />
            <span>Loading alerts...</span>
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="empty-state" role="status">
            {hasActiveFilters ? (
              <>
                <RuxIcon icon="search-off" size="large" />
                <h3>No alerts match your filters</h3>
                <p>
                  Try adjusting your search criteria or clearing filters to see
                  more results.
                </p>
              </>
            ) : (
              <>
                <RuxIcon icon="check-circle" size="large" />
                <h3>All clear!</h3>
                <p>
                  No active alerts at this time. System is operating normally.
                </p>
              </>
            )}
          </div>
        ) : (
          <AlertsList
            alerts={filteredAlerts}
            onAcknowledge={onAcknowledge}
            deviceMap={deviceMap}
            siteMap={siteMap}
          />
        )}
      </div>
    </RuxContainer>
  );
};

export default AlertsPanel;
