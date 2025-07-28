import React, { useEffect, useState } from "react";
import "./DeviceForm.css";
import {
  RuxInput,
  RuxSelect,
  RuxOption,
  RuxButton,
  RuxContainer,
} from "@astrouxds/react";
import { createDevice, getServiceList } from "../../services";
import SearchProxy from "./SearchProxy/SearchProxy";

interface AddDeviceEndpointFormProps {
  siteId: number;
  onCancel: () => void;
  onSaveSuccess: () => void;
  formId: string;
}

const AddDeviceEndpointForm: React.FC<AddDeviceEndpointFormProps> = ({
  formId,
  siteId,
  onCancel,
  onSaveSuccess,
}) => {
  const [proxies, setProxies] = useState<string[]>([]);
  const [deviceName, setDeviceName] = useState("");
  const [deviceType, setType] = useState("");
  const [selectedServiceUrl, setSelectedServiceUrl] = useState<string | null>(
    null
  );

  useEffect(() => {
    const fetchProxies = async () => {
      try {
        const proxyList = await getServiceList();
        setProxies(proxyList);
      } catch (error) {
        console.error("Error fetching available services:", error);
      }
    };
    if (siteId !== -1) {
      // Only fetch if a valid site is selected
      fetchProxies();
    }
  }, [siteId]); // Refetch if siteId changes

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedServiceUrl || !deviceName || !deviceType) {
      console.error("Device Name, Type, and Service URL are required.");
      return;
    }

    const formDataForBackend = {
      // Renamed for clarity
      name: deviceName,
      type: deviceType,
      serviceUrl: selectedServiceUrl,
      siteId: siteId,
    };

    createDevice(formDataForBackend)
      .then(() => {
        setDeviceName("");
        setType("");
        setSelectedServiceUrl(null);
        onSaveSuccess(); // Call success handler
      })
      .catch((error) => {
        console.error("Error creating device:", error);
      });
  };

  return (
    <RuxContainer className="add-device-endpoint-form">
      <div slot="header">Add Device Endpoint</div>
      <form
        className="add-device-endpoint-form-inner"
        onSubmit={handleSubmit}
        id={formId}
      >
        <RuxInput
          label="Device Name"
          value={deviceName}
          onRuxinput={(e: CustomEvent<{value: string}>) => setDeviceName(e.detail.value)}
          required
        />
        <RuxSelect
          label="Device Type"
          value={deviceType}
          onRuxchange={(e: CustomEvent<{value: string}>) => setType(e.detail.value)}
          required
        >
          <RuxOption label="Select a Device Type" value=""></RuxOption>
          <RuxOption label="PDU" value="PDU"></RuxOption>
          <RuxOption label="UPS" value="UPS"></RuxOption>
          <RuxOption label="Server" value="Server"></RuxOption>
          <RuxOption label="Switch" value="Switch"></RuxOption>
          <RuxOption label="Router" value="Router"></RuxOption>
          <RuxOption label="Firewall" value="Firewall"></RuxOption>
          <RuxOption label="Storage" value="Storage"></RuxOption>
          <RuxOption label="Other" value="Other"></RuxOption>
        </RuxSelect>
        <SearchProxy
          proxies={proxies}
          setproxy={setSelectedServiceUrl}
          proxy={selectedServiceUrl}
        />
      </form>
      <div slot="footer">
        <RuxButton type="button" secondary onClick={onCancel}>
          Cancel
        </RuxButton>
        <RuxButton type="button" onClick={handleSubmit}>
          Save
        </RuxButton>
      </div>
    </RuxContainer>
  );
};

export default AddDeviceEndpointForm;
