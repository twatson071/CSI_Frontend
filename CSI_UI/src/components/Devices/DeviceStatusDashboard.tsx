import React, { useState } from "react";
import {
  RuxContainer,
  RuxStatus,
  RuxTable,
  RuxTableHeaderRow,
  RuxTableHeaderCell,
  RuxTableBody,
  RuxTableRow,
  RuxTableCell,
  RuxButton,
  RuxIcon,
  RuxProgress,
  RuxTabs,
  RuxTab,
} from "@astrouxds/react";
import { useDeviceStatus } from "../../hooks/useDeviceStatus";
import "./DeviceStatusDashboard.css";

const DeviceStatusDashboard: React.FC = () => {
  const [activeView, setActiveView] = useState<"list" | "grid">("list");
  const [selectedType, setSelectedType] = useState<string | null>(null);

  // Use the new device status hook
  const {
    devices,
    loading,
    error,
    lastRefresh,
    refreshDevices,
    getSystemHealth,
    updateDeviceStatus,
    getDeviceStatusFromAlerts,
  } = useDeviceStatus();
  const systemHealth = getSystemHealth();

  const deviceTypes = Array.from(new Set(devices.map((device) => device.type)));

  const filteredDevices = selectedType
    ? devices.filter((device) => device.type === selectedType)
    : devices;

  // Handle refresh functionality
  const handleRefresh = async () => {
    await refreshDevices();
  };

  const mapStatus = (
    status: string | undefined
  ): "normal" | "critical" | "caution" | "serious" | "off" | "standby" => {
    if (!status) return "off";
    const lowerStatus = status.toLowerCase();
    switch (lowerStatus) {
      case "normal":
      case "online":
        return "normal";
      case "critical":
        return "critical";
      case "caution":
        return "caution";
      case "serious":
        return "serious";
      case "standby":
        return "standby";
      case "off":
      case "offline":
        return "off";
      default:
        return "normal";
    }
  };

  return (
    <RuxContainer className="device-status">
      <div slot="header">
        <div className="container-header">
          Device Status Dashboard
          <div className="dashboard-controls">
            <RuxButton size="small" icon="refresh" onClick={handleRefresh}>
              Refresh
            </RuxButton>
            <div className="view-toggle">
              <RuxButton
                size="small"
                icon="list"
                className="view-toggle-button"
                aria-label="List View"
                secondary={activeView !== "list"}
                onClick={() => setActiveView("list")}
              ></RuxButton>
              <RuxButton
                size="small"
                icon="view-module"
                secondary={activeView !== "grid"}
                onClick={() => setActiveView("grid")}
              ></RuxButton>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-metrics">
          <div className="dashboard-metric-card">
            <h3>Total Devices</h3>
            <div className="metric-value">{devices.length}</div>
          </div>
          <div className="dashboard-metric-card">
            <h3>System Health</h3>
            <div className="metric-value">{systemHealth.percentage}%</div>
            <RuxProgress value={systemHealth.percentage} max={100} />
          </div>
          <div className="dashboard-metric-card">
            <h3>Critical Issues</h3>
            <div className="metric-value">
              {systemHealth.statusCounts?.["critical"] || 0}
            </div>
          </div>
        </div>

        <div className="dashboard-filters">
          <RuxTabs>
            <RuxTab key="all" onClick={() => setSelectedType(null)}>
              All Types
            </RuxTab>
            {deviceTypes.map((type) => (
              <RuxTab key={type} onClick={() => setSelectedType(type)}>
                {type}
              </RuxTab>
            ))}
          </RuxTabs>
        </div>

        {loading ? (
          <div className="loading-state">
            <RuxProgress value={-1} />
            <p>Loading device statuses...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <RuxIcon icon="error" />
            <p>{error}</p>
            <RuxButton onClick={handleRefresh}>Retry</RuxButton>
          </div>
        ) : activeView === "list" ? (
          <>
            <div className="device-list-header">
              Device Status
              {selectedType && (
                <span className="filter-tag">{`Filtered by: ${selectedType}`}</span>
              )}
            </div>
            <div className="table-wrapper device-status-list">
              <RuxTable>
                <RuxTableHeaderRow>
                  <RuxTableHeaderCell>Status</RuxTableHeaderCell>
                  <RuxTableHeaderCell>Name</RuxTableHeaderCell>
                  <RuxTableHeaderCell>Type</RuxTableHeaderCell>
                  <RuxTableHeaderCell>Last Seen</RuxTableHeaderCell>
                  <RuxTableHeaderCell>IP Address</RuxTableHeaderCell>
                  <RuxTableHeaderCell>Actions</RuxTableHeaderCell>
                </RuxTableHeaderRow>
                <RuxTableBody>
                  {filteredDevices.map((device, index) => (
                    <RuxTableRow key={device.id || index}>
                      <RuxTableCell>
                        <RuxStatus status={mapStatus(device.status)} />
                      </RuxTableCell>
                      <RuxTableCell>{device.name}</RuxTableCell>
                      <RuxTableCell>{device.type}</RuxTableCell>
                      <RuxTableCell>
                        {device.lastSeen
                          ? new Date(device.lastSeen).toLocaleString()
                          : device.updatedAt
                          ? new Date(device.updatedAt).toLocaleString()
                          : "Unknown"}
                      </RuxTableCell>
                      <RuxTableCell>{device.ipAddress || "No IP"}</RuxTableCell>
                      <RuxTableCell>
                        <RuxButton className="view-details-button" size="small">
                          Details
                        </RuxButton>
                      </RuxTableCell>
                    </RuxTableRow>
                  ))}
                </RuxTableBody>
              </RuxTable>
            </div>
            {filteredDevices.length === 0 && (
              <div className="no-devices-message">
                <p>
                  No devices found
                  {selectedType ? ` of type ${selectedType}` : ""}.
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="device-grid-view">
            {filteredDevices.map((device) => (
              <RuxContainer key={device.id} className="device-card">
                <div slot="header">
                  <RuxStatus status={mapStatus(device.status)} /> {device.name}
                </div>
                <div className="device-card-content">
                  <div className="device-type">{device.type}</div>
                  <div className="device-ip">{device.ipAddress || "No IP"}</div>
                  {device.type === "PDU" && device.parameters && (
                    <div className="outlet-summary">
                      <div>
                        Outlets:{" "}
                        {Object.keys(device.parameters.outlets || {}).length}
                      </div>
                    </div>
                  )}
                </div>
                <div slot="footer">
                  <RuxButton size="small">View Details</RuxButton>
                </div>
              </RuxContainer>
            ))}
            {filteredDevices.length === 0 && (
              <div className="no-devices-message">
                <p>
                  No devices found
                  {selectedType ? ` of type ${selectedType}` : ""}.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <div slot="footer" className="dashboard-footer">
        Last refreshed: {lastRefresh?.toLocaleString() || "Never"}
      </div>
    </RuxContainer>
  );
};

export default DeviceStatusDashboard;
