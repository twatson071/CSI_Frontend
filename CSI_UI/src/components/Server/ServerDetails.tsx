import React, { useState } from "react";
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
import CPULineChart from "./Charts/CPULineChart";
import GPULineChart from "./Charts/GPULineChart";
import GPURamLineChart from "./Charts/GPURamLineChart";
import RamLineChart from "./Charts/RamLineChart";
import TemperatureLineChart from "./Charts/TempratureLineChart";
import MetricCard from "./MetricCard";
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
  const [view, setView] = useState<"table" | "chart">("table");
  const cpus = server.sensors?.cpus ? Object.values(server.sensors.cpus) : [];
  const nics = server.sensors?.nics ? Object.values(server.sensors.nics) : [];
  const ram = server.sensors?.ram;
  const gpus = server.sensors?.gpus ? Object.values(server.sensors.gpus) : [];
  const drives = server.sensors?.drives
    ? Object.values(server.sensors.drives)
    : [];
  const generateSampleData = () =>
    Array.from({ length: 20 }, () => Math.random() * 100);

  const avgCpuUtilization =
    cpus.length > 0
      ? cpus.reduce((sum, cpu) => sum + (cpu.utilization_percent || 0), 0) /
        cpus.length
      : 0;

  const totalNetworkBytes = nics.reduce(
    (sum, nic) => sum + (nic.current_speed_bps || 0),
    0
  );

  return (
    <RuxAccordion className="server-details-container">
      <RuxAccordionItem>
        <div slot="prefix">
          <RuxIcon icon="storage"></RuxIcon>
        </div>
        <div slot="label">Server Details</div>

        {/* Metric Cards */}
        <div className="metric-cards-container">
          <MetricCard
            title="Load"
            value={`${avgCpuUtilization.toFixed(1)}`}
            unit="%"
            color="#f4a261"
            data={generateSampleData()}
            icon="processor"
          />
          <MetricCard
            title="Memory"
            value={ram ? Number(ram.utilization_percent || 0).toFixed(1) : "0"}
            unit="GB"
            color="#e76f51"
            data={generateSampleData()}
            icon="memory"
          />
          <MetricCard
            title="Network"
            value={formatBandwidth(totalNetworkBytes).split(" ")[0]}
            unit={formatBandwidth(totalNetworkBytes).split(" ")[1]}
            color="#264653"
            data={generateSampleData()}
            icon="settings-ethernet"
          />
          <MetricCard
            title="Storage"
            value={
              drives.length > 0
                ? `${(
                    drives.reduce(
                      (sum, drive) => sum + (drive.utilization_percent || 0),
                      0
                    ) / drives.length
                  ).toFixed(1)}`
                : "0%"
            }
            unit="%"
            color="#2a9d8f"
            data={generateSampleData()}
            icon="storage"
          />
          <MetricCard
            title="CPU Temperature"
            value={
              cpus.length > 0
                ? `${
                    cpus.reduce(
                      (sum, cpu) => sum + (cpu.temperature_c || 0),
                      0
                    ) / cpus.length
                  }`
                : "N/A"
            }
            unit="°C"
            color="#e9c46a"
            data={generateSampleData()}
            icon="thermal"
          />
          <MetricCard
            title="GPU Temperature"
            value={
              gpus.length > 0
                ? `${
                    gpus.reduce(
                      (sum, gpu) => sum + (gpu.temperature_c || 0),
                      0
                    ) / gpus.length
                  }`
                : "N/A"
            }
            unit="°C"
            color="#f4a261"
            data={generateSampleData()}
            icon="thermal"
          />
        </div>

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
              secondary={view !== "table"}
              onClick={() => setView("table")}
            ></RuxButton>
            <RuxButton
              size="small"
              icon="show-chart"
              secondary={view !== "chart"}
              onClick={() => setView("chart")}
            ></RuxButton>
          </div>
          {view === "table" && cpus.length > 0 && (
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
          {view === "chart" && (
            <>
              <CPULineChart server={server} />
              <GPULineChart server={server} />
              <GPURamLineChart server={server} />
              <RamLineChart server={server} />
              <TemperatureLineChart server={server} />
            </>
          )}
          {view === "table" && ram && (
            <p>RAM Utilization: {ram.utilization_percent}%</p>
          )}
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
        <RuxAccordionItem>
          <div slot="prefix">
            <RuxIcon icon="thermal" size="small"></RuxIcon>
          </div>
          <div slot="label">Temprature and Fan Speed</div>
          <RuxTable>
            <RuxTableHeader>
              <RuxTableHeaderRow>
                <RuxTableHeaderCell>CPU Tempratures</RuxTableHeaderCell>
                <RuxTableHeaderCell>GPU Temperatures</RuxTableHeaderCell>
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
