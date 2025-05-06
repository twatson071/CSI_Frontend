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
}

const GenericLineChart: React.FC<GenericLineChartProps> = ({
  data,
  xScaleType = "time",
  xFormat = "time:%H:%M",
  yScaleMin = 0,
  yScaleMax = "auto",
  axisBottomLegend = "Time",
  axisLeftLegend = "Value",
  height = "300px",
  width = "450px",
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
        xScale={{
          type: xScaleType,
          format: xScaleType === "time" ? "%Y-%m-%dT%H:%M:%S.%LZ" : undefined,
          precision: xScaleType === "time" ? "minute" : undefined,
        }}
        xFormat={xFormat}
        yScale={{
          type: "linear",
          min: yScaleMin,
          max: yScaleMax,
          stacked: false,
        }}
        axisBottom={{
          format: xScaleType === "time" ? "%H:%M" : undefined,
          tickRotation: -45,
          legend: axisBottomLegend,
          legendOffset: 36,
          legendPosition: "middle",
        }}
        axisLeft={{
          legend: axisLeftLegend,
          legendOffset: -40,
          legendPosition: "middle",
        }}
        colors={["#00A6ED"]}
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
                fill: "#FFFFFF",
              },
            },
            legend: {
              text: {
                fill: "#FFFFFF",
              },
            },
          },
          grid: {
            line: {
              stroke: "#444444",
              strokeWidth: 1,
            },
          },
        }}
      />
    </div>
  );
};

export default GenericLineChart;
