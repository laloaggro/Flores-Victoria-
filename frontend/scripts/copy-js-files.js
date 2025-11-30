#!/usr/bin/env node

/**
 * Script para copiar archivos JS al dist después del build de Vite
 */

const fs = require('fs');
const path = require('path');

const sourceDir = path.join(__dirname, '..', 'js');
const targetDir = path.join(__dirname, '..', 'dist', 'js');

console.log('\n📁 === COPY JS FILES SCRIPT ===');
console.log(`📂 Working directory: ${process.cwd()}`);
console.log(`📂 Script location: ${__dirname}`);
console.log(`📂 Source directory: ${sourceDir}`);
console.log(`📂 Target directory: ${targetDir}`);
console.log('');

/**
 * Copia recursivamente un directorio
 */
function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();

  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

try {
  console.log('\n📁 Copiando archivos JS al dist...\n');
  
  if (!fs.existsSync(sourceDir)) {
    console.error(`❌ Error: Directorio fuente no encontrado: ${sourceDir}`);
    process.exit(1);
  }

  copyRecursiveSync(sourceDir, targetDir);
  
  // Contar archivos copiados
  let fileCount = 0;
  function countFiles(dir) {
    fs.readdirSync(dir).forEach((file) => {
      const fullPath = path.join(dir, file);
      if (fs.statSync(fullPath).isDirectory()) {
        countFiles(fullPath);
      } else {
        fileCount++;
      }
    });
  }
  countFiles(targetDir);

  console.log(`✅ ${fileCount} archivos JS copiados exitosamente a dist/js/\n`);
} catch (error) {
  console.error('❌ Error copiando archivos JS:', error.message);
  process.exit(1);
}
