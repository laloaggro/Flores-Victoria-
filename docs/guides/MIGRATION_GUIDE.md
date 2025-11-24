# 🚀 Guía de Migración - Nueva Estructura del Proyecto

Esta guía ayuda a actualizar scripts y configuraciones que referencian archivos movidos durante la reorganización.

## 📦 Archivos Movidos

### Herramientas de Desarrollo (tools/)

**Generación de imágenes** - `./` → `tools/image-generation/`:
```
generate-leonardo.js
generate-replicate.js
generate-batch-hf.js
generate-unique-images-hf.js
improve-product-images.js
fix-product-images.js
unify-product-images.js
validate-product-images.js
optimize-images.js
ai-service-standalone.js
```

**Scripts de testing** - `./` → `tools/testing/`:
```
test-db.js
test-image-gen.js
test-hf-single.js
test-forced-generation.js
test-unique-prompts.js
test_system.js
```

**Herramientas de análisis** - `./` → `tools/analysis/`:
```
roi-analysis.html
watermark-preview.html
navegacion-central.html
```

### Archivos de Configuración (config/)

**Configuración JS** - `./` → `config/`:
```
jest.config.js
jest.setup.js
playwright.config.js
eslint.config.js
.eslintrc.js
.percy.js
```

**Dockerfiles** - `./` → `config/docker/`:
```
Dockerfile.ai-service
Dockerfile.auth-service
Dockerfile.order-service
(y otros Dockerfile.*)
```

**Service Worker** - `./sw.js` → `frontend/public/sw.js`

## 🔄 Cómo Actualizar Referencias

### 1. En Scripts Shell (.sh)

**Antes:**
```bash
node optimize-images.js
node test-db.js
node generate-leonardo.js
```

**Después:**
```bash
node tools/image-generation/optimize-images.js
node tools/testing/test-db.js
node tools/image-generation/generate-leonardo.js
```

### 2. En package.json

**Antes:**
```json
{
  "scripts": {
    "test": "jest --config jest.config.js",
    "optimize": "node optimize-images.js"
  }
}
```

**Después:**
```json
{
  "scripts": {
    "test": "jest --config config/jest.config.js",
    "optimize": "node tools/image-generation/optimize-images.js"
  }
}
```

### 3. En Imports JavaScript

**Antes:**
```javascript
const generator = require('./generate-leonardo.js');
const config = require('../jest.config.js');
```

**Después:**
```javascript
const generator = require('./tools/image-generation/generate-leonardo.js');
const config = require('./config/jest.config.js');
```

### 4. En Docker Compose

**Antes:**
```yaml
dockerfile: Dockerfile.ai-service
```

**Después:**
```yaml
dockerfile: config/docker/Dockerfile.ai-service
```

### 5. En HTML

**Antes:**
```html
<script src="/sw.js"></script>
```

**Después:**
```html
<script src="/public/sw.js"></script>
```

## 🛠️ Scripts de Ayuda

### Buscar Referencias Antiguas

```bash
# Buscar referencias a optimize-images.js
grep -r "optimize-images.js" --exclude-dir=node_modules --exclude-dir=.git

# Buscar referencias a test-*.js
grep -r "test-.*\.js" scripts/ --include="*.sh"

# Buscar referencias a config files
grep -r "jest.config.js\|playwright.config.js" --exclude-dir=node_modules
```

### Script de Actualización Automática

Ejecuta este script desde la raíz del proyecto para actualizar rutas comunes:

```bash
#!/bin/bash
# update-paths.sh

echo "🔄 Actualizando rutas de archivos movidos..."

# Actualizar referencias en scripts shell
find scripts/ -name "*.sh" -exec sed -i 's|optimize-images\.js|tools/image-generation/optimize-images.js|g' {} \;
find scripts/ -name "*.sh" -exec sed -i 's|test-\([a-z-]*\)\.js|tools/testing/test-\1.js|g' {} \;
find scripts/ -name "*.sh" -exec sed -i 's|generate-\([a-z-]*\)\.js|tools/image-generation/generate-\1.js|g' {} \;

echo "✅ Rutas actualizadas en scripts/"

# Actualizar en archivos JS
find . -name "*.js" -not -path "*/node_modules/*" -exec sed -i "s|require('./jest.config')|require('./config/jest.config')|g" {} \;

echo "✅ Rutas actualizadas en archivos JS"
echo ""
echo "⚠️  IMPORTANTE: Revisa manualmente los cambios antes de commit"
```

## ✅ Checklist de Migración

- [ ] Actualizar scripts en `scripts/` que referencien herramientas
- [ ] Verificar `package.json` para rutas de config
- [ ] Revisar imports en archivos JavaScript
- [ ] Actualizar referencias en `docker-compose*.yml`
- [ ] Probar que los scripts de build funcionen
- [ ] Ejecutar tests para verificar configuraciones
- [ ] Actualizar documentación interna del equipo
- [ ] Revisar CI/CD pipelines si los hay

## 📚 Documentación Relacionada

- [DIRECTORY_STRUCTURE.md](../DIRECTORY_STRUCTURE.md) - Estructura completa del proyecto
- [tools/README.md](../tools/README.md) - Guía de herramientas de desarrollo
- [DOCS_INDEX.md](../docs/DOCS_INDEX.md) - Índice de documentación

## 🆘 Problemas Comunes

### Error: "Cannot find module"

**Problema:** Script no encuentra un módulo movido.

**Solución:** Actualiza la ruta del require/import según la tabla de arriba.

### Error: "No such file or directory"

**Problema:** Script shell intenta ejecutar archivo en ubicación antigua.

**Solución:** Usa rutas relativas desde el directorio del script o rutas absolutas desde la raíz del proyecto.

### Tests fallan después de migración

**Problema:** Tests no encuentran archivos de configuración.

**Solución:** Verifica que `config/jest.config.js` y `config/playwright.config.js` estén correctamente referenciados en `package.json`.

## 🤝 Contribuir

Si encuentras referencias rotas después de la migración:

1. Documenta la referencia rota
2. Actualiza según esta guía
3. Agrega el caso a esta documentación si es común
4. Considera hacer un PR con la corrección

---

**Última actualización:** 24 de noviembre de 2025
