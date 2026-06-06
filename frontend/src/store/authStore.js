// =============================================================================
// VendorBridge — Auth Store (Zustand + persist)
// Handles login/logout, the current session user, role, and signup.
// Authenticates against the demo USERS in mockData (localStorage-only demo).
// =============================================================================
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { USERS } from '../data/mockData';
import { ROLES, ROLE_HOME } from '../utils/constants';

const STORAGE_KEY = 'vendorbridge.auth';

/** Strip the password before putting a user into session state. */
function sanitize(user) {
  if (!user) return null;
  // eslint-disable-next-line no-unused-vars
  const { password, ...safe } = user;
  return safe;
}

export const useAuthStore = create(
  persist(
    (set, get) => ({
      // ----- state -----
      user: null,
      role: null,
      isAuthenticated: false,
      // Seeded registry so newly-signed-up users can log in within the session.
      registry: USERS,
      lastError: null,

      // ----- selectors -----
      getHomeRoute: () => {
        const role = get().role;
        return ROLE_HOME[role] || '/dashboard';
      },

      // ----- actions -----
      login: ({ email, password }) => {
        const normalizedEmail = String(email || '').trim().toLowerCase();
        const match = get().registry.find(
          (u) =>
            u.email.toLowerCase() === normalizedEmail &&
            u.password === password
        );

        if (!match) {
          set({ lastError: 'Invalid email or password.' });
          return { success: false, error: 'Invalid email or password.' };
        }
        if (match.status === 'inactive') {
          set({ lastError: 'This account is inactive. Contact your administrator.' });
          return { success: false, error: 'This account is inactive. Contact your administrator.' };
        }

        const safeUser = sanitize({ ...match, lastLogin: new Date().toISOString() });
        set({
          user: safeUser,
          role: safeUser.role,
          isAuthenticated: true,
          lastError: null,
        });
        return { success: true, user: safeUser, home: ROLE_HOME[safeUser.role] || '/dashboard' };
      },

      signup: ({ name, email, password, role = ROLES.VIEWER, designation = 'Team Member', department = 'General' }) => {
        const normalizedEmail = String(email || '').trim().toLowerCase();
        const exists = get().registry.some(
          (u) => u.email.toLowerCase() === normalizedEmail
        );
        if (exists) {
          set({ lastError: 'An account with this email already exists.' });
          return { success: false, error: 'An account with this email already exists.' };
        }

        const newUser = {
          id: `USR-${String(get().registry.length + 1).padStart(3, '0')}`,
          name: name?.trim() || 'New User',
          email: normalizedEmail,
          password,
          role,
          designation,
          department,
          phone: '',
          avatarColor: 'bg-primary-600',
          status: 'active',
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
        };

        set((state) => ({ registry: [...state.registry, newUser], lastError: null }));

        const safeUser = sanitize(newUser);
        set({ user: safeUser, role: safeUser.role, isAuthenticated: true });
        return { success: true, user: safeUser, home: ROLE_HOME[safeUser.role] || '/dashboard' };
      },

      // Demo helper: one-click sign-in used by the Login screen's role chips.
      loginAsRole: (role) => {
        const demo = get().registry.find((u) => u.role === role && u.status === 'active');
        if (!demo) return { success: false, error: 'No demo account for this role.' };
        return get().login({ email: demo.email, password: demo.password });
      },

      updateProfile: (patch) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...patch } : state.user,
        }));
      },

      // Used during password-reset demo flow (in-memory only).
      resetPassword: ({ email, newPassword }) => {
        const normalizedEmail = String(email || '').trim().toLowerCase();
        const exists = get().registry.some((u) => u.email.toLowerCase() === normalizedEmail);
        if (!exists) {
          return { success: false, error: 'No account found with that email.' };
        }
        set((state) => ({
          registry: state.registry.map((u) =>
            u.email.toLowerCase() === normalizedEmail ? { ...u, password: newPassword } : u
          ),
        }));
        return { success: true };
      },

      clearError: () => set({ lastError: null }),

      logout: () => {
        set({ user: null, role: null, isAuthenticated: false, lastError: null });
      },
    }),
    {
      name: STORAGE_KEY,
      // Persist only the session + registry; not transient errors.
      partialize: (state) => ({
        user: state.user,
        role: state.role,
        isAuthenticated: state.isAuthenticated,
        registry: state.registry,
      }),
    }
  )
);

// Non-hook accessor for use outside React (e.g. utils, route guards).
export const getAuthSnapshot = () => useAuthStore.getState();
