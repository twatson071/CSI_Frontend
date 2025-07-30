import React from "react";
import { RuxContainer, RuxSwitch } from "@astrouxds/react";
import { usePreferences } from "../../contexts/PreferencesContext";

const NOTIFICATION_LABELS: Record<string, string> = {
  alerts: "General Alerts",
  critical: "Critical Alerts",
  device: "Device Notifications",
  info: "Informational Messages",
  system: "System Notifications",
};

const NotificationPreferences: React.FC = () => {
  const { preferences, setPreference, loading } = usePreferences();

  if (loading) return <div>Loading notification preferences...</div>;
  if (!preferences) return <div>Preferences unavailable.</div>;

  return (
    <RuxContainer style={{ maxWidth: 400, margin: "0 auto" }}>
      <div slot="header">Notification Preferences</div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 20,
          padding: 16,
        }}
      >
        {Object.entries(preferences).map(([type, value]) => (
          <RuxSwitch
            key={type}
            checked={value}
            onRuxchange={(e) => setPreference(type as any, e.target.checked)}
            label={NOTIFICATION_LABELS[type] || type}
          />
        ))}
      </div>
    </RuxContainer>
  );
};

export default NotificationPreferences;
