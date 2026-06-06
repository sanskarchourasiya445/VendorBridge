// =============================================================================
// lib/api.js — thin fetch wrapper for the VendorBridge backend.
// Base URL comes from VITE_API_URL (see frontend/.env.example), defaulting to
// the local Express server. A bearer token can be attached if/when the app is
// wired to backend auth; the AI endpoints work without one.
// =============================================================================
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

let authToken = null;
export function setApiToken(token) {
  authToken = token || null;
}

async function request(path, { method = 'GET', body, signal } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (authToken) headers.Authorization = `Bearer ${authToken}`;

  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch {
    throw new Error('Cannot reach the VendorBridge API. Is the backend running on port 4000?');
  }

  const payload = await res.json().catch(() => ({}));
  if (!res.ok || payload.success === false) {
    throw new Error(payload?.error?.message || `Request failed (${res.status}).`);
  }
  return payload.data;
}

// ---- AI endpoints ----------------------------------------------------------
export const aiApi = {
  status: () => request('/ai/status'),
  compareQuotations: (payload) =>
    request('/ai/compare-quotations', { method: 'POST', body: payload }),
  generateRfq: (prompt) =>
    request('/ai/generate-rfq', { method: 'POST', body: { prompt } }),
  insights: (question) =>
    request('/ai/insights', { method: 'POST', body: { question } }),
};

export default { setApiToken, aiApi };
