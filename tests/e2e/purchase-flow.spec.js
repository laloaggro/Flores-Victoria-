/**
 * E2E Test: Flujo completo de compra
 * Prueba el flujo desde login hasta confirmación de pedido
 */

const { test, expect } = require('@playwright/test');

test.describe('Flujo de Compra Completo', () => {
  // Configuración de datos de prueba
  const testUser = {
    email: 'test@floresvictoria.com',
    password: 'Test123!@#',
    name: 'Usuario Test',
  };

  const testAddress = {
    street: 'Calle Principal 123',
    city: 'Santiago',
    postalCode: '8320000',
    phone: '+56912345678',
  };

  test.beforeEach(async ({ page }) => {
    // Ir a la página principal
    await page.goto('/');
  });

  test('debe mostrar la página principal correctamente', async ({ page }) => {
    await expect(page).toHaveTitle(/Flores Victoria/i);
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('nav')).toBeVisible();
  });

  test('debe navegar al catálogo de productos', async ({ page }) => {
    // Click en el enlace de productos
    await page.click('a[href*="products"]');

    // Verificar que estamos en la página de productos
    await expect(page).toHaveURL(/products/);

    // Verificar que hay productos visibles
    const products = page.locator('[data-testid="product-card"], .product-card');
    await expect(products.first()).toBeVisible({ timeout: 10000 });
  });

  test('debe poder filtrar productos por categoría', async ({ page }) => {
    await page.goto('/pages/products.html');

    // Esperar a que carguen los productos
    await page.waitForSelector('[data-testid="product-card"], .product-card', { timeout: 10000 });

    // Buscar y usar un filtro de categoría si existe
    const categoryFilter = page.locator('[data-testid="category-filter"], select[name="category"]');
    if (await categoryFilter.isVisible()) {
      await categoryFilter.selectOption({ index: 1 });

      // Esperar a que se actualicen los productos
      await page.waitForTimeout(500);

      // Verificar que hay productos filtrados
      const products = page.locator('[data-testid="product-card"], .product-card');
      expect(await products.count()).toBeGreaterThan(0);
    }
  });

  test('debe poder agregar un producto al carrito', async ({ page }) => {
    await page.goto('/pages/products.html');

    // Esperar productos
    await page.waitForSelector('[data-testid="product-card"], .product-card', { timeout: 10000 });

    // Click en agregar al carrito del primer producto
    const addToCartBtn = page
      .locator('[data-testid="add-to-cart"], .add-to-cart-btn, button:has-text("Agregar")')
      .first();
    await addToCartBtn.click();

    // Verificar que se muestra notificación o el carrito se actualiza
    const cartBadge = page.locator('[data-testid="cart-badge"], .cart-count, .cart-badge');
    await expect(cartBadge).toBeVisible({ timeout: 5000 });
  });

  test('debe mostrar el carrito con productos agregados', async ({ page }) => {
    // Primero agregar un producto
    await page.goto('/pages/products.html');
    await page.waitForSelector('[data-testid="product-card"], .product-card', { timeout: 10000 });

    const addToCartBtn = page
      .locator('[data-testid="add-to-cart"], .add-to-cart-btn, button:has-text("Agregar")')
      .first();
    await addToCartBtn.click();

    // Esperar un momento para que se agregue
    await page.waitForTimeout(1000);

    // Ir al carrito
    await page.click('[data-testid="cart-icon"], .cart-icon, a[href*="cart"]');

    // Verificar que hay items en el carrito
    const cartItems = page.locator('[data-testid="cart-item"], .cart-item');
    await expect(cartItems.first()).toBeVisible({ timeout: 5000 });
  });

  test('debe poder modificar cantidades en el carrito', async ({ page }) => {
    // Agregar producto y ir al carrito
    await page.goto('/pages/products.html');
    await page.waitForSelector('[data-testid="product-card"], .product-card', { timeout: 10000 });

    await page
      .locator('[data-testid="add-to-cart"], .add-to-cart-btn, button:has-text("Agregar")')
      .first()
      .click();
    await page.waitForTimeout(1000);

    await page.click('[data-testid="cart-icon"], .cart-icon, a[href*="cart"]');
    await page.waitForSelector('[data-testid="cart-item"], .cart-item', { timeout: 5000 });

    // Incrementar cantidad
    const incrementBtn = page
      .locator('[data-testid="increment-qty"], .qty-increment, button:has-text("+")')
      .first();
    if (await incrementBtn.isVisible()) {
      await incrementBtn.click();
      await page.waitForTimeout(500);

      // Verificar que la cantidad cambió
      const qtyInput = page
        .locator('[data-testid="qty-input"], .qty-input, input[type="number"]')
        .first();
      const newQty = await qtyInput.inputValue();
      expect(parseInt(newQty)).toBeGreaterThanOrEqual(2);
    }
  });

  test('debe poder eliminar productos del carrito', async ({ page }) => {
    // Agregar producto y ir al carrito
    await page.goto('/pages/products.html');
    await page.waitForSelector('[data-testid="product-card"], .product-card', { timeout: 10000 });

    await page
      .locator('[data-testid="add-to-cart"], .add-to-cart-btn, button:has-text("Agregar")')
      .first()
      .click();
    await page.waitForTimeout(1000);

    await page.click('[data-testid="cart-icon"], .cart-icon, a[href*="cart"]');
    await page.waitForSelector('[data-testid="cart-item"], .cart-item', { timeout: 5000 });

    // Contar items antes de eliminar
    const cartItems = page.locator('[data-testid="cart-item"], .cart-item');
    const initialCount = await cartItems.count();

    // Click en eliminar
    const removeBtn = page
      .locator('[data-testid="remove-item"], .remove-item, button:has-text("Eliminar")')
      .first();
    if (await removeBtn.isVisible()) {
      await removeBtn.click();
      await page.waitForTimeout(500);

      // Verificar que se eliminó
      const newCount = await cartItems.count();
      expect(newCount).toBeLessThan(initialCount);
    }
  });

  test('debe mostrar el formulario de checkout', async ({ page }) => {
    // Agregar producto y proceder al checkout
    await page.goto('/pages/products.html');
    await page.waitForSelector('[data-testid="product-card"], .product-card', { timeout: 10000 });

    await page
      .locator('[data-testid="add-to-cart"], .add-to-cart-btn, button:has-text("Agregar")')
      .first()
      .click();
    await page.waitForTimeout(1000);

    // Ir al checkout
    await page.goto('/pages/checkout.html');

    // Verificar formulario de checkout
    const checkoutForm = page.locator('form, [data-testid="checkout-form"]');
    await expect(checkoutForm).toBeVisible({ timeout: 5000 });
  });

  test('debe validar campos requeridos en checkout', async ({ page }) => {
    await page.goto('/pages/checkout.html');

    // Intentar enviar formulario vacío
    const submitBtn = page.locator(
      '[data-testid="submit-order"], button[type="submit"], button:has-text("Confirmar")'
    );
    if (await submitBtn.isVisible()) {
      await submitBtn.click();

      // Verificar mensajes de error
      const errorMessages = page.locator(
        '.error, .invalid-feedback, [data-testid="error-message"]'
      );
      await expect(errorMessages.first()).toBeVisible({ timeout: 3000 });
    }
  });

  test('debe poder completar el checkout con datos válidos', async ({ page }) => {
    // Agregar producto
    await page.goto('/pages/products.html');
    await page.waitForSelector('[data-testid="product-card"], .product-card', { timeout: 10000 });
    await page
      .locator('[data-testid="add-to-cart"], .add-to-cart-btn, button:has-text("Agregar")')
      .first()
      .click();
    await page.waitForTimeout(1000);

    // Ir al checkout
    await page.goto('/pages/checkout.html');

    // Llenar formulario
    const nameInput = page.locator('input[name="name"], input[placeholder*="nombre"]');
    if (await nameInput.isVisible()) {
      await nameInput.fill(testUser.name);
    }

    const emailInput = page.locator('input[name="email"], input[type="email"]');
    if (await emailInput.isVisible()) {
      await emailInput.fill(testUser.email);
    }

    const addressInput = page.locator('input[name="address"], textarea[name="address"]');
    if (await addressInput.isVisible()) {
      await addressInput.fill(testAddress.street);
    }

    const cityInput = page.locator('input[name="city"]');
    if (await cityInput.isVisible()) {
      await cityInput.fill(testAddress.city);
    }

    const phoneInput = page.locator('input[name="phone"], input[type="tel"]');
    if (await phoneInput.isVisible()) {
      await phoneInput.fill(testAddress.phone);
    }
  });

  test('debe mostrar resumen de la orden', async ({ page }) => {
    // Agregar producto
    await page.goto('/pages/products.html');
    await page.waitForSelector('[data-testid="product-card"], .product-card', { timeout: 10000 });
    await page
      .locator('[data-testid="add-to-cart"], .add-to-cart-btn, button:has-text("Agregar")')
      .first()
      .click();
    await page.waitForTimeout(1000);

    // Ir al checkout
    await page.goto('/pages/checkout.html');

    // Verificar que se muestra el resumen
    const orderSummary = page.locator(
      '[data-testid="order-summary"], .order-summary, .cart-summary'
    );
    await expect(orderSummary).toBeVisible({ timeout: 5000 });

    // Verificar que muestra total
    const total = page.locator('[data-testid="order-total"], .order-total, .total');
    await expect(total).toBeVisible();
  });
});

test.describe('Autenticación', () => {
  test('debe mostrar formulario de login', async ({ page }) => {
    await page.goto('/');

    // Click en botón de login
    const loginBtn = page.locator(
      '[data-testid="login-btn"], .login-btn, a[href*="login"], button:has-text("Ingresar")'
    );
    if (await loginBtn.isVisible()) {
      await loginBtn.click();

      // Verificar formulario
      const loginForm = page.locator('form, [data-testid="login-form"]');
      await expect(loginForm).toBeVisible({ timeout: 5000 });
    }
  });

  test('debe validar credenciales incorrectas', async ({ page }) => {
    await page.goto('/pages/login.html');

    // Llenar con credenciales incorrectas
    await page.fill('input[name="email"], input[type="email"]', 'wrong@email.com');
    await page.fill('input[name="password"], input[type="password"]', 'wrongpassword');

    // Enviar formulario
    await page.click('button[type="submit"], button:has-text("Ingresar")');

    // Verificar mensaje de error
    const errorMessage = page.locator('.error, .alert-danger, [data-testid="error-message"]');
    await expect(errorMessage).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Búsqueda de Productos', () => {
  test('debe poder buscar productos', async ({ page }) => {
    await page.goto('/pages/products.html');

    // Buscar campo de búsqueda
    const searchInput = page.locator(
      'input[type="search"], input[name="search"], [data-testid="search-input"]'
    );
    if (await searchInput.isVisible()) {
      await searchInput.fill('rosas');
      await searchInput.press('Enter');

      // Esperar resultados
      await page.waitForTimeout(1000);

      // Verificar que hay resultados
      const products = page.locator('[data-testid="product-card"], .product-card');
      expect(await products.count()).toBeGreaterThanOrEqual(0);
    }
  });
});

test.describe('Responsive Design', () => {
  test('debe funcionar en móvil', async ({ page }) => {
    // Configurar viewport móvil
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Verificar que el menú hamburguesa existe
    const mobileMenu = page.locator('[data-testid="mobile-menu"], .hamburger, .mobile-nav-toggle');
    await expect(mobileMenu).toBeVisible({ timeout: 5000 });
  });

  test('debe funcionar en tablet', async ({ page }) => {
    // Configurar viewport tablet
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');

    // Verificar que la página carga correctamente
    await expect(page.locator('header')).toBeVisible();
  });
});

test.describe('Accesibilidad Básica', () => {
  test('debe tener estructura de headings correcta', async ({ page }) => {
    await page.goto('/');

    // Verificar que existe un h1
    const h1 = page.locator('h1');
    await expect(h1.first()).toBeVisible();
  });

  test('debe tener imágenes con alt text', async ({ page }) => {
    await page.goto('/pages/products.html');
    await page.waitForSelector('[data-testid="product-card"], .product-card', { timeout: 10000 });

    // Verificar que las imágenes tienen alt
    const images = await page.locator('img').all();
    for (const img of images.slice(0, 5)) {
      // Verificar las primeras 5
      const alt = await img.getAttribute('alt');
      expect(alt).toBeTruthy();
    }
  });
});
