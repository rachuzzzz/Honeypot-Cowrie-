import { useState, useEffect } from 'react';

/**
 * Custom hook for data fetching with loading and error states.
 *
 * Provides a consistent pattern for handling async data across components.
 * Includes automatic cleanup to prevent state updates on unmounted components.
 *
 * @param {Function} fetchFn - Async function that returns the data
 * @param {Array} deps - Dependency array for re-fetching (default: [])
 * @returns {Object} { data, loading, error, refetch }
 *
 * @example
 * const { data, loading, error } = useFetch(getAttackSummary);
 */
export function useFetch(fetchFn, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Refetch function that can be called manually
  const refetch = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await fetchFn();
      setData(result);
    } catch (err) {
      setError(err.message || 'An error occurred while fetching data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await fetchFn();
        if (isMounted) {
          setData(result);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'An error occurred while fetching data');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    // Cleanup function to prevent state updates on unmounted component
    return () => {
      isMounted = false;
    };
  }, deps);

  return { data, loading, error, refetch };
}

export default useFetch;
