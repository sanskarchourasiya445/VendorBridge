// =============================================================================
// services/api.js — tiny fetch wrapper for the VendorBridge backend.
// Normalises the { success, data } / { success, error } envelopes into a
// predictable { ok, status, data, error } result so callers never throw.
// Token is passed in explicitly by callers (e.g. the auth store) to avoid
// a circular dependency with the store.
// =============================================================================
export const API_BASE =
  import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export async function apiRequest(path, { method = "GET", body, token } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    return {
      ok: false,
      status: 0,
      error: "Could not reach the server. Is the API running?",
    };
  }

  let payload = null;
  try {
    payload = await res.json();
  } catch {
    /* response had no JSON body */
  }

  if (!res.ok || (payload && payload.success === false)) {
    const message =
      payload?.error?.message ||
      payload?.message ||
      `Request failed (${res.status})`;
    return { ok: false, status: res.status, error: message };
  }

  // Unwrap our standard envelope when present.
  const data = payload && "data" in payload ? payload.data : payload;
  return { ok: true, status: res.status, data };
}

export const api = {
  get: (path, token) => apiRequest(path, { token }),
  post: (path, body, token) => apiRequest(path, { method: "POST", body, token }),
  patch: (path, body, token) =>
    apiRequest(path, { method: "PATCH", body, token }),
};

export default api;