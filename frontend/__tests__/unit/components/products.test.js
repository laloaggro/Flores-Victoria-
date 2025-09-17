const Products = require('../../../../frontend/assets/js/components/product/Products.js').default;
const { products } = require('../../fixtures/products.js');

// Mock the ProductCard class
jest.mock('../../../../frontend/assets/js/components/product/ProductCard.js', () => {
  return jest.fn().mockImplementation((product) => {
    return {
      render: () => {
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
      }
    };
  });
});

describe('Products', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  test('should render all products', () => {
    const productsComponent = new Products(products);
    const element = productsComponent.render();
    
    expect(element.querySelectorAll('.product-card').length).toBe(products.length);
  });

  test('should render empty state when no products', () => {
    const productsComponent = new Products([]);
    const element = productsComponent.render();
    
    expect(element.querySelector('.no-products')).not.toBeNull();
  });

  test('should handle product click events', () => {
    const mockAddToCart = jest.fn();
    global.addToCart = mockAddToCart;
    
    const productsComponent = new Products([products[0]]);
    const element = productsComponent.render();
    
    const button = element.querySelector('.add-to-cart');
    button.click();
    
    expect(mockAddToCart).toHaveBeenCalledWith(products[0]);
  });
});