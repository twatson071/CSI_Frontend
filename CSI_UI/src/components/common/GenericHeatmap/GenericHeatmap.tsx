import React, { useMemo } from "react";
import { ResponsiveHeatMap } from "@nivo/heatmap";
import { scaleLinear } from "d3-scale";
import { STATUS_COLORS, StatusType } from "../../../services";

export type Status = StatusType;

interface Threshold {
  critical: number;
  serious: number;
  caution: number;
  normal: number;
}

interface HeatmapDataPoint {
  x: string | number;
  y: number;
  load?: number; // Add optional load property
}

interface HeatmapSeries {
  id: string | number;
  data: HeatmapDataPoint[];
}

interface GenericHeatmapProps {
  data: HeatmapSeries[];
  thresholds?: Threshold;
  higherIsBetter?: boolean;
  height?: string;
  width?: string;
  margin?: { top: number; right: number; bottom: number; left: number };
  labelTextColor?: string;
  enableLabels?: boolean;
  labelSkipWidth?: number;
  labelSkipHeight?: number;
}

const GenericHeatmap: React.FC<GenericHeatmapProps> = ({
  data,
  thresholds,
  higherIsBetter = false,
  height = "400px",
  width = "600px",
  margin = { top: 40, right: 80, bottom: 80, left: 100 }, // Increased margins to prevent overlap
  labelTextColor = "#000000",
  enableLabels = false,
  labelSkipWidth = 0,
  labelSkipHeight = 0,
}) => {
  const colorScale = useMemo(() => {
    if (!thresholds) {
      return () => STATUS_COLORS.NORMAL.hex;
    }
    const domain = higherIsBetter
      ? [
          thresholds.normal,
          thresholds.caution,
          thresholds.serious,
          thresholds.critical,
        ]
      : [
          thresholds.critical,
          thresholds.serious,
          thresholds.caution,
          thresholds.normal,
        ];

    const range = higherIsBetter
      ? [
          STATUS_COLORS.NORMAL.hex,
          STATUS_COLORS.CAUTION.hex,
          STATUS_COLORS.SERIOUS.hex,
          STATUS_COLORS.CRITICAL.hex,
        ]
      : [
          STATUS_COLORS.CRITICAL.hex,
          STATUS_COLORS.SERIOUS.hex,
          STATUS_COLORS.CAUTION.hex,
          STATUS_COLORS.NORMAL.hex,
        ];

    const scale = scaleLinear<string>().domain(domain).range(range).clamp(true);
    return (value: number) => scale(value);
  }, [thresholds, higherIsBetter]);

  // Create gradient definitions for SVG
  const gradientId = useMemo(
    () => `heatmap-gradient-${Math.random().toString(36).substr(2, 9)}`,
    []
  );

  // Validate data before rendering
  if (!data || data.length === 0) {
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
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#888",
        }}
      >
        No data available
      </div>
    );
  }

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
        position: "relative",
      }}
    >
      <ResponsiveHeatMap
        data={data}
        margin={margin}
        colors={(cell) => {
          return colorScale(cell.value as number);
        }}
        axisTop={null}
        axisRight={null}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: -45,
          legend: "CPU Cores",
          legendPosition: "middle",
          legendOffset: 60, // Increased offset to prevent overlap
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: "CPUs",
          legendPosition: "middle",
          legendOffset: -70, // Increased offset to prevent overlap
        }}
        emptyColor="#555"
        forceSquare={true} // Force square cells for better proportions
        enableLabels={enableLabels}
        labelTextColor={labelTextColor}
        labelSkipWidth={labelSkipWidth}
        labelSkipHeight={labelSkipHeight}
        cellOpacity={1}
        cellBorderWidth={1}
        cellBorderColor="#ffffff"
        theme={{
          axis: {
            ticks: {
              text: {
                fill: "#ffffff",
                fontSize: 11, // Slightly smaller font to reduce overlap
                fontWeight: 500,
              },
            },
            legend: {
              text: {
                fill: "#ffffff",
                fontSize: 13, // Slightly smaller legend text
                fontWeight: 600,
              },
            },
          },
          labels: {
            text: {
              fill: "#000000",
              fontSize: 10, // Smaller labels for better fit
              fontWeight: 600,
            },
          },
        }}
        defs={[
          // Define gradients for each status
          {
            id: `${gradientId}-critical`,
            type: "linearGradient",
            colors: [
              { offset: 0, color: STATUS_COLORS.CRITICAL.hex },
              { offset: 100, color: "#cc1c1c" },
            ],
          },
          {
            id: `${gradientId}-serious`,
            type: "linearGradient",
            colors: [
              { offset: 0, color: STATUS_COLORS.SERIOUS.hex },
              { offset: 100, color: "#e09900" },
            ],
          },
          {
            id: `${gradientId}-caution`,
            type: "linearGradient",
            colors: [
              { offset: 0, color: STATUS_COLORS.CAUTION.hex },
              { offset: 100, color: "#f0d000" },
            ],
          },
          {
            id: `${gradientId}-normal`,
            type: "linearGradient",
            colors: [
              { offset: 0, color: STATUS_COLORS.NORMAL.hex },
              { offset: 100, color: "#3eb300" },
            ],
          },
          {
            id: `${gradientId}-standby`,
            type: "linearGradient",
            colors: [
              { offset: 0, color: STATUS_COLORS.STANDBY.hex },
              { offset: 100, color: "#1a9ce6" },
            ],
          },
          {
            id: `${gradientId}-off`,
            type: "linearGradient",
            colors: [
              { offset: 0, color: STATUS_COLORS.OFF.hex },
              { offset: 100, color: "#8a939e" },
            ],
          },
        ]}
        fill={[
          // Apply gradients based on value ranges
          {
            match: (cell) => {
              if (!thresholds) return false;
              const value = cell.value as number;
              return higherIsBetter
                ? value >= thresholds.critical
                : value <= thresholds.critical;
            },
            id: `${gradientId}-critical`,
          },
          {
            match: (cell) => {
              if (!thresholds) return false;
              const value = cell.value as number;
              return higherIsBetter
                ? value >= thresholds.serious && value < thresholds.critical
                : value > thresholds.critical && value <= thresholds.serious;
            },
            id: `${gradientId}-serious`,
          },
          {
            match: (cell) => {
              if (!thresholds) return false;
              const value = cell.value as number;
              return higherIsBetter
                ? value >= thresholds.caution && value < thresholds.serious
                : value > thresholds.serious && value <= thresholds.caution;
            },
            id: `${gradientId}-caution`,
          },
          {
            match: (cell) => {
              if (!thresholds) return true;
              const value = cell.value as number;
              return higherIsBetter
                ? value >= thresholds.normal && value < thresholds.caution
                : value > thresholds.caution && value <= thresholds.normal;
            },
            id: `${gradientId}-normal`,
          },
        ]}
        tooltip={({ cell }) => {
          const cellData = cell.data as HeatmapDataPoint;

          // Determine status color based on temperature value and thresholds
          const getStatusColor = (value: number) => {
            if (!thresholds) return STATUS_COLORS.NORMAL.hex;

            if (!higherIsBetter) {
              if (value >= thresholds.critical)
                return STATUS_COLORS.CRITICAL.hex;
              if (value >= thresholds.serious) return STATUS_COLORS.SERIOUS.hex;
              if (value >= thresholds.caution) return STATUS_COLORS.CAUTION.hex;
              return STATUS_COLORS.NORMAL.hex;
            } else {
              if (value <= thresholds.critical)
                return STATUS_COLORS.CRITICAL.hex;
              if (value <= thresholds.serious) return STATUS_COLORS.SERIOUS.hex;
              if (value <= thresholds.caution) return STATUS_COLORS.CAUTION.hex;
              return STATUS_COLORS.NORMAL.hex;
            }
          };

          const tempColor = getStatusColor(cell.value as number);

          return (
            <div
              style={{
                background: "#1a1a1a",
                color: "#ffffff",
                padding: "12px 16px",
                border: "1px solid #444444",
                borderRadius: "8px",
                boxShadow: "0 6px 20px rgba(0, 0, 0, 0.4)",
                fontSize: "14px",
                fontFamily: "system-ui, -apple-system, sans-serif",
                backdropFilter: "blur(8px)",
                minWidth: "180px",
              }}
            >
              <div
                style={{
                  fontWeight: "bold",
                  marginBottom: "8px",
                  color: "#ffffff",
                  borderBottom: "1px solid #444444",
                  paddingBottom: "6px",
                }}
              >
                {cell.serieId} - {cellData.x}
              </div>
              <div style={{ color: "#e0e0e0", marginBottom: "4px" }}>
                Temperature:{" "}
                <span style={{ color: tempColor, fontWeight: "600" }}>
                  {cell.value}°C
                </span>
              </div>
              {cellData.load !== undefined && (
                <div style={{ color: "#e0e0e0" }}>
                  CPU Load:{" "}
                  <span
                    style={{
                      color: STATUS_COLORS.NORMAL.hex,
                      fontWeight: "600",
                    }}
                  >
                    {cellData.load}%
                  </span>
                </div>
              )}
              {cellData.load === undefined && (
                <div style={{ color: "#888", fontSize: "12px" }}>
                  Load data not available
                </div>
              )}
            </div>
          );
        }}
      />
    </div>
  );
};

export default GenericHeatmap;
