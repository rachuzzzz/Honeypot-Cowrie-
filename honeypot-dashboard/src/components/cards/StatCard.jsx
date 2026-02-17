import { formatNumber } from '../../utils/formatters';

/**
 * Reusable statistics card component for displaying key metrics.
 * Designed for SOC-style dashboard with support for different visual variants.
 *
 * @param {string} title - Label for the metric
 * @param {number|string} value - The metric value to display
 * @param {string} variant - Visual variant: 'default' | 'danger' | 'warning' | 'success'
 * @param {string} subtitle - Optional additional context
 */
function StatCard({ title, value, variant = 'default', subtitle }) {
  // Map variants to Tailwind color classes
  const variantStyles = {
    default: 'border-soc-border',
    danger: 'border-soc-danger/50',
    warning: 'border-soc-warning/50',
    success: 'border-soc-success/50',
  };

  const valueStyles = {
    default: 'text-soc-text',
    danger: 'text-soc-danger',
    warning: 'text-soc-warning',
    success: 'text-soc-success',
  };

  // Format numeric values, pass through strings
  const displayValue = typeof value === 'number' ? formatNumber(value) : value;

  return (
    <div
      className={`bg-soc-surface border ${variantStyles[variant]} rounded-lg p-5`}
    >
      <p className="text-sm font-medium text-soc-muted uppercase tracking-wide">
        {title}
      </p>
      <p className={`mt-2 text-3xl font-semibold ${valueStyles[variant]}`}>
        {displayValue}
      </p>
      {subtitle && (
        <p className="mt-1 text-xs text-soc-muted">
          {subtitle}
        </p>
      )}
    </div>
  );
}

export default StatCard;
