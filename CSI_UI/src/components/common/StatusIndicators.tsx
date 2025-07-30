import React from "react";
import {
  STATUS_COLORS,
  StatusType,
} from "../../utils/statusColors";

// Export StatusBadge component
export { default as StatusBadge } from "./StatusBadge";

interface StatusIndicatorProps {
  status: StatusType;
  size?: "small" | "medium" | "large";
  showLabel?: boolean;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  size = "medium",
  showLabel = false,
}) => {
  const color = STATUS_COLORS[status];

  const sizeMap = {
    small: "8px",
    medium: "12px",
    large: "16px",
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
      }}
    >
      <div
        style={{
          width: sizeMap[size],
          height: sizeMap[size],
          backgroundColor: color.hex,
          borderRadius: "50%",
          flexShrink: 0,
        }}
        title={color.description}
      />
      {showLabel && (
        <span style={{ fontSize: "0.875rem", color: "#fff" }}>
          {status.toLowerCase().replace("_", " ")}
        </span>
      )}
    </div>
  );
};

export const StatusLegend: React.FC = () => {

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
        padding: "1rem",
        border: "1px solid #444",
        borderRadius: "4px",
        backgroundColor: "#1a1a1a",
      }}
    >
      <h4 style={{ color: "#fff", margin: "0 0 0.5rem 0" }}>Status Legend</h4>
      {Object.entries(STATUS_COLORS).map(([key, color]) => (
        <div
          key={key}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
          }}
        >
          <div
            style={{
              width: "12px",
              height: "12px",
              backgroundColor: color.hex,
              borderRadius: "50%",
              flexShrink: 0,
            }}
          />
          <div>
            <div
              style={{
                color: "#fff",
                fontSize: "0.875rem",
                fontWeight: "bold",
              }}
            >
              {key}
            </div>
            <div
              style={{
                color: "#888",
                fontSize: "0.75rem",
              }}
            >
              {color.description}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export const ThresholdColorBar: React.FC<{
  warningThreshold?: number;
  criticalThreshold?: number;
  currentValue?: number;
  width?: string;
  height?: string;
}> = ({
  warningThreshold,
  criticalThreshold,
  currentValue,
  width = "100%",
  height = "8px",
}) => {
  const getSegments = () => {
    const segments = [];

    if (warningThreshold !== undefined) {
      segments.push({
        color: STATUS_COLORS.NORMAL.hex,
        width: `${warningThreshold}%`,
        label: "Normal",
      });
    }

    if (criticalThreshold !== undefined && warningThreshold !== undefined) {
      segments.push({
        color: STATUS_COLORS.CAUTION.hex,
        width: `${criticalThreshold - warningThreshold}%`,
        label: "Warning",
      });

      segments.push({
        color: STATUS_COLORS.CRITICAL.hex,
        width: `${100 - criticalThreshold}%`,
        label: "Critical",
      });
    }

    return segments;
  };

  const segments = getSegments();

  return (
    <div style={{ width, position: "relative" }}>
      <div
        style={{
          display: "flex",
          height,
          borderRadius: "4px",
          overflow: "hidden",
          border: "1px solid #444",
        }}
      >
        {segments.map((segment, index) => (
          <div
            key={index}
            style={{
              backgroundColor: segment.color,
              width: segment.width,
              height: "100%",
            }}
            title={segment.label}
          />
        ))}
      </div>

      {currentValue !== undefined && (
        <div
          style={{
            position: "absolute",
            top: "-2px",
            left: `${Math.min(currentValue, 100)}%`,
            width: "2px",
            height: `calc(${height} + 4px)`,
            backgroundColor: "#fff",
            transform: "translateX(-50%)",
            zIndex: 1,
          }}
          title={`Current: ${currentValue}`}
        />
      )}
    </div>
  );
};
