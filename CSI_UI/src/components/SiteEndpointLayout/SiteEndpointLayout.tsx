// filepath: /home/thomas/Documents/work/CSI_Frontend/CSI_UI/src/components/SiteEndpointLayout/SiteEndpointLayout.tsx
import React, { useEffect, useState } from 'react';
import SiteEndpointsTree from './SiteEndpointsTree';
import PDU from '../PDU/PDU';
import { fetchPDUData, PDUData, toggleOutletPower } from '../../services/tripplitePDU';
import './SiteEndpointLayout.css';
import { RuxContainer } from '@astrouxds/react';

const SiteEndpointLayout: React.FC = () => {
  const [pduData, setPduData] = useState<PDUData | null>(null);
  const [statuses, setStatuses] = useState<string[]>([]);
//TODO: Change to websocket
  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchPDUData();
      setPduData(data);
      setStatuses(data.statuses || []);
    };
  
    fetchData(); // Initial fetch
  
    const interval = setInterval(fetchData, 5000); // Poll every 60 seconds
  
    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  const toggleStatus = async (index: number) => {
    if (!pduData) return;
    const currentStatus = statuses[index];
    const newState = currentStatus === 'normal' ? 'POWER_OFF' : 'POWER_ON';
    try {
      await toggleOutletPower(index + 1, newState);
      const data = await fetchPDUData();
      setPduData(data);
      setStatuses(data.statuses || []);
    } catch (error) {
      console.error('Failed to toggle outlet power:', error);
    }
  };

  return (
    <div className="site-endpoint-layout">
      <RuxContainer class="sidebar">
        <div slot="header">Site Endpoints</div>
        {pduData && (
          <SiteEndpointsTree
            pduData={{ ...pduData, statuses }}
            toggleStatus={toggleStatus}
          />
        )}
      </RuxContainer>
        {pduData && (
          <PDU
            pduData={{ ...pduData, statuses }}
            toggleStatus={toggleStatus}
          />
        )}
    </div>
  );
};

export default SiteEndpointLayout;