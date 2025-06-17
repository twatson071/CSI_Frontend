import AlertListItem from "./AlertListItem";
import type { Alert } from "../../services/AlertService";

interface AlertsListProps {
  alerts: Alert[];
}

const AlertsList = ({ alerts }: AlertsListProps) => {
  return (
    <ul className="alert-list">
      {alerts.map((alert) => (
        <AlertListItem
          key={alert.id}
          alertItem={alert}
          handleButtonClick={() => console.log("Investigate clicked", alert.id)}
        />
      ))}
    </ul>
  );
};

export default AlertsList;
