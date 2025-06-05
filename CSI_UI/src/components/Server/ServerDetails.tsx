import React from "react";
import {
  RuxTable,
  RuxTableHeader,
  RuxTableHeaderRow,
  RuxTableHeaderCell,
  RuxTableBody,
  RuxTableRow,
  RuxTableCell,
  RuxAccordion,
  RuxIcon,
  RuxButton,
  RuxAccordionItem,
} from "@astrouxds/react";
import { ServerData } from "../../services/ServerService";
import {
  formatBandwidth,
  formatSpeed,
  formatTemperature,
} from "../../utils/FormatUtils";
import "./ServerDetails.css";

interface Props {
  server: ServerData;
}

const ServerDetails: React.FC<Props> = ({ server }) => {
  const cpus = server.sensors?.cpus ? Object.values(server.sensors.cpus) : [];
  const nics = server.sensors?.nics ? Object.values(server.sensors.nics) : [];
  const ram = server.sensors?.ram;

  return (
    <RuxAccordion className="server-details-container">
      <RuxAccordionItem>
        <div slot="prefix">
          <RuxIcon icon="storage"></RuxIcon>
        </div>
        <div slot="label">Server Details</div>
        <RuxAccordionItem>
          <div slot="prefix">
            <RuxIcon icon="processor" size="small"></RuxIcon>
          </div>
          <div slot="label">CPU Information</div>
          <div className="view-toggle">
            <RuxButton
              size="small"
              icon="list"
              className="view-toggle-button"
              aria-label="List View"
            ></RuxButton>
            <RuxButton size="small" icon="show-chart"></RuxButton>
          </div>
          {cpus.length > 0 && (
            <RuxTable>
              <RuxTableHeader>
                <RuxTableHeaderRow>
                  <RuxTableHeaderCell>CPU</RuxTableHeaderCell>
                  <RuxTableHeaderCell>Utilization %</RuxTableHeaderCell>
                  <RuxTableHeaderCell>Current Rate</RuxTableHeaderCell>
                  <RuxTableHeaderCell>Max Rate</RuxTableHeaderCell>
                  <RuxTableHeaderCell>Temperature (°C)</RuxTableHeaderCell>
                </RuxTableHeaderRow>
              </RuxTableHeader>
              <RuxTableBody>
                {cpus.map((cpu, idx) => (
                  <RuxTableRow key={idx}>
                    <RuxTableCell>{cpu.id || idx}</RuxTableCell>
                    <RuxTableCell>{cpu.utilization_percent}</RuxTableCell>
                    <RuxTableCell>
                      {formatSpeed(cpu.current_rate_hz)}
                    </RuxTableCell>
                    <RuxTableCell>{formatSpeed(cpu.max_rate_Hz)}</RuxTableCell>
                    <RuxTableCell>
                      {formatTemperature(cpu.temperature_c)}
                    </RuxTableCell>
                  </RuxTableRow>
                ))}
              </RuxTableBody>
            </RuxTable>
          )}
          {ram && <p>RAM Utilization: {ram.utilization_percent}%</p>}
        </RuxAccordionItem>
        <RuxAccordionItem>
          <div slot="prefix">
            <RuxIcon icon="settings-ethernet" size="small"></RuxIcon>
          </div>
          <div slot="label">Network Information</div>
          <RuxTable>
            <RuxTableHeader>
              <RuxTableHeaderRow>
                <RuxTableHeaderCell>Interface</RuxTableHeaderCell>
                <RuxTableHeaderCell>Admin Status</RuxTableHeaderCell>
                <RuxTableHeaderCell>Oper Status</RuxTableHeaderCell>
                <RuxTableHeaderCell>Max Speed</RuxTableHeaderCell>
                <RuxTableHeaderCell>Current Speed</RuxTableHeaderCell>
                <RuxTableHeaderCell>MTU</RuxTableHeaderCell>
                <RuxTableHeaderCell>MAC Address</RuxTableHeaderCell>
              </RuxTableHeaderRow>
            </RuxTableHeader>
            <RuxTableBody>
              {nics.map((nic, idx) => (
                <RuxTableRow key={idx}>
                  <RuxTableCell>{nic.index}</RuxTableCell>
                  <RuxTableCell>{nic.administrative_status}</RuxTableCell>
                  <RuxTableCell>{nic.operational_status}</RuxTableCell>
                  <RuxTableCell>
                    {formatBandwidth(nic.max_speed_bps)}
                  </RuxTableCell>
                  <RuxTableCell>
                    {formatBandwidth(nic.current_speed_bps)}
                  </RuxTableCell>
                  <RuxTableCell>{nic.mtu}</RuxTableCell>
                  <RuxTableCell>{nic.mac}</RuxTableCell>
                </RuxTableRow>
              ))}
            </RuxTableBody>
          </RuxTable>
        </RuxAccordionItem>
      </RuxAccordionItem>
    </RuxAccordion>
  );
};

export default ServerDetails;
