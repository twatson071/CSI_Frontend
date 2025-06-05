import React, { useState, useEffect } from "react";
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
import { fetchDeviceMetrics } from "../../services/DeviceService";
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
  deviceId: number;
}

const ServerDetails: React.FC<Props> = ({ server, deviceId }) => {
  const [view, setView] = useState<"table" | "chart">("table");
  const cpus = server.sensors?.cpus ? Object.values(server.sensors.cpus) : [];
  const nics = server.sensors?.nics ? Object.values(server.sensors.nics) : [];
  const ram = server.sensors?.ram;
  const gpus = server.sensors?.gpus ? Object.values(server.sensors.gpus) : [];
  const drives = server.sensors?.drives
    ? Object.values(server.sensors.drives)
    : [];

  const [loadData, setLoadData] = useState<number[]>([]);
  const [memoryData, setMemoryData] = useState<number[]>([]);
  const [networkData, setNetworkData] = useState<number[]>([]);
  const [storageData, setStorageData] = useState<number[]>([]);
  const [cpuTempData, setCpuTempData] = useState<number[]>([]);
  const [gpuTempData, setGpuTempData] = useState<number[]>([]);

  const avgCpuUtilization =
    cpus.length > 0
      ? cpus.reduce((sum, cpu) => sum + (cpu.utilization_percent || 0), 0) /
        cpus.length
      : 0;

  const avgDriveUtilization =
    drives.length > 0
      ? drives.reduce((sum, drive) => sum + (drive.utilization_percent || 0), 0) /
        drives.length
      : 0;

  const avgCpuTemp =
    cpus.length > 0
      ? cpus.reduce((sum, cpu) => sum + (cpu.temperature_c || 0), 0) / cpus.length
      : 0;

  const avgGpuTemp =
    gpus.length > 0
      ? gpus.reduce((sum, gpu) => sum + (gpu.temperature_c || 0), 0) / gpus.length
      : 0;

  const totalNetworkBytes = nics.reduce(
    (sum, nic) => sum + (nic.current_speed_bps || 0),
    0
  );

  // Load historical metrics for this server
  useEffect(() => {
    fetchDeviceMetrics(deviceId)
      .then((metrics) => {
        const load: number[] = [];
        const memory: number[] = [];
        const network: number[] = [];
        const storage: number[] = [];
        const cpuTemp: number[] = [];
        const gpuTemp: number[] = [];

        metrics
          .sort(
            (a, b) =>
              new Date(a.createdAt).getTime() -
              new Date(b.createdAt).getTime()
          )
          .forEach((m) => {
            switch (m.metricType) {
              case "load":
              case "cpu_load":
                load.push(m.value);
                break;
              case "memory":
              case "memory_utilization":
                memory.push(m.value);
                break;
              case "network":
              case "network_speed":
                network.push(m.value);
                break;
              case "storage":
              case "storage_utilization":
                storage.push(m.value);
                break;
              case "cpu_temperature":
                cpuTemp.push(m.value);
                break;
              case "gpu_temperature":
                gpuTemp.push(m.value);
                break;
              default:
                break;
            }
          });

        if (load.length) setLoadData(load);
        if (memory.length) setMemoryData(memory);
        if (network.length) setNetworkData(network);
        if (storage.length) setStorageData(storage);
        if (cpuTemp.length) setCpuTempData(cpuTemp);
        if (gpuTemp.length) setGpuTempData(gpuTemp);
      })
      .catch((err) => {
        console.error("Failed to fetch server metrics", err);
      });
  }, [deviceId]);

  useEffect(() => {
    setLoadData((prev) => [...prev.slice(-19), avgCpuUtilization]);
    setMemoryData((prev) => [
      ...prev.slice(-19),
      ram ? Number(ram.utilization_percent || 0) : 0,
    ]);
    setNetworkData((prev) => [...prev.slice(-19), totalNetworkBytes]);
    setStorageData((prev) => [...prev.slice(-19), avgDriveUtilization]);
    setCpuTempData((prev) => [...prev.slice(-19), avgCpuTemp]);
    setGpuTempData((prev) => [...prev.slice(-19), avgGpuTemp]);
  }, [
    server,
    avgCpuUtilization,
    avgDriveUtilization,
    avgCpuTemp,
    avgGpuTemp,
    totalNetworkBytes,
    ram,
  ]);

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
            data={loadData}
            icon="processor"
          />
          <MetricCard
            title="Memory"
            value={ram ? Number(ram.utilization_percent || 0).toFixed(1) : "0"}
            unit="GB"
            color="#e76f51"
            data={memoryData}
            icon="memory"
          />
          <MetricCard
            title="Network"
            value={formatBandwidth(totalNetworkBytes).split(" ")[0]}
            unit={formatBandwidth(totalNetworkBytes).split(" ")[1]}
            color="#264653"
            data={networkData}
            icon="settings-ethernet"
          />
          <MetricCard
            title="Storage"
            value={drives.length > 0 ? avgDriveUtilization.toFixed(1) : "0"}
            unit="%"
            color="#2a9d8f"
            data={storageData}
            icon="storage"
          />
          <MetricCard
            title="CPU Temperature"
            value={cpus.length > 0 ? avgCpuTemp.toFixed(1) : "N/A"}
            unit="°C"
            color="#e9c46a"
            data={cpuTempData}
            icon="thermal"
          />
          <MetricCard
            title="GPU Temperature"
            value={gpus.length > 0 ? avgGpuTemp.toFixed(1) : "N/A"}
            unit="°C"
            color="#f4a261"
            data={gpuTempData}
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
