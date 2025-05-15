import React, { useState } from "react";
import "./SiteEndpointForm.css";
import { RuxButton, RuxInput } from "@astrouxds/react";
import { createSite } from "../../services";
interface AddSiteEndpointFormProps {
  onSave?: (endpoint: { siteName: string; location: string }) => void;
  onCancel: () => void;
}

const AddSiteEndpointForm: React.FC<AddSiteEndpointFormProps> = ({
  onCancel,
}) => {
  const [siteName, setSiteName] = useState("");
  const [location, setLocation] = useState("");
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = {
      name: siteName,
      location: location,
    };
    createSite(formData);
  };

  return (
    <form className="add-site-endpoint-form" onSubmit={handleSubmit}>
      <RuxInput
        label="Site Name"
        value={siteName}
        onChange={(e) => setSiteName(e.target.value)} // ... and update the state variable on any edits!        required
      ></RuxInput>
      <RuxInput
        label="Location"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        required
      ></RuxInput>
      <div className="form-actions">
        <RuxButton type="submit">Save</RuxButton>
        <RuxButton type="button" onClick={onCancel}>
          Cancel
        </RuxButton>
      </div>
    </form>
  );
};

export default AddSiteEndpointForm;
