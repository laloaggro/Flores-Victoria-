const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

console.log('\n🎨 Optimizando CSS del build...\n');

const distDir = path.join(__dirname, '..', 'dist');
const cssFiles = glob.sync(`${distDir}/assets/css/*.css`);

let totalSaved = 0;

cssFiles.forEach((file) => {
  const originalSize = fs.statSync(file).size;
  let css = fs.readFileSync(file, 'utf8');
  
  // Optimizaciones adicionales
  
  // 1. Remover comentarios restantes
  css = css.replace(/\/\*[\s\S]*?\*\//g, '');
  
  // 2. Remover espacios múltiples
  css = css.replace(/\s+/g, ' ');
  
  // 3. Remover espacios alrededor de caracteres especiales
  css = css.replace(/\s*([{}:;,>+~])\s*/g, '$1');
  
  // 4. Remover punto y coma final innecesario
  css = css.replace(/;}/g, '}');
  
  // 5. Minificar selectores de atributo
  css = css.replace(/\[\s*([^=\]]+)\s*=\s*"([^"]*)"\s*\]/g, '[$1="$2"]');
  
  // Escribir archivo optimizado
  fs.writeFileSync(file, css, 'utf8');
  
  const newSize = fs.statSync(file).size;
  const saved = originalSize - newSize;
  totalSaved += saved;
  
  const fileName = path.basename(file);
  const savedKB = (saved / 1024).toFixed(2);
  const percentage = ((saved / originalSize) * 100).toFixed(1);
  
  if (saved > 0) {
    console.log(`  ✅ ${fileName}`);
    console.log(`     ${(originalSize / 1024).toFixed(2)} KB → ${(newSize / 1024).toFixed(2)} KB (${savedKB} KB ahorrados, -${percentage}%)`);
  }
});

console.log(`\n📊 Total optimizado: ${(totalSaved / 1024).toFixed(2)} KB\n`);
console.log('✨ Optimización de CSS completada!\n');
