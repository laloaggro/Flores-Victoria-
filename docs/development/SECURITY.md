# Seguridad en el Proyecto Flores Victoria

## Índice

1. [Introducción](#introducción)
2. [Principios de Seguridad](#principios-de-seguridad)
3. [Autenticación y Autorización](#autenticación-y-autorización)
4. [Protección de Datos](#protección-de-datos)
5. [Seguridad en APIs](#seguridad-en-apis)
6. [Seguridad en Infraestructura](#seguridad-en-infraestructura)
7. [Gestión de Secretos](#gestión-de-secretos)
8. [Pruebas de Seguridad](#pruebas-de-seguridad)
9. [Monitoreo y Auditoría](#monitoreo-y-auditoría)
10. [Respuesta a Incidentes](#respuesta-a-incidentes)
11. [Cumplimiento y Regulaciones](#cumplimiento-y-regulaciones)
12. [Mejores Prácticas](#mejores-prácticas)

## Introducción

La seguridad es un aspecto fundamental en el desarrollo del proyecto Flores Victoria. Este documento
establece las políticas, prácticas y controles de seguridad que deben implementarse en todos los
componentes del sistema para proteger los datos de los usuarios y mantener la integridad del
sistema.

## Principios de Seguridad

### Confidencialidad

- Proteger la información sensible de accesos no autorizados
- Implementar cifrado para datos en tránsito y en reposo
- Controlar el acceso a la información basado en necesidad de conocimiento

### Integridad

- Garantizar que los datos no sean modificados de forma no autorizada
- Implementar mecanismos de validación y verificación
- Proteger contra la manipulación de datos

### Disponibilidad

- Asegurar que los servicios estén disponibles cuando se necesiten
- Implementar redundancia y recuperación ante desastres
- Proteger contra ataques de denegación de servicio

### Principio de Mínimo Privilegio

- Otorgar solo los permisos necesarios para realizar una función
- Revisar y actualizar permisos regularmente
- Separar roles y responsabilidades

## Autenticación y Autorización

### Autenticación de Usuarios

#### Registro de Usuarios

- Validación de formato de correo electrónico
- Requisitos de complejidad de contraseñas
- Verificación de correo electrónico
- Prevención de registros duplicados

```javascript
// Ejemplo de validación de contraseña
const validatePassword = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  return (
    password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar
  );
};
```

#### Inicio de Sesión

- Autenticación con correo y contraseña
- Bloqueo de cuentas tras múltiples intentos fallidos
- Tokens JWT con expiración
- Refresh tokens seguros

```javascript
// Ejemplo de protección contra fuerza bruta
const loginAttempts = new Map();

const checkLoginAttempts = (email) => {
  const attempts = loginAttempts.get(email) || 0;
  if (attempts >= 5) {
    throw new Error('Too many failed login attempts');
  }
};

const recordFailedLogin = (email) => {
  const attempts = loginAttempts.get(email) || 0;
  loginAttempts.set(email, attempts + 1);

  // Resetear intentos después de 15 minutos
  setTimeout(
    () => {
      loginAttempts.delete(email);
    },
    15 * 60 * 1000
  );
};
```

#### Autenticación de Dos Factores (2FA)

- Implementación opcional para usuarios
- Códigos basados en tiempo (TOTP)
- Respaldo de códigos de recuperación

### Autorización

#### Control de Acceso Basado en Roles (RBAC)

- Roles predefinidos (usuario, administrador)
- Permisos específicos por rol
- Asignación de roles a usuarios

```javascript
// Ejemplo de middleware de autorización
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

// Uso en rutas
router.delete('/products/:id', authenticate, requireRole(['admin']), deleteProduct);
```

#### Control de Acceso a Nivel de Recursos

- Verificación de propiedad de recursos
- Permisos específicos por recurso
- Validación de operaciones permitidas

## Protección de Datos

### Cifrado

#### En Tránsito

- HTTPS obligatorio para todas las comunicaciones
- TLS 1.2 o superior
- Certificados válidos y actualizados

#### En Reposo

- Cifrado de bases de datos sensibles
- Hashing de contraseñas con bcrypt
- Cifrado de información personal identificable (PII)

```javascript
// Ejemplo de hashing de contraseñas
const bcrypt = require('bcrypt');

const hashPassword = async (password) => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

const verifyPassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};
```

### Protección de Información Personal

#### Datos Sensibles

- Nombres completos
- Direcciones de correo electrónico
- Números de teléfono
- Direcciones físicas
- Información de pago

#### Minimización de Datos

- Recopilar solo datos necesarios
- Retener datos solo por el tiempo necesario
- Anonimizar datos cuando sea posible

## Seguridad en APIs

### Validación de Entrada

#### Sanitización de Datos

- Validar todos los parámetros de entrada
- Sanitizar datos antes de procesar
- Prevenir inyecciones SQL y XSS

```javascript
// Ejemplo de validación y sanitización
const Joi = require('joi');

const userSchema = Joi.object({
  email: Joi.string().email().required().lowercase(),
  password: Joi.string().min(8).required(),
  firstName: Joi.string().max(50).trim().required(),
  lastName: Joi.string().max(50).trim().required(),
});

const validateUserInput = (data) => {
  const { error, value } = userSchema.validate(data, { stripUnknown: true });
  if (error) {
    throw new ValidationError(error.details[0].message);
  }
  return value;
};
```

#### Rate Limiting

- Limitar solicitudes por IP
- Limitar solicitudes por usuario
- Implementar backoff exponencial

```javascript
// Ejemplo de rate limiting
const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // límite de 5 solicitudes
  message: 'Too many authentication attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

// Aplicar a rutas de autenticación
app.use('/api/auth', authLimiter);
```

### Manejo de Errores

#### Respuestas de Error Seguras

- No revelar información interna del sistema
- Registrar errores detallados en logs
- Devolver mensajes genéricos a los usuarios

```javascript
// Ejemplo de manejo de errores seguro
app.use((error, req, res, next) => {
  // Registrar error detallado internamente
  logger.error('Application error', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    userId: req.user?.id,
  });

  // Devolver respuesta genérica al usuario
  if (error instanceof ValidationError) {
    return res.status(400).json({
      success: false,
      error: { message: 'Invalid input data' },
    });
  }

  if (error instanceof AuthenticationError) {
    return res.status(401).json({
      success: false,
      error: { message: 'Authentication failed' },
    });
  }

  // Error genérico para casos no esperados
  res.status(500).json({
    success: false,
    error: { message: 'An unexpected error occurred' },
  });
});
```

## Seguridad en Infraestructura

### Contenedores Docker

#### Imágenes Seguras

- Usar imágenes base oficiales y actualizadas
- Escanear imágenes en busca de vulnerabilidades
- No incluir secretos en imágenes

```dockerfile
# Ejemplo de Dockerfile seguro
FROM node:16-alpine

# Crear usuario no root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Crear directorio de aplicación
WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias como usuario no root
RUN npm ci --only=production && npm cache clean --force

# Copiar código fuente
COPY . .

# Cambiar propietario de archivos
RUN chown -R nextjs:nodejs /app
USER nextjs

# Exponer puerto
EXPOSE 3000

# Comando de inicio
CMD ["node", "server.js"]
```

#### Configuración de Red

- Redes aisladas para contenedores
- Mapeo explícito de puertos necesarios
- Uso de networks de Docker

### Bases de Datos

#### Configuración Segura

- Usuarios con permisos mínimos
- Conexiones cifradas
- Backups regulares

#### Prevención de Inyecciones

- Uso de consultas parametrizadas
- Validación de entrada
- Escapado de caracteres especiales

```javascript
// Ejemplo de consulta parametrizada
const getUserByEmail = async (email) => {
  // Bien - consulta parametrizada
  const query = 'SELECT * FROM users WHERE email = $1';
  const result = await db.query(query, [email]);

  // Mal - concatenación directa (vulnerable a inyección)
  // const query = `SELECT * FROM users WHERE email = '${email}'`;

  return result.rows[0];
};
```

## Gestión de Secretos

### Variables de Entorno

#### Configuración Segura

- No almacenar secretos en código fuente
- Usar archivos .env para desarrollo
- Variables de entorno en producción

```env
# .env.example - Plantilla de variables
NODE_ENV=development
PORT=3000
JWT_SECRET=your-jwt-secret-here
DB_HOST=localhost
DB_PORT=5432
DB_NAME=flores_db
DB_USER=flores_user
DB_PASSWORD=your-db-password
```

#### Rotación de Secretos

- Cambiar secretos regularmente
- Procedimientos para rotación sin downtime
- Notificación de cambios

### Gestión de Secretos en Kubernetes

#### Secrets de Kubernetes

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: app-secrets
  namespace: flores-victoria
type: Opaque
data:
  jwt-secret: <base64-encoded-secret>
  db-password: <base64-encoded-password>
```

#### Inyección en Pods

```yaml
spec:
  containers:
    - name: auth-service
      image: floresvictoria/auth-service:latest
      env:
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: jwt-secret
        - name: DB_PASSWORD
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: db-password
```

## Pruebas de Seguridad

### Análisis de Dependencias

#### npm audit

```bash
# Auditar dependencias
npm audit

# Auditar solo vulnerabilidades de alta severidad
npm audit --audit-level=high

# Generar reporte JSON
npm audit --json > audit-report.json
```

#### Herramientas de Análisis Estático

- **Snyk**: Análisis de vulnerabilidades en tiempo real
- **SonarQube**: Análisis de calidad y seguridad de código
- **ESLint**: Reglas de seguridad en código JavaScript

### Pruebas de Penetración

#### Escaneo Automático

- **OWASP ZAP**: Escaneo automático de aplicaciones web
- **Burp Suite**: Pruebas manuales de seguridad
- **Nessus**: Escaneo de vulnerabilidades de red

#### Pruebas Manuales

- Revisión de código por pares
- Pruebas de autenticación y autorización
- Verificación de manejo de errores

## Monitoreo y Auditoría

### Logging de Seguridad

#### Eventos a Registrar

- Intentos de inicio de sesión fallidos
- Cambios en permisos de usuarios
- Acceso a datos sensibles
- Errores de seguridad

```javascript
// Ejemplo de logging de seguridad
const securityLogger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [new winston.transports.File({ filename: 'security.log' })],
});

// Registrar intento de inicio de sesión fallido
const logFailedLogin = (email, ip) => {
  securityLogger.warn('Failed login attempt', {
    email: email,
    ip: ip,
    timestamp: new Date().toISOString(),
  });
};
```

### Monitoreo en Tiempo Real

#### Alertas de Seguridad

- Tasa alta de errores 401/403
- Múltiples intentos fallidos de autenticación
- Acceso a endpoints sensibles
- Cambios inusuales en patrones de uso

#### Dashboards de Seguridad

- Métricas de autenticación
- Tendencias de errores de seguridad
- Actividad de usuarios administradores
- Estado de certificados SSL

## Respuesta a Incidentes

### Procedimiento de Respuesta

#### Detección

- Monitoreo continuo de logs
- Alertas automatizadas
- Reportes de usuarios

#### Contención

- Aislar sistemas afectados
- Bloquear accesos comprometidos
- Preservar evidencia

#### Erradicación

- Eliminar accesos no autorizados
- Parchear vulnerabilidades
- Cambiar credenciales comprometidas

#### Recuperación

- Restaurar sistemas desde backups limpios
- Verificar integridad de datos
- Monitorear sistemas recuperados

#### Lecciones Aprendidas

- Documentar incidente y respuesta
- Identificar mejoras en procesos
- Actualizar documentación de seguridad

### Plan de Comunicación

#### Interna

- Equipo de desarrollo
- Administradores del sistema
- Gerencia

#### Externa

- Usuarios afectados (si es necesario)
- Autoridades regulatorias (si aplica)
- Comunicados públicos (si es necesario)

## Cumplimiento y Regulaciones

### GDPR (Reglamento General de Protección de Datos)

#### Derechos de los Usuarios

- Derecho de acceso a sus datos
- Derecho a la rectificación
- Derecho al olvido
- Derecho a la portabilidad

#### Obligaciones

- Consentimiento explícito para recopilación de datos
- Notificación de violaciones de datos en 72 horas
- Evaluación de impacto en protección de datos
- Nombramiento de delegado de protección de datos (si aplica)

### PCI DSS (Si se manejan pagos)

#### Requisitos

- Protección de datos de titulares de tarjetas
- Uso de redes seguras
- Protección contra malware
- Desarrollo y mantenimiento seguro de sistemas

## Mejores Prácticas

### Desarrollo Seguro

#### Principio de Seguridad por Diseño

- Integrar seguridad desde la fase de diseño
- Realizar revisiones de seguridad en arquitectura
- Aplicar controles de seguridad en cada capa

#### Code Reviews de Seguridad

- Revisión de código por pares con enfoque en seguridad
- Checklist de prácticas de seguridad
- Herramientas de análisis estático en proceso de CI/CD

### Mantenimiento de Seguridad

#### Actualizaciones

- Mantener dependencias actualizadas
- Aplicar parches de seguridad de sistema operativo
- Actualizar frameworks y bibliotecas

#### Evaluaciones Periódicas

- Auditorías de seguridad trimestrales
- Pruebas de penetración anuales
- Revisión de políticas de seguridad

### Educación y Concienciación

#### Formación del Equipo

- Capacitación en seguridad para desarrolladores
- Actualizaciones sobre nuevas amenazas
- Buenas prácticas de seguridad

#### Cultura de Seguridad

- Fomentar reporte de vulnerabilidades
- Reconocer contribuciones a la seguridad
- Integrar seguridad en ceremonias ágiles

La seguridad no es un proyecto único, sino un proceso continuo que requiere atención constante,
actualización de conocimientos y adaptación a nuevas amenazas y tecnologías.
