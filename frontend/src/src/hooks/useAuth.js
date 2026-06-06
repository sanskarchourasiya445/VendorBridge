// =============================================================================
// useAuth — convenience selector hook over the Zustand auth store.
// =============================================================================
import { useAuthStore } from '../store/authStore';

export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const role = useAuthStore((s) => s.role);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const lastError = useAuthStore((s) => s.lastError);

  const login = useAuthStore((s) => s.login);
  const signup = useAuthStore((s) => s.signup);
  const logout = useAuthStore((s) => s.logout);
  const loginAsRole = useAuthStore((s) => s.loginAsRole);
  const resetPassword = useAuthStore((s) => s.resetPassword);
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const clearError = useAuthStore((s) => s.clearError);
  const getHomeRoute = useAuthStore((s) => s.getHomeRoute);

  return {
    user,
    role,
    isAuthenticated,
    lastError,
    login,
    signup,
    logout,
    loginAsRole,
    resetPassword,
    updateProfile,
    clearError,
    getHomeRoute,
  };
}

export default useAuth;
