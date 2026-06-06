// =============================================================================
// StatusBadge — coloured pill driven by STATUS_META variants.
// =============================================================================
import clsx from 'clsx';
import { getStatusMeta } from '../../utils/constants';

const VARIANTS = {
  success: 'bg-success-100 text-success-700 ring-success-600/20',
  warning: 'bg-warning-100 text-warning-700 ring-warning-600/20',
  danger: 'bg-danger-100 text-danger-700 ring-danger-600/20',
  info: 'bg-primary-100 text-primary-700 ring-primary-600/20',
  primary: 'bg-primary-600 text-white ring-primary-700/30',
  neutral: 'bg-slate-100 text-slate-600 ring-slate-500/20',
};

export default function StatusBadge({ status, label, variant, className }) {
  const meta = getStatusMeta(status);
  const v = variant || meta.variant || 'neutral';
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset',
        VARIANTS[v] || VARIANTS.neutral,
        className
      )}
    >
      <span className={clsx('h-1.5 w-1.5 rounded-full', {
        'bg-success-600': v === 'success',
        'bg-warning-600': v === 'warning',
        'bg-danger-600': v === 'danger',
        'bg-primary-600': v === 'info',
        'bg-white': v === 'primary',
        'bg-slate-400': v === 'neutral',
      })} />
      {label || meta.label}
    </span>
  );
}
