# Environments - Gestión de Entornos

Esta carpeta contiene las configuraciones separadas por entorno para evitar confusiones y mantener
una clara distinción entre desarrollo y producción.

## 📁 Estructura

```
environments/
├── production/          # 🚀 Solo para producción en Oracle Cloud
├── development/         # 💻 Solo para desarrollo local
└── shared/             # 🔄 Componentes compartidos entre entornos
```

## 🚀 Production (`production/`)

**Archivos específicos de producción:**

- `docker-compose.production.yml` - Configuración hardened para producción
- `.env.production.example` - Template de variables de entorno
- `backup-production.sh` - Script de backups automáticos
- `generate-production-secrets.sh` - Generador de secretos seguros
- `CHECKLIST_DEPLOY_ORACLE_CLOUD.md` - Guía de deployment

**Características:**

- Puertos cerrados (solo Nginx expuesto)
- Resource limits configurados
- Healthchecks habilitados
- Logging rotativo
- Restart policies: `unless-stopped`
- Secretos seguros con OpenSSL

**Uso:**

```bash
cd environments/production
docker compose -f docker-compose.production.yml up -d
```

## 💻 Development (`development/`)

**Archivos específicos de desarrollo:**

- `docker-compose.dev-simple.yml` - Configuración simplificada para desarrollo
- `.env.example` - Variables de entorno de desarrollo

**Características:**

- Hot reload habilitado
- Puertos expuestos para debugging
- Sin resource limits estrictos
- Volúmenes montados para edición en tiempo real
- Logging verbose

**Uso:**

```bash
cd environments/development
docker compose -f docker-compose.dev-simple.yml up -d
```

## 🔄 Shared (`shared/`)

**Componentes compartidos entre entornos:**

- Microservicios (código fuente)
- Frontend (código fuente)
- Scripts de utilidades generales
- Configuraciones base

**Nota:** Los archivos compartidos NO deben contener:

- Credenciales o secretos
- Configuraciones específicas de entorno
- Variables de producción

## 🔒 Seguridad

### ❌ NUNCA commitear:

```
.env.production
.env.production.generated
config/production-secrets/
backups/
*.log
```

### ✅ SÍ commitear:

```
.env.example
.env.production.example
docker-compose.*.yml (configuraciones)
README.md (documentación)
```

## 📋 Checklist - ¿Dónde va mi archivo?

### ➡️ Va a `production/` si:

- [ ] Tiene secretos o contraseñas de producción
- [ ] Configura recursos para Oracle Cloud
- [ ] Es un script de backup/deploy
- [ ] Solo se usa en el servidor de producción

### ➡️ Va a `development/` si:

- [ ] Solo se usa en desarrollo local
- [ ] Tiene puertos expuestos para debugging
- [ ] Configura hot reload o watch mode
- [ ] Usa credenciales de desarrollo

### ➡️ Va a `shared/` si:

- [ ] Es código fuente (JS, CSS, HTML)
- [ ] Es un componente reutilizable
- [ ] Se usa en AMBOS entornos
- [ ] NO contiene configuraciones de entorno

### ➡️ Se queda en la raíz si:

- [ ] Es documentación general (README.md, CHANGELOG.md)
- [ ] Es configuración de proyecto (package.json, .gitignore)
- [ ] Son scripts de CI/CD
- [ ] Es infraestructura general

## 🚦 Flujos de Trabajo

### Desarrollo Local → Producción

1. **Desarrollo**:

   ```bash
   cd environments/development
   docker compose -f docker-compose.dev-simple.yml up -d
   # Hacer cambios en código
   ```

2. **Testing**:

   ```bash
   npm test
   npm run lint
   ```

3. **Build para producción**:

   ```bash
   cd frontend && npm run build
   ```

4. **Deploy a producción**:
   ```bash
   cd environments/production
   # Copiar .env.production con secretos generados
   docker compose -f docker-compose.production.yml up -d
   ```

## 📞 Enlaces Útiles

- [Guía de Desarrollo](../../DEVELOPMENT_GUIDE.md)
- [Checklist de Deploy](./production/CHECKLIST_DEPLOY_ORACLE_CLOUD.md)
- [Documentación de API](../../API_DOCUMENTATION.md)
- [Arquitectura del Sistema](../../ARCHITECTURE.md)

## ⚠️ Notas Importantes

1. **Siempre verifica** en qué entorno estás trabajando antes de ejecutar comandos
2. **Nunca uses** configuraciones de producción en desarrollo
3. **Nunca copies** archivos de development a production sin revisarlos
4. **Mantén** las variables de entorno sincronizadas entre `.env.example` y
   `.env.production.example`
5. **Documenta** cualquier cambio en las configuraciones de entorno

---

**Última actualización**: 25 noviembre 2025 **Versión**: 1.0.0
