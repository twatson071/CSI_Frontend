import React from "react";
import {
  RuxMonitoringIcon,
  RuxPopUp,
  RuxMenu,
  RuxMenuItem,
} from "@astrouxds/react";
import { OutletAction } from "../../services/PDUservice";
import "./PlugContainer.css";

export interface Outlet {
  id: string; // Outlet identifier (e.g., "1", "A1", "Output 1")
  state?: string; // e.g., "ON", "OFF", "NORMAL", "UNKNOWN"
  name?: string; // Optional display name for the outlet
}

interface PlugContainerProps {
  outlets: Record<string, Outlet>;
  onOutletAction: (outletId: string, action: OutletAction) => void;
}

const PlugContainer: React.FC<PlugContainerProps> = ({
  outlets = {},
  onOutletAction,
}) => {
  const getIconStatus = (
    outletState: string | undefined
  ): "normal" | "off" | "standby" | "critical" | undefined => {
    if (!outletState || outletState.trim() === "") {
      return "off";
    }
    const lowerState = outletState.trim().toLowerCase();
    if (
      lowerState === "on" ||
      lowerState === "normal" ||
      lowerState === "power_on"
    ) {
      return "normal";
    }
    if (lowerState === "off" || lowerState === "power_off") {
      return "off";
    }
    if (lowerState === "standby") {
      return "standby";
    }

    if (
      lowerState.includes("error") ||
      lowerState.includes("critical") ||
      lowerState.includes("fault")
    ) {
      return "critical";
    }

    return "standby";
  };

  const getStatusLabel = (outletState: string | undefined): string => {
    if (!outletState || outletState.trim() === "") {
      return "UNKNOWN";
    }
    const lowerState = outletState.trim().toLowerCase();

    if (
      lowerState === "on" ||
      lowerState === "normal" ||
      lowerState === "power_on"
    )
      return "ON";
    if (lowerState === "off" || lowerState === "power_off") return "OFF";

    return outletState.toUpperCase(); // Show other states as is
  };

  return (
    <div className="plug-container">
      <div className="plug-row">
        {Object.entries(outlets).map(([outletId, outletData]) => (
          <div key={outletId} className="plug-item">
            <RuxPopUp placement="bottom" closeOnSelect>
              <RuxMonitoringIcon
                status={getIconStatus(outletData.state)}
                icon="power"
                label={outletData.name || `Outlet ${outletId}`}
                slot="trigger"
                title={`Control ${outletData.name || `Outlet ${outletId}`}`}
              />
              <RuxMenu
                onRuxmenuselected={(e) => {
                  const val = e.detail.value as string;
                  let action: OutletAction | null = null;
                  if (val === "on") action = "POWER_ON";
                  else if (val === "off") action = "POWER_OFF";
                  else if (val === "reboot") action = "REBOOT";
                  if (action) {
                    if (
                      action === "POWER_OFF" &&
                      !window.confirm(
                        `Are you sure you want to power off ${
                          outletData.name || `Outlet ${outletId}`
                        }?`
                      )
                    ) {
                      return;
                    }
                    onOutletAction(outletId, action);
                  }
                }}
              >
                <RuxMenuItem value="on">Power On</RuxMenuItem>
                <RuxMenuItem value="off">Power Off</RuxMenuItem>
                <RuxMenuItem value="reboot">Reboot</RuxMenuItem>
              </RuxMenu>
            </RuxPopUp>
            <span className="plug-label">
              {getStatusLabel(outletData.state)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlugContainer;
