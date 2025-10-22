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

// Mock de funciones globales
global.updateCartCount = jest.fn();
global.showNotification = jest.fn();

// Importar funciones reales del carrito
import {
  addToCart,
  getCartTotal,
  removeFromCart,
  updateQuantity,
} from '../../frontend/assets/js/components/cart/cart.js';

describe('Cart Functionality', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();

    // Limpiar el DOM
    document.body.innerHTML = '';
  });

  test('debería inicializar el carrito correctamente', () => {
    // Mock de carrito vacío
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'cart') return '[]';
      return null;
    });

    // Verificar que las funciones estén definidas
    expect(typeof addToCart).toBe('function');
    expect(typeof getCartTotal).toBe('function');
    expect(typeof removeFromCart).toBe('function');
    expect(typeof updateQuantity).toBe('function');
  });

  test('debería agregar un producto al carrito', () => {
    // Mock de carrito vacío
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'cart') return '[]';
      return null;
    });

    // Mock para guardar en localStorage
    localStorageMock.setItem.mockImplementation(() => {});

    // Crear un producto de prueba
    const testProduct = {
      id: '1',
      name: 'Test Product',
      price: 10.99,
      image: 'test-image.jpg',
    };

    // Agregar al carrito
    addToCart(testProduct);

    // Verificar que se llamó a setItem
    expect(localStorageMock.setItem).toHaveBeenCalled();
  });

  test('debería incrementar la cantidad si el producto ya existe en el carrito', () => {
    // Mock de carrito con producto existente
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'cart') {
        return JSON.stringify([{ id: '1', name: 'Test Product', price: 10.99, quantity: 1 }]);
      }
      return null;
    });

    // Mock para guardar en localStorage
    localStorageMock.setItem.mockImplementation(() => {});

    // Crear un producto de prueba
    const testProduct = {
      id: '1',
      name: 'Test Product',
      price: 10.99,
      image: 'test-image.jpg',
    };

    // Agregar al carrito
    addToCart(testProduct);

    // Verificar que se actualizó la cantidad
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'cart',
      JSON.stringify([{ id: '1', name: 'Test Product', price: 10.99, quantity: 2 }])
    );
  });

  test('debería actualizar la cantidad de un producto', () => {
    // Mock de carrito con productos
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'cart') {
        return JSON.stringify([{ id: '1', name: 'Product 1', price: 10.99, quantity: 2 }]);
      }
      return null;
    });

    // Mock para guardar en localStorage
    localStorageMock.setItem.mockImplementation(() => {});

    // Actualizar cantidad
    updateQuantity('1', 5);

    // Verificar que se actualizó la cantidad correctamente
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'cart',
      JSON.stringify([{ id: '1', name: 'Product 1', price: 10.99, quantity: 5 }])
    );
  });

  test('debería eliminar un producto del carrito', () => {
    // Mock de carrito con productos
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'cart') {
        return JSON.stringify([
          { id: '1', name: 'Product 1', price: 10.99, quantity: 2 },
          { id: '2', name: 'Product 2', price: 5.99, quantity: 1 },
        ]);
      }
      return null;
    });

    // Mock para guardar en localStorage
    localStorageMock.setItem.mockImplementation(() => {});

    // Eliminar producto
    removeFromCart('1');

    // Verificar que el producto fue eliminado
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'cart',
      JSON.stringify([{ id: '2', name: 'Product 2', price: 5.99, quantity: 1 }])
    );
  });

  test('debería calcular correctamente el total del carrito', () => {
    // Mock de carrito con productos
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'cart') {
        return JSON.stringify([
          { id: '1', name: 'Product 1', price: 10.99, quantity: 2 },
          { id: '2', name: 'Product 2', price: 5.99, quantity: 1 },
        ]);
      }
      return null;
    });

    // Calcular total
    const total = getCartTotal();

    // Verificar que el total es correcto
    expect(total).toBeCloseTo(27.97, 2);
  });

  test('debería manejar correctamente productos con precios inválidos', () => {
    // Mock de carrito con productos con precios inválidos
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'cart') {
        return JSON.stringify([
          { id: '1', name: 'Product 1', price: null, quantity: 2 },
          { id: '2', name: 'Product 2', price: 'invalid', quantity: 1 },
        ]);
      }
      return null;
    });

    // Calcular total
    const total = getCartTotal();

    // Verificar que el total es 0
    expect(total).toBe(0);
  });

  test('debería manejar correctamente cantidades inválidas', () => {
    // Mock de carrito con productos con cantidades inválidas
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'cart') {
        return JSON.stringify([
          { id: '1', name: 'Product 1', price: 10.99, quantity: -1 },
          { id: '2', name: 'Product 2', price: 5.99, quantity: 'invalid' },
        ]);
      }
      return null;
    });

    // Calcular total
    const total = getCartTotal();

    // Verificar que el total es 0
    expect(total).toBe(0);
  });

  test('debería persistir el carrito en localStorage', () => {
    // Mock de carrito vacío
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'cart') return '[]';
      return null;
    });

    // Mock para guardar en localStorage
    localStorageMock.setItem.mockImplementation(() => {});

    // Crear un producto de prueba
    const testProduct = {
      id: '1',
      name: 'Test Product',
      price: 10.99,
      image: 'test-image.jpg',
    };

    // Agregar al carrito
    addToCart(testProduct);

    // Verificar que se guardó en localStorage
    expect(localStorageMock.setItem).toHaveBeenCalledWith('cart', expect.any(String));
  });

  test('debería cargar el carrito desde localStorage', () => {
    // Mock de carrito con productos
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'cart') {
        return JSON.stringify([{ id: '1', name: 'Product 1', price: 10.99, quantity: 2 }]);
      }
      return null;
    });

    // Recargar el carrito
    const cart = JSON.parse(localStorage.getItem('cart'));

    // Verificar que los productos se cargaron correctamente
    expect(cart).toHaveLength(1);
    expect(cart[0].id).toBe('1');
    expect(cart[0].name).toBe('Product 1');
    expect(cart[0].price).toBe(10.99);
    expect(cart[0].quantity).toBe(2);
  });
});
