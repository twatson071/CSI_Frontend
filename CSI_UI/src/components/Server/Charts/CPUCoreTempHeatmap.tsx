import React, { useEffect, useState } from "react";
import GenericHeatmap from "../../common/GenericHeatmap/GenericHeatmap";
import { fetchDeviceMetrics } from "../../../services/DeviceService";

interface CPUCoreTempHeatmapProps {
  deviceId: number;
}

interface Metric {
  metricType: string;
  value: number;
  createdAt: string;
}

// Extended data structure to include load
interface HeatmapDataPoint {
  x: string;
  y: number;
  load?: number; // Add load data
}

const CPUCoreTempHeatmap: React.FC<CPUCoreTempHeatmapProps> = ({
  deviceId,
}) => {
  const [data, setData] = useState<
    {
      id: string;
      data: HeatmapDataPoint[];
    }[]
  >([]);

  useEffect(() => {
    if (!deviceId) return;

    fetchDeviceMetrics(deviceId)
      .then((metrics: Metric[]) => {
        const tempMetrics = metrics.filter((m) =>
          m.metricType.startsWith("cpu_temperature_core_")
        );

        const loadMetrics = metrics.filter((m) =>
          m.metricType.startsWith("cpu_usage_core_")
        );

        if (tempMetrics.length === 0) {
          console.log("No temperature metrics found");
          return;
        }

        // Group temperature data by CPU and core
        const perCPUCore: Record<
          string,
          Record<string, { createdAt: string; value: number }[]>
        > = {};

        // Group load data by CPU and core
        const perCPUCoreLoad: Record<
          string,
          Record<string, { createdAt: string; value: number }[]>
        > = {};

        tempMetrics.forEach((m) => {
          const match = m.metricType.match(/cpu_temperature_core_(\d+)/);
          const coreId = match ? match[1] : "0";

          // Use the actual coreId as the CPU identifier, and core 0 for each CPU
          const cpuId = coreId;
          const coreWithinCPU = "0"; // Since each metric represents a single CPU core

          if (!perCPUCore[cpuId]) perCPUCore[cpuId] = {};
          if (!perCPUCore[cpuId][coreWithinCPU])
            perCPUCore[cpuId][coreWithinCPU] = [];

          perCPUCore[cpuId][coreWithinCPU].push({
            createdAt: m.createdAt,
            value: m.value,
          });
        });

        // Process load metrics
        loadMetrics.forEach((m) => {
          const match = m.metricType.match(/cpu_usage_core_(\d+)/);
          const coreId = match ? match[1] : "0";

          const cpuId = coreId;
          const coreWithinCPU = "0";

          if (!perCPUCoreLoad[cpuId]) perCPUCoreLoad[cpuId] = {};
          if (!perCPUCoreLoad[cpuId][coreWithinCPU])
            perCPUCoreLoad[cpuId][coreWithinCPU] = [];

          perCPUCoreLoad[cpuId][coreWithinCPU].push({
            createdAt: m.createdAt,
            value: m.value,
          });
        });

        // Create heatmap data structure with CPUs as rows and cores as columns
        const heatmapData: { id: string; data: HeatmapDataPoint[] }[] = [];

        // Sort CPU IDs numerically for proper ordering
        const sortedCpuIds = Object.keys(perCPUCore).sort(
          (a, b) => parseInt(a) - parseInt(b)
        );

        // Group cores by CPU (assuming 4-8 cores per CPU for modern processors)
        const coresPerCPU = 8; // Adjust this based on your system
        let cpuGroups: Record<number, string[]> = {};

        sortedCpuIds.forEach((cpuId) => {
          const cpuIndex = Math.floor(parseInt(cpuId) / 1000000); // Use the high-order digits to determine CPU
          if (!cpuGroups[cpuIndex]) cpuGroups[cpuIndex] = [];
          cpuGroups[cpuIndex].push(cpuId);
        });

        // If all cores have similar IDs, group them sequentially
        if (Object.keys(cpuGroups).length === 1) {
          cpuGroups = {};
          sortedCpuIds.forEach((cpuId, index) => {
            const cpuIndex = Math.floor(index / coresPerCPU);
            if (!cpuGroups[cpuIndex]) cpuGroups[cpuIndex] = [];
            cpuGroups[cpuIndex].push(cpuId);
          });
        }

        // Create a row for each CPU
        Object.entries(cpuGroups).forEach(([cpuIndex, coreIds]) => {
          const coreData: HeatmapDataPoint[] = [];

          coreIds.forEach((cpuId, coreIndex) => {
            const cores = perCPUCore[cpuId];
            const coreKey = "0"; // Since each CPU has only one core entry

            if (cores[coreKey]) {
              // Get the latest temperature reading for this core
              const latestTempValue = cores[coreKey].reduce((latest, current) =>
                new Date(current.createdAt).getTime() >
                new Date(latest.createdAt).getTime()
                  ? current
                  : latest
              );

              // Get the latest load reading for this core
              let latestLoadValue = null;
              if (perCPUCoreLoad[cpuId] && perCPUCoreLoad[cpuId][coreKey]) {
                latestLoadValue = perCPUCoreLoad[cpuId][coreKey].reduce(
                  (latest, current) =>
                    new Date(current.createdAt).getTime() >
                    new Date(latest.createdAt).getTime()
                      ? current
                      : latest
                );
              }

              coreData.push({
                x: `Core ${coreIndex}`, // Core number within this CPU
                y: Math.round(latestTempValue.value * 10) / 10,
                load: latestLoadValue
                  ? Math.round(latestLoadValue.value * 10) / 10
                  : undefined,
              });
            }
          });

          // Create a row for this CPU
          heatmapData.push({
            id: `CPU ${cpuIndex}`,
            data: coreData,
          });
        });

        console.log("Restructured heatmap data:", heatmapData);
        setData(heatmapData);
      })
      .catch((err) => {
        console.error("Failed to fetch CPU temperature metrics", err);
      });
  }, [deviceId]);

  if (data.length === 0) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <p>No CPU temperature data available</p>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "flex-start",
        width: "100%",
        minHeight: "350px",
      }}
    >
      <GenericHeatmap
        data={data}
        thresholds={{ normal: 70, caution: 80, serious: 85, critical: 90 }}
        height="350px"
        width="400px" // Reduced width
        enableLabels={true}
        labelSkipWidth={0}
        labelSkipHeight={0}
      />
    </div>
  );
};

export default CPUCoreTempHeatmap;
