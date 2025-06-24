import { RuxStatus, RuxButton, RuxIcon } from "@astrouxds/react";
import type { Alert } from "../../services/AlertService";
import { formatDateTime } from "../../utils/FormatUtils";
import "./Alerts.css";

type PropTypes = {
  alertItem: Alert;
  deviceName: string;
  siteName: string;
  onAcknowledge?: (id: number) => void;
};

const AlertListItem = ({
  alertItem,
  onAcknowledge,
  deviceName,
  siteName,
}: PropTypes) => {
  const getSeverityStatus = (severity: string) => {
    switch (severity.toUpperCase()) {
      case "CRITICAL":
        return "critical";
      case "SERIOUS":
        return "serious";
      case "CAUTION":
        return "caution";
      case "INFO":
        return "normal"; // Use 'normal' for RuxStatus
      default:
        return "off";
    }
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const alertTime = new Date(dateString);
    const diffMs = now.getTime() - alertTime.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  // Use grid layout for row, matching the modern panel
  return (
    <div
      className={`alerts-table-row alert-row-${getSeverityStatus(
        alertItem.severity
      )}${alertItem.acknowledged ? " acknowledged" : ""}`}
      tabIndex={0}
      aria-label={`${alertItem.severity} alert: ${alertItem.message}`}
    >
      <div className="table-cell-status">
        <div className="severity-indicator">
          <RuxStatus status={getSeverityStatus(alertItem.severity)} />
          <span className="severity-text">{alertItem.severity}</span>
        </div>
      </div>
      <div className="table-cell-content">
        <div className="alert-header">
          <div className="alert-location">
            <RuxIcon icon="place" size="small" />
            <span className="site-name">{siteName}</span>
            <span className="separator">•</span>
            <span className="device-name">{deviceName}</span>
          </div>
          <div className="alert-time">
            <span className="time-ago">{getTimeAgo(alertItem.createdAt)}</span>
            <span className="exact-time">
              {formatDateTime(alertItem.createdAt)}
            </span>
          </div>
        </div>
        <div className="alert-message">{alertItem.message}</div>
        {alertItem.acknowledged && (
          <div className="alert-acknowledged">
            <RuxIcon icon="check" size="small" />
            <span>
              Acknowledged
              {alertItem.acknowledgedAt && (
                <span className="ack-time">
                  {" "}
                  on {formatDateTime(alertItem.acknowledgedAt)}
                </span>
              )}
            </span>
          </div>
        )}
      </div>
      <div className="table-cell-actions">
        <RuxButton
          className="acknowledge-btn"
          onClick={() => onAcknowledge && onAcknowledge(alertItem.id)}
          aria-label={alertItem.acknowledged ? "Unacknowledge" : "Acknowledge"}
          size="small"
          color={alertItem.acknowledged ? "standby" : "normal"}
        >
          {alertItem.acknowledged ? "Unacknowledge" : "Acknowledge"}
        </RuxButton>
      </div>
    </div>
  );
};

// New AlertsListHeader component
export const AlertsListHeader = () => (
  <div className="alerts-table-header">
    <div className="table-header-status">Severity</div>
    <div className="table-header-content">Alert Details</div>
    <div className="table-header-actions">Actions</div>
  </div>
);

export default AlertListItem;
