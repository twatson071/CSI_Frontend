import React from 'react';

interface SiteEndpointLayoutProps {
  children: React.ReactNode;
}

const SiteEndpointLayout: React.FC<SiteEndpointLayoutProps> = ({ children }) => {
  return (
    <div className="site-endpoint-layout">
      {children}
    </div>
  );
};

export default SiteEndpointLayout;