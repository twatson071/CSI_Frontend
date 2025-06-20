import { RuxButton } from "@astrouxds/react";
import AlertListItem from "./AlertListItem";
import type { Alert } from "../../services/AlertService";

interface AlertsListProps {
  alerts: Alert[];
  onAcknowledge?: (id: number) => void;
}

const AlertsList = ({ alerts, onAcknowledge }: AlertsListProps) => {
  return (
    <div className="alerts-table">
      <div className="alerts-table-header">
        <div className="table-cell-checkbox"></div>
        <div className="table-cell-message">Message</div>
        <div className="table-cell-time">Time</div>
      </div>
      <div className="alerts-table-body">
        {alerts.map((alert) => (
          <AlertListItem
            key={alert.id}
            alertItem={alert}
            handleButtonClick={() =>
              console.log("Investigate clicked", alert.id)
            }
            onAcknowledge={onAcknowledge}
          />
        ))}
      </div>
      <div className="alerts-table-actions">
        <RuxButton secondary size="small">
          Dismiss
        </RuxButton>
        <RuxButton size="small">Acknowledge</RuxButton>
      </div>
    </div>
  );
};

export default AlertsList;
