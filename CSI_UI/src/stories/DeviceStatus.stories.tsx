import type { Meta, StoryObj } from '@storybook/react';
import DeviceStatus from '../components/Devices/DeviceStatus';

const meta = {
  title: 'Components/DeviceStatus',
  component: DeviceStatus,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Displays the current status of a device with appropriate color coding and optional loading state.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    status: {
      control: 'select',
      options: ['online', 'offline', 'warning', 'error'],
      description: 'The current status of the device',
    },
    isLoading: {
      control: 'boolean',
      description: 'Whether the status is currently being loaded',
    },
  },
} satisfies Meta<typeof DeviceStatus>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Online: Story = {
  args: {
    status: 'online',
  },
};

export const Offline: Story = {
  args: {
    status: 'offline',
  },
};

export const Warning: Story = {
  args: {
    status: 'warning',
  },
};

export const Error: Story = {
  args: {
    status: 'error',
  },
};

export const LoadingOnline: Story = {
  args: {
    status: 'online',
    isLoading: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows the loading state while status is being fetched',
      },
    },
  },
};

export const AllStatuses: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '20px', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <DeviceStatus status="online" />
        <span>Online</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <DeviceStatus status="offline" />
        <span>Offline</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <DeviceStatus status="warning" />
        <span>Warning</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <DeviceStatus status="error" />
        <span>Error</span>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Shows all available status states side by side',
      },
    },
  },
};