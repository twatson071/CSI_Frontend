import type { Meta, StoryObj } from '@storybook/react';
import StatusBadge from '../components/common/StatusBadge';

const meta = {
  title: 'Components/StatusBadge',
  component: StatusBadge,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A versatile status badge component that displays various states with appropriate colors and icons.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    status: {
      control: 'select',
      options: ['standby', 'normal', 'caution', 'serious', 'critical', 'off'],
      description: 'The status level to display',
    },
    label: {
      control: 'text',
      description: 'Optional label text to display',
    },
    showIcon: {
      control: 'boolean',
      description: 'Whether to show the status icon',
    },
    pulse: {
      control: 'boolean',
      description: 'Whether to show a pulsing animation',
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
      description: 'Size of the badge',
    },
  },
} satisfies Meta<typeof StatusBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    status: 'normal',
  },
};

export const WithLabel: Story = {
  args: {
    status: 'normal',
    label: 'System OK',
  },
};

export const Critical: Story = {
  args: {
    status: 'critical',
    label: 'Critical Error',
    pulse: true,
  },
};

export const AllStatuses: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '20px', flexDirection: 'column' }}>
      <StatusBadge status="standby" label="Standby" />
      <StatusBadge status="normal" label="Normal" />
      <StatusBadge status="caution" label="Caution" />
      <StatusBadge status="serious" label="Serious" />
      <StatusBadge status="critical" label="Critical" pulse />
      <StatusBadge status="off" label="Off" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Shows all available status levels',
      },
    },
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
      <StatusBadge status="normal" label="Small" size="small" />
      <StatusBadge status="normal" label="Medium" size="medium" />
      <StatusBadge status="normal" label="Large" size="large" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Shows different size variations',
      },
    },
  },
};

export const WithoutIcons: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '20px', flexDirection: 'column' }}>
      <StatusBadge status="normal" label="Normal" showIcon={false} />
      <StatusBadge status="caution" label="Caution" showIcon={false} />
      <StatusBadge status="critical" label="Critical" showIcon={false} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Status badges without icons',
      },
    },
  },
};