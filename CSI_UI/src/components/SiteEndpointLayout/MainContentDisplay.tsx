import React from "react";
import {
  RuxContainer,
  RuxButton, // Added RuxButton
  RuxStatus,
  RuxIcon,
  RuxProgress,
  RuxIndeterminateProgress,
} from "@astrouxds/react";
import { PDUData } from "../../services/PDUservice";
import {
  SiteWithOptionalDevices,
  DeviceResponse as IDeviceResponse,
} from "../../services/siteService";
import PlugContainer, { Outlet } from "../PDU/PlugContainer";
import LoadHistoryChart from "./LoadHistoryChart";
import "./MainContentDisplay.css";

interface MainContentDisplayProps {
  className?: string;
  selectedSite?: SiteWithOptionalDevices;
  selectedDevice?: IDeviceResponse | null;
  pduData: PDUData | null;
  statuses: string[];
  handleTogglePower: (outletIndex: number) => void;
  setShowAddDeviceForm: (show: boolean) => void;
  isDeviceFormVisible: boolean;
  isLoadingDevices?: boolean;
}

const MainContentDisplay: React.FC<MainContentDisplayProps> = ({
  className,
  selectedSite,
  selectedDevice,
  pduData,
  statuses,
  handleTogglePower,
  setShowAddDeviceForm,
  isDeviceFormVisible,
  isLoadingDevices,
}) => {
  if (isLoadingDevices) {
    return (
      <RuxContainer className={className || "pass-plan"}>
        <div slot="header">{selectedSite?.siteName || "Site"}</div>
        <div className="loading-container">
          <RuxIndeterminateProgress />
          <p>Loading devices...</p>
        </div>
      </RuxContainer>
    );
  }

  if (!selectedSite) {
    return (
      <RuxContainer className={className || "pass-plan"}>
        <div slot="header">No Site Selected</div>
        <p>Please select a site from the list to view details.</p>
      </RuxContainer>
    );
  }

  const outletsForPlugContainer = statuses.reduce<Record<string, Outlet>>(
    (acc, status, index) => {
      const outletId = (index + 1).toString();
      acc[outletId] = {
        id: outletId,
        state: status,
        name: `Outlet ${outletId}`,
      };
      return acc;
    },
    {}
  );

  const handleOutletToggleWrapper = (
    outletId: string,
    currentState: string | undefined
  ) => {
    const outletIndex = parseInt(outletId, 10) - 1;
    if (!isNaN(outletIndex) && outletIndex >= 0) {
      handleTogglePower(outletIndex);
    } else {
      console.error("Invalid outletId passed to toggle handler:", outletId);
    }
  };

  return (
    <RuxContainer className={className || "pass-plan"}>
      <div slot="header" className="main-content-header">
        <span>{selectedSite.siteName}</span>
      </div>
      {!selectedDevice &&
        selectedSite.devices &&
        selectedSite.devices.length === 0 && (
          <div className="pass-plan_tree-wrapper">
            <p>This site has no devices.</p>
          </div>
        )}
      {!selectedDevice &&
        selectedSite.devices &&
        selectedSite.devices.length > 0 && (
          <p>Please select a device from this site, or add a new one.</p>
        )}
      {selectedDevice && (
        <div className="device-details-container">
          <h3>Device: {selectedDevice.name}</h3>
          <p>Type: {selectedDevice.type}</p>
          <p>
            Status:{" "}
            <RuxStatus status={(selectedDevice.status as any) || "standby"} />
          </p>
          <p>Service URL: {selectedDevice.serviceUrl}</p>
          {selectedDevice.type === "PDU" && pduData && (
            <div className="pdu-container">
              <h4>PDU Outlets:</h4>
              <PlugContainer
                outlets={outletsForPlugContainer}
                onToggleOutlet={handleOutletToggleWrapper}
              />
            </div>
          )}
          {selectedDevice.type === "PDU" && !pduData && (
            <p>PDU data is being loaded or is not available.</p>
          )}
          {selectedDevice.type !== "PDU" && (
            <div>
              <h4>Device Details:</h4>
              <p>
                Additional information for non-PDU devices can be displayed
                here.
              </p>
            </div>
          )}
        </div>
      )}
      <div slot="footer">
        <RuxButton onClick={() => setShowAddDeviceForm(!isDeviceFormVisible)}>
          Add Device
        </RuxButton>
      </div>
    </RuxContainer>
  );
};

export default MainContentDisplay;
