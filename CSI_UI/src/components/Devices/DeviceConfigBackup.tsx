import React, { useState, useEffect } from "react";
import {
  RuxContainer,
  RuxButton,
  RuxInput,
  RuxSelect,
  RuxOption,
  RuxTable,
  RuxTableHeaderRow,
  RuxTableHeaderCell,
  RuxTableBody,
  RuxTableRow,
  RuxTableCell,
  RuxCheckbox,
  RuxIcon,
  RuxDialog,
  RuxStatus,
  RuxCard,
  RuxTabs,
  RuxTab,
  RuxProgress,
} from "@astrouxds/react";
import { usePermissions } from "../../hooks/usePermissions";
import { RESOURCES, ACTIONS } from "../../services/RoleService";
import { Device, getDevices } from "../../services/DeviceService";
import { fetchSiteSummaries } from "../../services/SiteService";
import { mapDeviceStatus } from "../../utils/deviceStatusUtils";
import "./DeviceConfigBackup.css";

interface ConfigBackup {
  id: string;
  deviceId: number;
  deviceName: string;
  deviceType: string;
  configData: Record<string, any>;
  metadata: {
    backupDate: string;
    backupType: string;
    version: string;
    size: number;
    checksum: string;
  };
  description?: string;
  tags?: string[];
}

interface DeviceConfigBackupProps {
  onClose?: () => void;
  selectedDevices?: Device[];
}

const DeviceConfigBackup: React.FC<DeviceConfigBackupProps> = ({
  onClose,
  selectedDevices = [],
}) => {
  const permissions = usePermissions();
  
  // State
  const [activeTab, setActiveTab] = useState(0);
  const [devices, setDevices] = useState<Device[]>([]);
  const [sites, setSites] = useState<{ id: number; name: string }[]>([]);
  const [selectedDeviceIds, setSelectedDeviceIds] = useState<Set<number>>(
    new Set(selectedDevices.map(d => d.id))
  );
  
  // Backup state
  const [backups, setBackups] = useState<ConfigBackup[]>([]);
  const [selectedBackups, setSelectedBackups] = useState<Set<string>>(new Set());
  
  // Operation state
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [operationProgress, setOperationProgress] = useState(0);
  const [operationStatus, setOperationStatus] = useState("");
  
  // Form state
  const [backupDescription, setBackupDescription] = useState("");
  const [backupTags, setBackupTags] = useState("");
  const [restoreTarget, setRestoreTarget] = useState<number | null>(null);
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Filters
  const [filterSite, setFilterSite] = useState<number>(0);
  const [filterType, setFilterType] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadDevices();
    loadSites();
    loadBackups();
  }, []);

  const loadDevices = async () => {
    try {
      const deviceList = await getDevices();
      setDevices(deviceList);
    } catch (error) {
      console.error("Failed to load devices:", error);
    }
  };

  const loadSites = async () => {
    try {
      const siteSummaries = await fetchSiteSummaries();
      setSites(siteSummaries.map(s => ({ id: s.siteId, name: s.siteName })));
    } catch (error) {
      console.error("Failed to load sites:", error);
    }
  };

  const loadBackups = async () => {
    try {
      // Call your backend API to get existing backups
      const response = await fetch('/api/device-configs/backups');
      const backupList = await response.json();
      setBackups(backupList);
    } catch (error) {
      console.error("Failed to load backups:", error);
    }
  };

  const performBackup = async () => {
    if (selectedDeviceIds.size === 0) return;
    
    setIsBackingUp(true);
    setOperationProgress(0);
    setOperationStatus("Initializing backup...");
    
    try {
      const deviceIds = Array.from(selectedDeviceIds);
      const totalDevices = deviceIds.length;
      
      for (let i = 0; i < deviceIds.length; i++) {
        const deviceId = deviceIds[i];
        const device = devices.find(d => d.id === deviceId);
        
        if (!device) continue;
        
        setOperationStatus(`Backing up ${device.name} (${i + 1}/${totalDevices})...`);
        setOperationProgress((i / totalDevices) * 90); // Reserve 10% for finalization
        
        // Call backend to backup device configuration
        const response = await fetch('/api/device-configs/backup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            deviceId,
            description: backupDescription,
            tags: backupTags.split(',').map(t => t.trim()).filter(Boolean),
            options: {
              includeSettings: true,
              includeThresholds: true,
              includeCalibration: true,
              compression: true,
            },
          }),
        });
        
        if (!response.ok) {
          throw new Error(`Failed to backup ${device.name}`);
        }
        
        await new Promise(resolve => setTimeout(resolve, 500)); // Prevent overwhelming the API
      }
      
      setOperationProgress(100);
      setOperationStatus("Backup completed successfully!");
      
      // Reload backups and clear selection
      await loadBackups();
      setSelectedDeviceIds(new Set());
      setBackupDescription("");
      setBackupTags("");
      
      setTimeout(() => {
        setIsBackingUp(false);
        setOperationProgress(0);
        setOperationStatus("");
      }, 2000);
      
    } catch (error) {
      console.error("Backup operation failed:", error);
      setOperationStatus(`Backup failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setTimeout(() => setIsBackingUp(false), 3000);
    }
  };

  const performRestore = async (backupId: string, targetDeviceId: number) => {
    setIsRestoring(true);
    setOperationProgress(0);
    setOperationStatus("Preparing restore operation...");
    
    try {
      const backup = backups.find(b => b.id === backupId);
      const targetDevice = devices.find(d => d.id === targetDeviceId);
      
      if (!backup || !targetDevice) {
        throw new Error("Backup or target device not found");
      }
      
      setOperationStatus(`Restoring configuration to ${targetDevice.name}...`);
      setOperationProgress(25);
      
      // Call backend to restore configuration
      const response = await fetch('/api/device-configs/restore', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          backupId,
          targetDeviceId,
          options: {
            validateCompatibility: true,
            createBackupBefore: true,
            restoreSettings: true,
            restoreThresholds: true,
          },
        }),
      });
      
      setOperationProgress(75);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Restore operation failed');
      }
      
      setOperationProgress(100);
      setOperationStatus("Configuration restored successfully!");
      
      setTimeout(() => {
        setIsRestoring(false);
        setOperationProgress(0);
        setOperationStatus("");
        setShowRestoreConfirm(false);
        setRestoreTarget(null);
      }, 2000);
      
    } catch (error) {
      console.error("Restore operation failed:", error);
      setOperationStatus(`Restore failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setTimeout(() => setIsRestoring(false), 3000);
    }
  };

  const deleteBackups = async (backupIds: string[]) => {
    try {
      for (const backupId of backupIds) {
        await fetch(`/api/device-configs/backups/${backupId}`, {
          method: 'DELETE',
        });
      }
      
      await loadBackups();
      setSelectedBackups(new Set());
      setShowDeleteConfirm(false);
      
    } catch (error) {
      console.error("Failed to delete backups:", error);
    }
  };

  const exportBackup = async (backupId: string) => {
    try {
      const response = await fetch(`/api/device-configs/backups/${backupId}/export`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `device-config-${backupId}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to export backup:", error);
    }
  };

  const importBackup = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('backup', file);
      
      const response = await fetch('/api/device-configs/backups/import', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Import failed');
      }
      
      await loadBackups();
    } catch (error) {
      console.error("Failed to import backup:", error);
    }
  };

  const toggleDeviceSelection = (deviceId: number) => {
    setSelectedDeviceIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(deviceId)) {
        newSet.delete(deviceId);
      } else {
        newSet.add(deviceId);
      }
      return newSet;
    });
  };

  const toggleBackupSelection = (backupId: string) => {
    setSelectedBackups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(backupId)) {
        newSet.delete(backupId);
      } else {
        newSet.add(backupId);
      }
      return newSet;
    });
  };

  const filteredDevices = devices.filter(device => {
    const matchesSearch = !searchTerm || 
      device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSite = !filterSite || device.siteId === filterSite;
    const matchesType = filterType === "ALL" || device.type === filterType;
    
    return matchesSearch && matchesSite && matchesType;
  });

  const filteredBackups = backups.filter(backup => {
    return !searchTerm || 
      backup.deviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      backup.deviceType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      backup.description?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const deviceTypes = Array.from(new Set(devices.map(d => d.type)));

  const canBackupRestore = permissions.hasPermission(RESOURCES.DEVICES, ACTIONS.UPDATE);

  return (
    <RuxContainer className="device-config-backup">
      <div slot="header">
        <div className="backup-header">
          <h2>Device Configuration Backup & Restore</h2>
          {onClose && (
            <RuxButton secondary onClick={onClose}>
              <RuxIcon icon="close" size="small" />
            </RuxButton>
          )}
        </div>
      </div>

      <div className="backup-content">
        <RuxTabs>
          <RuxTab selected={activeTab === 0} onClick={() => setActiveTab(0)}>
            Create Backup
          </RuxTab>
          <RuxTab selected={activeTab === 1} onClick={() => setActiveTab(1)}>
            Manage Backups
          </RuxTab>
          <RuxTab selected={activeTab === 2} onClick={() => setActiveTab(2)}>
            Restore Configuration
          </RuxTab>
        </RuxTabs>

        {/* Filters */}
        <div className="backup-filters">
          <RuxInput
            type="search"
            placeholder="Search devices or backups..."
            value={searchTerm}
            onRuxinput={(e: CustomEvent<{value: string}>) => setSearchTerm(e.detail.value)}
            className="search-input"
          />
          
          <RuxSelect
            value={filterSite.toString()}
            onRuxchange={(e: any) => setFilterSite(parseInt((e as CustomEvent<{value: string}>).detail.value) || 0)}
          >
            <RuxOption value="0" label="All Sites">All Sites</RuxOption>
            {sites.map(site => (
              <RuxOption key={site.id} value={site.id.toString()} label={site.name}>
                {site.name}
              </RuxOption>
            ))}
          </RuxSelect>
          
          <RuxSelect
            value={filterType}
            onRuxchange={(e: any) => setFilterType((e as CustomEvent<{value: string}>).detail.value)}
          >
            <RuxOption value="ALL" label="All Types">All Types</RuxOption>
            {deviceTypes.map(type => (
              <RuxOption key={type} value={type} label={type}>
                {type}
              </RuxOption>
            ))}
          </RuxSelect>
        </div>

        {activeTab === 0 && (
          <div className="create-backup">
            <RuxCard>
              <h3>Select Devices to Backup</h3>
              
              <div className="backup-form">
                <div className="form-row">
                  <RuxInput
                    label="Backup Description"
                    value={backupDescription}
                    onRuxinput={(e: CustomEvent<{value: string}>) => setBackupDescription(e.detail.value)}
                    placeholder="Weekly configuration backup"
                  />
                  <RuxInput
                    label="Tags (comma-separated)"
                    value={backupTags}
                    onRuxinput={(e: CustomEvent<{value: string}>) => setBackupTags(e.detail.value)}
                    placeholder="production, scheduled, v2.1"
                  />
                </div>
              </div>

              <RuxTable>
                <RuxTableHeaderRow>
                  <RuxTableHeaderCell>
                    <RuxCheckbox
                      checked={selectedDeviceIds.size === filteredDevices.length && filteredDevices.length > 0}
                      indeterminate={selectedDeviceIds.size > 0 && selectedDeviceIds.size < filteredDevices.length}
                      onRuxchange={(e: any) => {
                        if ((e as CustomEvent<{checked: boolean}>).detail.checked) {
                          setSelectedDeviceIds(new Set(filteredDevices.map(d => d.id)));
                        } else {
                          setSelectedDeviceIds(new Set());
                        }
                      }}
                    />
                  </RuxTableHeaderCell>
                  <RuxTableHeaderCell>Device</RuxTableHeaderCell>
                  <RuxTableHeaderCell>Type</RuxTableHeaderCell>
                  <RuxTableHeaderCell>Site</RuxTableHeaderCell>
                  <RuxTableHeaderCell>Status</RuxTableHeaderCell>
                  <RuxTableHeaderCell>Last Backup</RuxTableHeaderCell>
                </RuxTableHeaderRow>
                <RuxTableBody>
                  {filteredDevices.map(device => {
                    const site = sites.find(s => s.id === device.siteId);
                    const lastBackup = backups
                      .filter(b => b.deviceId === device.id)
                      .sort((a, b) => new Date(b.metadata.backupDate).getTime() - new Date(a.metadata.backupDate).getTime())[0];
                    
                    return (
                      <RuxTableRow key={device.id}>
                        <RuxTableCell>
                          <RuxCheckbox
                            checked={selectedDeviceIds.has(device.id)}
                            onRuxchange={() => toggleDeviceSelection(device.id)}
                          />
                        </RuxTableCell>
                        <RuxTableCell>
                          <div>
                            <strong>{device.name}</strong>
                            {device.ipAddress && (
                              <div className="device-ip">{device.ipAddress}</div>
                            )}
                          </div>
                        </RuxTableCell>
                        <RuxTableCell>
                          <RuxStatus status="normal">{device.type}</RuxStatus>
                        </RuxTableCell>
                        <RuxTableCell>{site?.name || "—"}</RuxTableCell>
                        <RuxTableCell>
                          <RuxStatus status={mapDeviceStatus(device.status)}>{device.status}</RuxStatus>
                        </RuxTableCell>
                        <RuxTableCell>
                          {lastBackup 
                            ? new Date(lastBackup.metadata.backupDate).toLocaleDateString()
                            : "Never"
                          }
                        </RuxTableCell>
                      </RuxTableRow>
                    );
                  })}
                </RuxTableBody>
              </RuxTable>

              <div className="backup-actions">
                <RuxButton
                  onClick={performBackup}
                  disabled={selectedDeviceIds.size === 0 || isBackingUp || !canBackupRestore}
                >
                  {isBackingUp ? (
                    <>
                      <RuxIcon icon="refresh" className="spinning" />
                      Creating Backup... ({selectedDeviceIds.size})
                    </>
                  ) : (
                    <>
                      <RuxIcon icon="backup" />
                      Create Backup ({selectedDeviceIds.size})
                    </>
                  )}
                </RuxButton>
              </div>

              {isBackingUp && (
                <div className="operation-progress">
                  <RuxProgress value={operationProgress} max={100} />
                  <p>{operationStatus}</p>
                </div>
              )}
            </RuxCard>
          </div>
        )}

        {activeTab === 1 && (
          <div className="manage-backups">
            <div className="backup-controls">
              <div className="backup-stats">
                <span className="stat">
                  <strong>{filteredBackups.length}</strong> backups
                </span>
                <span className="stat">
                  <strong>{Math.round(filteredBackups.reduce((sum, b) => sum + b.metadata.size, 0) / 1024 / 1024 * 100) / 100}</strong> MB total
                </span>
              </div>
              
              <div className="backup-actions">
                <input
                  type="file"
                  accept=".json"
                  style={{ display: 'none' }}
                  id="import-backup"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) importBackup(file);
                  }}
                />
                <RuxButton secondary onClick={() => document.getElementById('import-backup')?.click()}>
                  <RuxIcon icon="upload" />
                  Import
                </RuxButton>
                
                {selectedBackups.size > 0 && (
                  <RuxButton secondary onClick={() => setShowDeleteConfirm(true)}>
                    <RuxIcon icon="delete" />
                    Delete ({selectedBackups.size})
                  </RuxButton>
                )}
              </div>
            </div>

            <RuxTable>
              <RuxTableHeaderRow>
                <RuxTableHeaderCell>
                  <RuxCheckbox
                    checked={selectedBackups.size === filteredBackups.length && filteredBackups.length > 0}
                    indeterminate={selectedBackups.size > 0 && selectedBackups.size < filteredBackups.length}
                    onRuxchange={(e: any) => {
                      if ((e as CustomEvent<{checked: boolean}>).detail.checked) {
                        setSelectedBackups(new Set(filteredBackups.map(b => b.id)));
                      } else {
                        setSelectedBackups(new Set());
                      }
                    }}
                  />
                </RuxTableHeaderCell>
                <RuxTableHeaderCell>Device</RuxTableHeaderCell>
                <RuxTableHeaderCell>Type</RuxTableHeaderCell>
                <RuxTableHeaderCell>Description</RuxTableHeaderCell>
                <RuxTableHeaderCell>Date</RuxTableHeaderCell>
                <RuxTableHeaderCell>Size</RuxTableHeaderCell>
                <RuxTableHeaderCell>Actions</RuxTableHeaderCell>
              </RuxTableHeaderRow>
              <RuxTableBody>
                {filteredBackups.map(backup => (
                  <RuxTableRow key={backup.id}>
                    <RuxTableCell>
                      <RuxCheckbox
                        checked={selectedBackups.has(backup.id)}
                        onRuxchange={() => toggleBackupSelection(backup.id)}
                      />
                    </RuxTableCell>
                    <RuxTableCell>
                      <div>
                        <strong>{backup.deviceName}</strong>
                        <div className="backup-version">v{backup.metadata.version}</div>
                      </div>
                    </RuxTableCell>
                    <RuxTableCell>
                      <RuxStatus status="normal">{backup.deviceType}</RuxStatus>
                    </RuxTableCell>
                    <RuxTableCell>
                      <div>
                        {backup.description || "—"}
                        {backup.tags && backup.tags.length > 0 && (
                          <div className="backup-tags">
                            {backup.tags.map(tag => (
                              <span key={tag} className="tag">{tag}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </RuxTableCell>
                    <RuxTableCell>
                      {new Date(backup.metadata.backupDate).toLocaleString()}
                    </RuxTableCell>
                    <RuxTableCell>
                      {Math.round(backup.metadata.size / 1024 * 100) / 100} KB
                    </RuxTableCell>
                    <RuxTableCell>
                      <div className="backup-item-actions">
                        <RuxButton size="small" onClick={() => exportBackup(backup.id)}>
                          <RuxIcon icon="download" size="extra-small" />
                        </RuxButton>
                        {canBackupRestore && (
                          <RuxButton 
                            size="small" 
                            onClick={() => {
                              setRestoreTarget(backup.deviceId);
                              setShowRestoreConfirm(true);
                            }}
                          >
                            <RuxIcon icon="restore" size="extra-small" />
                          </RuxButton>
                        )}
                      </div>
                    </RuxTableCell>
                  </RuxTableRow>
                ))}
              </RuxTableBody>
            </RuxTable>
          </div>
        )}

        {activeTab === 2 && (
          <div className="restore-config">
            <RuxCard>
              <h3>Restore Configuration</h3>
              <p>Select a backup and target device to restore configuration.</p>
              
              <div className="restore-grid">
                <div className="available-backups">
                  <h4>Available Backups</h4>
                  {filteredBackups.map(backup => (
                    <RuxCard 
                      key={backup.id}
                      className="backup-item"
                      onClick={() => setRestoreTarget(backup.deviceId)}
                    >
                      <div className="backup-summary">
                        <div className="backup-device">
                          <strong>{backup.deviceName}</strong>
                          <span className="backup-type">{backup.deviceType}</span>
                        </div>
                        <div className="backup-meta">
                          <span className="backup-date">
                            {new Date(backup.metadata.backupDate).toLocaleDateString()}
                          </span>
                          <span className="backup-size">
                            {Math.round(backup.metadata.size / 1024 * 100) / 100} KB
                          </span>
                        </div>
                      </div>
                      {backup.description && (
                        <p className="backup-desc">{backup.description}</p>
                      )}
                    </RuxCard>
                  ))}
                </div>
              </div>
            </RuxCard>
          </div>
        )}
      </div>

      {/* Restore Confirmation Dialog */}
      {showRestoreConfirm && restoreTarget && (
        <RuxDialog
          open={showRestoreConfirm}
          header="Confirm Configuration Restore"
          message="Are you sure you want to restore this configuration? The current device configuration will be backed up automatically before the restore."
          confirmText={isRestoring ? "Restoring..." : "Restore"}
          denyText="Cancel"
          onRuxdialogclosed={(e: any) => {
            if ((e as CustomEvent<{confirmed: boolean}>).detail.confirmed && !isRestoring) {
              const backup = filteredBackups.find(b => b.deviceId === restoreTarget);
              if (backup) {
                performRestore(backup.id, restoreTarget);
              }
            } else {
              setShowRestoreConfirm(false);
              setRestoreTarget(null);
            }
          }}
        >
          {isRestoring && (
            <div className="operation-progress">
              <RuxProgress value={operationProgress} max={100} />
              <p>{operationStatus}</p>
            </div>
          )}
        </RuxDialog>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <RuxDialog
          open={showDeleteConfirm}
          header="Confirm Delete Backups"
          message={`Are you sure you want to delete ${selectedBackups.size} backup${selectedBackups.size !== 1 ? 's' : ''}? This action cannot be undone.`}
          confirmText="Delete"
          denyText="Cancel"
          onRuxdialogclosed={(e: any) => {
            if ((e as CustomEvent<{confirmed: boolean}>).detail.confirmed) {
              deleteBackups(Array.from(selectedBackups));
            } else {
              setShowDeleteConfirm(false);
            }
          }}
        />
      )}
    </RuxContainer>
  );
};

export default DeviceConfigBackup;