import { formatDateTime, formatNumber } from '../../utils/formatters';

/**
 * Attack summary table component.
 * Displays attack data with sortable columns and attack type badges.
 *
 * @param {Array} data - Array of attack summary objects
 * @param {boolean} compact - If true, shows fewer columns (for dashboard view)
 */
function AttackTable({ data, compact = false }) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-soc-muted">
        No attack data available
      </div>
    );
  }

  // Badge styling based on attack type
  const getAttackTypeBadge = (type) => {
    const styles = {
      RECON: 'bg-soc-accent/20 text-soc-accent',
      BRUTE_FORCE: 'bg-soc-warning/20 text-soc-warning',
      COMPROMISED: 'bg-soc-danger/20 text-soc-danger',
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium ${
          styles[type] || 'bg-soc-muted/20 text-soc-muted'
        }`}
      >
        {type}
      </span>
    );
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-soc-border">
        <thead>
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-soc-muted uppercase tracking-wider">
              Source IP
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-soc-muted uppercase tracking-wider">
              Attack Type
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-soc-muted uppercase tracking-wider">
              Failed Logins
            </th>
            {!compact && (
              <>
                <th className="px-4 py-3 text-left text-xs font-medium text-soc-muted uppercase tracking-wider">
                  Successful
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-soc-muted uppercase tracking-wider">
                  Sessions
                </th>
              </>
            )}
            <th className="px-4 py-3 text-left text-xs font-medium text-soc-muted uppercase tracking-wider">
              First Seen
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-soc-muted uppercase tracking-wider">
              Last Seen
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-soc-border">
          {data.map((attack, index) => (
            <tr
              key={attack.source_ip + index}
              className="hover:bg-soc-border/30 transition-colors"
            >
              <td className="px-4 py-3 whitespace-nowrap">
                <span className="font-mono-data text-sm text-soc-text">
                  {attack.source_ip}
                </span>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                {getAttackTypeBadge(attack.attack_type)}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-soc-text">
                {formatNumber(attack.failed_logins)}
              </td>
              {!compact && (
                <>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <span
                      className={
                        attack.successful_logins > 0
                          ? 'text-soc-danger font-medium'
                          : 'text-soc-muted'
                      }
                    >
                      {attack.successful_logins}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-soc-muted">
                    {attack.session_count}
                  </td>
                </>
              )}
              <td className="px-4 py-3 whitespace-nowrap text-sm text-soc-muted">
                {formatDateTime(attack.first_seen)}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-soc-muted">
                {formatDateTime(attack.last_seen)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AttackTable;
