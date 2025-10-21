# 🤝 Guía para Contribuir y Mantener la Calidad de la Documentación

## 1. Validación automática de enlaces internos

Para evitar enlaces rotos en los archivos Markdown, utiliza la herramienta `markdown-link-check`:

### Instalación
```bash
npm install -g markdown-link-check
```

### Uso manual
```bash
markdown-link-check docs/DOCUMENTATION_INDEX.md
markdown-link-check docs/DOCUMENTATION_CONSOLIDATION_PLAN.md
```

### Integración en CI (GitHub Actions)
Agrega este job en `.github/workflows/docs-link-check.yml`:
```yaml
name: Docs Link Check
on:
  pull_request:
    paths:
      - '**/*.md'
jobs:
  link-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install markdown-link-check
        run: npm install -g markdown-link-check
      - name: Check links
        run: |
          find docs -name '*.md' | xargs -n 1 markdown-link-check
```

## 2. Revisión y actualización periódica
- Programa revisiones trimestrales para eliminar, fusionar o actualizar documentos obsoletos.
- Usa el índice maestro (`DOCUMENTATION_INDEX.md`) como checklist.

## 3. Guía de estilo y ejemplos
- Mantén títulos H1 claros y únicos.
- Incluye tabla de contenidos si el documento supera 2 pantallas.
- Usa bloques de código con lenguaje especificado.
- Prefiere enlaces relativos.
- Ejemplos ejecutables y comandos listos para copiar.

## 4. Roles y responsables
## 🛡️ Roles y responsables / Documentation Roles

**Español:**
- Responsable documental: @laloaggro
- Revisores: @laloaggro, @colaborador1
- Contribuyentes: cualquier usuario con PR aprobado
- Revisión trimestral: última semana de cada trimestre

**English:**
- Documentation lead: @laloaggro
- Reviewers: @laloaggro, @colaborador1
- Contributors: any user with approved PR
- Quarterly review: last week of each quarter
 

- Considera encuestas internas cada semestre.

## 6. Versionado y badges
- Mantén un CHANGELOG específico para docs.
- Agrega badges de “Documentación actualizada” y “Enlaces validados” en el README.

---

**¡Contribuir y mantener la calidad de la documentación es tarea de todos!**