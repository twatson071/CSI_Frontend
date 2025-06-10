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

const CPUCoreTempHeatmap: React.FC<CPUCoreTempHeatmapProps> = ({ deviceId }) => {
  const [data, setData] = useState<{
    id: string;
    data: { x: string; y: number }[];
  }[]>([]);

  useEffect(() => {
    if (!deviceId) return;

    fetchDeviceMetrics(deviceId)
      .then((metrics: Metric[]) => {
        const tempMetrics = metrics.filter((m) =>
          m.metricType.startsWith("cpu_temperature_core_")
        );

        const perCore: Record<string, { createdAt: string; value: number }[]> = {};

        tempMetrics.forEach((m) => {
          const match = m.metricType.match(/cpu_temperature_core_(\d+)/);
          const coreKey = match ? match[1] : "0";
          if (!perCore[coreKey]) perCore[coreKey] = [];
          perCore[coreKey].push({ createdAt: m.createdAt, value: m.value });
        });

        const heatmap = Object.entries(perCore).map(([core, values]) => ({
          id: `Core ${core}`,
          data: values
            .sort(
              (a, b) =>
                new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            )
            .slice(-20)
            .map((v, idx) => ({
              x: idx.toString(),
              y: v.value,
            })),
        }));

        setData(heatmap);
      })
      .catch((err) => {
        console.error("Failed to fetch CPU temperature metrics", err);
      });
  }, [deviceId]);

  if (data.length === 0) {
    return <p>No CPU temperature data available</p>;
  }

  return (
    <GenericHeatmap
      data={data}
      thresholds={{ normal: 70, caution: 80, serious: 85, critical: 90 }}
      height="250px"
      width="100%"
    />
  );
};

export default CPUCoreTempHeatmap;
