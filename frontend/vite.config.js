import { defineConfig } from 'vite';
import { resolve } from 'path';
import { copyFileSync, mkdirSync, existsSync } from 'fs';

// Función para copiar páginas al directorio dist
function copyPages() {
  return {
    name: 'copy-pages',
    closeBundle() {
      const pagesDir = resolve(__dirname, 'pages');
      const distPagesDir = resolve(__dirname, 'dist', 'pages');
      
      if (!existsSync(distPagesDir)) {
        mkdirSync(distPagesDir, { recursive: true });
      }
      
      const pages = [
        'about.html', 'admin-orders.html', 'admin-products.html', 'admin-users.html',
        'admin.html', 'cart.html', 'checkout.html', 'contact.html', 'faq.html',
        'footer-demo.html', 'forgot-password.html', 'invoice.html', 'login.html',
        'new-password.html', 'order-detail.html', 'orders.html', 'privacy.html',
        'product-detail.html', 'products.html', 'profile.html', 'register.html',
        'reset-password.html', 'server-admin.html', 'shipping.html', 'sitemap.html',
        'terms.html', 'test-styles.html', 'testimonials.html', 'wishlist.html'
      ];
      
      pages.forEach(page => {
        const source = resolve(pagesDir, page);
        const dest = resolve(distPagesDir, page);
        try {
          copyFileSync(source, dest);
          console.log(`Copied ${page} to dist/pages/`);
        } catch (err) {
          console.warn(`Could not copy ${page}:`, err.message);
        }
      });
    }
  };
}

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 5175,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    outDir: 'dist',
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './assets'),
    }
  },
  plugins: [
    copyPages()
  ]
});