// Script principal para el admin-site
console.log(
  '%c🌸 Flores Victoria Admin Site',
  'color: #667eea; font-size: 20px; font-weight: bold;'
);
console.log('%cPuerto 9000 - Centro de Administración', 'color: #764ba2; font-size: 14px;');

// Cargar estadísticas en tiempo real
async function loadStats() {
  try {
    // Obtener productos
    const productsResponse = await fetch('/api/products', { credentials: 'include' });
    if (productsResponse.ok) {
      const products = await productsResponse.json();
      updateStatValue('products', products.length);
    }

    // Verificar servicios
    const services = [
      '/api/health',
      'http://localhost:3001/health',
      'http://localhost:3009/health',
      'http://localhost:5173/',
      'http://localhost:3010/',
    ];

    let activeServices = 0;
    for (const service of services) {
      try {
        const response = await fetch(service, { mode: 'no-cors' });
        activeServices++;
      } catch (error) {
        // Servicio no disponible
      }
    }

    const statElements = document.querySelectorAll('.stat-value');
    statElements.forEach((el) => {
      if (el.textContent === '-' && el.closest('.stat-label')?.textContent === 'Servicios') {
        el.textContent = activeServices;
      }
    });
  } catch (error) {
    console.error('Error cargando estadísticas:', error);
  }
}

function updateStatValue(key, value) {
  const elements = document.querySelectorAll('.stat-value');
  elements.forEach((el) => {
    const label = el.closest('.stat')?.querySelector('.stat-label');
    if (label && label.textContent.toLowerCase().includes(key)) {
      el.textContent = value;
    }
  });
}

// Actualizar uptime
function updateUptime() {
  const startTime = localStorage.getItem('adminSiteStartTime');
  if (!startTime) {
    localStorage.setItem('adminSiteStartTime', Date.now());
    return;
  }

  const elapsed = Date.now() - parseInt(startTime);
  const hours = Math.floor(elapsed / (1000 * 60 * 60));
  const minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));

  const uptimeElements = document.querySelectorAll('.stat-value');
  uptimeElements.forEach((el) => {
    const label = el.closest('.stat')?.querySelector('.stat-label');
    if (label && label.textContent === 'Uptime') {
      el.textContent = `${hours}h ${minutes}m`;
    }
  });
}

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
  // Adaptar UI por rol
  fetch('/api/auth/profile', { credentials: 'include' })
    .then((r) => (r.ok ? r.json() : Promise.reject()))
    .then((data) => {
      const role = data?.data?.user?.role;
      const headerName = document.getElementById('userName');
      if (headerName)
        headerName.textContent = data?.data?.user?.name || data?.data?.user?.email || 'Usuario';

      // Mostrar/ocultar tarjetas según rol
      const adminOnly = [
        'Dashboard Principal',
        'MCP Dashboard',
        'Panel de Control',
        'Herramientas de Testing',
        'Logs y Analíticas',
        'Estado del Sistema',
      ];
      const cards = document.querySelectorAll('.dashboard-card');
      if (role === 'user' || role === 'cliente') {
        // Enfocar en enlaces rápidos hacia el sitio principal
        cards.forEach((c) => (c.style.display = 'none'));
      } else if (role === 'worker' || role === 'trabajador') {
        // Ocultar panel y testing, mantener dashboard principal y logs
        cards.forEach((c) => {
          const title = c.querySelector('h3')?.textContent || '';
          if (title.includes('Panel de Control') || title.includes('Herramientas de Testing')) {
            c.style.display = 'none';
          }
        });
      } else if (role === 'admin') {
        // Todo visible
      }
    })
    .catch(() => {});
  loadStats();
  updateUptime();

  // Actualizar cada 30 segundos
  setInterval(() => {
    loadStats();
    updateUptime();
  }, 30000);
});

// Atajos de teclado
document.addEventListener('keydown', (e) => {
  if (e.key === 'h' || e.key === 'H') {
    window.location.href = '/';
  }
  if (e.key === 'd' || e.key === 'D') {
    window.location.href = '/pages/monitoring-dashboard.html';
  }
  if (e.key === 'm' || e.key === 'M') {
    window.location.href = '/pages/mcp-dashboard.html';
  }
});

console.log('%cAtaljos de teclado:', 'color: #764ba2; font-size: 14px; font-weight: bold;');
console.log('  H - Página principal');
console.log('  D - Dashboard de monitoreo');
console.log('  M - MCP Dashboard');
