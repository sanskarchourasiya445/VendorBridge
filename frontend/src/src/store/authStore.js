// =============================================================================
// VendorBridge — Auth Store (Zustand + persist)
// Authenticates against the REAL backend (/api/auth/*). The JWT is persisted
// and re-attached to the API client on reload; the session is re-validated
// via /api/auth/me. New signups are stored in MongoDB by the backend.
// =============================================================================
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi, setApiToken } from '../lib/api';
import { ROLES, ROLE_HOME } from '../utils/constants';

const STORAGE_KEY = 'vendorbridge.auth';

// Demo accounts (match the backend seed) for the one-click role buttons.
const DEMO_CREDENTIALS = {
  [ROLES.ADMIN]: { email: 'admin@vendorbridge.in', password: 'Admin@123' },
  [ROLES.PROCUREMENT_MANAGER]: { email: 'manager@vendorbridge.in', password: 'Manager@123' },
  [ROLES.APPROVER]: { email: 'approver@vendorbridge.in', password: 'Approve@123' },
  [ROLES.VIEWER]: { email: 'viewer@vendorbridge.in', password: 'Viewer@123' },
};

export const useAuthStore = create(
  persist(
    (set, get) => ({
      // ----- state -----
      user: null,
      role: null,
      token: null,
      isAuthenticated: false,
      lastError: null,

      // ----- selectors -----
      getHomeRoute: () => ROLE_HOME[get().role] || '/dashboard',

      // ----- actions -----
      login: async ({ email, password }) => {
        try {
          const data = await authApi.login(String(email).trim(), password);
          setApiToken(data.token);
          set({
            user: data.user,
            role: data.user.role,
            token: data.token,
            isAuthenticated: true,
            lastError: null,
          });
          return { success: true, user: data.user, home: data.home || ROLE_HOME[data.user.role] || '/dashboard' };
        } catch (err) {
          set({ lastError: err.message });
          return { success: false, error: err.message };
        }
      },

      signup: async ({ name, email, password, role = ROLES.VIEWER }) => {
        try {
          const data = await authApi.signup({ name, email: String(email).trim(), password, role });
          setApiToken(data.token);
          set({
            user: data.user,
            role: data.user.role,
            token: data.token,
            isAuthenticated: true,
            lastError: null,
          });
          return { success: true, user: data.user, home: data.home || ROLE_HOME[data.user.role] || '/dashboard' };
        } catch (err) {
          set({ lastError: err.message });
          return { success: false, error: err.message };
        }
      },

      // One-click demo sign-in used by the Login screen's role chips.
      loginAsRole: async (role) => {
        const creds = DEMO_CREDENTIALS[role];
        if (!creds) return { success: false, error: 'No demo account for this role.' };
        return get().login(creds);
      },

      // Re-validate a persisted session on app load (refreshes the user).
      restore: async () => {
        const token = get().token;
        if (!token) return;
        setApiToken(token);
        try {
          const data = await authApi.me();
          set({ user: data.user, role: data.user.role, isAuthenticated: true });
        } catch {
          // Token invalid/expired — clear the session.
          setApiToken(null);
          set({ user: null, role: null, token: null, isAuthenticated: false });
        }
      },

      updateProfile: (patch) =>
        set((state) => ({ user: state.user ? { ...state.user, ...patch } : state.user })),

      // No backend reset endpoint yet — kept synchronous so the Forgot
      // Password page (which calls it without await) keeps working.
      resetPassword: () => ({
        success: true,
        info: 'Password reset is a demo flow. Ask an admin to set a new password.',
      }),

      clearError: () => set({ lastError: null }),

      logout: () => {
        setApiToken(null);
        set({ user: null, role: null, token: null, isAuthenticated: false, lastError: null });
      },
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({
        user: state.user,
        role: state.role,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      // Re-attach the token to the API client as soon as the store rehydrates.
      onRehydrateStorage: () => (restored) => {
        if (restored?.token) setApiToken(restored.token);
      },
    }
  )
);

export const getAuthSnapshot = () => useAuthStore.getState();