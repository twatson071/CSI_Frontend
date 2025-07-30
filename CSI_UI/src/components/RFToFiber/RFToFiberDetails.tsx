import React from "react";
import { RuxContainer, RuxStatus } from "@astrouxds/react";
import "./RFToFiberDetails.css";

interface ChannelStatus {
  input_power_dbm: number;
  output_power_dbm: number;
  optical_power_mw: number;
  link_status: string;
  ber: string;
  rf_gain_db?: number;
  optical_loss_db?: number;
}

interface RFToFiberData {
  parameters: {
    model: string;
    firmware_version: string;
    channels: number;
    frequency_range: string;
    optical_wavelength?: string;
    link_distance?: string;
  };
  channel_status: Record<string, ChannelStatus>;
  alarms?: {
    temperature: boolean;
    input_loss: boolean;
    laser_fault: boolean;
    optical_loss?: boolean;
  };
}

interface RFToFiberDetailsProps {
  deviceName: string;
  data: RFToFiberData;
}

const RFToFiberDetails: React.FC<RFToFiberDetailsProps> = ({
  deviceName,
  data,
}) => {
  if (!data || !data.parameters) {
    return <div>No RF to Fiber data available</div>;
  }

  const { parameters, channel_status, alarms } = data;

  const getAlarmStatus = (alarm: boolean) => {
    return alarm ? "critical" : "normal";
  };

  const getLinkStatus = (status: string) => {
    return status === "active" ? "normal" : "critical";
  };

  return (
    <div className="rf-to-fiber-container">
      <RuxContainer>
        <div slot="header">
          <h3>{deviceName}</h3>
          <p className="device-model">{parameters.model}</p>
        </div>
        
        <div className="rf-info-grid">
          <div className="info-section">
            <h4>System Information</h4>
            <div className="info-item">
              <span className="label">Firmware:</span>
              <span className="value">{parameters.firmware_version}</span>
            </div>
            <div className="info-item">
              <span className="label">Channels:</span>
              <span className="value">{parameters.channels}</span>
            </div>
            <div className="info-item">
              <span className="label">Frequency Range:</span>
              <span className="value">{parameters.frequency_range}</span>
            </div>
            {parameters.optical_wavelength && (
              <div className="info-item">
                <span className="label">Optical Wavelength:</span>
                <span className="value">{parameters.optical_wavelength}</span>
              </div>
            )}
            {parameters.link_distance && (
              <div className="info-item">
                <span className="label">Link Distance:</span>
                <span className="value">{parameters.link_distance}</span>
              </div>
            )}
          </div>

          {alarms && (
            <div className="info-section">
              <h4>System Alarms</h4>
              <div className="alarms-grid">
                <div className="alarm-item">
                  <span className="alarm-label">Temperature</span>
                  <RuxStatus status={getAlarmStatus(alarms.temperature)} />
                </div>
                <div className="alarm-item">
                  <span className="alarm-label">Input Loss</span>
                  <RuxStatus status={getAlarmStatus(alarms.input_loss)} />
                </div>
                <div className="alarm-item">
                  <span className="alarm-label">Laser Fault</span>
                  <RuxStatus status={getAlarmStatus(alarms.laser_fault)} />
                </div>
                {alarms.optical_loss !== undefined && (
                  <div className="alarm-item">
                    <span className="alarm-label">Optical Loss</span>
                    <RuxStatus status={getAlarmStatus(alarms.optical_loss)} />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="channels-section">
          <h4>Channel Status</h4>
          <div className="channels-grid">
            {Object.entries(channel_status || {}).map(([channelKey, channelInfo]) => (
              <div key={channelKey} className="channel-card">
                <div className="channel-header">
                  <h5>{channelKey.replace('_', ' ').toUpperCase()}</h5>
                  <RuxStatus status={getLinkStatus(channelInfo.link_status)} />
                </div>
                
                <div className="channel-metrics">
                  <div className="metric-group">
                    <h6>RF Levels</h6>
                    <div className="metric-item">
                      <span className="metric-label">Input Power:</span>
                      <span className="metric-value">{channelInfo.input_power_dbm} dBm</span>
                    </div>
                    <div className="metric-item">
                      <span className="metric-label">Output Power:</span>
                      <span className="metric-value">{channelInfo.output_power_dbm} dBm</span>
                    </div>
                    {channelInfo.rf_gain_db !== undefined && (
                      <div className="metric-item">
                        <span className="metric-label">RF Gain:</span>
                        <span className="metric-value">{channelInfo.rf_gain_db} dB</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="metric-group">
                    <h6>Optical Levels</h6>
                    <div className="metric-item">
                      <span className="metric-label">Optical Power:</span>
                      <span className="metric-value">{channelInfo.optical_power_mw} mW</span>
                    </div>
                    {channelInfo.optical_loss_db !== undefined && (
                      <div className="metric-item">
                        <span className="metric-label">Optical Loss:</span>
                        <span className="metric-value">{channelInfo.optical_loss_db} dB</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="metric-group">
                    <h6>Link Quality</h6>
                    <div className="metric-item">
                      <span className="metric-label">BER:</span>
                      <span className="metric-value">{channelInfo.ber}</span>
                    </div>
                    <div className="metric-item">
                      <span className="metric-label">Status:</span>
                      <span className="metric-value">{channelInfo.link_status}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </RuxContainer>
    </div>
  );
};

export default RFToFiberDetails;