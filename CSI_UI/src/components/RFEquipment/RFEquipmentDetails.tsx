import React from "react";
import { RuxContainer, RuxStatus } from "@astrouxds/react";
import "./RFEquipmentDetails.css";

interface RFEquipmentData {
  parameters: Record<string, any>;
  [key: string]: any;
}

interface RFEquipmentDetailsProps {
  deviceName: string;
  data: RFEquipmentData;
}

const RFEquipmentDetails: React.FC<RFEquipmentDetailsProps> = ({
  deviceName,
  data,
}) => {
  if (!data || !data.parameters) {
    return <div>No RF equipment data available</div>;
  }

  // Extract known parameters
  const model = data.parameters.model || "Unknown Model";
  const firmwareVersion = data.parameters.firmware_version || "N/A";
  
  // Handle different RF equipment types
  const isMatrixSwitch = data.parameters.inputPorts || data.parameters.outputPorts;
  const isSignalGenerator = data.parameters.frequencyRange && data.parameters.outputPower;
  const isSDR = data.parameters.channels && data.parameters.sampleRate;

  const renderMatrixSwitch = () => (
    <div className="rf-matrix-section">
      <h4>Matrix Configuration</h4>
      <div className="matrix-grid">
        <div className="matrix-info">
          <span className="label">Input Ports:</span>
          <span className="value">{data.parameters.inputPorts || "N/A"}</span>
        </div>
        <div className="matrix-info">
          <span className="label">Output Ports:</span>
          <span className="value">{data.parameters.outputPorts || "N/A"}</span>
        </div>
        <div className="matrix-info">
          <span className="label">Active Connections:</span>
          <span className="value">{data.parameters.activeConnections || "0"}</span>
        </div>
        <div className="matrix-info">
          <span className="label">Insertion Loss:</span>
          <span className="value">{data.parameters.insertionLoss || "N/A"}</span>
        </div>
      </div>
    </div>
  );

  const renderSignalGenerator = () => (
    <div className="signal-gen-section">
      <h4>Signal Generator Status</h4>
      <div className="signal-grid">
        <div className="signal-info">
          <span className="label">Current Frequency:</span>
          <span className="value highlight">{data.parameters.currentFrequency || "N/A"}</span>
        </div>
        <div className="signal-info">
          <span className="label">Output Power:</span>
          <span className="value highlight">{data.parameters.currentPower || "N/A"}</span>
        </div>
        <div className="signal-info">
          <span className="label">Phase Noise:</span>
          <span className="value">{data.parameters.phaseNoise || "N/A"}</span>
        </div>
      </div>
    </div>
  );

  const renderSDRSystem = () => (
    <div className="sdr-section">
      <h4>SDR System Status</h4>
      <div className="sdr-grid">
        <div className="sdr-info">
          <span className="label">Total Channels:</span>
          <span className="value">{data.parameters.channels || "N/A"}</span>
        </div>
        <div className="sdr-info">
          <span className="label">Active Channels:</span>
          <span className="value highlight">{data.parameters.activeChannels || "0"}</span>
        </div>
        <div className="sdr-info">
          <span className="label">Bandwidth:</span>
          <span className="value">{data.parameters.bandwidth || "N/A"}</span>
        </div>
        <div className="sdr-info">
          <span className="label">Sample Rate:</span>
          <span className="value">{data.parameters.sampleRate || "N/A"}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="rf-equipment-container">
      <RuxContainer>
        <div slot="header">
          <h3>{deviceName}</h3>
          <p className="device-model">{model}</p>
        </div>
        
        <div className="rf-equipment-content">
          <div className="info-section">
            <h4>System Information</h4>
            <div className="info-item">
              <span className="label">Model:</span>
              <span className="value">{model}</span>
            </div>
            <div className="info-item">
              <span className="label">Firmware:</span>
              <span className="value">{firmwareVersion}</span>
            </div>
            {data.parameters.frequencyRange && (
              <div className="info-item">
                <span className="label">Frequency Range:</span>
                <span className="value">{data.parameters.frequencyRange}</span>
              </div>
            )}
            {data.parameters.outputPower && (
              <div className="info-item">
                <span className="label">Max Output Power:</span>
                <span className="value">{data.parameters.outputPower}</span>
              </div>
            )}
          </div>

          {isMatrixSwitch && renderMatrixSwitch()}
          {isSignalGenerator && renderSignalGenerator()}
          {isSDR && renderSDRSystem()}

          {/* Generic parameters display */}
          {!isMatrixSwitch && !isSignalGenerator && !isSDR && (
            <div className="generic-params">
              <h4>Device Parameters</h4>
              <div className="params-grid">
                {Object.entries(data.parameters).map(([key, value]) => {
                  if (key === 'model' || key === 'firmware_version') return null;
                  return (
                    <div key={key} className="param-item">
                      <span className="param-label">
                        {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:
                      </span>
                      <span className="param-value">{String(value)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Additional data sections */}
          {Object.entries(data).map(([section, sectionData]) => {
            if (section === 'parameters' || typeof sectionData !== 'object') return null;
            
            return (
              <div key={section} className="data-section">
                <h4>{section.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</h4>
                <div className="data-grid">
                  {Object.entries(sectionData).map(([key, value]) => (
                    <div key={key} className="data-item">
                      <span className="data-label">
                        {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:
                      </span>
                      <span className="data-value">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </RuxContainer>
    </div>
  );
};

export default RFEquipmentDetails;