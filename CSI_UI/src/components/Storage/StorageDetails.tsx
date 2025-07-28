import React from "react";
import { RuxContainer } from "@astrouxds/react";
import "./StorageDetails.css";

interface StorageDetailsProps {
  deviceName: string;
  data: Record<string, unknown>;
}

const StorageDetails: React.FC<StorageDetailsProps> = ({ deviceName, data }) => {
  const parameters = data?.parameters || {};
  
  const formatBytes = (bytes: number): string => {
    if (!bytes || bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB", "PB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const calculatePercentage = (used: number, total: number): number => {
    if (!total || total === 0) return 0;
    return Math.round((used / total) * 100);
  };

  const getHealthColor = (health: string): string => {
    switch (health?.toLowerCase()) {
      case "healthy":
      case "good":
        return "#00c800";
      case "warning":
      case "degraded":
        return "#ffc700";
      case "critical":
      case "failed":
        return "#ff3838";
      default:
        return "#666";
    }
  };

  const getUsageColor = (percentage: number): string => {
    if (percentage >= 90) return "#ff3838";
    if (percentage >= 75) return "#ffc700";
    return "#00c800";
  };

  return (
    <div className="storage-details">
      <RuxContainer>
        <div slot="header">
          <h3>{deviceName} - Storage Details</h3>
        </div>
        
        <div className="storage-content">
          <div className="storage-info">
            <div className="info-section">
              <h4>System Information</h4>
              <div className="info-grid">
                <div className="info-item">
                  <span className="label">Model:</span>
                  <span className="value">{parameters.model || "N/A"}</span>
                </div>
                <div className="info-item">
                  <span className="label">Firmware:</span>
                  <span className="value">{parameters.firmware_version || "N/A"}</span>
                </div>
                <div className="info-item">
                  <span className="label">Status:</span>
                  <span className="value status" style={{ color: data?.status === "active" ? "#00c800" : "#ff3838" }}>
                    {data?.status?.toUpperCase() || "UNKNOWN"}
                  </span>
                </div>
                <div className="info-item">
                  <span className="label">Health:</span>
                  <span className="value health" style={{ color: getHealthColor(parameters.health) }}>
                    {parameters.health?.toUpperCase() || "UNKNOWN"}
                  </span>
                </div>
              </div>
            </div>

            <div className="info-section">
              <h4>Storage Capacity</h4>
              <div className="storage-summary">
                <div className="capacity-item">
                  <span className="capacity-label">Total Capacity:</span>
                  <span className="capacity-value">{formatBytes(parameters.capacity?.total || 0)}</span>
                </div>
                <div className="capacity-item">
                  <span className="capacity-label">Used Space:</span>
                  <span className="capacity-value">{formatBytes(parameters.capacity?.used || 0)}</span>
                </div>
                <div className="capacity-item">
                  <span className="capacity-label">Free Space:</span>
                  <span className="capacity-value">{formatBytes(parameters.capacity?.free || 0)}</span>
                </div>
                <div className="usage-bar">
                  <div className="usage-label">Usage:</div>
                  <div className="usage-progress">
                    <div 
                      className="usage-fill" 
                      style={{ 
                        width: `${calculatePercentage(parameters.capacity?.used || 0, parameters.capacity?.total || 0)}%`,
                        backgroundColor: getUsageColor(calculatePercentage(parameters.capacity?.used || 0, parameters.capacity?.total || 0))
                      }}
                    ></div>
                  </div>
                  <div className="usage-percentage">
                    {calculatePercentage(parameters.capacity?.used || 0, parameters.capacity?.total || 0)}%
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="storage-volumes">
            <h4>Volumes & Shares</h4>
            <div className="volumes-grid">
              {parameters.volumes && Object.entries(parameters.volumes).map(([volumeId, volume]: [string, any]) => (
                <div key={volumeId} className="volume-card">
                  <div className="volume-header">
                    <h5>{volume.name || volumeId}</h5>
                    <span className={`volume-status ${volume.status?.toLowerCase()}`}>
                      {volume.status?.toUpperCase() || "UNKNOWN"}
                    </span>
                  </div>
                  <div className="volume-details">
                    <div className="volume-info">
                      <span className="label">Type:</span>
                      <span className="value">{volume.type || "Standard"}</span>
                    </div>
                    <div className="volume-info">
                      <span className="label">RAID Level:</span>
                      <span className="value">{volume.raid_level || "N/A"}</span>
                    </div>
                    <div className="volume-info">
                      <span className="label">Size:</span>
                      <span className="value">{formatBytes(volume.size || 0)}</span>
                    </div>
                    <div className="volume-usage">
                      <div className="mini-usage-bar">
                        <div 
                          className="mini-usage-fill"
                          style={{ 
                            width: `${calculatePercentage(volume.used || 0, volume.size || 0)}%`,
                            backgroundColor: getUsageColor(calculatePercentage(volume.used || 0, volume.size || 0))
                          }}
                        ></div>
                      </div>
                      <span className="usage-text">
                        {formatBytes(volume.used || 0)} / {formatBytes(volume.size || 0)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="storage-disks">
            <h4>Physical Disks</h4>
            <div className="disks-table">
              <div className="table-header">
                <div className="header-cell">Disk</div>
                <div className="header-cell">Model</div>
                <div className="header-cell">Capacity</div>
                <div className="header-cell">Temperature</div>
                <div className="header-cell">Health</div>
                <div className="header-cell">Status</div>
              </div>
              {parameters.disks && Object.entries(parameters.disks).map(([diskId, disk]: [string, any]) => (
                <div key={diskId} className="table-row">
                  <div className="table-cell">{disk.slot || diskId}</div>
                  <div className="table-cell">{disk.model || "Unknown"}</div>
                  <div className="table-cell">{formatBytes(disk.capacity || 0)}</div>
                  <div className="table-cell">
                    <span className={disk.temperature > 50 ? "temp-warning" : ""}>
                      {disk.temperature || "--"}°C
                    </span>
                  </div>
                  <div className="table-cell">
                    <span style={{ color: getHealthColor(disk.health) }}>
                      {disk.health?.toUpperCase() || "UNKNOWN"}
                    </span>
                  </div>
                  <div className="table-cell">
                    <span className={`disk-status ${disk.status?.toLowerCase()}`}>
                      {disk.status?.toUpperCase() || "UNKNOWN"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="storage-performance">
            <h4>Performance Metrics</h4>
            <div className="performance-grid">
              <div className="metric-card">
                <div className="metric-label">Read Speed</div>
                <div className="metric-value">
                  {parameters.performance?.read_speed || "0"} MB/s
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-label">Write Speed</div>
                <div className="metric-value">
                  {parameters.performance?.write_speed || "0"} MB/s
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-label">IOPS</div>
                <div className="metric-value">
                  {parameters.performance?.iops || "0"}
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-label">Network Throughput</div>
                <div className="metric-value">
                  {parameters.performance?.network_throughput || "0"} Mbps
                </div>
              </div>
            </div>
          </div>
        </div>
      </RuxContainer>
    </div>
  );
};

export default StorageDetails;