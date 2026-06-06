// =============================================================================
// utils/permissions.js — role-based access control matrix (mirrors frontend).
// =============================================================================
export const ROLES = {
  ADMIN: 'admin',
  PROCUREMENT_MANAGER: 'procurement_manager',
  APPROVER: 'approver',
  VIEWER: 'viewer',
};

export const MODULES = {
  DASHBOARD: 'dashboard',
  VENDORS: 'vendors',
  RFQ: 'rfq',
  QUOTATIONS: 'quotations',
  APPROVALS: 'approvals',
  PURCHASE_ORDERS: 'purchaseOrders',
  INVOICES: 'invoices',
  ACTIVITY_LOGS: 'activityLogs',
  REPORTS: 'reports',
  USER_MANAGEMENT: 'userManagement',
};

export const ACTIONS = {
  VIEW: 'view',
  CREATE: 'create',
  EDIT: 'edit',
  DELETE: 'delete',
  APPROVE: 'approve',
  EXPORT: 'export',
};

const ALL = Object.values(ACTIONS);
const READ_ONLY = [ACTIONS.VIEW];
const READ_EXPORT = [ACTIONS.VIEW, ACTIONS.EXPORT];

// role -> module -> [actions]
export const PERMISSIONS = {
  [ROLES.ADMIN]: {
    [MODULES.DASHBOARD]: READ_EXPORT,
    [MODULES.VENDORS]: ALL,
    [MODULES.RFQ]: ALL,
    [MODULES.QUOTATIONS]: ALL,
    [MODULES.APPROVALS]: [ACTIONS.VIEW, ACTIONS.APPROVE],
    [MODULES.PURCHASE_ORDERS]: ALL,
    [MODULES.INVOICES]: ALL,
    [MODULES.ACTIVITY_LOGS]: READ_EXPORT,
    [MODULES.REPORTS]: READ_EXPORT,
    [MODULES.USER_MANAGEMENT]: ALL,
  },
  [ROLES.PROCUREMENT_MANAGER]: {
    [MODULES.DASHBOARD]: READ_EXPORT,
    [MODULES.VENDORS]: [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.EDIT, ACTIONS.EXPORT],
    [MODULES.RFQ]: [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.EDIT, ACTIONS.EXPORT],
    [MODULES.QUOTATIONS]: [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.EDIT, ACTIONS.EXPORT],
    [MODULES.PURCHASE_ORDERS]: [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.EDIT, ACTIONS.EXPORT],
    [MODULES.INVOICES]: [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.EXPORT],
    [MODULES.ACTIVITY_LOGS]: READ_ONLY,
    [MODULES.REPORTS]: READ_EXPORT,
  },
  [ROLES.APPROVER]: {
    [MODULES.DASHBOARD]: READ_ONLY,
    [MODULES.VENDORS]: READ_ONLY,
    [MODULES.RFQ]: READ_ONLY,
    [MODULES.QUOTATIONS]: READ_ONLY,
    [MODULES.APPROVALS]: [ACTIONS.VIEW, ACTIONS.APPROVE],
    [MODULES.PURCHASE_ORDERS]: READ_ONLY,
    [MODULES.INVOICES]: READ_ONLY,
    [MODULES.ACTIVITY_LOGS]: READ_ONLY,
    [MODULES.REPORTS]: READ_EXPORT,
  },
  [ROLES.VIEWER]: {
    [MODULES.DASHBOARD]: READ_ONLY,
    [MODULES.VENDORS]: READ_ONLY,
    [MODULES.RFQ]: READ_ONLY,
    [MODULES.QUOTATIONS]: READ_ONLY,
    [MODULES.PURCHASE_ORDERS]: READ_ONLY,
    [MODULES.INVOICES]: READ_ONLY,
    [MODULES.REPORTS]: READ_ONLY,
  },
};

export function checkPermission(role, module, action = ACTIONS.VIEW) {
  const granted = PERMISSIONS[role]?.[module];
  if (!granted) return false;
  return granted.includes(action);
}

export default { ROLES, MODULES, ACTIONS, PERMISSIONS, checkPermission };
