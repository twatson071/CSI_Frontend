import React from "react";
import { RuxContainer, RuxStatus } from "@astrouxds/react";
import "./CameraDetails.css";

interface CameraData {
  parameters?: {
    model?: string;
    firmware_version?: string;
    resolution?: string;
    frame_rate?: number;
    bitrate_kbps?: number;
    codec?: string;
    stream_url?: string;
  };
  video_settings?: {
    resolution?: string;
    frame_rate?: number;
    bitrate_kbps?: number;
    codec?: string;
    stream_status?: string;
  };
  rtsp_streams?: Array<{
    stream_id: number;
    name: string;
    url: string;
    resolution: string;
    bitrate_kbps: number;
    status: string;
  }>;
  image_settings?: {
    brightness?: number;
    contrast?: number;
    saturation?: number;
    sharpness?: number;
    white_balance?: string;
  };
  ptz_capabilities?: {
    pan_range_degrees?: number;
    tilt_range_degrees?: number;
    zoom_range?: string;
    preset_positions?: number;
  };
  motion_detection?: {
    enabled?: boolean;
    sensitivity?: number;
    detection_zones?: number;
    current_motion?: boolean;
  };
  network_status?: {
    ip_address?: string;
    gateway?: string;
    dns_primary?: string;
    connection_status?: string;
  };
  storage?: {
    sd_card_present?: boolean;
    sd_card_capacity_gb?: number | null;
    sd_card_used_percent?: number | null;
    recording_status?: string;
  };
}

interface CameraDetailsProps {
  deviceName: string;
  data: CameraData;
}

const CameraDetails: React.FC<CameraDetailsProps> = ({ deviceName, data }) => {
  if (!data) {
    return <div>No camera data available</div>;
  }

  const getStreamStatus = (status?: string) => {
    return status === "active" || status === "connected" ? "normal" : "off";
  };

  const getMotionStatus = (motion?: boolean) => {
    return motion ? "critical" : "normal";
  };

  const getRecordingStatus = (status?: string) => {
    return status === "recording" ? "normal" : "off";
  };

  return (
    <div className="camera-container">
      <RuxContainer>
        <div slot="header">
          <h3>{deviceName}</h3>
          <p className="device-model">{data.parameters?.model || data.video_settings?.codec || "IP Camera"}</p>
        </div>
        
        <div className="camera-info-grid">
          {data.parameters && (
            <div className="info-section">
              <h4>System Information</h4>
              <div className="info-item">
                <span className="label">Model:</span>
                <span className="value">{data.parameters.model || "N/A"}</span>
              </div>
              <div className="info-item">
                <span className="label">Firmware:</span>
                <span className="value">{data.parameters.firmware_version || "N/A"}</span>
              </div>
              {data.parameters.stream_url && (
                <div className="info-item">
                  <span className="label">Stream URL:</span>
                  <span className="value stream-url">{data.parameters.stream_url}</span>
                </div>
              )}
            </div>
          )}

          {(data.video_settings || data.parameters) && (
            <div className="info-section">
              <h4>Video Settings</h4>
              <div className="info-item">
                <span className="label">Resolution:</span>
                <span className="value">{data.video_settings?.resolution || data.parameters?.resolution || "N/A"}</span>
              </div>
              <div className="info-item">
                <span className="label">Frame Rate:</span>
                <span className="value">{data.video_settings?.frame_rate || data.parameters?.frame_rate || "N/A"} fps</span>
              </div>
              <div className="info-item">
                <span className="label">Bitrate:</span>
                <span className="value">{data.video_settings?.bitrate_kbps || data.parameters?.bitrate_kbps || "N/A"} kbps</span>
              </div>
              <div className="info-item">
                <span className="label">Codec:</span>
                <span className="value">{data.video_settings?.codec || data.parameters?.codec || "N/A"}</span>
              </div>
              {data.video_settings?.stream_status && (
                <div className="info-item">
                  <span className="label">Stream Status:</span>
                  <RuxStatus status={getStreamStatus(data.video_settings.stream_status)} />
                </div>
              )}
            </div>
          )}

          {data.network_status && (
            <div className="info-section">
              <h4>Network Status</h4>
              <div className="info-item">
                <span className="label">IP Address:</span>
                <span className="value">{data.network_status.ip_address || "N/A"}</span>
              </div>
              <div className="info-item">
                <span className="label">Gateway:</span>
                <span className="value">{data.network_status.gateway || "N/A"}</span>
              </div>
              <div className="info-item">
                <span className="label">Status:</span>
                <RuxStatus status={getStreamStatus(data.network_status.connection_status)} />
              </div>
            </div>
          )}

          {data.motion_detection && (
            <div className="info-section">
              <h4>Motion Detection</h4>
              <div className="info-item">
                <span className="label">Enabled:</span>
                <span className="value">{data.motion_detection.enabled ? "Yes" : "No"}</span>
              </div>
              {data.motion_detection.enabled && (
                <>
                  <div className="info-item">
                    <span className="label">Sensitivity:</span>
                    <span className="value">{data.motion_detection.sensitivity}/10</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Detection Zones:</span>
                    <span className="value">{data.motion_detection.detection_zones}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Current Motion:</span>
                    <RuxStatus status={getMotionStatus(data.motion_detection.current_motion)} />
                  </div>
                </>
              )}
            </div>
          )}

          {data.storage && (
            <div className="info-section">
              <h4>Storage</h4>
              <div className="info-item">
                <span className="label">SD Card:</span>
                <span className="value">{data.storage.sd_card_present ? "Present" : "Not Present"}</span>
              </div>
              {data.storage.sd_card_present && (
                <>
                  <div className="info-item">
                    <span className="label">Capacity:</span>
                    <span className="value">{data.storage.sd_card_capacity_gb || "N/A"} GB</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Used:</span>
                    <span className="value">{data.storage.sd_card_used_percent || "N/A"}%</span>
                  </div>
                </>
              )}
              <div className="info-item">
                <span className="label">Recording:</span>
                <RuxStatus status={getRecordingStatus(data.storage.recording_status)} />
              </div>
            </div>
          )}

          {data.ptz_capabilities && (
            <div className="info-section">
              <h4>PTZ Capabilities</h4>
              <div className="info-item">
                <span className="label">Pan Range:</span>
                <span className="value">{data.ptz_capabilities.pan_range_degrees}°</span>
              </div>
              <div className="info-item">
                <span className="label">Tilt Range:</span>
                <span className="value">{data.ptz_capabilities.tilt_range_degrees}°</span>
              </div>
              <div className="info-item">
                <span className="label">Zoom:</span>
                <span className="value">{data.ptz_capabilities.zoom_range}</span>
              </div>
              <div className="info-item">
                <span className="label">Presets:</span>
                <span className="value">{data.ptz_capabilities.preset_positions}</span>
              </div>
            </div>
          )}

          {data.image_settings && (
            <div className="info-section">
              <h4>Image Settings</h4>
              <div className="info-item">
                <span className="label">Brightness:</span>
                <span className="value">{data.image_settings.brightness}%</span>
              </div>
              <div className="info-item">
                <span className="label">Contrast:</span>
                <span className="value">{data.image_settings.contrast}%</span>
              </div>
              <div className="info-item">
                <span className="label">Saturation:</span>
                <span className="value">{data.image_settings.saturation}%</span>
              </div>
              <div className="info-item">
                <span className="label">Sharpness:</span>
                <span className="value">{data.image_settings.sharpness}%</span>
              </div>
            </div>
          )}
        </div>

        {data.rtsp_streams && data.rtsp_streams.length > 0 && (
          <div className="streams-section">
            <h4>RTSP Streams</h4>
            <div className="streams-grid">
              {data.rtsp_streams.map((stream) => (
                <div key={stream.stream_id} className="stream-card">
                  <div className="stream-header">
                    <h5>{stream.name}</h5>
                    <RuxStatus status={getStreamStatus(stream.status)} />
                  </div>
                  <div className="stream-info">
                    <div className="stream-item">
                      <span className="stream-label">Resolution:</span>
                      <span className="stream-value">{stream.resolution}</span>
                    </div>
                    <div className="stream-item">
                      <span className="stream-label">Bitrate:</span>
                      <span className="stream-value">{stream.bitrate_kbps} kbps</span>
                    </div>
                    <div className="stream-item stream-url-item">
                      <span className="stream-label">URL:</span>
                      <span className="stream-value stream-url">{stream.url}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="camera-placeholder">
          <p>Live camera feed would appear here</p>
        </div>
      </RuxContainer>
    </div>
  );
};

export default CameraDetails;