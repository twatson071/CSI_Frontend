import React, { useState } from "react";
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
  RuxInput,
} from "@astrouxds/react";
import { ServerData } from "../../../services/ServerService";
import "./ProcessesSection.css";

interface Props {
  server: ServerData;
}

// Helper component to display process details recursively
const ProcessDetails: React.FC<{ details: any }> = ({ details }) => {
  if (typeof details !== "object" || details === null) {
    return <>{String(details)}</>;
  }

  if (Array.isArray(details)) {
    return (
      <ul>
        {details.map((item, index) => (
          <li key={index}>
            <ProcessDetails details={item} />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <ul className="process-details-list">
      {Object.entries(details).map(([key, value]) => (
        <li key={key}>
          <strong>{key}:</strong> <ProcessDetails details={value} />
        </li>
      ))}
    </ul>
  );
};

const ProcessesSection: React.FC<Props> = ({ server }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const processes = server.sensors?.processes
    ? Object.entries(server.sensors.processes)
    : [];

  const filteredProcesses = processes.filter(([name]) =>
    name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <RuxAccordionItem>
      <div slot="prefix">
        <RuxIcon icon="view-list" size="small" />
      </div>
      <div slot="label">Processes</div>
      <div className="processes-section-content">
        {processes.length === 0 ? (
          <p className="no-data-message">No process data available</p>
        ) : (
          <>
            <RuxInput
              className="search-input"
              type="search"
              placeholder="Search processes..."
              value={searchTerm}
              onRuxinput={(e) => setSearchTerm(e.target.value || "")}
            />
            {filteredProcesses.length > 0 ? (
              <RuxTable>
                <RuxTableHeader>
                  <RuxTableHeaderRow>
                    <RuxTableHeaderCell>Name</RuxTableHeaderCell>
                    <RuxTableHeaderCell>Details</RuxTableHeaderCell>
                  </RuxTableHeaderRow>
                </RuxTableHeader>
                <RuxTableBody>
                  {filteredProcesses.map(([name, details]) => (
                    <RuxTableRow key={name}>
                      <RuxTableCell>{name}</RuxTableCell>
                      <RuxTableCell>
                        <div className="process-details-container">
                          <ProcessDetails details={details} />
                        </div>
                      </RuxTableCell>
                    </RuxTableRow>
                  ))}
                </RuxTableBody>
              </RuxTable>
            ) : (
              <p className="no-data-message">No processes match your search.</p>
            )}
          </>
        )}
      </div>
    </RuxAccordionItem>
  );
};

export default ProcessesSection;
