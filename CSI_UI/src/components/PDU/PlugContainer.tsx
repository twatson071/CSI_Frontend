import React from "react";
import { RuxMonitoringIcon } from "@astrouxds/react";
import "./PlugContainer.css";

export interface Outlet {
  id: string; // Outlet identifier (e.g., "1", "A1", "Output 1")
  state?: string; // e.g., "ON", "OFF", "NORMAL", "UNKNOWN"
  name?: string; // Optional display name for the outlet
}

interface PlugContainerProps {
  outlets: Record<string, Outlet>;
  onToggleOutlet: (outletId: string, currentState: string | undefined) => void;
}

const PlugContainer: React.FC<PlugContainerProps> = ({
  outlets = {},
  onToggleOutlet,
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
            <RuxMonitoringIcon
              status={getIconStatus(outletData.state)}
              icon="power"
              label={outletData.name || `Outlet ${outletId}`}
              onClick={() => onToggleOutlet(outletId, outletData.state)}
              title={`Toggle ${outletData.name || `Outlet ${outletId}`}`}
            />
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
