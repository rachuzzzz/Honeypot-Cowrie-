import { PageHeader } from '../components/layout';
import StatCard from '../components/cards/StatCard';
import AttackTable from '../components/tables/AttackTable';
import CommandBarChart from '../components/charts/CommandBarChart';
import { useFetch } from '../hooks/useFetch';
import { getAllDashboardData } from '../services/api';

/**
 * Main dashboard page providing an overview of honeypot activity.
 * Displays key metrics, recent attacks, and command statistics.
 */
function Dashboard() {
  const { data, loading, error } = useFetch(getAllDashboardData);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-soc-muted">Loading dashboard data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-soc-danger/10 border border-soc-danger/50 rounded-lg p-4">
        <p className="text-soc-danger">Error loading dashboard: {error}</p>
      </div>
    );
  }

  const { attacks, commands, sessions } = data;

  // Calculate summary statistics
  const totalAttacks = attacks.length;
  const uniqueIPs = new Set(attacks.map((a) => a.source_ip)).size;
  const bruteForceCount = attacks.filter(
    (a) => a.attack_type === 'BRUTE_FORCE'
  ).length;
  const compromisedCount = attacks.filter(
    (a) => a.attack_type === 'COMPROMISED'
  ).length;

  // Get recent attacks (sorted by last_seen)
  const recentAttacks = [...attacks]
    .sort((a, b) => new Date(b.last_seen) - new Date(a.last_seen))
    .slice(0, 5);

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Real-time overview of honeypot security telemetry"
      />

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Attacks"
          value={totalAttacks}
          subtitle="Detected attack attempts"
        />
        <StatCard
          title="Unique IPs"
          value={uniqueIPs}
          variant="default"
          subtitle="Distinct source addresses"
        />
        <StatCard
          title="Brute Force"
          value={bruteForceCount}
          variant="warning"
          subtitle="Password attack attempts"
        />
        <StatCard
          title="Compromised"
          value={compromisedCount}
          variant="danger"
          subtitle="Successful intrusions"
        />
      </div>

      {/* Two-column layout for table and chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Attacks */}
        <div className="bg-soc-surface border border-soc-border rounded-lg p-5">
          <h2 className="text-lg font-medium text-soc-text mb-4">
            Recent Attacks
          </h2>
          <AttackTable data={recentAttacks} compact={true} />
        </div>

        {/* Command Analysis */}
        <div className="bg-soc-surface border border-soc-border rounded-lg p-5">
          <h2 className="text-lg font-medium text-soc-text mb-4">
            Top Commands Executed
          </h2>
          <CommandBarChart data={commands} limit={8} />
        </div>
      </div>

      {/* Session Summary */}
      <div className="mt-6 bg-soc-surface border border-soc-border rounded-lg p-5">
        <h2 className="text-lg font-medium text-soc-text mb-4">
          Session Activity
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-soc-bg rounded">
            <p className="text-2xl font-semibold text-soc-text">
              {sessions.length}
            </p>
            <p className="text-sm text-soc-muted mt-1">Total Sessions</p>
          </div>
          <div className="text-center p-4 bg-soc-bg rounded">
            <p className="text-2xl font-semibold text-soc-success">
              {sessions.filter((s) => s.auth_success).length}
            </p>
            <p className="text-sm text-soc-muted mt-1">Authenticated</p>
          </div>
          <div className="text-center p-4 bg-soc-bg rounded">
            <p className="text-2xl font-semibold text-soc-accent">
              {sessions.reduce((sum, s) => sum + s.commands.length, 0)}
            </p>
            <p className="text-sm text-soc-muted mt-1">Commands Captured</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
