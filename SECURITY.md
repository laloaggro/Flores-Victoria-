# 🔐 Política de Seguridad

## Versiones Soportadas

Actualmente soportamos las siguientes versiones con actualizaciones de seguridad:

| Versión | Soportada          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reportar una Vulnerabilidad

La seguridad de Flores Victoria es una prioridad. Si descubres una vulnerabilidad de seguridad, por favor sigue estos pasos:

### ⚠️ No Crear Issues Públicos

**IMPORTANTE**: No reportes vulnerabilidades de seguridad a través de issues públicos de GitHub.

### 📧 Proceso de Reporte

1. **Envía un email** a: security@floresvictoria.com
2. **Incluye la siguiente información**:
   - Descripción detallada de la vulnerabilidad
   - Pasos para reproducir el problema
   - Impacto potencial
   - Sugerencias de mitigación (si las tienes)

### ⏰ Tiempo de Respuesta

- **Confirmación de recepción**: 24-48 horas
- **Evaluación inicial**: 72 horas
- **Resolución estimada**: Depende de la severidad
  - Crítica: 24-48 horas
  - Alta: 1 semana
  - Media: 2 semanas
  - Baja: Próximo release

### 🏆 Reconocimiento

Reconocemos públicamente a los investigadores de seguridad que reportan vulnerabilidades de manera responsable (con su consentimiento) en nuestro Hall of Fame.

---

## 🛡️ Prácticas de Seguridad Implementadas

### Autenticación y Autorización

- **JWT (JSON Web Tokens)**: Tokens firmados con algoritmo HS256
- **Expiración de tokens**: 7 días por defecto (configurable)
- **Refresh tokens**: Implementados para renovación segura
- **Bcrypt**: Hashing de contraseñas con salt rounds = 12
- **Rate limiting**: Protección contra ataques de fuerza bruta

```javascript
// Ejemplo de rate limiting configurado
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 intentos por ventana
  message: 'Demasiados intentos de login, intente más tarde'
});
```

### Validación de Datos

- **Joi**: Validación de schemas en todas las rutas
- **Sanitización**: Limpieza de inputs para prevenir XSS
- **SQL Injection**: Uso de queries parametrizadas

```javascript
// Ejemplo de validación con Joi
const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
});
```

### Headers de Seguridad HTTP

Usamos **Helmet.js** para configurar headers de seguridad:

```javascript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  frameguard: { action: 'deny' },
  xssFilter: true
}));
```

### CORS (Cross-Origin Resource Sharing)

```javascript
const corsOptions = {
  origin: [
    'https://frontend-v2-production-7508.up.railway.app',
    'http://localhost:5173',
    'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
```

### Logging y Monitoreo

- **Winston**: Logging estructurado con niveles
- **Request IDs**: Trazabilidad de requests
- **Sanitización de logs**: No se loggean datos sensibles

```javascript
// Datos que NUNCA se loggean
const sensitiveFields = [
  'password',
  'token',
  'authorization',
  'credit_card',
  'cvv'
];
```

---

## 📋 Checklist de Seguridad para Desarrolladores

### Antes de cada Commit

- [ ] No hay credenciales hardcodeadas
- [ ] No hay tokens o API keys en el código
- [ ] Todas las entradas de usuario están validadas
- [ ] Los errores no exponen información sensible
- [ ] Las queries de base de datos usan parámetros

### Antes de cada Deploy

- [ ] Variables de entorno configuradas correctamente
- [ ] HTTPS habilitado
- [ ] Rate limiting configurado
- [ ] Logs de auditoría activos
- [ ] Backups de base de datos configurados

### Revisión Periódica

- [ ] Dependencias actualizadas (`npm audit`)
- [ ] Rotación de secrets
- [ ] Revisión de logs de acceso
- [ ] Pruebas de penetración

---

## 🔑 Gestión de Secretos

### ⛔ Nunca Hacer

```bash
# ❌ MAL: Secretos en código
const JWT_SECRET = "mi_secreto_super_seguro";

# ❌ MAL: Credenciales en docker-compose público
environment:
  - DB_PASSWORD=admin123
```

### ✅ Siempre Hacer

```bash
# ✅ BIEN: Usar variables de entorno
const JWT_SECRET = process.env.JWT_SECRET;

# ✅ BIEN: Usar .env (no versionado) o secrets manager
# .env
JWT_SECRET=valor_seguro_generado_aleatoriamente

# ✅ BIEN: En Railway usar variables de entorno del dashboard
railway variables --set "JWT_SECRET=valor_seguro"
```

### Generación de Secretos Seguros

```bash
# Generar JWT_SECRET seguro
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Generar password seguro
openssl rand -base64 32
```

---

## 🔍 Auditoría de Dependencias

### Verificación Regular

```bash
# Verificar vulnerabilidades conocidas
npm audit

# Ver reporte detallado
npm audit --json

# Corregir automáticamente (cuando es posible)
npm audit fix

# Forzar correcciones (con precaución)
npm audit fix --force
```

### Herramientas Recomendadas

- **Snyk**: Escaneo continuo de vulnerabilidades
- **Dependabot**: Actualizaciones automáticas de dependencias
- **npm audit**: Verificación integrada de npm

---

## 🚨 Respuesta a Incidentes

### Clasificación de Severidad

| Nivel | Descripción | Tiempo de Respuesta |
|-------|-------------|---------------------|
| **Crítico** | Breach activo, datos comprometidos | Inmediato (< 1 hora) |
| **Alto** | Vulnerabilidad explotable, sin exploit conocido | < 24 horas |
| **Medio** | Vulnerabilidad con mitigaciones disponibles | < 1 semana |
| **Bajo** | Vulnerabilidad teórica, bajo riesgo | Próximo release |

### Plan de Respuesta

1. **Identificación**: Detectar y confirmar el incidente
2. **Contención**: Limitar el impacto inmediato
3. **Erradicación**: Eliminar la causa raíz
4. **Recuperación**: Restaurar servicios afectados
5. **Lecciones Aprendidas**: Documentar y mejorar

---

## 📚 Recursos de Seguridad

### Documentación Recomendada

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express.js Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)

### Herramientas de Testing

- [OWASP ZAP](https://www.zaproxy.org/) - Scanner de vulnerabilidades
- [Burp Suite](https://portswigger.net/burp) - Testing de seguridad
- [sqlmap](http://sqlmap.org/) - Testing de SQL injection

---

## 📞 Contactos de Seguridad

- **Email de Seguridad**: security@floresvictoria.com
- **Responsable de Seguridad**: [Nombre del responsable]
- **Reporte Urgente (24/7)**: [Número o canal de emergencia]

---

## 📜 Historial de Vulnerabilidades

| Fecha | CVE | Severidad | Estado | Descripción |
|-------|-----|-----------|--------|-------------|
| - | - | - | - | No hay vulnerabilidades reportadas |

---

*Última actualización: Febrero 2025*

🌸 **Gracias por ayudarnos a mantener Flores Victoria seguro.**
