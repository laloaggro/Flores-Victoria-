// Shared HTTP client instance with optional auth header injection
// Imports the lightweight client and configures it with the API base URL
import { API_CONFIG } from '../config/api.js';

import { createHttpClient } from './http.js';

function getToken() {
  try {
    return localStorage.getItem('token') || localStorage.getItem('authToken') || null;
  } catch {
    return null;
  }
}

// Base client with gateway base URL (includes /api)
// Prefer explicit module import (API_CONFIG) to avoid race with window assignment
const baseURL =
  API_CONFIG && API_CONFIG.BASE_URL
    ? API_CONFIG.BASE_URL
    : typeof window !== 'undefined' && window.API_CONFIG && window.API_CONFIG.BASE_URL
      ? window.API_CONFIG.BASE_URL
      : '';

const core = createHttpClient({ baseURL, maxRequests: 6, timeout: 10000, retries: 2 });

// Wrap methods to automatically add Authorization header when a token exists
function withAuthHeaders(opts = {}) {
  const token = getToken();
  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};
  return { ...opts, headers: { ...(opts.headers || {}), ...authHeader } };
}

export const http = {
  get: (url, opts = {}) => core.get(url, withAuthHeaders(opts)),
  post: (url, body, opts = {}) => core.post(url, body, withAuthHeaders(opts)),
  put: (url, body, opts = {}) => core.put(url, body, withAuthHeaders(opts)),
  del: (url, opts = {}) => core.del(url, withAuthHeaders(opts)),
  getQueueLength: core.getQueueLength,
  getActiveCount: core.getActiveCount,
  setMaxRequests: core.setMaxRequests,
};

// Also expose globally for inline scripts that cannot import modules
if (typeof window !== 'undefined') {
  window.http = http;
}

export default http;
