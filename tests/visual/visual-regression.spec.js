const { test, expect } = require('@playwright/test');
const percySnapshot = require('@percy/playwright');

test.describe('Visual Regression Tests - Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
  });

  test('Homepage - Desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await percySnapshot(page, 'Homepage - Desktop 1920x1080');
  });

  test('Homepage - Tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await percySnapshot(page, 'Homepage - Tablet 768x1024');
  });

  test('Homepage - Mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await percySnapshot(page, 'Homepage - Mobile 375x667');
  });

  test('Homepage - Scrolled Down', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, 1000));
    await page.waitForTimeout(500);
    await percySnapshot(page, 'Homepage - Scrolled');
  });
});

test.describe('Visual Regression Tests - Products', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/catalogo.html');
    await page.waitForLoadState('networkidle');
  });

  test('Products Page - Desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await percySnapshot(page, 'Products - Desktop');
  });

  test('Products Page - Mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await percySnapshot(page, 'Products - Mobile');
  });

  test('Products - Filter Applied', async ({ page }) => {
    // Simular aplicación de filtro
    const filterButton = page.locator('button:has-text("Filtrar")').first();
    if (await filterButton.isVisible()) {
      await filterButton.click();
      await page.waitForTimeout(500);
    }
    await percySnapshot(page, 'Products - Filtered');
  });
});

test.describe('Visual Regression Tests - Cart', () => {
  test('Cart - Empty', async ({ page }) => {
    await page.goto('http://localhost:5173/carrito.html');
    await page.waitForLoadState('networkidle');
    await percySnapshot(page, 'Cart - Empty State');
  });

  test('Cart - With Items', async ({ page }) => {
    // Agregar items al carrito primero
    await page.goto('http://localhost:5173/catalogo.html');
    const addButton = page.locator('button:has-text("Agregar")').first();
    if (await addButton.isVisible()) {
      await addButton.click();
      await page.waitForTimeout(500);
    }
    
    await page.goto('http://localhost:5173/carrito.html');
    await page.waitForLoadState('networkidle');
    await percySnapshot(page, 'Cart - With Items');
  });
});

test.describe('Visual Regression Tests - Contact', () => {
  test('Contact Form - Desktop', async ({ page }) => {
    await page.goto('http://localhost:5173/contacto.html');
    await page.waitForLoadState('networkidle');
    await page.setViewportSize({ width: 1920, height: 1080 });
    await percySnapshot(page, 'Contact - Desktop');
  });

  test('Contact Form - Mobile', async ({ page }) => {
    await page.goto('http://localhost:5173/contacto.html');
    await page.waitForLoadState('networkidle');
    await page.setViewportSize({ width: 375, height: 667 });
    await percySnapshot(page, 'Contact - Mobile');
  });

  test('Contact Form - Filled', async ({ page }) => {
    await page.goto('http://localhost:5173/contacto.html');
    await page.waitForLoadState('networkidle');
    
    // Llenar formulario
    await page.fill('input[name="name"]', 'Juan Pérez');
    await page.fill('input[name="email"]', 'juan@example.com');
    await page.fill('textarea[name="message"]', 'Este es un mensaje de prueba');
    
    await percySnapshot(page, 'Contact - Form Filled');
  });
});

test.describe('Visual Regression Tests - Storybook', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:6006');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
  });

  test('Storybook - Button Component', async ({ page }) => {
    // Navegar a Button stories
    const buttonLink = page.locator('a:has-text("Button")').first();
    if (await buttonLink.isVisible()) {
      await buttonLink.click();
      await page.waitForTimeout(500);
      await percySnapshot(page, 'Storybook - Button');
    }
  });

  test('Storybook - ProductCard Component', async ({ page }) => {
    const cardLink = page.locator('a:has-text("ProductCard")').first();
    if (await cardLink.isVisible()) {
      await cardLink.click();
      await page.waitForTimeout(500);
      await percySnapshot(page, 'Storybook - ProductCard');
    }
  });

  test('Storybook - Form Component', async ({ page }) => {
    const formLink = page.locator('a:has-text("Form")').first();
    if (await formLink.isVisible()) {
      await formLink.click();
      await page.waitForTimeout(500);
      await percySnapshot(page, 'Storybook - Form');
    }
  });
});
