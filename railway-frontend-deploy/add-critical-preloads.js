#!/usr/bin/env node

/**
 * Script para agregar preload de recursos críticos en HTML
 *
 * Recursos críticos:
 *   - Fuentes web (woff2)
 *   - CSS crítico
 *   - JavaScript core
 *
 * Uso:
 *   node add-critical-preloads.js
 *
 * Beneficios:
 *   - Mejora FCP (First Contentful Paint)
 *   - Reduce tiempo de carga de recursos críticos
 *   - Previene FOIT/FOUT en fuentes
 */

import { readFile, writeFile } from 'node:fs/promises';

const HTML_FILES = [
  './index.html',
  './pages/products.html',
  './pages/cart.html',
  './pages/checkout.html',
];

// Recursos críticos a precargar
const CRITICAL_RESOURCES = [
  {
    href: '/fonts/playfair-display-700.woff2',
    as: 'font',
    type: 'font/woff2',
    crossorigin: 'anonymous',
  },
  {
    href: '/css/styles.css',
    as: 'style',
  },
  {
    href: '/js/core-bundle.js',
    as: 'script',
  },
];

/**
 * Generar etiquetas de preload
 */
function generatePreloadTags() {
  return CRITICAL_RESOURCES.map((resource) => {
    const attrs = ['rel="preload"', `href="${resource.href}"`, `as="${resource.as}"`];

    if (resource.type) attrs.push(`type="${resource.type}"`);
    if (resource.crossorigin) attrs.push(`crossorigin="${resource.crossorigin}"`);

    return `  <link ${attrs.join(' ')}>`;
  }).join('\n');
}

/**
 * Procesar un archivo HTML
 */
async function processHTMLFile(filePath) {
  try {
    let content = await readFile(filePath, 'utf-8');

    // Verificar si ya tiene preloads
    if (content.includes('rel="preload"')) {
      console.log(`⏭️  Saltado (ya tiene preloads): ${filePath}`);
      return false;
    }

    const preloadTags = generatePreloadTags();

    // Insertar después de la etiqueta <head> o antes del primer <link>
    const headRegex = /(<head[^>]*>)/i;

    if (headRegex.test(content)) {
      content = content.replace(
        headRegex,
        `$1\n  <!-- 🚀 Preload de recursos críticos -->\n${preloadTags}\n`
      );

      await writeFile(filePath, content, 'utf-8');
      console.log(`✅ Procesado: ${filePath}`);
      return true;
    } else {
      console.log(`⚠️  No se encontró <head> en: ${filePath}`);
      return false;
    }
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log(`⏭️  Archivo no encontrado: ${filePath}`);
      return false;
    }
    console.error(`❌ Error procesando ${filePath}:`, error.message);
    return false;
  }
}

/**
 * Main
 */
async function main() {
  console.log('🚀 Agregando preload de recursos críticos...\n');

  let processed = 0;

  for (const file of HTML_FILES) {
    if (await processHTMLFile(file)) {
      processed++;
    }
  }

  console.log(`\n📊 Resumen:`);
  console.log(`   Archivos procesados: ${processed}/${HTML_FILES.length}`);
  console.log(`\n🎯 Recursos críticos precargados:`);
  for (const r of CRITICAL_RESOURCES) {
    console.log(`   - ${r.href} (${r.as})`);
  }
  console.log(`\n✨ Beneficios esperados:`);
  console.log(`   - Mejora FCP en ~200-400ms`);
  console.log(`   - Previene FOIT (Flash of Invisible Text) en fuentes`);
  console.log(`   - Reduce tiempo de descubrimiento de recursos críticos`);
}

await main();
