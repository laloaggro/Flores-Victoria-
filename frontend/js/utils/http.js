// Lightweight HTTP client with concurrency limit, timeout, and retry/backoff
// Usage:
// import { createHttpClient } from '/js/utils/http.js';
// const http = createHttpClient({ baseURL: window.API_CONFIG.BASE_URL, maxRequests: 6, timeout: 8000, retries: 2 });
// const data = await http.get('/products');

export function createHttpClient({ baseURL = '', maxRequests = 6, timeout = 8000, retries = 2, backoffBase = 200 }) {
  let active = 0;
  const queue = [];

  const next = () => {
    if (active >= maxRequests) return;
    const item = queue.shift();
    if (!item) return;
    active++;
    item();
  };

  async function withConcurrency(fn) {
    return new Promise((resolve, reject) => {
      const run = async () => {
        try {
          const res = await fn();
          resolve(res);
        } catch (e) {
          reject(e);
        } finally {
          active--;
          next();
        }
      };
      queue.push(run);
      next();
    });
  }

  async function doFetch(url, { method = 'GET', headers = {}, body, signal } = {}) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(new Error('timeout')), timeout);
    const combinedSignal = mergeSignals(signal, controller.signal);

    try {
      const res = await fetch(baseURL ? joinUrl(baseURL, url) : url, {
        method,
        headers: { 'Content-Type': 'application/json', ...headers },
        body: body ? JSON.stringify(body) : undefined,
        signal: combinedSignal,
      });
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        const err = new Error(`HTTP ${res.status}: ${text || res.statusText}`);
        err.status = res.status;
        throw err;
      }
      const contentType = res.headers.get('content-type') || '';
      return contentType.includes('application/json') ? res.json() : res.text();
    } finally {
      clearTimeout(timer);
    }
  }

  async function retrying(fn) {
    let attempt = 0;
    let lastErr;
    while (attempt <= retries) {
      try {
        return await fn();
      } catch (err) {
        lastErr = err;
        // Do not retry on 4xx except 408
        if (err.status && err.status < 500 && err.status !== 408) break;
        if (attempt === retries) break;
        const delay = backoffBase * Math.pow(2, attempt) + Math.random() * 50;
        await sleep(delay);
      }
      attempt++;
    }
    throw lastErr;
  }

  const client = {
    get: (url, opts = {}) => withConcurrency(() => retrying(() => doFetch(url, { ...opts, method: 'GET' }))),
    post: (url, body, opts = {}) => withConcurrency(() => retrying(() => doFetch(url, { ...opts, method: 'POST', body }))),
    put: (url, body, opts = {}) => withConcurrency(() => retrying(() => doFetch(url, { ...opts, method: 'PUT', body }))),
    del: (url, opts = {}) => withConcurrency(() => retrying(() => doFetch(url, { ...opts, method: 'DELETE' }))),
    // simple metrics hooks (optional)
    getQueueLength: () => queue.length,
    getActiveCount: () => active,
    setMaxRequests: (n) => { maxRequests = Math.max(1, Number(n) || 1); },
  };

  return client;
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function joinUrl(base, path) {
  if (!base) return path;
  if (!path) return base;
  if (base.endsWith('/') && path.startsWith('/')) return base + path.substring(1);
  if (!base.endsWith('/') && !path.startsWith('/')) return base + '/' + path;
  return base + path;
}

function mergeSignals(a, b) {
  if (!a) return b;
  if (!b) return a;
  const controller = new AbortController();
  const onAbort = () => controller.abort(new Error('aborted'));
  a.addEventListener('abort', onAbort);
  b.addEventListener('abort', onAbort);
  return controller.signal;
}
