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
  const [thresholdInputs, setThresholdInputs] = useState<{
    [metric: string]: { warning?: string; critical?: string; id?: number };
  }>({});

  useEffect(() => {
    if (item) {
      fetchMetricTypes(item.id).then(setMetricTypes);
      getThresholdsForDevice(item.id).then((thr) => {
        const map: { [m: string]: { warning?: string; critical?: string; id?: number } } = {};
        thr.forEach((t) => {
          map[t.metricType] = {
            warning: t.warningThreshold?.toString() || "",
            critical: t.criticalThreshold?.toString() || "",
            id: t.id,
          };
        });
        setThresholdInputs(map);
      });
    }
  }, [item]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, type, serviceUrl, siteId: parseInt(siteId, 10) });
    if (item) {
      metricTypes.forEach((m) => {
        const vals = thresholdInputs[m] || {};
        const payload = {
          deviceId: item.id,
          metricType: m,
          warningThreshold: vals.warning ? parseFloat(vals.warning) : undefined,
          criticalThreshold: vals.critical ? parseFloat(vals.critical) : undefined,
        };
        if (vals.id) {
          updateMetricThreshold(vals.id, payload);
        } else if (vals.warning || vals.critical) {
          createMetricThreshold(payload);
        }
      });
    }
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
      {metricTypes.map((m) => (
        <div key={m} style={{ marginBottom: "0.5rem" }}>
          <span>{m}</span>
          <RuxInput
            label="Warning"
            value={thresholdInputs[m]?.warning || ""}
            onRuxinput={(e: any) =>
              setThresholdInputs((prev) => ({
                ...prev,
                [m]: { ...prev[m], warning: e.target.value },
              }))
            }
          />
          <RuxInput
            label="Critical"
            value={thresholdInputs[m]?.critical || ""}
            onRuxinput={(e: any) =>
              setThresholdInputs((prev) => ({
                ...prev,
                [m]: { ...prev[m], critical: e.target.value },
              }))
            }
          />
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

  return (
    <ManagementMain<Device>
      entityName="Device"
      fetchItems={getDevices}
      createItem={createDevice}
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
