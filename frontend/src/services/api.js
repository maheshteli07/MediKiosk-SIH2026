/**
 * api.js – Axios API client.
 *
 * Configures Axios with:
 *   - Base URL from environment variable
 *   - Default headers
 *   - JWT token injection via request interceptor
 *   - Centralized error handling via response interceptor
 *
 * All feature modules should import this instance, NOT create their own.
 */

import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ---- Request Interceptor: Attach JWT token ----
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("medikiosk_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ---- Response Interceptor: Centralized error handling ----
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired – clear storage and redirect to doctor login
      localStorage.removeItem("medikiosk_token");
      window.location.href = "/doctor/login";
    }
    return Promise.reject(error);
  }
);

export default api;
