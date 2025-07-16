import React from "react";
import { STATUS_COLORS, StatusType } from "../../utils/statusColors";

interface StatusIndicatorProps {
  status: StatusType;
  size?: "small" | "medium" | "large";
  showLabel?: boolean;
  variant?: "dot" | "badge" | "icon";
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  size = "medium",
  showLabel = false,
  variant = "dot",
}) => {
  const color = STATUS_COLORS[status];

  const sizeMap = {
    small: { dot: "8px", badge: "16px", icon: "12px", font: "0.75rem" },
    medium: { dot: "12px", badge: "20px", icon: "16px", font: "0.875rem" },
    large: { dot: "16px", badge: "24px", icon: "20px", font: "1rem" },
  };

  const getStatusIcon = (status: StatusType): string => {
    const iconMap = {
      CRITICAL: "⚠️",
      SERIOUS: "🔥",
      CAUTION: "⚡",
      NORMAL: "✅",
      STANDBY: "🟦",
      OFF: "⚪",
    };
    return iconMap[status] || "●";
  };

  const renderVariant = () => {
    switch (variant) {
      case "badge":
        return (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.375rem",
              padding: "0.25rem 0.5rem",
              backgroundColor: `${color.hex}20`,
              border: `1px solid ${color.hex}`,
              borderRadius: "4px",
              fontSize: sizeMap[size].font,
              fontWeight: "500",
              color: color.hex,
              textTransform: "uppercase",
              letterSpacing: "0.025em",
            }}
          >
            <div
              style={{
                width: sizeMap[size].dot,
                height: sizeMap[size].dot,
                backgroundColor: color.hex,
                borderRadius: "50%",
              }}
            />
            {showLabel && status.toLowerCase()}
          </div>
        );

      case "icon":
        return (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.375rem",
              fontSize: sizeMap[size].icon,
            }}
          >
            <span style={{ color: color.hex }}>{getStatusIcon(status)}</span>
            {showLabel && (
              <span
                style={{
                  fontSize: sizeMap[size].font,
                  color: "var(--color-text-primary)",
                }}
              >
                {status.toLowerCase()}
              </span>
            )}
          </div>
        );

      case "dot":
      default:
        return (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <div
              style={{
                width: sizeMap[size].dot,
                height: sizeMap[size].dot,
                backgroundColor: color.hex,
                borderRadius: "50%",
                flexShrink: 0,
                boxShadow:
                  status === "CRITICAL" ? `0 0 8px ${color.hex}40` : "none",
              }}
              title={color.description}
            />
            {showLabel && (
              <span
                style={{
                  fontSize: sizeMap[size].font,
                  color: "var(--color-text-primary)",
                  textTransform: "capitalize",
                }}
              >
                {status.toLowerCase()}
              </span>
            )}
          </div>
        );
    }
  };

  return renderVariant();
};

export default StatusIndicator;
