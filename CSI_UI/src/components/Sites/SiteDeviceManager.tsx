/**
 * Site Device Manager Component
 * Manages sites and their device relationships
 */

import React, { useState } from 'react';
import { useDummyData } from '../../hooks/useDummyData';
import { mapDeviceStatus } from '../../utils/deviceStatusUtils';
import './SiteDeviceManager.css';

const SiteDeviceManager: React.FC = () => {
  const { 
    sites, 
    devices, 
    getDevicesBySite, 
    getStats,
    loadDummyData,
    clearData,
    isLoaded 
  } = useDummyData();
  
  const [selectedSiteId, setSelectedSiteId] = useState<string>('');
  const [showStats, setShowStats] = useState(false);

  const stats = getStats();
  const selectedSiteDevices = selectedSiteId ? getDevicesBySite(selectedSiteId) : [];
  const selectedSite = sites.find(site => site.id === selectedSiteId);

  const handleLoadDummyData = () => {
    loadDummyData();
  };

  const handleClearData = () => {
    clearData();
    setSelectedSiteId('');
  };

  const getStatusColor = (status: string) => {
    const mappedStatus = mapDeviceStatus(status);
    switch (mappedStatus) {
      case 'normal': return '#4caf50';
      case 'caution': return '#ff9800';
      case 'critical': return '#f44336';
      case 'serious': return '#e91e63';
      case 'off': return '#9e9e9e';
      default: return '#9e9e9e';
    }
  };

  return (
    <div className="site-device-manager">
      <div className="manager-header">
        <h2>Site & Device Manager</h2>
        <div className="manager-controls">
          <rux-button 
            size="small" 
            onClick={handleLoadDummyData}
            disabled={isLoaded}
          >
            Load Dummy Data
          </rux-button>
          <rux-button 
            size="small" 
            secondary 
            onClick={handleClearData}
            disabled={!isLoaded}
          >
            Clear Data
          </rux-button>
          <rux-button 
            size="small" 
            onClick={() => setShowStats(!showStats)}
          >
            {showStats ? 'Hide Stats' : 'Show Stats'}
          </rux-button>
        </div>
      </div>

      {!isLoaded && (
        <div className="empty-state">
          <h3>No Data Loaded</h3>
          <p>Click "Load Dummy Data" to populate the system with sample devices and sites.</p>
        </div>
      )}

      {showStats && isLoaded && (
        <div className="stats-panel">
          <h3>System Statistics</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{stats.total}</div>
              <div className="stat-label">Total Devices</div>
            </div>
            <div className="stat-card online">
              <div className="stat-value">{stats.online}</div>
              <div className="stat-label">Online</div>
            </div>
            <div className="stat-card warning">
              <div className="stat-value">{stats.warning}</div>
              <div className="stat-label">Warning</div>
            </div>
            <div className="stat-card critical">
              <div className="stat-value">{stats.critical}</div>
              <div className="stat-label">Critical</div>
            </div>
            <div className="stat-card offline">
              <div className="stat-value">{stats.offline}</div>
              <div className="stat-label">Offline</div>
            </div>
          </div>
          
          <div className="stats-breakdown">
            <div className="breakdown-section">
              <h4>Devices by Type</h4>
              <div className="breakdown-list">
                {Object.entries(stats.byType).map(([type, count]) => (
                  <div key={type} className="breakdown-item">
                    <span className="breakdown-label">{type}</span>
                    <span className="breakdown-value">{count}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="breakdown-section">
              <h4>Devices by Site</h4>
              <div className="breakdown-list">
                {Object.entries(stats.bySite).map(([siteId, count]) => {
                  const site = sites.find(s => s.id === siteId);
                  return (
                    <div key={siteId} className="breakdown-item">
                      <span className="breakdown-label">{site?.name || siteId}</span>
                      <span className="breakdown-value">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {isLoaded && (
        <div className="sites-section">
          <h3>Sites Overview</h3>
          <div className="sites-grid">
            {sites.map(site => {
              const siteDevices = getDevicesBySite(site.id);
              const siteStats = {
                total: siteDevices.length,
                online: siteDevices.filter(d => d.status === 'normal' || d.status === 'online').length,
                warning: siteDevices.filter(d => d.status === 'caution' || d.status === 'warning').length,
                critical: siteDevices.filter(d => d.status === 'critical' || d.status === 'error').length,
                offline: siteDevices.filter(d => d.status === 'off' || d.status === 'offline').length
              };

              return (
                <div 
                  key={site.id} 
                  className={`site-card ${selectedSiteId === site.id ? 'selected' : ''}`}
                  onClick={() => setSelectedSiteId(site.id)}
                >
                  <div className="site-header">
                    <h4>{site.name}</h4>
                    <div className="device-count">{siteStats.total} devices</div>
                  </div>
                  <div className="site-info">
                    <div className="site-location">{site.location}</div>
                    <div className="site-description">{site.description}</div>
                  </div>
                  <div className="site-stats">
                    <div className="mini-stat online">{siteStats.online}</div>
                    <div className="mini-stat warning">{siteStats.warning}</div>
                    <div className="mini-stat critical">{siteStats.critical}</div>
                    <div className="mini-stat offline">{siteStats.offline}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {selectedSite && (
        <div className="site-details">
          <div className="site-details-header">
            <h3>{selectedSite.name} - Device Details</h3>
            <rux-button 
              size="small" 
              secondary 
              onClick={() => setSelectedSiteId('')}
            >
              Close
            </rux-button>
          </div>
          
          <div className="site-info-detailed">
            <div className="info-row">
              <strong>Location:</strong> {selectedSite.location}
            </div>
            <div className="info-row">
              <strong>Description:</strong> {selectedSite.description}
            </div>
            {selectedSite.coordinates && (
              <div className="info-row">
                <strong>Coordinates:</strong> {selectedSite.coordinates.lat}, {selectedSite.coordinates.lng}
              </div>
            )}
          </div>

          <div className="devices-table-container">
            <rux-table>
              <rux-table-header>
                <rux-table-header-row>
                  <rux-table-header-cell>Status</rux-table-header-cell>
                  <rux-table-header-cell>Name</rux-table-header-cell>
                  <rux-table-header-cell>Type</rux-table-header-cell>
                  <rux-table-header-cell>Model</rux-table-header-cell>
                  <rux-table-header-cell>IP Address</rux-table-header-cell>
                  <rux-table-header-cell>Location</rux-table-header-cell>
                  <rux-table-header-cell>Last Seen</rux-table-header-cell>
                </rux-table-header-row>
              </rux-table-header>
              <rux-table-body>
                {selectedSiteDevices.map(device => (
                  <rux-table-row key={device.id}>
                    <rux-table-cell>
                      <rux-status status={mapDeviceStatus(device.status)}>
                        {device.status}
                      </rux-status>
                    </rux-table-cell>
                    <rux-table-cell>{device.name}</rux-table-cell>
                    <rux-table-cell>{device.type}</rux-table-cell>
                    <rux-table-cell>{device.model}</rux-table-cell>
                    <rux-table-cell>{device.ipAddress || 'N/A'}</rux-table-cell>
                    <rux-table-cell>{device.location}</rux-table-cell>
                    <rux-table-cell>
                      {device.lastSeen ? new Date(device.lastSeen).toLocaleString() : 'Never'}
                    </rux-table-cell>
                  </rux-table-row>
                ))}
              </rux-table-body>
            </rux-table>
          </div>
        </div>
      )}
    </div>
  );
};

export default SiteDeviceManager;