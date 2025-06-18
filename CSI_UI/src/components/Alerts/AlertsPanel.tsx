import {
  RuxContainer,
  RuxButton,
  RuxSelect,
  RuxOption,
} from "@astrouxds/react";
import { useState, useEffect } from "react";
import AlertsList from "./AlertsList";
import type { Alert } from "../../services/AlertService";
import { getDevices, type Device } from "../../services/DeviceService";
import "./Alerts.css";

interface AlertsPanelProps {
  alerts?: Alert[]; // Make alerts optional
  onAcknowledge?: (id: number) => void; // Add acknowledge callback
}

const AlertsPanel = ({ alerts = [], onAcknowledge }: AlertsPanelProps) => {
  const [alertCount, setAlertCount] = useState(0);
  const [severityFilter, setSeverityFilter] = useState<string>("ALL");
  const [deviceTypeFilter, setDeviceTypeFilter] = useState<string>("ALL");
  const [sortOrder, setSortOrder] = useState<
    "time-desc" | "time-asc" | "severity-desc" | "severity-asc"
  >("time-desc");
  const [devices, setDevices] = useState<Device[]>([]);

  useEffect(() => {
    // Update count based on the alerts prop
    setAlertCount(alerts.length);
  }, [alerts]);

  useEffect(() => {
    getDevices()
      .then((d) => setDevices(d))
      .catch((err) => console.error("Failed to load devices", err));
  }, []);

  const deviceTypeMap = devices.reduce<Record<number, string>>((acc, d) => {
    acc[d.id] = d.type;
    return acc;
  }, {});

  const severityPriority: Record<string, number> = {
    CRITICAL: 4,
    SERIOUS: 3,
    CAUTION: 2,
    INFO: 1,
  };

  const filteredAlerts = alerts
    .filter(
      (a) => severityFilter === "ALL" || a.severity === severityFilter
    )
    .filter((a) => {
      if (deviceTypeFilter === "ALL") return true;
      const type = a.deviceId ? deviceTypeMap[a.deviceId] : undefined;
      return type === deviceTypeFilter;
    });

  const sortedAlerts = [...filteredAlerts].sort((a, b) => {
    switch (sortOrder) {
      case "severity-desc":
        return (
          severityPriority[b.severity] - severityPriority[a.severity]
        );
      case "severity-asc":
        return severityPriority[a.severity] - severityPriority[b.severity];
      case "time-asc":
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      default:
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }
  });

  // Provide default empty array
  const acknowledgeAll = () => {
    if (onAcknowledge) {
      alerts.forEach((a) => onAcknowledge(a.id));
    }
  };

  return (
    <RuxContainer className="alerts-panel">
      <div slot="header">
        <div className="active-alerts">
          <span>{filteredAlerts.length}</span> Active Alerts
        </div>
        <div className="select-menu-div">
          <RuxSelect
            value={severityFilter}
            onRuxchange={(e: any) => setSeverityFilter(e.target.value)}
            size="small"
          >
            <RuxOption value="ALL" label="All Severities" />
            <RuxOption value="CRITICAL" label="Critical" />
            <RuxOption value="SERIOUS" label="Serious" />
            <RuxOption value="CAUTION" label="Caution" />
            <RuxOption value="INFO" label="Info" />
          </RuxSelect>
          <RuxSelect
            value={deviceTypeFilter}
            onRuxchange={(e: any) => setDeviceTypeFilter(e.target.value)}
            size="small"
          >
            <RuxOption value="ALL" label="All Devices" />
            {Array.from(new Set(devices.map((d) => d.type))).map((t) => (
              <RuxOption key={t} value={t} label={t} />
            ))}
          </RuxSelect>
          <RuxSelect
            value={sortOrder}
            onRuxchange={(e: any) =>
              setSortOrder(e.target.value as typeof sortOrder)
            }
            size="small"
          >
            <RuxOption value="time-desc" label="Newest" />
            <RuxOption value="time-asc" label="Oldest" />
            <RuxOption value="severity-desc" label="Severity High-Low" />
            <RuxOption value="severity-asc" label="Severity Low-High" />
          </RuxSelect>
        </div>
        {alerts.length > 0 && onAcknowledge && (
          <RuxButton
            size="small"
            className="acknowledge-all"
            onClick={acknowledgeAll}
          >
            Acknowledge All
          </RuxButton>
        )}
      </div>
      {sortedAlerts.length === 0 ? (
        <p className="no-alerts">No active alerts</p>
      ) : (
        <AlertsList alerts={sortedAlerts} onAcknowledge={onAcknowledge} />
      )}
    </RuxContainer>
  );
};

export default AlertsPanel;
