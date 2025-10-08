# Sistema de Logging Centralizado

Este directorio contiene la configuración y los archivos necesarios para el sistema de logging centralizado del proyecto Flores Victoria.

## Componentes

1. **ELK Stack** (Elasticsearch, Logstash, Kibana)
2. **Filebeat** - Agente de envío de logs
3. **Configuraciones personalizadas**

## Arquitectura

```
Microservicios -> Filebeat -> Logstash -> Elasticsearch -> Kibana
```

## Configuración

Para configurar el sistema de logging, sigue estos pasos:

1. Asegúrate de que todos los microservicios escriben logs en formato JSON
2. Configura Filebeat en cada nodo para recopilar los logs
3. Configura Logstash para procesar y enriquecer los logs
4. Configura Elasticsearch para almacenar los logs
5. Configura Kibana para visualizar y analizar los logs

## Formato de Logs

Los logs deben seguir el siguiente formato JSON:

```json
{
  "timestamp": "2023-01-01T00:00:00.000Z",
  "level": "info",
  "service": "nombre_del_servicio",
  "message": "Mensaje descriptivo",
  "metadata": {
    "requestId": "uuid",
    "userId": "id_de_usuario",
    "additionalData": {}
  }
}
```

## Recomendaciones

1. **Rotación de logs**: Configura la rotación de logs para evitar el llenado del disco
2. **Retención**: Establece políticas de retención según los requisitos de negocio
3. **Seguridad**: Asegura el acceso a Kibana y Elasticsearch con autenticación
4. **Monitoreo**: Configura alertas para errores críticos y patrones inusuales