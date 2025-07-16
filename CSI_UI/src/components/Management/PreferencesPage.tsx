import React from "react";
import NotificationPreferences from "../common/NotificationPreferences";
import "./Management.css";

const PreferencesPage: React.FC = () => {
  return (
    <div
      className="management-main preferences-page"
      style={{
        maxWidth: 600,
        margin: "2rem auto",
        padding: 32,
        background: "var(--color-background, #fff)",
        borderRadius: 8,
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
      }}
    >
      <h2 style={{ marginBottom: 24 }}>Notification Preferences</h2>
      <NotificationPreferences />
    </div>
  );
};

export default PreferencesPage;
