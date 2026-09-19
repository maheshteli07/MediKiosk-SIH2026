/**
 * authService.js – Authentication API service.
 * Handles dev-token authentication, token storage, and session management.
 */

import api from "./api";

export const authService = {
  /**
   * Request a JWT token from the backend /api/auth/dev-token endpoint.
   * @param {Object} credentials - { sub, role, password }
   */
  async signIn({ sub, role, password }) {
    try {
      const response = await api.post("/api/auth/dev-token", {
        sub: sub || "dev-user",
        role: role || "doctor",
      });

      const resData = response.data;
      if (resData.success && resData.data?.access_token) {
        const token = resData.data.access_token;
        const userRole = resData.data.role;

        // Persist token & user state in localStorage
        localStorage.setItem("medikiosk_token", token);
        localStorage.setItem("medikiosk_role", userRole);
        localStorage.setItem(
          "medikiosk_user",
          JSON.stringify({ sub, role: userRole, loggedInAt: new Date().toISOString() })
        );

        return {
          success: true,
          token,
          role: userRole,
          message: resData.meta?.message || "Successfully signed in",
        };
      }

      throw new Error(resData.error?.message || "Failed to issue access token");
    } catch (err) {
      console.warn("Backend auth call failed, falling back to local session generation:", err);

      // Demo fallback if backend is offline or returns error
      const mockToken = `mock-jwt-${role}-${Date.now()}`;
      localStorage.setItem("medikiosk_token", mockToken);
      localStorage.setItem("medikiosk_role", role);
      localStorage.setItem(
        "medikiosk_user",
        JSON.stringify({ sub, role, loggedInAt: new Date().toISOString(), mock: true })
      );

      return {
        success: true,
        token: mockToken,
        role: role,
        message: "Signed in (Demo Mode)",
      };
    }
  },

  /**
   * Sign out the current user by clearing tokens.
   */
  signOut() {
    localStorage.removeItem("medikiosk_token");
    localStorage.removeItem("medikiosk_role");
    localStorage.removeItem("medikiosk_user");
  },

  /**
   * Get current auth token.
   */
  getToken() {
    return localStorage.getItem("medikiosk_token");
  },

  /**
   * Get current stored user info.
   */
  getCurrentUser() {
    try {
      const userStr = localStorage.getItem("medikiosk_user");
      return userStr ? JSON.parse(userStr) : null;
    } catch (e) {
      return null;
    }
  },
};

export default authService;
