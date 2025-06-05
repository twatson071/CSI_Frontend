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
import { formatTemperature } from "../../../utils/FormatUtils";

interface Props {
  server: ServerData;
}

const TemperatureFanSection: React.FC<Props> = ({ server }) => {
  const cpus = server.sensors?.cpus ? Object.values(server.sensors.cpus) : [];
  const gpus = server.sensors?.gpus ? Object.values(server.sensors.gpus) : [];
  const fans = server.sensors?.fans ? Object.values(server.sensors.fans as any) : [];

  const hasTemps = cpus.length > 0 || gpus.length > 0;

  return (
    <RuxAccordionItem>
      <div slot="prefix">
        <RuxIcon icon="thermal" size="small" />
      </div>
      <div slot="label">Temperature &amp; Fan Speed</div>
      {hasTemps && (
        <RuxTable>
          <RuxTableHeader>
            <RuxTableHeaderRow>
              <RuxTableHeaderCell>Component</RuxTableHeaderCell>
              <RuxTableHeaderCell>Temperature</RuxTableHeaderCell>
            </RuxTableHeaderRow>
          </RuxTableHeader>
          <RuxTableBody>
            {cpus.map((cpu, idx) => (
              <RuxTableRow key={`cpu-${idx}`}>
                <RuxTableCell>{`CPU ${cpu.id || idx}`}</RuxTableCell>
                <RuxTableCell>{formatTemperature(cpu.temperature_c)}</RuxTableCell>
              </RuxTableRow>
            ))}
            {gpus.map((gpu, idx) => (
              <RuxTableRow key={`gpu-${idx}`}>
                <RuxTableCell>{`GPU ${gpu.id || idx}`}</RuxTableCell>
                <RuxTableCell>{formatTemperature(gpu.temperature_c)}</RuxTableCell>
              </RuxTableRow>
            ))}
          </RuxTableBody>
        </RuxTable>
      )}
      {fans.length > 0 && (
        <RuxTable style={{ marginTop: "1rem" }}>
          <RuxTableHeader>
            <RuxTableHeaderRow>
              <RuxTableHeaderCell>Fan</RuxTableHeaderCell>
              <RuxTableHeaderCell>Current Speed (RPM)</RuxTableHeaderCell>
              <RuxTableHeaderCell>Max Speed (RPM)</RuxTableHeaderCell>
            </RuxTableHeaderRow>
          </RuxTableHeader>
          <RuxTableBody>
            {fans.map((fan: any, idx: number) => (
              <RuxTableRow key={`fan-${idx}`}>
                <RuxTableCell>{fan.id || idx}</RuxTableCell>
                <RuxTableCell>{fan.current_speed_rpm ?? "N/A"}</RuxTableCell>
                <RuxTableCell>{fan.max_speed_rpm ?? "N/A"}</RuxTableCell>
              </RuxTableRow>
            ))}
          </RuxTableBody>
        </RuxTable>
      )}
      {!hasTemps && fans.length === 0 && <p>No temperature or fan data available.</p>}
    </RuxAccordionItem>
  );
};

export default TemperatureFanSection;
