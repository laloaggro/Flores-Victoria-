const express = require('express');
const { createLogger } = require('./logger');

const logger = createLogger('i18n-service');
const app = express();

// Middleware
app.use(express.json());

// Datos de traducción (en una implementación real, esto vendría de una base de datos)
const translations = {
  es: {
    welcome: 'Bienvenido',
    products: 'Productos',
    product_details: 'Detalles del Producto',
    add_to_cart: 'Añadir al Carrito',
    checkout: 'Finalizar Compra',
    order_history: 'Historial de Pedidos',
    contact_us: 'Contáctenos',
    login: 'Iniciar Sesión',
    register: 'Registrarse',
    logout: 'Cerrar Sesión',
    profile: 'Perfil',
    admin_panel: 'Panel de Administración',
    search: 'Buscar',
    cart: 'Carrito',
    total: 'Total',
    quantity: 'Cantidad',
    price: 'Precio',
    description: 'Descripción',
    category: 'Categoría',
  },
  en: {
    welcome: 'Welcome',
    products: 'Products',
    product_details: 'Product Details',
    add_to_cart: 'Add to Cart',
    checkout: 'Checkout',
    order_history: 'Order History',
    contact_us: 'Contact Us',
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    profile: 'Profile',
    admin_panel: 'Admin Panel',
    search: 'Search',
    cart: 'Cart',
    total: 'Total',
    quantity: 'Quantity',
    price: 'Price',
    description: 'Description',
    category: 'Category',
  },
  fr: {
    welcome: 'Bienvenue',
    products: 'Produits',
    product_details: 'Détails du Produit',
    add_to_cart: 'Ajouter au Panier',
    checkout: 'Paiement',
    order_history: 'Historique des Commandes',
    contact_us: 'Contactez-nous',
    login: 'Se Connecter',
    register: "S'inscrire",
    logout: 'Se Déconnecter',
    profile: 'Profil',
    admin_panel: "Panneau d'Administration",
    search: 'Recherche',
    cart: 'Panier',
    total: 'Total',
    quantity: 'Quantité',
    price: 'Prix',
    description: 'Description',
    category: 'Catégorie',
  },
};

// Ruta para obtener traducciones
app.get('/translations/:lang', (req, res) => {
  try {
    const { lang } = req.params;
    const langTranslations = translations[lang] || translations['es']; // Por defecto español

    res.status(200).json({
      language: lang,
      translations: langTranslations,
    });
  } catch (error) {
    logger.error('Error al obtener traducciones:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Ruta para obtener una traducción específica
app.get('/translate/:lang/:key', (req, res) => {
  try {
    const { lang, key } = req.params;
    const langTranslations = translations[lang] || translations['es']; // Por defecto español
    const translation = langTranslations[key] || key; // Devolver la clave si no se encuentra la traducción

    res.status(200).json({
      language: lang,
      key,
      translation,
    });
  } catch (error) {
    logger.error('Error al obtener traducción:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Ruta para obtener todas las traducciones disponibles
app.get('/languages', (req, res) => {
  try {
    const languages = Object.keys(translations);
    res.status(200).json({ languages });
  } catch (error) {
    logger.error('Error al obtener idiomas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Ruta para agregar una nueva traducción
app.post('/translations/:lang', (req, res) => {
  try {
    const { lang } = req.params;
    const { key, translation } = req.body;

    if (!translations[lang]) {
      translations[lang] = {};
    }

    translations[lang][key] = translation;

    logger.info(`Nueva traducción agregada para ${lang}`, { key, translation });
    res.status(201).json({ message: 'Traducción agregada correctamente' });
  } catch (error) {
    logger.error('Error al agregar traducción:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', service: 'i18n-service' });
});

const PORT = process.env.PORT || 3007;
app.listen(PORT, '0.0.0.0', () => {
  logger.info(`Servicio de internacionalización ejecutándose en el puerto ${PORT}`);
});

module.exports = app;
