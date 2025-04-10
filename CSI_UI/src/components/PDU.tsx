import { useEffect, useState } from 'react';
import axios from 'axios';
import PlugContainer from './PlugContainer';
import './PDU.css';

const PDU = () => {
    const [plugs, setPlugs] = useState(Array(8).fill(false)); // Assuming 8 plugs, all initially off.

    useEffect(() => {
        // Fetch data from the /tripplite endpoint
        axios.get('http://localhost:7676/csi_tripplite_pdumh20/')
            .then(response => {
                const outlets = response.data.parameters?.outlets; // Safely access outlets
                if (outlets && typeof outlets === 'object') {
                    const plugStates = Object.values(outlets).map(outlet => outlet.state === 'POWER_ON'); // Convert to boolean array
                    setPlugs(plugStates);
                } else {
                    console.error('Invalid outlets data:', outlets);
                }
            })
            .catch(error => {
                console.error('Error fetching PDU data:', error);
            });
    }, []);

    return (
        <div className="pdu">
            <h3>Tripp Lite</h3>
            <PlugContainer plugs={plugs} />
        </div>
    );
};

export default PDU;