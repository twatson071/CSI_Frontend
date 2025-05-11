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
  toggleStatus: (index: number) => void;
}

const PDU: React.FC<PDUProps> = ({ pduData, toggleStatus }) => {
  return (
    <RuxContainer class="pdu-container">
      <div slot="header">{`${pduData.device.label} ${pduData.device.make} ${pduData.device.model}`}</div>
      <PlugContainer statuses={pduData.statuses} toggleStatus={toggleStatus} />
    </RuxContainer>
  );
};

export default PDU;
