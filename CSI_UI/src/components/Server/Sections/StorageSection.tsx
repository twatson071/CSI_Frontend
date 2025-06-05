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
import { formatBytes } from "../../../utils/FormatUtils";

interface Props {
  server: ServerData;
}

const StorageSection: React.FC<Props> = ({ server }) => {
  const drives = server.sensors?.drives ? Object.values(server.sensors.drives) : [];

  return (
    <RuxAccordionItem>
      <div slot="prefix">
        <RuxIcon icon="save" size="small" />
      </div>
      <div slot="label">Storage</div>
      {drives.length === 0 ? (
        <p>No storage data available</p>
      ) : (
        <RuxTable>
          <RuxTableHeader>
            <RuxTableHeaderRow>
              <RuxTableHeaderCell>Drive</RuxTableHeaderCell>
              <RuxTableHeaderCell>Capacity</RuxTableHeaderCell>
              <RuxTableHeaderCell>Utilization %</RuxTableHeaderCell>
            </RuxTableHeaderRow>
          </RuxTableHeader>
          <RuxTableBody>
            {drives.map((drive: any, idx: number) => (
              <RuxTableRow key={idx}>
                <RuxTableCell>{drive.index ?? idx}</RuxTableCell>
                <RuxTableCell>{formatBytes(drive.max_storage_bytes)}</RuxTableCell>
                <RuxTableCell>{drive.utilization_percent ?? "N/A"}</RuxTableCell>
              </RuxTableRow>
            ))}
          </RuxTableBody>
        </RuxTable>
      )}
    </RuxAccordionItem>
  );
};

export default StorageSection;
