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
  RuxProgress,
  RuxStatus,
  RuxCard,
  RuxTabs,
  RuxTab,
} from "@astrouxds/react";
import { usePermissions } from "../../hooks/usePermissions";
import { RESOURCES, ACTIONS } from "../../services/RoleService";
import { getServiceList, createDevice } from "../../services/DeviceService";
import { fetchSiteSummaries } from "../../services/SiteService";
import "./UniversalDeviceDiscovery.css";

interface DiscoveredDevice {
  id: string;
  name: string;
  type: string;
  ipAddress?: string;
  macAddress?: string;
  description?: string;
  manufacturer?: string;
  model?: string;
  firmwareVersion?: string;
  capabilities?: string[];
  metadata: Record<string, any>;
}

interface DiscoveryTarget {
  id: string;
  name: string;
  serviceUrl: string;
  type: string;
  capabilities: string[];
  description?: string;
}

interface UniversalDeviceDiscoveryProps {
  siteId?: number;
  onDeviceAdded?: (device: any) => void;
  onClose?: () => void;
}

const UniversalDeviceDiscovery: React.FC<UniversalDeviceDiscoveryProps> = ({
  siteId,
  onDeviceAdded,
  onClose,
}) => {
  const permissions = usePermissions();
  
  // State management
  const [activeTab, setActiveTab] = useState(0);
  const [discoveryTargets, setDiscoveryTargets] = useState<DiscoveryTarget[]>([]);
  const [selectedTargets, setSelectedTargets] = useState<Set<string>>(new Set());
  const [discoveredDevices, setDiscoveredDevices] = useState<DiscoveredDevice[]>([]);
  const [selectedDevices, setSelectedDevices] = useState<Set<string>>(new Set());
  const [sites, setSites] = useState<{ id: number; name: string }[]>([]);
  const [selectedSite, setSelectedSite] = useState<number>(siteId || 0);
  
  // Discovery state
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [discoveryProgress, setDiscoveryProgress] = useState(0);
  const [discoveryStatus, setDiscoveryStatus] = useState<string>("");
  
  // Manual add state
  const [manualDevice, setManualDevice] = useState({
    name: "",
    type: "",
    ipAddress: "",
    serviceUrl: "",
    description: "",
  });

  // Load initial data
  useEffect(() => {
    loadDiscoveryTargets();
    loadSites();
  }, []);

  const loadDiscoveryTargets = async () => {
    try {
      const services = await getServiceList();
      // Transform services into discovery targets with metadata
      const targets: DiscoveryTarget[] = services.map((service, index) => ({
        id: `target-${index}`,
        name: service.replace(/^https?:\/\//, '').replace(/:\d+$/, ''), // Clean URL for display
        serviceUrl: service,
        type: inferServiceType(service),
        capabilities: inferCapabilities(service),
        description: `Discovery endpoint: ${service}`,
      }));
      setDiscoveryTargets(targets);
    } catch (error) {
      console.error("Failed to load discovery targets:", error);
    }
  };

  const loadSites = async () => {
    try {
      const siteSummaries = await fetchSiteSummaries();
      setSites(siteSummaries.map(s => ({ id: s.siteId, name: s.siteName })));
      if (!selectedSite && siteSummaries.length > 0) {
        setSelectedSite(siteSummaries[0].siteId);
      }
    } catch (error) {
      console.error("Failed to load sites:", error);
    }
  };

  const inferServiceType = (serviceUrl: string): string => {
    const url = serviceUrl.toLowerCase();
    if (url.includes('snmp')) return 'SNMP';
    if (url.includes('modbus')) return 'Modbus';
    if (url.includes('bacnet')) return 'BACnet';
    if (url.includes('opcua')) return 'OPC UA';
    if (url.includes('mqtt')) return 'MQTT';
    if (url.includes('rest') || url.includes('api')) return 'REST API';
    return 'Generic';
  };

  const inferCapabilities = (serviceUrl: string): string[] => {
    const capabilities: string[] = [];
    const url = serviceUrl.toLowerCase();
    
    if (url.includes('snmp')) capabilities.push('Network Discovery', 'MIB Walking', 'Bulk Operations');
    if (url.includes('scan') || url.includes('discovery')) capabilities.push('Auto Discovery');
    if (url.includes('config')) capabilities.push('Configuration Management');
    if (url.includes('monitor')) capabilities.push('Real-time Monitoring');
    
    return capabilities.length > 0 ? capabilities : ['Basic Operations'];
  };

  const startDiscovery = async () => {
    if (selectedTargets.size === 0) return;
    
    setIsDiscovering(true);
    setDiscoveryProgress(0);
    setDiscoveredDevices([]);
    setDiscoveryStatus("Initializing discovery...");

    try {
      const targets = Array.from(selectedTargets);
      const totalTargets = targets.length;
      
      for (let i = 0; i < targets.length; i++) {
        const targetId = targets[i];
        const target = discoveryTargets.find(t => t.id === targetId);
        
        if (!target) continue;
        
        setDiscoveryStatus(`Discovering devices on ${target.name}...`);
        setDiscoveryProgress((i / totalTargets) * 80); // Reserve 20% for processing
        
        // Call discovery API endpoint
        const devices = await discoverDevicesFromTarget(target);
        setDiscoveredDevices(prev => [...prev, ...devices]);
        
        // Small delay to show progress
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      setDiscoveryProgress(100);
      setDiscoveryStatus(`Discovery complete! Found ${discoveredDevices.length} devices.`);
      
    } catch (error) {
      console.error("Discovery failed:", error);
      setDiscoveryStatus("Discovery failed. Please try again.");
    } finally {
      setIsDiscovering(false);
    }
  };

  const discoverDevicesFromTarget = async (target: DiscoveryTarget): Promise<DiscoveredDevice[]> => {
    try {
      // This would call your backend API which handles third-party integrations
      const response = await fetch(`/api/discovery/scan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceUrl: target.serviceUrl,
          type: target.type,
          options: {
            timeout: 30000,
            includeMetadata: true,
          },
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Discovery failed for ${target.name}`);
      }
      
      const data = await response.json();
      
      // Transform API response to our format
      return data.devices?.map((device: any, index: number) => ({
        id: `${target.id}-device-${index}`,
        name: device.name || device.hostname || `Device-${index + 1}`,
        type: device.type || target.type,
        ipAddress: device.ipAddress || device.ip,
        macAddress: device.macAddress || device.mac,
        description: device.description || `Discovered via ${target.name}`,
        manufacturer: device.manufacturer,
        model: device.model,
        firmwareVersion: device.firmwareVersion || device.version,
        capabilities: device.capabilities || [],
        metadata: {
          ...device,
          discoveryTarget: target.name,
          discoveryType: target.type,
          discoveredAt: new Date().toISOString(),
        },
      })) || [];
      
    } catch (error) {
      console.error(`Failed to discover devices from ${target.name}:`, error);
      return [];
    }
  };

  const addSelectedDevices = async () => {
    if (selectedDevices.size === 0 || !selectedSite) return;
    
    try {
      const devicesToAdd = discoveredDevices.filter(d => selectedDevices.has(d.id));
      
      for (const device of devicesToAdd) {
        // Find the appropriate service URL for this device
        const targetId = device.id.split('-device-')[0];
        const target = discoveryTargets.find(t => t.id === targetId);
        
        if (target) {
          await createDevice({
            name: device.name,
            type: device.type,
            serviceUrl: target.serviceUrl,
            siteId: selectedSite,
          });
          
          onDeviceAdded?.(device);
        }
      }
      
      setSelectedDevices(new Set());
      setDiscoveredDevices(prev => prev.filter(d => !selectedDevices.has(d.id)));
      
    } catch (error) {
      console.error("Failed to add devices:", error);
    }
  };

  const addManualDevice = async () => {
    if (!manualDevice.name || !manualDevice.type || !manualDevice.serviceUrl || !selectedSite) {
      return;
    }
    
    try {
      await createDevice({
        name: manualDevice.name,
        type: manualDevice.type,
        serviceUrl: manualDevice.serviceUrl,
        siteId: selectedSite,
      });
      
      setManualDevice({
        name: "",
        type: "",
        ipAddress: "",
        serviceUrl: "",
        description: "",
      });
      
      onDeviceAdded?.(manualDevice);
      
    } catch (error) {
      console.error("Failed to add manual device:", error);
    }
  };

  const toggleTargetSelection = (targetId: string) => {
    setSelectedTargets(prev => {
      const newSet = new Set(prev);
      if (newSet.has(targetId)) {
        newSet.delete(targetId);
      } else {
        newSet.add(targetId);
      }
      return newSet;
    });
  };

  const toggleDeviceSelection = (deviceId: string) => {
    setSelectedDevices(prev => {
      const newSet = new Set(prev);
      if (newSet.has(deviceId)) {
        newSet.delete(deviceId);
      } else {
        newSet.add(deviceId);
      }
      return newSet;
    });
  };

  const canAddDevices = permissions.hasPermission(RESOURCES.DEVICES, ACTIONS.CREATE);

  return (
    <RuxContainer className="universal-device-discovery">
      <div slot="header">
        <div className="discovery-header">
          <h2>Device Discovery & Management</h2>
          {onClose && (
            <RuxButton secondary onClick={onClose}>
              <RuxIcon icon="close" size="small" />
            </RuxButton>
          )}
        </div>
      </div>

      <div className="discovery-content">
        <div className="site-selector">
          <label>Target Site:</label>
          <RuxSelect
            value={selectedSite.toString()}
            onRuxchange={(e: any) => setSelectedSite(parseInt(e.target.value))}
          >
            {sites.map(site => (
              <RuxOption key={site.id} value={site.id.toString()} label={site.name}>
                {site.name}
              </RuxOption>
            ))}
          </RuxSelect>
        </div>

        <RuxTabs>
          <RuxTab selected={activeTab === 0} onClick={() => setActiveTab(0)}>
            Auto Discovery
          </RuxTab>
          <RuxTab selected={activeTab === 1} onClick={() => setActiveTab(1)}>
            Manual Add
          </RuxTab>
        </RuxTabs>

        {activeTab === 0 && (
          <div className="auto-discovery">
            <div className="discovery-targets">
              <h3>Available Discovery Endpoints</h3>
              <div className="targets-grid">
                {discoveryTargets.map(target => (
                  <RuxCard key={target.id} className="target-card">
                    <div className="target-info">
                      <div className="target-header">
                        <RuxCheckbox
                          checked={selectedTargets.has(target.id)}
                          onRuxchange={() => toggleTargetSelection(target.id)}
                        />
                        <div>
                          <h4>{target.name}</h4>
                          <RuxStatus status="normal">{target.type}</RuxStatus>
                        </div>
                      </div>
                      <p className="target-description">{target.description}</p>
                      <div className="target-capabilities">
                        {target.capabilities.map(capability => (
                          <span key={capability} className="capability-tag">
                            {capability}
                          </span>
                        ))}
                      </div>
                    </div>
                  </RuxCard>
                ))}
              </div>

              <div className="discovery-controls">
                <RuxButton
                  onClick={startDiscovery}
                  disabled={selectedTargets.size === 0 || isDiscovering || !canAddDevices}
                >
                  {isDiscovering ? (
                    <>
                      <RuxIcon icon="refresh" className="spinning" />
                      Discovering...
                    </>
                  ) : (
                    <>
                      <RuxIcon icon="search" />
                      Start Discovery
                    </>
                  )}
                </RuxButton>

                {selectedTargets.size > 0 && (
                  <span className="selected-count">
                    {selectedTargets.size} endpoint{selectedTargets.size !== 1 ? 's' : ''} selected
                  </span>
                )}
              </div>

              {isDiscovering && (
                <div className="discovery-progress">
                  <RuxProgress value={discoveryProgress} max={100} />
                  <p>{discoveryStatus}</p>
                </div>
              )}
            </div>

            {discoveredDevices.length > 0 && (
              <div className="discovered-devices">
                <div className="devices-header">
                  <h3>Discovered Devices ({discoveredDevices.length})</h3>
                  <RuxButton
                    onClick={addSelectedDevices}
                    disabled={selectedDevices.size === 0 || !canAddDevices}
                  >
                    <RuxIcon icon="add" />
                    Add Selected ({selectedDevices.size})
                  </RuxButton>
                </div>

                <RuxTable>
                  <RuxTableHeaderRow>
                    <RuxTableHeaderCell>
                      <RuxCheckbox
                        checked={selectedDevices.size === discoveredDevices.length}
                        indeterminate={selectedDevices.size > 0 && selectedDevices.size < discoveredDevices.length}
                        onRuxchange={(e: any) => {
                          if (e.target.checked) {
                            setSelectedDevices(new Set(discoveredDevices.map(d => d.id)));
                          } else {
                            setSelectedDevices(new Set());
                          }
                        }}
                      />
                    </RuxTableHeaderCell>
                    <RuxTableHeaderCell>Name</RuxTableHeaderCell>
                    <RuxTableHeaderCell>Type</RuxTableHeaderCell>
                    <RuxTableHeaderCell>IP Address</RuxTableHeaderCell>
                    <RuxTableHeaderCell>Manufacturer</RuxTableHeaderCell>
                    <RuxTableHeaderCell>Model</RuxTableHeaderCell>
                    <RuxTableHeaderCell>Source</RuxTableHeaderCell>
                  </RuxTableHeaderRow>
                  <RuxTableBody>
                    {discoveredDevices.map(device => (
                      <RuxTableRow key={device.id}>
                        <RuxTableCell>
                          <RuxCheckbox
                            checked={selectedDevices.has(device.id)}
                            onRuxchange={() => toggleDeviceSelection(device.id)}
                          />
                        </RuxTableCell>
                        <RuxTableCell>
                          <div>
                            <strong>{device.name}</strong>
                            {device.description && (
                              <div className="device-description">{device.description}</div>
                            )}
                          </div>
                        </RuxTableCell>
                        <RuxTableCell>
                          <RuxStatus status="normal">{device.type}</RuxStatus>
                        </RuxTableCell>
                        <RuxTableCell>{device.ipAddress || "—"}</RuxTableCell>
                        <RuxTableCell>{device.manufacturer || "—"}</RuxTableCell>
                        <RuxTableCell>{device.model || "—"}</RuxTableCell>
                        <RuxTableCell>{device.metadata.discoveryTarget}</RuxTableCell>
                      </RuxTableRow>
                    ))}
                  </RuxTableBody>
                </RuxTable>
              </div>
            )}
          </div>
        )}

        {activeTab === 1 && (
          <div className="manual-add">
            <RuxCard>
              <h3>Add Device Manually</h3>
              <div className="manual-form">
                <div className="form-row">
                  <RuxInput
                    label="Device Name"
                    value={manualDevice.name}
                    onRuxinput={(e: any) => setManualDevice(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter device name"
                    required
                  />
                  <RuxInput
                    label="Device Type"
                    value={manualDevice.type}
                    onRuxinput={(e: any) => setManualDevice(prev => ({ ...prev, type: e.target.value }))}
                    placeholder="e.g., PDU, Switch, Server"
                    required
                  />
                </div>
                <div className="form-row">
                  <RuxInput
                    label="IP Address"
                    value={manualDevice.ipAddress}
                    onRuxinput={(e: any) => setManualDevice(prev => ({ ...prev, ipAddress: e.target.value }))}
                    placeholder="192.168.1.100"
                  />
                  <RuxSelect
                    label="Service URL"
                    value={manualDevice.serviceUrl}
                    onRuxchange={(e: any) => setManualDevice(prev => ({ ...prev, serviceUrl: e.target.value }))}
                    required
                  >
                    <RuxOption value="" label="Select service endpoint">Select service endpoint</RuxOption>
                    {discoveryTargets.map(target => (
                      <RuxOption key={target.id} value={target.serviceUrl} label={`${target.name} (${target.type})`}>
                        {target.name} ({target.type})
                      </RuxOption>
                    ))}
                  </RuxSelect>
                </div>
                <RuxInput
                  label="Description"
                  value={manualDevice.description}
                  onRuxinput={(e: any) => setManualDevice(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Optional device description"
                />
                <div className="form-actions">
                  <RuxButton
                    onClick={addManualDevice}
                    disabled={!manualDevice.name || !manualDevice.type || !manualDevice.serviceUrl || !canAddDevices}
                  >
                    <RuxIcon icon="add" />
                    Add Device
                  </RuxButton>
                </div>
              </div>
            </RuxCard>
          </div>
        )}
      </div>
    </RuxContainer>
  );
};

export default UniversalDeviceDiscovery;