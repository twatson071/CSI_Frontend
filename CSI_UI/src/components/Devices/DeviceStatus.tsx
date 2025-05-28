import React, { useEffect, useState } from "react";
import { faker } from "@faker-js/faker";
import {
  RuxContainer,
  RuxTable,
  RuxTableHeader,
  RuxTableHeaderRow,
  RuxTableHeaderCell,
  RuxTableBody,
} from "@astrouxds/react";
import DeviceListItem, { Device } from "./DeviceListItem"; // Import Device interface
import "./DeviceStatus.css"; // Consider renaming or reviewing Watcher.css content

// Placeholder for where you might fetch or manage device data
// For now, using sample data
const initialDevices: Device[] = [
  { id: 1, name: "Router-01", status: "normal", type: "Router" },
  { id: 2, name: "Switch-A2", status: "caution", type: "Switch" },
  { id: 3, name: "Server-Main", status: "critical", type: "Server" },
  { id: 4, name: "PDU-East-Wing", status: "off", type: "PDU" },
];

const generateMnemonicValue = () =>
  faker.number.float({ max: 110, multipleOf: 0.1 });

const generateChartData = () =>
  faker.helpers.multiple(() => generateMnemonicValue(), { count: 9 });

const DeviceStatus: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>(initialDevices);

  const handleDeleteDevice = (deviceId: string | number) => {
    setDevices((prevDevices) =>
      prevDevices.filter((device) => device.id !== deviceId)
    );
    // TODO: Add API call or other state management logic for deletion
  };

  const handleInvestigateDevice = (device: Device) => {
    // TODO: Implement investigation logic (e.g., navigate, show modal)
  };

  useEffect(() => {
    const deviceStatusDiv = document.querySelector(".device-status-list");
    const tableRows = deviceStatusDiv?.querySelectorAll("rux-table-row");

    tableRows?.forEach((row) => {
      // Example: Add click listener if needed, or remove this if not
      // row.addEventListener('click', (event) => console.log('Row clicked', event.target));
    });

    return () => {
      tableRows?.forEach((row) => {
        // row.removeEventListener('click', ...);
      });
    };
  }, [devices]);

  return (
    <RuxContainer className="device-status-list">
      {" "}
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
  );
};

export default DeviceStatus;
