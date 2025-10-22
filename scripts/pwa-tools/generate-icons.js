/**
 * Generador de íconos PWA usando Sharp
 * Convierte el logo SVG a múltiples tamaños PNG para PWA
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Configuración de rutas
const LOGO_PATH = path.join(__dirname, '../../frontend/public/logo.svg');
const ICONS_DIR = path.join(__dirname, '../../frontend/public/icons');
const PUBLIC_DIR = path.join(__dirname, '../../frontend/public');

// Tamaños de íconos requeridos para PWA
const ICON_SIZES = [72, 96, 128, 144, 152, 192, 384, 512];

/**
 * Crea el directorio de íconos si no existe
 */
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`✓ Directorio creado: ${dirPath}`);
  }
}

/**
 * Genera un ícono PNG de un tamaño específico
 */
async function generateIcon(size) {
  const outputPath = path.join(ICONS_DIR, `icon-${size}x${size}.png`);
  
  try {
    await sharp(LOGO_PATH)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png()
      .toFile(outputPath);
    
    console.log(`  ✓ ${size}x${size}px → ${path.basename(outputPath)}`);
    return true;
  } catch (error) {
    console.error(`  ✗ Error generando ${size}x${size}px:`, error.message);
    return false;
  }
}

/**
 * Genera el favicon.ico (16x16)
 */
async function generateFavicon() {
  const outputPath = path.join(PUBLIC_DIR, 'favicon.ico');
  
  try {
    // Sharp no genera .ico directamente, usamos PNG de 32x32
    await sharp(LOGO_PATH)
      .resize(32, 32, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png()
      .toFile(outputPath.replace('.ico', '.png'));
    
    console.log(`  ✓ favicon.png generado (32x32)`);
    console.log(`    ℹ Nota: Renombra favicon.png a favicon.ico si es necesario`);
    return true;
  } catch (error) {
    console.error(`  ✗ Error generando favicon:`, error.message);
    return false;
  }
}

/**
 * Genera el apple-touch-icon (180x180)
 */
async function generateAppleIcon() {
  const outputPath = path.join(PUBLIC_DIR, 'apple-touch-icon.png');
  
  try {
    await sharp(LOGO_PATH)
      .resize(180, 180, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png()
      .toFile(outputPath);
    
    console.log(`  ✓ apple-touch-icon.png generado (180x180)`);
    return true;
  } catch (error) {
    console.error(`  ✗ Error generando apple-touch-icon:`, error.message);
    return false;
  }
}

/**
 * Función principal
 */
async function generateAllIcons() {
  console.log('\n🎨 GENERADOR DE ÍCONOS PWA');
  console.log('═'.repeat(50));
  
  // Verificar que existe el logo
  if (!fs.existsSync(LOGO_PATH)) {
    console.error(`\n❌ Error: Logo no encontrado en ${LOGO_PATH}`);
    process.exit(1);
  }
  
  console.log(`\n📍 Logo fuente: ${path.basename(LOGO_PATH)}`);
  console.log(`📂 Directorio destino: ${ICONS_DIR}\n`);
  
  // Crear directorio de íconos
  ensureDirectoryExists(ICONS_DIR);
  
  // Generar íconos PWA
  console.log('\n📦 Generando íconos PWA:');
  let successCount = 0;
  
  for (const size of ICON_SIZES) {
    const success = await generateIcon(size);
    if (success) successCount++;
  }
  
  // Generar favicon
  console.log('\n🌟 Generando favicon:');
  const faviconSuccess = await generateFavicon();
  if (faviconSuccess) successCount++;
  
  // Generar apple-touch-icon
  console.log('\n🍎 Generando apple-touch-icon:');
  const appleSuccess = await generateAppleIcon();
  if (appleSuccess) successCount++;
  
  // Resumen
  console.log('\n' + '═'.repeat(50));
  console.log(`✅ Generación completada: ${successCount}/${ICON_SIZES.length + 2} archivos`);
  console.log('\n📋 Próximos pasos:');
  console.log('  1. Agrega estas líneas al <head> de tus páginas HTML:');
  console.log('     <link rel="icon" href="/favicon.png">');
  console.log('     <link rel="apple-touch-icon" href="/apple-touch-icon.png">');
  console.log('     <link rel="manifest" href="/manifest.json">');
  console.log('\n  2. Verifica que manifest.json tenga las rutas correctas');
  console.log('  3. Registra el service worker con sw-register.js\n');
}

// Ejecutar
generateAllIcons().catch(error => {
  console.error('\n❌ Error fatal:', error);
  process.exit(1);
});
