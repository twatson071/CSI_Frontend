import React, { useRef } from "react";
import {
  RuxStatus,
  RuxTableRow,
  RuxTableCell,
  RuxIcon,
  RuxPopUp,
  RuxMenu,
  RuxMenuItem,
  RuxTooltip,
  RuxDialog,
} from "@astrouxds/react";
import { RuxDialogCustomEvent } from "@astrouxds/astro-web-components";
import { mapDeviceStatus } from "../../utils/deviceStatusUtils";

// Define a generic Device interface
export interface Device {
  id: string | number;
  name: string;
  status: "critical" | "serious" | "caution" | "normal" | "standby" | "off"; // Astro UXDS Status types
  type: string;
  // Add any other relevant device properties here, e.g., ipAddress, location
}

interface DeviceListItemProps {
  device: Device;
  index: number;
  onDelete?: (deviceId: string | number) => void;
  onInvestigate?: (device: Device) => void;
}

const DeviceListItem: React.FC<DeviceListItemProps> = ({
  device,
  index,
  onDelete,
  onInvestigate,
}) => {
  const dialogElement = useRef<HTMLRuxDialogElement>(null);

  const handleRuxMenuSelected = (e: any) => {
    if (e.detail.value === "delete") {
      if (dialogElement.current) dialogElement.current.open = true;
    }
    if (e.detail.value === "investigate" && onInvestigate) {
      onInvestigate(device);
    }
  };

  const handleDialogConfirm = (e: RuxDialogCustomEvent<boolean | null>) => {
    if (e.detail === true && onDelete) {
      onDelete(device.id);
    }
  };

  const tooltipMessage = `Device: ${device.name} - Type: ${device.type}`;

  return (
    <>
      <RuxDialog
        ref={dialogElement}
        confirmText="Yes, Delete"
        denyText="Cancel"
        message={`Please confirm you wish to delete the device "${device.name}"?`}
        onRuxdialogclosed={handleDialogConfirm}
      />
      <RuxTableRow key={device.id} data-index={index}>
        <RuxTableCell>
          <RuxStatus status={mapDeviceStatus(device.status)} />
        </RuxTableCell>
        <RuxTableCell>
          <RuxTooltip message={tooltipMessage} placement="top" delay={300}>
            {device.name}
          </RuxTooltip>
        </RuxTableCell>
        <RuxTableCell>{device.type}</RuxTableCell>
        <RuxTableCell>
          <RuxPopUp placement="left" closeOnSelect>
            <RuxIcon slot="trigger" icon="more-horiz" size="1.5rem" />
            <RuxMenu onRuxmenuselected={handleRuxMenuSelected}>
              {onDelete && (
                <RuxMenuItem value="delete">Delete Device</RuxMenuItem>
              )}
              {onInvestigate && (
                <RuxMenuItem value="investigate">Investigate</RuxMenuItem>
              )}
            </RuxMenu>
          </RuxPopUp>
        </RuxTableCell>
      </RuxTableRow>
    </>
  );
};

export default DeviceListItem;
