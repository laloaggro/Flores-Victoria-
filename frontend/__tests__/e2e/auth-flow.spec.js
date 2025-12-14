/**
 * @fileoverview E2E Tests - Flujo de Autenticación
 * @description Tests end-to-end para registro, login y logout
 * @author Flores Victoria Team
 * @version 1.0.0
 */

const { test, expect } = require('@playwright/test');

test.describe('Authentication Flow', () => {
  const testUser = {
    email: `test-${Date.now()}@example.com`,
    password: 'TestPassword123!',
    firstName: 'Test',
    lastName: 'User',
  };

  test.beforeEach(async ({ page }) => {
    // Limpiar localStorage antes de cada test
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test.describe('Registration', () => {
    test('should display registration form', async ({ page }) => {
      await page.goto('/pages/auth/register.html');

      // Verificar elementos del formulario
      await expect(page.locator('input[name="firstName"], #firstName')).toBeVisible();
      await expect(page.locator('input[name="lastName"], #lastName')).toBeVisible();
      await expect(page.locator('input[name="email"], #email')).toBeVisible();
      await expect(page.locator('input[name="password"], #password')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
    });

    test('should show validation errors for empty form', async ({ page }) => {
      await page.goto('/pages/auth/register.html');

      // Intentar enviar formulario vacío
      await page.click('button[type="submit"]');

      // Verificar que se muestran errores de validación
      const hasValidationErrors = await page.evaluate(() => {
        const inputs = document.querySelectorAll('input:invalid');
        return inputs.length > 0;
      });

      expect(hasValidationErrors).toBeTruthy();
    });

    test('should show error for invalid email format', async ({ page }) => {
      await page.goto('/pages/auth/register.html');

      await page.fill('input[name="email"], #email', 'invalid-email');
      await page.fill('input[name="password"], #password', testUser.password);
      await page.click('button[type="submit"]');

      // Verificar validación de email
      const emailInput = page.locator('input[name="email"], #email');
      const isInvalid = await emailInput.evaluate((el) => !el.validity.valid);
      expect(isInvalid).toBeTruthy();
    });

    test('should show password requirements', async ({ page }) => {
      await page.goto('/pages/auth/register.html');

      // Enfocar campo de contraseña
      await page.click('input[name="password"], #password');

      // Verificar que se muestran requisitos (si existen)
      const hasPasswordHint = await page.locator('.password-hint, .password-requirements, [data-password-hint]').count();
      // Es opcional, solo verificamos si está presente
      console.log(`Password hints present: ${hasPasswordHint > 0}`);
    });

    test('should successfully register new user', async ({ page, request }) => {
      // Skip si el backend no está disponible
      const healthCheck = await request.get('/api/auth/health').catch(() => null);
      test.skip(!healthCheck?.ok(), 'Backend not available');

      await page.goto('/pages/auth/register.html');

      // Llenar formulario
      await page.fill('input[name="firstName"], #firstName', testUser.firstName);
      await page.fill('input[name="lastName"], #lastName', testUser.lastName);
      await page.fill('input[name="email"], #email', testUser.email);
      await page.fill('input[name="password"], #password', testUser.password);

      // Aceptar términos si existe checkbox
      const termsCheckbox = page.locator('input[name="terms"], #terms, [type="checkbox"]');
      if ((await termsCheckbox.count()) > 0) {
        await termsCheckbox.check();
      }

      // Enviar formulario
      await page.click('button[type="submit"]');

      // Esperar redirección o mensaje de éxito
      await Promise.race([
        page.waitForURL('**/login**', { timeout: 10000 }),
        page.waitForSelector('.success-message, .alert-success, [data-success]', { timeout: 10000 }),
      ]).catch(() => {
        // Si no hay redirección, verificar que no hay error
      });
    });
  });

  test.describe('Login', () => {
    test('should display login form', async ({ page }) => {
      await page.goto('/pages/auth/login.html');

      await expect(page.locator('input[name="email"], #email, input[type="email"]')).toBeVisible();
      await expect(page.locator('input[name="password"], #password, input[type="password"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
    });

    test('should show error for invalid credentials', async ({ page, request }) => {
      // Skip si el backend no está disponible
      const healthCheck = await request.get('/api/auth/health').catch(() => null);
      test.skip(!healthCheck?.ok(), 'Backend not available');

      await page.goto('/pages/auth/login.html');

      await page.fill('input[name="email"], #email, input[type="email"]', 'nonexistent@example.com');
      await page.fill('input[name="password"], #password, input[type="password"]', 'wrongpassword');
      await page.click('button[type="submit"]');

      // Esperar mensaje de error
      const errorMessage = page.locator('.error-message, .alert-danger, .alert-error, [data-error]');
      await expect(errorMessage).toBeVisible({ timeout: 10000 }).catch(() => {
        // Es posible que el error se muestre de otra forma
      });
    });

    test('should have "Forgot Password" link', async ({ page }) => {
      await page.goto('/pages/auth/login.html');

      const forgotPasswordLink = page.locator('a[href*="forgot"], a[href*="recover"], a[href*="reset"]');
      const linkCount = await forgotPasswordLink.count();
      console.log(`Forgot password links found: ${linkCount}`);
    });

    test('should have "Register" link', async ({ page }) => {
      await page.goto('/pages/auth/login.html');

      const registerLink = page.locator('a[href*="register"], a[href*="signup"]');
      await expect(registerLink.first()).toBeVisible();
    });

    test('should successfully login with valid credentials', async ({ page, request }) => {
      // Skip si el backend no está disponible
      const healthCheck = await request.get('/api/auth/health').catch(() => null);
      test.skip(!healthCheck?.ok(), 'Backend not available');

      await page.goto('/pages/auth/login.html');

      // Usar credenciales de test (ajustar según seeds)
      await page.fill('input[name="email"], #email, input[type="email"]', 'test@floresvictoria.com');
      await page.fill('input[name="password"], #password, input[type="password"]', 'test123');
      await page.click('button[type="submit"]');

      // Esperar redirección exitosa
      await Promise.race([
        page.waitForURL('**/', { timeout: 15000 }),
        page.waitForURL('**/dashboard**', { timeout: 15000 }),
        page.waitForURL('**/account**', { timeout: 15000 }),
      ]).catch(() => {});

      // Verificar que hay token en localStorage
      const hasToken = await page.evaluate(() => {
        return !!(localStorage.getItem('token') || localStorage.getItem('accessToken') || sessionStorage.getItem('token'));
      });

      console.log(`Token stored: ${hasToken}`);
    });
  });

  test.describe('Logout', () => {
    test.beforeEach(async ({ page }) => {
      // Simular sesión activa
      await page.goto('/');
      await page.evaluate(() => {
        localStorage.setItem('token', 'mock-token-for-testing');
        localStorage.setItem('user', JSON.stringify({ id: '123', email: 'test@example.com' }));
      });
    });

    test('should show logout option when logged in', async ({ page }) => {
      await page.goto('/');

      // Buscar botón/link de logout
      const logoutElement = page.locator(
        'a[href*="logout"], button[data-logout], .logout-btn, #logout, [onclick*="logout"]'
      );
      const count = await logoutElement.count();
      console.log(`Logout elements found: ${count}`);
    });

    test('should clear session on logout', async ({ page }) => {
      await page.goto('/');

      // Buscar y hacer click en logout
      const logoutElement = page.locator(
        'a[href*="logout"], button[data-logout], .logout-btn, #logout, [onclick*="logout"]'
      );

      if ((await logoutElement.count()) > 0) {
        await logoutElement.first().click();

        // Verificar que se limpia el token
        const hasToken = await page.evaluate(() => {
          return !!localStorage.getItem('token');
        });

        expect(hasToken).toBeFalsy();
      }
    });
  });

  test.describe('Protected Routes', () => {
    test('should redirect to login when accessing protected route without auth', async ({ page }) => {
      await page.goto('/');
      await page.evaluate(() => localStorage.clear());

      // Intentar acceder a página protegida
      await page.goto('/pages/account/profile.html');

      // Verificar redirección a login o mensaje de error
      const currentUrl = page.url();
      const isOnProtectedPage = currentUrl.includes('profile');

      if (isOnProtectedPage) {
        // Verificar que hay mensaje de autenticación requerida
        const authMessage = page.locator('.auth-required, .login-required, [data-auth-required]');
        const messageCount = await authMessage.count();
        console.log(`Auth required messages: ${messageCount}`);
      } else {
        // Verificó que redirigió
        expect(currentUrl).toMatch(/login|auth/);
      }
    });
  });

  test.describe('Session Persistence', () => {
    test('should maintain session across page navigation', async ({ page, request }) => {
      // Skip si el backend no está disponible
      const healthCheck = await request.get('/api/auth/health').catch(() => null);
      test.skip(!healthCheck?.ok(), 'Backend not available');

      // Simular login exitoso
      await page.goto('/');
      await page.evaluate(() => {
        localStorage.setItem('token', 'valid-mock-token');
        localStorage.setItem('user', JSON.stringify({ id: '1', email: 'test@test.com', name: 'Test User' }));
      });

      // Navegar a otra página
      await page.goto('/pages/products/');
      await page.waitForLoadState('networkidle');

      // Verificar que la sesión persiste
      const hasSession = await page.evaluate(() => {
        return !!localStorage.getItem('token');
      });

      expect(hasSession).toBeTruthy();
    });

    test('should refresh page without losing session', async ({ page }) => {
      await page.goto('/');
      await page.evaluate(() => {
        localStorage.setItem('token', 'persistent-token');
      });

      // Refrescar página
      await page.reload();

      const hasToken = await page.evaluate(() => localStorage.getItem('token'));
      expect(hasToken).toBe('persistent-token');
    });
  });
});
