import React from "react";
import { RuxDialog, RuxStatus } from "@astrouxds/react";
import type { Device } from "../../services/DeviceService";
import { mapDeviceStatus } from "../../utils/deviceStatusUtils";

interface DeviceDetailsDialogProps {
  device: Device | null;
  onClose: () => void;
}

const DeviceDetailsDialog: React.FC<DeviceDetailsDialogProps> = ({ device, onClose }) => {
  if (!device) return null;

  return (
    <RuxDialog
      open
      onRuxdialogclosed={onClose}
      confirmText="Close"
      style={{ maxWidth: "400px" }}
    >
      <div slot="header">{device.name}</div>
      <div className="device-details-dialog-content">
        <p><strong>Type:</strong> {device.type}</p>
        <p>
          <strong>Status:</strong> <RuxStatus status={mapDeviceStatus(device.status)} />
        </p>
        {device.ipAddress && <p><strong>IP:</strong> {device.ipAddress}</p>}
        {device.lastSeen && (
          <p>
            <strong>Last Seen:</strong> {new Date(device.lastSeen).toLocaleString()}
          </p>
        )}
      </div>
    </RuxDialog>
  );
};

export default DeviceDetailsDialog;
