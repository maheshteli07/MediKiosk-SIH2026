import React, { createContext, useContext, useEffect, useState } from "react";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes.jsx";
import "./index.css";

// ── Theme Context ──────────────────────────────────────────────────────────
export const ThemeContext = createContext({ isDark: false, toggle: () => {} });

export function useTheme() {
  return useContext(ThemeContext);
}

/**
 * App.jsx – Root application component.
 * Wraps the application with BrowserRouter, ThemeProvider, and the route tree.
 * Theme is persisted to localStorage and applied via the `dark` class on <html>.
 */
function App() {
  const [isDark, setIsDark] = useState(() => {
    // On first load: read localStorage; default to light mode
    return localStorage.getItem("medikiosk-theme") === "dark";
  });

  // Apply/remove `dark` class on <html> whenever isDark changes
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("medikiosk-theme", isDark ? "dark" : "light");
  }, [isDark]);

  const toggle = () => setIsDark((prev) => !prev);

  return (
    <ThemeContext.Provider value={{ isDark, toggle }}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </ThemeContext.Provider>
  );
}

export default App;
