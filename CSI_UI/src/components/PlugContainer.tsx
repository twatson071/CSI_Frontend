import React from 'react';
import { RuxMonitoringIcon } from '@astrouxds/react';
import './PlugContainer.css';

interface PlugContainerProps {
    plugs: boolean[]; // Array of plug states (true for "on", false for "off")
}

const PlugContainer: React.FC<PlugContainerProps> = ({ plugs }) => {
    return (
        <div className="plug-container">
            <div className="plug-row">
                {plugs.map((isOn, index) => (
                    <div key={index} className="plug-item">
                        <RuxMonitoringIcon
                            label={`Plug ${index + 1}`}
                            size="large"
                            icon="power"
                        />
                        <span className={`plug-label ${isOn ? 'on' : 'off'}`}>
                            {isOn ? 'ON' : 'OFF'}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PlugContainer;
