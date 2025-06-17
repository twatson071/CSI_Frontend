import { RuxContainer } from "@astrouxds/react";
import AlertsList from "./AlertsList";
import type { Alert } from "../../services/AlertService";
import "./Alerts.css";

interface AlertsPanelProps {
  alerts?: Alert[]; // Make alerts optional
  onAcknowledge?: (id: number) => void; // Add acknowledge callback
}

const AlertsPanel = ({ alerts = [], onAcknowledge }: AlertsPanelProps) => {
  // Provide default empty array
  return (
    <RuxContainer className="alerts">
      <div slot="header">
        <div className="active-alerts">
          <span>{alerts.length}</span> Active Alerts
        </div>
      </div>
      <AlertsList alerts={alerts} onAcknowledge={onAcknowledge} />
    </RuxContainer>
  );
};

export default AlertsPanel;
