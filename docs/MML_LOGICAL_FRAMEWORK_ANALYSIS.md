# Análisis del Proyecto Flores Victoria utilizando la Metodología de Marco Lógico (MML)

## Resumen Ejecutivo

Este documento presenta un análisis completo del proyecto Flores Victoria utilizando la Metodología de Marco Lógico (MML). Esta metodología permite conceptualizar, planificar, ejecutar y controlar el proyecto con un enfoque basado en objetivos, comunicación entre involucrados y orientación hacia beneficiarios.

## 1. Identificación de Involucrados

### Involucrados Directos
- **Equipo de Desarrollo**: Responsable de la implementación técnica del proyecto
- **Administradores del Sistema**: Encargados del mantenimiento y operación
- **Usuarios Finales**: Clientes de la florería que utilizarán la plataforma
- **Administradores de Contenido**: Personal encargado de gestionar productos y pedidos

### Involucrados Indirectos
- **Proveedores de Flores**: Entidades que suministran productos
- **Socios de Entrega**: Empresas de logística y entrega
- **Inversores**: Stakeholders financieros del proyecto
- **Competidores**: Otras florerías y plataformas e-commerce

## 2. Árbol de Problemas

### Problemas Centrales
- Falta de presencia digital competitiva para la florería
- Procesos manuales de gestión de pedidos ineficientes
- Dificultad para rastrear inventario y preferencias de clientes

### Causas
- Ausencia de plataforma e-commerce moderna
- Falta de integración entre sistemas de gestión
- Procesos de negocio no automatizados

### Efectos
- Pérdida de oportunidades de venta
- Menor satisfacción del cliente
- Ineficiencia operativa

## 3. Árbol de Objetivos

### Objetivo Principal
Desarrollar una plataforma de comercio electrónico completa y moderna para Flores Victoria que mejore la experiencia del cliente y optimice las operaciones internas.

### Objetivos Específicos
- Implementar una interfaz de usuario intuitiva y atractiva
- Automatizar procesos de gestión de pedidos e inventario
- Proporcionar herramientas de análisis para la toma de decisiones
- Establecer canales de comunicación efectivos con los clientes

### Medios para Alcanzar los Objetivos
- Desarrollo de microservicios especializados
- Implementación de bases de datos adecuadas
- Integración de sistemas de monitoreo y análisis
- Creación de interfaces de administración eficientes

## 4. Análisis de Alternativas

### Alternativa 1: Desarrollo desde cero (Seleccionada)
**Ventajas:**
- Solución completamente personalizada
- Control total sobre la arquitectura y tecnologías
- Escalabilidad según necesidades específicas

**Desventajas:**
- Mayor tiempo de desarrollo
- Requiere equipo técnico especializado
- Costos iniciales más altos

### Alternativa 2: Uso de plataforma SaaS existente
**Ventajas:**
- Implementación rápida
- Costos iniciales más bajos
- Soporte técnico incluido

**Desventajas:**
- Limitaciones en personalización
- Dependencia del proveedor
- Posibles restricciones de escalabilidad

### Alternativa 3: Adaptación de solución open-source
**Ventajas:**
- Balance entre personalización y tiempo de implementación
- Comunidad de soporte
- Flexibilidad en funcionalidades

**Desventajas:**
- Requiere conocimientos técnicos para adaptar
- Posibles problemas de compatibilidad
- Mantenimiento a largo plazo

## 5. Estructura Analítica del Proyecto (EAP)

### Nivel 1: Proyecto Flores Victoria
### Nivel 2: Componentes Principales
1. **Infraestructura Técnica**
   - Configuración de servidores
   - Implementación de contenedores Docker
   - Configuración de bases de datos

2. **Frontend**
   - Interfaz de usuario para clientes
   - Panel de administración
   - Optimización para dispositivos móviles

3. **Backend (Microservicios)**
   - Servicio de Autenticación
   - Servicio de Productos
   - Servicio de Usuarios
   - Servicio de Pedidos
   - Servicio de Carrito
   - Servicio de Lista de Deseos
   - Servicio de Reseñas
   - Servicio de Contacto

4. **Integraciones**
   - Sistema de pagos
   - API de envío
   - Sistemas de mensajería

5. **Monitoreo y Seguridad**
   - Implementación de trazado distribuido
   - Configuración de métricas y alertas
   - Medidas de seguridad y protección de datos

### Nivel 3: Actividades (Ejemplo para el Servicio de Productos)
1. Diseño de la API
2. Implementación de funcionalidades CRUD
3. Integración con base de datos MongoDB
4. Pruebas unitarias
5. Documentación de la API
6. Despliegue en contenedor

## 6. Resumen Narrativo del Proyecto

El proyecto Flores Victoria consiste en el desarrollo de una plataforma de comercio electrónico completa para una florería, utilizando una arquitectura moderna basada en microservicios. La plataforma permitirá a los clientes navegar por un catálogo de productos, realizar pedidos, gestionar sus preferencias y comunicarse con el negocio.

La solución se basa en tecnologías modernas como Node.js, Docker, MongoDB, PostgreSQL y Redis, organizadas en microservicios independientes que se comunican a través de una API Gateway. Esta arquitectura permite una mayor escalabilidad, mantenibilidad y resiliencia del sistema.

El proyecto incluye funcionalidades clave como gestión de usuarios, catálogo de productos, procesamiento de pedidos, carrito de compras, reseñas de productos, sistema de lista de deseos y formulario de contacto. Además, se implementan sistemas de monitoreo, trazado distribuido y métricas para garantizar la observabilidad del sistema.

## 7. Indicadores Objetivamente Verificables (IOV)

| Componente | Indicador | Meta | Medio de Verificación |
|------------|-----------|------|----------------------|
| Plataforma | Tiempo de carga de página < 3 segundos | 100% del tiempo | Métricas de Google Analytics |
| Pedidos | Procesamiento de pedidos exitoso | >99.5% de pedidos | Logs del sistema |
| Disponibilidad | Tiempo activo del sistema | 99.9% mensual | Monitoreo de uptime |
| Usuarios | Tasa de retención de usuarios | 70% mensual | Análisis de usuarios activos |
| Rendimiento | Tiempo de respuesta API < 200ms | 95% de solicitudes | Métricas de Prometheus |
| Seguridad | Incidentes de seguridad | 0 incidentes | Reportes de seguridad |

## 8. Medios de Verificación

- **Métricas técnicas**: Prometheus, Grafana, Jaeger
- **Logs del sistema**: Sistema centralizado de logging
- **Monitoreo de usuarios**: Google Analytics, Hotjar
- **Pruebas automatizadas**: Suites de pruebas unitarias y de integración
- **Feedback de usuarios**: Encuestas y análisis de comportamiento
- **Reportes de desempeño**: Dashboards de KPIs

## 9. Supuestos

- Disponibilidad continua del equipo de desarrollo
- Acceso a recursos tecnológicos necesarios
- Cooperación de los usuarios para pruebas y retroalimentación
- Estabilidad en los requisitos del proyecto
- Cumplimiento de normativas de protección de datos
- Disponibilidad de proveedores de servicios externos
- Estabilidad del entorno tecnológico

## 10. Monitoreo y Evaluación del Proyecto

### Indicadores de Proceso
- Porcentaje de tareas completadas según cronograma
- Calidad del código (cobertura de pruebas, deuda técnica)
- Número de incidencias reportadas y resueltas

### Indicadores de Resultado
- Nivel de satisfacción del usuario
- Volumen de transacciones procesadas
- Tiempo medio de resolución de problemas
- Eficiencia en el uso de recursos

### Frecuencia de Monitoreo
- Diaria: Métricas técnicas y de sistema
- Semanal: Progreso del desarrollo y pruebas
- Mensual: Indicadores de negocio y satisfacción del usuario
- Trimestral: Evaluación completa del proyecto

### Responsables del Monitoreo
- **Equipo de Desarrollo**: Métricas técnicas y progreso
- **Product Owner**: Indicadores de negocio
- **Usuarios piloto**: Satisfacción y usabilidad
- **Stakeholders**: Informes ejecutivos

## Conclusión

La aplicación de la Metodología de Marco Lógico al proyecto Flores Victoria proporciona una estructura clara y sistemática para su planificación, ejecución y evaluación. Esta metodología permite identificar claramente los objetivos, involucrados, indicadores de éxito y riesgos potenciales, facilitando la gestión efectiva del proyecto y aumentando las probabilidades de éxito en su implementación.