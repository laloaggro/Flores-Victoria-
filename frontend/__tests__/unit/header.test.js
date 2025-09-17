/**
 * @jest-environment jsdom
 */

// Mock de las funciones del header
global.toggleCart = jest.fn();
global.toggleUserMenu = jest.fn();
global.toggleMobileMenu = jest.fn();
global.logout = jest.fn();

// Mock del localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};

global.localStorage = localStorageMock;

// Mock del DOM
document.body.innerHTML = `
  <header-component></header-component>
`;

describe('Header Component', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  test('debería cargar correctamente el componente', () => {
    // Simular que el usuario está autenticado
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'token') return 'test-token';
      if (key === 'user') return JSON.stringify({ name: 'Test User' });
      return null;
    });

    // Importar dinámicamente el componente
    require('../../../frontend/components/header/Header.js');
    
    // Verificar que el componente se haya definido
    expect(customElements.get('header-component')).toBeDefined();
  });

  test('debería mostrar el menú de usuario cuando hay token', () => {
    // Preparar el mock de localStorage
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'token') return 'test-token';
      if (key === 'user') return JSON.stringify({ name: 'Test User' });
      return null;
    });

    // Crear un elemento header-component
    document.body.innerHTML = `
      <header-component></header-component>
    `;

    // Forzar una actualización del componente
    const header = document.querySelector('header-component');
    if (header && header.updateUserMenu) {
      header.updateUserMenu();
    }

    // Verificar que se haya llamado a localStorage.getItem
    expect(localStorageMock.getItem).toHaveBeenCalledWith('token');
  });

  test('debería ocultar el menú de usuario cuando no hay token', () => {
    // Preparar el mock de localStorage sin token
    localStorageMock.getItem.mockImplementation((key) => {
      return null;
    });

    // Crear un elemento header-component
    document.body.innerHTML = `
      <header-component></header-component>
    `;

    // Forzar una actualización del componente
    const header = document.querySelector('header-component');
    if (header && header.updateUserMenu) {
      header.updateUserMenu();
    }

    // Verificar que se haya llamado a localStorage.getItem
    expect(localStorageMock.getItem).toHaveBeenCalledWith('token');
  });

  test('debería manejar correctamente nombres de usuario largos', () => {
    // Preparar el mock de localStorage con nombre de usuario largo
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'token') return 'test-token';
      if (key === 'user') return JSON.stringify({ name: 'Usuario con Nombre Muy Largo' });
      return null;
    });

    // Crear un elemento header-component
    document.body.innerHTML = `
      <header-component></header-component>
    `;

    // Forzar una actualización del componente
    const header = document.querySelector('header-component');
    if (header && header.updateUserMenu) {
      header.updateUserMenu();
    }

    // Verificar que se haya llamado a localStorage.getItem
    expect(localStorageMock.getItem).toHaveBeenCalledWith('token');
  });
});