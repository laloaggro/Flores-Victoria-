/**
 * Configuración centralizada del negocio - Arreglos Victoria
 * Todos los datos de contacto, ubicación y redes sociales en un solo lugar
 */

export const BUSINESS_CONFIG = {
  // Información básica
  name: 'Arreglos Victoria',
  legalName: 'Arreglos Florales Victoria S.A. de C.V.',
  slogan: 'Flores que expresan lo que sientes',
  description: 'Expertos en arreglos florales para todas las ocasiones. Bodas, cumpleaños, eventos corporativos y más.',
  
  // Contacto
  contact: {
    phone: '+56963603177',
    phoneFormatted: '+56 9 6360 3177',
    email: 'arreglosvictoriafloreria@gmail.com',
    whatsapp: '+56963603177', // Formato internacional sin espacios
    whatsappFormatted: '+56 9 6360 3177'
  },
  
  // Ubicación
  location: {
    address: {
      street: 'Pajonales #6723',
      neighborhood: 'Huechuraba',
      city: 'Santiago',
      state: 'Región Metropolitana',
      country: 'Chile',
      postalCode: '8581005',
      fullAddress: 'Pajonales #6723, Huechuraba, Santiago, Región Metropolitana, Chile'
    },
    // Coordenadas GPS (Pajonales 6723, Huechuraba - aproximadas)
    coordinates: {
      lat: -33.3694,
      lng: -70.6428
    },
    // URL de Google Maps
    mapsUrl: 'https://maps.google.com/?q=-33.3694,-70.6428'
  },
  
  // Horarios de atención
  schedule: {
    // Formato para humanos
    display: {
      weekdays: 'Lunes a Viernes: 9:00 AM - 7:00 PM',
      saturday: 'Sábado: 9:00 AM - 6:00 PM',
      sunday: 'Domingo: 10:00 AM - 3:00 PM'
    },
    // Formato structured data
    structured: [
      {
        '@type': 'OpeningHoursSpecification',
        'dayOfWeek': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        'opens': '09:00',
        'closes': '19:00'
      },
      {
        '@type': 'OpeningHoursSpecification',
        'dayOfWeek': 'Saturday',
        'opens': '09:00',
        'closes': '18:00'
      },
      {
        '@type': 'OpeningHoursSpecification',
        'dayOfWeek': 'Sunday',
        'opens': '10:00',
        'closes': '15:00'
      }
    ],
    // Para verificación en código
    isOpen: () => {
      const now = new Date();
      const day = now.getDay(); // 0 = Domingo, 6 = Sábado
      const hour = now.getHours();
      
      if (day === 0) { // Domingo
        return hour >= 10 && hour < 15;
      } else if (day === 6) { // Sábado
        return hour >= 9 && hour < 18;
      } else { // Lunes a Viernes
        return hour >= 9 && hour < 19;
      }
    }
  },
  
  // Redes sociales
  social: {
    facebook: 'https://www.facebook.com/profile.php?id=61578999845743',
    instagram: 'https://www.instagram.com/arreglosvictoria/',
    twitter: 'https://twitter.com/arreglosvictoria',
    tiktok: 'https://tiktok.com/@arreglosvictoria',
    youtube: 'https://youtube.com/@arreglosvictoria',
    pinterest: 'https://pinterest.com/arreglosvictoria'
  },
  
  // URLs del sitio
  urls: {
    site: typeof window !== 'undefined' ? window.location.origin : 'https://arreglosvictoria.com',
    blog: '/blog',
    shop: '/pages/products.html',
    contact: '/pages/contact.html',
    about: '/pages/about.html'
  },
  
  // Información de la empresa
  company: {
    founded: 1980,
    rfc: 'N/A', // Chile no usa RFC (es de México)
    rut: '16123271-8', // RUT chileno
    employees: '10-50',
    priceRange: '$$',
    acceptsReservations: true,
    deliveryAvailable: true,
    paymentMethods: ['Efectivo', 'Tarjeta de Crédito', 'Tarjeta de Débito', 'Transferencia', 'WebPay']
  },
  
  // Configuración SEO
  seo: {
    defaultTitle: 'Arreglos Victoria - Flores y Arreglos Florales en Santiago, Chile',
    titleTemplate: '%s | Arreglos Victoria',
    defaultDescription: 'La mejor selección de flores y arreglos florales para todas las ocasiones. Entrega a domicilio en Santiago y alrededores.',
    keywords: ['flores', 'arreglos florales', 'rosas', 'bouquets', 'florería', 'entrega flores', 'Santiago', 'Chile', 'Huechuraba'],
    ogImage: '/images/og-default.jpg',
    twitterHandle: '@arreglosvictoria',
    locale: 'es_CL',
    type: 'website'
  },
  
  // Configuración PWA
  pwa: {
    themeColor: '#2d5016',
    backgroundColor: '#ffffff',
    orientation: 'portrait-primary',
    display: 'standalone'
  },
  
  // Servicios principales
  services: [
    {
      name: 'Arreglos para Bodas',
      description: 'Decoración floral completa para tu día especial',
      icon: '💐'
    },
    {
      name: 'Eventos Corporativos',
      description: 'Arreglos elegantes para oficinas y eventos',
      icon: '🏢'
    },
    {
      name: 'Entrega a Domicilio',
      description: 'Llevamos tus flores donde las necesites',
      icon: '🚚'
    },
    {
      name: 'Arreglos Personalizados',
      description: 'Diseños únicos según tus preferencias',
      icon: '🎨'
    }
  ],
  
  // Categorías de productos
  categories: [
    { slug: 'rosas', name: 'Rosas', icon: '🌹' },
    { slug: 'tulipanes', name: 'Tulipanes', icon: '🌷' },
    { slug: 'orquideas', name: 'Orquídeas', icon: '🌸' },
    { slug: 'girasoles', name: 'Girasoles', icon: '🌻' },
    { slug: 'bouquets', name: 'Bouquets', icon: '💐' },
    { slug: 'arreglos', name: 'Arreglos Especiales', icon: '🎁' }
  ]
};

// Helpers para acceso rápido
export const getPhoneLink = () => `tel:${BUSINESS_CONFIG.contact.phone}`;
export const getWhatsAppLink = (message = '') => {
  const encoded = message ? `?text=${encodeURIComponent(message)}` : '';
  return `https://wa.me/${BUSINESS_CONFIG.contact.whatsapp}${encoded}`;
};
export const getEmailLink = (subject = '', body = '') => {
  const params = new URLSearchParams();
  if (subject) params.append('subject', subject);
  if (body) params.append('body', body);
  const query = params.toString() ? `?${params.toString()}` : '';
  return `mailto:${BUSINESS_CONFIG.contact.email}${query}`;
};
export const getMapsLink = () => BUSINESS_CONFIG.location.mapsUrl;

// Exportar como default
export default BUSINESS_CONFIG;

// Si no hay soporte de módulos, exportar globalmente
if (typeof window !== 'undefined' && !window.BUSINESS_CONFIG) {
  window.BUSINESS_CONFIG = BUSINESS_CONFIG;
  window.getPhoneLink = getPhoneLink;
  window.getWhatsAppLink = getWhatsAppLink;
  window.getEmailLink = getEmailLink;
  window.getMapsLink = getMapsLink;
}
