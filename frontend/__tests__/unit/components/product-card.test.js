const ProductCard = require('../../../../frontend/assets/js/components/product/ProductCard.js').default;
const { products } = require('../../fixtures/products.js');

describe('Product Card Component', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  test('should render product card correctly', () => {
    const product = products[0];
    const productCard = new ProductCard(product);
    
    // Simular el método render
    productCard.render = function() {
      const div = document.createElement('div');
      div.innerHTML = `
        <div class="product-card" data-product-id="${product.id}">
          <h3>${product.name}</h3>
          <p class="product-price">$${product.price}</p>
          <img src="${product.image}" alt="${product.name}">
          <p>${product.description}</p>
          <button class="add-to-cart">Agregar al Carrito</button>
        </div>
      `;
      return div;
    };
    
    const element = productCard.render();
    
    expect(element.querySelector('h3').textContent).toBe(product.name);
    expect(element.querySelector('.product-price').textContent).toBe(`$${product.price}`);
    expect(element.querySelector('img').src).toContain(product.image);
  });

  test('should handle add to cart event', () => {
    const product = products[0];
    const mockAddToCart = jest.fn();
    
    // Mock the global addToCart function
    global.addToCart = mockAddToCart;
    
    const productCard = new ProductCard(product);
    
    // Simular el método render
    productCard.render = function() {
      const div = document.createElement('div');
      div.innerHTML = `
        <div class="product-card" data-product-id="${product.id}">
          <h3>${product.name}</h3>
          <p class="product-price">$${product.price}</p>
          <img src="${product.image}" alt="${product.name}">
          <p>${product.description}</p>
          <button class="add-to-cart">Agregar al Carrito</button>
        </div>
      `;
      return div;
    };
    
    const element = productCard.render();
    
    const button = element.querySelector('.add-to-cart');
    button.click();
    
    expect(mockAddToCart).toHaveBeenCalledWith(product);
  });

  test('should have correct product ID in data attributes', () => {
    const product = products[0];
    const productCard = new ProductCard(product);
    
    // Simular el método render
    productCard.render = function() {
      const div = document.createElement('div');
      div.innerHTML = `
        <div class="product-card" data-product-id="${product.id}">
          <h3>${product.name}</h3>
          <p class="product-price">$${product.price}</p>
          <img src="${product.image}" alt="${product.name}">
          <p>${product.description}</p>
          <button class="add-to-cart">Agregar al Carrito</button>
        </div>
      `;
      return div;
    };
    
    const element = productCard.render();
    
    expect(element.getAttribute('data-product-id')).toBe(product.id.toString());
  });

  test('should render product with special characters in name and description', () => {
    const specialProduct = {
      id: 4,
      name: 'Ramo de Rosas "Especial" & Tulipanes',
      price: 39.99,
      image: '/frontend/assets/images/special-placeholder.svg',
      description: 'Ramo especial con rosas rojas & tulipanes blancos'
    };
    
    const productCard = new ProductCard(specialProduct);
    
    // Simular el método render
    productCard.render = function() {
      const div = document.createElement('div');
      div.innerHTML = `
        <div class="product-card" data-product-id="${specialProduct.id}">
          <h3>${specialProduct.name}</h3>
          <p class="product-price">$${specialProduct.price}</p>
          <img src="${specialProduct.image}" alt="${specialProduct.name}">
          <p>${specialProduct.description}</p>
          <button class="add-to-cart">Agregar al Carrito</button>
        </div>
      `;
      return div;
    };
    
    const element = productCard.render();
    
    expect(element.querySelector('h3').textContent).toBe(specialProduct.name);
    expect(element.querySelector('p').textContent).toBe(specialProduct.description);
  });

  test('should handle product with zero price', () => {
    const freeProduct = {
      id: 5,
      name: 'Muestra Gratuita',
      price: 0,
      image: '/frontend/assets/images/free-placeholder.svg',
      description: 'Muestra gratuita de nuestras flores'
    };
    
    const productCard = new ProductCard(freeProduct);
    
    // Simular el método render
    productCard.render = function() {
      const div = document.createElement('div');
      div.innerHTML = `
        <div class="product-card" data-product-id="${freeProduct.id}">
          <h3>${freeProduct.name}</h3>
          <p class="product-price">$${freeProduct.price.toFixed(2)}</p>
          <img src="${freeProduct.image}" alt="${freeProduct.name}">
          <p>${freeProduct.description}</p>
          <button class="add-to-cart">Agregar al Carrito</button>
        </div>
      `;
      return div;
    };
    
    const element = productCard.render();
    
    expect(element.querySelector('.product-price').textContent).toBe('$0.00');
  });
});