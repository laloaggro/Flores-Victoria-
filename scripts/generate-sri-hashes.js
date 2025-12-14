#!/usr/bin/env node

/**
 * @fileoverview SRI Hash Generator
 * @description Genera hashes SHA-384 para Subresource Integrity de assets externos
 * @author Flores Victoria Team
 * @version 1.0.0
 * 
 * Uso: node scripts/generate-sri-hashes.js [--verify] [--output sri-manifest.json]
 */

const https = require('https');
const http = require('http');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// URLs de CDN externos usados en el proyecto
const CDN_RESOURCES = [
  // Fuentes
  {
    name: 'Google Fonts - Inter',
    url: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
    type: 'style',
  },
  // Iconos
  {
    name: 'Material Icons',
    url: 'https://fonts.googleapis.com/icon?family=Material+Icons',
    type: 'style',
  },
  // Bibliotecas JS populares (si se usan)
  {
    name: 'Alpine.js',
    url: 'https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js',
    type: 'script',
    optional: true,
  },
];

/**
 * Descarga contenido de una URL
 * @param {string} url
 * @returns {Promise<Buffer>}
 */
function downloadContent(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    protocol.get(url, { timeout: 10000 }, (response) => {
      // Manejar redirecciones
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        return downloadContent(response.headers.location).then(resolve).catch(reject);
      }
      
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode} for ${url}`));
        return;
      }
      
      const chunks = [];
      response.on('data', chunk => chunks.push(chunk));
      response.on('end', () => resolve(Buffer.concat(chunks)));
      response.on('error', reject);
    }).on('error', reject);
  });
}

/**
 * Genera hash SRI para un contenido
 * @param {Buffer} content
 * @param {string} algorithm
 * @returns {string}
 */
function generateSRIHash(content, algorithm = 'sha384') {
  const hash = crypto.createHash(algorithm).update(content).digest('base64');
  return `${algorithm}-${hash}`;
}

/**
 * Genera hashes para archivos locales
 * @param {string} filePath
 * @returns {string}
 */
function generateLocalSRI(filePath) {
  const absolutePath = path.resolve(filePath);
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`File not found: ${filePath}`);
  }
  const content = fs.readFileSync(absolutePath);
  return generateSRIHash(content);
}

/**
 * Escanea archivos HTML para encontrar recursos externos
 * @param {string} dir
 * @returns {Array}
 */
function scanHTMLForExternalResources(dir) {
  const resources = [];
  const htmlFiles = findFiles(dir, '.html');
  
  htmlFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    
    // Buscar scripts externos
    const scriptRegex = /<script[^>]+src=["']([^"']+)["'][^>]*>/gi;
    let match;
    while ((match = scriptRegex.exec(content)) !== null) {
      const src = match[1];
      if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('//')) {
        resources.push({
          type: 'script',
          url: src.startsWith('//') ? `https:${src}` : src,
          foundIn: file,
        });
      }
    }
    
    // Buscar stylesheets externos
    const linkRegex = /<link[^>]+href=["']([^"']+)["'][^>]*rel=["']stylesheet["'][^>]*>/gi;
    const linkRegex2 = /<link[^>]+rel=["']stylesheet["'][^>]*href=["']([^"']+)["'][^>]*>/gi;
    
    [linkRegex, linkRegex2].forEach(regex => {
      while ((match = regex.exec(content)) !== null) {
        const href = match[1];
        if (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('//')) {
          resources.push({
            type: 'style',
            url: href.startsWith('//') ? `https:${href}` : href,
            foundIn: file,
          });
        }
      }
    });
  });
  
  // Eliminar duplicados
  const unique = [];
  const seen = new Set();
  resources.forEach(r => {
    if (!seen.has(r.url)) {
      seen.add(r.url);
      unique.push(r);
    }
  });
  
  return unique;
}

/**
 * Encuentra archivos recursivamente
 * @param {string} dir
 * @param {string} ext
 * @returns {string[]}
 */
function findFiles(dir, ext) {
  const results = [];
  
  if (!fs.existsSync(dir)) return results;
  
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      // Ignorar node_modules y carpetas ocultas
      if (!item.startsWith('.') && item !== 'node_modules') {
        results.push(...findFiles(fullPath, ext));
      }
    } else if (item.endsWith(ext)) {
      results.push(fullPath);
    }
  }
  
  return results;
}

/**
 * Verifica SRI existente contra contenido actual
 * @param {Object} manifest
 * @returns {Promise<Object>}
 */
async function verifySRI(manifest) {
  const results = {
    valid: [],
    invalid: [],
    errors: [],
  };
  
  for (const [url, data] of Object.entries(manifest.resources || {})) {
    try {
      const content = await downloadContent(url);
      const currentHash = generateSRIHash(content);
      
      if (currentHash === data.integrity) {
        results.valid.push({ url, hash: currentHash });
      } else {
        results.invalid.push({
          url,
          expected: data.integrity,
          actual: currentHash,
        });
      }
    } catch (error) {
      results.errors.push({ url, error: error.message });
    }
  }
  
  return results;
}

/**
 * Genera manifest completo de SRI
 */
async function generateManifest(options = {}) {
  const manifest = {
    version: '1.0.0',
    generated: new Date().toISOString(),
    algorithm: 'sha384',
    resources: {},
  };
  
  console.log('🔍 Scanning for external resources...\n');
  
  // Escanear archivos HTML
  const frontendDir = path.resolve(__dirname, '..', 'frontend');
  const adminDir = path.resolve(__dirname, '..', 'admin-panel');
  
  const foundResources = [
    ...scanHTMLForExternalResources(frontendDir),
    ...scanHTMLForExternalResources(adminDir),
  ];
  
  // Combinar con recursos conocidos
  const allResources = [...CDN_RESOURCES];
  foundResources.forEach(r => {
    if (!allResources.find(ar => ar.url === r.url)) {
      allResources.push(r);
    }
  });
  
  console.log(`📦 Found ${allResources.length} external resources\n`);
  
  // Generar hashes
  for (const resource of allResources) {
    process.stdout.write(`  Processing: ${resource.name || resource.url}...`);
    
    try {
      const content = await downloadContent(resource.url);
      const hash = generateSRIHash(content);
      
      manifest.resources[resource.url] = {
        name: resource.name || path.basename(resource.url),
        type: resource.type,
        integrity: hash,
        crossorigin: 'anonymous',
        size: content.length,
        lastVerified: new Date().toISOString(),
      };
      
      console.log(' ✅');
    } catch (error) {
      console.log(` ❌ ${error.message}`);
      
      if (!resource.optional) {
        manifest.resources[resource.url] = {
          name: resource.name || path.basename(resource.url),
          type: resource.type,
          error: error.message,
          lastAttempt: new Date().toISOString(),
        };
      }
    }
  }
  
  return manifest;
}

/**
 * Genera código HTML con SRI
 * @param {Object} manifest
 * @returns {string}
 */
function generateHTMLSnippets(manifest) {
  const lines = ['<!-- SRI-Protected External Resources -->', ''];
  
  for (const [url, data] of Object.entries(manifest.resources)) {
    if (data.error) continue;
    
    if (data.type === 'script') {
      lines.push(`<script src="${url}" integrity="${data.integrity}" crossorigin="anonymous"></script>`);
    } else if (data.type === 'style') {
      lines.push(`<link rel="stylesheet" href="${url}" integrity="${data.integrity}" crossorigin="anonymous">`);
    }
  }
  
  return lines.join('\n');
}

/**
 * Función principal
 */
async function main() {
  const args = process.argv.slice(2);
  const verify = args.includes('--verify');
  const outputIndex = args.indexOf('--output');
  const outputFile = outputIndex !== -1 ? args[outputIndex + 1] : 'sri-manifest.json';
  
  console.log('\n🔐 SRI Hash Generator for Flores Victoria\n');
  console.log('='.repeat(50) + '\n');
  
  const outputPath = path.resolve(__dirname, '..', outputFile);
  
  if (verify && fs.existsSync(outputPath)) {
    console.log('🔍 Verifying existing SRI manifest...\n');
    
    const manifest = JSON.parse(fs.readFileSync(outputPath, 'utf8'));
    const results = await verifySRI(manifest);
    
    console.log('\n📊 Verification Results:\n');
    console.log(`  ✅ Valid: ${results.valid.length}`);
    console.log(`  ❌ Invalid: ${results.invalid.length}`);
    console.log(`  ⚠️  Errors: ${results.errors.length}`);
    
    if (results.invalid.length > 0) {
      console.log('\n⚠️  Invalid hashes detected:');
      results.invalid.forEach(r => {
        console.log(`\n  URL: ${r.url}`);
        console.log(`  Expected: ${r.expected}`);
        console.log(`  Actual:   ${r.actual}`);
      });
    }
    
    if (results.errors.length > 0) {
      console.log('\n⚠️  Errors during verification:');
      results.errors.forEach(r => {
        console.log(`  ${r.url}: ${r.error}`);
      });
    }
    
    process.exit(results.invalid.length > 0 ? 1 : 0);
  }
  
  // Generar nuevo manifest
  const manifest = await generateManifest();
  
  // Guardar manifest
  fs.writeFileSync(outputPath, JSON.stringify(manifest, null, 2));
  console.log(`\n📝 Manifest saved to: ${outputPath}`);
  
  // Generar snippets HTML
  const snippets = generateHTMLSnippets(manifest);
  const snippetsPath = path.resolve(__dirname, '..', 'sri-snippets.html');
  fs.writeFileSync(snippetsPath, snippets);
  console.log(`📝 HTML snippets saved to: ${snippetsPath}`);
  
  // Resumen
  const resourceCount = Object.keys(manifest.resources).length;
  const errorCount = Object.values(manifest.resources).filter(r => r.error).length;
  
  console.log('\n' + '='.repeat(50));
  console.log('\n📊 Summary:\n');
  console.log(`  Total resources: ${resourceCount}`);
  console.log(`  Successful: ${resourceCount - errorCount}`);
  console.log(`  Errors: ${errorCount}`);
  console.log('\n✅ Done!\n');
  
  // Mostrar ejemplo de uso
  console.log('💡 Usage example:\n');
  console.log('  Add these attributes to your script/link tags:');
  console.log('  integrity="sha384-..." crossorigin="anonymous"\n');
}

// Ejecutar si es el script principal
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Error:', error.message);
    process.exit(1);
  });
}

module.exports = {
  generateSRIHash,
  generateLocalSRI,
  downloadContent,
  scanHTMLForExternalResources,
  generateManifest,
  verifySRI,
};
