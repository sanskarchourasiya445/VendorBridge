// =============================================================================
// views/response.js — the View layer. Every controller renders its output
// through these helpers so the API speaks one consistent JSON envelope.
// =============================================================================
export function ok(res, data, meta) {
  return res.status(200).json({ success: true, data, ...(meta ? { meta } : {}) });
}

export function created(res, data) {
  return res.status(201).json({ success: true, data });
}

export function noContent(res) {
  return res.status(204).send();
}

export function list(res, items, extraMeta = {}) {
  return res.status(200).json({
    success: true,
    data: items,
    meta: { count: items.length, ...extraMeta },
  });
}

export function fail(res, statusCode, message, details) {
  return res.status(statusCode).json({
    success: false,
    error: { message, ...(details ? { details } : {}) },
  });
}

export default { ok, created, noContent, list, fail };
