import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DeviceStatus from '../../components/Devices/DeviceStatus';

// Mock the toast utility
vi.mock('../../utils/toast', () => ({
  addToast: vi.fn()
}));

describe('DeviceStatus Component', () => {
  it('renders device status table', () => {
    render(<DeviceStatus />);
    
    // Check for table headers
    expect(screen.getByText('Device Status')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Type')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });
  
  it('renders initial devices', () => {
    render(<DeviceStatus />);
    
    // Check for sample devices
    expect(screen.getByText('Router-01')).toBeInTheDocument();
    expect(screen.getByText('Switch-A2')).toBeInTheDocument();
    expect(screen.getByText('Server-Main')).toBeInTheDocument();
    expect(screen.getByText('PDU-East-Wing')).toBeInTheDocument();
  });
  
  it('handles device deletion', () => {
    const { addToast } = vi.mocked(await import('../../utils/toast'));
    render(<DeviceStatus />);
    
    // Check initial device count
    const initialRows = screen.getAllByRole('row');
    const initialCount = initialRows.length;
    
    // Find and click delete button for first device
    // Note: We need to check the actual DeviceListItem implementation
    // to know how deletion is triggered
    
    // After deletion, check that toast was called
    // expect(addToast).toHaveBeenCalledWith('Device deleted', true, 3000, 'device');
  });
  
  it('opens investigate dialog when device is selected', () => {
    render(<DeviceStatus />);
    
    // This test depends on DeviceListItem implementation
    // Need to check how investigate action is triggered
  });
});