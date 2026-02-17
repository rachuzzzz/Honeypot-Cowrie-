/**
 * API Service Layer
 *
 * Abstracts all data fetching operations. Connects to the FastAPI backend
 * running on localhost:8000.
 *
 * Architecture:
 *   parsed_output/*.json → FastAPI Backend → This Service → React Components
 *
 * Design Decision: Using plain fetch instead of Axios to minimize dependencies.
 * All API calls go through fetchData() for consistent error handling.
 */

// Backend API base URL. Change this when deploying to production.
const API_BASE_URL = 'http://localhost:8000/api';

/**
 * Generic fetch wrapper with error handling.
 * @param {string} endpoint - The API endpoint (without /api prefix)
 * @returns {Promise<any>} Parsed JSON response
 * @throws {Error} If the network request fails or returns non-OK status
 */
async function fetchData(endpoint) {
  const url = `${API_BASE_URL}/${endpoint}`;

  const response = await fetch(url);

  if (!response.ok) {
    // Try to extract error detail from response body
    let errorMessage = `${response.status} ${response.statusText}`;
    try {
      const errorBody = await response.json();
      if (errorBody.detail) {
        errorMessage = errorBody.detail;
      }
    } catch {
      // Response body wasn't JSON, use default message
    }
    throw new Error(`API error: ${errorMessage}`);
  }

  return response.json();
}

/**
 * Fetches computed overview statistics from the backend.
 * Returns pre-calculated metrics: total attacks, unique IPs, etc.
 * @returns {Promise<Object>} Overview statistics object
 */
export async function getOverview() {
  return fetchData('overview');
}

/**
 * Fetches the attack summary data.
 * Contains aggregated attack information per source IP.
 * @returns {Promise<Array>} Array of attack summary objects
 */
export async function getAttackSummary() {
  return fetchData('attacks');
}

/**
 * Fetches command statistics.
 * Contains frequency data for commands executed by attackers.
 * @returns {Promise<Array>} Array of command stat objects
 */
export async function getCommandStats() {
  return fetchData('commands');
}

/**
 * Fetches session data.
 * Contains detailed session information including command sequences.
 * @returns {Promise<Array>} Array of session objects
 */
export async function getSessions() {
  return fetchData('sessions');
}

/**
 * Fetches all dashboard data in parallel.
 * Useful for initial page load to minimize loading states.
 * @returns {Promise<Object>} Object containing all data types
 */
export async function getAllDashboardData() {
  const [attacks, commands, sessions] = await Promise.all([
    getAttackSummary(),
    getCommandStats(),
    getSessions(),
  ]);

  return { attacks, commands, sessions };
}
