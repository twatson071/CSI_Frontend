import AlertListItem from "./AlertListItem";
import type { Alert } from "../../services/AlertService";

interface AlertsListProps {
  alerts: Alert[];
  onAcknowledge?: (id: number) => void;
}

const AlertsList = ({ alerts, onAcknowledge }: AlertsListProps) => {
  return (
    <ul className="alert-list">
      {alerts.map((alert) => (
        <AlertListItem
          key={alert.id}
          alertItem={alert}
          handleButtonClick={() => console.log("Investigate clicked", alert.id)}
          onAcknowledge={onAcknowledge}
        />
      ))}
    </ul>
  );
};

export default AlertsList;
