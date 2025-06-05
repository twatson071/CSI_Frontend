import React from "react";
import {
  RuxAccordionItem,
  RuxIcon,
  RuxTable,
  RuxTableHeader,
  RuxTableHeaderRow,
  RuxTableHeaderCell,
  RuxTableBody,
  RuxTableRow,
  RuxTableCell,
} from "@astrouxds/react";
import { ServerData } from "../../../services/ServerService";

interface Props {
  server: ServerData;
}

const ProcessesSection: React.FC<Props> = ({ server }) => {
  const processes = server.sensors?.processes
    ? Object.entries(server.sensors.processes)
    : [];

  return (
    <RuxAccordionItem>
      <div slot="prefix">
        <RuxIcon icon="view-list" size="small" />
      </div>
      <div slot="label">Processes</div>
      {processes.length === 0 ? (
        <p>No process data available</p>
      ) : (
        <RuxTable>
          <RuxTableHeader>
            <RuxTableHeaderRow>
              <RuxTableHeaderCell>Name</RuxTableHeaderCell>
              <RuxTableHeaderCell>Details</RuxTableHeaderCell>
            </RuxTableHeaderRow>
          </RuxTableHeader>
          <RuxTableBody>
            {processes.map(([name, details]) => (
              <RuxTableRow key={name}>
                <RuxTableCell>{name}</RuxTableCell>
                <RuxTableCell>
                  {typeof details === "object" ? JSON.stringify(details) : String(details)}
                </RuxTableCell>
              </RuxTableRow>
            ))}
          </RuxTableBody>
        </RuxTable>
      )}
    </RuxAccordionItem>
  );
};

export default ProcessesSection;
