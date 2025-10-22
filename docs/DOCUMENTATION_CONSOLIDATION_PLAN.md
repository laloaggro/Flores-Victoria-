# 🧭 Plan de Consolidación de Documentación

Objetivo: reducir duplicados, mejorar la navegabilidad y definir puntos canónicos sin romper flujos
actuales.

Fecha: 2025-10-20

---

## 1) Inventario y hallazgos

- Total archivos doc (md/html): 178
- Carpetas con mayor volumen: docs/ (84), frontend/ (37 HTML), admin-panel/ (17 HTML), mindmaps/ (8)
- Duplicados por nombre (en distintos paths):
  - CODING_STANDARDS.md (docs/ vs docs/development/)
  - DEVELOPMENT_SETUP.md (docs/ vs docs/development/)
  - PROJECT_RULES.md (.github/ vs docs/)
  - TROUBLESHOOTING.md (docs/ vs docs/operations/)
  - TECHNICAL_DOCUMENTATION.md (root/ vs docs/)
  - microservices-architecture.md (docs/architecture/ vs mindmaps/)
  - security.md (frontend/ vs mindmaps/)
  - README.md (múltiples módulos — esperado)
  - index.html, products.html (frontend/ vs admin-panel/)

---

## 2) Principios de consolidación

- “Canónico único por tema”: un documento principal por tópico.
- “No romper”: los documentos duplicados quedarán marcados como DEPRECATED y enlazarán al canónico.
- “Contexto importa”: mindmaps permanecen como material visual; architecture contiene los formales.
- “Scopes claros”: docs/development/ para guías de dev; docs/operations/ para operación;
  docs/architecture/ para diseño.

---

## 3) Mapeo propuesto canónico → deprecados

- CODING_STANDARDS.md
  - Canónico: docs/development/CODING_STANDARDS.md
  - Deprecado: docs/CODING_STANDARDS.md

- DEVELOPMENT_SETUP.md
  - Canónico: docs/development/DEVELOPMENT_SETUP.md
  - Deprecado: docs/DEVELOPMENT_SETUP.md

- PROJECT_RULES.md
  - Canónico: .github/PROJECT_RULES.md
  - Deprecado: docs/PROJECT_RULES.md (enlace al canónico)

- TROUBLESHOOTING.md
  - Canónico: docs/operations/TROUBLESHOOTING.md
  - Deprecado: docs/TROUBLESHOOTING.md

- TECHNICAL_DOCUMENTATION.md
  - Canónico: docs/TECHNICAL_DOCUMENTATION.md
  - Deprecado: TECHNICAL_DOCUMENTATION.md (raíz)

- microservices-architecture.md
  - Canónico: docs/architecture/microservices-architecture.md
  - Complementario: mindmaps/microservices-architecture.md (mantener como visual)

- security.md
  - Canónico: docs/development/SECURITY.md
  - Complementarios: frontend/security.md, mindmaps/security.md (añadir nota y enlace)

---

## 4) Checklist por fases

Fase A — Marcado y enlaces (no destructivo)

- [ ] Agregar banner “DEPRECATED — see canonical” a duplicados
- [ ] Enlazar bidireccionalmente duplicado ↔ canónico
- [ ] Añadir sección “Canónico” en docs/README o en DOCUMENTATION_INDEX.md

Fase B — Normalización

- [ ] Unificar títulos H1 y estilos (guía de estilo)
- [ ] Añadir TOC (tabla de contenidos) donde falte
- [ ] Estandarizar idioma (ES para educación, EN para términos técnicos)

Fase C — Estructura

- [ ] Crear docs/README con mapa de categorías (si no existe)
- [ ] Asegurar subcarpetas: architecture/, development/, operations/, deployment/, business/,
      product-categories/, user/
- [ ] Mover (en PR aparte) los duplicados si se aprueba, dejando placeholders

Fase D — Automatización

- [ ] Script de CI para detectar nuevos duplicados por nombre
- [ ] Linter de enlaces internos (markdown-link-check)
- [ ] Publicación opcional en GitHub Pages (mkdocs o Docusaurus)

---

## 5) Guía de estilo resumida (propuesta)

- Estructura:
  - H1 único (título claro)
  - Índice (TOC) si el documento > 2 pantallas
  - Secciones: Contexto, Pasos, Ejemplos, Referencias
- Formato:
  - Markdown estándar, tablas cuando aporten claridad
  - Bloques de código con lenguaje (`bash, `js)
  - Enlaces relativos a archivos del repo
- Idioma:
  - Español claro; términos técnicos en inglés cuando aplique
  - Consistencia dentro de cada documento

---

## 6) Riesgos y mitigaciones

- Ruptura de enlaces: mitigar con placeholders en rutas antiguas mientras se actualiza.
- Confusión por cambios: anunciar en CHANGELOG y en README principal (Docs Updates).
- Tamaño del índice: mantener DOCUMENTATION_INDEX.md como punto de entrada y usar secciones.

---

## 7) Métricas de éxito

- Reducción de duplicados exactos: -80% en 2 sprints
- Tiempo medio para encontrar un documento: < 30s (encuesta interna)
- Errores de enlace rotos en CI: 0

---

## 8) Siguientes pasos inmediatos

1. Aceptación del mapeo canónico propuesto
2. Agregar banners “DEPRECATED” en duplicados
3. Añadir enlaces cruzados y actualizar índice
4. Preparar PR de normalización de títulos/TOCs

---

Responsables sugeridos:

- Tech Writer / DevEx: coordinación y estilo
- Líder Técnico: validación de canónicos
- DevOps: automatización y CI
