/**
 * Error Monitoring Service
 * Simple error tracking and logging system
 */

class ErrorMonitor {
  constructor() {
    this.errors = [];
    this.maxErrors = 100;
    this.isProduction = import.meta.env.MODE === 'production';
    this.apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    this.overlay = null;
    this.counterBadge = null;
    
    this.init();
  }

  init() {
    // Global error handler
    window.addEventListener('error', (event) => {
      this.captureError({
        type: 'error',
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
        timestamp: new Date().toISOString(),
      });
    });

    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.captureError({
        type: 'unhandledRejection',
        message: event.reason?.message || String(event.reason),
        stack: event.reason?.stack,
        timestamp: new Date().toISOString(),
      });
    });

    // Console error override
    if (this.isProduction) {
      const originalError = console.error;
      console.error = (...args) => {
        this.captureError({
          type: 'consoleError',
          message: args.map((arg) => String(arg)).join(' '),
          timestamp: new Date().toISOString(),
        });
        originalError.apply(console, args);
      };
    }

    // In development, add a small floating indicator UI
    if (!this.isProduction) {
      this.setupDevOverlay();
      // Load stored errors to show counter on refresh
      const stored = this.getStoredErrors();
      if (stored.length) this.updateCounter(stored.length);
    }
  }

  captureError(errorData) {
    // Add to local storage
    this.errors.push(errorData);
    
    // Keep only last maxErrors
    if (this.errors.length > this.maxErrors) {
      this.errors.shift();
    }

    // Store in localStorage for persistence
    try {
      localStorage.setItem('errorLog', JSON.stringify(this.errors.slice(-20)));
    } catch (e) {
      // Quota exceeded, clear old errors
      this.errors = this.errors.slice(-50);
    }

    // Send to backend in production
    if (this.isProduction) {
      this.sendToBackend(errorData);
    } else {
      // Log to console in development
      console.group('🚨 Error Captured');
      console.error(errorData);
      console.groupEnd();
      // Update UI
      this.appendErrorToOverlay(errorData);
    }
  }

  async sendToBackend(errorData) {
    try {
      await fetch(`${this.apiUrl}/errors/log`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...errorData,
          userAgent: navigator.userAgent,
          url: window.location.href,
          viewport: {
            width: window.innerWidth,
            height: window.innerHeight,
          },
        }),
      });
    } catch (e) {
      // Silently fail to avoid infinite loops
    }
  }

  // ===== Development overlay UI =====
  setupDevOverlay() {
    // Create toggle button
    const btn = document.createElement('button');
    btn.setAttribute('aria-label', 'Errores de la aplicación');
    btn.style.cssText = `
      position:fixed; right:16px; bottom:16px; z-index:2147483647;
      width:40px; height:40px; border-radius:50%; border:1px solid #ccc;
      background:#fff; box-shadow:0 2px 8px rgba(0,0,0,.15);
      cursor:pointer; display:flex; align-items:center; justify-content:center;
    `;
    btn.innerHTML = '⚠️';

    const badge = document.createElement('span');
    badge.style.cssText = `
      position:absolute; top:-6px; right:-6px;
      background:#d93025; color:#fff; font:700 10px/1 sans-serif;
      padding:3px 6px; border-radius:10px; display:none;
    `;
    btn.appendChild(badge);
    this.counterBadge = badge;

    // Panel
    const panel = document.createElement('div');
    panel.style.cssText = `
      position:fixed; right:16px; bottom:64px; width:360px; max-height:50vh;
      overflow:auto; background:#1e1e1e; color:#eaeaea; border-radius:8px;
      box-shadow:0 12px 24px rgba(0,0,0,.3); padding:12px; display:none;
      z-index:2147483647; font:12px/1.4 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
    `;
    panel.innerHTML = `
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
        <strong>Errores recientes</strong>
        <span id="err-count" style="opacity:.7"></span>
        <span style="flex:1"></span>
        <button id="err-clear" style="background:#333;color:#fff;border:1px solid #555;padding:4px 8px;border-radius:4px;cursor:pointer">Limpiar</button>
        <button id="err-close" style="background:#333;color:#fff;border:1px solid #555;padding:4px 8px;border-radius:4px;cursor:pointer">Cerrar</button>
      </div>
      <div id="err-list"></div>
    `;

    btn.addEventListener('click', () => {
      panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    });

    panel.querySelector('#err-close').addEventListener('click', () => {
      panel.style.display = 'none';
    });

    panel.querySelector('#err-clear').addEventListener('click', () => {
      this.clearErrors();
      panel.querySelector('#err-list').innerHTML = '';
      this.updateCounter(0);
      panel.querySelector('#err-count').textContent = '(0)';
    });

    document.body.appendChild(btn);
    document.body.appendChild(panel);
    this.overlay = panel;

    // Seed with stored errors
    const stored = this.getStoredErrors();
    stored.forEach((e) => this.appendErrorToOverlay(e));
  }

  updateCounter(n) {
    if (!this.counterBadge) return;
    if (n <= 0) {
      this.counterBadge.style.display = 'none';
    } else {
      this.counterBadge.style.display = 'inline-block';
      this.counterBadge.textContent = String(n);
    }
  }

  appendErrorToOverlay(error) {
    if (!this.overlay) return;
    this.updateCounter(this.errors.length);
    const list = this.overlay.querySelector('#err-list');
    const item = document.createElement('div');
    item.style.cssText = 'border-top:1px solid #333;padding:8px 0;';
    const time = new Date(error.timestamp || Date.now()).toLocaleTimeString();
  const stack = (error.stack || '').split('\n').slice(0, 4).join('\n');
    item.innerHTML = `
      <div style="color:#ffbcbc">${error.type || 'error'} · ${time}</div>
      <div style="white-space:pre-wrap">${(error.message || '').toString().slice(0,400)}</div>
      ${stack ? `<pre style="white-space:pre-wrap;background:#111;border:1px solid #333;border-radius:4px;padding:6px;margin:6px 0">${stack}</pre>` : ''}
    `;
    list.prepend(item);
    this.overlay.querySelector('#err-count').textContent = `(${this.errors.length})`;
  }

  getErrors() {
    return this.errors;
  }

  clearErrors() {
    this.errors = [];
    localStorage.removeItem('errorLog');
  }

  getStoredErrors() {
    try {
      const stored = localStorage.getItem('errorLog');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  }
}

// Create singleton instance
const errorMonitor = new ErrorMonitor();

export default errorMonitor;
