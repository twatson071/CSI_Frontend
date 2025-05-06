import React from "react";
import GenericLineChart from "../../components/common/GenericLineChart/GenericLineChart";

interface LoadHistoryChartProps {
  loadHistory: { x: string; y: number }[];
}

const LoadHistoryChart: React.FC<LoadHistoryChartProps> = ({ loadHistory }) => {
  return (
    <GenericLineChart
      data={[
        {
          id: "Total Draw",
          data: loadHistory,
        },
      ]}
      xScaleType="time"
      xFormat="time:%H:%M"
      yScaleMin={0}
      yScaleMax={120}
      axisBottomLegend="Time"
      axisLeftLegend="Watts"
      height="20rem"
      width="95%"
    />
  );
};

export default LoadHistoryChart;
