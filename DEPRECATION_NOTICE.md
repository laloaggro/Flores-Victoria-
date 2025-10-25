# ⚠️ Aviso de Deprecación

**Fecha**: 25 de Octubre de 2025  
**Versión**: v3.0+

---

## 🚨 Componentes Deprecados

Los siguientes componentes han sido **deprecados** y movidos a `/deprecated/`:

### 1. admin-site/ → deprecated/admin-site/

**Razón**: Duplicación de funcionalidad con `admin-panel/`

**Puerto anterior**: 8443  
**Reemplazo**: `admin-panel/` en puerto **3021**

#### Migración:

- ✅ Todas las funcionalidades han sido consolidadas en `admin-panel/`
- ✅ SSO y autenticación ahora en `admin-panel/auth/`
- ✅ Reverse proxy configurado en `admin-panel/config/`

#### Enlaces Actualizados:

```
Antes: http://localhost:8443
Ahora: http://localhost:3021
```

---

### 2. frontend/pages/admin/ → deprecated/frontend-admin/

**Razón**: Duplicación de panel de administración

**Reemplazo**: `admin-panel/` en puerto **3021**

#### Archivos Movidos:

```
- dashboard.html
- orders.html
- products.html
- users.html
- server.html
- admin-orders.html
- admin-products.html
- admin-users.html
```

#### Nueva Ubicación:

Todas estas funcionalidades están ahora integradas en:
```
admin-panel/public/index.html (Panel Unificado con Tabs)
```

---

## 📋 Impacto en el Código

### Scripts Actualizados

Los siguientes scripts ya no utilizan los componentes deprecados:

- ✅ `package.json` → Comandos `admin:*` apuntan a `admin-panel/`
- ✅ `start-all.sh` → No inicia admin-site
- ✅ `flores-victoria.sh` → Usa admin-panel solamente

### Enlaces Rotos

Si encuentras enlaces a:
```
/admin-site/
/pages/admin/
```

Reemplázalos por:
```
http://localhost:3021 (desarrollo)
https://admin.floresvictoria.com (producción)
```

---

## 🔄 Reversión Temporal

Si necesitas acceder a los componentes deprecados (no recomendado):

```bash
# Restaurar admin-site temporalmente
cp -r deprecated/admin-site ./
cd admin-site
npm start

# Restaurar frontend/pages/admin temporalmente
cp -r deprecated/frontend-admin frontend/pages/admin
```

**NOTA**: Esto es solo para emergencias. Los componentes deprecados no recibirán actualizaciones ni soporte.

---

## 📅 Cronograma de Eliminación

| Fecha | Acción |
|-------|--------|
| 25 Oct 2025 | ✅ Componentes movidos a `/deprecated/` |
| 1 Nov 2025 | ⏳ Revisión de dependencias |
| 15 Nov 2025 | ⏳ Eliminación permanente de `/deprecated/` |

---

## 🆘 Soporte

Si tienes problemas con la migración:

1. **Revisa la documentación**: `ANALISIS_ESTRUCTURA_PROYECTO.md`
2. **Consulta el panel unificado**: http://localhost:3021
3. **Revisa los logs**: `admin-panel/` tiene logging integrado

---

## ✅ Beneficios de la Consolidación

- 🎯 **Un solo panel**: Sin confusión sobre cuál usar
- 🚀 **Mejor rendimiento**: Menos servicios corriendo
- 🔒 **Más seguro**: Superficie de ataque reducida
- 🛠️ **Fácil mantenimiento**: Código centralizado
- 🎨 **UI/UX mejorado**: Interfaz unificada con tabs
- 🌈 **Colores por ambiente**: Dev (Azul), Test (Amarillo), Prod (Rojo)

---

## 📖 Documentación Relacionada

- `ANALISIS_ESTRUCTURA_PROYECTO.md` - Análisis completo
- `ADMIN_PANEL_QUICKSTART.md` - Guía rápida del panel unificado
- `ENVIRONMENT_COLORS_GUIDE.md` - Sistema de colores por ambiente
- `README.md` - Documentación general actualizada

---

**¿Preguntas?** Consulta la documentación o abre un issue.
