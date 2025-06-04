import React from "react";
import GlobalStatusBar from "./components/Navbar/Navbar";
import SiteEndpointLayout from "./components/SiteEndpointLayout/SiteEndpointLayout";
import AlertsPanel from "./components/Alerts/AlertsPanel";
import "@astrouxds/astro-web-components/dist/astro-web-components/astro-web-components.css";
import "./App.css";

const App: React.FC = () => {
  return (
    <div className="app-container">
      <GlobalStatusBar />
      <SiteEndpointLayout></SiteEndpointLayout>
      <AlertsPanel className="custom-alerts-area" />
    </div>
  );
};

export default App;
