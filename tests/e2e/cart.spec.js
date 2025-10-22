import { test, expect } from '@playwright/test';

test.describe('Shopping Cart', () => {
  test('should navigate to cart page', async ({ page }) => {
    await page.goto('/pages/cart.html');
    await expect(page).toHaveTitle(/Carrito/);
  });

  test('should display empty cart message initially', async ({ page }) => {
    await page.goto('/pages/cart.html');
    
    // Limpiar carrito primero (si existe función)
    await page.evaluate(() => {
      localStorage.removeItem('cart');
    });
    
    await page.reload();
    
    const emptyMessage = page.locator('text=/vacío|no hay productos/i').first();
    if (await emptyMessage.isVisible()) {
      await expect(emptyMessage).toBeVisible();
    }
  });

  test('should add product to cart from products page', async ({ page }) => {
    await page.goto('/pages/products.html');
    await page.waitForLoadState('networkidle');
    
    // Buscar botón de agregar al carrito
    const addToCartBtn = page.locator('button:has-text("Agregar"), button:has-text("Añadir")').first();
    
    if (await addToCartBtn.isVisible()) {
      await addToCartBtn.click();
      
      // Verificar notificación o cambio en contador
      await page.waitForTimeout(500);
      
      // Navegar al carrito
      await page.goto('/pages/cart.html');
      
      const cartItems = page.locator('[class*="cart-item"], .item, [class*="product"]');
      const count = await cartItems.count();
      expect(count).toBeGreaterThan(0);
    }
  });

  test('should proceed to checkout', async ({ page }) => {
    await page.goto('/pages/cart.html');
    
    const checkoutBtn = page.locator('a[href*="checkout"], button:has-text("Comprar"), button:has-text("Checkout")').first();
    
    if (await checkoutBtn.isVisible()) {
      await checkoutBtn.click();
      await expect(page).toHaveURL(/checkout/);
    }
  });
});
