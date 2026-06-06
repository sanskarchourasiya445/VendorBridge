// =============================================================================
// utils/asyncHandler.js — wraps async controllers so thrown errors reach
// the central error handler, plus a small typed ApiError helper.
// =============================================================================
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

export class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'ApiError';
  }
}

export default asyncHandler;
