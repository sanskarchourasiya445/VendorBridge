// =============================================================================
// middlewares/errorHandler.js — 404 + centralised error rendering.
// =============================================================================
import { ApiError } from '../utils/asyncHandler.js';
import { fail } from '../views/response.js';
import { isProd } from '../config/env.js';

export function notFound(req, res) {
  return fail(res, 404, `Route not found: ${req.method} ${req.originalUrl}`);
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  const status = err instanceof ApiError ? err.statusCode : err.statusCode || 500;
  const message = status === 500 && isProd ? 'Internal server error' : err.message;

  if (status === 500) {
    // eslint-disable-next-line no-console
    console.error('[error]', err);
  }

  return fail(res, status, message, isProd ? undefined : err.stack?.split('\n').slice(0, 3));
}

export default { notFound, errorHandler };
