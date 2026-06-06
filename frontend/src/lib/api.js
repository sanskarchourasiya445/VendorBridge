// =============================================================================
// lib/api.js — fetch wrapper for the VendorBridge backend.
// Base URL comes from VITE_API_URL (see frontend/.env.example), defaulting to
// the local Express server. The bearer token is set after login via
// setApiToken() and attached to every request.
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
    throw new Error('Cannot reach the VendorBridge API. Is the backend running?');
  }

  const payload = await res.json().catch(() => ({}));
  if (!res.ok || payload.success === false) {
    throw new Error(payload?.error?.message || `Request failed (${res.status}).`);
  }
  return payload.data;
}

// ---- Auth endpoints --------------------------------------------------------
export const authApi = {
  login: (email, password) =>
    request('/auth/login', { method: 'POST', body: { email, password } }),
  signup: (payload) => request('/auth/signup', { method: 'POST', body: payload }),
  me: () => request('/auth/me'),
};

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

export default { setApiToken, authApi, aiApi };