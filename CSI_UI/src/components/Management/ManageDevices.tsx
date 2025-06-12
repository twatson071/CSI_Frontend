import React, { useState } from "react";
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
  Device,
} from "../../services";

const DeviceForm: React.FC<ManagementFormProps<Device>> = ({ item, onSubmit, onCancel }) => {
  const [name, setName] = useState(item?.name || "");
  const [type, setType] = useState(item?.type || "");
  const [serviceUrl, setServiceUrl] = useState(item?.serviceUrl || "");
  const [siteId, setSiteId] = useState(item?.siteId ? String(item.siteId) : "");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, type, serviceUrl, siteId: parseInt(siteId, 10) });
  };

  return (
    <form onSubmit={handleSave} className="device-form">
      <RuxInput label="Name" value={name} onRuxinput={(e: any) => setName(e.target.value)} />
      <RuxInput label="Type" value={type} onRuxinput={(e: any) => setType(e.target.value)} />
      <RuxInput label="Service URL" value={serviceUrl} onRuxinput={(e: any) => setServiceUrl(e.target.value)} />
      <RuxInput label="Site ID" value={siteId} onRuxinput={(e: any) => setSiteId(e.target.value)} />
      <div className="form-actions">
        <RuxButton type="button" secondary onClick={onCancel}>Cancel</RuxButton>
        <RuxButton type="submit">Save</RuxButton>
      </div>
    </form>
  );
};

const ManageDevices = () => (
  <ManagementMain<Device>
    entityName="Device"
    fetchItems={getDevices}
    createItem={createDevice}
    updateItem={updateDevice}
    deleteItem={deleteDevice}
    getId={(d) => d.id}
    FormComponent={DeviceForm}
    renderList={(items, onEdit, onDelete) => (
      <RuxTable>
        <RuxTableHeaderRow>
          <RuxTableHeaderCell>ID</RuxTableHeaderCell>
          <RuxTableHeaderCell>Name</RuxTableHeaderCell>
          <RuxTableHeaderCell>Type</RuxTableHeaderCell>
          <RuxTableHeaderCell>Actions</RuxTableHeaderCell>
        </RuxTableHeaderRow>
        <RuxTableBody>
          {items.map((dev) => (
            <RuxTableRow key={dev.id}>
              <RuxTableCell>{dev.id}</RuxTableCell>
              <RuxTableCell>{dev.name}</RuxTableCell>
              <RuxTableCell>{dev.type}</RuxTableCell>
              <RuxTableCell>
                <RuxButton size="small" onClick={() => onEdit(dev)}>Edit</RuxButton>
                <RuxButton size="small" secondary onClick={() => onDelete(dev)}>
                  Delete
                </RuxButton>
              </RuxTableCell>
            </RuxTableRow>
          ))}
        </RuxTableBody>
      </RuxTable>
    )}
  />
);

export default ManageDevices;
