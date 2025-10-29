// theme.js - Manejo del tema claro/oscuro

/**
 * Inicializa el sistema de temas
 */
export function initializeTheme() {
  // Aplicar el tema guardado o el tema por defecto
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon();

  // Agregar evento al botón de cambio de tema
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }

  console.log('Theme system initialized');
}

// Función para actualizar el ícono del botón de tema
function updateThemeIcon() {
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const themeIcon = themeToggle.querySelector('.theme-icon');
    if (themeIcon) {
      themeIcon.textContent = currentTheme === 'dark' ? '☀️' : '🌙';
    }
  }
}

// Función para cambiar el tema
function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

  // Aplicar el nuevo tema
  document.documentElement.setAttribute('data-theme', newTheme);

  // Guardar preferencia del usuario
  localStorage.setItem('theme', newTheme);

  // Actualizar ícono
  updateThemeIcon();

  // Disparar evento personalizado
  document.dispatchEvent(
    new CustomEvent('themeChanged', {
      detail: { theme: newTheme },
    })
  );
}
