// =============================================================================
// ForgotPassword — branded reset flow backed by authStore.resetPassword.
// =============================================================================
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Boxes, Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, ShieldCheck } from 'lucide-react';

import { useAuth } from '../../hooks/useAuth';
import { APP_NAME, APP_TAGLINE } from '../../utils/constants';

const schema = z
  .object({
    email: z.string().min(1, 'Email is required').email('Enter a valid email'),
    newPassword: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export default function ForgotPassword() {
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema), defaultValues: { email: '', newPassword: '', confirmPassword: '' } });

  const onSubmit = (values) => {
    const res = resetPassword({ email: values.email, newPassword: values.newPassword });
    if (res.success) {
      toast.success('Password reset successfully. Please sign in.');
      navigate('/login', { replace: true });
    } else {
      toast.error(res.error || 'Unable to reset password.');
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Brand panel */}
      <div className="relative hidden w-1/2 flex-col justify-between bg-sidebar p-12 lg:flex">
        <div className="flex items-center gap-3 text-white">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-600">
            <Boxes className="h-6 w-6" />
          </div>
          <div>
            <p className="text-lg font-bold">{APP_NAME}</p>
            <p className="text-xs text-slate-400">{APP_TAGLINE}</p>
          </div>
        </div>
        <div className="max-w-md">
          <h2 className="text-3xl font-bold leading-tight text-white">
            Reset your access in seconds.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-slate-400">
            Securely recover your VendorBridge account and get back to managing vendors,
            RFQs and purchase orders without missing a beat.
          </p>
          <div className="mt-8 flex items-center gap-2 text-sm text-slate-300">
            <ShieldCheck className="h-5 w-5 text-success-500" />
            Bank-grade security on every transaction
          </div>
        </div>
        <p className="text-xs text-slate-500">© 2026 {APP_NAME}. All rights reserved.</p>
      </div>

      {/* Form panel */}
      <div className="flex w-full items-center justify-center px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-600 text-white">
              <Boxes className="h-6 w-6" />
            </div>
            <p className="text-lg font-bold text-slate-900">{APP_NAME}</p>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Forgot password?</h1>
          <p className="mt-2 text-sm text-slate-500">
            Enter your email and choose a new password to regain access.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
            <Field label="Email address" error={errors.email?.message}>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="you@company.in"
                  className="focus-ring w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400"
                  {...register('email')}
                />
              </div>
            </Field>

            <Field label="New password" error={errors.newPassword?.message}>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  className="focus-ring w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-10 text-sm text-slate-900 placeholder:text-slate-400"
                  {...register('newPassword')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </Field>

            <Field label="Confirm new password" error={errors.confirmPassword?.message}>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  className="focus-ring w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400"
                  {...register('confirmPassword')}
                />
              </div>
            </Field>

            <button
              type="submit"
              disabled={isSubmitting}
              className="focus-ring flex w-full items-center justify-center gap-2 rounded-lg bg-primary-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700 disabled:opacity-60"
            >
              Reset password
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <Link
            to="/login"
            className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-primary-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">{label}</label>
      {children}
      {error && <p className="mt-1.5 text-xs font-medium text-danger-600">{error}</p>}
    </div>
  );
}
