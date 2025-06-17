import { RuxContainer } from "@astrouxds/react";
import AlertsList from "./AlertsList";
import type { Alert } from "../../services/AlertService";
import "./Alerts.css";

interface AlertsPanelProps {
  alerts: Alert[];
}

const AlertsPanel = ({ alerts }: AlertsPanelProps) => {
  return (
    <RuxContainer className="alerts">
      <div slot="header">
        <div className="active-alerts">
          <span>{alerts.length}</span> Active Alerts
        </div>
      </div>
      <AlertsList alerts={alerts} />
    </RuxContainer>
  );
};

export default AlertsPanel;
