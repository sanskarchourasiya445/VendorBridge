// =============================================================================
// models/index.js — instantiates one Collection per resource from the seed.
// These singletons are the application's Model layer.
// =============================================================================
import Collection from './Collection.js';
import {
  USERS,
  VENDORS,
  RFQS,
  QUOTATIONS,
  PURCHASE_ORDERS,
  INVOICES,
  APPROVALS,
  ACTIVITY_LOGS,
  MONTHLY_SPEND,
  SPEND_BY_CATEGORY,
} from '../data/seed.js';

export const Users = new Collection('users', USERS, 'USR');
export const Vendors = new Collection('vendors', VENDORS, 'VEN');
export const Rfqs = new Collection('rfqs', RFQS, 'RFQ');
export const Quotations = new Collection('quotations', QUOTATIONS, 'QT');
export const PurchaseOrders = new Collection('purchaseOrders', PURCHASE_ORDERS, 'PO');
export const Invoices = new Collection('invoices', INVOICES, 'INV');
export const Approvals = new Collection('approvals', APPROVALS, 'APR');
export const ActivityLogs = new Collection('activityLogs', ACTIVITY_LOGS, 'LOG');

// Static analytics datasets (read-only).
export const Analytics = {
  monthlySpend: () => MONTHLY_SPEND.map((m) => ({ ...m })),
  spendByCategory: () => SPEND_BY_CATEGORY.map((c) => ({ ...c })),
};

export default {
  Users,
  Vendors,
  Rfqs,
  Quotations,
  PurchaseOrders,
  Invoices,
  Approvals,
  ActivityLogs,
  Analytics,
};
