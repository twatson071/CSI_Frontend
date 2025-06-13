import React from "react";
import GenericLineChart from "../../common/GenericLineChart/GenericLineChart";
import { ServerData } from "../../../services/ServerService";
import { STATUS_COLORS } from "../../../services";

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
      colors={[STATUS_COLORS.CAUTION.hex]}
    />
  );
};

export default RamLineChart;
