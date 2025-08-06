import type { Meta, StoryObj } from '@storybook/react';
import MetricCard from '../components/Server/MetricCard';

// Generate mock data for the chart
const generateMockData = (points = 20) => {
  return Array.from({ length: points }, (_, i) => ({
    x: new Date(Date.now() - (points - i) * 60000).toISOString(),
    y: Math.random() * 50 + 25,
  }));
};

const meta = {
  title: 'Components/MetricCard',
  component: MetricCard,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Displays a metric with current value, trend, and historical chart.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: 'text',
      description: 'Title of the metric',
    },
    value: {
      control: 'text',
      description: 'Current value to display',
    },
    unit: {
      control: 'text',
      description: 'Unit of measurement',
    },
    data: {
      description: 'Historical data points for the chart',
    },
    color: {
      control: 'color',
      description: 'Color of the chart line',
    },
    showTrend: {
      control: 'boolean',
      description: 'Whether to show trend indicator',
    },
    trendUp: {
      control: 'boolean',
      description: 'Whether the trend is up or down',
    },
    isLoading: {
      control: 'boolean',
      description: 'Loading state of the card',
    },
  },
} satisfies Meta<typeof MetricCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'CPU Usage',
    value: '45',
    unit: '%',
    data: generateMockData(),
    color: '#4ade80',
  },
};

export const WithTrendUp: Story = {
  args: {
    title: 'Memory Usage',
    value: '8.2',
    unit: 'GB',
    data: generateMockData(),
    color: '#60a5fa',
    showTrend: true,
    trendUp: true,
  },
};

export const WithTrendDown: Story = {
  args: {
    title: 'Temperature',
    value: '72',
    unit: '°C',
    data: generateMockData(),
    color: '#f87171',
    showTrend: true,
    trendUp: false,
  },
};

export const Loading: Story = {
  args: {
    title: 'Network Traffic',
    value: '0',
    unit: 'Mbps',
    data: [],
    isLoading: true,
  },
};

export const MetricGrid: Story = {
  render: () => (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
      gap: '20px',
      padding: '20px',
    }}>
      <MetricCard
        title="CPU Usage"
        value="45"
        unit="%"
        data={generateMockData()}
        color="#4ade80"
        showTrend
        trendUp
      />
      <MetricCard
        title="Memory"
        value="12.4"
        unit="GB"
        data={generateMockData()}
        color="#60a5fa"
        showTrend
        trendUp={false}
      />
      <MetricCard
        title="Disk I/O"
        value="234"
        unit="MB/s"
        data={generateMockData()}
        color="#a78bfa"
      />
      <MetricCard
        title="Temperature"
        value="68"
        unit="°C"
        data={generateMockData()}
        color="#f87171"
        showTrend
        trendUp
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Example of multiple metric cards in a grid layout',
      },
    },
  },
};