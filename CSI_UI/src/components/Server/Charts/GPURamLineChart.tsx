import React from "react";
import GenericLineChart from "../../common/GenericLineChart/GenericLineChart";
import { ServerData } from "../../../services/ServerService";

interface GPURamLineChartProps {
  server: ServerData;
}

const GPURamLineChart: React.FC<GPURamLineChartProps> = ({ server }) => {
  const gpus = server.sensors?.gpus
    ? Object.values(server.sensors.gpus)
    : [];

  const gpuRamData = [
    {
      id: "GPU RAM Utilization",
      data: gpus.map((gpu, idx) => {
        const total = gpu.memory_total_bytes ?? 0;
        const used = gpu.memory_used_bytes ?? 0;
        const percent = total > 0 ? (used / total) * 100 : 0;
        return { x: gpu.id || idx, y: percent };
      }),
    },
  ];

  if (gpuRamData[0].data.length === 0) {
    return <p>No GPU RAM data available</p>;
  }

  return (
    <GenericLineChart
      data={gpuRamData}
      xScaleType="point"
      axisBottomLegend="GPU"
      axisLeftLegend="RAM Usage %"
      height="250px"
      width="100%"
      colors={["#00c7cb"]}
    />
  );
};

export default GPURamLineChart;

