import React, { useState } from "react";
import "./SiteEndpointForm.css";
import { RuxButton, RuxInput } from "@astrouxds/react";
interface AddSiteEndpointFormProps {
  onSave: (endpoint: {
    siteName: string;
    endpointName: string;
    equipmentType: string;
    equipmentMake: string;
    equipmentModel: string;
  }) => void;
  onCancel: () => void;
}

const AddSiteEndpointForm: React.FC<AddSiteEndpointFormProps> = ({
  onSave,
  onCancel,
}) => {
  const [siteName, setSiteName] = useState("");
  const [endpointName, setEndpointName] = useState("");
  const [equipmentType, setEquipmentType] = useState("");
  const [equipmentMake, setEquipmentMake] = useState("");
  const [equipmentModel, setEquipmentModel] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      siteName,
      endpointName,
      equipmentType,
      equipmentMake,
      equipmentModel,
    });
  };

  return (
    <form className="add-site-endpoint-form" onSubmit={handleSubmit}>
      <RuxInput
        label="Site Name"
        value={siteName}
        onChange={(e) => setSiteName(e.target.value)}
        required
      ></RuxInput>
      <RuxInput
        label="Endpoint Name"
        value={endpointName}
        onChange={(e) => setSiteName(e.target.value)}
        required
      ></RuxInput>
      <RuxInput
        label="Equipment Type"
        value={equipmentType}
        onChange={(e) => setSiteName(e.target.value)}
        required
      ></RuxInput>
      <RuxInput
        label="Equipment Make"
        value={equipmentMake}
        onChange={(e) => setSiteName(e.target.value)}
        required
      ></RuxInput>
      <RuxInput
        label="Equipment Model"
        value={equipmentModel}
        onChange={(e) => setSiteName(e.target.value)}
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
