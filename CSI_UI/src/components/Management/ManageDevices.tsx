import React, { useState, useEffect } from "react";
import {
  RuxButton,
  RuxInput,
  RuxTable,
  RuxTableHeaderRow,
  RuxTableHeaderCell,
  RuxTableBody,
  RuxTableRow,
  RuxTableCell,
} from "@astrouxds/react";
import ManagementMain, { ManagementFormProps } from "./ManagementMain";
import StatusIndicator from "./StatusIndicator";
import {
  getDevices,
  createDevice,
  updateDevice,
  deleteDevice,
  getRelatedSites,
  fetchMetricTypes,
  getThresholdsForDevice,
  createMetricThreshold,
  updateMetricThreshold,
  Device,
  CreateDevicePayload,
} from "../../services";

const DeviceForm: React.FC<ManagementFormProps<Device>> = ({
  item,
  onSubmit,
  onCancel,
}) => {
  const [name, setName] = useState(item?.name || "");
  const [type, setType] = useState(item?.type || "");
  const [serviceUrl, setServiceUrl] = useState(item?.serviceUrl || "");
  const [siteId, setSiteId] = useState(item?.siteId ? String(item.siteId) : "");
  const [metricTypes, setMetricTypes] = useState<string[]>([]);
  const [metricGroups, setMetricGroups] = useState<{
    [groupName: string]: {
      pattern: string;
      metrics: string[];
      caution?: string;
      critical?: string;
      serious?: string; // Add this line
      thresholds?: {
        [metric: string]: {
          caution?: string;
          critical?: string;
          serious?: string;
          id?: number;
        };
      };
    };
  }>({});
  const [ungroupedMetrics, setUngroupedMetrics] = useState<string[]>([]);
  const [thresholdInputs, setThresholdInputs] = useState<{
    [metric: string]: {
      caution?: string;
      critical?: string;
      serious?: string;
      id?: number;
    };
  }>({});

  // Group metrics by patterns for servers
  const groupMetrics = (metrics: string[]) => {
    const groups: {
      [groupName: string]: {
        pattern: string;
        metrics: string[];
        caution?: string;
        critical?: string;
        serious?: string; // Add this line
        thresholds?: {
          [metric: string]: {
            caution?: string;
            critical?: string;
            serious?: string;
            id?: number;
          };
        };
      };
    } = {};
    const ungrouped: string[] = [];

    // Define patterns for grouping server metrics
    const patterns = [
      { name: "CPU CORE UTILIZATION", pattern: /^cpu_utilization_core_\d+$/ },
      { name: "CPU CORE TEMPERATURE", pattern: /^cpu_temperature_core_\d+$/ },
      { name: "GPU UTILIZATION", pattern: /^gpu_utilization_\d+$/ },
      { name: "GPU TEMPERATURE", pattern: /^gpu_temperature_\d+$/ },
      { name: "DRIVE UTILIZATION", pattern: /^drive_utilization_\d+$/ },
      { name: "NETWORK SPEED", pattern: /^network_speed_\d+$/ },
    ];

    metrics.forEach((metric) => {
      let grouped = false;
      for (const { name, pattern } of patterns) {
        if (pattern.test(metric)) {
          if (!groups[name]) {
            groups[name] = { pattern: pattern.source, metrics: [] };
          }
          groups[name].metrics.push(metric);
          grouped = true;
          break;
        }
      }
      if (!grouped) {
        ungrouped.push(metric);
      }
    });

    return { groups, ungrouped };
  };

  useEffect(() => {
    if (item) {
      fetchMetricTypes(item.id).then((metrics) => {
        setMetricTypes(metrics);
        const { groups, ungrouped } = groupMetrics(metrics);
        setMetricGroups(groups);
        setUngroupedMetrics(ungrouped);
      });

      getThresholdsForDevice(item.id).then((thr) => {
        const map: {
          [m: string]: {
            caution?: string;
            serious?: string;
            critical?: string;
            id?: number;
          }; // Add serious here
        } = {};
        const groupThresholds: {
          [groupName: string]: {
            pattern: string;
            metrics: string[];
            caution?: string;
            serious?: string; // Add this line
            critical?: string;
            thresholds?: {
              [metric: string]: {
                caution?: string;
                critical?: string;
                serious?: string;
                id?: number;
              };
            };
          };
        } = {};

        // Build threshold map
        thr.forEach((t) => {
          map[t.metricType] = {
            caution: t.cautionThreshold?.toString() || "",
            serious: t.seriousThreshold?.toString() || "",
            critical: t.criticalThreshold?.toString() || "",
            id: t.id,
          };
        });

        setThresholdInputs(map);

        // Group thresholds by pattern and check if they have consistent values
        const { groups } = groupMetrics(metricTypes);
        Object.entries(groups).forEach(([groupName, group]) => {
          const groupThresholdData = group.metrics
            .map((metric) => map[metric])
            .filter(Boolean);

          if (groupThresholdData.length > 0) {
            // Check if all metrics in group have the same thresholds
            const firstThreshold = groupThresholdData[0];
            const allSame = groupThresholdData.every(
              (th) =>
                th.caution === firstThreshold.caution &&
                th.serious === firstThreshold.serious && // Add this line
                th.critical === firstThreshold.critical
            );

            if (allSame) {
              groupThresholds[groupName] = {
                ...group,
                caution: firstThreshold.caution,
                serious: firstThreshold.serious, // Add this line
                critical: firstThreshold.critical,
                thresholds: {},
              };
              // Store individual thresholds for reference
              group.metrics.forEach((metric) => {
                if (map[metric]) {
                  groupThresholds[groupName].thresholds![metric] = map[metric];
                }
              });
            }
          }
        });

        setMetricGroups((prev) => ({ ...prev, ...groupThresholds }));
      });
    }
  }, [item, metricTypes.length]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, type, serviceUrl, siteId: parseInt(siteId, 10) });
    if (item) {
      // Handle grouped metrics
      Object.entries(metricGroups).forEach(([, group]) => {
        if (group.caution || group.serious || group.critical) {
          // Apply group thresholds to all metrics in the group
          group.metrics.forEach((metric) => {
            const payload = {
              deviceId: item.id,
              metricType: metric,
              cautionThreshold: group.caution
                ? parseFloat(group.caution)
                : undefined,
              seriousThreshold: group.serious
                ? parseFloat(group.serious)
                : undefined,
              criticalThreshold: group.critical
                ? parseFloat(group.critical)
                : undefined,
            };

            const existingThreshold = group.thresholds?.[metric];
            if (existingThreshold?.id) {
              updateMetricThreshold(existingThreshold.id, payload);
            } else if (group.caution || group.serious || group.critical) {
              createMetricThreshold(payload);
            }
          });
        }
      });

      // Handle ungrouped metrics (backward compatibility)
      ungroupedMetrics.forEach((m) => {
        const vals = thresholdInputs[m] || {};
        const payload = {
          deviceId: item.id,
          metricType: m,
          cautionThreshold: vals.caution ? parseFloat(vals.caution) : undefined,
          seriousThreshold: vals.serious ? parseFloat(vals.serious) : undefined,
          criticalThreshold: vals.critical
            ? parseFloat(vals.critical)
            : undefined,
        };
        if (vals.id) {
          updateMetricThreshold(vals.id, payload);
        } else if (vals.caution || vals.serious || vals.critical) {
          createMetricThreshold(payload);
        }
      });
    }
  };

  const handleGroupThresholdChange = (
    groupName: string,
    type: "caution" | "critical" | "serious",
    value: string
  ) => {
    setMetricGroups((prev) => ({
      ...prev,
      [groupName]: {
        ...prev[groupName],
        [type]: value,
      },
    }));
  };

  return (
    <form onSubmit={handleSave} className="device-form management-form">
      <RuxInput
        label="Name"
        value={name}
        onRuxinput={(e: any) => setName(e.target.value)}
      />
      <RuxInput
        label="Type"
        value={type}
        onRuxinput={(e: any) => setType(e.target.value)}
      />
      <RuxInput
        label="Service URL"
        value={serviceUrl}
        onRuxinput={(e: any) => setServiceUrl(e.target.value)}
      />
      <RuxInput
        label="Site ID"
        value={siteId}
        onRuxinput={(e: any) => setSiteId(e.target.value)}
      />

      {/* Render grouped metrics with threshold inputs */}
      {Object.entries(metricGroups).map(([groupName, group]) => (
        <div key={groupName} className="threshold-group">
          <div className="threshold-group-header">
            <h4 className="threshold-group-title">{groupName}</h4>
            <StatusIndicator
              status="STANDBY"
              size="small"
              variant="badge"
              showLabel={false}
            />
          </div>
          <div className="threshold-group-metrics">
            <p className="threshold-group-description">
              Applies to: {group.metrics.join(", ")}
            </p>
          </div>
          <div className="threshold-inputs">
            <div className="threshold-input-wrapper">
              <RuxInput
                label="Caution Threshold"
                value={group.caution || ""}
                onRuxinput={(e: any) =>
                  handleGroupThresholdChange(
                    groupName,
                    "caution",
                    e.target.value
                  )
                }
                placeholder="e.g., 70"
              />
              <div className="threshold-indicator caution" />
            </div>
            <div className="threshold-input-wrapper">
              <RuxInput
                label="Serious Threshold"
                value={group.serious || ""}
                onRuxinput={(e: any) =>
                  handleGroupThresholdChange(
                    groupName,
                    "serious",
                    e.target.value
                  )
                }
                placeholder="e.g., 90"
              />
              <div className="threshold-indicator serious" />
            </div>
            <div className="threshold-input-wrapper">
              <RuxInput
                label="Critical Threshold"
                value={group.critical || ""}
                onRuxinput={(e: any) =>
                  handleGroupThresholdChange(
                    groupName,
                    "critical",
                    e.target.value
                  )
                }
                placeholder="e.g., 90"
              />
              <div className="threshold-indicator critical" />
            </div>
          </div>
        </div>
      ))}

      {/* Render ungrouped metrics individually */}
      {ungroupedMetrics.map((m) => (
        <div key={m} className="individual-metric">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "var(--spacing-2)",
            }}
          >
            <h5 className="individual-metric-title">{m}</h5>
            <StatusIndicator
              status="NORMAL"
              size="small"
              variant="badge"
              showLabel={false}
            />
          </div>
          <div className="threshold-inputs">
            <div className="threshold-input-wrapper">
              <RuxInput
                label="caution"
                value={thresholdInputs[m]?.caution || ""}
                onRuxinput={(e: any) =>
                  setThresholdInputs((prev) => ({
                    ...prev,
                    [m]: { ...prev[m], caution: e.target.value },
                  }))
                }
                placeholder="e.g., 70"
              />
              <div className="threshold-indicator caution" />
            </div>
            <div className="threshold-input-wrapper">
              <RuxInput
                label="Serious"
                value={thresholdInputs[m]?.serious || ""}
                onRuxinput={(e: any) =>
                  setThresholdInputs((prev) => ({
                    ...prev,
                    [m]: { ...prev[m], serious: e.target.value },
                  }))
                }
                placeholder="e.g., 90"
              />
              <div className="threshold-indicator serious" />
            </div>
            <div className="threshold-input-wrapper">
              <RuxInput
                label="Critical"
                value={thresholdInputs[m]?.critical || ""}
                onRuxinput={(e: any) =>
                  setThresholdInputs((prev) => ({
                    ...prev,
                    [m]: { ...prev[m], critical: e.target.value },
                  }))
                }
                placeholder="e.g., 90"
              />
              <div className="threshold-indicator critical" />
            </div>
          </div>
        </div>
      ))}
      <div className="form-actions">
        <RuxButton type="button" secondary onClick={onCancel}>
          Cancel
        </RuxButton>
        <RuxButton type="submit">Save</RuxButton>
      </div>
    </form>
  );
};

const ManageDevices = () => {
  const [sites, setSites] = useState<{ [deviceId: number]: string }>({});

  const getSiteName = async (deviceId: number) => {
    // Check if we already have the site name cached
    if (sites[deviceId]) {
      return sites[deviceId];
    }

    try {
      const siteData = await getRelatedSites(deviceId);
      const siteName =
        siteData.length > 0 ? siteData[0].name : `Site ${deviceId}`;

      // Cache the result
      setSites((prev) => ({ ...prev, [deviceId]: siteName }));

      return siteName;
    } catch (error) {
      console.error("Failed to fetch site name:", error);
      return `Site ${deviceId}`;
    }
  };

  // Add this useEffect to fetch site names when devices are rendered
  const fetchSiteNames = async (devices: Device[]) => {
    for (const device of devices) {
      if (!sites[device.id]) {
        await getSiteName(device.id);
      }
    }
  };

  // Wrapper function to handle the type mismatch
  const createDeviceWrapper = async (
    data: Partial<Device>
  ): Promise<Device> => {
    // Convert partial device data to CreateDevicePayload
    const payload: CreateDevicePayload = {
      name: data.name!,
      type: data.type!,
      serviceUrl: data.serviceUrl!,
      siteId: data.siteId!,
    };
    return createDevice(payload);
  };

  return (
    <ManagementMain<Device>
      entityName="Device"
      fetchItems={getDevices}
      createItem={createDeviceWrapper}
      updateItem={updateDevice}
      deleteItem={deleteDevice}
      getId={(d) => d.id}
      FormComponent={DeviceForm}
      renderList={(items, onEdit, onDelete) => {
        // Fetch site names when items are rendered
        fetchSiteNames(items);

        return (
          <div className="table-wrapper">
            <RuxTable>
              <RuxTableHeaderRow>
                <RuxTableHeaderCell>ID</RuxTableHeaderCell>
                <RuxTableHeaderCell>Site</RuxTableHeaderCell>
                <RuxTableHeaderCell>Name</RuxTableHeaderCell>
                <RuxTableHeaderCell>Type</RuxTableHeaderCell>
                <RuxTableHeaderCell>Status</RuxTableHeaderCell>
                <RuxTableHeaderCell>Actions</RuxTableHeaderCell>
              </RuxTableHeaderRow>
              <RuxTableBody>
                {items.map((dev) => (
                  <RuxTableRow key={dev.id}>
                    <RuxTableCell>{dev.id}</RuxTableCell>
                    <RuxTableCell>{sites[dev.id] || "Loading..."}</RuxTableCell>
                    <RuxTableCell>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "var(--spacing-2)",
                        }}
                      >
                        <StatusIndicator status="NORMAL" size="small" />
                        {dev.name}
                      </div>
                    </RuxTableCell>
                    <RuxTableCell>
                      <div className={`entity-badge ${dev.type.toLowerCase()}`}>
                        {dev.type}
                      </div>
                    </RuxTableCell>
                    <RuxTableCell>
                      <div className="status-cell">
                        <StatusIndicator
                          status="STANDBY"
                          size="medium"
                          variant="badge"
                          showLabel
                        />
                      </div>
                    </RuxTableCell>
                    <RuxTableCell>
                      <div className="table-actions">
                        <RuxButton size="small" onClick={() => onEdit(dev)}>
                          Edit
                        </RuxButton>
                        <RuxButton
                          size="small"
                          secondary
                          onClick={() => onDelete(dev)}
                        >
                          Delete
                        </RuxButton>
                      </div>
                    </RuxTableCell>
                  </RuxTableRow>
                ))}
              </RuxTableBody>
            </RuxTable>
          </div>
        );
      }}
    />
  );
};

export default ManageDevices;
