const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

(async () => {
  try {
    console.log('🎨 Demostrando marca de agua completa (40% opacidad)...\n');
    
    // Usar una imagen existente
    const inputImage = '/home/impala/Documentos/Proyectos/flores-victoria/frontend/public/images/productos/victoria-graduacion-007-v3.png';
    const logoPath = '/home/impala/Documentos/Proyectos/flores-victoria/frontend/logo.svg';
    const outputDir = '/home/impala/Documentos/Proyectos/flores-victoria/frontend/images/products/generated';
    
    // Crear directorio de salida
    await fs.mkdir(outputDir, { recursive: true });
    
    console.log('📸 Imagen original:', inputImage);
    console.log('🏷️  Logo:', logoPath);
    
    // Cargar logo y obtener metadata de la imagen
    const logoBuffer = await fs.readFile(logoPath);
    const image = sharp(inputImage);
    const metadata = await image.metadata();
    
    console.log(`📏 Dimensiones imagen: ${metadata.width}x${metadata.height}px\n`);
    
    // Crear patrón repetido del logo
    const logoSize = 200; // Logo más grande para el patrón
    const spacing = 50;   // Espacio entre logos
    const opacity = 0.4;  // 40% de opacidad
    
    console.log(`🔖 Configuración marca de agua completa:`);
    console.log(`   Tamaño logo: ${logoSize}px`);
    console.log(`   Espaciado: ${spacing}px`);
    console.log(`   Opacidad: ${opacity * 100}%`);
    console.log(`   Patrón: Repetido en toda la imagen\n`);
    
    // Procesar logo con opacidad
    const logo = await sharp(logoBuffer)
      .resize(logoSize, logoSize, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .ensureAlpha()
      .modulate({ brightness: 1 })
      .toBuffer();
    
    // Crear array de composiciones para el patrón
    const compositions = [];
    
    // Calcular cuántos logos necesitamos (en forma de grid)
    const cols = Math.ceil(metadata.width / (logoSize + spacing)) + 1;
    const rows = Math.ceil(metadata.height / (logoSize + spacing)) + 1;
    
    console.log(`📐 Creando grid de ${cols}x${rows} logos...\n`);
    
    // Crear patrón de logos
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = col * (logoSize + spacing);
        const y = row * (logoSize + spacing);
        
        // Alternar posición para efecto diagonal
        const offsetX = (row % 2 === 0) ? 0 : (logoSize + spacing) / 2;
        
        compositions.push({
          input: logo,
          top: Math.round(y),
          left: Math.round(x + offsetX),
          blend: 'over'
        });
      }
    }
    
    // Aplicar todas las marcas de agua
    const outputPath1 = path.join(outputDir, 'demo-watermark-full-pattern.jpg');
    
    await image
      .composite(compositions)
      .modulate({ brightness: 1 })
      .jpeg({ quality: 95 })
      .toFile(outputPath1);
    
    console.log(`✅ Imagen con patrón completo creada!\n`);
    console.log(`📁 Ubicación: ${outputPath1}\n`);
    
    // Crear versión alternativa: Logo grande centrado con 40% opacidad
    console.log('🎨 Creando versión alternativa (logo centrado grande)...\n');
    
    const image2 = sharp(inputImage);
    const largeLogo = await sharp(logoBuffer)
      .resize(Math.round(metadata.width * 0.6), Math.round(metadata.height * 0.6), {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .ensureAlpha()
      .toBuffer();
    
    const logoMetadata = await sharp(largeLogo).metadata();
    const centerX = Math.round((metadata.width - logoMetadata.width) / 2);
    const centerY = Math.round((metadata.height - logoMetadata.height) / 2);
    
    console.log(`   Tamaño logo: ${logoMetadata.width}x${logoMetadata.height}px`);
    console.log(`   Posición: Centro (${centerX}, ${centerY})`);
    console.log(`   Opacidad: 40%\n`);
    
    const outputPath2 = path.join(outputDir, 'demo-watermark-full-centered.jpg');
    
    await image2
      .composite([
        {
          input: largeLogo,
          top: centerY,
          left: centerX,
          blend: 'over'
        }
      ])
      .jpeg({ quality: 95 })
      .toFile(outputPath2);
    
    console.log(`✅ Imagen con logo centrado creada!\n`);
    console.log(`📁 Ubicación: ${outputPath2}\n`);
    
    console.log(`💡 Abriendo ambas imágenes...\n`);
    
    // Abrir ambas imágenes
    const { exec } = require('child_process');
    exec(`xdg-open "${outputPath1}"`);
    
    setTimeout(() => {
      exec(`xdg-open "${outputPath2}"`);
    }, 1000);
    
    console.log('✨ Listo! Tienes 2 versiones:');
    console.log('   1. Patrón repetido en toda la imagen');
    console.log('   2. Logo grande centrado');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  }
})();
