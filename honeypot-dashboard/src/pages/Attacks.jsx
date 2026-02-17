import { useState } from 'react';
import { PageHeader } from '../components/layout';
import AttackTable from '../components/tables/AttackTable';
import { useFetch } from '../hooks/useFetch';
import { getAttackSummary } from '../services/api';

/**
 * Attacks page displaying detailed attack information.
 * Includes filtering by attack type and sorting capabilities.
 */
function Attacks() {
  const { data, loading, error } = useFetch(getAttackSummary);
  const [filterType, setFilterType] = useState('ALL');
  const [sortField, setSortField] = useState('last_seen');
  const [sortDirection, setSortDirection] = useState('desc');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-soc-muted">Loading attack data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-soc-danger/10 border border-soc-danger/50 rounded-lg p-4">
        <p className="text-soc-danger">Error loading attacks: {error}</p>
      </div>
    );
  }

  // Filter data by attack type
  const filteredData =
    filterType === 'ALL'
      ? data
      : data.filter((attack) => attack.attack_type === filterType);

  // Sort data
  const sortedData = [...filteredData].sort((a, b) => {
    let comparison = 0;

    if (sortField === 'last_seen' || sortField === 'first_seen') {
      comparison = new Date(a[sortField]) - new Date(b[sortField]);
    } else if (sortField === 'failed_logins') {
      comparison = a.failed_logins - b.failed_logins;
    } else if (sortField === 'source_ip') {
      comparison = a.source_ip.localeCompare(b.source_ip);
    }

    return sortDirection === 'desc' ? -comparison : comparison;
  });

  // Get unique attack types for filter dropdown
  const attackTypes = ['ALL', ...new Set(data.map((a) => a.attack_type))];

  // Calculate statistics for the filtered data
  const totalFailedLogins = filteredData.reduce(
    (sum, a) => sum + a.failed_logins,
    0
  );
  const totalSuccessfulLogins = filteredData.reduce(
    (sum, a) => sum + a.successful_logins,
    0
  );

  return (
    <div>
      <PageHeader
        title="Attack Analysis"
        description="Detailed view of all detected attack attempts against the honeypot"
      />

      {/* Filter and Sort Controls */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        {/* Attack Type Filter */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-soc-muted">Filter by type:</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-soc-surface border border-soc-border rounded px-3 py-1.5 text-sm text-soc-text focus:outline-none focus:border-soc-accent"
          >
            {attackTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-soc-muted">Sort by:</label>
          <select
            value={sortField}
            onChange={(e) => setSortField(e.target.value)}
            className="bg-soc-surface border border-soc-border rounded px-3 py-1.5 text-sm text-soc-text focus:outline-none focus:border-soc-accent"
          >
            <option value="last_seen">Last Seen</option>
            <option value="first_seen">First Seen</option>
            <option value="failed_logins">Failed Logins</option>
            <option value="source_ip">IP Address</option>
          </select>
          <button
            onClick={() =>
              setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'))
            }
            className="px-2 py-1.5 bg-soc-surface border border-soc-border rounded text-sm text-soc-muted hover:text-soc-text hover:border-soc-accent transition-colors"
          >
            {sortDirection === 'asc' ? '↑ Asc' : '↓ Desc'}
          </button>
        </div>

        {/* Results Count */}
        <div className="ml-auto text-sm text-soc-muted">
          Showing {filteredData.length} of {data.length} attacks
        </div>
      </div>

      {/* Summary Stats Bar */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-soc-surface border border-soc-border rounded p-4 text-center">
          <p className="text-lg font-semibold text-soc-text">
            {filteredData.length}
          </p>
          <p className="text-xs text-soc-muted">Unique Attackers</p>
        </div>
        <div className="bg-soc-surface border border-soc-warning/50 rounded p-4 text-center">
          <p className="text-lg font-semibold text-soc-warning">
            {totalFailedLogins.toLocaleString()}
          </p>
          <p className="text-xs text-soc-muted">Failed Login Attempts</p>
        </div>
        <div className="bg-soc-surface border border-soc-danger/50 rounded p-4 text-center">
          <p className="text-lg font-semibold text-soc-danger">
            {totalSuccessfulLogins}
          </p>
          <p className="text-xs text-soc-muted">Successful Breaches</p>
        </div>
      </div>

      {/* Attack Table */}
      <div className="bg-soc-surface border border-soc-border rounded-lg overflow-hidden">
        <AttackTable data={sortedData} compact={false} />
      </div>
    </div>
  );
}

export default Attacks;
