import React from "react";
import GenericLineChart from "../../common/GenericLineChart/GenericLineChart";
import { ServerData } from "../../../services/ServerService";

interface TemperatureLineChartProps {
  server: ServerData;
}

const TemperatureLineChart: React.FC<TemperatureLineChartProps> = ({ server }) => {
  const cpus = server.sensors?.cpus
    ? Object.values(server.sensors.cpus)
    : [];
  const gpus = server.sensors?.gpus
    ? Object.values(server.sensors.gpus)
    : [];

  const cpuTempData = cpus.map((cpu, idx) => ({
    x: cpu.id || idx,
    y: cpu.temperature_c ?? 0,
  }));

  const gpuTempData = gpus.map((gpu, idx) => ({
    x: gpu.id || idx,
    y: gpu.temperature_c ?? 0,
  }));

  const chartData = [
    { id: "CPU Temp", data: cpuTempData },
    ...(gpuTempData.length > 0 ? [{ id: "GPU Temp", data: gpuTempData }] : []),
  ];

  if (chartData.every((d) => d.data.length === 0)) {
    return <p>No temperature data available</p>;
  }

  return (
    <GenericLineChart
      data={chartData}
      xScaleType="point"
      axisBottomLegend="Component"
      axisLeftLegend="Temp °C"
      height="250px"
      width="100%"
      colors={["#00A3E0", "#FF6F20"]}
    />
  );
};

export default TemperatureLineChart;

