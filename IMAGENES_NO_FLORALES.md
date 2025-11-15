# 🌸 Imágenes No Florales a Reemplazar - Flores Victoria

## ❌ Imágenes que NO son de arreglos florales

### 1. **Avatares de usuarios** (`images/avatars/`)
```
❌ avatar1.webp - avatar2.webp - avatar3.webp - avatar4.webp - avatar5.webp - avatar6.webp
```
**Uso actual**: Testimonios de clientes  
**Recomendación**: 
- Usar fotos reales de clientes satisfechos (con permiso)
- O usar ilustraciones florales/vintage como avatares
- O usar avatares genéricos con temática de flores

### 2. **Imágenes de demostración** (`images/products/generated/`)
```
❌ demo-*.jpg/webp - Imágenes de prueba de marcas de agua
```
**Uso actual**: Testing de sistema de watermark  
**Recomendación**: Mover a carpeta `/tests/` o eliminar de producción

## ✅ Imágenes que SÍ son florales (mantener)

### Categorías florales:
- ✅ `images/categories/` - Todas son flores/arreglos
- ✅ `images/products/final/` - Productos reales (76 imágenes)
- ✅ `images/products/watermarked/` - Mismas con marca de agua
- ✅ `images/products/generated-hf/` - Generadas por IA (florales)

## 🎨 Opciones de Reemplazo

### Para Avatares:
1. **Usar Avataaars** (biblioteca gratuita): https://getavataaars.com/
2. **Crear avatares florales** con iniciales + fondo floral
3. **Fotos de clientes reales** (mejor para credibilidad)
4. **Iconos florales** personalizados

### Script sugerido para generar avatares florales:
```javascript
// Crear avatares con iniciales + colores florales
const flowerColors = ['#C2185B', '#D4B0C7', '#A2C9A5', '#F8BBD0'];
// Implementar con canvas o usar servicio como ui-avatars.com
```

## 📋 Próximos Pasos

1. ✅ **Decidir**: ¿Usar avatares reales, ilustraciones, o florales?
2. ⏳ **Crear/Conseguir**: Nuevas imágenes de avatares
3. ⏳ **Reemplazar**: Actualizar archivos en `images/avatars/`
4. ⏳ **Limpiar**: Mover imágenes de demo a `/tests/` o eliminar

**Total a reemplazar**: 6 avatares + 4 demos = **10 imágenes**
