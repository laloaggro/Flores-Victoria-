#!/usr/bin/env node

/**
 * Script de Validación SEO Automatizada
 * Valida meta tags, canonical URLs, y structured data en todas las páginas
 */

const fs = require('fs');
const path = require('path');

// Colores para output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

// Configuración
const FRONTEND_DIR = path.join(__dirname, '../frontend');
const PAGES_DIR = path.join(FRONTEND_DIR, 'pages');

// Páginas a validar
const PUBLIC_PAGES = [
  { file: 'index.html', name: 'Homepage', dir: FRONTEND_DIR },
  { file: 'products.html', name: 'Productos', dir: PAGES_DIR },
  { file: 'product-detail.html', name: 'Detalle de Producto', dir: PAGES_DIR },
  { file: 'about.html', name: 'Nosotros', dir: PAGES_DIR },
  { file: 'contact.html', name: 'Contacto', dir: PAGES_DIR },
  { file: 'faq.html', name: 'FAQ', dir: PAGES_DIR },
  { file: 'blog.html', name: 'Blog', dir: PAGES_DIR },
  { file: 'blog-post.html', name: 'Post de Blog', dir: PAGES_DIR },
  { file: 'cart.html', name: 'Carrito', dir: PAGES_DIR },
  { file: 'checkout.html', name: 'Checkout', dir: PAGES_DIR },
  { file: 'login.html', name: 'Login', dir: PAGES_DIR },
  { file: 'register.html', name: 'Registro', dir: PAGES_DIR },
  { file: 'reset-password.html', name: 'Recuperar Contraseña', dir: PAGES_DIR },
];

const PRIVATE_PAGES = [
  { file: 'account.html', name: 'Mi Cuenta', dir: PAGES_DIR },
  { file: 'orders.html', name: 'Mis Pedidos', dir: PAGES_DIR },
  { file: 'profile.html', name: 'Mi Perfil', dir: PAGES_DIR },
];

// Resultados globales
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
let warnings = 0;

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function success(message) {
  passedTests++;
  totalTests++;
  log(`  ✅ ${message}`, 'green');
}

function fail(message) {
  failedTests++;
  totalTests++;
  log(`  ❌ ${message}`, 'red');
}

function warn(message) {
  warnings++;
  log(`  ⚠️  ${message}`, 'yellow');
}

function info(message) {
  log(`  ℹ️  ${message}`, 'cyan');
}

/**
 * Extrae contenido de meta tags
 */
function extractMetaTag(html, property, attr = 'name') {
  const regex = new RegExp(`<meta\\s+${attr}=["']${property}["']\\s+content=["']([^"']*)["']`, 'i');
  const match = html.match(regex);
  return match ? match[1] : null;
}

/**
 * Valida meta tags básicos
 */
function validateBasicMetaTags(html, pageName) {
  log(`\n${colors.bold}📋 Validando Meta Tags - ${pageName}${colors.reset}`, 'blue');

  // Title
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (titleMatch && titleMatch[1].trim()) {
    success(`Title presente: "${titleMatch[1].trim()}"`);
  } else {
    fail('Title faltante o vacío');
  }

  // Meta description
  const description = extractMetaTag(html, 'description');
  if (description && description.trim()) {
    const length = description.length;
    if (length >= 150 && length <= 160) {
      success(`Meta description óptima (${length} caracteres)`);
    } else if (length > 0) {
      warn(`Meta description presente pero no óptima (${length} caracteres, ideal 150-160)`);
    }
  } else {
    fail('Meta description faltante');
  }

  // Viewport
  const viewport = extractMetaTag(html, 'viewport');
  if (viewport) {
    success('Viewport configurado');
  } else {
    fail('Viewport faltante');
  }

  // Charset
  if (html.includes('charset="UTF-8"') || html.includes("charset='UTF-8'")) {
    success('Charset UTF-8 configurado');
  } else {
    warn('Charset UTF-8 no encontrado');
  }
}

/**
 * Valida Open Graph tags
 */
function validateOpenGraph(html, pageName) {
  log(`\n${colors.bold}🌐 Validando Open Graph - ${pageName}${colors.reset}`, 'blue');

  const ogTitle = extractMetaTag(html, 'og:title', 'property');
  const ogDescription = extractMetaTag(html, 'og:description', 'property');
  const ogImage = extractMetaTag(html, 'og:image', 'property');
  const ogUrl = extractMetaTag(html, 'og:url', 'property');
  const ogType = extractMetaTag(html, 'og:type', 'property');

  if (ogTitle) {
    success(`og:title presente: "${ogTitle}"`);
  } else {
    fail('og:title faltante');
  }

  if (ogDescription) {
    success('og:description presente');
  } else {
    fail('og:description faltante');
  }

  if (ogImage) {
    success('og:image presente');
  } else {
    warn('og:image faltante (recomendado 1200×630px)');
  }

  if (ogUrl) {
    success('og:url presente');
  } else {
    fail('og:url faltante');
  }

  if (ogType) {
    success(`og:type presente: "${ogType}"`);
  } else {
    warn('og:type faltante');
  }
}

/**
 * Valida Twitter Cards
 */
function validateTwitterCards(html, pageName) {
  log(`\n${colors.bold}🐦 Validando Twitter Cards - ${pageName}${colors.reset}`, 'blue');

  const twitterCard = extractMetaTag(html, 'twitter:card');
  const twitterTitle = extractMetaTag(html, 'twitter:title');
  const twitterDescription = extractMetaTag(html, 'twitter:description');
  const twitterImage = extractMetaTag(html, 'twitter:image');

  if (twitterCard) {
    success(`twitter:card presente: "${twitterCard}"`);
  } else {
    fail('twitter:card faltante');
  }

  if (twitterTitle) {
    success('twitter:title presente');
  } else {
    warn('twitter:title faltante');
  }

  if (twitterDescription) {
    success('twitter:description presente');
  } else {
    warn('twitter:description faltante');
  }

  if (twitterImage) {
    success('twitter:image presente');
  } else {
    warn('twitter:image faltante');
  }
}

/**
 * Valida canonical URL
 */
function validateCanonical(html, pageName, shouldBeNoindex = false) {
  log(`\n${colors.bold}🔗 Validando Canonical/Noindex - ${pageName}${colors.reset}`, 'blue');

  const canonicalMatch = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i);
  const noindexMatch = html.match(/<meta\s+name=["']robots["']\s+content=["']noindex/i);

  if (shouldBeNoindex) {
    if (noindexMatch) {
      success('Página correctamente marcada como noindex (privada)');
    } else {
      fail('Página privada debe tener noindex');
    }
  } else {
    if (canonicalMatch) {
      success(`Canonical URL presente: "${canonicalMatch[1]}"`);
    } else {
      fail('Canonical URL faltante');
    }

    if (noindexMatch) {
      warn('Página pública marcada como noindex');
    }
  }
}

/**
 * Valida JSON-LD structured data
 */
function validateStructuredData(html, pageName, expectedSchemas = []) {
  log(`\n${colors.bold}📊 Validando Structured Data - ${pageName}${colors.reset}`, 'blue');

  const schemaMatches = html.match(
    /<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  );

  if (!schemaMatches || schemaMatches.length === 0) {
    if (expectedSchemas.length > 0) {
      fail('No se encontraron schemas JSON-LD');
    } else {
      info('No se esperan schemas en esta página');
    }
    return;
  }

  const schemas = [];
  schemaMatches.forEach((match) => {
    try {
      const jsonMatch = match.match(/>([^<]+)</);
      if (jsonMatch) {
        const schema = JSON.parse(jsonMatch[1]);
        schemas.push(schema);
      }
    } catch (e) {
      fail(`Error parseando JSON-LD: ${e.message}`);
    }
  });

  success(`${schemas.length} schema(s) encontrado(s)`);

  schemas.forEach((schema) => {
    const type = schema['@type'];
    info(`  Tipo: ${type}`);

    // Validaciones específicas por tipo
    if (type === 'LocalBusiness' || type === 'FloristShop') {
      if (schema.name) success('  ✓ Nombre del negocio presente');
      else fail('  ✗ Nombre del negocio faltante');

      if (schema.address) success('  ✓ Dirección presente');
      else warn('  ⚠ Dirección faltante');

      if (schema.telephone) success('  ✓ Teléfono presente');
      else warn('  ⚠ Teléfono faltante');

      if (schema.openingHoursSpecification) success('  ✓ Horarios presentes');
      else warn('  ⚠ Horarios faltantes');
    }

    if (type === 'Product') {
      if (schema.name) success('  ✓ Nombre del producto presente');
      else fail('  ✗ Nombre del producto faltante');

      if (schema.offers) {
        success('  ✓ Offers presente');
        if (schema.offers.price) success('    ✓ Precio presente');
        else fail('    ✗ Precio faltante');

        if (schema.offers.priceCurrency) success('    ✓ Moneda presente');
        else fail('    ✗ Moneda faltante');

        if (schema.offers.availability) success('    ✓ Disponibilidad presente');
        else warn('    ⚠ Disponibilidad faltante');
      } else {
        fail('  ✗ Offers faltante');
      }
    }

    if (type === 'FAQPage') {
      if (schema.mainEntity && Array.isArray(schema.mainEntity)) {
        success(`  ✓ ${schema.mainEntity.length} preguntas encontradas`);
      } else {
        fail('  ✗ mainEntity faltante o inválido');
      }
    }

    if (type === 'WebSite') {
      if (schema.potentialAction) success('  ✓ SearchAction presente');
      else warn('  ⚠ SearchAction faltante');
    }
  });
}

/**
 * Valida una página completa
 */
function validatePage(pageInfo, isPrivate = false) {
  const filePath = path.join(pageInfo.dir, pageInfo.file);

  log(`\n${'='.repeat(80)}`, 'cyan');
  log(`${colors.bold}${colors.cyan}Validando: ${pageInfo.name} (${pageInfo.file})${colors.reset}`);
  log('='.repeat(80), 'cyan');

  if (!fs.existsSync(filePath)) {
    fail(`Archivo no encontrado: ${filePath}`);
    return;
  }

  const html = fs.readFileSync(filePath, 'utf-8');

  validateBasicMetaTags(html, pageInfo.name);
  validateOpenGraph(html, pageInfo.name);
  validateTwitterCards(html, pageInfo.name);
  validateCanonical(html, pageInfo.name, isPrivate);

  // Structured data específico por página
  if (pageInfo.file === 'index.html') {
    validateStructuredData(html, pageInfo.name, ['LocalBusiness', 'WebSite']);
  } else if (pageInfo.file === 'faq.html') {
    validateStructuredData(html, pageInfo.name, ['FAQPage']);
  } else if (pageInfo.file === 'product-detail.html') {
    info('\n  ℹ️  Product schema se genera dinámicamente - revisar en navegador');
  } else {
    validateStructuredData(html, pageInfo.name, []);
  }
}

/**
 * Genera reporte final
 */
function generateReport() {
  log('\n\n' + '='.repeat(80), 'cyan');
  log(`${colors.bold}${colors.cyan}REPORTE FINAL DE VALIDACIÓN SEO${colors.reset}`);
  log('='.repeat(80), 'cyan');

  const total = totalTests;
  const passed = passedTests;
  const failed = failedTests;
  const warns = warnings;
  const score = total > 0 ? Math.round((passed / total) * 100) : 0;

  log(`\n📊 Resultados:`, 'bold');
  log(`   Total de pruebas: ${total}`);
  log(`   ✅ Aprobadas: ${passed}`, 'green');
  log(`   ❌ Fallidas: ${failed}`, failed > 0 ? 'red' : 'reset');
  log(`   ⚠️  Advertencias: ${warns}`, warns > 0 ? 'yellow' : 'reset');
  log(`\n   📈 Score SEO: ${score}%`, score >= 90 ? 'green' : score >= 70 ? 'yellow' : 'red');

  if (score >= 95) {
    log('\n🎉 ¡Excelente! Tu SEO está en óptimas condiciones.', 'green');
  } else if (score >= 80) {
    log('\n👍 Muy bien. Considera revisar las advertencias para mejorar.', 'yellow');
  } else if (score >= 60) {
    log('\n⚠️  Hay varios problemas que deberían corregirse.', 'yellow');
  } else {
    log('\n🚨 Se requieren mejoras significativas en SEO.', 'red');
  }

  log('\n📝 Próximos pasos:', 'bold');
  log('   1. Corregir errores marcados con ❌');
  log('   2. Revisar advertencias marcadas con ⚠️');
  log('   3. Validar con herramientas externas:');
  log('      • Schema.org Validator: https://validator.schema.org/');
  log('      • Google Rich Results: https://search.google.com/test/rich-results');
  log('      • Facebook Debugger: https://developers.facebook.com/tools/debug/');
  log('   4. Ejecutar Lighthouse audits en navegador');

  log('\n' + '='.repeat(80), 'cyan');
}

/**
 * Función principal
 */
function main() {
  log('\n' + '='.repeat(80), 'cyan');
  log(
    `${colors.bold}${colors.cyan}🔍 VALIDACIÓN SEO AUTOMATIZADA - FLORES VICTORIA${colors.reset}`
  );
  log('='.repeat(80), 'cyan');
  log(`\nFecha: ${new Date().toLocaleString('es-MX')}`);
  log(`Directorio: ${FRONTEND_DIR}\n`);

  // Validar páginas públicas
  log(`\n${colors.bold}${colors.blue}📄 PÁGINAS PÚBLICAS (${PUBLIC_PAGES.length})${colors.reset}`);
  PUBLIC_PAGES.forEach((page) => validatePage(page, false));

  // Validar páginas privadas
  log(
    `\n\n${colors.bold}${colors.blue}🔒 PÁGINAS PRIVADAS (${PRIVATE_PAGES.length})${colors.reset}`
  );
  PRIVATE_PAGES.forEach((page) => validatePage(page, true));

  // Generar reporte
  generateReport();
}

// Ejecutar
main();
