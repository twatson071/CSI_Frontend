import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import GlobalStatusBar from "./components/Navbar/Navbar";
import SiteEndpointLayout from "./components/SiteEndpointLayout/SiteEndpointLayout";
import EnhancedAlertsPanel from "./components/Alerts/EnhancedAlertsPanel";
import { useAlerts } from "./hooks/useAlerts";
import ManageUsers from "./components/Management/ManageUsers";
import ManageDevices from "./components/Management/ManageDevices";
import EnhancedDeviceManagement from "./components/Devices/EnhancedDeviceManagement";
import DeviceConfigBackup from "./components/Devices/DeviceConfigBackup";
import ManageSites from "./components/Management/ManageSites";
import Login from "./components/Auth/Login";
import { useAuth } from "./contexts/AuthContext";
import { PreferencesProvider } from "./contexts/PreferencesContext";
import PreferencesPage from "./components/Management/PreferencesPage";
import ErrorBoundary from "./components/ErrorBoundary/ErrorBoundary";
import "@astrouxds/astro-web-components/dist/astro-web-components/astro-web-components.css";
import "./App.css";

const App: React.FC = () => {
  const serverUrl =
    import.meta.env.VITE_ALERT_SERVICE_URL || "http://localhost:8081";
  const { alerts, acknowledge, resolve, remove, bulkAcknowledge } = useAlerts(serverUrl);
  const { user } = useAuth();

  // Only render preferences if user is logged in
  return (
    <ErrorBoundary level="page">
      <PreferencesProvider userId={typeof user?.id === 'string' ? parseInt(user.id) || 0 : user?.id || 0}>
        <Router>
          <div className="app-container">
            <GlobalStatusBar />
            <ErrorBoundary level="section">
              <Routes>
                <Route path="/" element={<SiteEndpointLayout />} />
                <Route path="/login" element={<Login />} />
                <Route path="/manage-users" element={<ManageUsers />} />
                <Route path="/manage-sites" element={<ManageSites />} />
                <Route path="/manage-devices" element={<EnhancedDeviceManagement />} />
                <Route path="/manage-devices-legacy" element={<ManageDevices />} />
                <Route path="/device-backup" element={<DeviceConfigBackup />} />
                <Route path="/preferences" element={<PreferencesPage />} />
              </Routes>
            </ErrorBoundary>
            <ErrorBoundary level="component">
              <EnhancedAlertsPanel 
                alerts={alerts} 
                onAcknowledge={acknowledge}
                onResolve={resolve}
                onDelete={remove}
                onBulkAcknowledge={bulkAcknowledge}
                isLoading={false}
                enableBulkOperations={true}
                enableExport={true}
              />
            </ErrorBoundary>
          </div>
        </Router>
      </PreferencesProvider>
    </ErrorBoundary>
  );
};

export default App;
