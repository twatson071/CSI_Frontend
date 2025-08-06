import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AlertsPanel from '../../components/Alerts/AlertsPanel';
import * as AlertService from '../../services/AlertService';

// Mock services
vi.mock('../../services/AlertService');
vi.mock('../../utils/toast', () => ({
  addToast: vi.fn()
}));

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('Alert Workflow Integration', () => {
  const mockAlerts = [
    {
      id: 1,
      level: 'CRITICAL',
      message: 'High CPU usage detected',
      status: 'active',
      timestamp: new Date().toISOString(),
      deviceId: 1,
      deviceName: 'Server-01'
    },
    {
      id: 2,
      level: 'WARNING',
      message: 'Memory usage above threshold',
      status: 'active',
      timestamp: new Date().toISOString(),
      deviceId: 2,
      deviceName: 'Server-02'
    }
  ];
  
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(AlertService.getAlerts).mockResolvedValue(mockAlerts);
  });
  
  describe('Alert Display and Filtering', () => {
    it('should display all active alerts on load', async () => {
      renderWithRouter(<AlertsPanel />);
      
      await waitFor(() => {
        expect(screen.getByText('High CPU usage detected')).toBeInTheDocument();
        expect(screen.getByText('Memory usage above threshold')).toBeInTheDocument();
      });
    });
    
    it('should filter alerts by severity', async () => {
      renderWithRouter(<AlertsPanel />);
      
      await waitFor(() => {
        expect(screen.getAllByRole('listitem')).toHaveLength(2);
      });
      
      // Filter to show only CRITICAL
      const filterSelect = screen.getByLabelText('Severity Filter');
      fireEvent.change(filterSelect, { target: { value: 'CRITICAL' } });
      
      await waitFor(() => {
        expect(screen.getByText('High CPU usage detected')).toBeInTheDocument();
        expect(screen.queryByText('Memory usage above threshold')).not.toBeInTheDocument();
      });
    });
  });
  
  describe('Alert Actions', () => {
    it('should acknowledge an alert', async () => {
      vi.mocked(AlertService.acknowledgeAlert).mockResolvedValue({ 
        ...mockAlerts[0], 
        status: 'acknowledged' 
      });
      
      renderWithRouter(<AlertsPanel />);
      
      await waitFor(() => {
        expect(screen.getByText('High CPU usage detected')).toBeInTheDocument();
      });
      
      // Click acknowledge button on first alert
      const ackButtons = screen.getAllByText(/Acknowledge/i);
      fireEvent.click(ackButtons[0]);
      
      await waitFor(() => {
        expect(AlertService.acknowledgeAlert).toHaveBeenCalledWith(1);
      });
    });
    
    it('should resolve multiple alerts', async () => {
      vi.mocked(AlertService.bulkResolveAlerts).mockResolvedValue({ 
        success: true,
        resolved: [1, 2]
      });
      
      renderWithRouter(<AlertsPanel />);
      
      await waitFor(() => {
        expect(screen.getAllByRole('checkbox')).toHaveLength(3); // 2 alerts + select all
      });
      
      // Select all alerts
      const selectAllCheckbox = screen.getByLabelText('Select All');
      fireEvent.click(selectAllCheckbox);
      
      // Click bulk resolve
      const bulkResolveButton = screen.getByText('Resolve Selected');
      fireEvent.click(bulkResolveButton);
      
      await waitFor(() => {
        expect(AlertService.bulkResolveAlerts).toHaveBeenCalledWith([1, 2]);
      });
    });
  });
  
  describe('Real-time Updates', () => {
    it('should add new alerts via WebSocket', async () => {
      const { rerender } = renderWithRouter(<AlertsPanel />);
      
      await waitFor(() => {
        expect(screen.getAllByRole('listitem')).toHaveLength(2);
      });
      
      // Simulate new alert via WebSocket
      const newAlert = {
        id: 3,
        level: 'CRITICAL',
        message: 'Disk space critical',
        status: 'active',
        timestamp: new Date().toISOString(),
        deviceId: 3,
        deviceName: 'Server-03'
      };
      
      // Update mock to include new alert
      vi.mocked(AlertService.getAlerts).mockResolvedValue([...mockAlerts, newAlert]);
      
      // Trigger re-render (simulating WebSocket update)
      rerender(<AlertsPanel />);
      
      await waitFor(() => {
        expect(screen.getByText('Disk space critical')).toBeInTheDocument();
        expect(screen.getAllByRole('listitem')).toHaveLength(3);
      });
    });
  });
});