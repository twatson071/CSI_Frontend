import React, { useState, useRef } from "react";
import {
  RuxMonitoringIcon,
  RuxDialog,
  RuxButton,
} from "@astrouxds/react";
import { RuxDialogCustomEvent } from "@astrouxds/astro-web-components";
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
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    outletId: string;
    action: OutletAction | null;
    outletName: string;
  }>({
    isOpen: false,
    outletId: "",
    action: null,
    outletName: "",
  });
  const dialogRef = useRef<HTMLRuxDialogElement>(null);

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

  const handleConfirmAction = () => {
    if (dialogState.action && dialogState.outletId) {
      onOutletAction(dialogState.outletId, dialogState.action);
    }
    setDialogState({
      isOpen: false,
      outletId: "",
      action: null,
      outletName: "",
    });
  };

  const handleCancelAction = () => {
    setDialogState({
      isOpen: false,
      outletId: "",
      action: null,
      outletName: "",
    });
  };

  const handlePowerAction = (
    outletId: string,
    action: OutletAction,
    outletName: string
  ) => {
    setDialogState({
      isOpen: true,
      outletId,
      action,
      outletName,
    });
    if (dialogRef.current) {
      dialogRef.current.open = true;
    }
  };

  return (
    <div className="plug-container-enhanced">
      <div className="outlets-grid">
        {Object.entries(outlets).map(([outletId, outletData]) => (
          <div
            key={outletId}
            className={`outlet-card ${getIconStatus(outletData.state)}`}
          >
            {/* Status indicator with color coding */}
            <div className="outlet-header">
              <div className="status-indicator">
                <RuxMonitoringIcon
                  status={getIconStatus(outletData.state)}
                  icon="power"
                  size="large"
                />
                <span className="status-badge">
                  {getStatusLabel(outletData.state)}
                </span>
              </div>
              <span className="outlet-name">
                {outletData.name || `Outlet ${outletId}`}
              </span>
            </div>

            {/* Improved controls */}
            <div className="outlet-controls">
              {/* Primary power toggle */}
              <div className="power-control">
                <RuxButton
                  className="power-toggle"
                  size="small"
                  icon={outletData.state === "on" ? "power" : "power-off"}
                  onClick={() =>
                    outletData.state === "on"
                      ? handlePowerAction(
                          outletId,
                          "POWER_OFF",
                          outletData.name
                        )
                      : onOutletAction(outletId, "POWER_ON")
                  }
                  aria-label={`Toggle power for ${
                    outletData.name || `Outlet ${outletId}`
                  }`}
                  secondary={outletData.state !== "on"}
                >
                  {outletData.state === "on" ? "ON" : "OFF"}
                </RuxButton>
              </div>

              {/* Secondary actions - only show when outlet is on */}
              {outletData.state === "on" && (
                <div className="secondary-actions">
                  <RuxButton
                    className="action-btn reboot"
                    size="small"
                    icon="refresh"
                    iconOnly
                    borderless
                    onClick={() =>
                      handlePowerAction(outletId, "REBOOT", outletData.name)
                    }
                    title="Reboot outlet"
                  />
                </div>
              )}
            </div>

            {/* Power consumption or additional info */}
            <div className="outlet-info">
              <small>Load: {outletData.load || "N/A"}</small>
            </div>
          </div>
        ))}
      </div>

      <RuxDialog
        ref={dialogRef}
        open={dialogState.isOpen}
        confirmText={`Yes, ${
          dialogState.action === "POWER_OFF" ? "Power Off" : "Reboot"
        }`}
        denyText="Cancel"
        message={`Are you sure you want to ${
          dialogState.action === "POWER_OFF" ? "power off" : "reboot"
        } "${dialogState.outletName}"?`}
        onRuxdialogclosed={(e: RuxDialogCustomEvent<boolean | null>) => {
          if (e.detail) {
            handleConfirmAction();
          } else {
            handleCancelAction();
          }
        }}
      />
    </div>
  );
};

export default PlugContainer;
