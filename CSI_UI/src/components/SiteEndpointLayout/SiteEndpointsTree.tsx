import React from 'react';
import { RuxStatus, RuxTree, RuxTreeNode } from '@astrouxds/react';
import './SiteEndpointsTree.css';

interface SiteEndpointsTreeProps {
  pduData: {
    make: string;
    model: string;
    statuses: string[];
  };
  toggleStatus: (index: number) => void; // Function to toggle status
}

const SiteEndpointsTree: React.FC<SiteEndpointsTreeProps> = ({ pduData, toggleStatus }) => {
  // Determine the overall status of the PDU
  const overallStatus = pduData.statuses.every((status) => status === 'normal')
    ? 'normal'
    : 'critical';

  return (
    <div className="site-endpoints-tree">
      <RuxTree>
        <RuxTreeNode>
          <RuxStatus slot="prefix" status={overallStatus}></RuxStatus>
          {`${pduData.make} ${pduData.model}`} {/* Top-level tree item */}
          {pduData.statuses.map((status, index) => (
            <RuxTreeNode key={index} slot="node" onClick={() => toggleStatus(index)}>
              <RuxStatus
                slot="prefix"
                status={status === 'normal' ? 'normal' : 'critical'}
              ></RuxStatus>
              Plug {index + 1} - {status === 'normal' ? 'ON' : 'OFF'}
            </RuxTreeNode>
          ))}
        </RuxTreeNode>
      </RuxTree>
    </div>
  );
};

export default SiteEndpointsTree;