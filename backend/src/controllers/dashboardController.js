// =============================================================================
// controllers/dashboardController.js — aggregated KPIs & analytics.
// =============================================================================
import {
  Vendors,
  Rfqs,
  Invoices,
  Approvals,
  ActivityLogs,
  Analytics,
} from '../models/index.js';
import { ok } from '../views/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// GET /api/dashboard/stats
export const stats = asyncHandler(async (req, res) => {
  const monthly = Analytics.monthlySpend();
  const totalSpend = monthly.reduce((s, m) => s + m.spend, 0);
  const totalOrders = monthly.reduce((s, m) => s + m.orders, 0);

  const activeVendors = Vendors.count((v) => v.status === 'active');
  const openRfqs = Rfqs.count((r) => r.status === 'published' || r.status === 'draft');
  const pendingApprovals = Approvals.count((a) => a.status === 'pending');
  const overdueInvoices = Invoices.count((i) => i.status === 'overdue');
  const outstanding = Invoices.all((i) => i.status !== 'paid').reduce(
    (s, i) => s + (i.grandTotal - (i.amountPaid || 0)),
    0
  );

  return ok(res, {
    kpis: {
      totalSpend,
      totalOrders,
      activeVendors,
      totalVendors: Vendors.count(),
      openRfqs,
      pendingApprovals,
      overdueInvoices,
      outstanding,
    },
    monthlySpend: monthly,
    spendByCategory: Analytics.spendByCategory(),
    pendingApprovals: Approvals.all((a) => a.status === 'pending'),
    recentActivity: ActivityLogs.all()
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 6),
  });
});

// GET /api/dashboard/reports
export const reports = asyncHandler(async (req, res) => {
  const monthly = Analytics.monthlySpend();
  const totalSpend = monthly.reduce((s, m) => s + m.spend, 0);
  const totalOrders = monthly.reduce((s, m) => s + m.orders, 0);

  const topVendors = Vendors.all()
    .sort((a, b) => b.totalSpend - a.totalSpend)
    .slice(0, 5)
    .map((v) => ({
      id: v.id,
      name: v.name,
      category: v.category,
      totalOrders: v.totalOrders,
      totalSpend: v.totalSpend,
    }));

  return ok(res, {
    summary: {
      totalSpend,
      totalOrders,
      avgOrderValue: totalOrders ? Math.round(totalSpend / totalOrders) : 0,
    },
    monthlySpend: monthly,
    spendByCategory: Analytics.spendByCategory(),
    topVendors,
  });
});

export default { stats, reports };
