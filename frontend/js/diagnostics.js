/**
 * ============================================================================
 * Sistema de Diagnóstico - Flores Victoria v2.0.0
 * ============================================================================
 * 
 * Herramienta para verificar el estado de todos los componentes y configuración.
 * 
 * Uso en consola del navegador:
 *   FloresVictoriaDiagnostics.runAll()
 *   FloresVictoriaDiagnostics.checkComponents()
 *   FloresVictoriaDiagnostics.checkConfig()
 */

(function () {
  'use strict';

  const FloresVictoriaDiagnostics = {
    version: '2.0.0',

    /**
     * Ejecuta todos los diagnósticos
     */
    runAll() {
      console.group('🔍 Diagnóstico Completo - Flores Victoria v2.0.0');
      this.checkConfig();
      this.checkComponents();
      this.checkLoader();
      this.checkStorage();
      this.checkPerformance();
      console.groupEnd();
    },

    /**
     * Verifica configuración global
     */
    checkConfig() {
      console.group('⚙️ Configuración Global');
      
      if (window.FloresVictoriaConfig) {
        const config = window.FloresVictoriaConfig;
        console.log('✅ FloresVictoriaConfig encontrado');
        console.table({
          'Sitio': config.siteName,
          'URL': config.siteUrl,
          'Versión': config.version,
          'WhatsApp': config.whatsappNumber,
          'Email': config.email,
          'Phone': config.phone,
          'GA ID': config.gaId || 'No configurado',
        });

        // Features
        if (config.features) {
          console.log('🎯 Features habilitados:');
          console.table(config.features);
        }
      } else {
        console.error('❌ FloresVictoriaConfig NO encontrado');
      }

      console.groupEnd();
    },

    /**
     * Verifica componentes cargados
     */
    checkComponents() {
      console.group('🧩 Componentes');

      const components = {
        'HeaderComponent': typeof HeaderComponent !== 'undefined',
        'FooterComponent': typeof FooterComponent !== 'undefined',
        'BreadcrumbsComponent': typeof BreadcrumbsComponent !== 'undefined',
        'CartManager': typeof CartManager !== 'undefined',
        'Toast': typeof Toast !== 'undefined',
        'LoadingComponent': typeof LoadingComponent !== 'undefined',
        'WhatsAppCTA': typeof WhatsAppCTA !== 'undefined',
        'Analytics': typeof Analytics !== 'undefined',
        'FormValidatorComponent': typeof FormValidatorComponent !== 'undefined',
        'HeadMetaComponent': typeof HeadMetaComponent !== 'undefined',
      };

      const loaded = Object.values(components).filter(Boolean).length;
      const total = Object.keys(components).length;

      console.log(`📊 Componentes: ${loaded}/${total} cargados`);
      
      Object.entries(components).forEach(([name, isLoaded]) => {
        console.log(`${isLoaded ? '✅' : '❌'} ${name}`);
      });

      console.groupEnd();
    },

    /**
     * Verifica estado del loader
     */
    checkLoader() {
      console.group('🚀 Components Loader');

      if (window.FloresVictoriaLoader) {
        const loader = window.FloresVictoriaLoader;
        console.log('✅ FloresVictoriaLoader encontrado');
        console.log('📦 Componentes cargados:', loader.loaded);
        console.log('⏳ Cargando:', loader.loading);
        console.log('❌ Fallidos:', loader.failed);

        const metrics = loader.getMetrics();
        if (metrics.performance && Object.keys(metrics.performance).length > 0) {
          console.log('⚡ Métricas de rendimiento:');
          console.table(metrics.performance);
        }
      } else {
        console.error('❌ FloresVictoriaLoader NO encontrado');
      }

      console.groupEnd();
    },

    /**
     * Verifica localStorage
     */
    checkStorage() {
      console.group('💾 LocalStorage');

      try {
        const cart = localStorage.getItem('flores-victoria-cart');
        if (cart) {
          const items = JSON.parse(cart);
          console.log(`🛒 Carrito: ${items.length} items`);
          console.table(items.map(item => ({
            ID: item.id,
            Nombre: item.name,
            Cantidad: item.quantity,
            Precio: item.price,
            Subtotal: item.quantity * item.price,
          })));
        } else {
          console.log('🛒 Carrito vacío');
        }

        const wishlist = localStorage.getItem('flores-victoria-wishlist');
        if (wishlist) {
          const items = JSON.parse(wishlist);
          console.log(`❤️ Wishlist: ${items.length} items`);
        } else {
          console.log('❤️ Wishlist vacío');
        }

        // Espacio usado
        let totalSize = 0;
        for (let key in localStorage) {
          if (localStorage.hasOwnProperty(key)) {
            totalSize += localStorage[key].length + key.length;
          }
        }
        const sizeKB = (totalSize / 1024).toFixed(2);
        const maxSize = 5120; // 5MB aprox
        const percentage = ((totalSize / 1024 / maxSize) * 100).toFixed(2);

        console.log(`💽 Espacio usado: ${sizeKB} KB (~${percentage}% de ~5MB)`);

      } catch (error) {
        console.error('❌ Error accediendo a localStorage:', error);
      }

      console.groupEnd();
    },

    /**
     * Verifica métricas de rendimiento
     */
    checkPerformance() {
      console.group('⚡ Rendimiento');

      if (window.performance && window.performance.timing) {
        const timing = window.performance.timing;
        const metrics = {
          'DNS Lookup': timing.domainLookupEnd - timing.domainLookupStart,
          'TCP Connection': timing.connectEnd - timing.connectStart,
          'Request': timing.responseStart - timing.requestStart,
          'Response': timing.responseEnd - timing.responseStart,
          'DOM Processing': timing.domComplete - timing.domLoading,
          'Load Complete': timing.loadEventEnd - timing.navigationStart,
        };

        console.table(
          Object.entries(metrics).map(([metric, time]) => ({
            Métrica: metric,
            Tiempo: `${time}ms`,
            Estado: time < 1000 ? '✅ Rápido' : time < 3000 ? '⚠️ Medio' : '❌ Lento',
          }))
        );

        // Navigation Timing API
        if (window.performance.getEntriesByType) {
          const navigation = window.performance.getEntriesByType('navigation')[0];
          if (navigation) {
            console.log('📊 Navigation Timing:');
            console.table({
              'Redirect Time': `${navigation.redirectEnd - navigation.redirectStart}ms`,
              'DNS Time': `${navigation.domainLookupEnd - navigation.domainLookupStart}ms`,
              'TCP Time': `${navigation.connectEnd - navigation.connectStart}ms`,
              'Request Time': `${navigation.responseStart - navigation.requestStart}ms`,
              'Response Time': `${navigation.responseEnd - navigation.responseStart}ms`,
              'DOM Processing': `${navigation.domComplete - navigation.domInteractive}ms`,
              'Load Complete': `${navigation.loadEventEnd - navigation.loadEventStart}ms`,
            });
          }
        }
      } else {
        console.warn('⚠️ Performance API no disponible');
      }

      console.groupEnd();
    },

    /**
     * Verifica rutas de componentes
     */
    checkPaths() {
      console.group('📁 Verificación de Rutas');

      const paths = [
        '/js/components/core-bundle.js',
        '/js/components/common-bundle.js',
        '/js/components/components-loader.js',
        '/js/components/header-component.js',
        '/js/components/footer-component.js',
        '/js/components/cart-manager.js',
        '/js/components/toast.js',
        '/js/components/loading.js',
        '/js/components/whatsapp-cta.js',
        '/js/components/analytics.js',
        '/js/components/breadcrumbs.js',
        '/js/components/form-validator.js',
        '/js/components/head-meta.js',
      ];

      console.log('Verificando existencia de archivos...');
      paths.forEach((path) => {
        fetch(path, { method: 'HEAD' })
          .then((response) => {
            console.log(`${response.ok ? '✅' : '❌'} ${path}`);
          })
          .catch(() => {
            console.log(`❌ ${path} - Error de red`);
          });
      });

      console.groupEnd();
    },

    /**
     * Genera reporte completo
     */
    generateReport() {
      const report = {
        timestamp: new Date().toISOString(),
        version: this.version,
        config: window.FloresVictoriaConfig || null,
        components: {
          loaded: window.FloresVictoriaLoader?.loaded || [],
          loading: window.FloresVictoriaLoader?.loading || [],
          failed: window.FloresVictoriaLoader?.failed || [],
        },
        storage: {
          cartItems: 0,
          wishlistItems: 0,
          sizeKB: 0,
        },
        performance: {},
      };

      // Storage
      try {
        const cart = localStorage.getItem('flores-victoria-cart');
        if (cart) report.storage.cartItems = JSON.parse(cart).length;

        const wishlist = localStorage.getItem('flores-victoria-wishlist');
        if (wishlist) report.storage.wishlistItems = JSON.parse(wishlist).length;

        let totalSize = 0;
        for (let key in localStorage) {
          if (localStorage.hasOwnProperty(key)) {
            totalSize += localStorage[key].length + key.length;
          }
        }
        report.storage.sizeKB = (totalSize / 1024).toFixed(2);
      } catch (error) {
        report.storage.error = error.message;
      }

      console.log('📋 Reporte Completo:');
      console.log(JSON.stringify(report, null, 2));

      return report;
    },
  };

  // Exponer API global
  window.FloresVictoriaDiagnostics = FloresVictoriaDiagnostics;

  console.log('🔍 Sistema de Diagnóstico v2.0.0 cargado');
  console.log('💡 Ejecuta FloresVictoriaDiagnostics.runAll() para diagnóstico completo');
})();
