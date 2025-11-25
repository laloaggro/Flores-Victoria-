#!/usr/bin/env node

/**
 * Script para agregar lazy loading nativo a todas las imágenes
 *
 * Uso:
 *   node add-lazy-images.js
 *
 * Beneficios:
 *   - Diferir carga de imágenes fuera del viewport
 *   - Mejora LCP (Largest Contentful Paint)
 *   - Reduce uso de ancho de banda inicial
 *   - Compatible con todos los navegadores modernos
 */

import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const EXTENSIONS = ['.html'];
const DIRECTORIES = [
  './pages',
  './', // index.html en la raíz
];

/**
 * Procesar un archivo HTML para agregar loading="lazy" a imágenes
 */
async function processHTMLFile(filePath) {
  try {
    let content = await readFile(filePath, 'utf-8');
    let modified = false;

    // Encontrar todas las etiquetas <img> que NO tengan loading="lazy" ni loading="eager"
    const imgRegex = /<img([^>]*?)(?<!loading=['"](?:lazy|eager)['"])([^>]*?)>/gi;

    content = content.replace(imgRegex, (match, before, after) => {
      // Ignorar imágenes que ya tienen loading attribute
      if (/loading=['"]/.test(match)) {
        return match;
      }

      // Ignorar imágenes críticas (above-the-fold) que deben cargarse inmediatamente
      // Logo, hero images, iconos de navegación
      if (
        /class=['"][^'"]*(?:logo|hero|nav-icon|critical)[^'"]*['"]/.test(match) ||
        /id=['"](?:logo|hero-image)['"]/.test(match)
      ) {
        // Agregar loading="eager" explícitamente
        modified = true;
        return `<img${before} loading="eager"${after}>`;
      }

      // Agregar loading="lazy" a todas las demás imágenes
      modified = true;
      return `<img${before} loading="lazy"${after}>`;
    });

    if (modified) {
      await writeFile(filePath, content, 'utf-8');
      console.log(`✅ Procesado: ${filePath}`);
      return true;
    }

    return false;
  } catch (error) {
    console.error(`❌ Error procesando ${filePath}:`, error.message);
    return false;
  }
}

/**
 * Procesar recursivamente un directorio
 */
async function processDirectory(dirPath) {
  const files = await readdir(dirPath, { withFileTypes: true });
  const results = [];

  for (const file of files) {
    const fullPath = join(dirPath, file.name);

    if (file.isDirectory()) {
      // Recursión en subdirectorios
      results.push(...(await processDirectory(fullPath)));
    } else if (EXTENSIONS.some((ext) => file.name.endsWith(ext))) {
      // Procesar archivo HTML
      const processed = await processHTMLFile(fullPath);
      if (processed) {
        results.push(fullPath);
      }
    }
  }

  return results;
}

/**
 * Main
 */
async function main() {
  console.log('🖼️  Agregando lazy loading nativo a imágenes...\n');

  const allProcessed = [];

  for (const dir of DIRECTORIES) {
    try {
      const processed = await processDirectory(dir);
      allProcessed.push(...processed);
    } catch (error) {
      if (error.code !== 'ENOENT') {
        console.error(`❌ Error procesando directorio ${dir}:`, error.message);
      }
    }
  }

  console.log(`\n📊 Resumen:`);
  console.log(`   Archivos procesados: ${allProcessed.length}`);
  console.log(`\n🎯 Beneficios:`);
  console.log(`   - Imágenes fuera del viewport se cargan bajo demanda`);
  console.log(`   - Reducción en uso de ancho de banda inicial`);
  console.log(`   - Mejora en LCP (Largest Contentful Paint)`);
  console.log(`   - Compatible con navegadores modernos (98%+ de usuarios)`);

  if (allProcessed.length > 0) {
    console.log(`\n✨ Archivos modificados:`);
    for (const file of allProcessed) console.log(`   - ${file}`);
  }
}

await main();
