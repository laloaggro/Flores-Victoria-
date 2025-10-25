// Global, role-aware navbar injector
(function () {
  function el(tag, attrs = {}, children = []) {
    const e = document.createElement(tag);
    Object.entries(attrs).forEach(([k, v]) => {
      if (k === 'class') e.className = v;
      else if (k === 'html') e.innerHTML = v;
      else e.setAttribute(k, v);
    });
    (Array.isArray(children) ? children : [children]).forEach((c) => {
      if (c) e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    });
    return e;
  }

  function buildLink(href, text) {
    const a = el('a', { href }, text);
    a.classList.add('nav-link');
    if (location.pathname === href) a.classList.add('active');
    return a;
  }

  async function getProfile() {
    try {
      const res = await fetch('/api/auth/profile', { credentials: 'include' });
      if (!res.ok) return null;
      const data = await res.json();
      return data?.data?.user || null;
    } catch (_) {
      return null;
    }
  }

  function wireLogout(button) {
    if (!button) return;
    button.addEventListener('click', async () => {
      try {
        await fetch('/auth/logout', { method: 'POST', credentials: 'include' });
      } catch (_e) {}
      if (typeof window.logout === 'function') {
        window.logout();
        return;
      }
      location.href = '/pages/login.html';
    });
  }

  async function mount() {
    if (location.pathname === '/pages/login.html') return; // no navbar on login

    const user = await getProfile();
    const role = user?.role;

    const brand = el('a', { href: '/' }, [
      el('img', {
        src: '/assets/logo.svg',
        alt: 'Flores Victoria',
        width: '24',
        height: '24',
        style: 'vertical-align:middle;margin-right:8px',
      }),
      'Flores Victoria',
    ]);
    brand.classList.add('brand');

    const links = el('div', { class: 'nav-links' });

    // Always show Home
    links.appendChild(buildLink('/', 'Inicio'));

    // Admin-only links
    if (role === 'admin') {
      links.appendChild(buildLink('/pages/dashboards.html', 'Dashboards'));
      links.appendChild(buildLink('/pages/admin-console.html', 'Consola'));
      links.appendChild(buildLink('/pages/admin-panel.html', 'Panel'));
      links.appendChild(buildLink('/pages/owner-dashboard.html', 'Métricas'));
    }

    // Worker/Admin
    if (role === 'worker' || role === 'trabajador' || role === 'admin') {
      links.appendChild(buildLink('/pages/worker-tools.html', 'Herramientas'));
    }

    const right = el('div', { class: 'nav-right' });
    const userSpan = el('span', { class: 'nav-user' }, user?.name || user?.email || '');
    const logoutBtn = el(
      'button',
      { class: 'btn-logout btn-logout--small', type: 'button' },
      'Salir'
    );
    right.appendChild(userSpan);
    right.appendChild(logoutBtn);

    const inner = el('div', { class: 'nav-inner' }, [brand, links, right]);
    const nav = el('nav', { class: 'global-nav' }, inner);

    document.body.insertBefore(nav, document.body.firstChild);
    wireLogout(logoutBtn);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();
