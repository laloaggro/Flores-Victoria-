# Project Rules and Guidelines / Reglas y Lineamientos del Proyecto

**Effective Date / Fecha de Vigencia:** 20 de octubre de 2025  
**Status / Estado:** Active / Activo

---

## 🤖 AI Assistant Rules / Reglas para Asistentes IA

### 1. Automatic Command Execution / Ejecución Automática de Comandos
✅ **PERMISSION GRANTED / PERMISO CONCEDIDO**

The project owner has granted permission for AI assistants to automatically execute terminal commands without asking for confirmation.

El dueño del proyecto ha otorgado permiso para que los asistentes IA ejecuten comandos en la terminal automáticamente sin pedir confirmación.

**Applies to / Aplica a:**
- Git commands (add, commit, push)
- npm/node commands (install, test, build)
- Docker commands (build, up, down)
- Script executions
- File operations

**Exceptions / Excepciones:**
- Destructive operations (rm -rf, drop database)
- Production deployments
- Secret/credential modifications

---

### 2. Documentation Requirements / Requisitos de Documentación

✅ **MANDATORY / OBLIGATORIO**

All documentation must be maintained in **BOTH Spanish and English**.

Toda la documentación debe mantenerse en **AMBOS español e inglés**.

#### When to Update Documentation / Cuándo Actualizar Documentación

**ALWAYS update docs when / SIEMPRE actualizar docs cuando:**
- ✅ Adding new features / Añadiendo nuevas funcionalidades
- ✅ Fixing bugs / Corrigiendo errores
- ✅ Changing architecture / Cambiando arquitectura
- ✅ Modifying configuration / Modificando configuración
- ✅ Adding/removing dependencies / Añadiendo/eliminando dependencias
- ✅ Updating workflows / Actualizando workflows
- ✅ Changing API endpoints / Cambiando endpoints de API
- ✅ Modifying database schemas / Modificando esquemas de base de datos

#### Documentation Format / Formato de Documentación

```markdown
# Title in English / Título en Español

## Section / Sección

**English content here**

**Contenido en español aquí**
```

#### Documents to Maintain / Documentos a Mantener

**Primary / Primarios:**
- `README.md` - Project overview / Vista general del proyecto
- `CHANGELOG.md` - Version history / Historial de versiones
- `docs/PROJECT_OVERVIEW.md` - Architecture / Arquitectura
- `docs/DEVELOPMENT_SETUP.md` - Setup instructions / Instrucciones de configuración
- `docs/API_DOCUMENTATION.md` - API reference / Referencia de API

**Technical / Técnicos:**
- Service-specific READMEs in each microservice
- Configuration guides
- Deployment documentation
- Troubleshooting guides

**Project Management / Gestión de Proyecto:**
- Implementation summaries / Resúmenes de implementación
- Gap analysis / Análisis de gaps
- Action plans / Planes de acción

---

### 3. Commit Message Conventions / Convenciones de Mensajes de Commit

**Format / Formato:**
```
<type>: <description in English>

<optional detailed description in English>
<descripción detallada opcional en español>

<optional references>
```

**Types / Tipos:**
- `feat`: New feature / Nueva funcionalidad
- `fix`: Bug fix / Corrección de error
- `docs`: Documentation / Documentación
- `style`: Code style / Estilo de código
- `refactor`: Code refactoring / Refactorización
- `test`: Tests / Pruebas
- `chore`: Maintenance / Mantenimiento
- `perf`: Performance / Rendimiento
- `ci`: CI/CD changes / Cambios en CI/CD

**Examples / Ejemplos:**
```bash
git commit -m "feat: añade autenticación con Google OAuth

Implementa OAuth2 flow para login social
Implements OAuth2 flow for social login"

git commit -m "fix: corrige validación de email en registro

Actualiza regex para soportar dominios internacionales
Updates regex to support international domains"

git commit -m "docs: actualiza guía de instalación en español e inglés"
```

---

### 4. Code Quality Standards / Estándares de Calidad de Código

#### Testing / Pruebas
- ✅ Write tests for new features / Escribir tests para nuevas funcionalidades
- ✅ Run tests before committing / Ejecutar tests antes de commitear
- ✅ Maintain >80% coverage for critical paths / Mantener >80% cobertura en paths críticos

#### Code Style / Estilo de Código
- ✅ Use EditorConfig settings (`.editorconfig`)
- ✅ 2 spaces for indentation / 2 espacios para indentación
- ✅ UTF-8 encoding / Codificación UTF-8
- ✅ LF line endings / Finales de línea LF
- ✅ Meaningful variable names / Nombres de variables significativos

#### Comments / Comentarios
```javascript
// ✅ GOOD: Bilingual comments for complex logic
// Calcula el descuento aplicando reglas de negocio
// Calculates discount applying business rules
const calculateDiscount = (price, rules) => {
  // ...
};

// ❌ AVOID: No comments for obvious code
const sum = (a, b) => a + b; // Suma dos números
```

---

### 5. Git Workflow / Flujo de Git

#### Branches / Ramas
- `main` - Production-ready code / Código listo para producción
- `develop` - Development branch / Rama de desarrollo
- `feature/*` - New features / Nuevas funcionalidades
- `fix/*` - Bug fixes / Correcciones
- `docs/*` - Documentation updates / Actualizaciones de documentación

#### Pull Requests / Pull Requests
- ✅ Description in English and Spanish / Descripción en inglés y español
- ✅ Link related issues / Vincular issues relacionados
- ✅ Update CHANGELOG.md
- ✅ Ensure CI passes / Asegurar que CI pase

---

### 6. Environment Variables / Variables de Entorno

#### Security / Seguridad
- ❌ **NEVER** commit `.env` files / **NUNCA** commitear archivos `.env`
- ✅ **ALWAYS** use `.env.example` as template / **SIEMPRE** usar `.env.example` como plantilla
- ✅ Document all env vars / Documentar todas las variables de entorno
- ✅ Use secrets management in production / Usar gestión de secretos en producción

#### Documentation / Documentación
```bash
# .env.example
# API Gateway Configuration / Configuración del API Gateway
API_GATEWAY_PORT=3000

# Authentication / Autenticación
JWT_SECRET=change-me-in-production  # CRITICAL: Change in production / CRÍTICO: Cambiar en producción
```

---

### 7. Docker & Deployment / Docker y Despliegue

#### Development / Desarrollo
```bash
# Start development environment / Iniciar entorno de desarrollo
docker compose -f docker-compose.dev-simple.yml up -d

# View logs / Ver logs
docker compose -f docker-compose.dev-simple.yml logs -f [service]
```

#### Production / Producción
```bash
# Build images / Construir imágenes
docker compose -f docker-compose.yml build

# Deploy / Desplegar
docker compose -f docker-compose.yml up -d
```

---

### 8. Issue Tracking / Seguimiento de Issues

#### Issue Format / Formato de Issues
```markdown
**English:**
Brief description of the issue

**Español:**
Breve descripción del issue

**Steps to Reproduce / Pasos para Reproducir:**
1. Step one / Paso uno
2. Step two / Paso dos

**Expected Behavior / Comportamiento Esperado:**
What should happen / Qué debería pasar

**Actual Behavior / Comportamiento Actual:**
What actually happens / Qué pasa realmente

**Environment / Entorno:**
- OS: Ubuntu 20.04
- Node: 18.x
- Docker: 24.x
```

---

### 9. Version Numbering / Numeración de Versiones

**Semantic Versioning / Versionado Semántico:** `MAJOR.MINOR.PATCH`

- **MAJOR**: Breaking changes / Cambios incompatibles
- **MINOR**: New features (backwards compatible) / Nuevas funcionalidades (compatibles)
- **PATCH**: Bug fixes / Correcciones

**Examples / Ejemplos:**
- `1.0.0` → `1.0.1` (Bug fix / Corrección)
- `1.0.1` → `1.1.0` (New feature / Nueva funcionalidad)
- `1.1.0` → `2.0.0` (Breaking change / Cambio incompatible)

---

### 10. Performance & Monitoring / Rendimiento y Monitoreo

#### Logging / Registro
```javascript
// ✅ Structured logging with context
logger.info('User login successful', {
  userId: user.id,
  timestamp: new Date(),
  service: 'auth-service'
});

// ❌ Avoid console.log in production
console.log('User logged in'); // Remove before production
```

#### Metrics / Métricas
- ✅ Track response times / Rastrear tiempos de respuesta
- ✅ Monitor error rates / Monitorear tasas de error
- ✅ Use Prometheus + Grafana
- ✅ Set up alerts / Configurar alertas

---

## 📋 Checklist for AI Assistants / Lista de Verificación para Asistentes IA

Before completing a task / Antes de completar una tarea:

- [ ] ✅ Commands executed automatically (permission granted) / Comandos ejecutados automáticamente (permiso otorgado)
- [ ] 📝 Documentation updated in BOTH languages / Documentación actualizada en AMBOS idiomas
- [ ] ✅ Tests written and passing / Tests escritos y pasando
- [ ] 🔍 Code reviewed for quality / Código revisado por calidad
- [ ] 📚 CHANGELOG.md updated / CHANGELOG.md actualizado
- [ ] 🔐 No secrets in code / Sin secretos en el código
- [ ] 🎯 Issue/PR linked if applicable / Issue/PR vinculado si aplica
- [ ] ✅ CI/CD passing / CI/CD pasando
- [ ] 📖 Comments in critical sections / Comentarios en secciones críticas
- [ ] 🌍 Bilingual when necessary / Bilingüe cuando sea necesario

---

## 🔄 Review Process / Proceso de Revisión

1. **Self-review / Auto-revisión:** AI checks own work
2. **Automated checks / Verificaciones automáticas:** CI/CD pipeline
3. **Documentation scan / Escaneo de documentación:** Ensure bilingual docs
4. **Security scan / Escaneo de seguridad:** No exposed secrets

---

## 📞 Questions / Preguntas

If unclear about any rule / Si no está claro alguna regla:
- Check existing examples in the codebase / Revisar ejemplos existentes en el código
- Refer to this document / Referirse a este documento
- Ask the project owner / Preguntar al dueño del proyecto

---

**Last Updated / Última Actualización:** 20 de octubre de 2025  
**Version / Versión:** 1.0.0  
**Maintained by / Mantenido por:** Project Team / Equipo del Proyecto
