import React, { useEffect, useState, useCallback } from "react";
import SiteEndpointsTree from "./SiteEndpointsTree";
import AddSiteEndpointForm from "./SiteEndpointForm";
import MainContentDisplay from "./MainContentDisplay";
import DeviceForm from "../Devices/DeviceForm";
import {
  fetchSiteSummaries,
  fetchDevicesForSite,
  SiteWithOptionalDevices,
  SiteCreateData,
} from "../../services/siteService";
import { PDUData, toggleOutletPower } from "../../services/PDUservice";
import { Device } from "../../services/DeviceService";
import "./SiteEndpointLayout.css";
import { RuxContainer, RuxButton } from "@astrouxds/react";

const extractPduDataAndStatuses = (
  deviceData: any
): { pduData: PDUData | null; statuses: string[] } => {
  if (
    !deviceData ||
    typeof deviceData !== "object" ||
    !deviceData.parameters ||
    typeof deviceData.parameters !== "object"
  ) {
    return { pduData: null, statuses: [] };
  }

  const rawPduParameters = deviceData.parameters;
  const rawOutletsFromApi: Record<string, any> | undefined | null =
    rawPduParameters.outlets;

  if (
    !rawOutletsFromApi ||
    typeof rawOutletsFromApi !== "object" ||
    rawOutletsFromApi === null
  ) {
    const pduShell: PDUData = {
      ...(rawPduParameters as Omit<PDUData, "outlets">),
      outlets: {},
    };
    return { pduData: pduShell, statuses: [] };
  }

  const normalizedOutlets: Record<string, { state?: string }> = {};
  const uiStatuses: string[] = [];

  const outletKeys = Object.keys(rawOutletsFromApi).sort();

  for (const key of outletKeys) {
    const rawOutletValue = rawOutletsFromApi[key];
    let actualState: string | undefined = undefined;

    if (typeof rawOutletValue === "string") {
      actualState = rawOutletValue;
      normalizedOutlets[key] = { state: actualState };
    } else if (
      typeof rawOutletValue === "object" &&
      rawOutletValue !== null &&
      typeof rawOutletValue.state === "string"
    ) {
      actualState = rawOutletValue.state;
      normalizedOutlets[key] = { state: actualState };
    } else if (typeof rawOutletValue === "object" && rawOutletValue !== null) {
      normalizedOutlets[key] = { state: undefined };
    } else {
      normalizedOutlets[key] = { state: undefined };
    }
    if (actualState === "POWER_ON") {
      uiStatuses.push("normal");
    } else if (actualState === "POWER_OFF") {
      uiStatuses.push("off");
    } else {
      uiStatuses.push("off");
    }
  }

  const finalPduData: PDUData = {
    ...(rawPduParameters as PDUData),
    outlets: normalizedOutlets,
  };

  return { pduData: finalPduData, statuses: uiStatuses };
};

const SiteEndpointLayout: React.FC = () => {
  const [sites, setSites] = useState<SiteWithOptionalDevices[]>([]);
  const [selectedSiteIdx, setSelectedSiteIdx] = useState<number>(-1);
  const [selectedDevIdx, setSelectedDevIdx] = useState<number>(-1);
  const [pduData, setPduData] = useState<PDUData | null>(null);
  const [statuses, setStatuses] = useState<string[]>([]);
  const [showAddSiteModal, setShowAddSiteModal] = useState(false);
  const [showAddDeviceForm, setShowAddDeviceForm] = useState(false);
  const [isLoadingDevices, setIsLoadingDevices] = useState(false);

  const updatePduDisplayCallback = useCallback(
    (siteIdxToUpdate: number, deviceIndexToUpdate: number) => {
      const site = sites[siteIdxToUpdate];
      const device = site?.devices?.[deviceIndexToUpdate];

      if (device && device.data && device.type === "PDU") {
        const { pduData: newPduData, statuses: newStatuses } =
          extractPduDataAndStatuses(device.data);
        setPduData(newPduData);
        setStatuses(newStatuses);
      } else {
        setPduData(null);
        setStatuses([]);
      }
    },
    [sites]
  );

  const refreshSelectedDeviceData = useCallback(
    async (delayMs: number = 0) => {
      if (selectedSiteIdx === -1 || selectedDevIdx === -1) return;

      const site = sites[selectedSiteIdx];
      if (!site) return;

      if (delayMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }

      try {
        const fetchedDevices = await fetchDevicesForSite(site.siteId);
        setSites((prevSites) =>
          prevSites.map((s, idx) =>
            idx === selectedSiteIdx
              ? { ...s, devices: fetchedDevices, devicesLoaded: true }
              : s
          )
        );

        const updatedDevice = fetchedDevices[selectedDevIdx];
        if (
          updatedDevice &&
          updatedDevice.data &&
          updatedDevice.type === "PDU"
        ) {
          const { pduData: newPduData, statuses: newStatuses } =
            extractPduDataAndStatuses(updatedDevice.data);
          setPduData(newPduData);
          setStatuses(newStatuses);
        } else if (updatedDevice) {
          // Handle non-PDU devices or PDU devices without data
          setPduData(null);
          setStatuses([]);
        }
      } catch (error) {
        console.error(`Error refreshing device data:`, error);
      }
    },
    [selectedSiteIdx, selectedDevIdx, sites]
  );

  useEffect(() => {
    const loadSiteSummaries = async () => {
      try {
        const summaries = await fetchSiteSummaries();
        const sitesWithEmptyDevices: SiteWithOptionalDevices[] = summaries.map(
          (summary) => ({
            ...summary,
            devices: [],
            devicesLoaded: false,
          })
        );
        setSites(sitesWithEmptyDevices);

        if (sitesWithEmptyDevices.length > 0) {
          setSelectedSiteIdx(0);

          const loadAllSites = async () => {
            try {
              const siteDevicesPromises = sitesWithEmptyDevices.map((site) =>
                fetchDevicesForSite(site.siteId)
              );

              const allSitesDevices = await Promise.all(siteDevicesPromises);
              setSites((prev) =>
                prev.map((site, idx) => ({
                  ...site,
                  devices: allSitesDevices[idx] || [],
                  devicesLoaded: true,
                }))
              );
            } catch (error) {
              console.error("Error loading devices for all sites:", error);
            }
          };

          loadAllSites();
          loadDevicesForSite(0);
        }
      } catch (error) {
        console.error("Error fetching site summaries:", error);
      }
    };
    loadSiteSummaries();
  }, []);

  const loadDevicesForSite = async (
    siteIdxToLoad: number,
    forceReload: boolean = false,
    selectDeviceIndexAfterLoad: number = -1
  ) => {
    if (siteIdxToLoad < 0 || siteIdxToLoad >= sites.length) return;
    const site = sites[siteIdxToLoad];
    if (!site) return;
    if (site.devicesLoaded && !forceReload) {
      return;
    }
    setIsLoadingDevices(true);
    try {
      const fetchedDevices = await fetchDevicesForSite(site.siteId);
      setSites((prevSites) =>
        prevSites.map((s, idx) =>
          idx === siteIdxToLoad
            ? { ...s, devices: fetchedDevices, devicesLoaded: true }
            : s
        )
      );
      let newSelectedDevIdx = selectedDevIdx;
      if (
        selectDeviceIndexAfterLoad !== -1 &&
        selectDeviceIndexAfterLoad < fetchedDevices.length
      ) {
        newSelectedDevIdx = selectDeviceIndexAfterLoad;
      } else if (
        fetchedDevices.length > 0 &&
        (selectedDevIdx === -1 || selectedDevIdx >= fetchedDevices.length)
      ) {
        newSelectedDevIdx = 0;
      }

      if (fetchedDevices.length === 0) {
        newSelectedDevIdx = -1;
      }

      setSelectedDevIdx(newSelectedDevIdx);
    } catch (error) {
      console.error(`Error fetching devices for site ${site.siteId}:`, error);
      setSites((prevSites) =>
        prevSites.map((s, idx) =>
          idx === siteIdxToLoad ? { ...s, devicesLoaded: false } : s
        )
      );
    } finally {
      setIsLoadingDevices(false);
    }
  };

  const onSelect = (siteIdx: number, devIdx: number) => {
    setShowAddDeviceForm(false);

    if (selectedSiteIdx !== siteIdx) {
      setSelectedSiteIdx(siteIdx);
      setSelectedDevIdx(devIdx);
      loadDevicesForSite(siteIdx, false, devIdx);
    } else if (selectedDevIdx !== devIdx) {
      setSelectedDevIdx(devIdx);
      if (devIdx !== -1) {
        refreshSelectedDeviceData();
      }
    }
  };

  useEffect(() => {
    if (selectedSiteIdx !== -1 && selectedDevIdx !== -1) {
      updatePduDisplayCallback(selectedSiteIdx, selectedDevIdx);
    } else {
      setPduData(null);
      setStatuses([]);
    }
  }, [selectedSiteIdx, selectedDevIdx, sites, updatePduDisplayCallback]);

  const handleSaveSite = async (newSiteData: SiteCreateData) => {
    setShowAddSiteModal(false);

    const summaries = await fetchSiteSummaries().interval(5000);
    const sitesWithEmptyDevices: SiteWithOptionalDevices[] = summaries.map(
      (summary) => ({ ...summary, devices: [], devicesLoaded: false })
    );
    setSites(sitesWithEmptyDevices);
  };

  const handleSaveDeviceSuccess = async () => {
    setShowAddDeviceForm(false);
    if (selectedSiteIdx !== -1) {
      const currentSite = sites[selectedSiteIdx];
      const previousDeviceCount = currentSite?.devices?.length || 0;
      await loadDevicesForSite(selectedSiteIdx, true, previousDeviceCount);
    }
  };

  const selectedSiteObject =
    selectedSiteIdx !== -1 ? sites[selectedSiteIdx] : undefined;
  const selectedDeviceObject =
    selectedSiteObject?.devices?.[selectedDevIdx] || null;

  const handleTogglePower = async (outletIndex: number) => {
    if (
      !selectedSiteObject ||
      !selectedDeviceObject ||
      selectedDeviceObject.type !== "PDU" ||
      !pduData ||
      !pduData.outlets
    ) {
      console.error(
        "Cannot toggle power: No PDU selected or PDU data missing."
      );
      return;
    }

    const outletKey = (outletIndex + 1).toString();
    const currentOutlet = pduData.outlets[outletKey];

    if (!currentOutlet) {
      console.error(`Outlet ${outletKey} not found in PDU data.`);
      return;
    }

    const currentStatus = currentOutlet.state;
    const newStatus = currentStatus === "POWER_ON" ? "POWER_OFF" : "POWER_ON";

    const deviceArg: Device = {
      id: selectedDeviceObject.deviceId,
      name: selectedDeviceObject.name,
      type: selectedDeviceObject.type,
      serviceUrl: selectedDeviceObject.serviceUrl,
      siteId: selectedSiteObject.siteId,
      parameters: selectedDeviceObject.data?.parameters || null,
      data: selectedDeviceObject.data || null,
      ipAddress: null,
      status: selectedDeviceObject.status,
    };

    try {
      await toggleOutletPower(deviceArg, outletKey, newStatus);

      await refreshSelectedDeviceData(500);
    } catch (error) {
      console.error("Failed to toggle power:", error);
      await refreshSelectedDeviceData();
    }
  };

  return (
    <div className="main-container" data-active="true">
      <RuxContainer className="alerts">
        <div
          slot="header"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>Site Endpoints</span>
        </div>
        <SiteEndpointsTree
          sites={sites}
          selectedSite={selectedSiteIdx}
          selectedDevice={selectedDevIdx}
          onSelect={onSelect}
        />
        <div slot="footer">
          <RuxButton onClick={() => setShowAddSiteModal(true)}>
            Add Site
          </RuxButton>
        </div>
      </RuxContainer>

      {showAddSiteModal && (
        <AddSiteEndpointForm
          open={showAddSiteModal}
          onSave={handleSaveSite}
          onCancel={() => setShowAddSiteModal(false)}
          onRuxclosed={() => setShowAddSiteModal(false)}
        />
      )}

      <MainContentDisplay
        className="pass-plan"
        selectedSite={selectedSiteObject}
        selectedDevice={selectedDeviceObject}
        pduData={pduData}
        statuses={statuses}
        handleTogglePower={handleTogglePower}
        setShowAddDeviceForm={setShowAddDeviceForm}
        isDeviceFormVisible={showAddDeviceForm}
        isLoadingDevices={isLoadingDevices}
      />

      {showAddDeviceForm && selectedSiteObject && (
        <DeviceForm
          formId="addDeviceFormDetailed"
          siteId={selectedSiteObject.siteId}
          onCancel={() => setShowAddDeviceForm(false)}
          onSaveSuccess={handleSaveDeviceSuccess}
        />
      )}

      {/* Placeholder for other grid items if they are direct children of main-container */}
      {/* e.g., <RuxContainer className="link-status">Link Status</RuxContainer> */}
      {/* <RuxContainer className="subsystems">Subsystems</RuxContainer> */}
      {/* <RuxContainer className="watcher">Watcher</RuxContainer> */}
      {/* <RuxContainer className="mnemonics">Mnemonics</RuxContainer> */}
    </div>
  );
};

export default SiteEndpointLayout;
