import React from "react";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes.jsx";
import "./index.css";

/**
 * App.jsx – Root application component.
 * Wraps the application with BrowserRouter and renders the route tree.
 * Do NOT add feature-specific logic here. Keep this file minimal.
 */
function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
