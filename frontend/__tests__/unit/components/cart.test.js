import Cart from '../../../../frontend/assets/js/components/cart/Cart.js';

// Mock del localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};

global.localStorage = localStorageMock;

// Mock de funciones globales
global.updateCartCount = jest.fn();
global.showNotification = jest.fn();

describe('Cart Component', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  test('should render empty cart correctly', () => {
    // Mock de carrito vacío
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'cart') return '[]';
      return null;
    });

    const cart = new Cart();
    const element = cart.render();
    
    expect(element.querySelector('.cart-items')).toBeTruthy();
    expect(element.querySelector('.cart-total')).toBeTruthy();
    expect(element.querySelector('.empty-cart-message')).toBeTruthy();
  });

  test('should render cart with items correctly', () => {
    // Mock de carrito con productos
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'cart') {
        return JSON.stringify([
          { id: '1', name: 'Product 1', price: 10.99, quantity: 2, image: 'image1.jpg' },
          { id: '2', name: 'Product 2', price: 5.99, quantity: 1, image: 'image2.jpg' }
        ]);
      }
      return null;
    });

    const cart = new Cart();
    const element = cart.render();
    
    const cartItems = element.querySelectorAll('.cart-item');
    expect(cartItems.length).toBe(2);
    
    const cartTotal = element.querySelector('.cart-total-amount');
    expect(cartTotal).toBeTruthy();
  });

  test('should handle remove item from cart', () => {
    // Mock de carrito con productos
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'cart') {
        return JSON.stringify([
          { id: '1', name: 'Product 1', price: 10.99, quantity: 2, image: 'image1.jpg' }
        ]);
      }
      return null;
    });

    // Mock para guardar en localStorage
    localStorageMock.setItem.mockImplementation(() => {});

    const cart = new Cart();
    const element = cart.render();
    
    const removeButton = element.querySelector('.remove-item');
    removeButton.click();
    
    expect(localStorageMock.setItem).toHaveBeenCalled();
  });

  test('should handle update quantity', () => {
    // Mock de carrito con productos
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'cart') {
        return JSON.stringify([
          { id: '1', name: 'Product 1', price: 10.99, quantity: 2, image: 'image1.jpg' }
        ]);
      }
      return null;
    });

    // Mock para guardar en localStorage
    localStorageMock.setItem.mockImplementation(() => {});

    const cart = new Cart();
    const element = cart.render();
    
    const quantityInput = element.querySelector('.quantity-input');
    quantityInput.value = 5;
    quantityInput.dispatchEvent(new Event('change'));
    
    expect(localStorageMock.setItem).toHaveBeenCalled();
  });

  test('should handle empty cart state', () => {
    // Mock de carrito vacío
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'cart') return '[]';
      return null;
    });

    const cart = new Cart();
    const element = cart.render();
    
    expect(element.querySelector('.cart-items')).toBeTruthy();
    expect(element.querySelector('.cart-total')).toBeTruthy();
    expect(element.querySelector('.empty-cart-message')).toBeTruthy();
  });

  test('should handle cart with items', () => {
    // Mock de carrito con productos
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'cart') {
        return JSON.stringify([
          { id: '1', name: 'Product 1', price: 10.99, quantity: 2, image: 'image1.jpg' },
          { id: '2', name: 'Product 2', price: 5.99, quantity: 1, image: 'image2.jpg' }
        ]);
      }
      return null;
    });

    const cart = new Cart();
    const element = cart.render();
    
    const cartItems = element.querySelectorAll('.cart-item');
    expect(cartItems.length).toBe(2);
    
    const cartTotal = element.querySelector('.cart-total-amount');
    expect(cartTotal).toBeTruthy();
  });
});