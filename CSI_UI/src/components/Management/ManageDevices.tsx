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
  getThresholdStatusColor,
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
      warning?: string;
      critical?: string;
      thresholds?: {
        [metric: string]: { warning?: string; critical?: string; id?: number };
      };
    };
  }>({});
  const [ungroupedMetrics, setUngroupedMetrics] = useState<string[]>([]);
  const [thresholdInputs, setThresholdInputs] = useState<{
    [metric: string]: { warning?: string; critical?: string; id?: number };
  }>({});

  // Group metrics by patterns for servers
  const groupMetrics = (metrics: string[]) => {
    const groups: {
      [groupName: string]: {
        pattern: string;
        metrics: string[];
        warning?: string;
        critical?: string;
        thresholds?: {
          [metric: string]: {
            warning?: string;
            critical?: string;
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
          [m: string]: { warning?: string; critical?: string; id?: number };
        } = {};
        const groupThresholds: {
          [groupName: string]: {
            pattern: string;
            metrics: string[];
            warning?: string;
            critical?: string;
            thresholds?: {
              [metric: string]: {
                warning?: string;
                critical?: string;
                id?: number;
              };
            };
          };
        } = {};

        // Build threshold map
        thr.forEach((t) => {
          map[t.metricType] = {
            warning: t.warningThreshold?.toString() || "",
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
                th.warning === firstThreshold.warning &&
                th.critical === firstThreshold.critical
            );

            if (allSame) {
              groupThresholds[groupName] = {
                ...group,
                warning: firstThreshold.warning,
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
        if (group.warning || group.critical) {
          // Apply group thresholds to all metrics in the group
          group.metrics.forEach((metric) => {
            const payload = {
              deviceId: item.id,
              metricType: metric,
              warningThreshold: group.warning
                ? parseFloat(group.warning)
                : undefined,
              criticalThreshold: group.critical
                ? parseFloat(group.critical)
                : undefined,
            };

            const existingThreshold = group.thresholds?.[metric];
            if (existingThreshold?.id) {
              updateMetricThreshold(existingThreshold.id, payload);
            } else if (group.warning || group.critical) {
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
          warningThreshold: vals.warning ? parseFloat(vals.warning) : undefined,
          criticalThreshold: vals.critical
            ? parseFloat(vals.critical)
            : undefined,
        };
        if (vals.id) {
          updateMetricThreshold(vals.id, payload);
        } else if (vals.warning || vals.critical) {
          createMetricThreshold(payload);
        }
      });
    }
  };

  const handleGroupThresholdChange = (
    groupName: string,
    type: "warning" | "critical",
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
        <div
          key={groupName}
          style={{
            marginBottom: "1rem",
            padding: "1rem",
            border: "1px solid #444",
            borderRadius: "4px",
          }}
        >
          <h4
            style={{
              marginBottom: "0.5rem",
              color: "#fff",
              textTransform: "uppercase",
            }}
          >
            {groupName}
          </h4>
          <p
            style={{ fontSize: "0.8rem", color: "#888", marginBottom: "1rem" }}
          >
            Applies to: {group.metrics.join(", ")}
          </p>
          <div style={{ display: "flex", gap: "1rem" }}>
            <div style={{ position: "relative" }}>
              <RuxInput
                label="Warning Threshold"
                value={group.warning || ""}
                onRuxinput={(e: any) =>
                  handleGroupThresholdChange(
                    groupName,
                    "warning",
                    e.target.value
                  )
                }
                placeholder="e.g., 70"
              />
              <div
                style={{
                  position: "absolute",
                  top: "0",
                  right: "-8px",
                  width: "4px",
                  height: "100%",
                  backgroundColor: getThresholdStatusColor("warning").hex,
                  borderRadius: "2px",
                }}
              />
            </div>
            <div style={{ position: "relative" }}>
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
              <div
                style={{
                  position: "absolute",
                  top: "0",
                  right: "-8px",
                  width: "4px",
                  height: "100%",
                  backgroundColor: getThresholdStatusColor("critical").hex,
                  borderRadius: "2px",
                }}
              />
            </div>
          </div>
        </div>
      ))}

      {/* Render ungrouped metrics individually */}
      {ungroupedMetrics.map((m) => (
        <div key={m} style={{ marginBottom: "1rem" }}>
          <h5
            style={{
              color: "#fff",
              marginBottom: "0.5rem",
              textTransform: "uppercase",
            }}
          >
            {m}
          </h5>
          <div style={{ display: "flex", gap: "1rem" }}>
            <div style={{ position: "relative" }}>
              <RuxInput
                label="Warning"
                value={thresholdInputs[m]?.warning || ""}
                onRuxinput={(e: any) =>
                  setThresholdInputs((prev) => ({
                    ...prev,
                    [m]: { ...prev[m], warning: e.target.value },
                  }))
                }
                placeholder="e.g., 70"
              />
              <div
                style={{
                  position: "absolute",
                  top: "0",
                  right: "-8px",
                  width: "4px",
                  height: "100%",
                  backgroundColor: getThresholdStatusColor("warning").hex,
                  borderRadius: "2px",
                }}
              />
            </div>
            <div style={{ position: "relative" }}>
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
              <div
                style={{
                  position: "absolute",
                  top: "0",
                  right: "-8px",
                  width: "4px",
                  height: "100%",
                  backgroundColor: getThresholdStatusColor("critical").hex,
                  borderRadius: "2px",
                }}
              />
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
                <RuxTableHeaderCell>Actions</RuxTableHeaderCell>
              </RuxTableHeaderRow>
              <RuxTableBody>
                {items.map((dev) => (
                  <RuxTableRow key={dev.id}>
                    <RuxTableCell>{dev.id}</RuxTableCell>
                    <RuxTableCell>{sites[dev.id] || "Loading..."}</RuxTableCell>
                    <RuxTableCell>{dev.name}</RuxTableCell>
                    <RuxTableCell>{dev.type}</RuxTableCell>
                    <RuxTableCell>
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
