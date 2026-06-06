// =============================================================================
// usePermissions — role-aware permission checks backed by the PERMISSIONS matrix.
// =============================================================================
import { useMemo } from 'react';
import { useAuthStore } from '../store/authStore';
import { checkPermission, ACTIONS, NAV_ITEMS } from '../utils/constants';

export function usePermissions() {
  const role = useAuthStore((s) => s.role);

  return useMemo(() => {
    const can = (module, action = ACTIONS.VIEW) => checkPermission(role, module, action);

    return {
      role,
      can,
      canView: (module) => can(module, ACTIONS.VIEW),
      canCreate: (module) => can(module, ACTIONS.CREATE),
      canEdit: (module) => can(module, ACTIONS.EDIT),
      canDelete: (module) => can(module, ACTIONS.DELETE),
      canApprove: (module) => can(module, ACTIONS.APPROVE),
      canExport: (module) => can(module, ACTIONS.EXPORT),
      // Sidebar consumes this: only items the role can view.
      allowedNavItems: NAV_ITEMS.filter((item) => can(item.module, ACTIONS.VIEW)),
    };
  }, [role]);
}

export default usePermissions;
