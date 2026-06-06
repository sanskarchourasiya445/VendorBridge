// =============================================================================
// LoadingSpinner — inline or full-screen loading indicator.
// =============================================================================
import clsx from 'clsx';

export default function LoadingSpinner({ fullScreen = false, label, size = 'md' }) {
  const dim = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' }[size] || 'h-8 w-8';

  const spinner = (
    <div className="flex flex-col items-center gap-3">
      <span
        className={clsx(
          'animate-spin rounded-full border-[3px] border-primary-100 border-t-primary-600',
          dim
        )}
        role="status"
        aria-label="Loading"
      />
      {label && <p className="text-sm font-medium text-slate-500">{label}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-slate-50">
        {spinner}
      </div>
    );
  }
  return <div className="flex w-full items-center justify-center py-16">{spinner}</div>;
}
