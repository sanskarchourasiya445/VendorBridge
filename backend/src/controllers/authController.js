// =============================================================================
// controllers/authController.js — authentication endpoints.
// =============================================================================
import { Users, ActivityLogs } from '../models/index.js';
import { signToken } from '../utils/jwt.js';
import { comparePassword, hashPassword } from '../utils/security.js';
import { ROLES } from '../utils/permissions.js';
import { publicUser } from '../views/serializers.js';
import { ok, created, fail } from '../views/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const HOME_BY_ROLE = {
  [ROLES.APPROVER]: '/approvals',
};
const homeFor = (role) => HOME_BY_ROLE[role] || '/dashboard';

// POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return fail(res, 400, 'Email and password are required.');
  }

  const user = Users.findOne((u) => u.email.toLowerCase() === String(email).toLowerCase());
  if (!user || !comparePassword(password, user.password)) {
    return fail(res, 401, 'Invalid email or password.');
  }
  if (user.status && user.status !== 'active') {
    return fail(res, 403, 'This account is inactive. Contact an administrator.');
  }

  Users.update(user.id, { lastLogin: new Date().toISOString() });
  ActivityLogs.create({
    type: 'login',
    module: 'Auth',
    actor: user.name,
    description: `Signed in to VendorBridge`,
    entityId: user.id,
    timestamp: new Date().toISOString(),
  });

  const token = signToken({ sub: user.id, role: user.role });
  return ok(res, { token, user: publicUser(Users.findById(user.id)), home: homeFor(user.role) });
});

// POST /api/auth/signup
export const signup = asyncHandler(async (req, res) => {
  const { name, email, password, role = ROLES.VIEWER } = req.body || {};
  if (!name || !email || !password) {
    return fail(res, 400, 'Name, email and password are required.');
  }
  if (!Object.values(ROLES).includes(role)) {
    return fail(res, 400, 'Invalid role.');
  }
  const exists = Users.findOne((u) => u.email.toLowerCase() === String(email).toLowerCase());
  if (exists) {
    return fail(res, 409, 'An account with that email already exists.');
  }

  const record = Users.create({
    name,
    email,
    password: hashPassword(password),
    role,
    designation: 'Team Member',
    department: 'General',
    avatarColor: 'bg-slate-500',
    status: 'active',
    createdAt: new Date().toISOString(),
    lastLogin: null,
  });

  const token = signToken({ sub: record.id, role: record.role });
  return created(res, { token, user: publicUser(record), home: homeFor(record.role) });
});

// GET /api/auth/me
export const me = asyncHandler(async (req, res) => {
  return ok(res, { user: req.user, home: homeFor(req.user.role) });
});

export default { login, signup, me };
