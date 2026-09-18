/**
 * useLocalStorage.js – LocalStorage state hook.
 *
 * Provides React state backed by localStorage so values persist
 * across page refreshes. Useful for language preference, session data, etc.
 *
 * Usage:
 *   const [lang, setLang] = useLocalStorage('selectedLanguage', 'en');
 */

import { useState } from "react";

/**
 * @param {string} key – localStorage key.
 * @param {*} initialValue – Default value if key is not found.
 * @returns {[*, Function]} State value and setter.
 */
function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item !== null ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`useLocalStorage: error reading key "${key}"`, error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.warn(`useLocalStorage: error writing key "${key}"`, error);
    }
  };

  return [storedValue, setValue];
}

export default useLocalStorage;
