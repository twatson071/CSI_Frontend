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
  return (
    <GenericLineChart
      data={[
        { id: "Watts", data: wattsData },
        { id: "Amps", data: ampsData || [] },
      ]}
      xScaleType="time"
      xFormat="time:%H:%M"
      yScaleMin={0}
      yScaleMax={undefined}
      axisBottomLegend="Time"
      axisLeftLegend="Watts"
      height="300px"
      width="100%"
      colors={["#00A3E0", "#FF6F20"]}
    />
  );
};

export default LoadHistoryChart;
