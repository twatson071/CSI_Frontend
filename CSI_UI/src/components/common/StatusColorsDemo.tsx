import React from "react";
import {
  STATUS_COLORS,
  StatusType,
  getStatusByThreshold,
  getThresholdStatusColor,
} from "../../services";
import {
  StatusIndicator,
  StatusLegend,
  ThresholdColorBar,
  StatusBadge,
} from "./StatusIndicators";

const StatusColorsDemo: React.FC = () => {
  return (
    <div
      style={{
        padding: "2rem",
        backgroundColor: "var(--color-background-base-default)",
        color: "var(--color-text-primary)",
        maxWidth: "1200px",
        margin: "0 auto",
      }}
    >
      <h1 style={{ marginBottom: "2rem" }}>Status Colors System Demo</h1>

      {/* Color Palette Section */}
      <section style={{ marginBottom: "3rem" }}>
        <h2 style={{ marginBottom: "1rem" }}>Color Palette</h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1rem",
          }}
        >
          {Object.entries(STATUS_COLORS).map(([key, color]) => (
            <div
              key={key}
              style={{
                padding: "1rem",
                border: "1px solid #444",
                borderRadius: "8px",
                backgroundColor: "#1a1a1a",
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: "60px",
                  backgroundColor: color.hex,
                  borderRadius: "4px",
                  marginBottom: "0.5rem",
                }}
              />
              <h3 style={{ margin: 0, fontSize: "1rem" }}>{key}</h3>
              <p style={{ margin: 0, fontSize: "0.875rem", color: "#888" }}>
                {color.description}
              </p>
              <div style={{ fontSize: "0.75rem", color: "#666" }}>
                <div>HEX: {color.hex}</div>
                <div>RGB: {color.rgb}</div>
                <div>CSS: {color.cssVar}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Status Indicators Section */}
      <section style={{ marginBottom: "3rem" }}>
        <h2 style={{ marginBottom: "1rem" }}>Status Indicators</h2>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          <div>
            <h3>Different Sizes:</h3>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <StatusIndicator status="CRITICAL" size="small" showLabel />
              <StatusIndicator status="SERIOUS" size="medium" showLabel />
              <StatusIndicator status="CAUTION" size="large" showLabel />
            </div>
          </div>

          <div>
            <h3>All Status Types:</h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                gap: "0.5rem",
              }}
            >
              {Object.keys(STATUS_COLORS).map((status) => (
                <StatusIndicator
                  key={status}
                  status={status as StatusType}
                  size="medium"
                  showLabel
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Threshold Examples Section */}
      <section style={{ marginBottom: "3rem" }}>
        <h2 style={{ marginBottom: "1rem" }}>Threshold Examples</h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          <div>
            <h3>CPU Temperature Simulation</h3>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              {[45, 65, 75, 85, 95].map((temp) => {
                const status = getStatusByThreshold(temp, 70, 85);
                return (
                  <div
                    key={temp}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "1rem",
                      padding: "0.5rem",
                      backgroundColor: "#1a1a1a",
                      borderRadius: "4px",
                    }}
                  >
                    <StatusIndicator
                      status={
                        status.token
                          .replace("color-status-", "")
                          .toUpperCase() as StatusType
                      }
                      size="medium"
                    />
                    <span>CPU Temp: {temp}°C</span>
                    <span style={{ color: status.hex }}>
                      ({status.description})
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <h3>Threshold Color Bars</h3>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              <div>
                <h4>CPU Utilization (Warning: 70%, Critical: 90%)</h4>
                <ThresholdColorBar
                  warningThreshold={70}
                  criticalThreshold={90}
                  currentValue={45}
                />
                <ThresholdColorBar
                  warningThreshold={70}
                  criticalThreshold={90}
                  currentValue={75}
                />
                <ThresholdColorBar
                  warningThreshold={70}
                  criticalThreshold={90}
                  currentValue={95}
                />
              </div>

              <div>
                <h4>Memory Usage (Warning: 80%, Critical: 95%)</h4>
                <ThresholdColorBar
                  warningThreshold={80}
                  criticalThreshold={95}
                  currentValue={60}
                />
                <ThresholdColorBar
                  warningThreshold={80}
                  criticalThreshold={95}
                  currentValue={85}
                />
                <ThresholdColorBar
                  warningThreshold={80}
                  criticalThreshold={95}
                  currentValue={98}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Threshold Input Indicators Section */}
      <section style={{ marginBottom: "3rem" }}>
        <h2 style={{ marginBottom: "1rem" }}>Threshold Input Indicators</h2>
        <p style={{ marginBottom: "1rem", color: "#888" }}>
          These show how threshold inputs appear in the ManageDevices component:
        </p>

        <div style={{ display: "flex", gap: "2rem" }}>
          <div style={{ position: "relative", minWidth: "200px" }}>
            <div
              style={{
                padding: "0.5rem",
                border: "1px solid #444",
                borderRadius: "4px",
                backgroundColor: "#2a2a2a",
              }}
            >
              <label style={{ fontSize: "0.875rem", color: "#888" }}>
                Warning Threshold
              </label>
              <div style={{ padding: "0.5rem", marginTop: "0.25rem" }}>70</div>
            </div>
            <div
              style={{
                position: "absolute",
                top: "0",
                right: "-8px",
                width: "4px",
                height: "100%",
                backgroundColor: getThresholdStatusColor("warning").hex,
                borderRadius: "2px",
              }}
            />
          </div>

          <div style={{ position: "relative", minWidth: "200px" }}>
            <div
              style={{
                padding: "0.5rem",
                border: "1px solid #444",
                borderRadius: "4px",
                backgroundColor: "#2a2a2a",
              }}
            >
              <label style={{ fontSize: "0.875rem", color: "#888" }}>
                Critical Threshold
              </label>
              <div style={{ padding: "0.5rem", marginTop: "0.25rem" }}>90</div>
            </div>
            <div
              style={{
                position: "absolute",
                top: "0",
                right: "-8px",
                width: "4px",
                height: "100%",
                backgroundColor: getThresholdStatusColor("critical").hex,
                borderRadius: "2px",
              }}
            />
          </div>
        </div>
      </section>

      {/* Status Legend Section */}
      <section style={{ marginBottom: "3rem" }}>
        <h2 style={{ marginBottom: "1rem" }}>Status Legend Component</h2>
        <p style={{ marginBottom: "1rem", color: "#888" }}>
          Use this component to show users what each status color means:
        </p>
        <StatusLegend />
      </section>

      {/* Usage Examples Section */}
      <section>
        <h2 style={{ marginBottom: "1rem" }}>Code Examples</h2>
        <div
          style={{
            backgroundColor: "#1a1a1a",
            padding: "1rem",
            borderRadius: "8px",
            border: "1px solid #444",
          }}
        >
          <pre style={{ margin: 0, fontSize: "0.875rem", color: "#e0e0e0" }}>
            {`// Import status colors
import { STATUS_COLORS, getStatusByThreshold } from '../../services';

// Use direct color access
const criticalColor = STATUS_COLORS.CRITICAL.hex; // ${STATUS_COLORS.CRITICAL.hex}

// Determine status based on thresholds
const status = getStatusByThreshold(85, 70, 90); // Returns CAUTION

// Use in components
<div style={{ backgroundColor: STATUS_COLORS.NORMAL.hex }}>
  Normal status
</div>`}
          </pre>
        </div>
      </section>
    </div>
  );
};

export default StatusColorsDemo;
