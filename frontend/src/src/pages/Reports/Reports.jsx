// =============================================================================
// Reports — procurement analytics: spend trend, category split, order volume
// and top vendors by spend. Read-only insights from mock data.
// =============================================================================
import { useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { Download, TrendingUp, Building2, Package } from 'lucide-react';

import PageHeader from '../../components/shared/PageHeader';
import StatCard from '../../components/shared/StatCard';
import DataTable from '../../components/shared/DataTable';
import { usePermissions } from '../../hooks/usePermissions';
import { VENDORS, MONTHLY_SPEND, SPEND_BY_CATEGORY } from '../../data/mockData';
import { MODULES } from '../../utils/constants';
import { formatCompactINR, formatCurrency, getInitials, colorFromString } from '../../utils/formatters';

const BAR_COLORS = ['#1a56db', '#057a55', '#c27803', '#e02424', '#7e3af2', '#0e9f6e'];

export default function Reports() {
  const { canExport } = usePermissions();

  const { totalSpend, totalOrders, avgOrder, topVendors } = useMemo(() => {
    const totalSpend = MONTHLY_SPEND.reduce((s, m) => s + m.spend, 0);
    const totalOrders = MONTHLY_SPEND.reduce((s, m) => s + m.orders, 0);
    const avgOrder = totalOrders ? totalSpend / totalOrders : 0;
    const topVendors = [...VENDORS].sort((a, b) => b.totalSpend - a.totalSpend).slice(0, 5);
    return { totalSpend, totalOrders, avgOrder, topVendors };
  }, []);

  const topVendorColumns = [
    {
      key: 'name',
      header: 'Vendor',
      render: (v) => (
        <div className="flex items-center gap-3">
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white"
            style={{ backgroundColor: colorFromString(v.name) }}
          >
            {getInitials(v.name)}
          </div>
          <span className="font-medium text-slate-800">{v.name}</span>
        </div>
      ),
    },
    { key: 'category', header: 'Category', render: (v) => <span className="text-slate-600">{v.category}</span> },
    { key: 'totalOrders', header: 'Orders', align: 'center', render: (v) => v.totalOrders },
    {
      key: 'totalSpend',
      header: 'Total Spend',
      align: 'right',
      render: (v) => <span className="font-semibold text-slate-900">{formatCurrency(v.totalSpend)}</span>,
    },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Reports & Analytics"
        subtitle="Spend, order volume and supplier performance insights"
        actions={
          canExport(MODULES.REPORTS) && (
            <button className="focus-ring inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              <Download className="h-4 w-4" /> Export PDF
            </button>
          )
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard icon={TrendingUp} tone="primary" label="Total Spend (6M)" value={formatCompactINR(totalSpend)} />
        <StatCard icon={Package} tone="success" label="Total Orders" value={totalOrders} />
        <StatCard icon={Building2} tone="warning" label="Avg Order Value" value={formatCompactINR(avgOrder)} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-card">
          <h3 className="mb-4 text-sm font-semibold text-slate-900">Spend by Category</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={SPEND_BY_CATEGORY} layout="vertical" margin={{ left: 20, right: 16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => formatCompactINR(v)}
                />
                <YAxis
                  type="category"
                  dataKey="category"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                  width={110}
                />
                <Tooltip
                  formatter={(v) => [formatCurrency(v), 'Spend']}
                  contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={18}>
                  {SPEND_BY_CATEGORY.map((entry, i) => (
                    <Cell key={entry.category} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-card">
          <h3 className="mb-4 text-sm font-semibold text-slate-900">Monthly Order Volume</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={MONTHLY_SPEND} margin={{ top: 10, right: 8, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} width={32} />
                <Tooltip
                  formatter={(v) => [v, 'Orders']}
                  contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
                />
                <Line type="monotone" dataKey="orders" stroke="#057a55" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="mb-3 text-sm font-semibold text-slate-900">Top Vendors by Spend</h3>
        <DataTable columns={topVendorColumns} rows={topVendors} />
      </div>
    </div>
  );
}
