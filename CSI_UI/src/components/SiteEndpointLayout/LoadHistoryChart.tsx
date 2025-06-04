import React from "react";
import GenericLineChart from "../../components/common/GenericLineChart/GenericLineChart";

interface LoadHistoryChartProps {
  wattsData: { x: string; y: number }[];
  ampsData?: { x: string; y: number }[];
}

const LoadHistoryChart: React.FC<LoadHistoryChartProps> = ({
  wattsData,
  ampsData,
}) => {
  const chartData = [
    { id: "Watts", data: wattsData },
    ...(ampsData && ampsData.length > 0
      ? [{ id: "Amps", data: ampsData }]
      : []),
  ];

  return (
    <GenericLineChart
      data={chartData}
      xScaleType="time"
      xFormat="time:%H:%M"
      yScaleMin={0}
      yScaleMax={undefined}
      axisBottomLegend="Time"
      axisLeftLegend="Power"
      height="300px"
      width="100%"
      colors={["#00A3E0", "#FF6F20"]}
    />
  );
};

export default LoadHistoryChart;
