import React, { useState } from "react";
import "./SiteEndpointForm.css";
import { RuxButton, RuxInput, RuxDialog } from "@astrouxds/react";

interface AddSiteEndpointFormProps {
  open: boolean; // To control the dialog's visibility
  onSave: (endpoint: { name: string; location: string }) => void; // Changed to 'name' to match formData
  onCancel: () => void; // For the cancel button action
  onRuxclosed: () => void; // For dialog close events (like ESC)
}

const AddSiteEndpointForm: React.FC<AddSiteEndpointFormProps> = ({
  open,
  onSave,
  onCancel,
  onRuxclosed,
}) => {
  const [siteName, setSiteName] = useState("");
  const [location, setLocation] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = {
      name: siteName,
      location: location,
    };
    onSave(formData); // Call the onSave prop passed from the parent
    // Reset fields after save
    setSiteName("");
    setLocation("");
  };

  const handleCancel = () => {
    // Reset fields on cancel
    setSiteName("");
    setLocation("");
    onCancel(); // Call the onCancel prop
  };

  return (
    <RuxDialog open={open}>
      <div slot="header">Add New Site</div>
      <form className="add-site-endpoint-form" onSubmit={handleSubmit}>
        <RuxInput
          label="Site Name"
          value={siteName}
          onRuxinput={(e: any) => setSiteName(e.target.value)}
          required
        ></RuxInput>
        <RuxInput
          label="Location"
          value={location}
          onRuxinput={(e: any) => setLocation(e.target.value)}
          required
        ></RuxInput>
        <div className="form-actions">
          {/* These buttons are now part of the form, not the dialog's direct footer slot */}
          {/* The RuxDialog's own footer slot can be used if needed for other dialog-level actions */}
        </div>
      </form>
      <div slot="footer">
        <RuxButton type="button" onClick={handleCancel} secondary>
          Cancel
        </RuxButton>
        <RuxButton type="button" onClick={handleSubmit}>
          Save
        </RuxButton>
      </div>
    </RuxDialog>
  );
};

export default AddSiteEndpointForm;
