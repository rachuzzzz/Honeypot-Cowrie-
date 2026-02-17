import { useState } from 'react';
import { PageHeader } from '../components/layout';
import CommandBarChart from '../components/charts/CommandBarChart';
import { useFetch } from '../hooks/useFetch';
import { getCommandStats } from '../services/api';
import { formatNumber } from '../utils/formatters';

/**
 * Commands page for analyzing attacker command patterns.
 * Displays frequency charts and categorized command breakdowns.
 */
function Commands() {
  const { data: commands, loading, error } = useFetch(getCommandStats);
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-soc-muted">Loading command data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-soc-danger/10 border border-soc-danger/50 rounded-lg p-4">
        <p className="text-soc-danger">Error loading commands: {error}</p>
      </div>
    );
  }

  // Get unique categories
  const categories = ['ALL', ...new Set(commands.map((c) => c.category))];

  // Filter commands by category
  const filteredCommands =
    selectedCategory === 'ALL'
      ? commands
      : commands.filter((c) => c.category === selectedCategory);

  // Sort by count descending
  const sortedCommands = [...filteredCommands].sort(
    (a, b) => b.count - a.count
  );

  // Calculate total commands
  const totalCommands = commands.reduce((sum, c) => sum + c.count, 0);

  // Group commands by category with counts
  const categoryStats = categories
    .filter((cat) => cat !== 'ALL')
    .map((category) => ({
      category,
      count: commands
        .filter((c) => c.category === category)
        .reduce((sum, c) => sum + c.count, 0),
      uniqueCommands: commands.filter((c) => c.category === category).length,
    }))
    .sort((a, b) => b.count - a.count);

  // Category color mapping for badges
  const getCategoryStyle = (category) => {
    const styles = {
      reconnaissance: 'bg-soc-accent/20 text-soc-accent border-soc-accent/50',
      credential_access: 'bg-soc-danger/20 text-soc-danger border-soc-danger/50',
      download: 'bg-soc-warning/20 text-soc-warning border-soc-warning/50',
      execution: 'bg-purple-500/20 text-purple-400 border-purple-500/50',
      navigation: 'bg-soc-muted/20 text-soc-muted border-soc-muted/50',
      destruction: 'bg-red-600/20 text-red-400 border-red-500/50',
      persistence: 'bg-orange-500/20 text-orange-400 border-orange-500/50',
    };
    return styles[category] || 'bg-soc-muted/20 text-soc-muted border-soc-muted/50';
  };

  return (
    <div>
      <PageHeader
        title="Command Analysis"
        description="Analysis of commands executed by attackers during honeypot sessions"
      />

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-soc-surface border border-soc-border rounded-lg p-5">
          <p className="text-sm text-soc-muted uppercase tracking-wide">
            Total Commands
          </p>
          <p className="text-3xl font-semibold text-soc-text mt-2">
            {formatNumber(totalCommands)}
          </p>
        </div>
        <div className="bg-soc-surface border border-soc-border rounded-lg p-5">
          <p className="text-sm text-soc-muted uppercase tracking-wide">
            Unique Commands
          </p>
          <p className="text-3xl font-semibold text-soc-accent mt-2">
            {commands.length}
          </p>
        </div>
        <div className="bg-soc-surface border border-soc-border rounded-lg p-5">
          <p className="text-sm text-soc-muted uppercase tracking-wide">
            Categories
          </p>
          <p className="text-3xl font-semibold text-soc-text mt-2">
            {categoryStats.length}
          </p>
        </div>
      </div>

      {/* Chart and Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-soc-surface border border-soc-border rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-soc-text">
              Command Frequency
            </h2>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-soc-bg border border-soc-border rounded px-3 py-1.5 text-sm text-soc-text focus:outline-none focus:border-soc-accent"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'ALL' ? 'All Categories' : cat.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
          <CommandBarChart data={filteredCommands} limit={12} />
        </div>

        {/* Category Breakdown */}
        <div className="bg-soc-surface border border-soc-border rounded-lg p-5">
          <h2 className="text-lg font-medium text-soc-text mb-4">
            By Category
          </h2>
          <div className="space-y-3">
            {categoryStats.map((stat) => (
              <button
                key={stat.category}
                onClick={() =>
                  setSelectedCategory(
                    selectedCategory === stat.category ? 'ALL' : stat.category
                  )
                }
                className={`w-full text-left p-3 rounded border transition-colors ${
                  selectedCategory === stat.category
                    ? getCategoryStyle(stat.category)
                    : 'border-soc-border hover:border-soc-muted'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm capitalize">
                    {stat.category.replace('_', ' ')}
                  </span>
                  <span className="text-sm font-medium">
                    {formatNumber(stat.count)}
                  </span>
                </div>
                <div className="text-xs text-soc-muted mt-1">
                  {stat.uniqueCommands} unique commands
                </div>
                {/* Progress bar */}
                <div className="mt-2 h-1 bg-soc-bg rounded overflow-hidden">
                  <div
                    className="h-full bg-soc-accent/50 rounded"
                    style={{
                      width: `${(stat.count / totalCommands) * 100}%`,
                    }}
                  />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Command Table */}
      <div className="bg-soc-surface border border-soc-border rounded-lg overflow-hidden">
        <div className="p-4 border-b border-soc-border">
          <h2 className="text-lg font-medium text-soc-text">
            All Commands
            {selectedCategory !== 'ALL' && (
              <span className="text-soc-muted ml-2 text-sm font-normal">
                (filtered by {selectedCategory.replace('_', ' ')})
              </span>
            )}
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-soc-border">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-soc-muted uppercase tracking-wider">
                  Command
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-soc-muted uppercase tracking-wider">
                  Category
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-soc-muted uppercase tracking-wider">
                  Count
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-soc-muted uppercase tracking-wider">
                  % of Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-soc-border">
              {sortedCommands.map((cmd, index) => (
                <tr
                  key={cmd.command + index}
                  className="hover:bg-soc-border/30 transition-colors"
                >
                  <td className="px-4 py-3">
                    <code className="font-mono-data text-sm text-soc-text">
                      {cmd.command}
                    </code>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize ${getCategoryStyle(
                        cmd.category
                      )}`}
                    >
                      {cmd.category.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-soc-text">
                    {formatNumber(cmd.count)}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-soc-muted">
                    {((cmd.count / totalCommands) * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Commands;
