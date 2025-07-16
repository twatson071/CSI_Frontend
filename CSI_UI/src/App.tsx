import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import GlobalStatusBar from "./components/Navbar/Navbar";
import SiteEndpointLayout from "./components/SiteEndpointLayout/SiteEndpointLayout";
import AlertsPanel from "./components/Alerts/AlertsPanel";
import { useAlerts } from "./hooks/useAlerts";
import ManageUsers from "./components/Management/ManageUsers";
import ManageDevices from "./components/Management/ManageDevices";
import ManageSites from "./components/Management/ManageSites";
import Login from "./components/Auth/Login";
import { useAuth } from "./contexts/AuthContext";
import { PreferencesProvider } from "./contexts/PreferencesContext";
import NotificationPreferences from "./components/common/NotificationPreferences";
import PreferencesPage from "./components/Management/PreferencesPage";
import "@astrouxds/astro-web-components/dist/astro-web-components/astro-web-components.css";
import "./App.css";

const App: React.FC = () => {
  const serverUrl =
    import.meta.env.VITE_ALERT_SERVICE_URL || "http://localhost:8081";
  const { alerts } = useAlerts(serverUrl);
  const { user } = useAuth();

  // Only render preferences if user is logged in
  return (
    <PreferencesProvider userId={user?.id || 0}>
      <Router>
        <div className="app-container">
          <GlobalStatusBar />
          <Routes>
            <Route path="/" element={<SiteEndpointLayout />} />
            <Route path="/login" element={<Login />} />
            <Route path="/manage-users" element={<ManageUsers />} />
            <Route path="/manage-sites" element={<ManageSites />} />
            <Route path="/manage-devices" element={<ManageDevices />} />
            <Route path="/preferences" element={<PreferencesPage />} />
          </Routes>
          <AlertsPanel alerts={alerts} />
        </div>
      </Router>
    </PreferencesProvider>
  );
};

export default App;
