// =============================================================================
// middlewares/auth.js — authentication (JWT) + authorization (RBAC matrix).
// =============================================================================
import { verifyToken } from '../utils/jwt.js';
import { checkPermission } from '../utils/permissions.js';
import { Users } from '../models/index.js';
import { publicUser } from '../views/serializers.js';
import { fail } from '../views/response.js';

/** Require a valid Bearer token; attaches req.user (password-stripped). */
export function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return fail(res, 401, 'Authentication required. Provide a Bearer token.');
  }

  try {
    const payload = verifyToken(token);
    const user = Users.findById(payload.sub);
    if (!user) return fail(res, 401, 'Account no longer exists.');
    req.user = publicUser(user);
    return next();
  } catch {
    return fail(res, 401, 'Invalid or expired token.');
  }
}

/** Guard a route by the permission matrix: requirePermission(module, action). */
export function requirePermission(module, action = 'view') {
  return (req, res, next) => {
    if (!req.user) return fail(res, 401, 'Authentication required.');
    if (!checkPermission(req.user.role, module, action)) {
      return fail(res, 403, `Your role (${req.user.role}) cannot ${action} ${module}.`);
    }
    return next();
  };
}

export default { authenticate, requirePermission };
