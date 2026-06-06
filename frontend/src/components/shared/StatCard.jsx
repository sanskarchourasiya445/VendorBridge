// =============================================================================
// StatCard — KPI tile with icon, value, label and optional trend.
// =============================================================================
import clsx from 'clsx';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const TONES = {
  primary: 'bg-primary-50 text-primary-600',
  success: 'bg-success-50 text-success-600',
  warning: 'bg-warning-50 text-warning-600',
  danger: 'bg-danger-50 text-danger-600',
  neutral: 'bg-slate-100 text-slate-600',
};

export default function StatCard({ icon: Icon, label, value, sub, trend, tone = 'primary' }) {
  const up = typeof trend === 'number' && trend >= 0;
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-card transition-shadow hover:shadow-card-hover">
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{value}</p>
          {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
        </div>
        {Icon && (
          <div className={clsx('flex h-11 w-11 shrink-0 items-center justify-center rounded-lg', TONES[tone])}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
      {typeof trend === 'number' && (
        <div className="mt-3 flex items-center gap-1 text-xs font-semibold">
          <span className={clsx('inline-flex items-center gap-0.5', up ? 'text-success-600' : 'text-danger-600')}>
            {up ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
            {Math.abs(trend)}%
          </span>
          <span className="text-slate-400">vs last month</span>
        </div>
      )}
    </div>
  );
}
