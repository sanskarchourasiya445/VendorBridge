// =============================================================================
// Dashboard — executive overview: KPIs, spend trend, category mix,
// pending approvals and recent activity. Hydrates from mock data.
// =============================================================================
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  Wallet,
  Building2,
  ClipboardCheck,
  ArrowRight,
  CircleDollarSign,
} from 'lucide-react';

import PageHeader from '../../components/shared/PageHeader';
import StatCard from '../../components/shared/StatCard';
import StatusBadge from '../../components/shared/StatusBadge';
import { useAuth } from '../../hooks/useAuth';
import {
  VENDORS,
  RFQS,
  INVOICES,
  APPROVALS,
  ACTIVITY_LOGS,
  MONTHLY_SPEND,
  SPEND_BY_CATEGORY,
} from '../../data/mockData';
import {
  VENDOR_STATUS,
  RFQ_STATUS,
  APPROVAL_STATUS,
  INVOICE_STATUS,
} from '../../utils/constants';
import { formatCompactINR, formatCurrency, formatRelativeTime } from '../../utils/formatters';

const PIE_COLORS = ['#1a56db', '#057a55', '#c27803', '#e02424', '#7e3af2', '#0e9f6e'];

export default function Dashboard() {
  const { user } = useAuth();

  const stats = useMemo(() => {
    const totalSpend = MONTHLY_SPEND.reduce((sum, m) => sum + m.spend, 0);
    const activeVendors = VENDORS.filter((v) => v.status === VENDOR_STATUS.ACTIVE).length;
    const openRfqs = RFQS.filter(
      (r) => r.status === RFQ_STATUS.PUBLISHED || r.status === RFQ_STATUS.DRAFT
    ).length;
    const pendingApprovals = APPROVALS.filter((a) => a.status === APPROVAL_STATUS.PENDING).length;
    const overdueInvoices = INVOICES.filter((i) => i.status === INVOICE_STATUS.OVERDUE).length;
    const outstanding = INVOICES.filter((i) => i.status !== INVOICE_STATUS.PAID).reduce(
      (sum, i) => sum + (i.grandTotal - (i.amountPaid || 0)),
      0
    );
    return { totalSpend, activeVendors, openRfqs, pendingApprovals, overdueInvoices, outstanding };
  }, []);

  const pendingApprovals = APPROVALS.filter((a) => a.status === APPROVAL_STATUS.PENDING);
  const recentActivity = ACTIVITY_LOGS.slice(0, 6);

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title={`Welcome back, ${user?.name?.split(' ')[0] || 'there'} 👋`}
        subtitle="Here's what's happening across your procurement pipeline today."
      />

      {/* KPI row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Wallet}
          tone="primary"
          label="Total Spend (YTD)"
          value={formatCompactINR(stats.totalSpend)}
          trend={12}
        />
        <StatCard
          icon={Building2}
          tone="success"
          label="Active Vendors"
          value={stats.activeVendors}
          sub={`${VENDORS.length} total registered`}
        />
        <StatCard
          icon={ClipboardCheck}
          tone="warning"
          label="Pending Approvals"
          value={stats.pendingApprovals}
          sub="Awaiting decision"
        />
        <StatCard
          icon={CircleDollarSign}
          tone="danger"
          label="Outstanding Payables"
          value={formatCompactINR(stats.outstanding)}
          sub={`${stats.overdueInvoices} overdue invoice(s)`}
        />
      </div>

      {/* Charts */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-card lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Monthly Procurement Spend</h3>
              <p className="text-xs text-slate-500">Last 6 months · INR</p>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MONTHLY_SPEND} margin={{ top: 10, right: 8, left: 8, bottom: 0 }}>
                <defs>
                  <linearGradient id="spendFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1a56db" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#1a56db" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => formatCompactINR(v)}
                  width={70}
                />
                <Tooltip
                  formatter={(v) => [formatCurrency(v), 'Spend']}
                  contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
                />
                <Area
                  type="monotone"
                  dataKey="spend"
                  stroke="#1a56db"
                  strokeWidth={2.5}
                  fill="url(#spendFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-card">
          <h3 className="mb-4 text-sm font-semibold text-slate-900">Spend by Category</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={SPEND_BY_CATEGORY}
                  dataKey="value"
                  nameKey="category"
                  cx="50%"
                  cy="45%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={2}
                >
                  {SPEND_BY_CATEGORY.map((entry, i) => (
                    <Cell key={entry.category} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v) => formatCurrency(v)}
                  contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
                />
                <Legend
                  iconType="circle"
                  wrapperStyle={{ fontSize: 11 }}
                  formatter={(value) => <span className="text-slate-600">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Pending approvals + activity */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">Pending Approvals</h3>
            <Link to="/approvals" className="inline-flex items-center gap-1 text-xs font-semibold text-primary-600 hover:text-primary-700">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {pendingApprovals.length === 0 && (
              <p className="py-6 text-center text-sm text-slate-400">No pending approvals 🎉</p>
            )}
            {pendingApprovals.map((a) => (
              <div key={a.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-800">{a.title}</p>
                  <p className="text-xs text-slate-500">
                    {a.refNumber} · Requested by {a.requestedBy}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span className="text-sm font-semibold text-slate-900">{formatCompactINR(a.amount)}</span>
                  <StatusBadge status={a.priority} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">Recent Activity</h3>
            <Link to="/activity-logs" className="inline-flex items-center gap-1 text-xs font-semibold text-primary-600 hover:text-primary-700">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <ol className="relative space-y-4 border-l border-slate-200 pl-4">
            {recentActivity.map((log) => (
              <li key={log.id} className="relative">
                <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-primary-500" />
                <p className="text-sm text-slate-700">{log.description}</p>
                <p className="mt-0.5 text-xs text-slate-400">
                  {log.actor} · {formatRelativeTime(log.timestamp)} · {log.module}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
