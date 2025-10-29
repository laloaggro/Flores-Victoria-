/**
 * SEO Meta Tags Manager
 * Gestiona y genera meta tags avanzados para SEO: Open Graph, Twitter Cards y Schema.org
 */

// Importar configuración del negocio si está disponible
const BUSINESS_CONFIG = window.BUSINESS_CONFIG || {
  name: 'Arreglos Victoria',
  contact: { phone: '+56963603177', email: 'arreglosvictoriafloreria@gmail.com' },
  location: {
    address: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      fullAddress: 'Dirección de la tienda',
    },
    coordinates: { lat: 0, lng: 0 },
  },
  schedule: { structured: [] },
  social: {
    facebook: 'https://www.facebook.com/profile.php?id=61578999845743',
    instagram: 'https://www.instagram.com/arreglosvictoria/',
    twitter: '',
  },
  seo: { twitterHandle: '@ArreglosVictoria', locale: 'es_CL' },
};

class SEOManager {
  constructor() {
    this.config = {
      siteName: BUSINESS_CONFIG.name || 'Arreglos Victoria',
      siteUrl: window.location.origin,
      defaultImage: '/logo.svg',
      twitterHandle: BUSINESS_CONFIG.seo?.twitterHandle || '@ArreglosVictoria',
      facebookAppId: '', // Agregar si existe
      locale: BUSINESS_CONFIG.seo?.locale || 'es_CL',
      author: BUSINESS_CONFIG.name || 'Arreglos Victoria',
    };
  }

  /**
   * Inicializa los meta tags según el tipo de página
   */
  init(pageType = 'website', customData = {}) {
    const data = { ...this.getDefaultData(), ...customData };

    // Generar meta tags según tipo
    switch (pageType) {
      case 'product':
        this.setProductMeta(data);
        break;
      case 'article':
        this.setArticleMeta(data);
        break;
      case 'profile':
        this.setProfileMeta(data);
        break;
      default:
        this.setWebsiteMeta(data);
    }

    // Agregar Schema.org
    this.setStructuredData(pageType, data);
  }

  /**
   * Obtiene datos por defecto de la página actual
   */
  getDefaultData() {
    return {
      title: document.title || this.config.siteName,
      description:
        this.getMetaContent('description') || 'La mejor selección de flores y arreglos florales',
      image: this.config.defaultImage,
      url: window.location.href,
      type: 'website',
    };
  }

  /**
   * Meta tags para sitio web general
   */
  setWebsiteMeta(data) {
    // Open Graph
    this.setMeta('og:type', 'website');
    this.setMeta('og:site_name', this.config.siteName);
    this.setMeta('og:title', data.title);
    this.setMeta('og:description', data.description);
    this.setMeta('og:url', data.url);
    this.setMeta('og:image', this.getAbsoluteUrl(data.image));
    this.setMeta('og:image:alt', data.title);
    this.setMeta('og:locale', this.config.locale);

    // Twitter Cards
    this.setMeta('twitter:card', 'summary_large_image');
    this.setMeta('twitter:site', this.config.twitterHandle);
    this.setMeta('twitter:title', data.title);
    this.setMeta('twitter:description', data.description);
    this.setMeta('twitter:image', this.getAbsoluteUrl(data.image));
    this.setMeta('twitter:image:alt', data.title);
  }

  /**
   * Meta tags para páginas de producto
   */
  setProductMeta(data) {
    // Open Graph Product
    this.setMeta('og:type', 'product');
    this.setMeta('og:title', data.title);
    this.setMeta('og:description', data.description);
    this.setMeta('og:url', data.url);
    this.setMeta('og:image', this.getAbsoluteUrl(data.image));
    this.setMeta('og:image:alt', data.title);

    if (data.price) {
      this.setMeta('og:price:amount', data.price);
      this.setMeta('og:price:currency', 'CLP');
    }

    if (data.availability) {
      this.setMeta('og:availability', data.availability);
    }

    // Twitter Product Card
    this.setMeta('twitter:card', 'summary_large_image');
    this.setMeta('twitter:title', data.title);
    this.setMeta('twitter:description', data.description);
    this.setMeta('twitter:image', this.getAbsoluteUrl(data.image));

    if (data.price) {
      this.setMeta('twitter:label1', 'Precio');
      this.setMeta('twitter:data1', `$${data.price} CLP`);
    }

    if (data.category) {
      this.setMeta('twitter:label2', 'Categoría');
      this.setMeta('twitter:data2', data.category);
    }
  }

  /**
   * Meta tags para artículos/blog
   */
  setArticleMeta(data) {
    this.setMeta('og:type', 'article');
    this.setMeta('og:title', data.title);
    this.setMeta('og:description', data.description);
    this.setMeta('og:url', data.url);
    this.setMeta('og:image', this.getAbsoluteUrl(data.image));

    if (data.publishDate) {
      this.setMeta('article:published_time', data.publishDate);
    }

    if (data.author) {
      this.setMeta('article:author', data.author);
    }

    if (data.tags && Array.isArray(data.tags)) {
      data.tags.forEach((tag) => {
        this.setMeta('article:tag', tag, true);
      });
    }

    // Twitter
    this.setMeta('twitter:card', 'summary_large_image');
    this.setMeta('twitter:title', data.title);
    this.setMeta('twitter:description', data.description);
    this.setMeta('twitter:image', this.getAbsoluteUrl(data.image));
  }

  /**
   * Meta tags para perfiles
   */
  setProfileMeta(data) {
    this.setMeta('og:type', 'profile');
    this.setMeta('og:title', data.title);
    this.setMeta('og:description', data.description);
    this.setMeta('og:url', data.url);
    this.setMeta('og:image', this.getAbsoluteUrl(data.image));

    if (data.firstName) {
      this.setMeta('profile:first_name', data.firstName);
    }

    if (data.lastName) {
      this.setMeta('profile:last_name', data.lastName);
    }
  }

  /**
   * Configura Structured Data (Schema.org) JSON-LD
   */
  setStructuredData(type, data) {
    let schema = {};

    switch (type) {
      case 'product':
        schema = this.getProductSchema(data);
        break;
      case 'organization':
        schema = this.getOrganizationSchema(data);
        break;
      case 'local-business':
        schema = this.getLocalBusinessSchema(data);
        break;
      case 'breadcrumb':
        schema = this.getBreadcrumbSchema(data.breadcrumbs);
        break;
      default:
        schema = this.getWebsiteSchema(data);
    }

    this.injectStructuredData(schema);
  }

  /**
   * Schema para Website
   */
  getWebsiteSchema(data) {
    return {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: this.config.siteName,
      url: this.config.siteUrl,
      description: data.description || 'Flores y arreglos florales para todas las ocasiones',
      potentialAction: {
        '@type': 'SearchAction',
        target: `${this.config.siteUrl}/pages/products.html?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    };
  }

  /**
   * Schema para Producto
   */
  getProductSchema(data) {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: data.title,
      description: data.description,
      image: this.getAbsoluteUrl(data.image),
      url: data.url
    };

    if (data.price) {
      schema.offers = {
        '@type': 'Offer',
        price: data.price,
        priceCurrency: 'CLP',
        availability: data.availability ? 
          `https://schema.org/${data.availability}` : 
          : 'https://schema.org/InStock',
        url: data.url
      };
    }

    if (data.rating) {
      schema.aggregateRating = {
        '@type': 'AggregateRating',
        ratingValue: data.rating,
        bestRating: '5',
        worstRating: '1',
        ratingCount: data.ratingCount || '1'
      };
    }

    if (data.brand) {
      schema.brand = {
        '@type': 'Brand',
        name: data.brand
      };
    }

    return schema;
  }

  /**
   * Schema para Organización
   */
  getOrganizationSchema(data = {}) {
    return {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: this.config.siteName,
      url: this.config.siteUrl,
      logo: this.getAbsoluteUrl('/logo.svg'),
      description: 'Expertos en arreglos florales para todas las ocasiones',
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: data.phone || '+56963603177',
        contactType: 'customer service',
        areaServed: 'CL',
        availableLanguage: 'Spanish'
      },
      sameAs: [
        data.facebook || '',
        data.instagram || '',
        data.twitter || ''
      ].filter(Boolean)
    };
  }

  /**
   * Schema para Negocio Local
   */
  getLocalBusinessSchema(data = {}) {
    const config = BUSINESS_CONFIG;
    return {
      '@context': 'https://schema.org',
      '@type': 'FloristShop',
      name: this.config.siteName,
      image: this.getAbsoluteUrl('/logo.svg'),
      url: this.config.siteUrl,
      telephone: data.phone || config.contact?.phone || '+56963603177',
      email: config.contact?.email || 'arreglosvictoriafloreria@gmail.com',
      priceRange: config.company?.priceRange || '$$',
      address: {
        '@type': 'PostalAddress',
        streetAddress: data.address || config.location?.address?.street || 'Pajonales #6723',
        addressLocality: data.city || config.location?.address?.city || 'Santiago',
        addressRegion: data.state || config.location?.address?.state || 'Región Metropolitana',
        postalCode: data.postalCode || config.location?.address?.postalCode || '8581005',
        addressCountry: 'CL'
      },
      geo: data.geo || config.location?.coordinates ? {
              '@type': 'GeoCoordinates',
              latitude: (data.geo || config.location?.coordinates)?.lat,
        longitude: (data.geo || config.location?.coordinates)?.lng
            }
          : undefined,
      openingHoursSpecification: data.hours || config.schedule?.structured || [
          {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            opens: '09:00',
          closes: '18:00'
          },
        ],
      priceRange: '$$',
      servesCuisine: undefined,
      acceptsReservations: 'True'
    };
  }

  /**
   * Schema para Breadcrumb
   */
  getBreadcrumbSchema(breadcrumbs = []) {
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: this.getAbsoluteUrl(item.url)
      })),
    };
  }

  /**
   * Inyecta el structured data en el DOM
   */
  injectStructuredData(schema) {
    // Eliminar script anterior si existe
    const existingScript = document.querySelector('script[data-schema-type]');
    if (existingScript) {
      existingScript.remove();
    }

    // Crear nuevo script
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.dataset.schemaType = schema['@type'];
    script.textContent = JSON.stringify(schema, null, 2);
    document.head.appendChild(script);
  }

  /**
   * Helper: Establece o actualiza un meta tag
   */
  setMeta(property, content, allowMultiple = false) {
    if (!content) return;

    const isOG = property.startsWith('og:');
    const attribute = isOG ? 'property' : 'name';

    if (!allowMultiple) {
      // Buscar meta existente
      let meta = document.querySelector(`meta[${attribute}="${property}"]`);

      if (meta) {
        meta.setAttribute('content', content);
      } else {
        meta = document.createElement('meta');
        meta.setAttribute(attribute, property);
        meta.setAttribute('content', content);
        document.head.appendChild(meta);
      }
    } else {
      // Permitir múltiples (e.g., article:tag)
      const meta = document.createElement('meta');
      meta.setAttribute(attribute, property);
      meta.setAttribute('content', content);
      document.head.appendChild(meta);
    }
  }

  /**
   * Helper: Obtiene contenido de un meta tag
   */
  getMetaContent(name) {
    const meta = document.querySelector(`meta[name="${name}"]`);
    return meta ? meta.getAttribute('content') : null;
  }

  /**
   * Helper: Convierte URL relativa a absoluta
   */
  getAbsoluteUrl(url) {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return new URL(url, this.config.siteUrl).href;
  }

  /**
   * Actualiza el título de la página y meta tags relacionados
   */
  updateTitle(title) {
    document.title = title;
    this.setMeta('og:title', title);
    this.setMeta('twitter:title', title);
  }

  /**
   * Actualiza la descripción y meta tags relacionados
   */
  updateDescription(description) {
    this.setMeta('description', description);
    this.setMeta('og:description', description);
    this.setMeta('twitter:description', description);
  }
}

// Exportar instancia global
window.seoManager = new SEOManager();

// Auto-inicializar con datos básicos del sitio
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    // Detectar si estamos en homepage
    if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
      window.seoManager.setStructuredData('local-business', {
        phone: '+52-XXX-XXX-XXXX',
        address: 'Dirección de la tienda',
        city: 'Ciudad',
        state: 'Estado',
        postalCode: 'CP',
      });
      window.seoManager.setStructuredData('organization');
    }
  });
} else {
  // Ya cargó el DOM
  if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
    window.seoManager.setStructuredData('local-business');
    window.seoManager.setStructuredData('organization');
  }
}

console.log('✅ SEO Manager inicializado');
