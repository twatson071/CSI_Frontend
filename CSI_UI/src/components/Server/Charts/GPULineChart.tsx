import React from "react";
import GenericLineChart from "../../common/GenericLineChart/GenericLineChart";
import { ServerData } from "../../../services/ServerService";
import { STATUS_COLORS } from "../../../services";

interface GPULineChartProps {
  server: ServerData;
}

const GPULineChart: React.FC<GPULineChartProps> = ({ server }) => {
  const gpus = server.sensors?.gpus ? Object.values(server.sensors.gpus) : [];

  const gpuData = [
    {
      id: "GPU Usage",
      data: gpus.map((gpu, idx) => ({
        x: gpu.id || idx,
        y: (gpu.utilization_percent ?? 0) * 100,
      })),
    },
  ];

  if (gpuData[0].data.length === 0) {
    return <p>No GPU data available</p>;
  }

  return (
    <GenericLineChart
      data={gpuData}
      xScaleType="point"
      axisBottomLegend="GPU"
      axisLeftLegend="Utilization %"
      height="250px"
      width="100%"
      colors={[STATUS_COLORS.SERIOUS.hex]}
    />
  );
};

export default GPULineChart;
