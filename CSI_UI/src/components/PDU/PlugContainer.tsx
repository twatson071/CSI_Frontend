import React, { useState, useRef, useMemo } from "react";
import { RuxMonitoringIcon, RuxDialog, RuxButton } from "@astrouxds/react";
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

  // Calculate optimal grid dimensions with preference for wider layouts
  const gridDimensions = useMemo(() => {
    const outletCount = Object.keys(outlets).length;

    if (outletCount === 0) return { columns: 1, rows: 1 };
    if (outletCount === 1) return { columns: 1, rows: 1 };

    // For specific cases, force desired layouts
    if (outletCount === 8) return { columns: 4, rows: 2 };
    if (outletCount === 10) return { columns: 5, rows: 2 };
    if (outletCount === 20) return { columns: 5, rows: 4 };

    // General algorithm for other counts
    const sqrt = Math.sqrt(outletCount);
    let bestColumns = Math.ceil(sqrt);
    let bestRows = Math.ceil(outletCount / bestColumns);

    // Prefer wider layouts (more columns, fewer rows)
    for (let cols = Math.ceil(sqrt); cols <= outletCount; cols++) {
      const rows = Math.ceil(outletCount / cols);
      if (rows <= bestRows) {
        bestColumns = cols;
        bestRows = rows;
      }
      // Stop when we get to very wide layouts
      if (cols > outletCount / 2) break;
    }

    return { columns: bestColumns, rows: bestRows };
  }, [outlets]);

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
    console.log(
      `Requesting action "${action}" for outlet "${outletName}" (ID: ${outletId})`
    );
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
      <div
        className="outlets-grid"
        style={{
          gridTemplateColumns: `repeat(${gridDimensions.columns}, 1fr)`,
          gridTemplateRows: `repeat(${gridDimensions.rows}, 1fr)`,
        }}
      >
        {Object.entries(outlets).map(([outletId, outletData]) => (
          <div
            key={outletId}
            className={`outlet-card ${getIconStatus(outletData.state)}`}
          >
            {/* Status indicator with color coding */}
            <div className="outlet-header">
              <div className="status-indicator">
                <RuxMonitoringIcon
                  label={getStatusLabel(outletData.state)}
                  status={getIconStatus(outletData.state)}
                  icon="power"
                  size="large"
                />
              </div>
              <span className="outlet-name">
                {outletData.name || `Outlet ${outletId}`}
              </span>
            </div>
            <div className="outlet-controls">
              <div className="power-control">
                <RuxButton
                  className="power-toggle"
                  size="small"
                  icon={outletData.state === "normal" ? "power-off" : "power"}
                  onClick={() =>
                    outletData.state === "normal"
                      ? handlePowerAction(
                          outletId,
                          "POWER_OFF",
                          outletData.name || `Outlet ${outletId}`
                        )
                      : onOutletAction(outletId, "POWER_ON")
                  }
                  aria-label={`Toggle power for ${
                    outletData.name || `Outlet ${outletId}`
                  }`}
                  secondary={outletData.state !== "normal"}
                >
                  {outletData.state === "normal" ? "TURN OFF" : "TURN ON"}
                </RuxButton>
              </div>

              {outletData.state === "normal" && (
                <div className="secondary-actions">
                  <RuxButton
                    className="action-btn reboot"
                    size="small"
                    icon="refresh"
                    iconOnly
                    secondary
                    onClick={() =>
                      handlePowerAction(
                        outletId,
                        "REBOOT",
                        outletData.name || `Outlet ${outletId}`
                      )
                    }
                    title="Reboot outlet"
                    aria-label={`Reboot ${
                      outletData.name || `Outlet ${outletId}`
                    }`}
                  >
                    Reboot
                  </RuxButton>
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
        header={`${
          dialogState.action === "POWER_OFF" ? "Power Off" : "Reboot"
        } ?`}
        className="outlet-dialog"
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
