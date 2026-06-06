// =============================================================================
// Login — branded split-screen auth with validated form + demo role sign-in.
// =============================================================================
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Boxes, Mail, Lock, Eye, EyeOff, ShieldCheck, ArrowRight } from 'lucide-react';

import { useAuth } from '../../hooks/useAuth';
import { ROLES, ROLE_LABELS, APP_NAME } from '../../utils/constants';

const schema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

const DEMO_ROLES = [
  { role: ROLES.ADMIN, color: 'bg-primary-600' },
  { role: ROLES.PROCUREMENT_MANAGER, color: 'bg-success-600' },
  { role: ROLES.APPROVER, color: 'bg-warning-600' },
  { role: ROLES.VIEWER, color: 'bg-slate-500' },
];

export default function Login() {
  const { login, loginAsRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema), defaultValues: { email: '', password: '' } });

  const redirectTo = (home) => {
    const from = location.state?.from;
    navigate(from && from !== '/login' ? from : home, { replace: true });
  };

 const onSubmit = async (values) => {
    const res = await login(values);
    if (res.success) {
      toast.success(`Welcome back, ${res.user.name.split(' ')[0]}!`);
      redirectTo(res.home);
    } else {
      toast.error(res.error);
    }
  };

  
  const quickLogin = async (role) => {
    const res = await loginAsRole(role);
    if (res.success) {
      toast.success(`Signed in as ${ROLE_LABELS[role]}`);
      redirectTo(res.home);
    } else {
      toast.error(res.error || 'Demo sign-in unavailable');
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Brand panel */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-sidebar p-12 text-white lg:flex">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 20%, rgba(26,86,219,0.45), transparent 40%), radial-gradient(circle at 80% 70%, rgba(5,122,85,0.25), transparent 45%)',
          }}
        />
        <div className="relative flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-600 shadow-lg">
            <Boxes className="h-6 w-6" strokeWidth={2.2} />
          </div>
          <div>
            <p className="text-lg font-extrabold tracking-tight">{APP_NAME}</p>
            <p className="text-xs text-slate-400">Procurement & Vendor Management</p>
          </div>
        </div>

        <div className="relative max-w-md">
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight">
            Run procurement <span className="text-primary-400">end to end.</span>
          </h1>
          <p className="mt-4 text-slate-300">
            Onboard vendors, float RFQs, compare quotations, route approvals, issue
            purchase orders and track invoices — all in one clean workspace.
          </p>
          <div className="mt-8 flex items-center gap-2 text-sm text-slate-400">
            <ShieldCheck className="h-4 w-4 text-success-500" />
            Role-based access · GST-ready · INR-native
          </div>
        </div>

        <p className="relative text-xs text-slate-500">© 2026 VendorBridge. Demo build.</p>
      </div>

      {/* Form panel */}
      <div className="flex w-full items-center justify-center bg-slate-50 px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 text-white">
                <Boxes className="h-5 w-5" />
              </div>
              <span className="text-lg font-extrabold text-slate-900">{APP_NAME}</span>
            </div>
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Sign in</h2>
          <p className="mt-1 text-sm text-slate-500">Welcome back. Enter your credentials to continue.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4" noValidate>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="you@company.in"
                  {...register('email')}
                  className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                />
              </div>
              {errors.email && <p className="mt-1 text-xs text-danger-600">{errors.email.message}</p>}
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="block text-sm font-medium text-slate-700">Password</label>
                <Link to="/forgot-password" className="text-xs font-medium text-primary-600 hover:text-primary-700">
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  {...register('password')}
                  className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-10 text-sm text-slate-800 placeholder:text-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-danger-600">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-600 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-700 disabled:opacity-60"
            >
              Sign in <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Demo role sign-in */}
          <div className="mt-8">
            <div className="relative mb-4 text-center">
              <span className="relative z-10 bg-slate-50 px-3 text-xs font-medium uppercase tracking-wide text-slate-400">
                Quick demo sign-in
              </span>
              <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-slate-200" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_ROLES.map(({ role, color }) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => quickLogin(role)}
                  className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-xs font-semibold text-slate-700 transition-all hover:border-primary-300 hover:shadow-card-hover"
                >
                  <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
                  {ROLE_LABELS[role]}
                </button>
              ))}
            </div>
            <p className="mt-3 text-center text-xs text-slate-400">
              Or click a role to explore the matching access level.
            </p>
          </div>

          <p className="mt-8 text-center text-sm text-slate-500">
            Don&apos;t have an account?{' '}
            <Link to="/signup" className="font-semibold text-primary-600 hover:text-primary-700">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
