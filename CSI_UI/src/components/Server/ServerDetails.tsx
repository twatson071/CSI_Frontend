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
import CPUPerCoreGrid from "./Charts/CPUPerCoreGrid";
import GPULineChart from "./Charts/GPULineChart";
import GPURamLineChart from "./Charts/GPURamLineChart";
import RamLineChart from "./Charts/RamLineChart";
import TemperatureLineChart from "./Charts/TempratureLineChart";
import MetricCard from "./MetricCard";
import TemperatureFanSection from "./Sections/TemperatureFanSection";
import StorageSection from "./Sections/StorageSection";
import PeripheralsSection from "./Sections/PeripheralsSection";
import ProcessesSection from "./Sections/ProcessesSection";
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

  // Memoize calculations to ensure they update when server data changes
  const cpus = React.useMemo(
    () => (server.sensors?.cpus ? Object.values(server.sensors.cpus) : []),
    [server.sensors?.cpus]
  );

  const nics = React.useMemo(
    () => (server.sensors?.nics ? Object.values(server.sensors.nics) : []),
    [server.sensors?.nics]
  );

  const ram = React.useMemo(() => server.sensors?.ram, [server.sensors?.ram]);

  const gpus = React.useMemo(
    () => (server.sensors?.gpus ? Object.values(server.sensors.gpus) : []),
    [server.sensors?.gpus]
  );

  const drives = React.useMemo(
    () => (server.sensors?.drives ? Object.values(server.sensors.drives) : []),
    [server.sensors?.drives]
  );

  const [loadData, setLoadData] = useState<number[]>([]);
  const [memoryData, setMemoryData] = useState<number[]>([]);
  const [networkData, setNetworkData] = useState<number[]>([]);
  const [storageData, setStorageData] = useState<number[]>([]);
  const [cpuTempData, setCpuTempData] = useState<number[]>([]);
  const [gpuTempData, setGpuTempData] = useState<number[]>([]);

  // Memoize calculated values to ensure they update
  const avgCpuUtilization = React.useMemo(
    () =>
      cpus.length > 0
        ? cpus.reduce((sum, cpu) => sum + (cpu.utilization_percent || 0), 0) /
          cpus.length
        : 0,
    [cpus]
  );

  const avgDriveUtilization = React.useMemo(
    () =>
      drives.length > 0
        ? drives.reduce(
            (sum, drive) => sum + (drive.utilization_percent || 0),
            0
          ) / drives.length
        : 0,
    [drives]
  );

  const avgCpuTemp = React.useMemo(
    () =>
      cpus.length > 0
        ? cpus.reduce((sum, cpu) => sum + (cpu.temperature_c || 0), 0) /
          cpus.length
        : 0,
    [cpus]
  );

  const avgGpuTemp = React.useMemo(
    () =>
      gpus.length > 0
        ? gpus.reduce((sum, gpu) => sum + (gpu.temperature_c || 0), 0) /
          gpus.length
        : 0,
    [gpus]
  );

  const totalNetworkBytes = React.useMemo(
    () => nics.reduce((sum, nic) => sum + (nic.current_speed_bps || 0), 0),
    [nics]
  );

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
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          )
          .forEach((m) => {
            switch (m.metricType) {
              case "load":
              case "cpu_load":
              case "cpu_utilization":
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

        setLoadData(load);
        setMemoryData(memory);
        setNetworkData(network);
        setStorageData(storage);
        setCpuTempData(cpuTemp);
        setGpuTempData(gpuTemp);
      })
      .catch((err) => {
        console.error("Failed to fetch server metrics", err);
        setLoadData([]);
        setMemoryData([]);
        setNetworkData([]);
        setStorageData([]);
        setCpuTempData([]);
        setGpuTempData([]);
      });
  }, [deviceId]);

  useEffect(() => {
    // Only update if we have valid server data and the values have actually changed
    if (server.sensors) {
      setLoadData((prev) => {
        const newValue = avgCpuUtilization;
        const lastValue = prev[prev.length - 1];
        // Only add if the value has changed or this is the first value
        if (prev.length === 0 || newValue !== lastValue) {
          return [...prev.slice(-19), newValue];
        }
        return prev;
      });

      setMemoryData((prev) => {
        const newValue = ram ? Number(ram.utilization_percent || 0) : 0;
        const lastValue = prev[prev.length - 1];
        if (prev.length === 0 || newValue !== lastValue) {
          return [...prev.slice(-19), newValue];
        }
        return prev;
      });

      setNetworkData((prev) => {
        const newValue = totalNetworkBytes;
        const lastValue = prev[prev.length - 1];
        if (prev.length === 0 || newValue !== lastValue) {
          return [...prev.slice(-19), newValue];
        }
        return prev;
      });

      setStorageData((prev) => {
        const newValue = avgDriveUtilization;
        const lastValue = prev[prev.length - 1];
        if (prev.length === 0 || newValue !== lastValue) {
          return [...prev.slice(-19), newValue];
        }
        return prev;
      });

      setCpuTempData((prev) => {
        const newValue = avgCpuTemp;
        const lastValue = prev[prev.length - 1];
        if (prev.length === 0 || newValue !== lastValue) {
          return [...prev.slice(-19), newValue];
        }
        return prev;
      });

      setGpuTempData((prev) => {
        const newValue = avgGpuTemp;
        const lastValue = prev[prev.length - 1];
        if (prev.length === 0 || newValue !== lastValue) {
          return [...prev.slice(-19), newValue];
        }
        return prev;
      });
    }
  }, [
    server.sensors,
    avgCpuUtilization,
    avgDriveUtilization,
    avgCpuTemp,
    avgGpuTemp,
    totalNetworkBytes,
    ram?.utilization_percent,
  ]);
  return (
    <RuxAccordion className="server-details-container">
      <RuxAccordionItem>
        <div slot="prefix">
          <RuxIcon icon="storage"></RuxIcon>
        </div>
        <div slot="label">Server Details</div>

        <div className="metric-cards-container">
          <MetricCard
            title="Load"
            value={`${avgCpuUtilization.toFixed(1)}`}
            unit="%"
            data={loadData}
            thresholds={{
              normal: 0,
              caution: 70,
              serious: 85,
              critical: 95,
            }}
            icon="processor"
          />
          <MetricCard
            title="Memory"
            value={ram ? Number(ram.utilization_percent || 0).toFixed(1) : "0"}
            unit="%"
            data={memoryData}
            thresholds={{
              normal: 70,
              caution: 85,
              serious: 95,
              critical: 100,
            }}
            icon="memory"
          />
          <MetricCard
            title="Network"
            value={formatBandwidth(totalNetworkBytes).split(" ")[0]}
            unit={formatBandwidth(totalNetworkBytes).split(" ")[1]}
            data={networkData}
            color="#2a9d8f"
            icon="settings-ethernet"
          />
          <MetricCard
            title="Storage"
            value={drives.length > 0 ? avgDriveUtilization.toFixed(1) : "0"}
            unit="%"
            data={storageData}
            thresholds={{
              normal: 70,
              caution: 85,
              serious: 95,
              critical: 100,
            }}
            icon="storage"
          />
          <MetricCard
            title="CPU Temperature"
            value={cpus.length > 0 ? avgCpuTemp.toFixed(1) : "N/A"}
            unit="°C"
            data={cpuTempData}
            thresholds={{
              normal: 70,
              caution: 80,
              serious: 85,
              critical: 90,
            }}
            icon="thermal"
          />
          <MetricCard
            title="GPU Temperature"
            value={gpus.length > 0 ? avgGpuTemp.toFixed(1) : "N/A"}
            unit="°C"
            data={gpuTempData}
            thresholds={{
              normal: 70,
              caution: 80,
              serious: 85,
              critical: 90,
            }}
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
                  <RuxTableHeaderCell>Current Usage</RuxTableHeaderCell>
                  <RuxTableHeaderCell>Max Speed</RuxTableHeaderCell>
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
              <CPUPerCoreGrid server={server} deviceId={deviceId} />
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
        <TemperatureFanSection server={server} />
        <StorageSection server={server} />
        <PeripheralsSection server={server} />
        <ProcessesSection server={server} />
      </RuxAccordionItem>
    </RuxAccordion>
  );
};

export default ServerDetails;
