import React, { useEffect, useState } from "react";
import { RuxButton, RuxInput } from "@astrouxds/react";
import {
  fetchMetricTypes,
  getThresholdsForDevice,
  updateDeviceThresholds,
  DeviceThresholdInput,
} from "../../services";
import { addToast } from "../../utils/toast";

interface ThresholdFormProps {
  deviceId: number;
  onCancel: () => void;
}

interface Inputs {
  [metric: string]: {
    warning: string;
    critical: string;
    units: string;
    enabled: boolean;
  };
}

const ThresholdForm: React.FC<ThresholdFormProps> = ({ deviceId, onCancel }) => {
  const [metrics, setMetrics] = useState<string[]>([]);
  const [inputs, setInputs] = useState<Inputs>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchMetricTypes(deviceId).then(setMetrics);
    getThresholdsForDevice(deviceId).then((thr) => {
      const map: Inputs = {};
      thr.forEach((t) => {
        map[t.metricType] = {
          warning: t.cautionThreshold?.toString() || "",
          critical: t.criticalThreshold?.toString() || "",
          units: "",
          enabled: !t.isActive || t.isActive === 1,
        };
      });
      setInputs(map);
    });
  }, [deviceId]);

  const handleChange = (
    metric: string,
    field: keyof Inputs[string],
    value: string | boolean
  ) => {
    setInputs((prev) => ({
      ...prev,
      [metric]: { ...prev[metric], [field]: value } as any,
    }));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    metrics.forEach((m) => {
      const val = inputs[m];
      if (!val) return;
      const w = Number(val.warning);
      const c = Number(val.critical);
      if (isNaN(w) || w < 0) errs[m] = "Warning must be a number >= 0";
      if (isNaN(c) || c <= w) errs[m] = "Critical must exceed warning";
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const save = async () => {
    if (!validate()) return;
    const payload: DeviceThresholdInput[] = metrics.map((m) => ({
      metricType: m,
      warning: Number(inputs[m]?.warning || 0),
      critical: Number(inputs[m]?.critical || 0),
      units: inputs[m]?.units || undefined,
      enabled: inputs[m]?.enabled,
    }));
    try {
      await updateDeviceThresholds(deviceId, payload);
      addToast("Thresholds saved", true, 3000);
      onCancel();
    } catch (e) {
      console.error(e);
      addToast("Failed to save thresholds", false, 5000);
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
      className="threshold-form management-form"
    >
      {metrics.map((m) => (
        <div key={m} className="threshold-row">
          <h5>{m}</h5>
          <RuxInput
            label="Warning"
            value={inputs[m]?.warning || ""}
            onRuxinput={(e: any) => handleChange(m, "warning", e.target.value)}
          />
          <RuxInput
            label="Critical"
            value={inputs[m]?.critical || ""}
            onRuxinput={(e: any) => handleChange(m, "critical", e.target.value)}
          />
          <RuxInput
            label="Units"
            value={inputs[m]?.units || ""}
            onRuxinput={(e: any) => handleChange(m, "units", e.target.value)}
          />
          <label style={{ display: "block", marginTop: "var(--spacing-1)" }}>
            <input
              type="checkbox"
              checked={inputs[m]?.enabled ?? true}
              onChange={(e) => handleChange(m, "enabled", e.target.checked)}
            />
            Enabled
          </label>
          {errors[m] && (
            <div style={{ color: "var(--color-text-error)" }}>{errors[m]}</div>
          )}
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

export default ThresholdForm;
