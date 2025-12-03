/**
 * @jest-environment jsdom
 */

// Mock del localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

global.localStorage = localStorageMock;

// Mock de funciones de utilidad
global.showNotification = jest.fn();

// Mock de fetch
global.fetch = jest.fn();

// Mock de funciones globales
global.showNotification = jest.fn();
global.updateCartCount = jest.fn();

// Importar funciones reales de autenticación
import {
  isAuthenticated,
  logout,
  getUserInfo,
} from '../../../frontend/assets/js/components/utils/auth.js';

describe('Auth Functionality', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();

    // Limpiar el localStorage
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
  });

  test('debería verificar correctamente si el usuario está autenticado', () => {
    // Mock de token válido
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'token') {
        // Token válido por 1 hora
        const payload = {
          exp: Math.floor(Date.now() / 1000) + 3600,
          user: { id: 1, name: 'Test User' },
        };
        return btoa(JSON.stringify(payload));
      }
      return null;
    });

    // Verificar autenticación
    expect(typeof isAuthenticated).toBe('function');
    expect(isAuthenticated()).toBe(true);
  });

  test('debería cerrar sesión correctamente', () => {
    // Verificar que la función logout exista
    expect(typeof logout).toBe('function');

    // Ejecutar logout
    logout();

    // Verificar que se hayan eliminado los items del localStorage
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('user');
    expect(showNotification).toHaveBeenCalledWith('Sesión cerrada exitosamente');
  });

  test('debería obtener información del usuario correctamente', () => {
    // Mock de token válido
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'token') {
        // Token válido por 1 hora
        const payload = {
          exp: Math.floor(Date.now() / 1000) + 3600,
          user: { id: 1, name: 'Test User', email: 'test@example.com' },
        };
        return btoa(JSON.stringify(payload));
      }
      return null;
    });

    // Verificar que la función getUserInfo exista
    expect(typeof getUserInfo).toBe('function');

    // Obtener información del usuario
    const userInfo = getUserInfo();
    expect(userInfo).toBeDefined();
    expect(userInfo.user).toBeDefined();
    expect(userInfo.user.name).toBe('Test User');
    expect(userInfo.user.email).toBe('test@example.com');
  });

  test('debería manejar correctamente cuando no hay token', () => {
    // Mock de ausencia de token
    localStorageMock.getItem.mockImplementation((key) => null);

    // Verificar que isAuthenticated devuelve false cuando no hay token
    expect(isAuthenticated()).toBe(false);
  });

  test('debería manejar correctamente tokens inválidos', () => {
    // Mock de token inválido
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'token') {
        // Token expirado
        const payload = {
          exp: Math.floor(Date.now() / 1000) - 3600,
          user: { id: 1, name: 'Test User' },
        };
        return btoa(JSON.stringify(payload));
      }
      return null;
    });

    // Verificar que isAuthenticated devuelve false cuando el token ha expirado
    expect(isAuthenticated()).toBe(false);

    // Verificar que se hayan eliminado los items del localStorage
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('user');
  });
});
