import AlertListItem, { AlertsListHeader } from "./AlertListItem";
import {
  RuxTable,
  RuxTableBody,
} from "@astrouxds/react";
import type { Alert } from "../../services/AlertService";

interface AlertsListProps {
  alerts: Alert[];
  onAcknowledge?: (id: number) => void;
  deviceMap: Record<number, { name: string; type: string }>;
  siteMap: Record<number, { name: string }>;
}

const AlertsList = ({
  alerts,
  onAcknowledge,
  deviceMap,
  siteMap,
}: AlertsListProps) => {
  if (alerts.length === 0) {
    return (
      <div style={{ padding: "1rem", textAlign: "center" }}>
        No alerts to display
      </div>
    );
  }

  return (
    <RuxTable className="alerts-table">
      <AlertsListHeader />
      <RuxTableBody className="alerts-table-body">
        {alerts.map((alert) => (
          <AlertListItem
            key={alert.id}
            alertItem={alert}
            onAcknowledge={onAcknowledge}
            deviceName={
              alert.deviceId
                ? deviceMap[alert.deviceId]?.name || "Unknown Device"
                : "N/A"
            }
            siteName={
              alert.siteId
                ? siteMap[alert.siteId]?.name || "Unknown Site"
                : "N/A"
            }
          />
        ))}
      </RuxTableBody>
    </RuxTable>
  );
};

export default AlertsList;
