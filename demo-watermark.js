const sharp = require('sharp');

const fs = require('fs').promises;
const path = require('path');

(async () => {
  try {
    console.log('🎨 Demostrando marca de agua...\n');

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

    // Cargar logo
    const logoBuffer = await fs.readFile(logoPath);

    // Procesar imagen
    const image = sharp(inputImage);
    const metadata = await image.metadata();

    console.log(`📏 Dimensiones: ${metadata.width}x${metadata.height}px\n`);

    // Procesar logo (80px con opacidad 70%)
    const watermarkSize = 80;
    const padding = 20;

    const logo = await sharp(logoBuffer)
      .resize(watermarkSize, watermarkSize, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png()
      .toBuffer();

    // Calcular posición (esquina inferior derecha)
    const x = metadata.width - watermarkSize - padding;
    const y = metadata.height - watermarkSize - padding;

    console.log(`🔖 Agregando marca de agua:`);
    console.log(`   Tamaño: ${watermarkSize}px`);
    console.log(`   Posición: (${x}, ${y})`);
    console.log(`   Esquina: inferior derecha`);
    console.log(`   Padding: ${padding}px\n`);

    // Compositar logo sobre imagen
    const outputPath = path.join(outputDir, 'demo-con-marca-agua.jpg');

    await image
      .composite([
        {
          input: logo,
          top: y,
          left: x,
          blend: 'over',
        },
      ])
      .jpeg({ quality: 95 })
      .toFile(outputPath);

    console.log(`✅ ¡Imagen con marca de agua creada!\n`);
    console.log(`📁 Ubicación: ${outputPath}\n`);
    console.log(`💡 Abriendo imagen...`);

    // Abrir imagen
    const { exec } = require('child_process');
    exec(`xdg-open "${outputPath}"`);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
})();
