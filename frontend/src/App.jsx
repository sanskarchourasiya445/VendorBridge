// =============================================================================
// VendorBridge — App
// Central router: public auth routes + protected, role-gated application routes.
// =============================================================================
import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';

import { useAuthStore } from './store/authStore';
import { checkPermission, ACTIONS, ROLE_HOME } from './utils/constants';

import Layout from './components/layout/Layout';
import LoadingSpinner from './components/shared/LoadingSpinner';

// ---- Lazy-loaded pages (route-level code splitting) -------------------------
const Login = lazy(() => import('./pages/Auth/Login'));
const Signup = lazy(() => import('./pages/Auth/Signup'));
const ForgotPassword = lazy(() => import('./pages/Auth/ForgotPassword'));

const Dashboard = lazy(() => import('./pages/Dashboard/Dashboard'));
const Vendors = lazy(() => import('./pages/Vendors/Vendors'));
const RFQ = lazy(() => import('./pages/RFQ/RFQ'));
const Quotations = lazy(() => import('./pages/Quotations/Quotations'));
const Approvals = lazy(() => import('./pages/Approvals/Approvals'));
const PurchaseOrders = lazy(() => import('./pages/PurchaseOrders/PurchaseOrders'));
const Invoices = lazy(() => import('./pages/Invoices/Invoices'));
const Reports = lazy(() => import('./pages/Reports/Reports'));
const ActivityLogs = lazy(() => import('./pages/ActivityLogs/ActivityLogs'));
const UserManagement = lazy(() => import('./pages/UserManagement/UserManagement'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Forbidden = lazy(() => import('./pages/Forbidden'));

// ---- Route guards -----------------------------------------------------------

/** Blocks unauthenticated users; remembers where they were headed. */
function ProtectedRoute({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return children;
}

/** Wraps a page in a module-level permission check (403 if not allowed). */
function RequirePermission({ module, action = ACTIONS.VIEW, children }) {
  const role = useAuthStore((s) => s.role);
  if (!checkPermission(role, module, action)) {
    return <Navigate to="/403" replace />;
  }
  return children;
}

/** Public auth pages bounce authenticated users to their role home. */
function PublicOnlyRoute({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const role = useAuthStore((s) => s.role);
  if (isAuthenticated) {
    return <Navigate to={ROLE_HOME[role] || '/dashboard'} replace />;
  }
  return children;
}

// Small helper to keep the protected route list declarative.
import { MODULES } from './utils/constants';

const PROTECTED_ROUTES = [
  { path: '/dashboard', element: Dashboard, module: MODULES.DASHBOARD },
  { path: '/vendors', element: Vendors, module: MODULES.VENDORS },
  { path: '/rfq', element: RFQ, module: MODULES.RFQ },
  { path: '/quotations', element: Quotations, module: MODULES.QUOTATIONS },
  { path: '/approvals', element: Approvals, module: MODULES.APPROVALS },
  { path: '/purchase-orders', element: PurchaseOrders, module: MODULES.PURCHASE_ORDERS },
  { path: '/invoices', element: Invoices, module: MODULES.INVOICES },
  { path: '/reports', element: Reports, module: MODULES.REPORTS },
  { path: '/activity-logs', element: ActivityLogs, module: MODULES.ACTIVITY_LOGS },
  { path: '/users', element: UserManagement, module: MODULES.USER_MANAGEMENT },
];

export default function App() {
  return (
    <Suspense fallback={<LoadingSpinner fullScreen label="Loading VendorBridge…" />}>
      <Routes>
        {/* Public auth routes */}
        <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
        <Route path="/signup" element={<PublicOnlyRoute><Signup /></PublicOnlyRoute>} />
        <Route path="/forgot-password" element={<PublicOnlyRoute><ForgotPassword /></PublicOnlyRoute>} />

        {/* Protected application shell */}
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          {PROTECTED_ROUTES.map(({ path, element: Page, module }) => (
            <Route
              key={path}
              path={path}
              element={
                <RequirePermission module={module}>
                  <Page />
                </RequirePermission>
              }
            />
          ))}
          <Route path="/403" element={<Forbidden />} />
        </Route>

        {/* Index + catch-all */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
