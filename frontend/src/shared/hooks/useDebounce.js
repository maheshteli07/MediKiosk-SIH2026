/**
 * useDebounce.js – Debounce hook.
 *
 * Returns a debounced version of the given value that only updates
 * after the specified delay has elapsed without further changes.
 *
 * Usage:
 *   const debouncedSearch = useDebounce(searchTerm, 400);
 */

import { useState, useEffect } from "react";

/**
 * @param {*} value – The value to debounce.
 * @param {number} delay – Debounce delay in milliseconds.
 * @returns {*} The debounced value.
 */
function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce;
