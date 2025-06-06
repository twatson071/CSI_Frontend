import React, { useState, useEffect } from "react";
import MetricCard from "../MetricCard";
import { ServerData } from "../../../services/ServerService";
import { fetchDeviceMetrics } from "../../../services/DeviceService";

interface CPUPerCoreGridProps {
  server: ServerData;
  deviceId: number;
}

const CPUPerCoreGrid: React.FC<CPUPerCoreGridProps> = ({
  server,
  deviceId,
}) => {
  const cpus = server.sensors?.cpus ? Object.values(server.sensors.cpus) : [];
  const [cpuHistoricalData, setCpuHistoricalData] = useState<
    Record<string, number[]>
  >({});

  useEffect(() => {
    if (deviceId) {
      fetchDeviceMetrics(deviceId)
        .then((metrics) => {
          // Filter CPU utilization metrics that have core-specific data
          const cpuMetrics = metrics.filter((m) =>
            m.metricType.startsWith("cpu_utilization_core_")
          );

          // Group metrics by core id
          const perCoreMetrics: Record<
            string,
            { createdAt: string; value: number }[]
          > = {};

          cpuMetrics.forEach((m) => {
            // Extract core ID from metricType like "cpu_utilization_core_0"
            const coreMatch = m.metricType.match(/cpu_utilization_core_(\d+)/);
            const coreKey = coreMatch ? coreMatch[1] : "0";

            if (!perCoreMetrics[coreKey]) perCoreMetrics[coreKey] = [];
            perCoreMetrics[coreKey].push({
              createdAt: m.createdAt,
              value: m.value,
            });
          });

          // For each core, sort by time and keep last 20 values
          const historicalData: Record<string, number[]> = {};
          Object.entries(perCoreMetrics).forEach(([coreKey, values]) => {
            historicalData[coreKey] = values
              .sort(
                (a, b) =>
                  new Date(a.createdAt).getTime() -
                  new Date(b.createdAt).getTime()
              )
              .map((v) => v.value)
              .slice(-20);
          });

          setCpuHistoricalData(historicalData);
        })
        .catch((err) => {
          console.error("Failed to fetch CPU metrics", err);
        });
    }
  }, [deviceId, cpus.length]);

  // Update historical data when server data changes
  useEffect(() => {
    if (cpus.length > 0) {
      setCpuHistoricalData((prev) => {
        const updated = { ...prev };
        cpus.forEach((cpu, idx) => {
          const cpuKey = cpu.id || idx.toString();
          const currentValue = cpu.utilization_percent ?? 0;
          const existingData = updated[cpuKey] || [];

          // Only add if the value has changed or this is the first value
          const lastValue = existingData[existingData.length - 1];
          if (existingData.length === 0 || currentValue !== lastValue) {
            updated[cpuKey] = [...existingData.slice(-19), currentValue];
          }
        });
        return updated;
      });
    }
  }, [cpus]);

  if (cpus.length === 0) {
    return <p>No CPU data available</p>;
  }

  return (
    <div className="metric-cards-container">
      {cpus.map((cpu, idx) => {
        const cpuKey = cpu.id || idx.toString();
        const historicalData = cpuHistoricalData[cpuKey] || [
          cpu.utilization_percent ?? 0,
        ];

        return (
          <MetricCard
            key={idx}
            title={`CPU ${cpu.id || idx}`}
            value={`${(cpu.utilization_percent ?? 0).toFixed(1)}`}
            unit="%"
            data={historicalData}
            thresholds={{
              normal: 0,
              caution: 70,
              serious: 85,
              critical: 95,
            }}
            icon="processor"
          />
        );
      })}
    </div>
  );
};

export default CPUPerCoreGrid;
