/**
 * 🔍 METADATA MANAGER
 * Gestiona meta tags dinámicos para SEO mejorado
 */

class MetadataManager {
  constructor() {
    this.defaultMeta = {
      title: 'Arreglos Victoria - Florería en línea',
      description: 'Hermosos arreglos florales para toda ocasión. Entrega a domicilio.',
      keywords: 'flores, arreglos florales, ramos, entrega domicilio, florería',
      image: '/images/logo.svg',
      url: window.location.href,
      type: 'website',
      locale: 'es_MX',
      siteName: 'Arreglos Victoria',
    };
  }

  /**
   * Actualiza todos los meta tags de la página
   * @param {Object} meta - Objeto con metadata
   */
  update(meta = {}) {
    const data = { ...this.defaultMeta, ...meta };

    // Title
    document.title = data.title;

    // Meta básicos
    this.setMeta('description', data.description);
    this.setMeta('keywords', data.keywords);

    // Open Graph (Facebook, LinkedIn, etc.)
    this.setOGMeta('og:title', data.title);
    this.setOGMeta('og:description', data.description);
    this.setOGMeta('og:image', this.getAbsoluteURL(data.image));
    this.setOGMeta('og:url', data.url);
    this.setOGMeta('og:type', data.type);
    this.setOGMeta('og:locale', data.locale);
    this.setOGMeta('og:site_name', data.siteName);

    // Twitter Card
    this.setOGMeta('twitter:card', 'summary_large_image');
    this.setOGMeta('twitter:title', data.title);
    this.setOGMeta('twitter:description', data.description);
    this.setOGMeta('twitter:image', this.getAbsoluteURL(data.image));

    // Canonical URL
    this.setCanonical(data.url);

    // Structured Data (JSON-LD)
    if (data.structuredData) {
      this.setStructuredData(data.structuredData);
    }
  }

  /**
   * Establece un meta tag básico
   */
  setMeta(name, content) {
    let element = document.querySelector(`meta[name="${name}"]`);

    if (!element) {
      element = document.createElement('meta');
      element.setAttribute('name', name);
      document.head.appendChild(element);
    }

    element.setAttribute('content', content);
  }

  /**
   * Establece un meta tag de Open Graph o Twitter
   */
  setOGMeta(property, content) {
    let element = document.querySelector(`meta[property="${property}"]`);

    if (!element) {
      element = document.querySelector(`meta[name="${property}"]`);
    }

    if (!element) {
      element = document.createElement('meta');

      if (property.startsWith('og:')) {
        element.setAttribute('property', property);
      } else {
        element.setAttribute('name', property);
      }

      document.head.appendChild(element);
    }

    element.setAttribute('content', content);
  }

  /**
   * Establece canonical URL
   */
  setCanonical(url) {
    let link = document.querySelector('link[rel="canonical"]');

    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }

    link.setAttribute('href', url);
  }

  /**
   * Establece structured data (JSON-LD)
   */
  setStructuredData(data) {
    // Remover script anterior si existe
    const oldScript = document.getElementById('structured-data');
    if (oldScript) {
      oldScript.remove();
    }

    // Crear nuevo script
    const script = document.createElement('script');
    script.id = 'structured-data';
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);
  }

  /**
   * Convierte URL relativa a absoluta
   */
  getAbsoluteURL(url) {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    const base = `${window.location.protocol}//${window.location.host}`;
    return url.startsWith('/') ? `${base}${url}` : `${base}/${url}`;
  }

  /**
   * Genera structured data para producto
   */
  static productSchema(product) {
    return {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      image: product.image,
      description: product.description,
      sku: product.sku,
      offers: {
        '@type': 'Offer',
        url: product.url,
        priceCurrency: product.currency || 'MXN',
        price: product.price,
        availability: product.inStock
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      },
      aggregateRating: product.rating
        ? {
            '@type': 'AggregateRating',
            ratingValue: product.rating.value,
            reviewCount: product.rating.count,
          }
        : undefined,
    };
  }

  /**
   * Genera structured data para organización
   */
  static organizationSchema(org) {
    return {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      name: org.name,
      image: org.logo,
      '@id': org.url,
      url: org.url,
      telephone: org.phone,
      address: {
        '@type': 'PostalAddress',
        streetAddress: org.address.street,
        addressLocality: org.address.city,
        postalCode: org.address.zip,
        addressCountry: org.address.country,
      },
      geo: org.coordinates
        ? {
            '@type': 'GeoCoordinates',
            latitude: org.coordinates.lat,
            longitude: org.coordinates.lng,
          }
        : undefined,
      openingHoursSpecification: org.hours,
      sameAs: org.socialMedia,
    };
  }

  /**
   * Genera structured data para breadcrumbs
   */
  static breadcrumbSchema(items) {
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: item.url,
      })),
    };
  }
}

// Inicializar en páginas específicas
document.addEventListener('DOMContentLoaded', () => {
  const metadata = new MetadataManager();
  const currentPage = window.location.pathname;

  // Metadata específica por página
  if (currentPage.includes('/products.html')) {
    metadata.update({
      title: 'Productos - Arreglos Victoria',
      description: 'Explora nuestra colección de hermosos arreglos florales para toda ocasión.',
      keywords: 'flores, ramos, arreglos, productos florales, comprar flores',
    });
  } else if (currentPage.includes('/about.html')) {
    metadata.update({
      title: 'Acerca de - Arreglos Victoria',
      description:
        'Conoce más sobre Arreglos Victoria, tu florería de confianza con 25 años de experiencia.',
      keywords: 'florería, sobre nosotros, historia, arreglos victoria',
      structuredData: MetadataManager.organizationSchema({
        name: 'Arreglos Victoria',
        logo: '/images/logo.svg',
        url: 'https://www.arreglosvictoria.com',
        phone: '+52-123-456-7890',
        address: {
          street: 'Calle Principal 123',
          city: 'Ciudad de México',
          zip: '12345',
          country: 'MX',
        },
        hours: [
          {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            opens: '09:00',
            closes: '18:00',
          },
        ],
        socialMedia: [
          'https://facebook.com/arreglosvictoria',
          'https://instagram.com/arreglosvictoria',
        ],
      }),
    });
  } else if (currentPage.includes('/contact.html')) {
    metadata.update({
      title: 'Contacto - Arreglos Victoria',
      description:
        'Contáctanos para hacer tu pedido o resolver tus dudas. Estamos aquí para ayudarte.',
      keywords: 'contacto, teléfono, email, ubicación, arreglos victoria',
    });
  }
});

// Exportar para uso en otros scripts
if (typeof window !== 'undefined') {
  window.MetadataManager = MetadataManager;
}
