import React from "react";
import GenericLineChart from "../../common/GenericLineChart/GenericLineChart";
import { ServerData } from "../../../services/ServerService";

interface RamLineChartProps {
  server: ServerData;
}

const RamLineChart: React.FC<RamLineChartProps> = ({ server }) => {
  const ramUtil = parseFloat(server.sensors?.ram?.utilization_percent || "0");

  const ramData = [
    {
      id: "RAM Utilization",
      data: [{ x: "RAM", y: ramUtil }],
    },
  ];

  if (isNaN(ramUtil)) {
    return <p>No RAM data available</p>;
  }

  return (
    <GenericLineChart
      data={ramData}
      xScaleType="point"
      axisBottomLegend="RAM"
      axisLeftLegend="Utilization %"
      height="250px"
      width="100%"
      colors={["#938bdb"]}
    />
  );
};

export default RamLineChart;

