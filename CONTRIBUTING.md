# Contributing to Flores Victoria

¡Gracias por considerar contribuir al proyecto Flores Victoria! Este documento contiene pautas que ayudarán a mantener la calidad del proyecto y facilitar la colaboración.

## Código de Conducta

Al participar en este proyecto, se espera que sigas nuestro [Código de Conducta](CODE_OF_CONDUCT.md).

## ¿Cómo puedo contribuir?

### Reportar errores

- Asegúrate de que el error no haya sido reportado previamente buscando en las issues del proyecto.
- Si no encuentras una issue abierta que aborde el problema, abre una nueva.
- Incluye un título y una descripción clara del problema.
- Proporciona pasos para reproducir el problema.
- Incluye la versión del software que estás utilizando.

### Sugerir mejoras

- Abre una nueva issue con una descripción detallada de la mejora.
- Explica por qué sería útil esta mejora.
- Si es posible, proporciona ejemplos de cómo se usaría.

### Contribuir con código

1. Haz un fork del repositorio
2. Crea una nueva rama (`git checkout -b feature/nueva-funcionalidad`)
3. Realiza tus cambios
4. Asegúrate de que todas las pruebas pasan
5. Haz commit de tus cambios (`git commit -am 'Añadir nueva funcionalidad'`)
6. Haz push a la rama (`git push origin feature/nueva-funcionalidad`)
7. Crea un nuevo Pull Request

## Estilo de código

### JavaScript/Node.js

- Sigue el estilo de código definido en el archivo `.eslintrc`
- Usa 2 espacios para la indentación
- Usa comillas simples para strings
- Nombra las variables y funciones en camelCase
- Escribe funciones puras cuando sea posible
- Comenta el código cuando sea necesario

### Commits

- Usa mensajes de commit en español
- Sigue el formato: "Verbo en infinitivo: descripción breve"
- Ejemplos:
  - "Añadir: nueva funcionalidad de autenticación"
  - "Corregir: error en el cálculo de precios"
  - "Actualizar: documentación del API"

## Pruebas

- Asegúrate de que todas las pruebas existentes pasan antes de enviar tu contribución
- Añade nuevas pruebas para cualquier funcionalidad nueva
- Mantén una cobertura de código alta

## Documentación

- Actualiza la documentación cuando cambies funcionalidades
- Añade comentarios al código cuando sea necesario
- Mantén el README.md actualizado

## Estructura del proyecto

```
flores-victoria/
├── development/           # Código fuente para entorno de desarrollo
│   ├── microservices/     # Microservicios individuales
│   └── docker-compose.yml # Configuración de Docker Compose para desarrollo
├── production/            # Configuración para entorno de producción
│   └── kubernetes/        # Manifiestos y configuración de Kubernetes
├── frontend/              # Aplicación frontend
├── backend/               # Backend monolítico (legacy)
├── docs/                  # Documentación del proyecto
├── performance-tests/     # Pruebas de carga y rendimiento
└── admin-panel/           # Panel de administración
```

## Proceso de revisión

1. Todos los PRs deben ser revisados por al menos un mantenedor
2. Las pruebas deben pasar en el CI
3. El código debe seguir las guías de estilo
4. La documentación debe estar actualizada

## Preguntas

Si tienes alguna pregunta, no dudes en abrir una issue o contactar con los mantenedores del proyecto.