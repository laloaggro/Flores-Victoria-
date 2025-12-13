# GitHub Workflows - Flores Victoria

## Workflows Principales (Recomendados)

| Workflow           | Archivo        | Trigger          | Propósito              |
| ------------------ | -------------- | ---------------- | ---------------------- |
| **CI/CD Pipeline** | `ci-cd.yml`    | push/PR a main   | Tests + Build + Deploy |
| **Security Scan**  | `security.yml` | push/PR + weekly | Auditoría de seguridad |
| **Test Matrix**    | `test.yml`     | push/PR          | Tests por servicio     |

## Workflows Secundarios

| Workflow   | Archivo                 | Propósito                |
| ---------- | ----------------------- | ------------------------ |
| Lint       | `ci.yml`                | Linting de código        |
| E2E        | `e2e-playwright.yml`    | Tests end-to-end         |
| Lighthouse | `lighthouse.yml`        | Performance audits       |
| Dependabot | `dependency-review.yml` | Revisión de dependencias |

## Workflows Opcionales/Legacy

Estos workflows pueden deshabilitarse si no se usan:

- `auto-assign.yml` - Auto-asignación de PRs
- `auto-label.yml` - Auto-etiquetado
- `weekly-report.yml` - Reportes semanales
- `markdown-link-check.yml` - Verificación de links
- `mcp-integration-tests.yml` - Tests MCP (si no se usa)
- `kubernetes-deploy.yml` - Deploy K8s (si no se usa)

## Cómo Deshabilitar un Workflow

1. **Desde GitHub UI**: Settings → Actions → [Workflow] → Disable
2. **Renombrar archivo**: Cambiar `.yml` a `.yml.disabled`
3. **Añadir condición**: `if: false` en el job

## Recomendaciones

1. **Para desarrollo activo**: Usar solo `ci-cd.yml`, `test.yml`, `security.yml`
2. **Para producción**: Habilitar todos los workflows de seguridad
3. **Para proyectos pequeños**: Consolidar en un solo `ci-cd.yml`

## Notas

- Los workflows se ejecutan en paralelo cuando es posible
- Usar `workflow_dispatch` para ejecución manual
- Configurar secrets en Settings → Secrets and variables → Actions
