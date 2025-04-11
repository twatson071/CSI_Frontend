// App.tsx
import React from 'react';
import GlobalStatusBar from './components/Navbar';
import PDU from './components/PDU';
import SiteEndpointsTree from './components/SiteEndpointsTree';
import SiteEndpointLayout from './components/SiteEndpointLayout';
import './App.css';
import '@astrouxds/astro-web-components/dist/astro-web-components/astro-web-components.css';

const App: React.FC = () => {
  return (
    <div className="App">
      <GlobalStatusBar />
      <SiteEndpointLayout>
        <PDU />
        <SiteEndpointsTree />
      </SiteEndpointLayout>
    </div>
  );
};

export default App;
