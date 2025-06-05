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

const PeripheralsSection: React.FC<Props> = ({ server }) => {
  const peripherals = server.sensors?.peripherials
    ? Object.entries(server.sensors.peripherials)
    : [];

  return (
    <RuxAccordionItem>
      <div slot="prefix">
        <RuxIcon icon="devices" size="small" />
      </div>
      <div slot="label">Peripherals</div>
      {peripherals.length === 0 ? (
        <p>No peripheral data available</p>
      ) : (
        <RuxTable>
          <RuxTableHeader>
            <RuxTableHeaderRow>
              <RuxTableHeaderCell>ID</RuxTableHeaderCell>
              <RuxTableHeaderCell>Details</RuxTableHeaderCell>
            </RuxTableHeaderRow>
          </RuxTableHeader>
          <RuxTableBody>
            {peripherals.map(([id, details]) => (
              <RuxTableRow key={id}>
                <RuxTableCell>{id}</RuxTableCell>
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

export default PeripheralsSection;
