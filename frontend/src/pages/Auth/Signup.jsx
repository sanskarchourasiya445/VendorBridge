// =============================================================================
// Signup — create-account form (RHF + Zod), defaults to Viewer role.
// =============================================================================
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Boxes, User, Mail, Lock, ArrowRight } from 'lucide-react';

import { useAuth } from '../../hooks/useAuth';
import { ROLES, ROLE_LABELS, APP_NAME } from '../../utils/constants';

const schema = z
  .object({
    name: z.string().min(2, 'Enter your full name'),
    email: z.string().min(1, 'Email is required').email('Enter a valid email'),
    role: z.string().min(1, 'Select a role'),
    password: z.string().min(6, 'Minimum 6 characters'),
    confirm: z.string().min(1, 'Confirm your password'),
  })
  .refine((d) => d.password === d.confirm, {
    message: 'Passwords do not match',
    path: ['confirm'],
  });

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', role: ROLES.VIEWER, password: '', confirm: '' },
  });

  const onSubmit = async (v) => {
    const res = await signup({ name: v.name, email: v.email, password: v.password, role: v.role });
    if (res.success) {
      toast.success('Account created. Welcome to VendorBridge!');
      navigate(res.home, { replace: true });
    } else {
      toast.error(res.error);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 text-white">
            <Boxes className="h-5 w-5" />
          </div>
          <span className="text-lg font-extrabold text-slate-900">{APP_NAME}</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-card">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Create account</h2>
          <p className="mt-1 text-sm text-slate-500">Set up your workspace access.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
            <Field label="Full name" error={errors.name?.message} icon={User}>
              <input {...register('name')} placeholder="Aarav Sharma" className={inputCls} />
            </Field>
            <Field label="Email" error={errors.email?.message} icon={Mail}>
              <input type="email" {...register('email')} placeholder="you@company.in" className={inputCls} />
            </Field>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Role</label>
              <select {...register('role')} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30">
                {Object.values(ROLES).map((r) => (
                  <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                ))}
              </select>
              {errors.role && <p className="mt-1 text-xs text-danger-600">{errors.role.message}</p>}
            </div>
            <Field label="Password" error={errors.password?.message} icon={Lock}>
              <input type="password" {...register('password')} placeholder="••••••••" className={inputCls} />
            </Field>
            <Field label="Confirm password" error={errors.confirm?.message} icon={Lock}>
              <input type="password" {...register('confirm')} placeholder="••••••••" className={inputCls} />
            </Field>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700 disabled:opacity-60"
            >
              Create account <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const inputCls =
  'w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30';

function Field({ label, error, icon: Icon, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">{label}</label>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        {children}
      </div>
      {error && <p className="mt-1 text-xs text-danger-600">{error}</p>}
    </div>
  );
}
