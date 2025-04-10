import { useEffect, useState } from 'react';
import axios from 'axios';
import PlugContainer from './PlugContainer';
import './PDU.css';

const PDU = () => {
    const [statuses, setStatuses] = useState<string[]>(Array(8).fill('off')); // Default to 'off'

    useEffect(() => {
        // Fetch data from the /tripplite endpoint
        axios.get('http://localhost:7676/csi_tripplite_pdumh20/')
            .then(response => {
                const outlets = response.data.parameters?.outlets; // Safely access outlets
                if (outlets && typeof outlets === 'object') {
                    const plugStatuses = Object.values(outlets).map(outlet =>
                        outlet.state === 'POWER_ON' ? 'normal' : 'off'
                    ); // Map 'POWER_ON' to 'normal' and others to 'off'
                    setStatuses(plugStatuses);
                } else {
                    console.error('Invalid outlets data:', outlets);
                    setStatuses(Array(8).fill('off')); // Fallback to default
                }
            })
            .catch(error => {
                console.error('Error fetching PDU data:', error);
                setStatuses(Array(8).fill('off')); // Fallback to default
            });
    }, []);

    return (
        <div className="pdu">
            <h3>Tripp Lite</h3>
            <PlugContainer initialStatuses={statuses} /> {/* Pass statuses as initialStatuses */}
        </div>
    );
};

export default PDU;