// =============================================================================
// VendorBridge — Application Constants
// Roles, status enums, status display metadata, and the permission matrix.
// =============================================================================

export const APP_NAME = 'VendorBridge';
export const APP_TAGLINE = 'Procurement & Vendor Management';
export const CURRENCY = 'INR';
export const CURRENCY_SYMBOL = '₹';
export const LOCALE = 'en-IN';

// -----------------------------------------------------------------------------
// Roles
// -----------------------------------------------------------------------------
export const ROLES = {
  ADMIN: 'admin',
  PROCUREMENT_MANAGER: 'procurement_manager',
  APPROVER: 'approver',
  VIEWER: 'viewer',
};

export const ROLE_LABELS = {
  [ROLES.ADMIN]: 'Administrator',
  [ROLES.PROCUREMENT_MANAGER]: 'Procurement Manager',
  [ROLES.APPROVER]: 'Approving Authority',
  [ROLES.VIEWER]: 'Viewer',
};

export const ROLE_DESCRIPTIONS = {
  [ROLES.ADMIN]: 'Full control over the platform including users & settings.',
  [ROLES.PROCUREMENT_MANAGER]: 'Manages vendors, RFQs, quotations and purchase orders.',
  [ROLES.APPROVER]: 'Reviews and approves quotations, POs and invoices.',
  [ROLES.VIEWER]: 'Read-only access to dashboards and reports.',
};

export const ROLE_LIST = Object.values(ROLES);

// -----------------------------------------------------------------------------
// Modules (used by the permission matrix and the sidebar)
// -----------------------------------------------------------------------------
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

// -----------------------------------------------------------------------------
// Actions
// -----------------------------------------------------------------------------
export const ACTIONS = {
  VIEW: 'view',
  CREATE: 'create',
  EDIT: 'edit',
  DELETE: 'delete',
  APPROVE: 'approve',
  EXPORT: 'export',
};

const ALL_ACTIONS = Object.values(ACTIONS);

// -----------------------------------------------------------------------------
// Permission matrix
// role -> module -> array of allowed actions
// Use the usePermissions hook / can() helper rather than reading this directly.
// -----------------------------------------------------------------------------
export const PERMISSIONS = {
  [ROLES.ADMIN]: {
    [MODULES.DASHBOARD]: [ACTIONS.VIEW],
    [MODULES.VENDORS]: ALL_ACTIONS,
    [MODULES.RFQ]: ALL_ACTIONS,
    [MODULES.QUOTATIONS]: ALL_ACTIONS,
    [MODULES.APPROVALS]: [ACTIONS.VIEW, ACTIONS.APPROVE],
    [MODULES.PURCHASE_ORDERS]: ALL_ACTIONS,
    [MODULES.INVOICES]: ALL_ACTIONS,
    [MODULES.ACTIVITY_LOGS]: [ACTIONS.VIEW, ACTIONS.EXPORT],
    [MODULES.REPORTS]: [ACTIONS.VIEW, ACTIONS.EXPORT],
    [MODULES.USER_MANAGEMENT]: ALL_ACTIONS,
  },
  [ROLES.PROCUREMENT_MANAGER]: {
    [MODULES.DASHBOARD]: [ACTIONS.VIEW],
    [MODULES.VENDORS]: [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.EDIT, ACTIONS.EXPORT],
    [MODULES.RFQ]: [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.EDIT, ACTIONS.DELETE, ACTIONS.EXPORT],
    [MODULES.QUOTATIONS]: [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.EDIT, ACTIONS.EXPORT],
    [MODULES.PURCHASE_ORDERS]: [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.EDIT, ACTIONS.EXPORT],
    [MODULES.INVOICES]: [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.EDIT, ACTIONS.EXPORT],
    [MODULES.REPORTS]: [ACTIONS.VIEW, ACTIONS.EXPORT],
    [MODULES.ACTIVITY_LOGS]: [ACTIONS.VIEW],
  },
  [ROLES.APPROVER]: {
    [MODULES.DASHBOARD]: [ACTIONS.VIEW],
    [MODULES.VENDORS]: [ACTIONS.VIEW],
    [MODULES.RFQ]: [ACTIONS.VIEW],
    [MODULES.QUOTATIONS]: [ACTIONS.VIEW],
    [MODULES.APPROVALS]: [ACTIONS.VIEW, ACTIONS.APPROVE],
    [MODULES.PURCHASE_ORDERS]: [ACTIONS.VIEW],
    [MODULES.INVOICES]: [ACTIONS.VIEW, ACTIONS.APPROVE],
    [MODULES.REPORTS]: [ACTIONS.VIEW, ACTIONS.EXPORT],
  },
  [ROLES.VIEWER]: {
    [MODULES.DASHBOARD]: [ACTIONS.VIEW],
    [MODULES.VENDORS]: [ACTIONS.VIEW],
    [MODULES.RFQ]: [ACTIONS.VIEW],
    [MODULES.QUOTATIONS]: [ACTIONS.VIEW],
    [MODULES.PURCHASE_ORDERS]: [ACTIONS.VIEW],
    [MODULES.INVOICES]: [ACTIONS.VIEW],
    [MODULES.REPORTS]: [ACTIONS.VIEW],
  },
};

/**
 * Pure permission check. Prefer the usePermissions() hook inside components.
 * @param {string} role
 * @param {string} module
 * @param {string} action
 * @returns {boolean}
 */
export function checkPermission(role, module, action = ACTIONS.VIEW) {
  const modulePerms = PERMISSIONS?.[role]?.[module];
  if (!modulePerms) return false;
  return modulePerms.includes(action);
}

// -----------------------------------------------------------------------------
// Status enums
// -----------------------------------------------------------------------------
export const VENDOR_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending',
  BLACKLISTED: 'blacklisted',
};

export const RFQ_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  CLOSED: 'closed',
  AWARDED: 'awarded',
  CANCELLED: 'cancelled',
};

export const QUOTATION_STATUS = {
  SUBMITTED: 'submitted',
  UNDER_REVIEW: 'under_review',
  SHORTLISTED: 'shortlisted',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
};

export const APPROVAL_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

export const PO_STATUS = {
  DRAFT: 'draft',
  ISSUED: 'issued',
  ACKNOWLEDGED: 'acknowledged',
  PARTIALLY_RECEIVED: 'partially_received',
  RECEIVED: 'received',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

export const INVOICE_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  PAID: 'paid',
  OVERDUE: 'overdue',
  DISPUTED: 'disputed',
};

export const PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
};

// -----------------------------------------------------------------------------
// Status display metadata — variant maps to the StatusBadge component.
// variant: 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'primary'
// -----------------------------------------------------------------------------
export const STATUS_META = {
  // Vendor
  [VENDOR_STATUS.ACTIVE]: { label: 'Active', variant: 'success' },
  [VENDOR_STATUS.INACTIVE]: { label: 'Inactive', variant: 'neutral' },
  [VENDOR_STATUS.PENDING]: { label: 'Pending Approval', variant: 'warning' },
  [VENDOR_STATUS.BLACKLISTED]: { label: 'Blacklisted', variant: 'danger' },
  // RFQ
  [RFQ_STATUS.DRAFT]: { label: 'Draft', variant: 'neutral' },
  [RFQ_STATUS.PUBLISHED]: { label: 'Published', variant: 'info' },
  [RFQ_STATUS.CLOSED]: { label: 'Closed', variant: 'warning' },
  [RFQ_STATUS.AWARDED]: { label: 'Awarded', variant: 'success' },
  [RFQ_STATUS.CANCELLED]: { label: 'Cancelled', variant: 'danger' },
  // Quotation
  [QUOTATION_STATUS.SUBMITTED]: { label: 'Submitted', variant: 'info' },
  [QUOTATION_STATUS.UNDER_REVIEW]: { label: 'Under Review', variant: 'warning' },
  [QUOTATION_STATUS.SHORTLISTED]: { label: 'Shortlisted', variant: 'primary' },
  [QUOTATION_STATUS.ACCEPTED]: { label: 'Accepted', variant: 'success' },
  [QUOTATION_STATUS.REJECTED]: { label: 'Rejected', variant: 'danger' },
  // Approval
  [APPROVAL_STATUS.PENDING]: { label: 'Pending', variant: 'warning' },
  [APPROVAL_STATUS.APPROVED]: { label: 'Approved', variant: 'success' },
  [APPROVAL_STATUS.REJECTED]: { label: 'Rejected', variant: 'danger' },
  // PO
  [PO_STATUS.ISSUED]: { label: 'Issued', variant: 'info' },
  [PO_STATUS.ACKNOWLEDGED]: { label: 'Acknowledged', variant: 'primary' },
  [PO_STATUS.PARTIALLY_RECEIVED]: { label: 'Partially Received', variant: 'warning' },
  [PO_STATUS.RECEIVED]: { label: 'Received', variant: 'success' },
  [PO_STATUS.COMPLETED]: { label: 'Completed', variant: 'success' },
  // Invoice
  [INVOICE_STATUS.PAID]: { label: 'Paid', variant: 'success' },
  [INVOICE_STATUS.OVERDUE]: { label: 'Overdue', variant: 'danger' },
  [INVOICE_STATUS.DISPUTED]: { label: 'Disputed', variant: 'warning' },
  // Priority
  [PRIORITY.LOW]: { label: 'Low', variant: 'neutral' },
  [PRIORITY.MEDIUM]: { label: 'Medium', variant: 'info' },
  [PRIORITY.HIGH]: { label: 'High', variant: 'warning' },
  [PRIORITY.URGENT]: { label: 'Urgent', variant: 'danger' },
};

/** Safe lookup for status metadata with a sensible neutral fallback. */
export function getStatusMeta(status) {
  return (
    STATUS_META[status] || {
      label: typeof status === 'string'
        ? status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
        : 'Unknown',
      variant: 'neutral',
    }
  );
}

// -----------------------------------------------------------------------------
// Activity log action types
// -----------------------------------------------------------------------------
export const ACTIVITY_TYPES = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  APPROVE: 'approve',
  REJECT: 'reject',
  LOGIN: 'login',
  LOGOUT: 'logout',
  EXPORT: 'export',
  STATUS_CHANGE: 'status_change',
};

// -----------------------------------------------------------------------------
// Navigation configuration — consumed by the Sidebar.
// `icon` holds the lucide-react icon name (resolved in the Sidebar).
// `module` ties the item to the permission matrix.
// -----------------------------------------------------------------------------
export const NAV_ITEMS = [
  { label: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard', module: MODULES.DASHBOARD },
  { label: 'Vendors', path: '/vendors', icon: 'Building2', module: MODULES.VENDORS },
  { label: 'RFQs', path: '/rfq', icon: 'FileSearch', module: MODULES.RFQ },
  { label: 'Quotations', path: '/quotations', icon: 'ReceiptText', module: MODULES.QUOTATIONS },
  { label: 'Approvals', path: '/approvals', icon: 'CheckCircle2', module: MODULES.APPROVALS },
  { label: 'Purchase Orders', path: '/purchase-orders', icon: 'ClipboardList', module: MODULES.PURCHASE_ORDERS },
  { label: 'Invoices', path: '/invoices', icon: 'FileText', module: MODULES.INVOICES },
  { label: 'Reports', path: '/reports', icon: 'BarChart3', module: MODULES.REPORTS },
  { label: 'Activity Logs', path: '/activity-logs', icon: 'History', module: MODULES.ACTIVITY_LOGS },
  { label: 'User Management', path: '/users', icon: 'Users', module: MODULES.USER_MANAGEMENT },
];

// First landing route per role (used for post-login redirect).
export const ROLE_HOME = {
  [ROLES.ADMIN]: '/dashboard',
  [ROLES.PROCUREMENT_MANAGER]: '/dashboard',
  [ROLES.APPROVER]: '/approvals',
  [ROLES.VIEWER]: '/dashboard',
};

// -----------------------------------------------------------------------------
// Misc option lists used by forms / filters
// -----------------------------------------------------------------------------
export const VENDOR_CATEGORIES = [
  'IT Hardware',
  'Office Supplies',
  'Raw Materials',
  'Logistics & Transport',
  'Facility Services',
  'Electrical Equipment',
  'Packaging',
  'Industrial Machinery',
  'Professional Services',
  'Chemicals',
];

export const INDIAN_STATES = [
  'Andhra Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Delhi', 'Goa',
  'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Odisha', 'Punjab',
  'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'Uttarakhand',
  'West Bengal',
];

export const PAGE_SIZE = 10;
