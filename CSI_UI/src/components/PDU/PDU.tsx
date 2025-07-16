import React from "react";
import PlugContainer from "./PlugContainer";
import { RuxContainer } from "@astrouxds/react";
import "./PDU.css";
import { PDUData } from "../../services/PDUservice"; // Import PDUData

interface PDUProps {
  pduData: PDUData; // Use PDUData type
  toggleStatus: (outletId: string, currentState: string | undefined) => void;
}

const PDU: React.FC<PDUProps> = ({ pduData, toggleStatus }) => {
  // Transform pduData.outlets into the format expected by PlugContainer
  const outletsForPlugContainer = React.useMemo(() => {
    if (!pduData.outlets) {
      return {};
    }
    return Object.entries(pduData.outlets).reduce(
      (acc, [outletId, outletInfo]) => {
        acc[outletId] = { id: outletId, state: outletInfo.state };
        return acc;
      },
      {} as Record<string, { id: string; state: string | undefined }>
    );
  }, [pduData.outlets]);

  const deviceLabel = pduData.label || pduData.name;
  const deviceMake = pduData.make || "";
  const deviceModel = pduData.model || "";

  return (
    <RuxContainer class="pdu-container">
      <div slot="header">
        {`${deviceLabel} ${deviceMake} ${deviceModel}`.trim()}
      </div>
      <PlugContainer
        outlets={outletsForPlugContainer}
        onToggleOutlet={toggleStatus}
      />
    </RuxContainer>
  );
};

export default PDU;
