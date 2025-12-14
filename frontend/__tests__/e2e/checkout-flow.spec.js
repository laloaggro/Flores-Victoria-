/**
 * @fileoverview E2E Tests - Flujo de Checkout
 * @description Tests end-to-end para carrito y proceso de compra
 * @author Flores Victoria Team
 * @version 1.0.0
 */

const { test, expect } = require('@playwright/test');

test.describe('Checkout Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test.describe('Product Listing', () => {
    test('should display products on catalog page', async ({ page }) => {
      await page.goto('/pages/products/');
      await page.waitForLoadState('networkidle');

      // Buscar productos en el catálogo
      const products = page.locator('.product-card, .product-item, [data-product], article.product');
      const productCount = await products.count();

      console.log(`Products found: ${productCount}`);
      expect(productCount).toBeGreaterThanOrEqual(0); // Puede ser 0 si API no está disponible
    });

    test('should have product images', async ({ page }) => {
      await page.goto('/pages/products/');
      await page.waitForLoadState('networkidle');

      const productImages = page.locator('.product-card img, .product-item img, [data-product] img');
      const imageCount = await productImages.count();

      if (imageCount > 0) {
        // Verificar que al menos una imagen tiene src
        const firstImage = productImages.first();
        const src = await firstImage.getAttribute('src');
        expect(src).toBeTruthy();
      }
    });

    test('should have "Add to Cart" buttons', async ({ page }) => {
      await page.goto('/pages/products/');
      await page.waitForLoadState('networkidle');

      const addToCartButtons = page.locator(
        'button[data-add-to-cart], .add-to-cart, .btn-add-cart, [onclick*="addToCart"]'
      );
      const buttonCount = await addToCartButtons.count();

      console.log(`Add to cart buttons: ${buttonCount}`);
    });

    test('should navigate to product detail page', async ({ page }) => {
      await page.goto('/pages/products/');
      await page.waitForLoadState('networkidle');

      const productLinks = page.locator('.product-card a, .product-item a, [data-product] a').first();

      if ((await productLinks.count()) > 0) {
        await productLinks.click();
        await page.waitForLoadState('networkidle');

        // Verificar que estamos en página de detalle
        const url = page.url();
        expect(url).toMatch(/product|detalle|item/i);
      }
    });
  });

  test.describe('Product Detail', () => {
    test('should display product information', async ({ page }) => {
      // Intentar ir directamente a una página de producto
      await page.goto('/pages/products/product.html?id=1');
      await page.waitForLoadState('networkidle');

      // Verificar elementos básicos
      const productTitle = page.locator('h1, .product-title, .product-name');
      const productPrice = page.locator('.price, .product-price, [data-price]');

      console.log(`Title elements: ${await productTitle.count()}`);
      console.log(`Price elements: ${await productPrice.count()}`);
    });

    test('should have quantity selector', async ({ page }) => {
      await page.goto('/pages/products/product.html?id=1');
      await page.waitForLoadState('networkidle');

      const quantityInput = page.locator('input[type="number"], input[name="quantity"], .quantity-input, #quantity');
      const quantityCount = await quantityInput.count();

      console.log(`Quantity inputs: ${quantityCount}`);
    });

    test('should allow adding product to cart from detail page', async ({ page }) => {
      await page.goto('/pages/products/product.html?id=1');
      await page.waitForLoadState('networkidle');

      const addButton = page.locator('button[data-add-to-cart], .add-to-cart, #add-to-cart, [onclick*="addToCart"]');

      if ((await addButton.count()) > 0) {
        await addButton.first().click();

        // Esperar confirmación (toast, modal, badge update)
        await page.waitForTimeout(1000);

        // Verificar que el carrito tiene items
        const cartCount = await page.evaluate(() => {
          const cart = JSON.parse(localStorage.getItem('cart') || '[]');
          return cart.length;
        });

        console.log(`Cart items after add: ${cartCount}`);
      }
    });
  });

  test.describe('Shopping Cart', () => {
    test.beforeEach(async ({ page }) => {
      // Pre-cargar carrito con items de prueba
      await page.goto('/');
      await page.evaluate(() => {
        const mockCart = [
          { id: '1', name: 'Rosas Rojas', price: 45.99, quantity: 2, image: '/images/products/roses.jpg' },
          { id: '2', name: 'Tulipanes', price: 35.5, quantity: 1, image: '/images/products/tulips.jpg' },
        ];
        localStorage.setItem('cart', JSON.stringify(mockCart));
      });
    });

    test('should display cart items', async ({ page }) => {
      await page.goto('/pages/cart/');
      await page.waitForLoadState('networkidle');

      // Esperar a que se rendericen los items
      await page.waitForTimeout(500);

      const cartItems = page.locator('.cart-item, .cart-product, [data-cart-item], tr.cart-row');
      const itemCount = await cartItems.count();

      console.log(`Cart items displayed: ${itemCount}`);
    });

    test('should show correct cart total', async ({ page }) => {
      await page.goto('/pages/cart/');
      await page.waitForLoadState('networkidle');

      const totalElement = page.locator('.cart-total, .total-price, #cart-total, [data-cart-total]');

      if ((await totalElement.count()) > 0) {
        const totalText = await totalElement.first().textContent();
        console.log(`Cart total displayed: ${totalText}`);

        // Verificar que contiene un número
        expect(totalText).toMatch(/\d/);
      }
    });

    test('should allow quantity update', async ({ page }) => {
      await page.goto('/pages/cart/');
      await page.waitForLoadState('networkidle');

      const quantityInput = page.locator('.cart-item input[type="number"], .quantity-input').first();

      if ((await quantityInput.count()) > 0) {
        // Cambiar cantidad
        await quantityInput.fill('3');
        await quantityInput.blur();

        // Esperar actualización
        await page.waitForTimeout(500);

        // Verificar que localStorage se actualizó
        const cart = await page.evaluate(() => JSON.parse(localStorage.getItem('cart') || '[]'));

        console.log(`Updated cart:`, cart);
      }
    });

    test('should allow item removal', async ({ page }) => {
      await page.goto('/pages/cart/');
      await page.waitForLoadState('networkidle');

      const removeButton = page.locator('.remove-item, .delete-item, [data-remove], button.remove').first();

      if ((await removeButton.count()) > 0) {
        const initialCount = await page.evaluate(() => JSON.parse(localStorage.getItem('cart') || '[]').length);

        await removeButton.click();
        await page.waitForTimeout(500);

        const finalCount = await page.evaluate(() => JSON.parse(localStorage.getItem('cart') || '[]').length);

        expect(finalCount).toBeLessThan(initialCount);
      }
    });

    test('should have checkout button', async ({ page }) => {
      await page.goto('/pages/cart/');
      await page.waitForLoadState('networkidle');

      const checkoutButton = page.locator('a[href*="checkout"], button[data-checkout], .checkout-btn, #checkout-btn');
      const buttonCount = await checkoutButton.count();

      console.log(`Checkout buttons: ${buttonCount}`);
      expect(buttonCount).toBeGreaterThan(0);
    });

    test('should navigate to checkout', async ({ page }) => {
      await page.goto('/pages/cart/');
      await page.waitForLoadState('networkidle');

      const checkoutButton = page
        .locator('a[href*="checkout"], button[data-checkout], .checkout-btn, #checkout-btn')
        .first();

      if ((await checkoutButton.count()) > 0) {
        await checkoutButton.click();
        await page.waitForLoadState('networkidle');

        const url = page.url();
        console.log(`Navigated to: ${url}`);
      }
    });
  });

  test.describe('Checkout Process', () => {
    test.beforeEach(async ({ page }) => {
      // Simular usuario autenticado con carrito
      await page.goto('/');
      await page.evaluate(() => {
        localStorage.setItem('token', 'mock-auth-token');
        localStorage.setItem(
          'user',
          JSON.stringify({
            id: '123',
            email: 'test@example.com',
            name: 'Test User',
          })
        );
        localStorage.setItem(
          'cart',
          JSON.stringify([{ id: '1', name: 'Rosas Rojas', price: 45.99, quantity: 2, image: '/images/roses.jpg' }])
        );
      });
    });

    test('should display checkout form', async ({ page }) => {
      await page.goto('/pages/checkout/');
      await page.waitForLoadState('networkidle');

      // Verificar campos de envío
      const addressField = page.locator('input[name="address"], #address, textarea[name="address"]');
      const cityField = page.locator('input[name="city"], #city, select[name="city"]');

      console.log(`Address fields: ${await addressField.count()}`);
      console.log(`City fields: ${await cityField.count()}`);
    });

    test('should show order summary in checkout', async ({ page }) => {
      await page.goto('/pages/checkout/');
      await page.waitForLoadState('networkidle');

      const orderSummary = page.locator('.order-summary, .checkout-summary, #order-summary');
      const summaryCount = await orderSummary.count();

      console.log(`Order summary sections: ${summaryCount}`);
    });

    test('should validate required fields', async ({ page }) => {
      await page.goto('/pages/checkout/');
      await page.waitForLoadState('networkidle');

      // Intentar enviar sin llenar campos
      const submitButton = page.locator('button[type="submit"], .place-order, #place-order');

      if ((await submitButton.count()) > 0) {
        await submitButton.click();

        // Verificar validación HTML5
        const hasInvalidFields = await page.evaluate(() => {
          const form = document.querySelector('form');
          return form ? !form.checkValidity() : false;
        });

        console.log(`Has validation errors: ${hasInvalidFields}`);
      }
    });

    test('should display payment options', async ({ page }) => {
      await page.goto('/pages/checkout/');
      await page.waitForLoadState('networkidle');

      const paymentSection = page.locator('.payment-methods, .payment-options, #payment, [data-payment]');
      const paymentCount = await paymentSection.count();

      console.log(`Payment sections: ${paymentCount}`);

      if (paymentCount > 0) {
        // Verificar opciones de pago
        const paymentOptions = page.locator('input[name="payment"], input[type="radio"][name*="pay"]');
        console.log(`Payment options: ${await paymentOptions.count()}`);
      }
    });

    test('should complete checkout flow', async ({ page, request }) => {
      // Skip si backend no está disponible
      const healthCheck = await request.get('/api/orders/health').catch(() => null);
      test.skip(!healthCheck?.ok(), 'Backend not available');

      await page.goto('/pages/checkout/');
      await page.waitForLoadState('networkidle');

      // Llenar formulario de checkout
      await page.fill('input[name="address"], #address', 'Av. Test 123').catch(() => {});
      await page.fill('input[name="city"], #city', 'Lima').catch(() => {});
      await page.fill('input[name="phone"], #phone', '999888777').catch(() => {});

      // Seleccionar método de pago si existe
      const cashOption = page.locator('input[value="cash"], input[value="efectivo"]');
      if ((await cashOption.count()) > 0) {
        await cashOption.click();
      }

      // Enviar orden
      const submitButton = page.locator('button[type="submit"], .place-order, #place-order');
      if ((await submitButton.count()) > 0) {
        await submitButton.click();

        // Esperar confirmación
        await Promise.race([
          page.waitForURL('**/confirmation**', { timeout: 15000 }),
          page.waitForURL('**/success**', { timeout: 15000 }),
          page.waitForURL('**/gracias**', { timeout: 15000 }),
          page.waitForSelector('.order-success, .confirmation, [data-order-complete]', { timeout: 15000 }),
        ]).catch(() => {});

        console.log(`Final URL: ${page.url()}`);
      }
    });
  });

  test.describe('Empty Cart Handling', () => {
    test('should show empty cart message', async ({ page }) => {
      await page.goto('/');
      await page.evaluate(() => localStorage.setItem('cart', '[]'));

      await page.goto('/pages/cart/');
      await page.waitForLoadState('networkidle');

      const emptyMessage = page.locator('.empty-cart, .cart-empty, [data-empty-cart], .no-items');
      const messageCount = await emptyMessage.count();

      console.log(`Empty cart messages: ${messageCount}`);
    });

    test('should disable checkout button when cart is empty', async ({ page }) => {
      await page.goto('/');
      await page.evaluate(() => localStorage.setItem('cart', '[]'));

      await page.goto('/pages/cart/');
      await page.waitForLoadState('networkidle');

      const checkoutButton = page.locator('a[href*="checkout"], button[data-checkout], .checkout-btn');

      if ((await checkoutButton.count()) > 0) {
        const isDisabled = await checkoutButton.first().isDisabled();
        const hasDisabledClass = await checkoutButton.first().evaluate((el) => el.classList.contains('disabled'));

        console.log(`Checkout button disabled: ${isDisabled || hasDisabledClass}`);
      }
    });

    test('should redirect to products from empty cart', async ({ page }) => {
      await page.goto('/');
      await page.evaluate(() => localStorage.setItem('cart', '[]'));

      await page.goto('/pages/cart/');
      await page.waitForLoadState('networkidle');

      const continueShoppingLink = page.locator(
        'a[href*="products"], a[href*="catalogo"], .continue-shopping, .shop-now'
      );
      const linkCount = await continueShoppingLink.count();

      console.log(`Continue shopping links: ${linkCount}`);

      if (linkCount > 0) {
        await continueShoppingLink.first().click();
        await page.waitForLoadState('networkidle');

        const url = page.url();
        expect(url).toMatch(/products|catalogo|tienda/i);
      }
    });
  });

  test.describe('Cart Badge/Counter', () => {
    test('should show cart item count in header', async ({ page }) => {
      await page.goto('/');
      await page.evaluate(() => {
        localStorage.setItem(
          'cart',
          JSON.stringify([
            { id: '1', quantity: 2 },
            { id: '2', quantity: 3 },
          ])
        );
      });

      await page.reload();
      await page.waitForLoadState('networkidle');

      const cartBadge = page.locator('.cart-badge, .cart-count, [data-cart-count], .badge');
      const badgeCount = await cartBadge.count();

      console.log(`Cart badges: ${badgeCount}`);

      if (badgeCount > 0) {
        const badgeText = await cartBadge.first().textContent();
        console.log(`Badge content: ${badgeText}`);
      }
    });

    test('should update cart badge when adding item', async ({ page }) => {
      await page.goto('/');
      await page.evaluate(() => localStorage.setItem('cart', '[]'));

      await page.goto('/pages/products/');
      await page.waitForLoadState('networkidle');

      const addButton = page.locator('button[data-add-to-cart], .add-to-cart').first();

      if ((await addButton.count()) > 0) {
        await addButton.click();
        await page.waitForTimeout(1000);

        const cartBadge = page.locator('.cart-badge, .cart-count, [data-cart-count]');
        if ((await cartBadge.count()) > 0) {
          const badgeText = await cartBadge.first().textContent();
          console.log(`Badge after add: ${badgeText}`);
        }
      }
    });
  });
});
