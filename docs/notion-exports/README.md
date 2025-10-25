# 📤 Notion Exports - Flores Victoria

Este directorio contiene todos los archivos necesarios para importar la documentación de Flores Victoria a Notion.

## 📋 Contenido

### Databases (CSV)

| Archivo | Descripción | Importar como |
|---------|-------------|---------------|
| **services-status.csv** | Estado de todos los servicios del sistema | Database → Table |
| **ports-registry.csv** | Registro completo de puertos por entorno | Database → Table |
| **env-variables.csv** | Variables de entorno y configuración | Database → Table |
| **tasks.csv** | Tareas, roadmap y sprints | Database → Board/Table |
| **broken-links.csv** | Links rotos y su estado de corrección | Database → Table |

### Status Reports

| Archivo | Descripción | Formato |
|---------|-------------|---------|
| **health-status.json** | Estado de salud del sistema en tiempo real | JSON |
| **docker-status.txt** | Estado de contenedores Docker | Text |

### Documentation

| Archivo | Descripción | Importar como |
|---------|-------------|---------------|
| **NOTION_WORKSPACE_OVERVIEW.md** | Overview principal del workspace | Page (Home) |
| **quick-reference.md** | Referencia rápida de comandos y URLs | Page |

### Templates

| Directorio | Descripción | Uso |
|------------|-------------|-----|
| **adr-templates/** | Templates para Architecture Decision Records | Copy to Notion |

---

## 🚀 Guía Rápida de Importación

### 1. Preparación (2 min)

```bash
# Asegurar que los exports están actualizados
cd /home/impala/Documentos/Proyectos/flores-victoria
./scripts/export-to-notion.sh
```

### 2. Crear Workspace en Notion (5 min)

1. Ir a https://notion.so
2. Crear workspace "Flores Victoria"
3. Ícono: 🌸
4. Color: Verde

### 3. Importar Databases (15 min)

#### Services Status

1. Crear página "Services Status"
2. Agregar database (Table)
3. "..." → "Merge with CSV"
4. Seleccionar `services-status.csv`
5. Configurar columnas según tipos

#### Ports Registry

1. Crear página "Ports Registry"
2. Agregar database (Table)
3. Importar `ports-registry.csv`
4. Configurar vista filtrada por Status

#### Environment Variables

1. Crear página "Environment Variables"
2. Agregar database (Table)
3. Importar `env-variables.csv`
4. Marcar como "Private" si contiene secrets

#### Tasks & Roadmap

1. Crear página "Tasks"
2. Agregar database (Board)
3. Importar `tasks.csv`
4. Crear vistas:
   - Board (por Status)
   - Calendar (por Due Date)
   - Timeline (por Sprint)

#### Broken Links

1. Crear página "Link Validation"
2. Agregar database (Table)
3. Importar `broken-links.csv`
4. Filtrar por Status = 🔴 Broken

### 4. Importar Documentación (10 min)

#### Workspace Overview (Home)

1. Crear página principal "Flores Victoria"
2. "..." → "Import" → "Markdown"
3. Seleccionar `NOTION_WORKSPACE_OVERVIEW.md`
4. Configurar como página de inicio

#### Quick Reference

1. Crear página "Quick Reference"
2. Importar `quick-reference.md`
3. Marcar como "Template" para reutilizar

---

## 📊 Estructura Recomendada en Notion

```
🌸 Flores Victoria
├── 🏠 Home (NOTION_WORKSPACE_OVERVIEW.md)
│   ├── 📊 System Status Dashboard
│   ├── 🔗 Quick Links
│   └── 📅 Current Sprint
├── 📚 Documentation
│   ├── 🚀 Getting Started (quick-reference.md)
│   ├── 🏗️ Architecture
│   ├── 🔌 API Reference
│   └── 📖 Cheatsheets
├── 🔧 Services
│   ├── 📊 Services Status [Database] (services-status.csv)
│   ├── 🔌 Ports Registry [Database] (ports-registry.csv)
│   └── 🌐 Environment Variables [Database] (env-variables.csv)
├── 📋 Project Management
│   ├── 📋 Tasks [Database] (tasks.csv)
│   ├── 🐛 Bugs [Database]
│   └── 🗺️ Roadmap [Timeline]
└── ✅ Quality Assurance
    ├── 🔗 Link Validation [Database] (broken-links.csv)
    ├── 🏥 Health Status (health-status.json)
    └── 🐳 Docker Status (docker-status.txt)
```

---

## 🔄 Actualización Periódica

### Frecuencia Recomendada

- **Services Status**: Diario
- **Health Status**: En cada deploy
- **Tasks**: Continuo (durante sprints)
- **Ports Registry**: Solo cuando cambie
- **Environment Variables**: Solo cuando cambie

### Comandos de Actualización

```bash
# Regenerar todos los exports
./scripts/export-to-notion.sh

# Verificar archivos generados
ls -lh docs/notion-exports/

# Importar en Notion:
# 1. Ir a la database
# 2. "..." → "Merge with CSV"
# 3. Seleccionar el CSV actualizado
# 4. Notion merge automáticamente (por Title/ID)
```

---

## 📝 Notas Importantes

### ✅ Qué SI incluir en Notion

- ✅ Documentation overview y getting started
- ✅ Services status y monitoring
- ✅ Roadmap y tasks
- ✅ Environment variables (sin valores sensibles)
- ✅ Architecture decisions (ADRs)
- ✅ Meeting notes y retrospectives

### ❌ Qué NO incluir en Notion

- ❌ Secrets o API keys reales
- ❌ Información financiera sensible
- ❌ Datos personales de usuarios
- ❌ Código fuente completo (usar GitHub)
- ❌ Credenciales de producción

### 🔐 Seguridad

- Configurar permisos apropiados por página
- Marcar páginas sensibles como "Private"
- No compartir públicamente databases con env vars
- Usar [tokens de ejemplo] en lugar de valores reales
- Regular access control periódicamente

---

## 🆘 Troubleshooting

### CSV no importa correctamente

**Problema**: Columnas no se mapean bien  
**Solución**: 
```bash
# Verificar encoding
file -I docs/notion-exports/services-status.csv

# Abrir en Excel/LibreOffice y guardar como UTF-8 CSV
```

### Markdown no se formatea bien

**Problema**: Formato se pierde al importar  
**Solución**: 
- Usa "Import" en lugar de copy-paste
- O usa Ctrl+Shift+V ("Paste as Markdown")

### Database duplica entradas

**Problema**: Al re-importar crea duplicados  
**Solución**: 
- Usa "Merge with CSV" en lugar de "Import"
- Asegura que la primera columna (Title) sea única

---

## 📚 Recursos Adicionales

### Guías Detalladas

- [NOTION_INTEGRATION_GUIDE.md](../NOTION_INTEGRATION_GUIDE.md) - Guía completa paso a paso
- [NOTION_SETUP_GUIDE.md](../NOTION_SETUP_GUIDE.md) - Setup original detallado
- [DOCS_PORTALS_GUIDE.md](../DOCS_PORTALS_GUIDE.md) - Publicación en portales externos

### Notion Resources

- [Notion Import Guide](https://www.notion.so/help/import-data-into-notion)
- [Notion API Docs](https://developers.notion.com/)
- [Database Properties](https://www.notion.so/help/database-properties)

### Automation

- [Notion API SDK](https://github.com/makenotion/notion-sdk-js)
- [n8n Notion Integration](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.notion/)
- [Zapier Notion](https://zapier.com/apps/notion/integrations)

---

**🌸 Tu documentación de Flores Victoria lista para Notion 🌸**

Para preguntas o soporte, abre un issue en GitHub:  
https://github.com/laloaggro/Flores-Victoria-/issues

---

*Última actualización: 25 de Octubre 2025*  
*Generado con: `./scripts/export-to-notion.sh`*
