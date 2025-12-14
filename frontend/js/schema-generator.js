/**
 * Schema Generator Utility
 * Genera y añade schemas JSON-LD dinámicamente para SEO
 *
 * @version 1.0.0
 * @date 2025-11-24
 */

/**
 * Inyecta un schema JSON-LD en el HEAD del documento
 * @param {Object} schema - Schema JSON-LD a inyectar
 */
export function injectSchema(schema) {
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(schema, null, 2);
  document.head.appendChild(script);

  if (window.DEBUG || window.location.hostname === 'localhost') {
    
  }
}

/**
 * Genera Product schema desde objeto producto
 * @param {Object} product - Datos del producto
 * @returns {Object} Schema Product
 *
 * @example
 * const product = {
 *   id: '123',
 *   name: 'Rosas Rojas Premium',
 *   description: 'Hermoso bouquet de 12 rosas rojas',
 *   price: 599,
 *   currency: 'MXN',
 *   images: ['/images/products/roses-1.jpg'],
 *   sku: 'PROD-123',
 *   stock: 10,
 *   rating: 4.8,
 *   reviewCount: 47
 * };
 *
 * const schema = generateProductSchema(product);
 * injectSchema(schema);
 */
export function generateProductSchema(product) {
  const baseURL = window.location.origin;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${baseURL}/pages/product-detail.html?id=${product.id}`,
    name: product.name,
    image: product.images?.map((img) => `${baseURL}${img}`) || [],
    description: product.description || '',
    sku: product.sku || `PROD-${product.id}`,
    brand: {
      '@type': 'Brand',
      name: 'Flores Victoria',
    },
    offers: {
      '@type': 'Offer',
      url: `${baseURL}/pages/product-detail.html?id=${product.id}`,
      priceCurrency: product.currency || 'MXN',
      price: product.price.toFixed(2),
      priceValidUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      availability:
        product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'Flores Victoria',
      },
    },
  };

  // Agregar rating si existe
  if (product.rating && product.reviewCount) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: product.rating.toString(),
      reviewCount: product.reviewCount.toString(),
      bestRating: '5',
      worstRating: '1',
    };
  }

  return schema;
}

/**
 * Genera BreadcrumbList desde DOM
 * @returns {Object|null} Schema BreadcrumbList o null si no hay breadcrumbs
 *
 * @example
 * // HTML:
 * // <nav class="breadcrumb">
 * //   <a href="/">Inicio</a>
 * //   <a href="/catalog">Catálogo</a>
 * //   <span>Producto</span>
 * // </nav>
 *
 * const schema = generateBreadcrumbSchema();
 * if (schema) injectSchema(schema);
 */
export function generateBreadcrumbSchema() {
  const breadcrumbEl = document.querySelector('.breadcrumb, [aria-label="breadcrumb"]');
  if (!breadcrumbEl) return null;

  const baseURL = window.location.origin;
  const items = [];

  // Buscar enlaces y spans dentro del breadcrumb
  breadcrumbEl.querySelectorAll('a, span').forEach((el, index) => {
    const text = el.textContent.trim();
    const href = el.getAttribute('href');

    // Ignorar separadores
    if (text && text !== '/' && text !== '>' && text !== '»') {
      items.push({
        '@type': 'ListItem',
        position: items.length + 1,
        name: text,
        item: href ? `${baseURL}${href}` : window.location.href,
      });
    }
  });

  if (items.length === 0) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items,
  };
}

/**
 * Genera FAQPage desde DOM
 * @returns {Object|null} Schema FAQPage o null si no hay FAQs
 *
 * @example
 * // HTML:
 * // <div class="faq-item">
 * //   <h3 class="faq-question">¿Cuál es el tiempo de entrega?</h3>
 * //   <p class="faq-answer">24-48 horas...</p>
 * // </div>
 *
 * const schema = generateFAQSchema();
 * if (schema) injectSchema(schema);
 */
export function generateFAQSchema() {
  // Buscar items FAQ con varios selectores posibles
  const faqItems = document.querySelectorAll(
    '.faq-item, .accordion-item, [itemtype="https://schema.org/Question"]'
  );
  if (faqItems.length === 0) return null;

  const questions = Array.from(faqItems)
    .map((item) => {
      // Buscar pregunta
      const questionEl = item.querySelector(
        '.faq-question, .accordion-header, h3, h4, [itemprop="name"]'
      );
      // Buscar respuesta
      const answerEl = item.querySelector(
        '.faq-answer, .accordion-body, .faq-content, p, [itemprop="text"]'
      );

      if (!questionEl || !answerEl) return null;

      return {
        '@type': 'Question',
        name: questionEl.textContent.trim(),
        acceptedAnswer: {
          '@type': 'Answer',
          text: answerEl.textContent.trim(),
        },
      };
    })
    .filter((q) => q !== null);

  if (questions.length === 0) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: questions,
  };
}

/**
 * Genera ItemList para catálogo de productos
 * @param {Array} products - Array de objetos producto
 * @returns {Object} Schema ItemList
 *
 * @example
 * const products = [
 *   { id: 1, name: 'Rosas', price: 599, image: '/img/roses.jpg' },
 *   { id: 2, name: 'Tulipanes', price: 499, image: '/img/tulips.jpg' }
 * ];
 *
 * const schema = generateItemListSchema(products);
 * injectSchema(schema);
 */
export function generateItemListSchema(products) {
  const baseURL = window.location.origin;

  const items = products.map((product, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    item: {
      '@type': 'Product',
      name: product.name,
      url: `${baseURL}/pages/product-detail.html?id=${product.id}`,
      image: product.image ? `${baseURL}${product.image}` : undefined,
      offers: {
        '@type': 'Offer',
        priceCurrency: product.currency || 'MXN',
        price: product.price.toFixed(2),
      },
    },
  }));

  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: items,
  };
}

/**
 * Auto-inyecta breadcrumb schema si existe en la página
 */
export function autoInjectBreadcrumb() {
  const schema = generateBreadcrumbSchema();
  if (schema) {
    injectSchema(schema);
  }
}

/**
 * Auto-inyecta FAQ schema si existe en la página
 */
export function autoInjectFAQ() {
  const schema = generateFAQSchema();
  if (schema) {
    injectSchema(schema);
  }
}

// Auto-ejecución para breadcrumbs (presente en muchas páginas)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    autoInjectBreadcrumb();
  });
} else {
  autoInjectBreadcrumb();
}

// Exportar todas las funciones
export default {
  injectSchema,
  generateProductSchema,
  generateBreadcrumbSchema,
  generateFAQSchema,
  generateItemListSchema,
  autoInjectBreadcrumb,
  autoInjectFAQ,
};
