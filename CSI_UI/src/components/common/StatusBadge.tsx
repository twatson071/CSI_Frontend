import React from "react";
import { STATUS_COLORS, StatusType } from "../../services";

interface StatusBadgeProps {
  status: StatusType;
  size?: "small" | "medium" | "large";
  variant?: "solid" | "outline" | "subtle";
  showIcon?: boolean;
  children?: React.ReactNode;
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = "medium",
  variant = "solid",
  showIcon = false,
  children,
  className = "",
}) => {
  const color = STATUS_COLORS[status];

  const sizeStyles = {
    small: {
      padding: "0.25rem 0.5rem",
      fontSize: "0.75rem",
      minHeight: "20px",
    },
    medium: {
      padding: "0.375rem 0.75rem",
      fontSize: "0.875rem",
      minHeight: "28px",
    },
    large: {
      padding: "0.5rem 1rem",
      fontSize: "1rem",
      minHeight: "36px",
    },
  };

  const getVariantStyles = () => {
    switch (variant) {
      case "outline":
        return {
          backgroundColor: "transparent",
          border: `2px solid ${color.hex}`,
          color: color.hex,
        };
      case "subtle":
        return {
          backgroundColor: `${color.hex}20`, // 20% opacity
          border: `1px solid ${color.hex}40`, // 40% opacity
          color: color.hex,
        };
      case "solid":
      default:
        return {
          backgroundColor: color.hex,
          border: `1px solid ${color.hex}`,
          color: status === "CAUTION" ? "#000" : "#fff",
        };
    }
  };

  const iconMap = {
    CRITICAL: "⚠️",
    SERIOUS: "🔥",
    CAUTION: "⚡",
    NORMAL: "✅",
    STANDBY: "🟦",
    OFF: "⚪",
  };

  return (
    <>
      {/* Add CSS keyframes for critical pulse animation */}
      {status === "CRITICAL" && (
        <style>
          {`
            @keyframes pulse {
              0% {
                box-shadow: 0 0 0 0 ${color.hex}40;
              }
              70% {
                box-shadow: 0 0 0 8px transparent;
              }
              100% {
                box-shadow: 0 0 0 0 transparent;
              }
            }
          `}
        </style>
      )}
      <div
        className={`status-badge ${className} ${
          status === "CRITICAL" ? "critical-pulse" : ""
        }`}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.375rem",
          borderRadius: "4px",
          fontWeight: "500",
          fontFamily: "var(--font-body-family, sans-serif)",
          textTransform: "uppercase",
          letterSpacing: "0.025em",
          whiteSpace: "nowrap",
          transition: "all 0.2s ease-in-out",
          ...sizeStyles[size],
          ...getVariantStyles(),
          ...(status === "CRITICAL"
            ? {
                animation: "pulse 2s ease-in-out infinite",
              }
            : {}),
        }}
        title={color.description}
      >
        {showIcon && (
          <span style={{ fontSize: "1em", lineHeight: 1 }}>
            {iconMap[status]}
          </span>
        )}
        {children || status.toLowerCase()}
      </div>
    </>
  );
};

export default StatusBadge;
