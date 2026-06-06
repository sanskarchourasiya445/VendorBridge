// =============================================================================
// Reports & Analytics — procurement insights & trends.
//   • Procurement statistics & spending summaries
//   • Monthly procurement trends (spend + order volume)
//   • Spend-by-category breakdown
//   • Vendor performance analytics
//   • Exportable reports (print-to-PDF + CSV)
// Reads from mock data client-side, consistent with the rest of the app.
// =============================================================================
import { useMemo } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  PieChart,
  Pie,
  Legend,
} from "recharts";
import {
  Download,
  FileSpreadsheet,
  TrendingUp,
  Package,
  Building2,
  Wallet,
  Star,
} from "lucide-react";

import PageHeader from "../../components/shared/PageHeader";
import StatCard from "../../components/shared/StatCard";
import DataTable from "../../components/shared/DataTable";
import { usePermissions } from "../../hooks/usePermissions";
import {
  VENDORS,
  RFQS,
  QUOTATIONS,
  PURCHASE_ORDERS,
  INVOICES,
  MONTHLY_SPEND,
  SPEND_BY_CATEGORY,
} from "../../data/mockData";
import { MODULES } from "../../utils/constants";
import {
  formatCompactINR,
  formatCurrency,
  getInitials,
  colorFromString,
} from "../../utils/formatters";
import { downloadCSV, openPrintReport } from "../../utils/reportExport";

const PIE_COLORS = [
  "#1a56db",
  "#057a55",
  "#c27803",
  "#e02424",
  "#7e3af2",
  "#0e9f6e",
];
const REPORT_PERIOD = "Jan – Jun 2026";

export default function Reports() {
  const { canExport } = usePermissions();

  const data = useMemo(() => {
    const totalSpend = MONTHLY_SPEND.reduce((s, m) => s + m.spend, 0);
    const totalOrders = MONTHLY_SPEND.reduce((s, m) => s + m.orders, 0);
    const avgOrder = totalOrders ? Math.round(totalSpend / totalOrders) : 0;

    const categoryTotal = SPEND_BY_CATEGORY.reduce((s, c) => s + c.value, 0);
    const categories = [...SPEND_BY_CATEGORY]
      .sort((a, b) => b.value - a.value)
      .map((c) => ({
        ...c,
        pct: categoryTotal ? (c.value / categoryTotal) * 100 : 0,
      }));

    const vendorSpend = VENDORS.reduce((s, v) => s + v.totalSpend, 0);
    const vendors = [...VENDORS]
      .sort((a, b) => b.totalSpend - a.totalSpend)
      .map((v) => ({
        ...v,
        share: vendorSpend ? (v.totalSpend / vendorSpend) * 100 : 0,
      }));

    const stats = {
      vendors: VENDORS.length,
      activeVendors: VENDORS.filter((v) => v.status === "active").length,
      rfqs: RFQS.length,
      quotations: QUOTATIONS.length,
      purchaseOrders: PURCHASE_ORDERS.length,
      invoices: INVOICES.length,
      conversion: RFQS.length
        ? Math.round((PURCHASE_ORDERS.length / RFQS.length) * 100)
        : 0,
    };

    return { totalSpend, totalOrders, avgOrder, categories, vendors, stats };
  }, []);

  // ── Exports ────────────────────────────────────────────────────────────────
  const exportCSV = () => {
    downloadCSV(
      "vendorbridge-vendor-performance",
      [
        "Vendor",
        "Category",
        "Status",
        "Rating",
        "Orders",
        "Total Spend (INR)",
        "Spend Share %",
      ],
      data.vendors.map((v) => [
        v.name,
        v.category,
        v.status,
        v.rating,
        v.totalOrders,
        v.totalSpend,
        v.share.toFixed(1),
      ]),
    );
  };

  const exportPDF = () => {
    const kpis = `
      <div class="kpis">
        <div class="kpi"><div class="l">Total Spend</div><div class="v">${formatCurrency(data.totalSpend)}</div></div>
        <div class="kpi"><div class="l">Total Orders</div><div class="v">${data.totalOrders}</div></div>
        <div class="kpi"><div class="l">Avg Order Value</div><div class="v">${formatCurrency(data.avgOrder)}</div></div>
        <div class="kpi"><div class="l">Active Vendors</div><div class="v">${data.stats.activeVendors} / ${data.stats.vendors}</div></div>
      </div>`;

    const trend = `
      <h2>Monthly Procurement Trend</h2>
      <table><thead><tr><th>Month</th><th class="r">Spend</th><th class="r">Orders</th></tr></thead><tbody>
      ${MONTHLY_SPEND.map((m) => `<tr><td>${m.month}</td><td class="r">${formatCurrency(m.spend)}</td><td class="r">${m.orders}</td></tr>`).join("")}
      </tbody></table>`;

    const cats = `
      <h2>Spending Summary by Category</h2>
      <table><thead><tr><th>Category</th><th class="r">Spend</th><th class="r">Share</th></tr></thead><tbody>
      ${data.categories.map((c) => `<tr><td>${c.category}</td><td class="r">${formatCurrency(c.value)}</td><td class="r">${c.pct.toFixed(1)}%</td></tr>`).join("")}
      </tbody></table>`;

    const vendors = `
      <h2>Vendor Performance</h2>
      <table><thead><tr><th>Vendor</th><th>Category</th><th class="r">Rating</th><th class="r">Orders</th><th class="r">Total Spend</th><th class="r">Share</th></tr></thead><tbody>
      ${data.vendors.map((v) => `<tr><td>${v.name}</td><td>${v.category}</td><td class="r">${v.rating}</td><td class="r">${v.totalOrders}</td><td class="r">${formatCurrency(v.totalSpend)}</td><td class="r">${v.share.toFixed(1)}%</td></tr>`).join("")}
      </tbody></table>`;

    const body = `
      <div class="brand"><h1>VendorBridge — Procurement Report</h1><p>Period: ${REPORT_PERIOD} · Generated ${new Date().toLocaleString("en-IN")}</p></div>
      ${kpis}${trend}${cats}${vendors}
      <p class="muted">Generated by VendorBridge ERP · Reports & Analytics</p>`;

    openPrintReport("VendorBridge Procurement Report", body);
  };

  const allowExport = canExport(MODULES.REPORTS);

  // ── Table columns ────────────────────────────────────────────────────────────
  const categoryColumns = [
    {
      key: "category",
      header: "Category",
      render: (c) => (
        <span className="font-medium text-slate-800">{c.category}</span>
      ),
    },
    {
      key: "value",
      header: "Spend",
      align: "right",
      render: (c) => (
        <span className="font-semibold text-slate-900">
          {formatCurrency(c.value)}
        </span>
      ),
    },
    {
      key: "pct",
      header: "Share of Spend",
      render: (c) => (
        <div className="flex items-center gap-2">
          <div className="h-2 w-28 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-primary-500"
              style={{ width: `${c.pct}%` }}
            />
          </div>
          <span className="text-xs font-medium text-slate-500">
            {c.pct.toFixed(1)}%
          </span>
        </div>
      ),
    },
  ];

  const vendorColumns = [
    {
      key: "name",
      header: "Vendor",
      render: (v) => (
        <div className="flex items-center gap-3">
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white"
            style={{ backgroundColor: colorFromString(v.name) }}
          >
            {getInitials(v.name)}
          </div>
          <div className="min-w-0">
            <p className="truncate font-medium text-slate-800">{v.name}</p>
            <p className="text-xs text-slate-500">{v.category}</p>
          </div>
        </div>
      ),
    },
    {
      key: "rating",
      header: "Rating",
      align: "center",
      render: (v) => (
        <span className="inline-flex items-center gap-1 font-medium text-slate-700">
          <Star className="h-3.5 w-3.5 fill-warning-400 text-warning-400" />
          {v.rating.toFixed(1)}
        </span>
      ),
    },
    {
      key: "totalOrders",
      header: "Orders",
      align: "center",
      render: (v) => v.totalOrders,
    },
    {
      key: "totalSpend",
      header: "Total Spend",
      align: "right",
      render: (v) => (
        <span className="font-semibold text-slate-900">
          {formatCurrency(v.totalSpend)}
        </span>
      ),
    },
    {
      key: "share",
      header: "Share",
      align: "right",
      render: (v) => (
        <span className="text-slate-500">{v.share.toFixed(1)}%</span>
      ),
    },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Reports & Analytics"
        subtitle={`Procurement insights & trends · ${REPORT_PERIOD}`}
        actions={
          allowExport && (
            <>
              <button
                onClick={exportCSV}
                className="focus-ring inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                <FileSpreadsheet className="h-4 w-4" /> Export CSV
              </button>
              <button
                onClick={exportPDF}
                className="focus-ring inline-flex items-center gap-2 rounded-lg bg-primary-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-primary-700"
              >
                <Download className="h-4 w-4" /> Export PDF
              </button>
            </>
          )
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Wallet}
          tone="primary"
          label="Total Spend"
          value={formatCompactINR(data.totalSpend)}
          sub={REPORT_PERIOD}
        />
        <StatCard
          icon={Package}
          tone="success"
          label="Total Orders"
          value={data.totalOrders}
          sub="Across all categories"
        />
        <StatCard
          icon={TrendingUp}
          tone="warning"
          label="Avg Order Value"
          value={formatCompactINR(data.avgOrder)}
        />
        <StatCard
          icon={Building2}
          tone="neutral"
          label="Active Vendors"
          value={`${data.stats.activeVendors} / ${data.stats.vendors}`}
        />
      </div>

      {/* Trend + category mix */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-card lg:col-span-2">
          <h3 className="mb-4 text-sm font-semibold text-slate-900">
            Monthly Procurement Spend
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={MONTHLY_SPEND}
                margin={{ top: 10, right: 8, left: 8, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="repSpend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1a56db" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#1a56db" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e2e8f0"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                  width={70}
                  tickFormatter={(v) => formatCompactINR(v)}
                />
                <Tooltip
                  formatter={(v) => [formatCurrency(v), "Spend"]}
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid #e2e8f0",
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="spend"
                  stroke="#1a56db"
                  strokeWidth={2.5}
                  fill="url(#repSpend)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-card">
          <h3 className="mb-4 text-sm font-semibold text-slate-900">
            Spend by Category
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.categories}
                  dataKey="value"
                  nameKey="category"
                  cx="50%"
                  cy="45%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={2}
                >
                  {data.categories.map((entry, i) => (
                    <Cell
                      key={entry.category}
                      fill={PIE_COLORS[i % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v) => formatCurrency(v)}
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid #e2e8f0",
                    fontSize: 12,
                  }}
                />
                <Legend
                  iconType="circle"
                  wrapperStyle={{ fontSize: 11 }}
                  formatter={(value) => (
                    <span className="text-slate-600">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Order volume + procurement statistics */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-card lg:col-span-2">
          <h3 className="mb-4 text-sm font-semibold text-slate-900">
            Monthly Order Volume
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={MONTHLY_SPEND}
                margin={{ top: 10, right: 8, left: 8, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e2e8f0"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                  width={32}
                />
                <Tooltip
                  formatter={(v) => [v, "Orders"]}
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid #e2e8f0",
                    fontSize: 12,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="orders"
                  stroke="#057a55"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-card">
          <h3 className="mb-4 text-sm font-semibold text-slate-900">
            Procurement Statistics
          </h3>
          <dl className="space-y-3">
            {[
              ["Registered vendors", data.stats.vendors],
              ["RFQs raised", data.stats.rfqs],
              ["Quotations received", data.stats.quotations],
              ["Purchase orders", data.stats.purchaseOrders],
              ["Invoices", data.stats.invoices],
              ["RFQ → PO conversion", `${data.stats.conversion}%`],
            ].map(([label, value]) => (
              <div
                key={label}
                className="flex items-center justify-between border-b border-slate-100 pb-2 last:border-0 last:pb-0"
              >
                <dt className="text-sm text-slate-500">{label}</dt>
                <dd className="text-sm font-semibold text-slate-900">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* Spending summary */}
      <div className="mt-6">
        <h3 className="mb-3 text-sm font-semibold text-slate-900">
          Spending Summary by Category
        </h3>
        <DataTable
          columns={categoryColumns}
          rows={data.categories}
          keyField="category"
        />
      </div>

      {/* Vendor performance */}
      <div className="mt-6">
        <h3 className="mb-3 text-sm font-semibold text-slate-900">
          Vendor Performance Analytics
        </h3>
        <DataTable columns={vendorColumns} rows={data.vendors} />
      </div>
    </div>
  );
}
