import {
  RuxStatus,
  RuxButton,
  RuxTableRow,
  RuxTableCell,
  RuxIcon,
} from "@astrouxds/react";
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

  const getSeverityColor = (severity: string) => {
    switch (severity.toUpperCase()) {
      case "CRITICAL":
        return "#e53935";
      case "SERIOUS":
        return "#fbc02d";
      case "CAUTION":
        return "#ffb300";
      case "INFO":
        return "#43a047";
      default:
        return "#757575";
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

  const severityColor = getSeverityColor(alertItem.severity);

  // Use RuxTableRow for consistent styling
  return (
    <RuxTableRow
      className={`alerts-table-row alert-row-${getSeverityStatus(
        alertItem.severity
      )}${alertItem.acknowledged ? " acknowledged" : ""}`}
      tabIndex={0}
      aria-label={`${alertItem.severity} alert: ${alertItem.message}`}
      style={{
        borderLeft: `6px solid ${severityColor}`,
        opacity: alertItem.acknowledged ? 0.5 : 1,
        background: alertItem.acknowledged ? "#23272f" : undefined,
        transition: "opacity 0.2s, background 0.2s",
      }}
    >
      <RuxTableCell className="table-cell-status">
        <div className="severity-indicator">
          <RuxStatus status={getSeverityStatus(alertItem.severity)} />
          <span className="severity-text">{alertItem.severity}</span>
          {alertItem.acknowledged && (
            <RuxIcon
              icon="check-circle"
              className="acknowledged-icon"
              style={{ color: "#43a047", marginLeft: 6 }}
              title="Acknowledged"
            />
          )}
        </div>
      </RuxTableCell>
      <RuxTableCell className="table-cell-content">
        <div className="alert-header">
          <div className="alert-location">
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
      </RuxTableCell>
      <RuxTableCell className="table-cell-actions">
        <RuxButton
          className={`acknowledge-btn ${getSeverityStatus(alertItem.severity)}`}
          onClick={() => onAcknowledge && onAcknowledge(alertItem.id)}
          aria-label={alertItem.acknowledged ? "Unacknowledge" : "Acknowledge"}
          size="small"
          color={
            alertItem.acknowledged
              ? "standby"
              : getSeverityStatus(alertItem.severity)
          }
          disabled={!!alertItem.acknowledged}
        >
          {alertItem.acknowledged ? "Acknowledged" : "Acknowledge"}
        </RuxButton>
      </RuxTableCell>
    </RuxTableRow>
  );
};

export default AlertListItem;
