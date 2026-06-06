// =============================================================================
// controllers/activityLogController.js — audit trail (read-only).
// =============================================================================
import { ActivityLogs } from '../models/index.js';
import { list as listView } from '../views/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const byNewest = (a, b) => new Date(b.timestamp) - new Date(a.timestamp);

// GET /api/activity-logs?q=&module=&limit=
export const list = asyncHandler(async (req, res) => {
  const { q, module, limit } = req.query;
  let rows = ActivityLogs.all();

  if (module) rows = rows.filter((l) => l.module.toLowerCase() === String(module).toLowerCase());
  if (q) {
    const needle = String(q).toLowerCase();
    rows = rows.filter(
      (l) =>
        l.description.toLowerCase().includes(needle) ||
        l.actor.toLowerCase().includes(needle) ||
        l.module.toLowerCase().includes(needle)
    );
  }

  rows.sort(byNewest);
  if (limit) rows = rows.slice(0, Number(limit));

  return listView(res, rows);
});

export default { list };
