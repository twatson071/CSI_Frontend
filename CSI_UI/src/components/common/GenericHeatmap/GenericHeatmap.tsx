import React, { useMemo } from "react";
import { ResponsiveHeatMap } from "@nivo/heatmap";
import { scaleLinear } from "d3-scale";

export type Status =
  | "off"
  | "standby"
  | "normal"
  | "caution"
  | "serious"
  | "critical";

interface Threshold {
  critical: number;
  serious: number;
  caution: number;
  normal: number;
}

interface HeatmapSeries {
  id: string | number;
  data: Array<{ x: string | number; y: number }>;
}

interface GenericHeatmapProps {
  data: HeatmapSeries[];
  thresholds?: Threshold;
  higherIsBetter?: boolean;
  height?: string;
  width?: string;
}

const STATUS_COLORS: Record<Status, string> = {
  critical: "#ff3838",
  serious: "#ffb302",
  caution: "#fce83a",
  normal: "#56f000",
  standby: "#2dccff",
  off: "#a4abb6",
};

const GenericHeatmap: React.FC<GenericHeatmapProps> = ({
  data,
  thresholds,
  higherIsBetter = false,
  height = "300px",
  width = "450px",
}) => {
  const colorScale = useMemo(() => {
    if (!thresholds) {
      return () => STATUS_COLORS.normal;
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
          STATUS_COLORS.normal,
          STATUS_COLORS.caution,
          STATUS_COLORS.serious,
          STATUS_COLORS.critical,
        ]
      : [
          STATUS_COLORS.critical,
          STATUS_COLORS.serious,
          STATUS_COLORS.caution,
          STATUS_COLORS.normal,
        ];

    const scale = scaleLinear<string>().domain(domain).range(range).clamp(true);
    return (value: number) => scale(value);
  }, [thresholds, higherIsBetter]);

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
      <ResponsiveHeatMap
        data={data}
        margin={{ top: 20, right: 20, bottom: 40, left: 60 }}
        colors={(cell) => colorScale(cell.value as number)}
        axisTop={null}
        axisRight={null}
        axisBottom={{ tickRotation: -45 }}
        axisLeft={{ tickSize: 0 }}
        emptyColor="#555"
        forceSquare={true}
        enableLabels={false}
      />
    </div>
  );
};

export default GenericHeatmap;
