import React, { useEffect, useState } from 'react';
import { RuxMonitoringIcon } from '@astrouxds/react';
import axios from 'axios';
import './PlugContainer.css';

interface PlugContainerProps {
    initialStatuses: string[]; // Array of initial statuses (e.g., "normal", "off", etc.)
}

const PlugContainer: React.FC<PlugContainerProps> = ({ initialStatuses }) => {
    const [statuses, setStatuses] = useState<string[]>([]);

    useEffect(() => {
        if (initialStatuses && Array.isArray(initialStatuses)) {
            setStatuses(initialStatuses); // Ensure statuses are set correctly
        } else {
            console.error('Invalid initialStatuses:', initialStatuses);
        }
    }, [initialStatuses]);

    const toggleStatus = async (index: number) => {
        try {
            const currentStatus = statuses[index];
            const newState = currentStatus === 'normal' ? 'OFF' : 'POWER_ON'; // Toggle state
            const response = await axios.post(`http://localhost:7676/csi_tripplite_pdumh20/toggle`, {
                plugIndex: index + 1, // Assuming the API expects a 1-based index
                state: newState,
            });

            if (response.status === 200) {
                // Update the local state based on the API response
                setStatuses((prevStatuses) =>
                    prevStatuses.map((status, i) =>
                        i === index ? (newState === 'POWER_ON' ? 'normal' : 'off') : status
                    )
                );
            } else {
                console.error('Failed to toggle plug status:', response.data);
            }
        } catch (error) {
            console.error('Error toggling plug status:', error);
        }
    };

    return (
        <div className="plug-container">
            <div className="plug-row">
                {statuses.map((status, index) => (
                    <div key={index} className="plug-item">
                        <RuxMonitoringIcon
                            status={status || 'off'} // Default to 'off' if status is undefined
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
