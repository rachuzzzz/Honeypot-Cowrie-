/**
 * Utility functions for formatting data in the SOC dashboard.
 * Provides consistent date, time, and number formatting across the application.
 */

/**
 * Formats an ISO timestamp to a human-readable date string.
 * @param {string} isoString - ISO 8601 timestamp
 * @returns {string} Formatted date (e.g., "Jan 15, 2024")
 */
export function formatDate(isoString) {
  if (!isoString) return '—';
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Formats an ISO timestamp to include time.
 * @param {string} isoString - ISO 8601 timestamp
 * @returns {string} Formatted datetime (e.g., "Jan 15, 2024 08:23:41")
 */
export function formatDateTime(isoString) {
  if (!isoString) return '—';
  const date = new Date(isoString);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

/**
 * Formats an ISO timestamp to time only.
 * @param {string} isoString - ISO 8601 timestamp
 * @returns {string} Formatted time (e.g., "08:23:41")
 */
export function formatTime(isoString) {
  if (!isoString) return '—';
  const date = new Date(isoString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

/**
 * Formats seconds into a human-readable duration.
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted duration (e.g., "5m 30s" or "1h 15m")
 */
export function formatDuration(seconds) {
  if (seconds === null || seconds === undefined) return '—';

  if (seconds < 60) {
    return `${seconds}s`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes < 60) {
    return remainingSeconds > 0
      ? `${minutes}m ${remainingSeconds}s`
      : `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0
    ? `${hours}h ${remainingMinutes}m`
    : `${hours}h`;
}

/**
 * Formats a number with thousand separators.
 * @param {number} num - Number to format
 * @returns {string} Formatted number (e.g., "1,234")
 */
export function formatNumber(num) {
  if (num === null || num === undefined) return '—';
  return num.toLocaleString('en-US');
}

/**
 * Truncates a string to a maximum length with ellipsis.
 * @param {string} str - String to truncate
 * @param {number} maxLength - Maximum length before truncation
 * @returns {string} Truncated string
 */
export function truncate(str, maxLength = 50) {
  if (!str) return '';
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + '...';
}
