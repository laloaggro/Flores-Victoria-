# Automatización de Índices (TOC) en Markdown

## Opciones recomendadas

### 1. CLI: doctoc
- Instala con: `npm install -g doctoc`
- Actualiza el índice de cualquier archivo Markdown ejecutando:
  ```bash
  doctoc docs/DEVELOPMENT_SETUP.md
  doctoc docs/CONTRIBUTING_DOCS.md
  doctoc docs/DOCUMENTATION_INDEX.md
  # ...otros archivos
  ```
- Integra en CI para mantener los TOCs actualizados automáticamente.

### 2. Extensión VS Code: Markdown All in One
- Instala la extensión "Markdown All in One" desde el marketplace.
- Usa el comando `Markdown: Create Table of Contents` en el editor para generar o actualizar el índice.

## Recomendaciones
- Actualiza el TOC antes de cada PR que modifique secciones o títulos.
- Integra la verificación de TOC en la checklist de calidad de PRs.
- Puedes combinar ambas opciones según tu flujo de trabajo.

---

# TOC Automation in Markdown (English)

## Recommended Options

### 1. CLI: doctoc
- Install with: `npm install -g doctoc`
- Update the TOC of any Markdown file by running:
  ```bash
  doctoc docs/DEVELOPMENT_SETUP.md
  doctoc docs/CONTRIBUTING_DOCS.md
  doctoc docs/DOCUMENTATION_INDEX.md
  # ...other files
  ```
- Integrate in CI to keep TOCs updated automatically.

### 2. VS Code Extension: Markdown All in One
- Install the "Markdown All in One" extension from the marketplace.
- Use the `Markdown: Create Table of Contents` command in the editor to generate or update the TOC.

## Recommendations
- Update the TOC before each PR that modifies sections or headings.
- Integrate TOC verification in the PR quality checklist.
- You can combine both options depending on your workflow.
