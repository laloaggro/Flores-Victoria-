/**
 * Schema.org JSON-LD Generator - Flores Victoria
 * Genera markup estructurado para SEO y rich snippets
 * @version 1.0.0
 */

(function () {
  'use strict';

  /**
   * Genera Schema.org para página de productos
   * @param {Array} products - Lista de productos
   * @returns {Object} - Schema ItemList
   */
  function generateProductListSchema(products) {
    return {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      itemListElement: products.slice(0, 20).map((product, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Product',
          '@id': `https://flores-victoria.com/pages/product-detail.html?id=${product.id}`,
          name: product.name,
          image: product.image_url || `/images/products/${product.id}.jpg`,
          description: product.description,
          offers: {
            '@type': 'Offer',
            url: `https://flores-victoria.com/pages/product-detail.html?id=${product.id}`,
            priceCurrency: 'CLP',
            price: product.price,
            availability: 'https://schema.org/InStock',
            seller: {
              '@type': 'Organization',
              name: 'Flores Victoria',
            },
          },
          brand: {
            '@type': 'Brand',
            name: 'Flores Victoria',
          },
          category: product.category || 'Arreglos Florales',
        },
      })),
    };
  }

  /**
   * Genera Schema.org para un producto individual
   * @param {Object} product - Datos del producto
   * @returns {Object} - Schema Product
   */
  function generateProductSchema(product) {
    return {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      image: product.image_url || `/images/products/${product.id}.jpg`,
      description: product.description,
      sku: `FV-${product.id}`,
      mpn: `${product.id}`,
      brand: {
        '@type': 'Brand',
        name: 'Flores Victoria',
      },
      offers: {
        '@type': 'Offer',
        url: `https://flores-victoria.com/pages/product-detail.html?id=${product.id}`,
        priceCurrency: 'CLP',
        price: product.price,
        priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
        availability: 'https://schema.org/InStock',
        itemCondition: 'https://schema.org/NewCondition',
        seller: {
          '@type': 'Organization',
          name: 'Flores Victoria',
          url: 'https://flores-victoria.com',
        },
      },
      aggregateRating: product.rating
        ? {
            '@type': 'AggregateRating',
            ratingValue: product.rating,
            reviewCount: product.reviewCount || 5,
            bestRating: '5',
            worstRating: '1',
          }
        : undefined,
    };
  }

  /**
   * Genera Schema.org para breadcrumbs
   * @param {Array} breadcrumbs - [{name, url}, ...]
   * @returns {Object} - Schema BreadcrumbList
   */
  function generateBreadcrumbSchema(breadcrumbs) {
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs.map((crumb, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: crumb.name,
        item: crumb.url ? `https://flores-victoria.com${crumb.url}` : undefined,
      })),
    };
  }

  /**
   * Genera Schema.org para organización
   * @returns {Object} - Schema Organization
   */
  function generateOrganizationSchema() {
    return {
      '@context': 'https://schema.org',
      '@type': 'FloristShop',
      name: 'Flores Victoria',
      alternateName: 'Arreglos Florales Victoria',
      url: 'https://flores-victoria.com',
      logo: 'https://flores-victoria.com/logo.svg',
      image: 'https://flores-victoria.com/images/og-image.jpg',
      description:
        'Florería en Santiago especializada en arreglos florales premium, ramos de flores frescas y plantas ornamentales con envío a domicilio.',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Av. Recoleta 1234',
        addressLocality: 'Recoleta',
        addressRegion: 'RM',
        postalCode: '8420000',
        addressCountry: 'CL',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: '-33.4189',
        longitude: '-70.6344',
      },
      telephone: '+56-2-1234-5678',
      email: 'info@flores-victoria.com',
      priceRange: '$$',
      openingHoursSpecification: {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        opens: '09:00',
        closes: '21:00',
      },
      sameAs: [
        'https://www.facebook.com/floresvictoria',
        'https://www.instagram.com/floresvictoria',
        'https://twitter.com/floresvictoria',
      ],
    };
  }

  /**
   * Inserta schema en el head del documento
   * @param {Object} schema - Schema JSON-LD
   */
  function insertSchema(schema) {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(schema);
    document.head.appendChild(script);
  }

  /**
   * Inserta múltiples schemas
   * @param {Array} schemas - Array de schemas
   */
  function insertSchemas(schemas) {
    schemas.forEach((schema) => {
      if (schema) insertSchema(schema);
    });
  }

  // Exportar utilidades globalmente
  window.SchemaGenerator = {
    generateProductListSchema,
    generateProductSchema,
    generateBreadcrumbSchema,
    generateOrganizationSchema,
    insertSchema,
    insertSchemas,
  };

  // Auto-insertar schema de organización si estamos en la página principal
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
        insertSchema(generateOrganizationSchema());
      }
    });
  }
})();
