import React from "react";
import { RuxTree, RuxTreeNode, RuxStatus } from "@astrouxds/react";
import "./SiteEndpointsTree.css";
// Assuming SiteWithOptionalDevices and DeviceResponse are the correct types from siteService
import {
  SiteWithOptionalDevices,
  DeviceResponse as Device,
} from "../../services/SiteService";

// Define DeviceStatus type alias
type DeviceStatus =
  | "critical"
  | "serious"
  | "caution"
  | "normal"
  | "standby"
  | "off";

const mapStatus = (
  status: string | undefined
): "normal" | "critical" | "caution" | "serious" | "off" | "standby" => {
  if (!status) return "off";
  const lowerStatus = status.toLowerCase();
  switch (lowerStatus) {
    case "normal":
    case "online":
      return "normal";
    case "critical":
      return "critical";
    case "caution":
      return "caution";
    case "serious":
      return "serious";
    case "standby":
      return "standby";
    case "off":
    case "offline":
      return "off";
    default:
      return "normal";
  }
};

interface SiteEndpointsTreeProps {
  sites: SiteWithOptionalDevices[];
  selectedSite: number;
  selectedDevice: number;
  onSelect: (siteIdx: number, devIdx: number) => void;
}

const getAggregatedStatus = (statuses: DeviceStatus[]): DeviceStatus => {
  if (!statuses || statuses.length === 0) {
    return "normal";
  }

  const statusPriority: Record<DeviceStatus, number> = {
    critical: 1,
    serious: 2,
    caution: 3,
    standby: 4,
    normal: 5,
    off: 6,
  };

  let mostSevereStatus: DeviceStatus = "off";
  for (const status of statuses) {
    if (statusPriority[status] < statusPriority[mostSevereStatus]) {
      mostSevereStatus = status;
    }
  }
  return mostSevereStatus;
};

const SiteEndpointsTree: React.FC<SiteEndpointsTreeProps> = ({
  sites,
  onSelect,
  selectedSite,
  selectedDevice,
}) => {
  const handleNodeSelected = (e: any) => {
    const el = e.currentTarget as HTMLElement | null;
    if (!el) return;

    const siteIdxStr = el.dataset.siteIndex;
    const deviceIndexStr = el.dataset.deviceIndex;

    if (siteIdxStr === undefined) return;
    const siteIdx = parseInt(siteIdxStr, 10);
    if (isNaN(siteIdx)) return;
    if (deviceIndexStr !== undefined) {
      const devIdx = parseInt(deviceIndexStr, 10);
      if (isNaN(devIdx)) return;
      // Always select the device directly, regardless of current site
      onSelect(siteIdx, devIdx);
    } else {
      onSelect(siteIdx, -1);
    }
  };

  return (
    <div className="site-endpoints-tree">
      <RuxTree>
        {sites.map((site, si) => {
          const deviceStatusesForSite: DeviceStatus[] =
            site.devices?.map((dev: Device): DeviceStatus => {
              return mapStatus(dev.status);
            }) || [];

          const siteOverallStatus = getAggregatedStatus(deviceStatusesForSite);

          return (
            <RuxTreeNode
              onRuxtreenodeselected={handleNodeSelected}
              key={site.siteId}
              id={`site-node-${site.siteId}`}
              data-site-index={si.toString()}
              selected={si === selectedSite && selectedDevice === -1}
            >
              <RuxStatus slot="prefix" status={siteOverallStatus} />
              {site.siteName}
              {site.devicesLoaded &&
                site.devices && // Check if devices are loaded
                site.devices.length > 0 &&
                site.devices.map((dev, di) => {
                  const currentDeviceDisplayStatus = mapStatus(dev.status);

                  return (
                    <RuxTreeNode
                      onRuxtreenodeselected={handleNodeSelected}
                      key={dev.deviceId}
                      id={`site-${site.siteId}-device-${dev.deviceId}`}
                      slot="node"
                      data-site-index={si.toString()}
                      data-device-index={di.toString()}
                      selected={si === selectedSite && di === selectedDevice}
                    >
                      <RuxStatus
                        slot="prefix"
                        status={currentDeviceDisplayStatus}
                      />
                      {dev.name} {dev.type}
                      {dev.type === "PDU" &&
                        dev.data?.parameters?.outlets &&
                        Object.entries(
                          dev.data.parameters.outlets as Record<
                            string,
                            { state: string; list_id?: string }
                          >
                        )
                          .sort(([keyA], [keyB]) => Number(keyA) - Number(keyB))
                          .map(([key, outletData]) => (
                            <RuxTreeNode
                              key={`${dev.deviceId}-outlet-${key}`}
                              id={`site-${site.siteId}-device-${dev.deviceId}-outlet-${key}`}
                              slot="node"
                              className="outlet-node"
                            >
                              <RuxStatus
                                slot="prefix"
                                status={
                                  outletData.state === "POWER_ON"
                                    ? "normal"
                                    : "critical"
                                }
                              />
                              {`Outlet ${key}`}
                              {" | "}
                              {outletData.state === "POWER_ON"
                                ? "Power On"
                                : "Power Off"}
                            </RuxTreeNode>
                          ))}
                    </RuxTreeNode>
                  );
                })}
            </RuxTreeNode>
          );
        })}
      </RuxTree>
    </div>
  );
};

export default SiteEndpointsTree;
