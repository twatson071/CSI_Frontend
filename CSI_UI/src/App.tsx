import React from "react";
import GlobalStatusBar from "./components/Navbar/Navbar";
import PDU from "./components/PDU/PDU";
import SiteEndpointLayout from "./components/SiteEndpointLayout/SiteEndpointLayout";
import "@astrouxds/astro-web-components/dist/astro-web-components/astro-web-components.css";
import "./App.css";

const App: React.FC = () => {
  return (
    <div className="app-container">
      <GlobalStatusBar />
      <SiteEndpointLayout></SiteEndpointLayout>
    </div>
  );
};

export default App;
