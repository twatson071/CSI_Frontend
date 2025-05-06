import React from 'react';
import PlugContainer from './PlugContainer';
import { RuxContainer } from '@astrouxds/react';
import './PDU.css';

interface PDUProps {
  pduData: {
    make: string;
    model: string;
    label: string;
    statuses: string[];
  };
  toggleStatus: (index: number) => void;
}

const PDU: React.FC<PDUProps> = ({ pduData, toggleStatus }) => {
  return (
    <RuxContainer class="pdu-container">
      <div slot="header">{`${pduData.label} ${pduData.make} ${pduData.model}`}</div>
      <PlugContainer statuses={pduData.statuses} toggleStatus={toggleStatus} />
    </RuxContainer>
  );
};

export default PDU;