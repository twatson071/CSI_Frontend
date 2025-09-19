import React, { useState, useEffect } from "react";
import { RuxSwitch, RuxContainer, RuxIcon } from "@astrouxds/react";
import NotificationPreferences from "../common/NotificationPreferences";
import SystemSettingsService from "../../services/SystemSettingsService";
import "./Management.css";

const PreferencesPage: React.FC = () => {
  const [mockMode, setMockMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchMockModeStatus();
  }, []);

  const fetchMockModeStatus = async () => {
    try {
      const isMockMode = await SystemSettingsService.getMockModeStatus();
      setMockMode(isMockMode);
    } catch (error) {
      console.error("Failed to fetch mock mode status:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMockModeToggle = async (checked: boolean) => {
    setSaving(true);
    try {
      const data = await SystemSettingsService.toggleMockMode();
      setMockMode(data.mockMode);
      console.log(`Mock mode ${data.mockMode ? "enabled" : "disabled"}`);
    } catch (error) {
      console.error("Failed to toggle mock mode:", error);
      // Revert the toggle on error
      setMockMode(!checked);
    } finally {
      setSaving(false);
    }
  };
  return (
    <div
      className="management-main preferences-page"
      style={{
        maxWidth: 800,
        margin: "2rem auto",
        padding: 0,
      }}
    >
      <RuxContainer>
        <div slot="header">
          <h2 style={{ margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <RuxIcon icon="settings" size="1.5rem" />
            System Preferences
          </h2>
        </div>

        <div style={{ padding: "1.5rem" }}>
          {/* System Settings Section */}
          <div style={{
            marginBottom: "2rem",
            padding: "1.5rem",
            background: "var(--color-background-surface-default)",
            border: "1px solid var(--color-background-surface-header)",
            borderRadius: "4px"
          }}>
            <h3 style={{ marginTop: 0, marginBottom: "1.5rem", fontSize: "1.125rem" }}>
              System Configuration
            </h3>

            {/* Mock Mode Toggle */}
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "1rem",
              background: "var(--color-background-base-default)",
              borderRadius: "4px",
              marginBottom: "1rem"
            }}>
              <div>
                <div style={{ fontWeight: 500, marginBottom: "0.25rem" }}>
                  Mock Data Mode
                </div>
                <div style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
                  Use simulated data for testing and demonstration purposes
                </div>
              </div>
              <RuxSwitch
                checked={mockMode}
                disabled={loading || saving}
                onRuxchange={(e: CustomEvent) => handleMockModeToggle(e.detail)}
              />
            </div>

            {mockMode && (
              <div style={{
                padding: "0.75rem 1rem",
                background: "var(--color-status-caution-on-dark)",
                color: "var(--color-background-base-default)",
                borderRadius: "4px",
                fontSize: "0.875rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem"
              }}>
                <RuxIcon icon="warning" size="1rem" />
                <span>Mock mode is active. All device data is simulated.</span>
              </div>
            )}
          </div>

          {/* Notification Preferences Section */}
          <div style={{
            padding: "1.5rem",
            background: "var(--color-background-surface-default)",
            border: "1px solid var(--color-background-surface-header)",
            borderRadius: "4px"
          }}>
            <h3 style={{ marginTop: 0, marginBottom: "1.5rem", fontSize: "1.125rem" }}>
              Notification Preferences
            </h3>
            <NotificationPreferences />
          </div>
        </div>
      </RuxContainer>
    </div>
  );
};

export default PreferencesPage;
