import React from "react";
import { RuxIcon } from "@astrouxds/react";
import "./MetricCard.css";

interface MetricCardProps {
  title: string;
  value: string;
  unit?: string;
  color: string;
  data: number[];
  icon?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  color,
  data,
  icon,
}) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  // Sanitize title for use as SVG ID
  const sanitizedTitle = title.replace(/\s+/g, "-").toLowerCase();

  // Create SVG path for sparkline
  const width = 200;
  const height = 40;
  const points = data
    .map((point, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((point - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div
      className="metric-card"
      style={{ "--accent-color": color } as React.CSSProperties}
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
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
          <defs>
            <linearGradient
              id={`gradient-${sanitizedTitle}`}
              x1="0%"
              y1="0%"
              x2="0%"
              y2="100%"
            >
              <stop offset="0%" stopColor={color} stopOpacity="0.6" />
              <stop offset="100%" stopColor={color} stopOpacity="0.1" />
            </linearGradient>
          </defs>
          <path
            d={`M 0,${height} L ${points} L ${width},${height} Z`}
            fill={`url(#gradient-${sanitizedTitle})`}
          />
          <polyline
            points={points}
            fill="none"
            stroke={color}
            strokeWidth="2"
          />
        </svg>
      </div>
    </div>
  );
};

export default MetricCard;
