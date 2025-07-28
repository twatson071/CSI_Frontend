import React, { useState } from "react";
import {
  RuxContainer,
  RuxTable,
  RuxTableHeader,
  RuxTableHeaderRow,
  RuxTableHeaderCell,
  RuxTableBody,
  RuxDialog,
} from "@astrouxds/react";
import DeviceListItem, { Device } from "./DeviceListItem"; // Import Device interface
import "./DeviceStatus.css"; // Consider renaming or reviewing Watcher.css content
import { addToast } from "../../utils/toast";

// Placeholder for where you might fetch or manage device data
// For now, using sample data
const initialDevices: Device[] = [
  { id: 1, name: "Router-01", status: "normal", type: "Router" },
  { id: 2, name: "Switch-A2", status: "caution", type: "Switch" },
  { id: 3, name: "Server-Main", status: "critical", type: "Server" },
  { id: 4, name: "PDU-East-Wing", status: "off", type: "PDU" },
];

const DeviceStatus: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>(initialDevices);
  const [investigateTarget, setInvestigateTarget] = useState<Device | null>(
    null
  );

  const handleDeleteDevice = (deviceId: string | number) => {
    setDevices((prevDevices) =>
      prevDevices.filter((device) => device.id !== deviceId)
    );
    addToast("Device deleted", true, 3000, "device");
    // TODO: Add API call or other state management logic for deletion
  };

  const handleInvestigateDevice = (device: Device) => {
    setInvestigateTarget(device);
  };

  return (
    <>
      <RuxContainer className="device-status-list">
        <div slot="header">Device Status</div>
        <div className="table-wrapper">
          <RuxTable>
            <RuxTableHeader>
              <RuxTableHeaderRow>
                <RuxTableHeaderCell>Status</RuxTableHeaderCell>
                <RuxTableHeaderCell>Name</RuxTableHeaderCell>
                <RuxTableHeaderCell>Type</RuxTableHeaderCell>
                <RuxTableHeaderCell>Actions</RuxTableHeaderCell>
              </RuxTableHeaderRow>
            </RuxTableHeader>
            <RuxTableBody>
              {devices.map((device, index) => (
                <DeviceListItem
                  key={device.id}
                  device={device}
                  index={index}
                  onDelete={handleDeleteDevice}
                  onInvestigate={handleInvestigateDevice}
                />
              ))}
            </RuxTableBody>
          </RuxTable>
        </div>
      </RuxContainer>
      {investigateTarget && (
        <RuxDialog
          open
          onRuxdialogclosed={() => setInvestigateTarget(null)}
          message={`Investigating device "${investigateTarget.name}" (Type: ${investigateTarget.type})`}
          confirmText="Close"
          hideCancelBtn
        />
      )}
    </>
  );
};

export default DeviceStatus;
