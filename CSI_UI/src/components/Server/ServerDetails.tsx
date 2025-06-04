import React from "react";
import { RuxContainer, RuxTable, RuxTableHeader, RuxTableHeaderRow, RuxTableHeaderCell, RuxTableBody, RuxTableRow, RuxTableCell } from "@astrouxds/react";
import { ServerData } from "../../services/ServerService";
import "./ServerDetails.css";

interface Props {
  server: ServerData;
}

const ServerDetails: React.FC<Props> = ({ server }) => {
  const cpus = server.sensors?.cpus ? Object.values(server.sensors.cpus) : [];
  const ram = server.sensors?.ram;

  return (
    <RuxContainer className="server-details-container">
      <div slot="header">Server Details</div>
      <p>IP: {server.device?.comms?.ip}</p>
      {ram && (
        <p>RAM Utilization: {ram.utilization_percent}%</p>
      )}
      {cpus.length > 0 && (
        <RuxTable>
          <RuxTableHeader>
            <RuxTableHeaderRow>
              <RuxTableHeaderCell>CPU</RuxTableHeaderCell>
              <RuxTableHeaderCell>Utilization %</RuxTableHeaderCell>
            </RuxTableHeaderRow>
          </RuxTableHeader>
          <RuxTableBody>
            {cpus.map((cpu, idx) => (
              <RuxTableRow key={idx}>
                <RuxTableCell>{cpu.unique_id || idx}</RuxTableCell>
                <RuxTableCell>{cpu.utilization_percent}</RuxTableCell>
              </RuxTableRow>
            ))}
          </RuxTableBody>
        </RuxTable>
      )}
    </RuxContainer>
  );
};

export default ServerDetails;
