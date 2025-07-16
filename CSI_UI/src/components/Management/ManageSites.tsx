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

const SiteForm: React.FC<ManagementFormProps<SiteSummary | SiteCreateData>> = ({
  item,
  onSubmit,
  onCancel,
}) => {
  const [name, setName] = useState(
    (item as any)?.siteName || (item as any)?.name || ""
  );
  const [location, setLocation] = useState((item as any)?.location || "");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, location });
  };

  return (
    <form onSubmit={handleSave} className="site-form management-form">
      <RuxInput
        label="Name"
        value={name}
        onRuxinput={(e: any) => setName(e.target.value)}
      />
      <RuxInput
        label="Location"
        value={location}
        onRuxinput={(e: any) => setLocation(e.target.value)}
      />
      <div className="form-actions">
        <RuxButton type="button" secondary onClick={onCancel}>
          Cancel
        </RuxButton>
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
      <div className="table-wrapper">
        <RuxTable>
          <RuxTableHeaderRow>
            <RuxTableHeaderCell>ID</RuxTableHeaderCell>
            <RuxTableHeaderCell>Name</RuxTableHeaderCell>
            <RuxTableHeaderCell>Location</RuxTableHeaderCell>
            <RuxTableHeaderCell>Status</RuxTableHeaderCell>
            <RuxTableHeaderCell>Actions</RuxTableHeaderCell>
          </RuxTableHeaderRow>
          <RuxTableBody>
            {items.map((site) => (
              <RuxTableRow key={site.siteId}>
                <RuxTableCell>{site.siteId}</RuxTableCell>
                <RuxTableCell>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "var(--spacing-2)",
                    }}
                  >
                    <div
                      style={{
                        width: "8px",
                        height: "8px",
                        backgroundColor: "var(--color-status-standby)",
                        borderRadius: "50%",
                      }}
                    />
                    {site.siteName}
                  </div>
                </RuxTableCell>
                <RuxTableCell>
                  <div className="entity-badge">
                    {site.location || "Unknown"}
                  </div>
                </RuxTableCell>
                <RuxTableCell>
                  <div className="status-cell">
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.375rem",
                        padding: "0.25rem 0.5rem",
                        backgroundColor: "var(--color-status-standby)20",
                        border: "1px solid var(--color-status-standby)",
                        borderRadius: "4px",
                        fontSize: "0.75rem",
                        fontWeight: "500",
                        color: "var(--color-status-standby)",
                        textTransform: "uppercase",
                      }}
                    >
                      <div
                        style={{
                          width: "8px",
                          height: "8px",
                          backgroundColor: "var(--color-status-standby)",
                          borderRadius: "50%",
                        }}
                      />
                      active
                    </div>
                  </div>
                </RuxTableCell>
                <RuxTableCell>
                  <div className="table-actions">
                    <RuxButton size="small" onClick={() => onEdit(site)}>
                      Edit
                    </RuxButton>
                    <RuxButton
                      size="small"
                      secondary
                      onClick={() => onDelete(site)}
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
    )}
  />
);

export default ManageSites;
