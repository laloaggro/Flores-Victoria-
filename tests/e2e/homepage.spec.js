import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the page title', async ({ page }) => {
    await expect(page).toHaveTitle(/Arreglos Victoria/);
  });

  test('should have main navigation', async ({ page }) => {
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
    
    // Verificar enlaces principales
    await expect(page.getByRole('link', { name: /inicio/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /productos/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /contacto/i })).toBeVisible();
  });

  test('should have hero section', async ({ page }) => {
    const hero = page.locator('.hero, [class*="hero"]').first();
    await expect(hero).toBeVisible();
  });

  test('should load logo', async ({ page }) => {
    const logo = page.locator('img[alt*="logo" i], img[alt*="victoria" i]').first();
    await expect(logo).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('body')).toBeVisible();
  });
});
