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
};

const AlertListItem = ({ alertItem, handleButtonClick }: PropTypes) => {
  return (
    <li>
      <RuxAccordion>
        <RuxAccordionItem id={String(alertItem.id)}>
          <div className="accordion-item__content">
            <div>{alertItem.message}</div>
            <RuxButton icon="launch" onClick={handleButtonClick}>
              Investigate
            </RuxButton>
          </div>
          <div slot="label" className="alert-list-label">
            <RuxStatus status={alertItem.severity.toLowerCase()} />
            <span>{alertItem.message}</span>
            <span>{new Date(alertItem.createdAt).toLocaleTimeString()}</span>
          </div>
        </RuxAccordionItem>
      </RuxAccordion>
    </li>
  );
};

export default AlertListItem;
