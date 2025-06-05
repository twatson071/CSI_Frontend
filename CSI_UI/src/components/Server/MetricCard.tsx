import React from "react";
import { RuxIcon } from "@astrouxds/react";
import "./MetricCard.css";

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

interface MetricCardProps {
  title: string;
  value: string;
  unit?: string;
  color?: string; // Made optional since we'll derive from status
  data: number[];
  icon?: string;
  thresholds?: Threshold;
  higherIsBetter?: boolean; // Determines if higher values are better (default: false)
}

const STATUS_COLORS = {
  critical: "#ff3838",
  serious: "#ffb302",
  caution: "#fce83a",
  normal: "#56f000",
  standby: "#2dccff",
  off: "#a4abb6",
};

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  color,
  data,
  icon,
  thresholds,
  higherIsBetter = false,
}) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  // Determine current status based on latest data point and thresholds
  const getCurrentStatus = (): Status => {
    if (!thresholds || data.length === 0) return "normal";

    const currentValue = data[data.length - 1];

    if (higherIsBetter) {
      if (currentValue >= thresholds.normal) return "normal";
      if (currentValue >= thresholds.caution) return "caution";
      if (currentValue >= thresholds.serious) return "serious";
      return "critical";
    } else {
      if (currentValue >= thresholds.critical) return "critical";
      if (currentValue >= thresholds.serious) return "serious";
      if (currentValue >= thresholds.caution) return "caution";
      return "normal";
    }
  };

  const currentStatus = getCurrentStatus();
  const statusColor = color || STATUS_COLORS[currentStatus];

  const sanitizedTitle = title.replace(/\s+/g, "-").toLowerCase();
  const height = 40;

  // Use a base width for calculations but let CSS handle actual width
  const baseWidth = 200;
  const points = data
    .map((point, index) => {
      const x = (index / (data.length - 1)) * baseWidth;
      const y = height - ((point - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div
      className="metric-card"
      style={{ "--accent-color": statusColor } as React.CSSProperties}
    >
      <div className="metric-card-header">
        <div className="metric-card-title">
          {icon && <RuxIcon icon={icon} size="small" />}
          <span>{title}</span>
        </div>
        <RuxIcon icon="more-horiz" size="small" />
      </div>
      <div className="metric-card-value">
        <span className="value">{value}</span>
        {unit && <span className="unit">{unit}</span>}
      </div>
      <div className="metric-card-chart">
        <svg
          height={height}
          viewBox={`0 0 ${baseWidth} ${height}`}
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient
              id={`gradient-${sanitizedTitle}`}
              x1="0%"
              y1="0%"
              x2="0%"
              y2="100%"
            >
              <stop offset="0%" stopColor={statusColor} stopOpacity="0.6" />
              <stop offset="100%" stopColor={statusColor} stopOpacity="0.1" />
            </linearGradient>
          </defs>
          <path
            d={`M 0,${height} L ${points} L ${baseWidth},${height} Z`}
            fill={`url(#gradient-${sanitizedTitle})`}
          />
          <polyline
            points={points}
            fill="none"
            stroke={statusColor}
            strokeWidth="2"
          />
        </svg>
      </div>
    </div>
  );
};

export default MetricCard;
