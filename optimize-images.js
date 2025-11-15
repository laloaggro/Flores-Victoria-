#!/usr/bin/env node

/**
 * Script de Optimización de Imágenes - Flores Victoria
 * Convierte JPG/PNG a WebP con compresión óptima
 * 
 * Uso: node optimize-images.js
 */

const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

const CONFIG = {
  inputDirs: ['frontend/images', 'frontend/public/images'],
  outputQuality: 85,
  formats: ['.jpg', '.jpeg', '.png'],
  skipPatterns: [/node_modules/, /\.git/, /products\/final/], // Ya optimizadas
};

async function findImages(dir) {
  const images = [];
  
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      // Skip patterns
      if (CONFIG.skipPatterns.some(pattern => pattern.test(fullPath))) {
        continue;
      }
      
      if (entry.isDirectory()) {
        images.push(...await findImages(fullPath));
      } else if (CONFIG.formats.includes(path.extname(entry.name).toLowerCase())) {
        images.push(fullPath);
      }
    }
  } catch (error) {
    console.error(`❌ Error leyendo directorio ${dir}:`, error.message);
  }
  
  return images;
}

async function optimizeImage(imagePath) {
  const ext = path.extname(imagePath);
  const baseName = path.basename(imagePath, ext);
  const dirName = path.dirname(imagePath);
  const outputPath = path.join(dirName, `${baseName}.webp`);
  
  // Skip si ya existe WebP
  try {
    await fs.access(outputPath);
    console.log(`⏭️  Ya existe: ${outputPath}`);
    return { skipped: true };
  } catch {
    // No existe, continuar
  }
  
  try {
    const startTime = Date.now();
    const inputStats = await fs.stat(imagePath);
    
    await sharp(imagePath)
      .webp({ quality: CONFIG.outputQuality })
      .toFile(outputPath);
    
    const outputStats = await fs.stat(outputPath);
    const duration = Date.now() - startTime;
    const reduction = ((1 - outputStats.size / inputStats.size) * 100).toFixed(1);
    
    console.log(`✅ ${path.basename(imagePath)} → ${path.basename(outputPath)}`);
    console.log(`   ${(inputStats.size / 1024).toFixed(1)}KB → ${(outputStats.size / 1024).toFixed(1)}KB (-${reduction}%) [${duration}ms]`);
    
    return {
      success: true,
      original: imagePath,
      optimized: outputPath,
      originalSize: inputStats.size,
      optimizedSize: outputStats.size,
      reduction: parseFloat(reduction),
      duration,
    };
  } catch (error) {
    console.error(`❌ Error procesando ${imagePath}:`, error.message);
    return { error: true, message: error.message };
  }
}

async function main() {
  console.log('🚀 Iniciando optimización de imágenes...\n');
  
  const allImages = [];
  for (const dir of CONFIG.inputDirs) {
    try {
      const images = await findImages(dir);
      allImages.push(...images);
    } catch (error) {
      console.error(`❌ Error buscando en ${dir}:`, error.message);
    }
  }
  
  if (allImages.length === 0) {
    console.log('ℹ️  No se encontraron imágenes para optimizar');
    return;
  }
  
  console.log(`📊 Encontradas ${allImages.length} imágenes\n`);
  
  const results = {
    success: 0,
    skipped: 0,
    error: 0,
    totalOriginalSize: 0,
    totalOptimizedSize: 0,
  };
  
  for (const imagePath of allImages) {
    const result = await optimizeImage(imagePath);
    
    if (result.skipped) {
      results.skipped++;
    } else if (result.error) {
      results.error++;
    } else if (result.success) {
      results.success++;
      results.totalOriginalSize += result.originalSize;
      results.totalOptimizedSize += result.optimizedSize;
    }
  }
  
  // Resumen
  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMEN');
  console.log('='.repeat(60));
  console.log(`✅ Optimizadas: ${results.success}`);
  console.log(`⏭️  Omitidas: ${results.skipped}`);
  console.log(`❌ Errores: ${results.error}`);
  
  if (results.success > 0) {
    const totalReduction = ((1 - results.totalOptimizedSize / results.totalOriginalSize) * 100).toFixed(1);
    console.log(`💾 Tamaño original: ${(results.totalOriginalSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`💾 Tamaño optimizado: ${(results.totalOptimizedSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`📉 Reducción total: ${totalReduction}%`);
  }
  
  console.log('='.repeat(60));
  console.log('✨ Optimización completada\n');
}

// Verificar que sharp esté instalado
try {
  require.resolve('sharp');
  main().catch(console.error);
} catch (error) {
  console.error('❌ Error: sharp no está instalado');
  console.log('📦 Instalar con: npm install sharp --save-dev');
  process.exit(1);
}
