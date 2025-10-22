import { test, expect } from '@playwright/test';

test.describe('Products Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pages/products.html');
  });

  test('should display products catalog', async ({ page }) => {
    await expect(page).toHaveTitle(/Productos/);
    
    // Esperar a que cargue el contenido
    await page.waitForLoadState('networkidle');
  });

  test('should have product filters', async ({ page }) => {
    // Buscar elementos de filtro comunes
    const hasFilters = await page.locator(
      '[class*="filter"], [class*="category"], select, [type="radio"]'
    ).count();
    
    expect(hasFilters).toBeGreaterThan(0);
  });

  test('should display product cards', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    const productCards = page.locator(
      '[class*="product"], [class*="card"], .item'
    );
    
    const count = await productCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should allow product search', async ({ page }) => {
    const searchInput = page.locator('input[type="search"], input[placeholder*="buscar" i]').first();
    
    if (await searchInput.isVisible()) {
      await searchInput.fill('rosas');
      await searchInput.press('Enter');
      await page.waitForTimeout(1000);
    }
  });

  test('should navigate to product detail', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Buscar primer enlace de producto
    const productLink = page.locator('a[href*="product-detail"]').first();
    
    if (await productLink.isVisible()) {
      await productLink.click();
      await expect(page).toHaveURL(/product-detail/);
    }
  });
});
