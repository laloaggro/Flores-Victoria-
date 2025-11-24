#!/usr/bin/env node

/**
 * Script para extraer Critical CSS de la página de productos
 * Mejora el FCP (First Contentful Paint) inlineando solo el CSS necesario
 */

const critical = require('critical');
const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '..', 'dist');
const htmlFile = path.join(distDir, 'pages', 'products.html');

console.log('🎨 Extrayendo Critical CSS...\n');

critical.generate({
  // HTML a procesar
  base: distDir,
  src: 'pages/products.html',
  
  // Configuración
  inline: true,  // Inline CSS crítico en el HTML
  minify: true,  // Minificar CSS
  extract: true, // Extraer CSS no crítico a archivo separado
  
  // Dimensiones para "above the fold"
  dimensions: [
    {
      width: 375,   // Mobile
      height: 667,
    },
    {
      width: 1300,  // Desktop
      height: 900,
    },
  ],
  
  // Target donde guardar el resultado
  target: {
    html: 'pages/products.html',
    css: 'assets/css/products-noncritical.css',
  },
  
  // Configuración de Penthouse (engine de Critical)
  penthouse: {
    timeout: 60000,
    renderWaitTime: 1000,
    blockJSRequests: false,
  },
  
  // Ignorar errores de recursos faltantes
  ignore: {
    atrule: ['@font-face'],
    decl: (node, value) => /url\(/.test(value),
  },
})
  .then((output) => {
    console.log('✅ Critical CSS extraído exitosamente!\n');
    
    // Estadísticas
    const criticalSize = Buffer.byteLength(output.css || '', 'utf8');
    console.log(`📊 Estadísticas:`);
    console.log(`  • CSS crítico: ${(criticalSize / 1024).toFixed(2)} KB`);
    console.log(`  • HTML actualizado: pages/products.html`);
    console.log(`  • CSS no crítico: assets/css/products-noncritical.css`);
    
    // Agregar loadCSS para cargar CSS no crítico de forma asíncrona
    const htmlContent = fs.readFileSync(htmlFile, 'utf8');
    
    // Insertar script loadCSS antes de </head>
    const loadCSSScript = `
    <script>
    /*! loadCSS. [c]2017 Filament Group, Inc. MIT License */
    !function(e){"use strict";var t=function(t,n,r,o){var i,d=e.document,a=d.createElement("link");if(n)i=n;else{var s=(d.body||d.getElementsByTagName("head")[0]).childNodes;i=s[s.length-1]}var l=d.styleSheets;if(o)for(var f in o)o.hasOwnProperty(f)&&a.setAttribute(f,o[f]);a.rel="stylesheet",a.href=t,a.media="only x",function e(t){if(d.body)return t();setTimeout(function(){e(t)})}(function(){i.parentNode.insertBefore(a,n?i:i.nextSibling)});var u=function(e){for(var t=a.href,n=l.length;n--;)if(l[n].href===t)return e();setTimeout(function(){u(e)})};return a.addEventListener&&a.addEventListener("load",function(){this.media="all"}),a.onloadcssdefined=u,u(function(){a.media!==r&&(a.media=r)}),a};"undefined"!=typeof exports?exports.loadCSS=t:e.loadCSS=t}("undefined"!=typeof global?global:this);
    
    // Cargar CSS no crítico
    loadCSS('/assets/css/products-noncritical.css');
    </script>
  </head>`;
    
    const updatedHTML = htmlContent.replace('</head>', loadCSSScript);
    fs.writeFileSync(htmlFile, updatedHTML, 'utf8');
    
    console.log('\n✨ Optimización completada!');
    console.log('\n💡 Próximo paso: Deploy con ./scripts/deploy-oracle-cloud.sh');
  })
  .catch((err) => {
    console.error('❌ Error al extraer Critical CSS:', err.message);
    process.exit(1);
  });
