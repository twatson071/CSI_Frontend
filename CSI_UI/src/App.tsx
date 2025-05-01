import React from 'react';
import GlobalStatusBar from './components/Navbar/Navbar';
import PDU from './components/PDU/PDU';
import SiteEndpointLayout from './components/SiteEndpointLayout/SiteEndpointLayout';
import './App.css';

const App: React.FC = () => {
  return (
    <div className="App">
      <GlobalStatusBar />
      <SiteEndpointLayout>
        <PDU />
      </SiteEndpointLayout>
    </div>
  );
};

export default App;