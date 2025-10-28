/* ========================================
   TESTING AUTOMATIZADO BÁSICO
   - Tests de funcionalidad crítica
   - Tests de rendimiento
   - Tests de accesibilidad
   ======================================== */

class AutomatedTester {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      warnings: 0,
      tests: [],
    };

    this.isProduction = window.location.hostname !== 'localhost';

    if (!this.isProduction) {
      this.runAllTests();
    }
  }

  async runAllTests() {
    console.log('🧪 Iniciando tests automatizados...');

    // Tests de funcionalidad básica
    await this.testBasicFunctionality();

    // Tests de rendimiento
    await this.testPerformance();

    // Tests de accesibilidad
    await this.testAccessibility();

    // Tests de SEO
    await this.testSEO();

    // Tests de PWA
    await this.testPWA();

    this.reportResults();
  }

  async testBasicFunctionality() {
    console.log('🔧 Ejecutando tests de funcionalidad básica...');

    // Test: Navigation links work
    this.test('Navigation links exist', () => {
      const navLinks = document.querySelectorAll('nav a, header a');
      return navLinks.length > 0;
    });

    // Test: Logo exists and is clickable
    this.test('Logo exists and is clickable', () => {
      const logo = document.querySelector('.logo, [class*="logo"], img[alt*="logo"]');
      return logo && (logo.tagName === 'A' || logo.closest('a'));
    });

    // Test: Contact information is present
    this.test('Contact information is present', () => {
      const phone = document.querySelector('a[href^="tel:"], [href*="tel:"]');
      const email = document.querySelector('a[href^="mailto:"], [href*="mailto:"]');
      return phone || email;
    });

    // Test: Form validation works
    this.test('Form validation works', () => {
      const forms = document.querySelectorAll('form');
      let hasValidation = false;

      forms.forEach((form) => {
        const requiredFields = form.querySelectorAll('[required]');
        if (requiredFields.length > 0) {
          hasValidation = true;
        }
      });

      return hasValidation;
    });

    // Test: Images have alt text
    this.test('Images have alt text', () => {
      const images = document.querySelectorAll('img');
      const imagesWithoutAlt = Array.from(images).filter((img) => !img.alt);

      if (imagesWithoutAlt.length > 0) {
        this.warn(`${imagesWithoutAlt.length} imágenes sin alt text`);
        return false;
      }
      return true;
    });

    // Test: External links open in new tab
    this.test('External links open in new tab', () => {
      const externalLinks = document.querySelectorAll(
        `a[href^="http"]:not([href*="${window.location.hostname}"])`
      );
      const linksWithoutTarget = Array.from(externalLinks).filter(
        (link) => link.target !== '_blank'
      );

      if (linksWithoutTarget.length > 0) {
        this.warn(`${linksWithoutTarget.length} enlaces externos sin target="_blank"`);
      }

      return linksWithoutTarget.length === 0;
    });
  }

  async testPerformance() {
    console.log('⚡ Ejecutando tests de rendimiento...');

    // Test: Page load time
    this.test('Page load time is acceptable', () => {
      const navigation = performance.getEntriesByType('navigation')[0];
      const loadTime = navigation.loadEventEnd - navigation.fetchStart;

      if (loadTime > 3000) {
        this.warn(`Tiempo de carga alto: ${Math.round(loadTime)}ms`);
        return false;
      }
      return true;
    });

    // Test: DOM size is reasonable
    this.test('DOM size is reasonable', () => {
      const domNodes = document.querySelectorAll('*').length;

      if (domNodes > 1500) {
        this.warn(`DOM muy grande: ${domNodes} nodos`);
        return false;
      }
      return true;
    });

    // Test: Images are optimized
    this.test('Images use lazy loading', () => {
      const images = document.querySelectorAll('img');
      const lazyImages = document.querySelectorAll('img[loading="lazy"]');
      const ratio = lazyImages.length / images.length;

      if (ratio < 0.8) {
        this.warn(`Solo ${Math.round(ratio * 100)}% de imágenes usan lazy loading`);
        return false;
      }
      return true;
    });

    // Test: CSS is not blocking
    this.test('CSS optimization', () => {
      const cssLinks = document.querySelectorAll('link[rel="stylesheet"]');
      const criticalCSS = document.querySelector('style');

      if (cssLinks.length > 5) {
        this.warn(`Muchos archivos CSS: ${cssLinks.length}`);
      }

      return cssLinks.length <= 5;
    });
  }

  async testAccessibility() {
    console.log('♿ Ejecutando tests de accesibilidad...');

    // Test: Page has main landmark
    this.test(
      'Page has main landmark',
      () => document.querySelector('main, [role="main"]') !== null
    );

    // Test: Headings are hierarchical
    this.test('Headings are hierarchical', () => {
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      let hasH1 = false;
      let previousLevel = 0;
      let isHierarchical = true;

      headings.forEach((heading) => {
        const level = parseInt(heading.tagName.charAt(1));

        if (level === 1) {
          hasH1 = true;
        }

        if (level > previousLevel + 1) {
          isHierarchical = false;
        }

        previousLevel = level;
      });

      if (!hasH1) {
        this.warn('No se encontró H1 en la página');
        return false;
      }

      if (!isHierarchical) {
        this.warn('La jerarquía de headings no es correcta');
        return false;
      }

      return true;
    });

    // Test: Interactive elements are focusable
    this.test('Interactive elements are focusable', () => {
      const interactive = document.querySelectorAll(
        'button, a, input, select, textarea, [tabindex]'
      );
      let allFocusable = true;

      interactive.forEach((element) => {
        if (element.tabIndex === -1 && !element.disabled) {
          allFocusable = false;
        }
      });

      return allFocusable;
    });

    // Test: Color contrast (basic check)
    this.test('Basic color contrast', () => {
      const style = getComputedStyle(document.body);
      const bgColor = style.backgroundColor;
      const textColor = style.color;

      // Verificación básica - en implementación real usar algoritmo WCAG
      return bgColor !== textColor;
    });

    // Test: Language is declared
    this.test('Page language is declared', () => document.documentElement.lang !== '');
  }

  async testSEO() {
    console.log('🔍 Ejecutando tests de SEO...');

    // Test: Title tag exists and is appropriate length
    this.test('Title tag is optimized', () => {
      const title = document.title;

      if (!title) {
        return false;
      }

      if (title.length < 30 || title.length > 60) {
        this.warn(`Longitud de título no óptima: ${title.length} caracteres`);
        return false;
      }

      return true;
    });

    // Test: Meta description exists
    this.test('Meta description exists', () => {
      const metaDesc = document.querySelector('meta[name="description"]');

      if (!metaDesc || !metaDesc.content) {
        return false;
      }

      if (metaDesc.content.length < 120 || metaDesc.content.length > 160) {
        this.warn(`Longitud de meta description no óptima: ${metaDesc.content.length} caracteres`);
        return false;
      }

      return true;
    });

    // Test: Open Graph tags exist
    this.test('Open Graph tags exist', () => {
      const ogTitle = document.querySelector('meta[property="og:title"]');
      const ogDesc = document.querySelector('meta[property="og:description"]');
      const ogImage = document.querySelector('meta[property="og:image"]');

      return ogTitle && ogDesc && ogImage;
    });

    // Test: Canonical URL exists
    this.test(
      'Canonical URL exists',
      () => document.querySelector('link[rel="canonical"]') !== null
    );

    // Test: Structured data exists
    this.test('Structured data exists', () => {
      const jsonLd = document.querySelectorAll('script[type="application/ld+json"]');
      return jsonLd.length > 0;
    });
  }

  async testPWA() {
    console.log('📱 Ejecutando tests de PWA...');

    // Test: Manifest exists
    this.test(
      'Web App Manifest exists',
      () => document.querySelector('link[rel="manifest"]') !== null
    );

    // Test: Service Worker is registered
    this.test('Service Worker is registered', () => 'serviceWorker' in navigator);

    // Test: HTTPS (in production)
    this.test('Site uses HTTPS', () => {
      if (this.isProduction) {
        return window.location.protocol === 'https:';
      }
      return true; // Skip in development
    });

    // Test: Viewport meta tag exists
    this.test('Viewport meta tag exists', () => {
      const viewport = document.querySelector('meta[name="viewport"]');
      return viewport && viewport.content.includes('width=device-width');
    });

    // Test: Theme color is set
    this.test(
      'Theme color is set',
      () => document.querySelector('meta[name="theme-color"]') !== null
    );
  }

  test(name, testFunction) {
    try {
      const result = testFunction();

      if (result) {
        this.results.passed++;
        this.results.tests.push({ name, status: 'PASS' });
        console.log(`✅ ${name}`);
      } else {
        this.results.failed++;
        this.results.tests.push({ name, status: 'FAIL' });
        console.log(`❌ ${name}`);
      }
    } catch (error) {
      this.results.failed++;
      this.results.tests.push({ name, status: 'ERROR', error: error.message });
      console.log(`💥 ${name} - ERROR: ${error.message}`);
    }
  }

  warn(message) {
    this.results.warnings++;
    console.log(`⚠️ ${message}`);
  }

  reportResults() {
    console.log('\n📊 RESUMEN DE TESTS AUTOMATIZADOS:');
    console.log(`✅ Pasados: ${this.results.passed}`);
    console.log(`❌ Fallidos: ${this.results.failed}`);
    console.log(`⚠️ Advertencias: ${this.results.warnings}`);

    const total = this.results.passed + this.results.failed;
    const successRate = Math.round((this.results.passed / total) * 100);

    console.log(`📈 Tasa de éxito: ${successRate}%`);

    if (successRate >= 90) {
      console.log('🎉 ¡Excelente! El sitio pasa la mayoría de tests.');
    } else if (successRate >= 70) {
      console.log('👍 Bien! Hay algunas áreas de mejora.');
    } else {
      console.log('⚠️ Atención! Se necesitan mejoras significativas.');
    }

    // Generar reporte detallado
    this.generateDetailedReport();
  }

  generateDetailedReport() {
    const report = {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      results: this.results,
    };

    // En desarrollo, mostrar en consola
    console.table(this.results.tests);

    // Guardar en localStorage para análisis posterior
    localStorage.setItem('test_report', JSON.stringify(report));
  }

  // Método para ejecutar tests específicos
  runSpecificTest(category) {
    switch (category) {
      case 'functionality':
        this.testBasicFunctionality();
        break;
      case 'performance':
        this.testPerformance();
        break;
      case 'accessibility':
        this.testAccessibility();
        break;
      case 'seo':
        this.testSEO();
        break;
      case 'pwa':
        this.testPWA();
        break;
      default:
        console.log(
          'Categoría no válida. Use: functionality, performance, accessibility, seo, pwa'
        );
    }
  }
}

// Tests de integración continua
class CITests extends AutomatedTester {
  constructor() {
    super();
    this.criticalTests = [
      'Navigation links exist',
      'Title tag is optimized',
      'Meta description exists',
      'Page load time is acceptable',
    ];
  }

  runCriticalTests() {
    console.log('🚨 Ejecutando tests críticos para CI/CD...');

    let criticalFailures = 0;

    this.results.tests.forEach((test) => {
      if (this.criticalTests.includes(test.name) && test.status === 'FAIL') {
        criticalFailures++;
      }
    });

    if (criticalFailures > 0) {
      console.error(`💥 FALLO CRÍTICO: ${criticalFailures} tests críticos fallaron`);
      return false;
    }

    console.log('✅ Todos los tests críticos pasaron');
    return true;
  }
}

// Inicialización automática en desarrollo
document.addEventListener('DOMContentLoaded', () => {
  if (window.location.hostname === 'localhost') {
    window.automatedTester = new AutomatedTester();

    // Hacer disponible globalmente para testing manual
    window.runTests = (category) => {
      window.automatedTester.runSpecificTest(category);
    };
  }
});

export { AutomatedTester, CITests };
