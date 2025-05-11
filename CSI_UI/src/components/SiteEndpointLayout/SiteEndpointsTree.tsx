import React from "react";
import { RuxTree, RuxTreeNode, RuxStatus } from "@astrouxds/react";
import "./SiteEndpointsTree.css";
import { SiteWithDevices } from "../../services/siteService";

interface SiteEndpointsTreeProps {
  sites: SiteWithDevices[];
  selectedSite: number;
  selectedDevice: number;
  onSelect: (siteIdx: number, devIdx: number) => void;
}

const SiteEndpointsTree: React.FC<SiteEndpointsTreeProps> = ({
  sites,
  onSelect,
}) => {
  return (
    <div className="site-endpoints-tree">
      <RuxTree>
        {sites.map((site, si) => (
          <RuxTreeNode key={site.siteId}>
            {site.siteName}
            {site.devices.map((dev, di) => {
              // grab outlets and compute statuses
              const outlets = (dev.data as any).parameters.outlets || {};
              const outletStates = Object.values(outlets).map((o) =>
                o.state === "POWER_ON" ? "normal" : "critical"
              );
              const overallStatus = outletStates.every((s) => s === "normal")
                ? "normal"
                : "critical";

              return (
                <RuxTreeNode
                  key={dev.deviceId}
                  slot="node"
                  onClick={() => onSelect(si, di)}
                >
                  {/* device‐level icon */}
                  <RuxStatus slot="prefix" status={overallStatus} />
                  {dev.name}

                  {/* per‐outlet icons */}
                  {Object.entries(outlets)
                    .sort(([a], [b]) => Number(a) - Number(b))
                    .map(([key, { state }]) => (
                      <RuxTreeNode
                        key={`${dev.deviceId}-outlet-${key}`}
                        slot="node"
                        className="outlet-node"
                      >
                        <RuxStatus
                          slot="prefix"
                          status={state === "POWER_ON" ? "normal" : "critical"}
                        />
                        {`Outlet ${key} — ${
                          state === "POWER_ON" ? "On" : "Off"
                        }`}
                      </RuxTreeNode>
                    ))}
                </RuxTreeNode>
              );
            })}
          </RuxTreeNode>
        ))}
      </RuxTree>
    </div>
  );
};

export default SiteEndpointsTree;
