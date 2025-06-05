import React, { useEffect, useState } from "react";
import {
  RuxContainer,
  RuxButton,
  RuxIndeterminateProgress,
} from "@astrouxds/react";
import { PDUData } from "../../services/PDUservice";
import {
  SiteWithOptionalDevices,
  DeviceResponse as IDeviceResponse,
} from "../../services/SiteService";
import PlugContainer, { Outlet } from "../PDU/PlugContainer";
import LoadHistoryChart from "./LoadHistoryChart";
import { fetchDeviceMetrics } from "../../services/DeviceService";
import { fetchServerData, ServerData } from "../../services/ServerService";
import ServerDetails from "../Server/ServerDetails";
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
  wattsData?: { x: string; y: number }[];
  ampsData?: { x: string; y: number }[];
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
  wattsData: initialWattsData,
  ampsData: initialAmpsData,
}) => {
  const [wattsData, setWattsData] = useState<{ x: string; y: number }[]>(
    initialWattsData || []
  );
  const [ampsData, setAmpsData] = useState<{ x: string; y: number }[]>(
    initialAmpsData || []
  );
  const [serverData, setServerData] = useState<ServerData | null>(null);

  useEffect(() => {
    if (selectedDevice) {
      fetchDeviceMetrics(selectedDevice.deviceId).then((metrics) => {
        // Separate watts and amps for charting
        const wattsData = metrics
          .filter((m) => m.metricType === "watts")
          .map((m) => ({ x: m.createdAt, y: m.value }));
        const ampsData = metrics
          .filter((m) => m.metricType === "amps")
          .map((m) => ({ x: m.createdAt, y: m.value }));
        setWattsData(wattsData);
        setAmpsData(ampsData);
      });
    }
  }, [selectedDevice]);

  useEffect(() => {
    let intervalId: number | undefined;

    const fetchAndSet = () =>
      fetchServerData()
        .then((data) => setServerData(data))
        .catch((err) => {
          console.error("Failed to fetch server data", err);
          setServerData(null);
        });

    if (selectedDevice && selectedDevice.type === "Server") {
      fetchAndSet();
      intervalId = window.setInterval(fetchAndSet, 30000);
    } else {
      setServerData(null);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [selectedDevice]);

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

  const renderDeviceDetails = () => {
    if (!selectedDevice) return null;

    switch (selectedDevice.type) {
      case "PDU":
        if (pduData) {
          return (
            <div className="pdu-container">
              <PlugContainer
                outlets={outletsForPlugContainer}
                onToggleOutlet={handleOutletToggleWrapper}
              />
              <LoadHistoryChart
                wattsData={wattsData}
                ampsData={ampsData}
              />
            </div>
          );
        } else {
          return (
            <div className="pass-plan_tree-wrapper">
              <p>PDU data is being loaded or is not available.</p>
            </div>
          );
        }
      case "Server":
        if (serverData) {
          return <ServerDetails server={serverData} />;
        }
      // fall through to default if no serverData
      default:
        return (
          <div className="pass-plan_tree-wrapper">
            <h4>Device Details:</h4>
            <p>
              Additional information for non-PDU devices can be displayed here.
            </p>
          </div>
        );
    }
  };

  return (
    <div className={`${className || "pass-plan"} main-content-wrapper`}>
      <RuxContainer>
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
            <div className="pass-plan_tree-wrapper">
              <p>Please select a device from this site, or add a new one.</p>
            </div>
          )}
        {selectedDevice && (
          <div className="device-details-container">
            {renderDeviceDetails()}
          </div>
        )}
        <div slot="footer">
          <RuxButton onClick={() => setShowAddDeviceForm(!isDeviceFormVisible)}>
            Add Device
          </RuxButton>
        </div>
      </RuxContainer>
    </div>
  );
};

export default MainContentDisplay;
