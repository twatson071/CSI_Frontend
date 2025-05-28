import React from "react";
import PlugContainer from "./PlugContainer";
import { RuxContainer } from "@astrouxds/react";
import "./PDU.css";

interface PDUProps {
  pduData: {
    device: {
      label: string;
      make: string;
      model: string;
    };
    statuses: string[]; // Array of statuses (e.g., "normal", "off", etc.)
  };
  toggleStatus: (outletId: string, currentState: string | undefined) => void;
}

const PDU: React.FC<PDUProps> = ({ pduData, toggleStatus }) => {
  const outlets = pduData.statuses.reduce((acc, status, index) => {
    const outletId = (index + 1).toString();
    acc[outletId] = { id: outletId, state: status };
    return acc;
  }, {} as Record<string, { id: string; state: string | undefined }>);

  return (
    <RuxContainer class="pdu-container">
      <div slot="header">{`${pduData.device.label} ${pduData.device.make} ${pduData.device.model}`}</div>
      <PlugContainer outlets={outlets} onToggleOutlet={toggleStatus} />
    </RuxContainer>
  );
};

export default PDU;
