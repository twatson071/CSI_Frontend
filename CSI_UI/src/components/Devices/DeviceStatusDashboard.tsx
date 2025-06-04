import React, { useState, useEffect } from "react";
import {
  RuxContainer,
  RuxStatus,
  RuxTable,
  RuxTableHeader,
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
import { Device } from "../../services/DeviceService";
import { getDevices } from "../../services";
import "./DeviceStatusDashboard.css";

interface DeviceStatusData {
  devices: Device[];
  statusCounts: Record<string, number>;
  loading: boolean;
  error: string | null;
  lastRefreshTime: Date | null;
}

const DeviceStatusDashboard: React.FC = () => {
  const [statusData, setStatusData] = useState<DeviceStatusData>({
    devices: [],
    statusCounts: {},
    loading: true,
    error: null,
    lastRefreshTime: null,
  });
  const [activeView, setActiveView] = useState<"list" | "grid">("list");
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const fetchDeviceStatus = async () => {
    setStatusData((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const fetchedDevices = await getDevices();

      const statusCounts = fetchedDevices.reduce((counts, device) => {
        const status = device.status || "unknown";
        counts[status] = (counts[status] || 0) + 1;
        return counts;
      }, {} as Record<string, number>);

      setStatusData({
        devices: fetchedDevices,
        statusCounts,
        loading: false,
        error: null,
        lastRefreshTime: new Date(),
      });
    } catch (error) {
      console.error("Failed to fetch device status:", error);
      setStatusData((prev) => ({
        ...prev,
        loading: false,
        error: "Failed to load device statuses",
      }));
    }
  };

  useEffect(() => {
    fetchDeviceStatus();
    // Set up an interval to refresh device status every minute
    const intervalId = setInterval(fetchDeviceStatus, 60000);

    return () => clearInterval(intervalId);
  }, []);

  const deviceTypes = Array.from(
    new Set(statusData.devices.map((device) => device.type))
  );

  const filteredDevices = selectedType
    ? statusData.devices.filter((device) => device.type === selectedType)
    : statusData.devices;

  const calculateHealthPercentage = () => {
    if (statusData.devices.length === 0) return 100;

    const healthyStatuses = ["normal", "online", "standby"];
    const healthyDevices = statusData.devices.filter((device) =>
      healthyStatuses.includes(device.status?.toLowerCase() || "")
    ).length;

    return Math.round((healthyDevices / statusData.devices.length) * 100);
  };

  const healthPercentage = calculateHealthPercentage();

  return (
    <RuxContainer className="device-status">
      <div slot="header">
        <div className="container-header">
          Device Status Dashboard
          <div className="dashboard-controls">
            <RuxButton size="small" icon="refresh" onClick={fetchDeviceStatus}>
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
          <div className="metric-card">
            <h3>Total Devices</h3>
            <div className="metric-value">{statusData.devices.length}</div>
          </div>
          <div className="metric-card">
            <h3>System Health</h3>
            <div className="metric-value">{healthPercentage}%</div>
            <RuxProgress value={healthPercentage} max={100} />
          </div>
          <div className="metric-card">
            <h3>Critical Issues</h3>
            <div className="metric-value">
              {statusData.statusCounts["critical"] || 0}
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

        {statusData.loading ? (
          <div className="loading-state">
            <RuxProgress value={-1} />
            <p>Loading device statuses...</p>
          </div>
        ) : statusData.error ? (
          <div className="error-state">
            <RuxIcon icon="error" />
            <p>{statusData.error}</p>
            <RuxButton onClick={fetchDeviceStatus}>Retry</RuxButton>
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
                        <RuxStatus status={device.status} />
                      </RuxTableCell>
                      <RuxTableCell>{device.name}</RuxTableCell>
                      <RuxTableCell>{device.type}</RuxTableCell>
                      <RuxTableCell>
                        {device.lastSeen
                          ? new Date(device.lastSeen).toLocaleString()
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
                  <RuxStatus status={device.status} /> {device.name}
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
        Last refreshed:{" "}
        {statusData.lastRefreshTime?.toLocaleString() || "Never"}
      </div>
    </RuxContainer>
  );
};

export default DeviceStatusDashboard;
