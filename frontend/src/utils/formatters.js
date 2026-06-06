// =============================================================================
// VendorBridge — Formatting utilities
// =============================================================================
import { format, formatDistanceToNow, isValid, parseISO, differenceInDays } from 'date-fns';
import { LOCALE, CURRENCY } from './constants';

/** Normalise a date input (Date | ISO string | timestamp) into a Date. */
function toDate(value) {
  if (value instanceof Date) return value;
  if (typeof value === 'number') return new Date(value);
  if (typeof value === 'string') {
    const parsed = parseISO(value);
    return isValid(parsed) ? parsed : new Date(value);
  }
  return null;
}

/**
 * Format a number as Indian Rupees.
 * @param {number} amount
 * @param {{ compact?: boolean, decimals?: number }} [opts]
 */
export function formatCurrency(amount, opts = {}) {
  const { compact = false, decimals = 0 } = opts;
  const value = Number(amount) || 0;

  if (compact) {
    return new Intl.NumberFormat(LOCALE, {
      style: 'currency',
      currency: CURRENCY,
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value);
  }

  return new Intl.NumberFormat(LOCALE, {
    style: 'currency',
    currency: CURRENCY,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/** Indian-grouped number (1,00,000) without currency symbol. */
export function formatNumber(value, decimals = 0) {
  return new Intl.NumberFormat(LOCALE, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(Number(value) || 0);
}

/** Compact Indian currency like ₹12.5L / ₹3.2Cr — handy for KPI cards. */
export function formatCompactINR(amount) {
  const value = Number(amount) || 0;
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  if (abs >= 1e7) return `${sign}₹${(abs / 1e7).toFixed(2)} Cr`;
  if (abs >= 1e5) return `${sign}₹${(abs / 1e5).toFixed(2)} L`;
  if (abs >= 1e3) return `${sign}₹${(abs / 1e3).toFixed(1)} K`;
  return `${sign}₹${abs}`;
}

export function formatPercent(value, decimals = 1) {
  return `${(Number(value) || 0).toFixed(decimals)}%`;
}

/** e.g. 06 Jun 2026 */
export function formatDate(value, pattern = 'dd MMM yyyy') {
  const date = toDate(value);
  if (!date || !isValid(date)) return '—';
  return format(date, pattern);
}

/** e.g. 06 Jun 2026, 4:30 PM */
export function formatDateTime(value) {
  const date = toDate(value);
  if (!date || !isValid(date)) return '—';
  return format(date, "dd MMM yyyy, h:mm a");
}

/** e.g. "3 days ago" */
export function formatRelativeTime(value) {
  const date = toDate(value);
  if (!date || !isValid(date)) return '—';
  return formatDistanceToNow(date, { addSuffix: true });
}

/** Days remaining until a due date (negative = overdue). */
export function daysUntil(value) {
  const date = toDate(value);
  if (!date || !isValid(date)) return null;
  return differenceInDays(date, new Date());
}

/** Initials for avatars, e.g. "Ravi Mehta" -> "RM". */
export function getInitials(name = '') {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || '')
    .join('');
}

/** Title-cases a snake_case / kebab-case token. */
export function humanize(token = '') {
  return String(token)
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Deterministic colour class from a string (for avatars / category chips). */
export function colorFromString(str = '') {
  const palette = [
    'bg-primary-100 text-primary-700',
    'bg-success-100 text-success-700',
    'bg-warning-100 text-warning-700',
    'bg-danger-100 text-danger-700',
    'bg-slate-200 text-slate-700',
    'bg-indigo-100 text-indigo-700',
    'bg-teal-100 text-teal-700',
    'bg-rose-100 text-rose-700',
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i += 1) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return palette[Math.abs(hash) % palette.length];
}

/** Truncate with ellipsis. */
export function truncate(str = '', max = 40) {
  return str.length > max ? `${str.slice(0, max - 1)}…` : str;
}

/**
 * Generate a sequential document id, e.g. nextDocId('PO', 4) -> 'PO-2026-0005'.
 */
export function nextDocId(prefix, lastSequence = 0, year = new Date().getFullYear()) {
  const seq = String(lastSequence + 1).padStart(4, '0');
  return `${prefix}-${year}-${seq}`;
}

/** Validate an Indian GSTIN (15 chars). Returns boolean. */
export function isValidGSTIN(gstin = '') {
  return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(
    gstin.toUpperCase()
  );
}

/** Validate an Indian PAN (10 chars). */
export function isValidPAN(pan = '') {
  return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan.toUpperCase());
}
