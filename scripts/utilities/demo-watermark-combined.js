const sharp = require('sharp');

const fs = require('fs').promises;
const path = require('path');

(async () => {
  try {
    console.log('🎨 Creando marca de agua combinada...\n');

    // Usar una imagen existente
    const inputImage =
      '/home/impala/Documentos/Proyectos/flores-victoria/frontend/public/images/productos/victoria-graduacion-007-v3.png';
    const logoPath = '/home/impala/Documentos/Proyectos/flores-victoria/frontend/logo.svg';
    const outputDir =
      '/home/impala/Documentos/Proyectos/flores-victoria/frontend/images/products/generated';

    // Crear directorio de salida
    await fs.mkdir(outputDir, { recursive: true });

    console.log('📸 Imagen original:', inputImage);
    console.log('🏷️  Logo:', logoPath);

    // Cargar logo y obtener metadata de la imagen
    const logoBuffer = await fs.readFile(logoPath);
    const image = sharp(inputImage);
    const metadata = await image.metadata();

    console.log(`📏 Dimensiones imagen: ${metadata.width}x${metadata.height}px\n`);

    // CONFIGURACIÓN
    const centerLogoSize = Math.round(metadata.width * 0.5); // 50% del ancho (más pequeño)
    const centerOpacity = 0.25; // 25% de opacidad (más sutil)
    const cornerLogoSize = 80;
    const cornerPadding = 20;

    console.log(`🔖 Configuración marca de agua combinada:`);
    console.log(`\n   LOGO CENTRADO (protección):`);
    console.log(`   - Tamaño: ${centerLogoSize}px`);
    console.log(`   - Opacidad: ${centerOpacity * 100}% (muy sutil)`);
    console.log(`   - Posición: Centro`);
    console.log(`\n   LOGO ESQUINA (branding):`);
    console.log(`   - Tamaño: ${cornerLogoSize}px`);
    console.log(`   - Opacidad: 100% (totalmente visible)`);
    console.log(`   - Posición: Inferior derecha`);
    console.log(`   - Padding: ${cornerPadding}px\n`);

    // Crear logo CENTRADO con baja opacidad
    const centerLogo = await sharp(logoBuffer)
      .resize(centerLogoSize, centerLogoSize, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 },
      })
      .ensureAlpha()
      .toBuffer();

    // Aplicar opacidad reducida al logo centrado
    const centerLogoWithOpacity = await sharp(centerLogo)
      .composite([
        {
          input: Buffer.from([255, 255, 255, Math.round(255 * centerOpacity)]),
          raw: {
            width: 1,
            height: 1,
            channels: 4,
          },
          tile: true,
          blend: 'dest-in',
        },
      ])
      .toBuffer();

    const centerLogoMetadata = await sharp(centerLogoWithOpacity).metadata();
    const centerX = Math.round((metadata.width - centerLogoMetadata.width) / 2);
    const centerY = Math.round((metadata.height - centerLogoMetadata.height) / 2);

    // Crear logo ESQUINA con 100% opacidad
    const cornerLogo = await sharp(logoBuffer)
      .resize(cornerLogoSize, cornerLogoSize, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png()
      .toBuffer();

    const cornerX = metadata.width - cornerLogoSize - cornerPadding;
    const cornerY = metadata.height - cornerLogoSize - cornerPadding;

    console.log(`📐 Posiciones calculadas:`);
    console.log(`   Centro: (${centerX}, ${centerY})`);
    console.log(`   Esquina: (${cornerX}, ${cornerY})\n`);

    // Aplicar AMBAS marcas de agua
    const outputPath = path.join(outputDir, 'demo-watermark-combined.jpg');

    await image
      .composite([
        // Primero el logo centrado (fondo)
        {
          input: centerLogoWithOpacity,
          top: centerY,
          left: centerX,
          blend: 'over',
        },
        // Luego el logo de esquina (frente)
        {
          input: cornerLogo,
          top: cornerY,
          left: cornerX,
          blend: 'over',
        },
      ])
      .jpeg({ quality: 95 })
      .toFile(outputPath);

    console.log(`✅ ¡Imagen con marca de agua combinada creada!\n`);
    console.log(`📁 Ubicación: ${outputPath}\n`);
    console.log(`💡 Abriendo imagen...\n`);

    // Abrir imagen
    const { exec } = require('child_process');
    exec(`xdg-open "${outputPath}"`);

    console.log('✨ Características:');
    console.log('   ✓ Logo centrado sutil (25% opacidad) - Protección anti-copia');
    console.log('   ✓ Logo esquina visible (100% opacidad) - Branding profesional');
    console.log('   ✓ Combinación perfecta: protección + marca');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  }
})();
