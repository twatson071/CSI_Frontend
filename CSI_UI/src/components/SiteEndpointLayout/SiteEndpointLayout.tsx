// filepath: /home/thomas/Documents/work/CSI_Frontend/CSI_UI/src/components/SiteEndpointLayout/SiteEndpointLayout.tsx
import React, { useEffect, useState } from 'react';
import SiteEndpointsTree from './SiteEndpointsTree';
import PDU from '../PDU/PDU';
import { fetchPDUData, PDUData } from '../../services/tripplitePDU';
import './SiteEndpointLayout.css';
import { RuxContainer } from '@astrouxds/react';

const SiteEndpointLayout: React.FC = () => {
  const [pduData, setPduData] = useState<PDUData | null>(null);
  const [statuses, setStatuses] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchPDUData();
      setPduData(data);
      setStatuses(data.statuses || []); // Initialize statuses
    };

    fetchData();
  }, []);

  const toggleStatus = (index: number) => {
    setStatuses((prevStatuses) =>
      prevStatuses.map((status, i) =>
        i === index ? (status === 'normal' ? 'off' : 'normal') : status
      )
    );
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