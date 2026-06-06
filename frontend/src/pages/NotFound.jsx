// =============================================================================
// NotFound — 404 fallback route.
// =============================================================================
import { Link } from 'react-router-dom';
import { Compass, ArrowLeft } from 'lucide-react';
import { APP_NAME } from '../utils/constants';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50">
        <Compass className="h-8 w-8 text-primary-600" />
      </div>
      <p className="text-6xl font-bold tracking-tight text-slate-900">404</p>
      <h1 className="mt-2 text-lg font-semibold text-slate-800">Page not found</h1>
      <p className="mt-2 max-w-sm text-sm text-slate-500">
        The page you&apos;re looking for doesn&apos;t exist or may have been moved within {APP_NAME}.
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
