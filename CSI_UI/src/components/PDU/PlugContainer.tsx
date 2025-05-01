// filepath: /home/thomas/Documents/work/CSI_Frontend/CSI_UI/src/components/PDU/PlugContainer.tsx
import React from 'react';
import { RuxMonitoringIcon } from '@astrouxds/react';
import './PlugContainer.css';

interface PlugContainerProps {
  statuses: string[]; // Array of statuses (e.g., "normal", "off", etc.)
  toggleStatus: (index: number) => void; // Function to toggle status
}

const PlugContainer: React.FC<PlugContainerProps> = ({ statuses = [], toggleStatus }) => {
  return (
    <div className="plug-container">
      <div className="plug-row">
        {statuses.map((status, index) => (
          <div key={index} className="plug-item">
            <RuxMonitoringIcon
              status={(status as 'normal' | 'off' | undefined) || 'off'} // Default to 'off' if status is undefined
              icon="power"
              label={`Plug ${index + 1}`}
              onClick={() => toggleStatus(index)} // Call toggleStatus on click
              title={`Toggle Plug ${index + 1}`} // Accessibility
            />
            <span className="plug-label">
              {status === 'normal' ? 'ON' : 'OFF'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlugContainer;