import { RuxStatus, RuxCheckbox, RuxSelect, RuxOption } from "@astrouxds/react";
import type { Alert } from "../../services/AlertService";

type PropTypes = {
  alertItem: Alert;
  handleButtonClick: () => void;
  onAcknowledge?: (id: number) => void;
};

const AlertListItem = ({ alertItem, onAcknowledge }: PropTypes) => {
  const getSeverityStatus = (severity: string) => {
    switch (severity.toUpperCase()) {
      case "CRITICAL":
        return "critical";
      case "SERIOUS":
        return "serious";
      case "CAUTION":
        return "caution";
      case "INFO":
        return "normal";
      default:
        return "off";
    }
  };

  const handleActionChange = (event: any) => {
    const action = event.target.value;

    if (action === "acknowledge" && onAcknowledge) {
      onAcknowledge(alertItem.id);
    } else if (action === "investigate") {
      console.log("Investigate clicked", alertItem.id);
    } else if (action === "dismiss") {
      console.log("Dismiss clicked", alertItem.id);
    }

    // Reset the dropdown after action
    setTimeout(() => {
      event.target.value = "";
    }, 100);
  };

  return (
    <div className="alerts-table-row">
      <div className="table-cell-checkbox">
        <RuxCheckbox />
      </div>
      <div className="table-cell-message">
        <RuxStatus status={getSeverityStatus(alertItem.severity)} />
        <span>{alertItem.message}</span>
      </div>
      <div className="table-cell-time">
        {new Date(alertItem.createdAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })}
      </div>
    </div>
  );
};

export default AlertListItem;
