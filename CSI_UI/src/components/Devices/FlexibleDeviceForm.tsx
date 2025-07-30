import React, { useState, useEffect } from "react";
import {
  RuxContainer,
  RuxButton,
  RuxInput,
  RuxSelect,
  RuxOption,
  RuxTextarea,
  RuxCheckbox,
  RuxCard,
  RuxIcon,
  RuxTabs,
  RuxTab,
  RuxStatus,
} from "@astrouxds/react";
import { usePermissions } from "../../hooks/usePermissions";
import { RESOURCES, ACTIONS } from "../../services/RoleService";
import { createDevice, updateDevice, getServiceList, Device } from "../../services/DeviceService";
import { fetchSiteSummaries } from "../../services/SiteService";
import "./FlexibleDeviceForm.css";

interface DeviceTemplate {
  type: string;
  name: string;
  description: string;
  icon: string;
  fields: DeviceField[];
  validation: Record<string, any>;
  defaultValues: Record<string, any>;
}

interface DeviceField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'textarea' | 'checkbox' | 'password' | 'url' | 'email';
  required: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  validation?: {
    pattern?: string;
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
  };
  description?: string;
  group?: string;
}

interface FlexibleDeviceFormProps {
  device?: Device;
  siteId?: number;
  onSave: (device: any) => void;
  onCancel: () => void;
}

const FlexibleDeviceForm: React.FC<FlexibleDeviceFormProps> = ({
  device,
  siteId,
  onSave,
  onCancel,
}) => {
  const permissions = usePermissions();
  const isEditing = !!device;
  
  // State
  const [formData, setFormData] = useState<Record<string, any>>({
    name: device?.name || "",
    type: device?.type || "",
    siteId: siteId || device?.siteId || 0,
    serviceUrl: device?.serviceUrl || "",
    ipAddress: device?.ipAddress || "",
    description: "",
  });
  
  const [activeTab, setActiveTab] = useState(0);
  const [deviceTemplates, setDeviceTemplates] = useState<DeviceTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<DeviceTemplate | null>(null);
  const [sites, setSites] = useState<{ id: number; name: string }[]>([]);
  const [serviceUrls, setServiceUrls] = useState<string[]>([]);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load initial data
  useEffect(() => {
    loadDeviceTemplates();
    loadSites();
    loadServiceUrls();
  }, []);

  // Update form when device prop changes
  useEffect(() => {
    if (device) {
      setFormData({
        name: device.name,
        type: device.type,
        siteId: device.siteId,
        serviceUrl: device.serviceUrl || "",
        ipAddress: device.ipAddress || "",
        description: "",
        ...device.parameters,
      });
      
      // Find and set the template
      const template = deviceTemplates.find(t => t.type === device.type);
      if (template) {
        setSelectedTemplate(template);
      }
    }
  }, [device, deviceTemplates]);

  const loadDeviceTemplates = () => {
    // Define common device templates based on your device inventory
    const templates: DeviceTemplate[] = [
      {
        type: "PDU",
        name: "Power Distribution Unit",
        description: "APC PDUs (AP7921B, AP8870) with environmental monitoring",
        icon: "power",
        fields: [
          { key: "name", label: "PDU Name", type: "text", required: true, placeholder: "PDU 1" },
          { key: "ipAddress", label: "IP Address", type: "text", required: true, placeholder: "192.168.1.100", 
            validation: { pattern: "^(?:[0-9]{1,3}\\.){3}[0-9]{1,3}$" } },
          { key: "model", label: "Model", type: "select", required: true,
            options: [
              { value: "AP7921B", label: "AP7921B - Basic PDU" },
              { value: "AP8870", label: "AP8870 - Metered PDU" },
              { value: "Other", label: "Other Model" }
            ] },
          { key: "snmpCommunity", label: "SNMP Community", type: "text", required: false, placeholder: "public", group: "SNMP" },
          { key: "snmpVersion", label: "SNMP Version", type: "select", required: true, group: "SNMP",
            options: [
              { value: "v1", label: "SNMPv1" },
              { value: "v2c", label: "SNMPv2c" },
              { value: "v3", label: "SNMPv3" }
            ] },
          { key: "outletCount", label: "Number of Outlets", type: "number", required: true, validation: { min: 1, max: 48 } },
          { key: "ratedPower", label: "Rated Power (W)", type: "number", required: false, validation: { min: 0 } },
          { key: "environmentalSensor", label: "Environmental Sensor", type: "checkbox", required: false, 
            description: "Enable temperature and humidity monitoring" },
          { key: "rackPosition", label: "Rack Position", type: "text", required: false, placeholder: "1U" },
        ],
        validation: {},
        defaultValues: { snmpCommunity: "public", snmpVersion: "v2c", outletCount: 8, model: "AP7921B", environmentalSensor: true }
      },
      {
        type: "Switch",
        name: "Network Switch",
        description: "Managed network switch with SNMP monitoring",
        icon: "router",
        fields: [
          { key: "name", label: "Switch Name", type: "text", required: true, placeholder: "Switch-Core-01" },
          { key: "ipAddress", label: "Management IP", type: "text", required: true, placeholder: "192.168.1.10",
            validation: { pattern: "^(?:[0-9]{1,3}\\.){3}[0-9]{1,3}$" } },
          { key: "snmpCommunity", label: "SNMP Community", type: "text", required: false, placeholder: "public", group: "SNMP" },
          { key: "portCount", label: "Number of Ports", type: "number", required: true, validation: { min: 1, max: 48 } },
          { key: "vlanSupport", label: "VLAN Support", type: "checkbox", required: false },
          { key: "managementUrl", label: "Web Management URL", type: "url", required: false, placeholder: "https://192.168.1.10" },
          { key: "sshEnabled", label: "SSH Management", type: "checkbox", required: false },
        ],
        validation: {},
        defaultValues: { snmpCommunity: "public", portCount: 24, vlanSupport: true }
      },
      {
        type: "Server",
        name: "Server/Computer",
        description: "Physical or virtual server with monitoring capabilities",
        icon: "computer",
        fields: [
          { key: "name", label: "Server Name", type: "text", required: true, placeholder: "SRV-WEB-01" },
          { key: "ipAddress", label: "IP Address", type: "text", required: true, placeholder: "192.168.1.50" },
          { key: "operatingSystem", label: "Operating System", type: "select", required: false,
            options: [
              { value: "linux", label: "Linux" },
              { value: "windows", label: "Windows" },
              { value: "macos", label: "macOS" },
              { value: "freebsd", label: "FreeBSD" },
              { value: "vmware", label: "VMware ESXi" },
              { value: "other", label: "Other" }
            ] },
          { key: "cpuCores", label: "CPU Cores", type: "number", required: false, validation: { min: 1 } },
          { key: "memoryGB", label: "Memory (GB)", type: "number", required: false, validation: { min: 1 } },
          { key: "storageGB", label: "Storage (GB)", type: "number", required: false, validation: { min: 1 } },
          { key: "hypervisor", label: "Virtualization Platform", type: "text", required: false, placeholder: "VMware vSphere" },
        ],
        validation: {},
        defaultValues: { operatingSystem: "linux" }
      },
      {
        type: "Sensor",
        name: "Environmental Sensor",
        description: "Temperature, humidity, or other environmental sensors",
        icon: "sensors",
        fields: [
          { key: "name", label: "Sensor Name", type: "text", required: true, placeholder: "Temp-Rack-A-01" },
          { key: "ipAddress", label: "IP Address", type: "text", required: false, placeholder: "192.168.1.200" },
          { key: "sensorType", label: "Sensor Type", type: "select", required: true,
            options: [
              { value: "temperature", label: "Temperature" },
              { value: "humidity", label: "Humidity" },
              { value: "combined", label: "Temperature + Humidity" },
              { value: "airflow", label: "Airflow" },
              { value: "pressure", label: "Pressure" },
              { value: "vibration", label: "Vibration" },
              { value: "door", label: "Door Contact" },
              { value: "motion", label: "Motion" },
              { value: "water", label: "Water/Leak" }
            ] },
          { key: "location", label: "Physical Location", type: "text", required: false, placeholder: "Rack A, Top" },
          { key: "alertThresholds", label: "Enable Alert Thresholds", type: "checkbox", required: false },
          { key: "pollingInterval", label: "Polling Interval (seconds)", type: "number", required: false, 
            validation: { min: 30, max: 3600 } },
        ],
        validation: {},
        defaultValues: { sensorType: "temperature", pollingInterval: 300 }
      },
      {
        type: "UPS",
        name: "Uninterruptible Power Supply",
        description: "Battery backup and power conditioning system",
        icon: "battery_charging_full",
        fields: [
          { key: "name", label: "UPS Name", type: "text", required: true, placeholder: "UPS-Main-01" },
          { key: "ipAddress", label: "Management IP", type: "text", required: true, placeholder: "192.168.1.150" },
          { key: "capacity", label: "Capacity (VA)", type: "number", required: false, validation: { min: 500 } },
          { key: "batteryCount", label: "Number of Batteries", type: "number", required: false, validation: { min: 1 } },
          { key: "snmpCommunity", label: "SNMP Community", type: "text", required: false, placeholder: "public", group: "SNMP" },
          { key: "webInterface", label: "Web Interface URL", type: "url", required: false, placeholder: "https://192.168.1.150" },
          { key: "shutdownCommand", label: "Shutdown Command", type: "text", required: false, 
            placeholder: "shutdown /s /t 60", description: "Command to execute on power failure" },
        ],
        validation: {},
        defaultValues: { snmpCommunity: "public", capacity: 1000 }
      },
      {
        type: "Generic",
        name: "Generic Device",
        description: "Custom device with flexible configuration",
        icon: "device_hub",
        fields: [
          { key: "name", label: "Device Name", type: "text", required: true, placeholder: "Custom-Device-01" },
          { key: "deviceType", label: "Device Type", type: "text", required: true, placeholder: "Custom Type" },
          { key: "ipAddress", label: "IP Address", type: "text", required: false, placeholder: "192.168.1.x" },
          { key: "protocol", label: "Protocol", type: "select", required: false,
            options: [
              { value: "snmp", label: "SNMP" },
              { value: "http", label: "HTTP/REST" },
              { value: "modbus", label: "Modbus" },
              { value: "bacnet", label: "BACnet" },
              { value: "mqtt", label: "MQTT" },
              { value: "ssh", label: "SSH" },
              { value: "telnet", label: "Telnet" },
              { value: "custom", label: "Custom" }
            ] },
          { key: "port", label: "Port", type: "number", required: false, validation: { min: 1, max: 65535 } },
          { key: "customConfig", label: "Custom Configuration", type: "textarea", required: false,
            placeholder: "JSON configuration or custom parameters", description: "Device-specific configuration" },
        ],
        validation: {},
        defaultValues: { protocol: "snmp", port: 161 }
      },
      {
        type: "Camera",
        name: "Security Camera",
        description: "IP-based security camera with RTSP streaming",
        icon: "videocam",
        fields: [
          { key: "name", label: "Camera Name", type: "text", required: true, placeholder: "Camera-01" },
          { key: "ipAddress", label: "IP Address", type: "text", required: true, placeholder: "192.168.1.200", 
            validation: { pattern: "^(?:[0-9]{1,3}\\.){3}[0-9]{1,3}$" } },
          { key: "rtspUrl", label: "RTSP Stream URL", type: "text", required: false, placeholder: "rtsp://192.168.1.200/stream1" },
          { key: "username", label: "Username", type: "text", required: false, group: "Authentication" },
          { key: "password", label: "Password", type: "password", required: false, group: "Authentication" },
          { key: "resolution", label: "Resolution", type: "select", required: false,
            options: [
              { value: "720p", label: "720p (1280x720)" },
              { value: "1080p", label: "1080p (1920x1080)" },
              { value: "4K", label: "4K (3840x2160)" }
            ] },
          { key: "frameRate", label: "Frame Rate (fps)", type: "number", required: false, validation: { min: 1, max: 60 } },
          { key: "manufacturer", label: "Manufacturer", type: "select", required: false,
            options: [
              { value: "Hikvision", label: "Hikvision" },
              { value: "Dahua", label: "Dahua" },
              { value: "Axis", label: "Axis" },
              { value: "Bosch", label: "Bosch" },
              { value: "Other", label: "Other" }
            ] },
          { key: "model", label: "Model", type: "text", required: false, placeholder: "DS-2CD2385G1-I" },
          { key: "ptzSupport", label: "PTZ Support", type: "checkbox", required: false },
          { key: "nightVision", label: "Night Vision", type: "checkbox", required: false },
        ],
        validation: {},
        defaultValues: { resolution: "1080p", frameRate: 30 }
      },
      {
        type: "UPS",
        name: "Uninterruptible Power Supply",
        description: "APC UPS (SMX3000RMHV2U) with battery monitoring",
        icon: "battery_charging_full",
        fields: [
          { key: "name", label: "UPS Name", type: "text", required: true, placeholder: "UPS SMX3000RMHV2U" },
          { key: "ipAddress", label: "IP Address", type: "text", required: true, placeholder: "192.168.1.110", 
            validation: { pattern: "^(?:[0-9]{1,3}\\.){3}[0-9]{1,3}$" } },
          { key: "model", label: "Model", type: "select", required: true,
            options: [
              { value: "SMX3000RMHV2U", label: "SMX3000RMHV2U - 3000VA Rack Mount" },
              { value: "Other", label: "Other Model" }
            ] },
          { key: "snmpCommunity", label: "SNMP Community", type: "text", required: false, placeholder: "public", group: "SNMP" },
          { key: "ratedPower", label: "Rated Power (VA)", type: "number", required: false, validation: { min: 0 }, placeholder: "3000" },
          { key: "batteryCount", label: "Battery Count", type: "number", required: false, validation: { min: 1 }, placeholder: "2" },
          { key: "rackPosition", label: "Rack Position", type: "text", required: false, placeholder: "2U" },
          { key: "networkCard", label: "Network Management Card", type: "checkbox", required: false },
        ],
        validation: {},
        defaultValues: { snmpCommunity: "public", model: "SMX3000RMHV2U", ratedPower: 3000, networkCard: true }
      },
      {
        type: "Server",
        name: "Server/Workstation",
        description: "RAX XS4-11E3 servers and Z2 G9 Mini workstations",
        icon: "dns",
        fields: [
          { key: "name", label: "Server Name", type: "text", required: true, placeholder: "Server Pivot RAX XS4-11E3" },
          { key: "ipAddress", label: "IP Address", type: "text", required: true, placeholder: "192.168.1.50", 
            validation: { pattern: "^(?:[0-9]{1,3}\\.){3}[0-9]{1,3}$" } },
          { key: "serverType", label: "Server Type", type: "select", required: true,
            options: [
              { value: "RAX-XS4-11E3", label: "RAX XS4-11E3 Server" },
              { value: "Z2-G9-Mini", label: "Z2 G9 Mini Workstation" },
              { value: "Cape-Server", label: "Cape Server" },
              { value: "Time-Server", label: "Time Server" },
              { value: "Other", label: "Other" }
            ] },
          { key: "function", label: "Function", type: "select", required: false,
            options: [
              { value: "Pivot", label: "Pivot Server" },
              { value: "RMF", label: "RMF Server" },
              { value: "Workstation", label: "Workstation" },
              { value: "Cape", label: "Cape Server" },
              { value: "Time", label: "Time Server" },
              { value: "Other", label: "Other" }
            ] },
          { key: "operatingSystem", label: "Operating System", type: "select", required: false,
            options: [
              { value: "Windows", label: "Windows" },
              { value: "Linux", label: "Linux" },
              { value: "ESXi", label: "VMware ESXi" },
              { value: "Other", label: "Other" }
            ] },
          { key: "snmpEnabled", label: "SNMP Monitoring", type: "checkbox", required: false },
          { key: "snmpCommunity", label: "SNMP Community", type: "text", required: false, placeholder: "public", group: "SNMP" },
          { key: "cpuCount", label: "CPU Count", type: "number", required: false, validation: { min: 1 } },
          { key: "ramSize", label: "RAM Size (GB)", type: "number", required: false, validation: { min: 1 } },
          { key: "rackPosition", label: "Rack Position", type: "text", required: false, placeholder: "1U" },
        ],
        validation: {},
        defaultValues: { snmpEnabled: true, snmpCommunity: "public", serverType: "RAX-XS4-11E3" }
      },
      {
        type: "RF",
        name: "RF Equipment",
        description: "RF Matrix, RF Chassis (GNS-196-1U), Cape SDR",
        icon: "wifi",
        fields: [
          { key: "name", label: "RF Equipment Name", type: "text", required: true, placeholder: "RF Matrix" },
          { key: "ipAddress", label: "IP Address", type: "text", required: false, placeholder: "192.168.1.200", 
            validation: { pattern: "^(?:[0-9]{1,3}\\.){3}[0-9]{1,3}$" } },
          { key: "rfType", label: "RF Type", type: "select", required: true,
            options: [
              { value: "RF-Matrix", label: "RF Matrix" },
              { value: "GNS-196-1U-Indoor", label: "RF Chassis Indoor GNS-196-1U" },
              { value: "GNS-196-1U-Outdoor", label: "RF Chassis Outdoor GNS-196-1U" },
              { value: "Cape-SDR", label: "Cape SDR" },
              { value: "RF-to-Fiber", label: "RF to Fiber" },
              { value: "Other", label: "Other" }
            ] },
          { key: "location", label: "Location", type: "select", required: false,
            options: [
              { value: "Indoor", label: "Indoor" },
              { value: "Outdoor", label: "Outdoor" },
              { value: "Rack", label: "Rack Mounted" }
            ] },
          { key: "frequencyRange", label: "Frequency Range", type: "text", required: false, placeholder: "1-6 GHz" },
          { key: "channels", label: "Number of Channels", type: "number", required: false, validation: { min: 1 } },
          { key: "controlProtocol", label: "Control Protocol", type: "select", required: false,
            options: [
              { value: "HTTP", label: "HTTP/REST" },
              { value: "SNMP", label: "SNMP" },
              { value: "TCP", label: "TCP Socket" },
              { value: "Serial", label: "Serial" },
              { value: "Other", label: "Other" }
            ] },
          { key: "rackPosition", label: "Rack Position", type: "text", required: false, placeholder: "1U" },
        ],
        validation: {},
        defaultValues: { rfType: "RF-Matrix", controlProtocol: "HTTP", location: "Indoor" }
      },
      {
        type: "SpectrumAnalyzer",
        name: "Spectrum Analyzer",
        description: "Spectrum Analyzer 9010B for RF analysis",
        icon: "timeline",
        fields: [
          { key: "name", label: "Analyzer Name", type: "text", required: true, placeholder: "Spectrum Analyzer 9010B" },
          { key: "ipAddress", label: "IP Address", type: "text", required: true, placeholder: "192.168.1.150", 
            validation: { pattern: "^(?:[0-9]{1,3}\\.){3}[0-9]{1,3}$" } },
          { key: "model", label: "Model", type: "select", required: true,
            options: [
              { value: "9010B", label: "9010B Spectrum Analyzer" },
              { value: "Other", label: "Other Model" }
            ] },
          { key: "frequencyRange", label: "Frequency Range", type: "text", required: false, placeholder: "9 kHz - 26.5 GHz" },
          { key: "controlInterface", label: "Control Interface", type: "select", required: false,
            options: [
              { value: "SCPI", label: "SCPI Commands" },
              { value: "HTTP", label: "HTTP API" },
              { value: "GPIB", label: "GPIB" },
              { value: "USB", label: "USB" },
              { value: "Ethernet", label: "Ethernet" }
            ] },
          { key: "presets", label: "Measurement Presets", type: "textarea", required: false, 
            placeholder: "List of measurement presets..." },
          { key: "rackPosition", label: "Rack Position", type: "text", required: false, placeholder: "2U" },
        ],
        validation: {},
        defaultValues: { model: "9010B", controlInterface: "SCPI", frequencyRange: "9 kHz - 26.5 GHz" }
      },
      {
        type: "Storage",
        name: "Network Storage",
        description: "NAS ME5012 and other storage devices",
        icon: "storage",
        fields: [
          { key: "name", label: "Storage Name", type: "text", required: true, placeholder: "NAS ME5012" },
          { key: "ipAddress", label: "IP Address", type: "text", required: true, placeholder: "192.168.1.100", 
            validation: { pattern: "^(?:[0-9]{1,3}\\.){3}[0-9]{1,3}$" } },
          { key: "storageType", label: "Storage Type", type: "select", required: true,
            options: [
              { value: "NAS", label: "Network Attached Storage" },
              { value: "SAN", label: "Storage Area Network" },
              { value: "DAS", label: "Direct Attached Storage" },
              { value: "Other", label: "Other" }
            ] },
          { key: "model", label: "Model", type: "select", required: false,
            options: [
              { value: "ME5012", label: "ME5012 NAS" },
              { value: "Other", label: "Other Model" }
            ] },
          { key: "capacity", label: "Total Capacity (TB)", type: "number", required: false, validation: { min: 0 } },
          { key: "raidLevel", label: "RAID Level", type: "select", required: false,
            options: [
              { value: "RAID0", label: "RAID 0" },
              { value: "RAID1", label: "RAID 1" },
              { value: "RAID5", label: "RAID 5" },
              { value: "RAID6", label: "RAID 6" },
              { value: "RAID10", label: "RAID 10" },
              { value: "Other", label: "Other" }
            ] },
          { key: "snmpEnabled", label: "SNMP Monitoring", type: "checkbox", required: false },
          { key: "snmpCommunity", label: "SNMP Community", type: "text", required: false, placeholder: "public", group: "SNMP" },
          { key: "rackPosition", label: "Rack Position", type: "text", required: false, placeholder: "2U" },
        ],
        validation: {},
        defaultValues: { storageType: "NAS", model: "ME5012", snmpEnabled: true, snmpCommunity: "public" }
      }
    ];
    
    setDeviceTemplates(templates);
  };

  const loadSites = async () => {
    try {
      const siteSummaries = await fetchSiteSummaries();
      setSites(siteSummaries.map(s => ({ id: s.siteId, name: s.siteName })));
      if (!formData.siteId && siteSummaries.length > 0) {
        setFormData(prev => ({ ...prev, siteId: siteSummaries[0].siteId }));
      }
    } catch (error) {
      console.error("Failed to load sites:", error);
    }
  };

  const loadServiceUrls = async () => {
    try {
      const services = await getServiceList();
      setServiceUrls(services);
      if (!formData.serviceUrl && services.length > 0) {
        setFormData(prev => ({ ...prev, serviceUrl: services[0] }));
      }
    } catch (error) {
      console.error("Failed to load service URLs:", error);
    }
  };

  const handleTemplateSelect = (template: DeviceTemplate) => {
    setSelectedTemplate(template);
    setFormData(prev => ({
      ...prev,
      type: template.type,
      ...template.defaultValues,
    }));
    setActiveTab(1); // Switch to configuration tab
  };

  const handleFieldChange = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    
    // Clear validation error for this field
    if (validationErrors[key]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    // Validate required fields
    if (!formData.name?.trim()) {
      errors.name = "Device name is required";
    }
    
    if (!formData.type?.trim()) {
      errors.type = "Device type is required";
    }
    
    if (!formData.siteId) {
      errors.siteId = "Site selection is required";
    }
    
    if (!formData.serviceUrl?.trim()) {
      errors.serviceUrl = "Service URL is required";
    }

    // Validate template-specific fields
    if (selectedTemplate) {
      selectedTemplate.fields.forEach(field => {
        const value = formData[field.key];
        
        if (field.required && (!value || (typeof value === 'string' && !value.trim()))) {
          errors[field.key] = `${field.label} is required`;
        }
        
        if (value && field.validation) {
          const validation = field.validation;
          
          if (validation.pattern && typeof value === 'string') {
            const regex = new RegExp(validation.pattern);
            if (!regex.test(value)) {
              errors[field.key] = `${field.label} format is invalid`;
            }
          }
          
          if (validation.min && typeof value === 'number' && value < validation.min) {
            errors[field.key] = `${field.label} must be at least ${validation.min}`;
          }
          
          if (validation.max && typeof value === 'number' && value > validation.max) {
            errors[field.key] = `${field.label} must be at most ${validation.max}`;
          }
          
          if (validation.minLength && typeof value === 'string' && value.length < validation.minLength) {
            errors[field.key] = `${field.label} must be at least ${validation.minLength} characters`;
          }
          
          if (validation.maxLength && typeof value === 'string' && value.length > validation.maxLength) {
            errors[field.key] = `${field.label} must be at most ${validation.maxLength} characters`;
          }
        }
      });
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const deviceData = {
        name: formData.name,
        type: formData.type,
        serviceUrl: formData.serviceUrl,
        siteId: formData.siteId,
        ipAddress: formData.ipAddress || null,
        parameters: selectedTemplate ? 
          selectedTemplate.fields.reduce((params, field) => {
            if (field.key !== 'name' && field.key !== 'type' && formData[field.key] !== undefined) {
              params[field.key] = formData[field.key];
            }
            return params;
          }, {} as Record<string, any>) : null,
      };
      
      if (isEditing && device) {
        await updateDevice(device.id, deviceData);
      } else {
        await createDevice(deviceData);
      }
      
      onSave(deviceData);
      
    } catch (error) {
      console.error("Failed to save device:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (field: DeviceField) => {
    const value = formData[field.key] || "";
    const hasError = !!validationErrors[field.key];
    
    switch (field.type) {
      case 'select':
        return (
          <RuxSelect
            key={field.key}
            label={field.label}
            value={value}
            onRuxchange={(e: any) => handleFieldChange(field.key, e.target.value)}
            invalid={hasError}
            helpText={hasError ? validationErrors[field.key] : field.description}
            required={field.required}
          >
            <RuxOption value="" label={`Select ${field.label}`}>Select {field.label}</RuxOption>
            {field.options?.map(option => (
              <RuxOption key={option.value} value={option.value} label={option.label}>
                {option.label}
              </RuxOption>
            ))}
          </RuxSelect>
        );
        
      case 'textarea':
        return (
          <RuxTextarea
            key={field.key}
            label={field.label}
            value={value}
            onRuxinput={(e: any) => handleFieldChange(field.key, e.target.value)}
            placeholder={field.placeholder}
            invalid={hasError}
            helpText={hasError ? validationErrors[field.key] : field.description}
            required={field.required}
            rows={4}
          />
        );
        
      case 'checkbox':
        return (
          <RuxCheckbox
            key={field.key}
            checked={value || false}
            onRuxchange={(e: any) => handleFieldChange(field.key, e.target.checked)}
            helpText={field.description}
          >
            {field.label}
          </RuxCheckbox>
        );
        
      default:
        return (
          <RuxInput
            key={field.key}
            type={field.type}
            label={field.label}
            value={value}
            onRuxinput={(e: any) => handleFieldChange(field.key, e.target.value)}
            placeholder={field.placeholder}
            invalid={hasError}
            helpText={hasError ? validationErrors[field.key] : field.description}
            required={field.required}
            min={field.validation?.min?.toString()}
            max={field.validation?.max?.toString()}
          />
        );
    }
  };

  const groupedFields = selectedTemplate ? 
    selectedTemplate.fields.reduce((groups, field) => {
      const group = field.group || 'Basic';
      if (!groups[group]) {
        groups[group] = [];
      }
      groups[group].push(field);
      return groups;
    }, {} as Record<string, DeviceField[]>) : {};

  const canAddDevices = permissions.hasPermission(RESOURCES.DEVICES, ACTIONS.CREATE);
  const canEditDevices = permissions.hasPermission(RESOURCES.DEVICES, ACTIONS.UPDATE);

  return (
    <RuxContainer className="flexible-device-form">
      <div slot="header">
        <div className="form-header">
          <h2>
            {isEditing ? (
              <>
                <RuxIcon icon="edit" size="small" />
                Edit Device
              </>
            ) : (
              <>
                <RuxIcon icon="add" size="small" />
                Add New Device
              </>
            )}
          </h2>
          <RuxButton secondary onClick={onCancel}>
            <RuxIcon icon="close" size="small" />
          </RuxButton>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="device-form">
        <RuxTabs>
          <RuxTab selected={activeTab === 0} onClick={() => setActiveTab(0)}>
            Device Type
          </RuxTab>
          <RuxTab selected={activeTab === 1} onClick={() => setActiveTab(1)}>
            Configuration
          </RuxTab>
          <RuxTab selected={activeTab === 2} onClick={() => setActiveTab(2)}>
            Advanced
          </RuxTab>
        </RuxTabs>

        {activeTab === 0 && (
          <div className="template-selection">
            <h3>Select Device Type</h3>
            <div className="templates-grid">
              {deviceTemplates.map(template => (
                <RuxCard
                  key={template.type}
                  className={`template-card ${selectedTemplate?.type === template.type ? 'selected' : ''}`}
                  onClick={() => handleTemplateSelect(template)}
                >
                  <div className="template-info">
                    <div className="template-header">
                      <RuxIcon icon={template.icon} size="large" />
                      <div>
                        <h4>{template.name}</h4>
                        <RuxStatus status="normal">{template.type}</RuxStatus>
                      </div>
                    </div>
                    <p className="template-description">{template.description}</p>
                  </div>
                </RuxCard>
              ))}
            </div>
          </div>
        )}

        {activeTab === 1 && (
          <div className="basic-config">
            <h3>Basic Configuration</h3>
            
            <div className="form-section">
              <h4>General Information</h4>
              <div className="form-grid">
                <RuxSelect
                  label="Site"
                  value={formData.siteId?.toString() || ""}
                  onRuxchange={(e: any) => handleFieldChange('siteId', parseInt(e.target.value))}
                  invalid={!!validationErrors.siteId}
                  helpText={validationErrors.siteId}
                  required
                >
                  <RuxOption value="" label="Select Site">Select Site</RuxOption>
                  {sites.map(site => (
                    <RuxOption key={site.id} value={site.id.toString()} label={site.name}>
                      {site.name}
                    </RuxOption>
                  ))}
                </RuxSelect>

                <RuxSelect
                  label="Service Endpoint"
                  value={formData.serviceUrl}
                  onRuxchange={(e: any) => handleFieldChange('serviceUrl', e.target.value)}
                  invalid={!!validationErrors.serviceUrl}
                  helpText={validationErrors.serviceUrl}
                  required
                >
                  <RuxOption value="" label="Select Service">Select Service</RuxOption>
                  {serviceUrls.map(url => (
                    <RuxOption key={url} value={url} label={url.replace(/^https?:\/\//, '')}>
                      {url.replace(/^https?:\/\//, '')}
                    </RuxOption>
                  ))}
                </RuxSelect>
              </div>
            </div>

            {selectedTemplate && Object.entries(groupedFields).map(([groupName, fields]) => (
              <div key={groupName} className="form-section">
                <h4>{groupName} Settings</h4>
                <div className="form-grid">
                  {fields.map(field => renderField(field))}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 2 && (
          <div className="advanced-config">
            <h3>Advanced Settings</h3>
            <div className="form-grid">
              <RuxTextarea
                label="Custom Parameters"
                value={formData.customParameters || ""}
                onRuxinput={(e: any) => handleFieldChange('customParameters', e.target.value)}
                placeholder="JSON configuration for advanced settings"
                helpText="Enter custom device parameters in JSON format"
                rows={6}
              />
              <RuxInput
                label="Tags"
                value={formData.tags || ""}
                onRuxinput={(e: any) => handleFieldChange('tags', e.target.value)}
                placeholder="production, critical, rack-a"
                helpText="Comma-separated tags for organization"
              />
            </div>
          </div>
        )}

        <div className="form-actions">
          <RuxButton secondary onClick={onCancel}>
            Cancel
          </RuxButton>
          <RuxButton
            type="submit"
            disabled={isSubmitting || (!canAddDevices && !isEditing) || (!canEditDevices && isEditing)}
          >
            {isSubmitting ? (
              <>
                <RuxIcon icon="refresh" className="spinning" />
                {isEditing ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>
                <RuxIcon icon={isEditing ? "save" : "add"} />
                {isEditing ? 'Update Device' : 'Create Device'}
              </>
            )}
          </RuxButton>
        </div>
      </form>
    </RuxContainer>
  );
};

export default FlexibleDeviceForm;