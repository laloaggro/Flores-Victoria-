import { test, expect } from '@playwright/test';

test.describe('Contact Form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pages/contact.html');
  });

  test('should display contact form', async ({ page }) => {
    await expect(page).toHaveTitle(/Contacto/);

    const form = page.locator('form').first();
    await expect(form).toBeVisible();
  });

  test('should have required form fields', async ({ page }) => {
    await expect(page.locator('input[name*="name" i], input[type="text"]').first()).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('textarea, input[name*="message" i]').first()).toBeVisible();
  });

  test('should validate email field', async ({ page }) => {
    const emailInput = page.locator('input[type="email"]');
    await emailInput.fill('invalid-email');

    const submitBtn = page.locator('button[type="submit"], input[type="submit"]').first();
    await submitBtn.click();

    // Verificar validación HTML5
    const isValid = await emailInput.evaluate((el) => el.validity.valid);
    expect(isValid).toBe(false);
  });

  test('should submit form with valid data', async ({ page }) => {
    await page.locator('input[name*="name" i], input[type="text"]').first().fill('Juan Pérez');
    await page.locator('input[type="email"]').fill('juan@example.com');
    await page.locator('textarea, input[name*="message" i]').first().fill('Consulta de prueba');

    const submitBtn = page.locator('button[type="submit"], input[type="submit"]').first();
    await submitBtn.click();

    // Esperar respuesta (puede ser mensaje de éxito o redirección)
    await page.waitForTimeout(2000);
  });

  test('should display contact information', async ({ page }) => {
    // Buscar información de contacto (teléfono, email, dirección)
    const contactInfo = await page.locator('text=/\\+56|@|santiago/i').count();
    expect(contactInfo).toBeGreaterThan(0);
  });
});
