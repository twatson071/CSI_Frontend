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
  const [severityFilter, setSeverityFilter] = useState<string>("ALL");
  const [deviceTypeFilter, setDeviceTypeFilter] = useState<string>("ALL");
  const [devices, setDevices] = useState<Device[]>([]);

  useEffect(() => {
    getDevices()
      .then((d) => setDevices(d))
      .catch((err) => console.error("Failed to load devices", err));
  }, []);

  const deviceTypeMap = devices.reduce<Record<number, string>>((acc, d) => {
    acc[d.id] = d.type;
    return acc;
  }, {});

  const filteredAlerts = alerts
    .filter((a) => severityFilter === "ALL" || a.severity === severityFilter)
    .filter((a) => {
      if (deviceTypeFilter === "ALL") return true;
      const type = a.deviceId ? deviceTypeMap[a.deviceId] : undefined;
      return type === deviceTypeFilter;
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
        <div className="header-top">
          <div className="active-alerts">
            <span>{filteredAlerts.length}</span> Active Alerts
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
        <div className="filter-controls">
          <div className="filter-dropdowns">
            <div className="filter-dropdown">
              <label>Severity</label>
              <RuxSelect
                id="severity-select"
                value={severityFilter}
                onRuxchange={(e: any) => setSeverityFilter(e.target.value)}
                size="small"
              >
                <RuxOption value="ALL" label="All" />
                <RuxOption value="CRITICAL" label="Critical" />
                <RuxOption value="SERIOUS" label="Serious" />
                <RuxOption value="CAUTION" label="Caution" />
                <RuxOption value="INFO" label="Info" />
              </RuxSelect>
            </div>
            <div className="filter-dropdown">
              <label>Category</label>
              <RuxSelect
                id="device-select"
                value={deviceTypeFilter}
                onRuxchange={(e: any) => setDeviceTypeFilter(e.target.value)}
                size="small"
              >
                <RuxOption value="ALL" label="All" />
                {Array.from(new Set(devices.map((d) => d.type))).map((t) => (
                  <RuxOption key={t} value={t} label={t} />
                ))}
              </RuxSelect>
            </div>
          </div>
        </div>
      </div>
      {filteredAlerts.length === 0 ? (
        <p className="no-alerts">No active alerts</p>
      ) : (
        <AlertsList alerts={filteredAlerts} onAcknowledge={onAcknowledge} />
      )}
    </RuxContainer>
  );
};

export default AlertsPanel;
