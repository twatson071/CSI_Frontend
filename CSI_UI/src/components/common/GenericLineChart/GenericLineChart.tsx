import React from "react";
import { ResponsiveLine } from "@nivo/line";

interface GenericLineChartProps {
  data: Array<{
    id: string | number;
    data: Array<{ x: string | number | Date; y: number }>;
  }>;
  xScaleType?: "linear" | "time" | "point";
  xFormat?: string;
  yScaleMin?: number;
  yScaleMax?: number;
  axisBottomLegend?: string;
  axisLeftLegend?: string;
  height?: string;
  width?: string;
  colors?: string[];
}

const GenericLineChart: React.FC<GenericLineChartProps> = ({
  data,
  xScaleType = "time",
  xFormat = "time:%H:%M",
  yScaleMin = 0,
  axisBottomLegend = "Time",
  axisLeftLegend = "Value",
  height = "300px",
  width = "450px",
  colors = ["#00A6ED"],
}) => {
  return (
    <div
      style={{
        height,
        width,
        margin: "1rem 0",
        padding: "1rem",
        backgroundColor: "var(--color-background-surface-default)",
        border: "1px solid var(--color-border-divider)",
        borderRadius: "8px",
      }}
    >
      <ResponsiveLine
        data={data}
        margin={{ top: 20, right: 20, bottom: 50, left: 60 }}
        xScale={
          xScaleType === "time"
            ? {
                type: "time",
                format: "%Y-%m-%dT%H:%M:%S.%LZ",
                precision: "minute",
              }
            : {
                type: xScaleType,
              }
        }
        xFormat={xFormat}
        yScale={{
          type: "linear",
          min: yScaleMin,
          max: undefined,
          stacked: false,
        }}
        axisBottom={{
          format: xScaleType === "time" ? "%H:%M" : undefined,
          tickRotation: -45,
          tickValues: "every 1 minute",
          legend: axisBottomLegend,
          legendOffset: 36,
          legendPosition: "middle",
        }}
        axisLeft={{
          legend: axisLeftLegend,
          legendOffset: -40,
          legendPosition: "middle",
        }}
        colors={colors} // Pass colors to the chart
        pointColor={{ from: "color" }}
        pointBorderColor={{ from: "serieColor" }}
        pointBorderWidth={2}
        pointSize={8}
        useMesh={true}
        enableSlices="x"
        theme={{
          axis: {
            ticks: {
              text: {
                fill: "#FFFFFF", // Axis tick text color
              },
            },
            legend: {
              text: {
                fill: "#FFFFFF", // Axis legend text color
              },
            },
          },
          grid: {
            line: {
              stroke: "#444444", // Grid line color
              strokeWidth: 1,
            },
          },
          tooltip: {
            container: {
              background: "#333333", // Tooltip background color
              color: "#FFFFFF", // Tooltip text color
              fontSize: "12px",
              borderRadius: "4px",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.5)", // Add a shadow for better visibility
              padding: "8px",
            },
          },
        }}
      />
    </div>
  );
};

export default GenericLineChart;
