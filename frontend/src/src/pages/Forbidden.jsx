// =============================================================================
// Forbidden — 403 page shown when a role lacks permission for a route.
// =============================================================================
import { Link } from 'react-router-dom';
import { ShieldOff, ArrowLeft } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { ROLE_LABELS } from '../utils/constants';

export default function Forbidden() {
  const { role } = useAuth();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-danger-50">
        <ShieldOff className="h-8 w-8 text-danger-600" />
      </div>
      <p className="text-6xl font-bold tracking-tight text-slate-900">403</p>
      <h1 className="mt-2 text-lg font-semibold text-slate-800">Access denied</h1>
      <p className="mt-2 max-w-sm text-sm text-slate-500">
        Your current role{role ? ` (${ROLE_LABELS[role] || role})` : ''} doesn&apos;t have permission to
        view this page. Contact an administrator if you believe this is a mistake.
      </p>
      <Link
        to="/dashboard"
        className="focus-ring mt-6 inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </Link>
    </div>
  );
}
