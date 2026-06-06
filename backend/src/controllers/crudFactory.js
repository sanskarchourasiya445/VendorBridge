// =============================================================================
// controllers/crudFactory.js — builds standard REST handlers for a Collection.
// Keeps per-resource controllers thin; each can still add domain actions.
// =============================================================================
import { ok, created, list as listView, fail, noContent } from '../views/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export function crudFactory(collection, { searchFields = [], label = 'Record' } = {}) {
  const list = asyncHandler(async (req, res) => {
    const { q, status } = req.query;
    let rows = collection.all();

    if (status) rows = rows.filter((r) => r.status === status);

    if (q && searchFields.length) {
      const needle = String(q).toLowerCase();
      rows = rows.filter((r) =>
        searchFields.some((f) => String(r[f] ?? '').toLowerCase().includes(needle))
      );
    }

    return listView(res, rows);
  });

  const getById = asyncHandler(async (req, res) => {
    const record = collection.findById(req.params.id);
    if (!record) return fail(res, 404, `${label} ${req.params.id} not found.`);
    return ok(res, record);
  });

  const create = asyncHandler(async (req, res) => {
    const record = collection.create(req.body || {});
    return created(res, record);
  });

  const update = asyncHandler(async (req, res) => {
    const record = collection.update(req.params.id, req.body || {});
    if (!record) return fail(res, 404, `${label} ${req.params.id} not found.`);
    return ok(res, record);
  });

  const remove = asyncHandler(async (req, res) => {
    const okDel = collection.remove(req.params.id);
    if (!okDel) return fail(res, 404, `${label} ${req.params.id} not found.`);
    return noContent(res);
  });

  return { list, getById, create, update, remove };
}

export default crudFactory;
