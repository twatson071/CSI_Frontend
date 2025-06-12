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
  fetchSiteSummaries,
  createSite,
  updateSite,
  deleteSite,
  SiteSummary,
  SiteCreateData,
} from "../../services";

const SiteForm: React.FC<ManagementFormProps<SiteSummary | SiteCreateData>> = ({ item, onSubmit, onCancel }) => {
  const [name, setName] = useState((item as any)?.siteName || (item as any)?.name || "");
  const [location, setLocation] = useState((item as any)?.location || "");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, location });
  };

  return (
    <form onSubmit={handleSave} className="site-form">
      <RuxInput label="Name" value={name} onRuxinput={(e: any) => setName(e.target.value)} />
      <RuxInput label="Location" value={location} onRuxinput={(e: any) => setLocation(e.target.value)} />
      <div className="form-actions">
        <RuxButton type="button" secondary onClick={onCancel}>Cancel</RuxButton>
        <RuxButton type="submit">Save</RuxButton>
      </div>
    </form>
  );
};

const ManageSites = () => (
  <ManagementMain<SiteSummary>
    entityName="Site"
    fetchItems={fetchSiteSummaries}
    createItem={createSite as any}
    updateItem={(id, data) => updateSite(id, data as SiteCreateData)}
    deleteItem={deleteSite}
    getId={(s) => s.siteId}
    FormComponent={SiteForm as any}
    renderList={(items, onEdit, onDelete) => (
      <RuxTable>
        <RuxTableHeaderRow>
          <RuxTableHeaderCell>ID</RuxTableHeaderCell>
          <RuxTableHeaderCell>Name</RuxTableHeaderCell>
          <RuxTableHeaderCell>Location</RuxTableHeaderCell>
          <RuxTableHeaderCell>Actions</RuxTableHeaderCell>
        </RuxTableHeaderRow>
        <RuxTableBody>
          {items.map((site) => (
            <RuxTableRow key={site.siteId}>
              <RuxTableCell>{site.siteId}</RuxTableCell>
              <RuxTableCell>{site.siteName}</RuxTableCell>
              <RuxTableCell>{site.location}</RuxTableCell>
              <RuxTableCell>
                <RuxButton size="small" onClick={() => onEdit(site)}>Edit</RuxButton>
                <RuxButton size="small" secondary onClick={() => onDelete(site)}>
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

export default ManageSites;
