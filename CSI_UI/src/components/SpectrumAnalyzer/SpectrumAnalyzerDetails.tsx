import React from "react";
import { RuxContainer } from "@astrouxds/react";
import "./SpectrumAnalyzerDetails.css";

interface SpectrumAnalyzerData {
  parameters: {
    model: string;
    firmware_version: string;
    frequency_range: string;
    resolution_bandwidth: string;
    dynamic_range?: string;
    phase_noise?: string;
  };
  current_measurement: {
    center_frequency_mhz: number;
    span_mhz: number;
    rbw_khz: number;
    vbw_khz: number;
    reference_level_dbm: number;
    peak_power_dbm: number;
    noise_floor_dbm: number;
    marker_frequency_mhz?: number;
    marker_amplitude_dbm?: number;
  };
  sweep_status: {
    sweep_time_ms: number;
    sweep_count: number;
    averaging: boolean;
    trace_mode: string;
    detector?: string;
  };
  traces?: Record<string, string>;
}

interface SpectrumAnalyzerDetailsProps {
  deviceName: string;
  data: SpectrumAnalyzerData;
}

const SpectrumAnalyzerDetails: React.FC<SpectrumAnalyzerDetailsProps> = ({
  deviceName,
  data,
}) => {
  if (!data || !data.parameters) {
    return <div>No spectrum analyzer data available</div>;
  }

  const { parameters, current_measurement, sweep_status, traces } = data;

  return (
    <div className="spectrum-analyzer-container">
      <RuxContainer>
        <div slot="header">
          <h3>{deviceName}</h3>
          <p className="device-model">{parameters.model}</p>
        </div>
        
        <div className="spectrum-info-grid">
          <div className="info-section">
            <h4>System Information</h4>
            <div className="info-item">
              <span className="label">Firmware:</span>
              <span className="value">{parameters.firmware_version}</span>
            </div>
            <div className="info-item">
              <span className="label">Frequency Range:</span>
              <span className="value">{parameters.frequency_range}</span>
            </div>
            <div className="info-item">
              <span className="label">Resolution BW:</span>
              <span className="value">{parameters.resolution_bandwidth}</span>
            </div>
            {parameters.dynamic_range && (
              <div className="info-item">
                <span className="label">Dynamic Range:</span>
                <span className="value">{parameters.dynamic_range}</span>
              </div>
            )}
            {parameters.phase_noise && (
              <div className="info-item">
                <span className="label">Phase Noise:</span>
                <span className="value">{parameters.phase_noise}</span>
              </div>
            )}
          </div>

          <div className="info-section">
            <h4>Sweep Status</h4>
            <div className="info-item">
              <span className="label">Sweep Time:</span>
              <span className="value">{sweep_status.sweep_time_ms} ms</span>
            </div>
            <div className="info-item">
              <span className="label">Sweep Count:</span>
              <span className="value">{sweep_status.sweep_count}</span>
            </div>
            <div className="info-item">
              <span className="label">Averaging:</span>
              <span className="value">{sweep_status.averaging ? "ON" : "OFF"}</span>
            </div>
            <div className="info-item">
              <span className="label">Trace Mode:</span>
              <span className="value">{sweep_status.trace_mode.replace('_', ' ').toUpperCase()}</span>
            </div>
            {sweep_status.detector && (
              <div className="info-item">
                <span className="label">Detector:</span>
                <span className="value">{sweep_status.detector}</span>
              </div>
            )}
          </div>
        </div>

        <div className="measurement-section">
          <h4>Current Measurement</h4>
          <div className="measurement-grid">
            <div className="measurement-card">
              <h5>Frequency Settings</h5>
              <div className="measurement-item">
                <span className="meas-label">Center Frequency:</span>
                <span className="meas-value">{current_measurement.center_frequency_mhz} MHz</span>
              </div>
              <div className="measurement-item">
                <span className="meas-label">Span:</span>
                <span className="meas-value">{current_measurement.span_mhz} MHz</span>
              </div>
              <div className="measurement-item">
                <span className="meas-label">RBW:</span>
                <span className="meas-value">{current_measurement.rbw_khz} kHz</span>
              </div>
              <div className="measurement-item">
                <span className="meas-label">VBW:</span>
                <span className="meas-value">{current_measurement.vbw_khz} kHz</span>
              </div>
            </div>

            <div className="measurement-card">
              <h5>Amplitude Readings</h5>
              <div className="measurement-item">
                <span className="meas-label">Reference Level:</span>
                <span className="meas-value">{current_measurement.reference_level_dbm} dBm</span>
              </div>
              <div className="measurement-item">
                <span className="meas-label">Peak Power:</span>
                <span className="meas-value highlight">{current_measurement.peak_power_dbm} dBm</span>
              </div>
              <div className="measurement-item">
                <span className="meas-label">Noise Floor:</span>
                <span className="meas-value">{current_measurement.noise_floor_dbm} dBm</span>
              </div>
              <div className="measurement-item">
                <span className="meas-label">Dynamic Range:</span>
                <span className="meas-value">
                  {Math.abs(current_measurement.peak_power_dbm - current_measurement.noise_floor_dbm)} dB
                </span>
              </div>
            </div>

            {(current_measurement.marker_frequency_mhz !== undefined || 
              current_measurement.marker_amplitude_dbm !== undefined) && (
              <div className="measurement-card">
                <h5>Marker</h5>
                {current_measurement.marker_frequency_mhz !== undefined && (
                  <div className="measurement-item">
                    <span className="meas-label">Frequency:</span>
                    <span className="meas-value">{current_measurement.marker_frequency_mhz} MHz</span>
                  </div>
                )}
                {current_measurement.marker_amplitude_dbm !== undefined && (
                  <div className="measurement-item">
                    <span className="meas-label">Amplitude:</span>
                    <span className="meas-value">{current_measurement.marker_amplitude_dbm} dBm</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {traces && Object.keys(traces).length > 0 && (
          <div className="traces-section">
            <h4>Active Traces</h4>
            <div className="traces-list">
              {Object.entries(traces).map(([traceKey, traceMode]) => (
                <div key={traceKey} className="trace-item">
                  <span className="trace-name">{traceKey.toUpperCase()}</span>
                  <span className="trace-mode">{traceMode.replace('_', ' ').toUpperCase()}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="spectrum-placeholder">
          <p>Spectrum visualization would appear here</p>
        </div>
      </RuxContainer>
    </div>
  );
};

export default SpectrumAnalyzerDetails;