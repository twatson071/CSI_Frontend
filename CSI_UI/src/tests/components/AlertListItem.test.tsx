import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AlertListItem from '../../components/Alerts/AlertListItem';

describe('AlertListItem Component', () => {
  const mockAlert = {
    id: 1,
    level: 'CRITICAL',
    message: 'CPU temperature exceeds threshold',
    source: 'Device Monitor',
    deviceId: 1,
    deviceName: 'Server-01',
    siteId: 1,
    siteName: 'Data Center',
    timestamp: new Date().toISOString(),
    status: 'active'
  };
  
  const mockHandlers = {
    onAcknowledge: vi.fn(),
    onResolve: vi.fn(),
    onViewDetails: vi.fn()
  };
  
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('should render alert information', () => {
    render(<AlertListItem alert={mockAlert} {...mockHandlers} />);
    
    expect(screen.getByText('CPU temperature exceeds threshold')).toBeInTheDocument();
    expect(screen.getByText(/Server-01/)).toBeInTheDocument();
    expect(screen.getByText(/Data Center/)).toBeInTheDocument();
  });
  
  it('should display critical alerts with appropriate styling', () => {
    render(<AlertListItem alert={mockAlert} {...mockHandlers} />);
    
    const alertElement = screen.getByRole('listitem');
    expect(alertElement).toHaveClass('critical');
  });
  
  it('should call onAcknowledge when acknowledge button is clicked', () => {
    render(<AlertListItem alert={mockAlert} {...mockHandlers} />);
    
    const ackButton = screen.getByText(/Acknowledge/i);
    fireEvent.click(ackButton);
    
    expect(mockHandlers.onAcknowledge).toHaveBeenCalledWith(mockAlert.id);
  });
  
  it('should call onResolve when resolve button is clicked', () => {
    render(<AlertListItem alert={mockAlert} {...mockHandlers} />);
    
    const resolveButton = screen.getByText(/Resolve/i);
    fireEvent.click(resolveButton);
    
    expect(mockHandlers.onResolve).toHaveBeenCalledWith(mockAlert.id);
  });
  
  it('should disable buttons for acknowledged alerts', () => {
    const acknowledgedAlert = { ...mockAlert, status: 'acknowledged' };
    render(<AlertListItem alert={acknowledgedAlert} {...mockHandlers} />);
    
    const ackButton = screen.getByText(/Acknowledged/i);
    expect(ackButton).toBeDisabled();
  });
  
  it('should hide buttons for resolved alerts', () => {
    const resolvedAlert = { ...mockAlert, status: 'resolved' };
    render(<AlertListItem alert={resolvedAlert} {...mockHandlers} />);
    
    expect(screen.queryByText(/Acknowledge/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Resolve/i)).not.toBeInTheDocument();
  });
});