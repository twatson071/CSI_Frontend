import React, { useEffect, useState, useCallback, useRef, Suspense } from "react";
import SiteEndpointsTree from "./SiteEndpointsTree";
import AddSiteEndpointForm, {
  AddSiteEndpointFormHandles,
} from "./SiteEndpointForm";
import MainContentDisplay from "./MainContentDisplay";
import DeviceForm from "../Devices/DeviceForm";
import DeviceStatusDashboard from "../Devices/DeviceStatusDashboard";
import ResizableGrid from "../common/ResizableGrid";
import {
  fetchSiteSummaries,
  fetchDevicesForSite,
  SiteWithOptionalDevices,
  SiteCreateData,
  createSite,
} from "../../services/SiteService";
import {
  PDUData,
  toggleOutletPower,
  OutletAction,
} from "../../services/PDUservice";
import { Device } from "../../services/DeviceService";
import "./SiteEndpointLayout.css";
import { RuxContainer, RuxButton, RuxIndeterminateProgress } from "@astrouxds/react";
import { useAlerts } from "../../hooks/useAlerts";

// Lazy load the EnhancedAlertsPanel
const EnhancedAlertsPanel = React.lazy(() => import("../Alerts/EnhancedAlertsPanel"));

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
  const [showDeviceStatusDashboard, setShowDeviceStatusDashboard] =
    useState(false);
  const [isLoadingDevices, setIsLoadingDevices] = useState(false);
  const [wattsData, setWattsData] = useState<{ x: string; y: number }[]>([]);
  const [ampsData, setAmpsData] = useState<{ x: string; y: number }[]>([]);
  const [showAlerts, setShowAlerts] = useState(false);
  const addSiteFormRef = useRef<AddSiteEndpointFormHandles>(null);

  // Use the alerts hook to get current alerts
  const { alerts, acknowledge, resolve, remove, bulkAcknowledge, bulkResolve, bulkDelete } = useAlerts();
  
  // Delay showing alerts to improve initial load performance
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowAlerts(true);
    }, 500); // Delay by 500ms
    
    return () => clearTimeout(timer);
  }, []);

  const updatePduDisplayCallback = useCallback(
    (siteIdxToUpdate: number, deviceIndexToUpdate: number) => {
      const site = sites[siteIdxToUpdate];
      const device = site?.devices?.[deviceIndexToUpdate];
      
      console.log('updatePduDisplayCallback - device:', device);

      if (device && device.data && (device.type === "PDU" || device.type === "UPS")) {
        const { pduData: newPduData, statuses: newStatuses } =
          extractPduDataAndStatuses(device.data);
        setPduData(newPduData);
        setStatuses(newStatuses);

        // Extract and append sensor data for chart
        const sensors = device.data.sensors;
        if (sensors && typeof sensors === "object") {
          const now = new Date().toISOString();
          const watts = Number(sensors.total_draw_w) || 0;
          const amps = Number(sensors.total_draw_a) || 0;
          setWattsData((prev) => [...prev, { x: now, y: watts }].slice(-100));
          setAmpsData((prev) => [...prev, { x: now, y: amps }].slice(-100));
        }
      } else {
        setPduData(null);
        setStatuses([]);
        setWattsData([]);
        setAmpsData([]);
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
          (updatedDevice.type === "PDU" || updatedDevice.type === "UPS")
        ) {
          const { pduData: newPduData, statuses: newStatuses } =
            extractPduDataAndStatuses(updatedDevice.data);
          setPduData(newPduData);
          setStatuses(newStatuses);
        } else if (updatedDevice) {
          // Handle non-PDU/UPS devices
          setPduData(null);
          setStatuses([]);
        }
      } catch (error) {
        console.error(`Error refreshing device data:`, error);
      }
    },
    [selectedSiteIdx, selectedDevIdx]  // Removed 'sites' from dependencies to prevent unnecessary recreations
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
      // Only update device selection if explicitly requested or if current selection is invalid
      if (selectDeviceIndexAfterLoad !== -1 && selectDeviceIndexAfterLoad < fetchedDevices.length) {
        // Explicit device selection requested
        setSelectedDevIdx(selectDeviceIndexAfterLoad);
      } else if (fetchedDevices.length === 0) {
        // No devices available
        setSelectedDevIdx(-1);
      } else if (selectedDevIdx >= fetchedDevices.length) {
        // Current selection is out of bounds
        setSelectedDevIdx(0);
      }
      // Otherwise, keep the current selectedDevIdx as it was already set in onSelect
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

    if (devIdx === -1) {
      // Site selection
      setSelectedSiteIdx(siteIdx);
      setSelectedDevIdx(-1);
      if (siteIdx !== selectedSiteIdx) {
        loadDevicesForSite(siteIdx, false, -1);
      }
    } else {
      // Device selection
      if (siteIdx !== selectedSiteIdx) {
        // Different site, need to load devices
        setSelectedSiteIdx(siteIdx);
        setSelectedDevIdx(devIdx);
        loadDevicesForSite(siteIdx, false, devIdx);
      } else {
        // Same site, just update device
        setSelectedDevIdx(devIdx);
        updatePduDisplayCallback(siteIdx, devIdx);
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
    try {
      // Call the service to actually create the site
      await createSite(newSiteData);
      setShowAddSiteModal(false);
    } catch (error) {
      console.error("Error creating site:", error);
      return;
    }

    const summaries = await fetchSiteSummaries();
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

  const handleOutletAction = async (
    outletIndex: number,
    action: OutletAction
  ) => {
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
      await toggleOutletPower(deviceArg, outletKey, action);

      await refreshSelectedDeviceData(action === "REBOOT" ? 1000 : 500);
    } catch (error) {
      console.error("Failed to toggle power:", error);
      await refreshSelectedDeviceData();
    }
  };

  const toggleAddDeviceForm = (show: boolean) => {
    setShowAddDeviceForm(show);
    if (show) {
      setShowDeviceStatusDashboard(false);
    }
  };

  const toggleDeviceStatusDashboard = (show: boolean) => {
    setShowDeviceStatusDashboard(show);
    if (show) {
      setShowAddDeviceForm(false);
    }
  };

  return (
    <div className="main-container" data-active="true">
      <ResizableGrid>
        {/* Top Left - Site Endpoints */}
        <RuxContainer className="site-endpoints">
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
          {!showAddSiteModal ? (
            <>
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
            </>
          ) : (
            <>
              <AddSiteEndpointForm ref={addSiteFormRef} />
              <div slot="footer">
                <RuxButton
                  type="button"
                  secondary
                  onClick={() => {
                    addSiteFormRef.current?.reset();
                    setShowAddSiteModal(false);
                  }}
                >
                  Cancel
                </RuxButton>
                <RuxButton
                  type="button"
                  onClick={() => {
                    const data = addSiteFormRef.current?.getFormData();
                    if (data) {
                      handleSaveSite(data);
                      addSiteFormRef.current?.reset();
                    }
                  }}
                >
                  Save
                </RuxButton>
              </div>
            </>
          )}
        </RuxContainer>

        {/* Top Right - Main Content */}
        <div>
          {showAddDeviceForm && selectedSiteObject && (
            <DeviceForm
              formId="addDeviceFormDetailed"
              siteId={selectedSiteObject.siteId}
              onCancel={() => setShowAddDeviceForm(false)}
              onSaveSuccess={handleSaveDeviceSuccess}
            />
          )}

          {showDeviceStatusDashboard && !showAddDeviceForm && (
            <DeviceStatusDashboard />
          )}

          {!showAddDeviceForm && !showDeviceStatusDashboard && (
            <MainContentDisplay
              className="pass-plan"
              selectedSite={selectedSiteObject}
              selectedDevice={selectedDeviceObject}
              pduData={pduData}
              statuses={statuses}
              handleOutletAction={handleOutletAction}
              setShowAddDeviceForm={toggleAddDeviceForm}
              isDeviceFormVisible={showAddDeviceForm}
              isLoadingDevices={isLoadingDevices}
              wattsData={wattsData}
              ampsData={ampsData}
            />
          )}
        </div>

        {/* Bottom Left - Alerts */}
        {!showAlerts ? (
          <RuxContainer className="alerts">
            <div slot="header">Alerts</div>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <p style={{ color: 'var(--color-text-secondary)' }}>Loading alerts...</p>
            </div>
          </RuxContainer>
        ) : (
          <Suspense 
            fallback={
              <RuxContainer className="alerts">
                <div slot="header">Alerts</div>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <RuxIndeterminateProgress />
                </div>
              </RuxContainer>
            }
          >
            <EnhancedAlertsPanel 
              alerts={alerts} 
              onAcknowledge={acknowledge}
              onResolve={resolve}
              onDelete={remove}
              onBulkAcknowledge={bulkAcknowledge}
              onBulkResolve={bulkResolve}
              onBulkDelete={bulkDelete}
              isLoading={false}
              enableBulkOperations={true}
              enableExport={true}
            />
          </Suspense>
        )}

        {/* Bottom Right - Device Status */}
        <DeviceStatusDashboard />
      </ResizableGrid>
    </div>
  );
};

export default SiteEndpointLayout;
