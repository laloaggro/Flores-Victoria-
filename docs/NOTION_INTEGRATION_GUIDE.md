# 🔄 Guía de Integración Notion - Flores Victoria v3.0

**Última actualización**: 25 de Octubre 2025  
**Tiempo estimado**: 30-40 minutos  
**Nivel**: Intermedio

---

## 📋 Índice

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Contenido Disponible para Notion](#contenido-disponible)
3. [Setup Automático](#setup-automático)
4. [Setup Manual](#setup-manual)
5. [Estructura Recomendada](#estructura-recomendada)
6. [Sincronización Continua](#sincronización-continua)
7. [Best Practices](#best-practices)

---

## 🎯 Resumen Ejecutivo

Flores Victoria tiene documentación completa lista para ser publicada en Notion. Esta guía te ayudará a:

- ✅ Importar toda la documentación del proyecto
- ✅ Crear estructura organizada de workspace
- ✅ Mantener sincronización con el repositorio
- ✅ Aprovechar databases y vistas interactivas

### 🎁 Lo que ya tienes listo:

```
docs/notion-exports/
├── services-status.csv       # Estado de todos los servicios
├── tasks.csv                 # Tareas y roadmap
├── env-variables.csv         # Variables de entorno
├── quick-reference.md        # Referencia rápida
└── adr-templates/            # Templates de decisiones

docs/
├── NOTION_SETUP_GUIDE.md     # Guía detallada paso a paso
├── notion-initial-content.md # Contenido inicial para copiar
└── COMPLETE_PROJECT_DOCUMENTATION.md  # Documentación master
```

---

## 📦 Contenido Disponible para Notion

### 1. Documentación Técnica (Markdown → Notion)

| Documento | Ubicación | Sección Notion Sugerida |
|-----------|-----------|------------------------|
| **README Principal** | `/README.md` | 🏠 Home / Overview |
| **Quick Start** | `/QUICKSTART.md` | 📚 Getting Started |
| **Guía de Contribución** | `/CONTRIBUTING.md` | 👥 Community |
| **Código de Conducta** | `/CODE_OF_CONDUCT.md` | 👥 Community |
| **Estado del Sistema** | `/ESTADO_SISTEMA.md` | 📊 System Status |
| **Documentación Completa** | `/docs/COMPLETE_PROJECT_DOCUMENTATION.md` | 📚 Documentation |
| **Arquitectura** | `/docs/architecture/` | 🏗️ Architecture |
| **API Reference** | `/docs/api/` | 🔌 API |
| **Guías de Desarrollo** | `/docs/development/` | 💻 Development |
| **Cheatsheets** | `/docs/cheatsheets/` | 📖 Quick Reference |

### 2. Databases Interactivas (CSV → Notion)

| Database | Archivo CSV | Uso |
|----------|-------------|-----|
| **Services Catalog** | `notion-exports/services-status.csv` | Track de todos los microservicios |
| **Environment Variables** | `notion-exports/env-variables.csv` | Configuración y secrets |
| **Tasks & Roadmap** | `notion-exports/tasks.csv` | Gestión de tareas |
| **Broken Links** | Generar con `link-validator.js` | Validación de URLs |
| **Port Registry** | `/docs/PORTS.md` | Registro de puertos |

### 3. Dashboards en Tiempo Real

| Dashboard | Fuente de Datos | Actualización |
|-----------|-----------------|---------------|
| **System Health** | `./system-health-check.sh` | Manual/Script |
| **Services Status** | `http://localhost:3000/api/status` | API |
| **Docker Containers** | `./docker-core.sh status` | Script |
| **Métricas Prometheus** | `http://localhost:9090` | Embed |

---

## 🚀 Setup Automático

### Opción A: Script de Importación (Recomendado)

```bash
# 1. Generar exports actualizados
cd /home/impala/Documentos/Proyectos/flores-victoria

# 2. Ejecutar script de export para Notion
./scripts/export-to-notion.sh

# 3. Los archivos se generan en docs/notion-exports/
ls -la docs/notion-exports/

# Output esperado:
# services-status.csv
# tasks.csv
# env-variables.csv
# broken-links.csv  (nuevo)
# ports-registry.csv (nuevo)
# health-status.json (nuevo)
```

### Opción B: Generación Manual

```bash
# 1. Estado de servicios
./system-health-check.sh > docs/notion-exports/health-report.txt

# 2. Tabla de puertos
cat docs/PORTS.md | grep "|" > docs/notion-exports/ports.csv

# 3. Links rotos
node scripts/link-validator.js --output=csv > docs/notion-exports/broken-links.csv

# 4. Estado de Docker
./docker-core.sh status > docs/notion-exports/docker-status.txt
```

---

## 📝 Setup Manual en Notion

### Paso 1: Crear Workspace (5 min)

1. **Ir a** https://notion.so
2. **Crear nuevo workspace**: "Flores Victoria"
3. **Ícono**: 🌸
4. **Color**: Verde (#10b981)

### Paso 2: Estructura Base (10 min)

Crear esta jerarquía de páginas:

```
🌸 Flores Victoria
├── 🏠 Home
│   ├── 📊 System Status Dashboard
│   ├── 🔗 Quick Links
│   └── 📅 Current Sprint
├── 📚 Documentation
│   ├── 🚀 Getting Started
│   ├── 🏗️ Architecture
│   ├── 🔌 API Reference
│   ├── 💻 Development Guides
│   └── 📖 Cheatsheets
├── 📋 Project Management
│   ├── 📋 Tasks [Database]
│   ├── 🐛 Bugs [Database]
│   ├── ✨ Features [Database]
│   └── 🗺️ Roadmap [Timeline]
├── 🔧 Services
│   ├── 📊 Services Status [Database]
│   ├── 🐳 Docker Containers
│   ├── 🔌 Ports Registry [Database]
│   └── 🌐 Environment Variables [Database]
├── ✅ Quality Assurance
│   ├── 🔗 Link Validation [Database]
│   ├── 🧪 Test Results
│   └── 📊 Health Checks
└── 👥 Team & Community
    ├── 🤝 Contributing
    ├── 📜 Code of Conduct
    └── 📝 Meeting Notes
```

### Paso 3: Importar Databases (15 min)

#### 3.1 Services Status

1. Crear página "Services Status" como database
2. Click en "..." → "Merge with CSV"
3. Seleccionar `docs/notion-exports/services-status.csv`
4. Configurar columnas:
   - **Service** (Title): Nombre del servicio
   - **Status** (Select): 🟢 Healthy, 🟡 Warning, 🔴 Down
   - **Type** (Select): Core, Optional, Infrastructure
   - **Port Dev** (Number): Puerto desarrollo
   - **Port Prod** (Number): Puerto producción
   - **Health URL** (URL): Endpoint de health check
   - **Last Check** (Date): Última verificación

5. Crear vistas:
   - **Board**: Agrupar por Status
   - **Table**: Vista completa
   - **Gallery**: Con descripción

#### 3.2 Tasks & Roadmap

1. Crear database "Tasks"
2. Importar `docs/notion-exports/tasks.csv`
3. Columnas:
   - **Task** (Title)
   - **Status** (Select): 🆕 New, 🔵 In Progress, ✅ Done, ❌ Blocked
   - **Priority** (Select): 🔴 High, 🟠 Medium, 🟡 Low
   - **Service** (Multi-select): Admin, AI, Order, Auth, etc.
   - **Sprint** (Select): Sprint 1, Sprint 2...
   - **Assignee** (Person)
   - **Due Date** (Date)
   - **Estimate** (Number): Story points

4. Vistas:
   - **Kanban**: Por Status
   - **Timeline**: Por Sprint
   - **Calendar**: Por Due Date
   - **Table**: Full view

#### 3.3 Environment Variables

1. Crear database "Environment Variables"
2. Importar `docs/notion-exports/env-variables.csv`
3. Columnas:
   - **Variable** (Title): NODE_ENV, PORT, etc.
   - **Value Dev** (Text): Valor desarrollo
   - **Value Prod** (Text): Valor producción
   - **Service** (Multi-select): Dónde se usa
   - **Required** (Checkbox)
   - **Description** (Text)
   - **Default** (Text)

4. Toggle para ocultar valores sensibles

#### 3.4 Ports Registry

1. Crear database "Ports Registry"
2. Importar datos de `/docs/PORTS.md`
3. Columnas:
   - **Service** (Title)
   - **Port Dev** (Number): 3021, 3002, etc.
   - **Port Prod** (Number)
   - **Port Test** (Number)
   - **Protocol** (Select): HTTP, HTTPS, TCP
   - **Status** (Select): 🟢 Active, ⚪ Planned
   - **Notes** (Text)

---

## 📄 Importar Documentación Markdown

### Método 1: Import Directo (Rápido)

1. En Notion, ir a la página donde quieres importar
2. Click "..." → "Import" → "Markdown"
3. Seleccionar el archivo .md
4. Notion convierte automáticamente el formato

**Archivos prioritarios para importar:**

```bash
# Copiar a Notion:
README.md               → Home / Overview
QUICKSTART.md          → Documentation / Getting Started
CONTRIBUTING.md        → Team & Community
CODE_OF_CONDUCT.md     → Team & Community
ESTADO_SISTEMA.md      → Home / System Status
docs/COMPLETE_PROJECT_DOCUMENTATION.md → Documentation / Complete Docs
docs/cheatsheets/MASTER_CHEATSHEET.md  → Documentation / Cheatsheets
```

### Método 2: Copy-Paste con Formato

Para documentos más cortos:

1. Abrir el `.md` en VS Code
2. Instalar extensión "Markdown Preview Enhanced"
3. Copiar desde preview
4. Pegar en Notion (mantiene formato)

---

## 🔄 Sincronización Continua

### Opción A: Script de Sync Automático

Crear script `scripts/sync-to-notion.sh`:

```bash
#!/bin/bash

# Sync automático cada hora con Notion
# Requiere Notion API token

echo "🔄 Sincronizando con Notion..."

# 1. Exportar estado actual
./system-health-check.sh --json > docs/notion-exports/health.json

# 2. Actualizar services status
node scripts/export-services-status.js

# 3. Actualizar via Notion API (requiere setup)
# node scripts/notion-sync.js

echo "✅ Sync completado"
```

### Opción B: GitHub Actions + Notion API

Crear `.github/workflows/notion-sync.yml`:

```yaml
name: Sync to Notion

on:
  push:
    branches: [main]
    paths:
      - 'docs/**'
      - 'README.md'
      - 'QUICKSTART.md'
  schedule:
    - cron: '0 */6 * * *'  # Cada 6 horas

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Sync Documentation
        run: |
          npm install @notionhq/client
          node scripts/notion-sync.js
        env:
          NOTION_API_KEY: ${{ secrets.NOTION_API_KEY }}
          NOTION_DATABASE_ID: ${{ secrets.NOTION_DATABASE_ID }}
```

### Opción C: Manual Periódico

**Frecuencia recomendada**: Semanal

1. Generar exports: `./scripts/export-to-notion.sh`
2. Ir a Notion → Database → "..." → "Merge with CSV"
3. Actualizar dashboards manualmente
4. Verificar enlaces y formato

---

## 🎨 Best Practices para Notion

### 1. Organización

- ✅ Usa emojis consistentes para identificar secciones
- ✅ Crea templates para documentos repetitivos
- ✅ Usa databases para datos estructurados
- ✅ Mantén jerarquía máxima de 3 niveles

### 2. Formato

- ✅ Code blocks con syntax highlighting
- ✅ Callouts para warnings e info importante
- ✅ Toggle lists para FAQ y troubleshooting
- ✅ Tablas para comparaciones

### 3. Colaboración

- ✅ Añade comentarios en decisiones importantes
- ✅ Usa @mentions para asignar tareas
- ✅ Configura permisos por página (público/privado)
- ✅ Activa notificaciones para cambios críticos

### 4. Mantenimiento

- ✅ Revisa y actualiza mensualmente
- ✅ Archiva contenido obsoleto
- ✅ Mantén links actualizados
- ✅ Usa page properties para metadatos

---

## 🔗 Links Útiles

### Documentación Notion

- [Notion API Docs](https://developers.notion.com/)
- [Import & Export](https://www.notion.so/help/import-and-export)
- [Database Guide](https://www.notion.so/help/guides/creating-a-database)

### Herramientas

- [notion-py](https://github.com/jamalex/notion-py) - Python API
- [@notionhq/client](https://github.com/makenotion/notion-sdk-js) - Node.js SDK
- [Notion Enhancer](https://notion-enhancer.github.io/) - Extensiones

### Templates

- [Engineering Wiki](https://www.notion.so/templates/engineering-wiki)
- [Product Roadmap](https://www.notion.so/templates/product-roadmap)
- [API Documentation](https://www.notion.so/templates/api-documentation)

---

## ✅ Checklist de Implementación

- [ ] Workspace "Flores Victoria" creado en Notion
- [ ] Estructura de páginas base implementada
- [ ] Services Status database importado
- [ ] Tasks & Roadmap database importado
- [ ] Environment Variables database importado
- [ ] Ports Registry database importado
- [ ] README.md importado como Home
- [ ] QUICKSTART.md importado
- [ ] CONTRIBUTING.md importado
- [ ] Documentación técnica principal importada
- [ ] Cheatsheets añadidos
- [ ] Links internos verificados
- [ ] Permisos configurados
- [ ] Team invitado al workspace
- [ ] Script de sync configurado (opcional)

---

## 🆘 Troubleshooting

### Problema: CSV no importa correctamente

**Solución**:
```bash
# Verificar encoding
file -I docs/notion-exports/services-status.csv

# Convertir a UTF-8 si es necesario
iconv -f ISO-8859-1 -t UTF-8 input.csv > output.csv
```

### Problema: Formato Markdown no se convierte bien

**Solución**:
- Usa "Paste as Markdown" en Notion (Ctrl+Shift+V)
- O importa como archivo .md en lugar de copy-paste

### Problema: Imágenes no cargan

**Solución**:
- Sube imágenes directamente a Notion
- O usa URLs públicas desde GitHub
- Formato: `https://raw.githubusercontent.com/user/repo/main/path/image.png`

---

**🌸 ¡Tu documentación de Flores Victoria en Notion está lista!**

Para preguntas o sugerencias, abre un issue en GitHub o contacta al equipo.
