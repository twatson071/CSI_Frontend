import { RuxContainer, RuxButton } from "@astrouxds/react";
import { useState, useEffect } from "react";
import AlertsList from "./AlertsList";
import type { Alert } from "../../services/AlertService";
import { getAlertCount } from "../../services/AlertService";
import "./Alerts.css";

interface AlertsPanelProps {
  alerts?: Alert[]; // Make alerts optional
  onAcknowledge?: (id: number) => void; // Add acknowledge callback
}

const AlertsPanel = ({ alerts = [], onAcknowledge }: AlertsPanelProps) => {
  const [alertCount, setAlertCount] = useState(0);

  useEffect(() => {
    // Update count based on the alerts prop
    setAlertCount(alerts.length);
  }, [alerts]);

  // Provide default empty array
  const acknowledgeAll = () => {
    if (onAcknowledge) {
      alerts.forEach((a) => onAcknowledge(a.id));
    }
  };

  return (
    <RuxContainer className="alerts">
      <div slot="header">
        <div className="active-alerts">
          <span>{alertCount}</span> Active Alerts
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
      {alerts.length === 0 ? (
        <p className="no-alerts">No active alerts</p>
      ) : (
        <AlertsList alerts={alerts} onAcknowledge={onAcknowledge} />
      )}
    </RuxContainer>
  );
};

export default AlertsPanel;
