import React from "react";
import MetricCard from "../MetricCard";
import { ServerData } from "../../../services/ServerService";

interface CPUPerCoreGridProps {
  server: ServerData;
}

const CPUPerCoreGrid: React.FC<CPUPerCoreGridProps> = ({ server }) => {
  const cpus = server.sensors?.cpus ? Object.values(server.sensors.cpus) : [];

  if (cpus.length === 0) {
    return <p>No CPU data available</p>;
  }

  return (
    <div className="metric-cards-container">
      {cpus.map((cpu, idx) => (
        <MetricCard
          key={idx}
          title={`CPU ${cpu.id || idx}`}
          value={`${(cpu.utilization_percent ?? 0).toFixed(1)}`}
          unit="%"
          data={[cpu.utilization_percent ?? 0]}
          thresholds={{
            normal: 0,
            caution: 70,
            serious: 85,
            critical: 95,
          }}
          icon="processor"
        />
      ))}
    </div>
  );
};

export default CPUPerCoreGrid;
