# 🎨 Configuración Percy Visual Testing - Guía

## ✅ Estado Actual

- **@percy/playwright**: v1.0.9 ✅ Instalado
- **Configuración**: `.percy.js` ✅ Completa
- **Script npm**: `test:visual` ✅ Disponible
- **API Token**: ⏳ Pendiente configuración

## 🔑 Para Activar Percy

### 1. Crear Cuenta Percy

```bash
# Visitar: https://percy.io
# Crear cuenta gratuita
# Crear nuevo proyecto "Flores Victoria"
```

### 2. Obtener Token API

```bash
# En Percy Dashboard:
# Settings → Account → API Keys
# Copiar PERCY_TOKEN
```

### 3. Configurar Localmente

```bash
# Método 1: Variable de entorno
export PERCY_TOKEN=your_percy_token_here

# Método 2: Archivo .env (recomendado)
echo "PERCY_TOKEN=your_percy_token_here" >> .env
```

### 4. Ejecutar Tests Visuales

```bash
# Test visual básico
npm run test:visual

# Test con Playwright UI
npm run test:e2e:ui

# Test completo (incluye visual)
npm run test:all
```

## 📋 Tests Visuales Configurados

### Componentes Storybook (3 historias)

- ✅ **Button**: Default, Primary, Large
- ✅ **Header**: Logged In, Logged Out
- ✅ **SearchBar**: Default, With Filters, With Text

### Páginas Críticas (8 páginas)

- 🏠 **Homepage**: `/`
- 🛒 **Products**: `/products.html`
- 🛍️ **Cart**: `/cart.html`
- 👤 **Login**: `/login.html`
- 📞 **Contact**: `/contact.html`
- 👨‍💼 **Admin Dashboard**: `/admin.html`
- 📊 **Admin Products**: `/admin-products.html`
- 👥 **Admin Users**: `/admin-users.html`

## 🎯 Configuración Avanzada

### Widths Configurados

- 📱 **Mobile**: 375px
- 📱 **Tablet**: 768px
- 💻 **Desktop**: 1280px
- 🖥️ **Large**: 1920px

### Elementos Ocultos

```css
/* Elementos dinámicos ocultos en screenshots */
.loading-spinner,
.skeleton-loader,
.animation-element {
  display: none !important;
}
```

## 🚀 Siguientes Pasos

1. **Obtener Percy Token** (5 min)
2. **Primera ejecución**: `npm run test:visual` (10 min)
3. **Baseline establecido**: Capturas iniciales guardadas
4. **CI/CD Integration**: GitHub Actions con Percy

## 💡 Beneficios Percy

- 🔍 **Visual Regression**: Detecta cambios no intencionados
- 📸 **Multi-browser**: Chrome, Firefox, Edge
- 📱 **Responsive**: Multiple screen sizes
- 🔄 **CI Integration**: Automated en cada PR
- 👥 **Team Review**: Visual diffs para review

---

**Nota**: Percy tiene plan gratuito con 5,000 screenshots/mes - suficiente para desarrollo.
