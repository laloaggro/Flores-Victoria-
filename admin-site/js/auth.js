// Reglas de acceso por página
function requiredRoleForPath(pathname) {
  if (pathname.includes('/pages/worker-tools.html')) return 'workerOrAdmin';
  if (pathname.includes('/pages/admin-console.html') || pathname.includes('/pages/dashboards.html') || pathname.includes('/pages/owner-dashboard.html') || pathname.startsWith('/panel')) return 'admin';
  if (pathname === '/' || pathname === '' || pathname === '/index.html') return 'workerOrAdmin';
  return 'admin';
}

// Verificación de autenticación basada en perfil vía proxy
async function checkAuth() {
  try {
    const response = await fetch('/api/auth/profile', {
      credentials: 'include',
    });

    if (!response.ok) throw new Error('No autorizado');

    const data = await response.json();
    const user = data.data?.user;

    if (!user) { throw new Error('Sin usuario'); }

    const role = user.role;
    const need = requiredRoleForPath(window.location.pathname);
    const isAdmin = role === 'admin';
    const isWorker = role === 'worker' || role === 'trabajador';
    const ok = (need === 'admin' && isAdmin) || (need === 'workerOrAdmin' && (isAdmin || isWorker));
    if (!ok) { throw new Error('Rol insuficiente'); }

    // Actualizar nombre de usuario
    const userNameElement = document.getElementById('userName');
    if (userNameElement) {
      userNameElement.textContent = user.name || user.email || 'Administrador';
    }

    return true;
  } catch (error) {
    console.error('Error de autenticación:', error);
    window.location.href = '/pages/login.html';
    return false;
  }
}

// Cerrar sesión (ahora llamando al endpoint del server para limpiar HttpOnly)
async function logout() {
  try {
    await fetch('/auth/logout', { method: 'POST', credentials: 'include' });
  } catch (err) {
    console.warn('Error en logout endpoint:', err);
  }
  window.location.href = '/pages/login.html';
}

// Verificar autenticación al cargar
if (window.location.pathname !== '/pages/login.html') {
  checkAuth();
}

// Configurar botón de logout
document.addEventListener('DOMContentLoaded', () => {
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
  }
});
