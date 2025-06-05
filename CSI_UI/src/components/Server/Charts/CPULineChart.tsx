import React from "react";
import GenericLineChart from "../../common/GenericLineChart/GenericLineChart";
import { ServerData } from "../../../services/ServerService";

interface CPULineChartProps {
  server: ServerData;
}

const CPULineChart: React.FC<CPULineChartProps> = ({ server }) => {
  const cpus = server.sensors?.cpus ? Object.values(server.sensors.cpus) : [];

  const cpuData = [
    {
      id: "CPU Usage",
      data: cpus.map((cpu, idx) => ({
        x: cpu.id || idx,
        y: cpu.utilization_percent ?? 0,
      })),
    },
  ];

  if (cpuData[0].data.length === 0) {
    return <p>No CPU data available</p>;
  }

  return (
    <GenericLineChart
      data={cpuData}
      xScaleType="point"
      axisBottomLegend="CPU"
      axisLeftLegend="Utilization %"
      height="250px"
      width="100%"
      colors={["#00A3E0"]}
    />
  );
};

export default CPULineChart;
