import React from "react";
import { RuxStatus } from "@astrouxds/react";
import "./NetworkSwitchDetails.css";

interface PortInfo {
  status: string;
  speed: string;
  vlan: number | string;
  power_over_ethernet: string | boolean;
  device?: string;
}

interface NetworkSwitchData {
  parameters: {
    model: string;
    firmware_version: string;
    total_ports: number;
    poe_capable_ports: number;
    uptime_hours: number;
  };
  port_status: Record<string, PortInfo>;
  statistics: {
    total_traffic_gb: number;
    active_ports: number;
    poe_power_used_w: number;
    cpu_usage_percent: number;
    memory_usage_percent: number;
    temperature_c: number;
  };
}

interface NetworkSwitchDetailsProps {
  deviceName: string;
  data: NetworkSwitchData;
}

const NetworkSwitchDetails: React.FC<NetworkSwitchDetailsProps> = ({
  deviceName,
  data,
}) => {
  if (!data || !data.parameters) {
    return <div>No switch data available</div>;
  }

  const { parameters, port_status, statistics } = data;

  // Convert port_status object to array and sort by port number
  const ports = Object.entries(port_status || {}).sort((a, b) => {
    const portNumA = parseInt(a[0].replace(/\D/g, ''));
    const portNumB = parseInt(b[0].replace(/\D/g, ''));
    return portNumA - portNumB;
  });

  const getPortStatus = (status: string) => {
    return status === "connected" ? "normal" : "off";
  };

  const getPoeStatus = (poe: string | boolean) => {
    if (typeof poe === "string") {
      return poe === "active" ? "normal" : "off";
    }
    return poe ? "normal" : "off";
  };

  return (
    <div className="network-switch-content">
      <div className="switch-info-grid">
          <div className="info-section">
            <h4>System Information</h4>
            <div className="info-item">
              <span className="label">Firmware:</span>
              <span className="value">{parameters.firmware_version}</span>
            </div>
            <div className="info-item">
              <span className="label">Uptime:</span>
              <span className="value">{Math.floor(parameters.uptime_hours / 24)} days</span>
            </div>
            <div className="info-item">
              <span className="label">Total Ports:</span>
              <span className="value">{parameters.total_ports}</span>
            </div>
            <div className="info-item">
              <span className="label">PoE Ports:</span>
              <span className="value">{parameters.poe_capable_ports}</span>
            </div>
          </div>

          {statistics && (
            <div className="info-section">
              <h4>Statistics</h4>
              <div className="info-item">
                <span className="label">Active Ports:</span>
                <span className="value">{statistics.active_ports}</span>
              </div>
              <div className="info-item">
                <span className="label">Total Traffic:</span>
                <span className="value">{statistics.total_traffic_gb} GB</span>
              </div>
              <div className="info-item">
                <span className="label">PoE Power:</span>
                <span className="value">{statistics.poe_power_used_w} W</span>
              </div>
              <div className="info-item">
                <span className="label">CPU Usage:</span>
                <span className="value">{statistics.cpu_usage_percent}%</span>
              </div>
              <div className="info-item">
                <span className="label">Memory Usage:</span>
                <span className="value">{statistics.memory_usage_percent}%</span>
              </div>
              <div className="info-item">
                <span className="label">Temperature:</span>
                <span className="value">{statistics.temperature_c}°C</span>
              </div>
            </div>
          )}
        </div>

        <div className="ports-section">
          <h4>Port Status</h4>
          <div className="ports-grid">
            {ports.map(([portKey, portInfo]) => (
              <div key={portKey} className="port-item">
                <div className="port-header">
                  <RuxStatus status={getPortStatus(portInfo.status)} />
                  <span className="port-name">{portKey.replace('_', ' ')}</span>
                </div>
                <div className="port-details">
                  <div className="port-info">
                    <span className="small-label">Speed:</span>
                    <span className="small-value">{portInfo.speed}</span>
                  </div>
                  <div className="port-info">
                    <span className="small-label">VLAN:</span>
                    <span className="small-value">{portInfo.vlan}</span>
                  </div>
                  {portInfo.power_over_ethernet !== false && (
                    <div className="port-info">
                      <span className="small-label">PoE:</span>
                      <RuxStatus status={getPoeStatus(portInfo.power_over_ethernet)} size="small" />
                    </div>
                  )}
                  {portInfo.device && (
                    <div className="port-info">
                      <span className="small-label">Device:</span>
                      <span className="small-value">{portInfo.device}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default NetworkSwitchDetails;