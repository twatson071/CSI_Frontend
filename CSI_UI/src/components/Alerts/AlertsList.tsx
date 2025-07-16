import React, { useState, useMemo } from "react";
import AlertListItem from "./AlertListItem";
import {
  RuxTable,
  RuxTableBody,
  RuxTableHeader,
  RuxTableHeaderRow,
  RuxTableHeaderCell,
  RuxSelect,
  RuxOption,
  RuxInput,
  RuxIcon,
} from "@astrouxds/react";
import type { Alert } from "../../services/AlertService";

interface AlertsListProps {
  alerts: Alert[];
  onAcknowledge?: (id: number) => void;
  deviceMap: Record<number, { name: string; type: string }>;
  siteMap: Record<number, { name: string }>;
}

const AlertsList = ({
  alerts,
  onAcknowledge,
  deviceMap,
  siteMap,
}: AlertsListProps) => {
  // Filter state
  const [severity, setSeverity] = useState<string>("");
  const [deviceId, setDeviceId] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // Filtering logic
  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      let matches = true;
      if (severity && alert.severity !== severity) matches = false;
      if (deviceId && String(alert.deviceId) !== deviceId) matches = false;
      if (startDate && new Date(alert.createdAt) < new Date(startDate))
        matches = false;
      if (endDate && new Date(alert.createdAt) > new Date(endDate))
        matches = false;
      return matches;
    });
  }, [alerts, severity, deviceId, startDate, endDate]);

  // Unique severities and devices for dropdowns
  const severities = ["INFO", "CAUTION", "SERIOUS", "CRITICAL"];
  const deviceOptions = Object.entries(deviceMap);

  // Astro UXDS event helpers
  const handleSeverityChange = (e: Event) => {
    const value = (e.target as unknown as HTMLSelectElement).value;
    setSeverity(value);
  };
  const handleDeviceChange = (e: Event) => {
    const value = (e.target as unknown as HTMLSelectElement).value;
    setDeviceId(value);
  };
  const handleStartDateChange = (e: Event) => {
    const value = (e.target as unknown as HTMLInputElement).value;
    setStartDate(value);
  };
  const handleEndDateChange = (e: Event) => {
    const value = (e.target as unknown as HTMLInputElement).value;
    setEndDate(value);
  };

  return (
    <div>
      {/* Rux Filter Bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          marginBottom: "1.5rem",
          padding: "0.5rem 0",
        }}
      >
        <RuxSelect
          value={severity}
          onRuxchange={handleSeverityChange}
          label="Severity"
          style={{ minWidth: 140 }}
        >
          <RuxOption value="" label="All Severities">
            All Severities
          </RuxOption>
          {severities.map((s) => (
            <RuxOption key={s} value={s} label={s}>
              {s}
            </RuxOption>
          ))}
        </RuxSelect>
        <RuxSelect
          value={deviceId}
          onRuxchange={handleDeviceChange}
          label="Device"
          style={{ minWidth: 180 }}
        >
          <RuxOption value="" label="All Devices">
            All Devices
          </RuxOption>
          {deviceOptions.map(([id, dev]) => (
            <RuxOption key={id} value={id} label={dev.name}>
              {dev.name}
            </RuxOption>
          ))}
        </RuxSelect>
        <RuxInput
          type="date"
          value={startDate}
          onRuxinput={handleStartDateChange}
          label="Start Date"
          style={{ minWidth: 160 }}
        />
        <RuxInput
          type="date"
          value={endDate}
          onRuxinput={handleEndDateChange}
          label="End Date"
          style={{ minWidth: 160 }}
        />
        {(severity || deviceId || startDate || endDate) && (
          <button
            style={{
              marginLeft: 8,
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
            title="Clear Filters"
            onClick={() => {
              setSeverity("");
              setDeviceId("");
              setStartDate("");
              setEndDate("");
            }}
          >
            <RuxIcon icon="close" style={{ color: "#666" }} />
          </button>
        )}
      </div>
      {/* Alerts Table */}
      {filteredAlerts.length === 0 ? (
        <div style={{ padding: "1rem", textAlign: "center" }}>
          No alerts to display
        </div>
      ) : (
        <RuxTable className="alerts-table">
          <RuxTableHeader>
            <RuxTableHeaderRow className="alerts-table-header">
              <RuxTableHeaderCell className="table-header-status">
                Status
              </RuxTableHeaderCell>
              <RuxTableHeaderCell className="table-header-content">
                Alert Details
              </RuxTableHeaderCell>
              <RuxTableHeaderCell className="table-header-actions">
                Actions
              </RuxTableHeaderCell>
            </RuxTableHeaderRow>
          </RuxTableHeader>
          <RuxTableBody className="alerts-table-body">
            {filteredAlerts.map((alert) => (
              <AlertListItem
                key={alert.id}
                alertItem={alert}
                onAcknowledge={onAcknowledge}
                deviceName={
                  alert.deviceId
                    ? deviceMap[alert.deviceId]?.name || "Unknown Device"
                    : "N/A"
                }
                siteName={
                  alert.siteId
                    ? siteMap[alert.siteId]?.name || "Unknown Site"
                    : "N/A"
                }
              />
            ))}
          </RuxTableBody>
        </RuxTable>
      )}
    </div>
  );
};

export default AlertsList;
