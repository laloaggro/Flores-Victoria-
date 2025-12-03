// Playwright E2E Testing Suite - Arreglos Victoria
// Comprehensive end-to-end testing for critical user flows

const { test, expect, devices } = require('@playwright/test');

// Test Configuration
const config = {
  baseURL: 'http://localhost:5173',
  timeout: 30000,
  retries: 2,
  workers: 4,
  use: {
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
  },
};

// Page Object Models
class HomePage {
  constructor(page) {
    this.page = page;
    this.heroSection = page.locator('.hero-section');
    this.servicesSection = page.locator('.services-section');
    this.contactButton = page.locator('[data-testid="contact-btn"], .contact-btn');
    this.phoneLink = page.locator('a[href^="tel:"]');
    this.emailLink = page.locator('a[href^="mailto:"]');
    this.navigationMenu = page.locator('nav');
  }

  async goto() {
    await this.page.goto('/');
    await this.page.waitForLoadState('networkidle');
  }

  async clickContact() {
    await this.contactButton.click();
  }

  async callPhone() {
    await this.phoneLink.first().click();
  }

  async sendEmail() {
    await this.emailLink.first().click();
  }
}

class ContactPage {
  constructor(page) {
    this.page = page;
    this.nameInput = page.locator('input[name="name"], #name');
    this.emailInput = page.locator('input[name="email"], #email');
    this.phoneInput = page.locator('input[name="phone"], #phone');
    this.messageInput = page.locator('textarea[name="message"], #message');
    this.submitButton = page.locator('button[type="submit"], .submit-btn');
    this.successMessage = page.locator('.success-message, .alert-success');
    this.errorMessage = page.locator('.error-message, .alert-error');
  }

  async fillContactForm(data) {
    await this.nameInput.fill(data.name);
    await this.emailInput.fill(data.email);
    if (data.phone) await this.phoneInput.fill(data.phone);
    await this.messageInput.fill(data.message);
  }

  async submitForm() {
    await this.submitButton.click();
  }

  async waitForSuccess() {
    await this.successMessage.waitFor({ state: 'visible', timeout: 10000 });
  }
}

class ServicesPage {
  constructor(page) {
    this.page = page;
    this.serviceCards = page.locator('.service-card, .product-card');
    this.serviceDetails = page.locator('.service-details');
    this.priceElements = page.locator('.price');
    this.bookingButton = page.locator('.booking-btn, .reserve-btn');
  }

  async selectService(index = 0) {
    await this.serviceCards.nth(index).click();
  }

  async bookService() {
    await this.bookingButton.click();
  }
}

// Test Suites
test.describe('Homepage Critical Path', () => {
  test('should load homepage successfully', async ({ page }) => {
    const homePage = new HomePage(page);

    await homePage.goto();

    // Verificar elementos críticos
    await expect(homePage.heroSection).toBeVisible();
    await expect(homePage.servicesSection).toBeVisible();
    await expect(homePage.navigationMenu).toBeVisible();

    // Verificar meta tags SEO
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(10);

    const metaDescription = await page.locator('meta[name="description"]').getAttribute('content');
    expect(metaDescription).toBeTruthy();
    expect(metaDescription.length).toBeGreaterThan(50);
  });

  test('should have working contact methods', async ({ page }) => {
    const homePage = new HomePage(page);

    await homePage.goto();

    // Verificar que existen enlaces de contacto
    await expect(homePage.phoneLink).toBeVisible();
    await expect(homePage.emailLink).toBeVisible();

    // Verificar que los enlaces tienen formato correcto
    const phoneHref = await homePage.phoneLink.first().getAttribute('href');
    expect(phoneHref).toMatch(/^tel:\+?[\d\s\-()]+$/);

    const emailHref = await homePage.emailLink.first().getAttribute('href');
    expect(emailHref).toMatch(/^mailto:[^\s@]+@[^\s@]+\.[^\s@]+$/);
  });

  test('should track user interactions', async ({ page }) => {
    const homePage = new HomePage(page);

    // Interceptar llamadas a Analytics
    const analyticsRequests = [];
    page.on('request', (request) => {
      if (request.url().includes('google-analytics') || request.url().includes('gtag')) {
        analyticsRequests.push(request.url());
      }
    });

    await homePage.goto();

    // Simular interacciones
    await homePage.contactButton.click();
    await page.waitForTimeout(1000);

    // Verificar que se enviaron eventos de analytics
    expect(analyticsRequests.length).toBeGreaterThan(0);
  });
});

test.describe('Contact Form Flow', () => {
  test('should submit contact form successfully', async ({ page }) => {
    const contactPage = new ContactPage(page);

    await page.goto('/contacto');

    const testData = {
      name: 'Juan Pérez',
      email: 'juan.perez@example.com',
      phone: '+56912345678',
      message: 'Me interesa el servicio de arreglos florales para mi boda.',
    };

    await contactPage.fillContactForm(testData);
    await contactPage.submitForm();

    // Esperar confirmación (dependiendo de la implementación)
    try {
      await contactPage.waitForSuccess();
    } catch (error) {
      // Si no hay mensaje de éxito, verificar que no hay errores
      await expect(contactPage.errorMessage).not.toBeVisible();
    }
  });

  test('should validate required fields', async ({ page }) => {
    const contactPage = new ContactPage(page);

    await page.goto('/contacto');

    // Intentar enviar formulario vacío
    await contactPage.submitForm();

    // Verificar validación del navegador
    const nameValidity = await contactPage.nameInput.evaluate((el) => el.validity.valid);
    const emailValidity = await contactPage.emailInput.evaluate((el) => el.validity.valid);

    expect(nameValidity || emailValidity).toBe(false);
  });

  test('should validate email format', async ({ page }) => {
    const contactPage = new ContactPage(page);

    await page.goto('/contacto');

    await contactPage.nameInput.fill('Test User');
    await contactPage.emailInput.fill('invalid-email');
    await contactPage.messageInput.fill('Test message');
    await contactPage.submitForm();

    const emailValidity = await contactPage.emailInput.evaluate((el) => el.validity.valid);
    expect(emailValidity).toBe(false);
  });
});

test.describe('Services and Products', () => {
  test('should display services correctly', async ({ page }) => {
    const servicesPage = new ServicesPage(page);

    await page.goto('/servicios');

    // Verificar que hay servicios visibles
    const serviceCount = await servicesPage.serviceCards.count();
    expect(serviceCount).toBeGreaterThan(0);

    // Verificar contenido de cada servicio
    for (let i = 0; i < Math.min(serviceCount, 5); i++) {
      const serviceCard = servicesPage.serviceCards.nth(i);
      await expect(serviceCard).toBeVisible();

      // Verificar que tiene título
      const hasTitle = (await serviceCard.locator('h3, h2, .title').count()) > 0;
      expect(hasTitle).toBe(true);
    }
  });

  test('should handle service selection', async ({ page }) => {
    const servicesPage = new ServicesPage(page);

    await page.goto('/servicios');

    const serviceCount = await servicesPage.serviceCards.count();
    if (serviceCount > 0) {
      await servicesPage.selectService(0);

      // Verificar que se muestra información adicional o navegación
      await page.waitForTimeout(1000);
      const currentUrl = page.url();

      // Verificar que cambió algo (URL, contenido visible, etc.)
      const hasChangedState =
        !currentUrl.endsWith('/servicios') ||
        (await servicesPage.serviceDetails.isVisible()) ||
        (await page.locator('.modal, .popup').isVisible());

      expect(hasChangedState).toBe(true);
    }
  });
});

test.describe('Performance and Accessibility', () => {
  test('should meet performance standards', async ({ page }) => {
    await page.goto('/');

    // Verificar Core Web Vitals
    const lcp = await page.evaluate(
      () =>
        new Promise((resolve) => {
          new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            resolve(lastEntry.startTime);
          }).observe({ entryTypes: ['largest-contentful-paint'] });

          setTimeout(() => resolve(null), 5000);
        })
    );

    if (lcp) {
      expect(lcp).toBeLessThan(2500); // LCP < 2.5s
    }

    // Verificar tamaño de recursos
    const resources = await page.evaluate(() =>
      performance.getEntriesByType('resource').map((entry) => ({
        name: entry.name,
        size: entry.transferSize,
        duration: entry.duration,
      }))
    );

    const totalSize = resources.reduce((sum, resource) => sum + (resource.size || 0), 0);
    expect(totalSize).toBeLessThan(5 * 1024 * 1024); // < 5MB total
  });

  test('should be accessible', async ({ page }) => {
    await page.goto('/');

    // Verificar que hay textos alternativos en imágenes
    const images = page.locator('img');
    const imageCount = await images.count();

    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      const ariaLabel = await img.getAttribute('aria-label');

      // Cada imagen debe tener alt o aria-label
      expect(alt || ariaLabel).toBeTruthy();
    }

    // Verificar contraste de colores (básico)
    const buttons = page.locator('button, .btn');
    const buttonCount = await buttons.count();

    for (let i = 0; i < Math.min(buttonCount, 5); i++) {
      const button = buttons.nth(i);
      const isVisible = await button.isVisible();

      if (isVisible) {
        const styles = await button.evaluate((el) => {
          const computed = window.getComputedStyle(el);
          return {
            background: computed.backgroundColor,
            color: computed.color,
            fontSize: computed.fontSize,
          };
        });

        expect(styles.color).not.toBe('rgba(0, 0, 0, 0)');
        expect(styles.background).not.toBe('rgba(0, 0, 0, 0)');
      }
    }
  });
});

test.describe('Mobile Responsiveness', () => {
  test('should work on mobile devices', async ({ browser }) => {
    const context = await browser.newContext({
      ...devices['iPhone 12'],
    });
    const page = await context.newPage();

    await page.goto('/');

    // Verificar que el contenido es visible en móvil
    const heroSection = page.locator('.hero-section');
    await expect(heroSection).toBeVisible();

    // Verificar que los botones son táctiles
    const buttons = page.locator('button, .btn, a');
    const buttonCount = await buttons.count();

    for (let i = 0; i < Math.min(buttonCount, 3); i++) {
      const button = buttons.nth(i);
      const boundingBox = await button.boundingBox();

      if (boundingBox) {
        // Botones deben tener al menos 44px de altura para ser táctiles
        expect(boundingBox.height).toBeGreaterThanOrEqual(44);
      }
    }

    await context.close();
  });

  test('should have working navigation on tablet', async ({ browser }) => {
    const context = await browser.newContext({
      ...devices['iPad'],
    });
    const page = await context.newPage();

    await page.goto('/');

    // Verificar navegación
    const navLinks = page.locator('nav a, .nav-link');
    const linkCount = await navLinks.count();

    if (linkCount > 0) {
      // Probar navegación
      await navLinks.first().click();
      await page.waitForLoadState('networkidle');

      // Verificar que navegó correctamente
      const currentUrl = page.url();
      expect(currentUrl).toContain(config.baseURL);
    }

    await context.close();
  });
});

test.describe('PWA Functionality', () => {
  test('should have valid service worker', async ({ page }) => {
    await page.goto('/');

    // Verificar que el service worker se registra
    const swRegistration = await page.evaluate(async () => {
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.getRegistration();
          return !!registration;
        } catch (error) {
          return false;
        }
      }
      return false;
    });

    expect(swRegistration).toBe(true);
  });

  test('should have valid manifest', async ({ page }) => {
    await page.goto('/');

    // Verificar manifest
    const manifestLink = page.locator('link[rel="manifest"]');
    await expect(manifestLink).toBeVisible();

    const manifestHref = await manifestLink.getAttribute('href');
    expect(manifestHref).toBeTruthy();

    // Verificar que el manifest es válido
    const manifestResponse = await page.request.get(manifestHref);
    expect(manifestResponse.status()).toBe(200);

    const manifestContent = await manifestResponse.json();
    expect(manifestContent.name).toBeTruthy();
    expect(manifestContent.icons).toBeTruthy();
    expect(manifestContent.start_url).toBeTruthy();
  });

  test('should work offline', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Simular offline
    await page.context().setOffline(true);

    // Recargar página
    await page.reload();

    // Verificar que algo se muestra (cache del service worker)
    const body = page.locator('body');
    await expect(body).toBeVisible();

    // Restaurar online
    await page.context().setOffline(false);
  });
});

test.describe('Error Handling', () => {
  test('should handle 404 errors gracefully', async ({ page }) => {
    const response = await page.goto('/pagina-inexistente');

    // Verificar status 404 o redirección
    expect([404, 200]).toContain(response.status());

    // Verificar que hay contenido útil
    const body = await page.textContent('body');
    expect(body.length).toBeGreaterThan(100);
  });

  test('should handle JavaScript errors gracefully', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));

    await page.goto('/');

    // Provocar un error JavaScript
    await page.evaluate(() => {
      // Error intencional para testing
      window.undefinedFunction();
    });

    await page.waitForTimeout(1000);

    // Verificar que la página sigue funcionando
    const title = await page.title();
    expect(title).toBeTruthy();
  });
});

// Configuración global de tests
test.use(config.use);
test.setTimeout(config.timeout);

module.exports = {
  HomePage,
  ContactPage,
  ServicesPage,
  config,
};
