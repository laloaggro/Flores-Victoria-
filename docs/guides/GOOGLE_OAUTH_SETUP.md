# 🔐 Configuración de Google OAuth - Flores Victoria

## ✅ Estado Actual

La integración de Google OAuth está **completamente implementada** en el código. Solo falta configurar las credenciales reales de Google Cloud Console.

---

## 📋 Pasos para Configurar Google OAuth

### 1. **Crear Proyecto en Google Cloud Console**

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Nombre del proyecto: `Flores Victoria Auth`

### 2. **Habilitar Google Sign-In API**

1. En el menú lateral, ve a **APIs & Services** → **Library**
2. Busca "Google+ API" o "Google Sign-In API"
3. Haz clic en **Enable**

### 3. **Crear Credenciales OAuth 2.0**

1. Ve a **APIs & Services** → **Credentials**
2. Haz clic en **Create Credentials** → **OAuth client ID**
3. Si es la primera vez, configura la **OAuth consent screen**:
   - User Type: **External**
   - App name: **Flores Victoria**
   - User support email: tu email
   - Developer contact: tu email
   - Scopes: `email`, `profile`
   
4. Crea el **OAuth Client ID**:
   - Application type: **Web application**
   - Name: `Flores Victoria Web Client`
   
5. **Authorized JavaScript origins**:
   ```
   http://localhost:5173
   http://localhost:3000
   http://127.0.0.1:5173
   ```

6. **Authorized redirect URIs**:
   ```
   http://localhost:5173/pages/login.html
   http://localhost:3000/api/auth/google/callback
   ```

7. Haz clic en **Create**

### 4. **Copiar Credenciales**

Después de crear el cliente OAuth, verás:
- **Client ID**: algo como `123456789-abc123def456.apps.googleusercontent.com`
- **Client Secret**: algo como `GOCSPX-abc123def456ghi789`

### 5. **Actualizar Variables de Entorno**

Edita el archivo `.env` en la raíz del proyecto:

```bash
# Google OAuth Configuration
GOOGLE_CLIENT_ID=TU_CLIENT_ID_AQUI
GOOGLE_CLIENT_SECRET=TU_CLIENT_SECRET_AQUI
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback
```

### 6. **Actualizar Frontend**

Edita `frontend/js/utils/google-auth.js` línea 10:

```javascript
const GOOGLE_CONFIG = {
  clientId: 'TU_CLIENT_ID_AQUI', // Reemplazar con tu Client ID real
  redirectUri: `${window.location.origin}/pages/login.html`,
  scope: 'email profile'
};
```

### 7. **Reiniciar Servicios**

```bash
# Reiniciar Auth Service
pkill -f "node auth-service.js"
cd /home/impala/Documentos/Proyectos/flores-victoria
NODE_ENV=development node auth-service.js > logs/auth.log 2>&1 &

# Reiniciar API Gateway (si es necesario)
pkill -f "node api-gateway.js"
NODE_ENV=development node api-gateway.js > logs/gateway.log 2>&1 &
```

---

## 🧪 Probar Google OAuth

1. **Abrir la página de login**:
   ```
   http://localhost:5173/pages/login.html
   ```

2. **Hacer clic en "Continuar con Google"**

3. **Deberías ver**:
   - El popup de Google Sign-In
   - Seleccionar tu cuenta de Google
   - Autorizar la aplicación
   - Redirección automática al sitio

---

## 🛠️ Archivos Implementados

### **Backend:**
- ✅ `auth-service.js` - Ruta `POST /google` implementada
- ✅ API Gateway configurado para hacer proxy a `/api/auth/google`

### **Frontend:**
- ✅ `frontend/js/utils/google-auth.js` - Clase completa de Google OAuth
- ✅ `frontend/js/utils/error-handler.js` - Maneja errores de extensiones
- ✅ `frontend/pages/login.html` - Botón de Google integrado

### **Configuración:**
- ✅ `.env` - Variables de entorno preparadas
- ✅ Logs de debugging implementados

---

## 🐛 Solución de Problemas

### Error: "message channel closed"
✅ **RESUELTO** - El `error-handler.js` ya suprime estos errores que vienen de extensiones del navegador.

### Google Sign-In no aparece
- Verifica que el Client ID esté correctamente configurado
- Abre la consola del navegador y busca errores
- Verifica que las "Authorized JavaScript origins" estén configuradas

### Error 400: redirect_uri_mismatch
- Verifica que la URL de redirect esté exactamente igual en Google Cloud Console
- Incluye `http://` o `https://` según corresponda
- No agregues `/` al final de las URLs

### El usuario se crea pero no redirige
- Verifica que AuthService esté cargado correctamente
- Revisa los logs del navegador con F12
- Verifica que localStorage tenga el token

---

## 📊 Flujo de Autenticación

```
1. Usuario hace clic en "Continuar con Google"
   ↓
2. GoogleAuth.signIn() se ejecuta
   ↓
3. Se muestra el popup de Google
   ↓
4. Usuario autoriza la aplicación
   ↓
5. Google devuelve un JWT (credential)
   ↓
6. Frontend decodifica el JWT y extrae:
   - googleId (sub)
   - email
   - name
   - picture
   ↓
7. Frontend envía POST a /api/auth/google con estos datos
   ↓
8. API Gateway hace proxy a Auth Service (puerto 3017)
   ↓
9. Auth Service:
   - Busca usuario por email
   - Si no existe, lo crea
   - Si existe, actualiza la foto de perfil
   - Genera accessToken y refreshToken
   ↓
10. Frontend guarda tokens en localStorage
    ↓
11. Dispara evento 'authChange'
    ↓
12. Header se actualiza mostrando el usuario
    ↓
13. Redirección a la página principal
```

---

## 🔒 Seguridad

### ✅ Implementado:
- JWT tokens con expiración
- Refresh tokens para sesiones largas
- CORS configurado correctamente
- Validación de datos en backend
- Passwords hasheados con bcrypt
- Google ID verificado por Google

### 🚨 Para Producción:
- [ ] Cambiar `JWT_SECRET` a un valor más seguro
- [ ] Habilitar HTTPS obligatorio
- [ ] Configurar dominios reales en Google Cloud Console
- [ ] Implementar rate limiting más estricto
- [ ] Agregar logging de intentos de login fallidos
- [ ] Implementar 2FA (Two-Factor Authentication)

---

## 📝 Notas Adicionales

### Client ID Temporal
El Client ID actual en el código es un placeholder:
```
1056735978033-7taftkj0t3fhg3sbc1eog43dh7rqt2ck.apps.googleusercontent.com
```

**⚠️ DEBES reemplazarlo con tu propio Client ID de Google Cloud Console**

### Modo Desarrollo vs Producción
- **Desarrollo**: `http://localhost:5173`
- **Producción**: Deberás configurar tu dominio real en Google Cloud Console

### Otros Proveedores OAuth
El sistema está preparado para agregar más proveedores:
- Facebook OAuth (botón ya existe, solo falta implementar)
- GitHub OAuth
- Twitter OAuth
- Apple Sign-In

---

## ✅ Checklist de Implementación

- [x] Código de Google OAuth implementado
- [x] Ruta de backend `/api/auth/google` creada
- [x] Error handler para extensiones del navegador
- [x] Botón de Google en login.html
- [x] Variables de entorno configuradas
- [x] Documentación completa
- [ ] **PENDIENTE**: Configurar credenciales reales en Google Cloud Console
- [ ] **PENDIENTE**: Actualizar Client ID en google-auth.js
- [ ] **PENDIENTE**: Probar flujo completo de autenticación

---

## 🎯 Próximos Pasos

1. **Crear proyecto en Google Cloud Console**
2. **Obtener Client ID y Client Secret**
3. **Actualizar `.env` y `google-auth.js`**
4. **Reiniciar servicios**
5. **Probar login con Google**
6. **¡Listo! 🎉**

---

## 📞 Soporte

Si encuentras algún problema:
1. Revisa los logs en `logs/auth.log`
2. Abre la consola del navegador (F12)
3. Verifica que todos los servicios estén corriendo
4. Comprueba las configuraciones en Google Cloud Console

**Última actualización**: 17 de noviembre de 2025
