import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

/**
 * Bar chart component for displaying command frequency data.
 * Uses Recharts for rendering with SOC-style dark theme colors.
 *
 * @param {Array} data - Array of command stat objects with 'command' and 'count' fields
 * @param {number} limit - Maximum number of commands to display (default: 10)
 */
function CommandBarChart({ data, limit = 10 }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-soc-muted">
        No command data available
      </div>
    );
  }

  // Sort by count descending and limit results
  const chartData = [...data]
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
    .map((item) => ({
      ...item,
      // Truncate long command names for display
      displayName:
        item.command.length > 20
          ? item.command.slice(0, 20) + '...'
          : item.command,
    }));

  // Color mapping for command categories
  const getCategoryColor = (category) => {
    const colors = {
      reconnaissance: '#3b82f6', // blue
      credential_access: '#ef4444', // red
      download: '#f59e0b', // amber
      execution: '#8b5cf6', // purple
      navigation: '#6b7280', // gray
      destruction: '#dc2626', // red-600
      persistence: '#f97316', // orange
    };
    return colors[category] || '#3b82f6';
  };

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-soc-surface border border-soc-border rounded p-3 shadow-lg">
          <p className="font-mono-data text-sm text-soc-text">
            {data.command}
          </p>
          <p className="text-soc-muted text-xs mt-1">
            Count: <span className="text-soc-accent font-medium">{data.count}</span>
          </p>
          <p className="text-soc-muted text-xs">
            Category: <span className="capitalize">{data.category}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="#1e1e2e"
          horizontal={true}
          vertical={false}
        />
        <XAxis
          type="number"
          tick={{ fill: '#71717a', fontSize: 12 }}
          axisLine={{ stroke: '#1e1e2e' }}
          tickLine={{ stroke: '#1e1e2e' }}
        />
        <YAxis
          dataKey="displayName"
          type="category"
          tick={{ fill: '#e4e4e7', fontSize: 11, fontFamily: 'monospace' }}
          axisLine={{ stroke: '#1e1e2e' }}
          tickLine={false}
          width={95}
        />
        <Tooltip
          content={<CustomTooltip />}
          cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
        />
        <Bar dataKey="count" radius={[0, 4, 4, 0]}>
          {chartData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={getCategoryColor(entry.category)}
              fillOpacity={0.8}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export default CommandBarChart;
