import {
  RuxStatus,
  RuxButton,
  RuxAccordion,
  RuxAccordionItem,
} from "@astrouxds/react";
import type { Alert } from "../../services/AlertService";

type PropTypes = {
  alertItem: Alert;
  handleButtonClick: () => void;
  onAcknowledge?: (id: number) => void;
};

const AlertListItem = ({
  alertItem,
  handleButtonClick,
  onAcknowledge,
}: PropTypes) => {
  const getSeverityStatus = (severity: string) => {
    switch (severity.toUpperCase()) {
      case "CAUTION":
        return "caution";
      case "CRITICAL":
        return "critical";
      case "NORMAL":
        return "normal";
      case "SERIOUS":
        return "serious";
      case "OFF":
        return "off";
      case "STANDBY":
        return "standby";
      default:
        return "normal";
    }
  };

  return (
    <li
      className={`alert-item-${getSeverityStatus(alertItem.severity)}`}
    >
      <RuxAccordion>
        <RuxAccordionItem id={String(alertItem.id)}>
          <div className="accordion-item__content">
            <div>{alertItem.message}</div>
            <div className="alert-buttons">
              <RuxButton icon="launch" onClick={handleButtonClick}>
                Investigate
              </RuxButton>
              {onAcknowledge && (
                <RuxButton
                  icon="check"
                  onClick={() => onAcknowledge(alertItem.id)}
                  secondary
                >
                  Acknowledge
                </RuxButton>
              )}
            </div>
          </div>
          <div slot="label" className="alert-list-label">
            <RuxStatus status={getSeverityStatus(alertItem.severity)} />
            <span>{alertItem.message}</span>
            <span>{new Date(alertItem.createdAt).toLocaleTimeString()}</span>
          </div>
        </RuxAccordionItem>
      </RuxAccordion>
    </li>
  );
};

export default AlertListItem;
