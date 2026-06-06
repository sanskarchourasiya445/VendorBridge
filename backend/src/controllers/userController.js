// =============================================================================
// controllers/userController.js — team directory (passwords never exposed).
// =============================================================================
import { Users } from '../models/index.js';
import { publicUser, publicUsers } from '../views/serializers.js';
import { ok, list as listView, fail } from '../views/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// GET /api/users
export const list = asyncHandler(async (req, res) => {
  const { q } = req.query;
  let rows = Users.all();
  if (q) {
    const needle = String(q).toLowerCase();
    rows = rows.filter(
      (u) =>
        u.name.toLowerCase().includes(needle) ||
        u.email.toLowerCase().includes(needle) ||
        u.department.toLowerCase().includes(needle) ||
        u.role.toLowerCase().includes(needle)
    );
  }
  return listView(res, publicUsers(rows));
});

// GET /api/users/:id
export const getById = asyncHandler(async (req, res) => {
  const user = Users.findById(req.params.id);
  if (!user) return fail(res, 404, `User ${req.params.id} not found.`);
  return ok(res, publicUser(user));
});

export default { list, getById };
