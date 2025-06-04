import React, { useState, useImperativeHandle, forwardRef } from "react";
import "./SiteEndpointForm.css";
import { RuxInput } from "@astrouxds/react";

export interface AddSiteEndpointFormHandles {
  getFormData: () => { name: string; location: string } | null;
  reset: () => void;
}

interface AddSiteEndpointFormProps {
  // No onSave/onCancel here; parent handles actions
}

const AddSiteEndpointForm = forwardRef<
  AddSiteEndpointFormHandles,
  AddSiteEndpointFormProps
>((props, ref) => {
  const [siteName, setSiteName] = useState("");
  const [location, setLocation] = useState("");

  useImperativeHandle(ref, () => ({
    getFormData: () => {
      if (!siteName.trim() || !location.trim()) return null;
      return { name: siteName, location: location };
    },
    reset: () => {
      setSiteName("");
      setLocation("");
    },
  }));

  return (
    <div className="add-site-endpoint-form-container">
      <h3>Add New Site</h3>
      <form
        className="add-site-endpoint-form"
        onSubmit={(e) => e.preventDefault()}
      >
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
      </form>
    </div>
  );
});

export default AddSiteEndpointForm;
