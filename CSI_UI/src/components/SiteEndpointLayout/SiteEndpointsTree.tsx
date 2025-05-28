import React from "react";
import { RuxTree, RuxTreeNode, RuxStatus } from "@astrouxds/react";
import "./SiteEndpointsTree.css";
// Assuming SiteWithOptionalDevices and DeviceResponse are the correct types from siteService
import {
  SiteWithOptionalDevices,
  DeviceResponse as Device,
} from "../../services/siteService";

// Define DeviceStatus type alias
type DeviceStatus =
  | "critical"
  | "serious"
  | "caution"
  | "normal"
  | "standby"
  | "off";

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
    const selectedNodeElement = e.currentTarget as HTMLElement | null;
    if (selectedNodeElement) {
      const siteIdxStr = selectedNodeElement.dataset.siteIndex;
      const deviceIndexStr = selectedNodeElement.dataset.deviceIndex;
      if (siteIdxStr !== undefined) {
        const siteIdx = parseInt(siteIdxStr, 10);
        if (isNaN(siteIdx)) return;
        if (deviceIndexStr !== undefined) {
          const devIdx = parseInt(deviceIndexStr, 10);
          if (!isNaN(devIdx)) {
            onSelect(siteIdx, devIdx);
          }
        } else {
          onSelect(siteIdx, -1);
        }
      }
    }
  };

  return (
    <div className="site-endpoints-tree">
      <RuxTree>
        {sites.map((site, si) => {
          const deviceStatusesForSite: DeviceStatus[] =
            site.devices?.map((dev: Device): DeviceStatus => {
              if (dev.type === "PDU" && dev.data?.parameters?.outlets) {
                const outlets = dev.data.parameters.outlets as Record<
                  string,
                  { state: string }
                >;
                const outletStatesNormal = Object.values(outlets).every(
                  (o) => o.state === "POWER_ON"
                );
                return outletStatesNormal ? "normal" : "critical";
              }
              return (dev.status as DeviceStatus) || "standby";
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
                  let currentDeviceDisplayStatus: DeviceStatus;
                  if (dev.type === "PDU" && dev.data?.parameters?.outlets) {
                    const outlets = dev.data.parameters.outlets as Record<
                      string,
                      { state: string }
                    >;
                    const outletStatesNormal = Object.values(outlets).every(
                      (o) => o.state === "POWER_ON"
                    );
                    currentDeviceDisplayStatus = outletStatesNormal
                      ? "normal"
                      : "critical";
                  } else {
                    currentDeviceDisplayStatus =
                      (dev.status as DeviceStatus) || "standby";
                  }

                  return (
                    <RuxTreeNode
                      onRuxtreenodeselected={handleNodeSelected}
                      key={dev.deviceId}
                      id={`site-${site.siteId}-device-${dev.deviceId}`}
                      slot="node"
                      data-site-index={si.toString()}
                      data-device-index={di.toString()}
                      // A device node is selected if its site's index matches AND its own index matches
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
                            { state: string; list_id?: string } // Added list_id for better display
                          >
                        )
                          .sort(([keyA], [keyB]) => Number(keyA) - Number(keyB)) // Sort by outlet number
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
