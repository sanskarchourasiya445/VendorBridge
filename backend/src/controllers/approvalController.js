// =============================================================================
// controllers/approvalController.js — approval queue + decision workflow.
// =============================================================================
import { Approvals, ActivityLogs } from '../models/index.js';
import { ok, list as listView, fail } from '../views/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// GET /api/approvals?status=
export const list = asyncHandler(async (req, res) => {
  const { status } = req.query;
  let rows = Approvals.all();
  if (status) rows = rows.filter((a) => a.status === status);
  return listView(res, rows);
});

// GET /api/approvals/:id
export const getById = asyncHandler(async (req, res) => {
  const record = Approvals.findById(req.params.id);
  if (!record) return fail(res, 404, `Approval ${req.params.id} not found.`);
  return ok(res, record);
});

// PATCH /api/approvals/:id/decision  body: { decision: 'approved' | 'rejected', note? }
export const decide = asyncHandler(async (req, res) => {
  const { decision, note } = req.body || {};
  if (!['approved', 'rejected'].includes(decision)) {
    return fail(res, 400, "decision must be 'approved' or 'rejected'.");
  }

  const record = Approvals.findById(req.params.id);
  if (!record) return fail(res, 404, `Approval ${req.params.id} not found.`);
  if (record.status !== 'pending') {
    return fail(res, 409, `This request was already ${record.status}.`);
  }

  const updated = Approvals.update(record.id, {
    status: decision,
    decidedBy: req.user?.name,
    decidedDate: new Date().toISOString().slice(0, 10),
    note: note || record.note,
  });

  ActivityLogs.create({
    type: decision === 'approved' ? 'approve' : 'reject',
    module: 'Approvals',
    actor: req.user?.name || 'System',
    description: `${decision === 'approved' ? 'Approved' : 'Rejected'} ${record.refNumber} — ${record.title}`,
    entityId: record.id,
    timestamp: new Date().toISOString(),
  });

  return ok(res, updated);
});

export default { list, getById, decide };
