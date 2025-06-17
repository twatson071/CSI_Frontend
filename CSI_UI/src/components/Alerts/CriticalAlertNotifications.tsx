import React, { useState } from "react";
import { RuxButton, RuxIcon, RuxContainer } from "@astrouxds/react";
import type { Alert } from "../../services/AlertService";
import StatusBadge from "../common/StatusBadge";
import "./CriticalAlertNotifications.css";

interface CriticalAlertNotificationsProps {
  alerts: Alert[];
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
  maxAlerts?: number;
}

const CriticalAlertNotifications: React.FC<CriticalAlertNotificationsProps> = ({
  alerts,
  position = "top-right",
  maxAlerts = 5,
}) => {
  const acknowledgeAlert = (id: number) => {
    // Currently just remove from local array
  };
  const clearAllAlerts = () => {};
  const [isMinimized, setIsMinimized] = useState(false);
  const visibleAlerts = alerts.filter((a) => a.severity === "CRITICAL").slice(0, maxAlerts);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  if (visibleAlerts.length === 0) {
    return null;
  }

  return (
    <div
      className={`critical-alerts-container ${position} ${
        isMinimized ? "minimized" : ""
      }`}
    >
      <RuxContainer>
        <div slot="header" className="alerts-header">
          <div className="header-left">
            <RuxIcon icon="warning" size="small" />
            <span className="alert-count">
              {alerts.length} Critical Alert{alerts.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="header-actions">
            <RuxButton
              size="small"
              secondary
              onClick={() => setIsMinimized(!isMinimized)}
              title={isMinimized ? "Expand" : "Minimize"}
            >
              <RuxIcon icon={isMinimized ? "expand_more" : "expand_less"} />
            </RuxButton>
            {alerts.length > 0 && (
              <RuxButton
                size="small"
                secondary
                onClick={clearAllAlerts}
                title="Clear all alerts"
              >
                <RuxIcon icon="clear_all" />
              </RuxButton>
            )}
          </div>
        </div>

        {!isMinimized && (
          <div className="alerts-list">
            {visibleAlerts.map((alert) => (
              <div key={alert.id} className="critical-alert-item">
                <div className="alert-content">
                  <div className="alert-header">
                    <StatusBadge status="CRITICAL" size="small" showIcon />
                    <span className="alert-device">
                      {alert.deviceName || `Device ${alert.deviceId}`}
                    </span>
                    <span className="alert-time">
                      {formatTimestamp(alert.createdAt)}
                    </span>
                  </div>
                  <div className="alert-message">{alert.message}</div>
                  <div className="alert-details">
                    <span className="metric-info">
                      {alert.metricType}: {alert.metricValue.toFixed(2)}
                      (threshold: {alert.threshold})
                    </span>
                    {alert.siteName && (
                      <span className="site-info">Site: {alert.siteName}</span>
                    )}
                  </div>
                </div>
                <div className="alert-actions">
                  <RuxButton
                    size="small"
                    onClick={() => acknowledgeAlert(alert.id)}
                    title="Acknowledge alert"
                  >
                    <RuxIcon icon="check" />
                  </RuxButton>
                </div>
              </div>
            ))}

            {alerts.length > maxAlerts && (
              <div className="more-alerts-indicator">
                + {alerts.length - maxAlerts} more alert
                {alerts.length - maxAlerts !== 1 ? "s" : ""}
              </div>
            )}
          </div>
        )}
      </RuxContainer>
    </div>
  );
};

export default CriticalAlertNotifications;
