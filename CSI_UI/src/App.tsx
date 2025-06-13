import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import GlobalStatusBar from "./components/Navbar/Navbar";
import SiteEndpointLayout from "./components/SiteEndpointLayout/SiteEndpointLayout";
import AlertsPanel from "./components/Alerts/AlertsPanel";
import CriticalAlertNotifications from "./components/Alerts/CriticalAlertNotifications";
import ManageUsers from "./components/Management/ManageUsers";
import ManageDevices from "./components/Management/ManageDevices";
import ManageSites from "./components/Management/ManageSites";
import "@astrouxds/astro-web-components/dist/astro-web-components/astro-web-components.css";
import "./App.css";

const App: React.FC = () => {
  return (
    <Router>
      <div className="app-container">
        <GlobalStatusBar />
        <Routes>
          <Route path="/" element={<SiteEndpointLayout />} />
          <Route path="/manage-users" element={<ManageUsers />} />
          <Route path="/manage-sites" element={<ManageSites />} />
          <Route path="/manage-devices" element={<ManageDevices />} />
        </Routes>
        <AlertsPanel />
        {/* Critical Alert Notifications - floating overlay */}
        <CriticalAlertNotifications
          position="top-right"
          maxAlerts={5}
          serverUrl={
            import.meta.env.VITE_ALERT_SERVICE_URL || "http://localhost:8081"
          }
        />
      </div>
    </Router>
  );
};

export default App;
