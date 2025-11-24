#!/bin/bash
# Script para optimizar imágenes de productos
# Reduce tamaño sin pérdida visible de calidad

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}🖼️  Optimizador de Imágenes - Flores Victoria${NC}"
echo ""

# Verificar que sharp está instalado
if ! npm list sharp &>/dev/null; then
  echo -e "${YELLOW}📦 Instalando sharp...${NC}"
  npm install --save-dev sharp
fi

# Directorios a optimizar
DIRS=(
  "frontend/images/products/final"
  "frontend/images/products/watermarked"
  "frontend/images/products/generated-hf"
)

TOTAL_BEFORE=0
TOTAL_AFTER=0

for DIR in "${DIRS[@]}"; do
  if [ ! -d "$DIR" ]; then
    echo -e "${YELLOW}⚠️  Directorio no encontrado: $DIR${NC}"
    continue
  fi
  
  echo -e "${GREEN}📁 Procesando: $DIR${NC}"
  
  # Tamaño antes
  SIZE_BEFORE=$(du -sb "$DIR" | cut -f1)
  TOTAL_BEFORE=$((TOTAL_BEFORE + SIZE_BEFORE))
  
  # Contar archivos
  FILE_COUNT=$(find "$DIR" -type f \( -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" \) | wc -l)
  echo "   Archivos encontrados: $FILE_COUNT"
  
  # Optimizar con sharp (Node.js)
  node -e "
    const fs = require('fs');
    const path = require('path');
    const sharp = require('sharp');
    
    const dir = '$DIR';
    const files = fs.readdirSync(dir)
      .filter(f => /\.(png|jpg|jpeg)$/i.test(f))
      .map(f => path.join(dir, f));
    
    (async () => {
      let processed = 0;
      for (const file of files) {
        const ext = path.extname(file).toLowerCase();
        const output = file.replace(/\.(png|jpg|jpeg)$/i, '.optimized' + ext);
        
        try {
          if (ext === '.png') {
            await sharp(file)
              .png({ quality: 85, compressionLevel: 9 })
              .toFile(output);
          } else {
            await sharp(file)
              .jpeg({ quality: 85, progressive: true })
              .toFile(output);
          }
          
          const origSize = fs.statSync(file).size;
          const newSize = fs.statSync(output).size;
          
          if (newSize < origSize) {
            fs.renameSync(output, file);
            processed++;
          } else {
            fs.unlinkSync(output);
          }
        } catch (err) {
          console.error('Error procesando', file, err.message);
          if (fs.existsSync(output)) fs.unlinkSync(output);
        }
      }
      console.log('✅ Optimizados:', processed, 'archivos');
    })();
  "
  
  # Tamaño después
  SIZE_AFTER=$(du -sb "$DIR" | cut -f1)
  TOTAL_AFTER=$((TOTAL_AFTER + SIZE_AFTER))
  
  SAVED=$((SIZE_BEFORE - SIZE_AFTER))
  PERCENT=0
  if [ $SIZE_BEFORE -gt 0 ]; then
    PERCENT=$((SAVED * 100 / SIZE_BEFORE))
  fi
  
  echo -e "   Antes: $(numfmt --to=iec-i --suffix=B $SIZE_BEFORE)"
  echo -e "   Después: $(numfmt --to=iec-i --suffix=B $SIZE_AFTER)"
  echo -e "   ${GREEN}Ahorrado: $(numfmt --to=iec-i --suffix=B $SAVED) ($PERCENT%)${NC}"
  echo ""
done

# Resumen total
TOTAL_SAVED=$((TOTAL_BEFORE - TOTAL_AFTER))
TOTAL_PERCENT=0
if [ $TOTAL_BEFORE -gt 0 ]; then
  TOTAL_PERCENT=$((TOTAL_SAVED * 100 / TOTAL_BEFORE))
fi

echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}📊 RESUMEN TOTAL${NC}"
echo -e "   Total antes: $(numfmt --to=iec-i --suffix=B $TOTAL_BEFORE)"
echo -e "   Total después: $(numfmt --to=iec-i --suffix=B $TOTAL_AFTER)"
echo -e "   ${GREEN}✨ Ahorrado: $(numfmt --to=iec-i --suffix=B $TOTAL_SAVED) ($TOTAL_PERCENT%)${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
