import React, { useState, useEffect, useMemo } from "react";
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
  RuxPopUp,
  RuxMenu,
  RuxMenuItem,
  RuxDialog,
  RuxStatus,
  RuxCard,
  RuxTabs,
  RuxTab,
  RuxProgress,
} from "@astrouxds/react";
import { usePermissions } from "../../hooks/usePermissions";
import { RESOURCES, ACTIONS } from "../../services/RoleService";
import { Device, getDevices, updateDevice, deleteDevice } from "../../services/DeviceService";
import { fetchSiteSummaries } from "../../services/SiteService";
import UniversalDeviceDiscovery from "./UniversalDeviceDiscovery";
import FlexibleDeviceForm from "./FlexibleDeviceForm";
import { mapDeviceStatus } from "../../utils/deviceStatusUtils";
import { useDummyData } from "../../hooks/useDummyData";
import "./EnhancedDeviceManagement.css";

interface EnhancedDeviceManagementProps {
  siteId?: number;
  onDeviceSelect?: (device: Device) => void;
}

type ViewMode = "table" | "cards" | "grid";
type SortField = "name" | "type" | "status" | "lastSeen" | "site";
type SortDirection = "asc" | "desc";

const EnhancedDeviceManagement: React.FC<EnhancedDeviceManagementProps> = ({
  siteId,
  onDeviceSelect,
}) => {
  const permissions = usePermissions();
  const dummyData = useDummyData();
  
  // State management
  const [devices, setDevices] = useState<Device[]>([]);
  const [filteredDevices, setFilteredDevices] = useState<Device[]>([]);
  const [selectedDevices, setSelectedDevices] = useState<Set<number>>(new Set());
  const [sites, setSites] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [useDummyDataMode, setUseDummyDataMode] = useState(false);
  
  // View and filtering state
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSite, setFilterSite] = useState<number>(siteId || 0);
  const [filterType, setFilterType] = useState<string>("ALL");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  
  // Modal state
  const [showDiscovery, setShowDiscovery] = useState(false);
  const [showDeviceForm, setShowDeviceForm] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Bulk operations state
  const [bulkOperation, setBulkOperation] = useState<string>("");
  const [bulkProgress, setBulkProgress] = useState(0);
  const [bulkStatus, setBulkStatus] = useState<string>("");

  // Load data
  useEffect(() => {
    loadDevices();
    loadSites();
  }, []);

  // Filter and sort devices
  useEffect(() => {
    filterAndSortDevices();
  }, [devices, searchTerm, filterSite, filterType, filterStatus, sortField, sortDirection]);

  const loadDevices = async () => {
    try {
      setLoading(true);
      const deviceList = await getDevices();
      setDevices(deviceList);
    } catch (error) {
      console.error("Failed to load devices:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadSites = async () => {
    try {
      const siteSummaries = await fetchSiteSummaries();
      setSites(siteSummaries.map(s => ({ id: s.siteId, name: s.name })));
    } catch (error) {
      console.error("Failed to load sites:", error);
    }
  };

  const filterAndSortDevices = () => {
    let filtered = devices.filter(device => {
      const matchesSearch = !searchTerm || 
        device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        device.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        device.ipAddress?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesSite = !filterSite || device.siteId === filterSite;
      const matchesType = filterType === "ALL" || device.type === filterType;
      const matchesStatus = filterStatus === "ALL" || device.status === filterStatus;
      
      return matchesSearch && matchesSite && matchesType && matchesStatus;
    });

    // Sort devices
    filtered.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];
      
      if (sortField === "lastSeen") {
        aValue = new Date(a.updatedAt || a.createdAt || 0).getTime();
        bValue = new Date(b.updatedAt || b.createdAt || 0).getTime();
      } else if (sortField === "site") {
        const aSite = sites.find(s => s.id === a.siteId);
        const bSite = sites.find(s => s.id === b.siteId);
        aValue = aSite?.name || "";
        bValue = bSite?.name || "";
      }
      
      if (typeof aValue === "string" && typeof bValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      return sortDirection === "asc" ? comparison : -comparison;
    });

    setFilteredDevices(filtered);
  };

  const deviceTypes = useMemo(() => {
    return Array.from(new Set(devices.map(d => d.type)));
  }, [devices]);

  const statusTypes = useMemo(() => {
    return Array.from(new Set(devices.map(d => d.status)));
  }, [devices]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const toggleDeviceSelection = (deviceId: number) => {
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

  const handleSelectAll = () => {
    if (selectedDevices.size === filteredDevices.length) {
      setSelectedDevices(new Set());
    } else {
      setSelectedDevices(new Set(filteredDevices.map(d => d.id)));
    }
  };

  const handleDeviceAdded = (device: any) => {
    loadDevices(); // Reload to get the new device
    setShowDiscovery(false);
    setShowDeviceForm(false);
  };

  const handleEditDevice = (device: Device) => {
    setEditingDevice(device);
    setShowDeviceForm(true);
  };

  const handleDeleteDevice = async (device: Device) => {
    try {
      await deleteDevice(device.id);
      loadDevices();
    } catch (error) {
      console.error("Failed to delete device:", error);
    }
  };

  const executeBulkOperation = async (operation: string) => {
    if (selectedDevices.size === 0) return;
    
    setBulkOperation(operation);
    setBulkProgress(0);
    setBulkStatus("Starting bulk operation...");
    
    const deviceIds = Array.from(selectedDevices);
    const totalDevices = deviceIds.length;
    
    try {
      for (let i = 0; i < deviceIds.length; i++) {
        const deviceId = deviceIds[i];
        setBulkStatus(`Processing device ${i + 1} of ${totalDevices}...`);
        setBulkProgress((i / totalDevices) * 100);
        
        switch (operation) {
          case 'enable':
            await updateDevice(deviceId, { status: 'normal' });
            break;
          case 'disable':
            await updateDevice(deviceId, { status: 'off' });
            break;
          case 'delete':
            await deleteDevice(deviceId);
            break;
          case 'refresh':
            // Trigger device refresh/polling
            await fetch(`/api/devices/${deviceId}/refresh`, { method: 'POST' });
            break;
        }
        
        await new Promise(resolve => setTimeout(resolve, 200)); // Small delay
      }
      
      setBulkProgress(100);
      setBulkStatus(`Bulk operation completed successfully!`);
      
      // Reload devices and clear selection
      await loadDevices();
      setSelectedDevices(new Set());
      
      setTimeout(() => {
        setBulkOperation("");
        setShowBulkActions(false);
      }, 2000);
      
    } catch (error) {
      console.error("Bulk operation failed:", error);
      setBulkStatus("Bulk operation failed. Please try again.");
      setTimeout(() => setBulkOperation(""), 3000);
    }
  };

  const renderSortHeader = (field: SortField, label: string) => (
    <RuxTableHeaderCell onClick={() => handleSort(field)} className="sortable">
      <div className="sort-header">
        <span>{label}</span>
        {sortField === field && (
          <RuxIcon 
            icon={sortDirection === "asc" ? "arrow-upward" : "arrow-downward"} 
            size="extra-small" 
          />
        )}
      </div>
    </RuxTableHeaderCell>
  );

  const renderDeviceTable = () => (
    <RuxTable className="devices-table">
      <RuxTableHeaderRow>
        <RuxTableHeaderCell className="checkbox-column">
          <RuxCheckbox
            checked={selectedDevices.size === filteredDevices.length && filteredDevices.length > 0}
            indeterminate={selectedDevices.size > 0 && selectedDevices.size < filteredDevices.length}
            onRuxchange={handleSelectAll}
          />
        </RuxTableHeaderCell>
        {renderSortHeader("name", "Name")}
        {renderSortHeader("type", "Type")}
        <RuxTableHeaderCell>Site</RuxTableHeaderCell>
        {renderSortHeader("status", "Status")}
        <RuxTableHeaderCell>IP Address</RuxTableHeaderCell>
        {renderSortHeader("lastSeen", "Last Seen")}
        <RuxTableHeaderCell>Actions</RuxTableHeaderCell>
      </RuxTableHeaderRow>
      <RuxTableBody>
        {filteredDevices.map(device => {
          const site = sites.find(s => s.id === device.siteId);
          const isSelected = selectedDevices.has(device.id);
          
          return (
            <RuxTableRow key={device.id} className={isSelected ? "selected" : ""}>
              <RuxTableCell>
                <RuxCheckbox
                  checked={isSelected}
                  onRuxchange={() => toggleDeviceSelection(device.id)}
                />
              </RuxTableCell>
              <RuxTableCell>
                <div className="device-name">
                  <strong>{device.name}</strong>
                  {device.parameters?.description && (
                    <div className="device-description">{device.parameters.description}</div>
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
              <RuxTableCell>{device.ipAddress || "—"}</RuxTableCell>
              <RuxTableCell>
                {device.updatedAt ? new Date(device.updatedAt).toLocaleString() : "Never"}
              </RuxTableCell>
              <RuxTableCell>
                <div className="device-actions">
                  {permissions.hasPermission(RESOURCES.DEVICES, ACTIONS.UPDATE) && (
                    <RuxButton size="small" onClick={() => handleEditDevice(device)}>
                      <RuxIcon icon="edit" size="extra-small" />
                    </RuxButton>
                  )}
                  {onDeviceSelect && (
                    <RuxButton size="small" onClick={() => onDeviceSelect(device)}>
                      <RuxIcon icon="visibility" size="extra-small" />
                    </RuxButton>
                  )}
                  {permissions.hasPermission(RESOURCES.DEVICES, ACTIONS.DELETE) && (
                    <RuxButton 
                      size="small" 
                      secondary 
                      onClick={() => handleDeleteDevice(device)}
                    >
                      <RuxIcon icon="delete" size="extra-small" />
                    </RuxButton>
                  )}
                </div>
              </RuxTableCell>
            </RuxTableRow>
          );
        })}
      </RuxTableBody>
    </RuxTable>
  );

  const renderDeviceCards = () => (
    <div className="devices-cards">
      {filteredDevices.map(device => {
        const site = sites.find(s => s.id === device.siteId);
        const isSelected = selectedDevices.has(device.id);
        
        return (
          <RuxCard key={device.id} className={`device-card ${isSelected ? "selected" : ""}`}>
            <div className="card-header">
              <RuxCheckbox
                checked={isSelected}
                onRuxchange={() => toggleDeviceSelection(device.id)}
              />
              <div className="device-info">
                <h4>{device.name}</h4>
                <div className="device-meta">
                  <RuxStatus status="normal">{device.type}</RuxStatus>
                  <RuxStatus status={mapDeviceStatus(device.status)}>{device.status}</RuxStatus>
                </div>
              </div>
            </div>
            <div className="card-content">
              <div className="device-details">
                <div className="detail-item">
                  <span className="label">Site:</span>
                  <span>{site?.name || "—"}</span>
                </div>
                <div className="detail-item">
                  <span className="label">IP:</span>
                  <span>{device.ipAddress || "—"}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Last Seen:</span>
                  <span>{device.updatedAt ? new Date(device.updatedAt).toLocaleDateString() : "Never"}</span>
                </div>
              </div>
            </div>
            <div className="card-actions">
              {permissions.hasPermission(RESOURCES.DEVICES, ACTIONS.UPDATE) && (
                <RuxButton size="small" onClick={() => handleEditDevice(device)}>
                  <RuxIcon icon="edit" size="extra-small" />
                </RuxButton>
              )}
              {onDeviceSelect && (
                <RuxButton size="small" onClick={() => onDeviceSelect(device)}>
                  <RuxIcon icon="visibility" size="extra-small" />
                </RuxButton>
              )}
            </div>
          </RuxCard>
        );
      })}
    </div>
  );

  const canCreateDevices = permissions.hasPermission(RESOURCES.DEVICES, ACTIONS.CREATE);
  const canUpdateDevices = permissions.hasPermission(RESOURCES.DEVICES, ACTIONS.UPDATE);
  const canDeleteDevices = permissions.hasPermission(RESOURCES.DEVICES, ACTIONS.DELETE);

  return (
    <RuxContainer className="enhanced-device-management">
      <div slot="header">
        <div className="management-header">
          <h2>Device Management</h2>
          <div className="header-actions">
            {canCreateDevices && (
              <>
                <RuxButton onClick={() => setShowDiscovery(true)}>
                  <RuxIcon icon="search" size="small" />
                  Discover Devices
                </RuxButton>
                <RuxButton onClick={() => setShowDeviceForm(true)}>
                  <RuxIcon icon="add" size="small" />
                  Add Device
                </RuxButton>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="management-content">
        {/* Filters and Controls */}
        <div className="management-controls">
          <div className="search-and-filters">
            <RuxInput
              type="search"
              placeholder="Search devices, types, IP addresses..."
              value={searchTerm}
              onRuxinput={(e: any) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            
            <RuxSelect
              value={filterSite.toString()}
              onRuxchange={(e: any) => setFilterSite(parseInt(e.target.value) || 0)}
            >
              <RuxOption value="0">All Sites</RuxOption>
              {sites.map(site => (
                <RuxOption key={site.id} value={site.id.toString()}>
                  {site.name}
                </RuxOption>
              ))}
            </RuxSelect>
            
            <RuxSelect
              value={filterType}
              onRuxchange={(e: any) => setFilterType(e.target.value)}
            >
              <RuxOption value="ALL">All Types</RuxOption>
              {deviceTypes.map(type => (
                <RuxOption key={type} value={type}>
                  {type}
                </RuxOption>
              ))}
            </RuxSelect>
            
            <RuxSelect
              value={filterStatus}
              onRuxchange={(e: any) => setFilterStatus(e.target.value)}
            >
              <RuxOption value="ALL">All Status</RuxOption>
              {statusTypes.map(status => (
                <RuxOption key={status} value={status}>
                  {status}
                </RuxOption>
              ))}
            </RuxSelect>
          </div>

          <div className="view-and-bulk">
            <div className="view-controls">
              <RuxButton 
                secondary={viewMode !== "table"}
                onClick={() => setViewMode("table")}
                size="small"
              >
                <RuxIcon icon="view_list" size="extra-small" />
              </RuxButton>
              <RuxButton 
                secondary={viewMode !== "cards"}
                onClick={() => setViewMode("cards")}
                size="small"
              >
                <RuxIcon icon="view_module" size="extra-small" />
              </RuxButton>
            </div>

            {selectedDevices.size > 0 && (canUpdateDevices || canDeleteDevices) && (
              <RuxPopUp 
                open={showBulkActions}
                onRuxtoggle={(e: any) => setShowBulkActions(e.detail)}
                placement="bottom-start"
              >
                <RuxButton slot="trigger">
                  <RuxIcon icon="more_vert" size="small" />
                  Bulk Actions ({selectedDevices.size})
                </RuxButton>
                <RuxMenu>
                  {canUpdateDevices && (
                    <>
                      <RuxMenuItem onClick={() => executeBulkOperation('enable')}>
                        <RuxIcon icon="play_arrow" size="small" />
                        Enable Selected
                      </RuxMenuItem>
                      <RuxMenuItem onClick={() => executeBulkOperation('disable')}>
                        <RuxIcon icon="pause" size="small" />
                        Disable Selected
                      </RuxMenuItem>
                      <RuxMenuItem onClick={() => executeBulkOperation('refresh')}>
                        <RuxIcon icon="refresh" size="small" />
                        Refresh Selected
                      </RuxMenuItem>
                    </>
                  )}
                  {canDeleteDevices && (
                    <RuxMenuItem onClick={() => setShowDeleteConfirm(true)}>
                      <RuxIcon icon="delete" size="small" />
                      Delete Selected
                    </RuxMenuItem>
                  )}
                </RuxMenu>
              </RuxPopUp>
            )}
          </div>
        </div>

        {/* Device List */}
        <div className="devices-container">
          {loading ? (
            <div className="loading-state">
              <RuxIcon icon="refresh" className="spinning" size="large" />
              <p>Loading devices...</p>
            </div>
          ) : filteredDevices.length === 0 ? (
            <div className="empty-state">
              <RuxIcon icon="device_hub" size="large" />
              <h3>No Devices Found</h3>
              <p>
                {searchTerm || filterSite || filterType !== "ALL" || filterStatus !== "ALL" 
                  ? "No devices match your current filters."
                  : "Get started by discovering or adding devices to your network."
                }
              </p>
              {canCreateDevices && !searchTerm && (
                <div className="empty-actions">
                  <RuxButton onClick={() => setShowDiscovery(true)}>
                    <RuxIcon icon="search" size="small" />
                    Discover Devices
                  </RuxButton>
                  <RuxButton secondary onClick={() => setShowDeviceForm(true)}>
                    <RuxIcon icon="add" size="small" />
                    Add Manually
                  </RuxButton>
                </div>
              )}
            </div>
          ) : (
            <div className={`devices-view ${viewMode}`}>
              {viewMode === "table" ? renderDeviceTable() : renderDeviceCards()}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showDiscovery && (
        <UniversalDeviceDiscovery
          siteId={filterSite || undefined}
          onDeviceAdded={handleDeviceAdded}
          onClose={() => setShowDiscovery(false)}
        />
      )}

      {showDeviceForm && (
        <FlexibleDeviceForm
          device={editingDevice || undefined}
          siteId={filterSite || undefined}
          onSave={handleDeviceAdded}
          onCancel={() => {
            setShowDeviceForm(false);
            setEditingDevice(null);
          }}
        />
      )}

      {/* Bulk Operation Progress */}
      {bulkOperation && (
        <RuxDialog
          open={!!bulkOperation}
          header="Bulk Operation in Progress"
          message={bulkStatus}
          denyText=""
          confirmText={bulkProgress === 100 ? "Close" : ""}
          onRuxdialogclosed={() => {
            if (bulkProgress === 100) {
              setBulkOperation("");
            }
          }}
        >
          <div className="bulk-progress">
            <RuxProgress value={bulkProgress} max={100} />
          </div>
        </RuxDialog>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <RuxDialog
          open={showDeleteConfirm}
          header="Confirm Bulk Delete"
          message={`Are you sure you want to delete ${selectedDevices.size} selected device${selectedDevices.size !== 1 ? 's' : ''}? This action cannot be undone.`}
          confirmText="Delete"
          denyText="Cancel"
          onRuxdialogclosed={(e: any) => {
            if (e.detail.confirmed) {
              executeBulkOperation('delete');
            }
            setShowDeleteConfirm(false);
          }}
        />
      )}
    </RuxContainer>
  );
};

export default EnhancedDeviceManagement;