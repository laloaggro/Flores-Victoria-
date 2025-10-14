# Troubleshooting - Flores Victoria

## Índice

1. [Problemas Comunes de Despliegue](#problemas-comunes-de-despliegue)
2. [Errores de Conexión a Bases de Datos](#errores-de-conexión-a-bases-de-datos)
3. [Problemas de Permisos en Kubernetes](#problemas-de-permisos-en-kubernetes)
4. [Errores de Imágenes de Docker](#errores-de-imágenes-de-docker)
5. [Problemas de Configuración](#problemas-de-configuración)
6. [Errores de Red](#errores-de-red)
7. [Problemas de Rendimiento](#problemas-de-rendimiento)

## Problemas Comunes de Despliegue

### Error: ImagePullBackOff
**Problema**: Kubernetes no puede descargar la imagen del contenedor.

**Solución**:
1. Verifica que la imagen exista en el registro especificado
2. Asegúrate de que Kubernetes tenga acceso al registro
3. Si usas un registro privado, verifica las credenciales

```bash
# Verificar estado de los pods
kubectl get pods -n flores-victoria

# Ver detalles del pod con error
kubectl describe pod <nombre-del-pod> -n flores-victoria

# Ver logs del pod
kubectl logs <nombre-del-pod> -n flores-victoria
```

### Error: CrashLoopBackOff
**Problema**: El contenedor se inicia pero se reinicia continuamente.

**Solución**:
1. Revisa los logs del contenedor para identificar el error específico
2. Verifica las variables de entorno
3. Asegúrate de que las dependencias estén disponibles

```bash
# Ver logs del pod
kubectl logs <nombre-del-pod> -n flores-victoria

# Ver logs anteriores (después de un reinicio)
kubectl logs <nombre-del-pod> -n flores-victoria --previous
```

## Errores de Conexión a Bases de Datos

### Error: "Cannot read properties of undefined (reading 'uri')"
**Problema**: El servicio de contacto no puede leer la configuración de MongoDB.

**Solución**:
1. Verifica que las variables de entorno estén correctamente configuradas
2. Asegúrate de que la estructura de configuración sea consistente

```javascript
// En el archivo de configuración, asegúrate de usar:
const config = {
  database: {
    uri: process.env.CONTACT_SERVICE_MONGODB_URI || 'mongodb://mongodb:27017/contact-service?authSource=admin'
  }
};

// En el archivo de conexión a la base de datos, usa:
const client = new MongoClient(config.database.uri, {
  useUnifiedTopology: true
});
```

### Error: Conexión a PostgreSQL rechazada
**Problema**: El servicio de usuarios no puede conectarse a PostgreSQL.

**Solución**:
1. Verifica que el servicio de PostgreSQL esté corriendo
2. Comprueba las credenciales y la cadena de conexión
3. Asegúrate de que el servicio esté expuesto en el puerto correcto

```bash
# Verificar estado del servicio de PostgreSQL
kubectl get pods -n flores-victoria | grep postgres

# Ver logs de PostgreSQL
kubectl logs postgres-0 -n flores-victoria
```

## Problemas de Permisos en Kubernetes

### Error: "listen EACCES: permission denied"
**Problema**: El servicio intenta escuchar en una dirección o puerto al que no tiene acceso.

**Solución**:
1. Modifica el código del servicio para escuchar en todas las interfaces (0.0.0.0) en lugar de una dirección específica
2. Asegúrate de que el puerto esté correctamente expuesto en el manifiesto de Kubernetes

```javascript
// Cambiar de:
app.listen(PORT, '10.99.63.96') // Dirección específica

// A:
app.listen(PORT, '0.0.0.0') // Todas las interfaces
```

### Error: Permisos denegados al acceder a volúmenes
**Problema**: El contenedor no tiene permisos para escribir en volúmenes persistentes.

**Solución**:
1. Verifica los permisos del volumen persistente
2. Asegúrate de que el usuario del contenedor tenga los permisos adecuados
3. Considera usar initContainers para establecer permisos

```yaml
# En el manifiesto de Kubernetes:
spec:
  initContainers:
  - name: fix-permissions
    image: busybox
    command: ["sh", "-c", "chmod -R 777 /app/db"]
    volumeMounts:
    - name: user-db-storage
      mountPath: /app/db
```

## Errores de Imágenes de Docker

### Error: "pull access denied for microservices_xxx"
**Problema**: Kubernetes no puede acceder a las imágenes locales.

**Solución**:
1. Etiqueta las imágenes correctamente para el registro local
2. Carga las imágenes en Minikube

```bash
# Etiquetar imagen para registro local
docker tag microservices_auth-service:latest localhost:5000/microservices_auth-service:latest

# Cargar imagen en Minikube
minikube image load microservices_auth-service:latest

# O subir al registro local
docker push localhost:5000/microservices_auth-service:latest
```

### Error: "ErrImageNeverPull"
**Problema**: La política de imagen está configurada como "Never" pero la imagen no existe localmente.

**Solución**:
1. Asegúrate de que la imagen exista localmente
2. Cambia la política de pull a "IfNotPresent" o "Always"

```yaml
# En el manifiesto de Kubernetes:
spec:
  containers:
  - name: auth-service
    image: localhost:5000/microservices_auth-service:latest
    imagePullPolicy: IfNotPresent
```

## Problemas de Configuración

### Variables de entorno no definidas
**Problema**: El servicio no encuentra las variables de entorno necesarias.

**Solución**:
1. Verifica que las variables estén definidas en los manifiestos de Kubernetes
2. Asegúrate de que los nombres de las variables sean correctos

```yaml
# En el manifiesto de Kubernetes:
spec:
  containers:
  - name: user-service
    env:
    - name: DB_HOST
      value: "postgres"
    - name: DB_USER
      valueFrom:
        secretKeyRef:
          name: postgres-secret
          key: postgres-user
```

### Configuración de puertos incorrecta
**Problema**: Los servicios no pueden comunicarse entre sí debido a configuraciones de puerto incorrectas.

**Solución**:
1. Verifica que los puertos estén correctamente expuestos
2. Asegúrate de que los servicios estén escuchando en los puertos correctos

```yaml
# En el manifiesto de servicio:
spec:
  ports:
  - port: 3001        # Puerto del servicio
    targetPort: 3001  # Puerto del contenedor
```

## Errores de Red

### Servicios no pueden comunicarse
**Problema**: Los microservicios no pueden comunicarse entre sí.

**Solución**:
1. Verifica que los servicios estén corriendo
2. Asegúrate de que las redes de Kubernetes estén configuradas correctamente
3. Comprueba las políticas de red si están habilitadas

```bash
# Verificar servicios
kubectl get services -n flores-victoria

# Probar conectividad entre servicios
kubectl exec -it <pod-name> -n flores-victoria -- curl http://<service-name>:<port>/health
```

### DNS de Kubernetes no resuelve nombres de servicio
**Problema**: Los nombres de servicio no se resuelven correctamente.

**Solución**:
1. Verifica que los servicios estén correctamente definidos
2. Asegúrate de usar el nombre del servicio y el namespace correctos

```bash
# Probar resolución DNS
kubectl exec -it <pod-name> -n flores-victoria -- nslookup <service-name>.flores-victoria.svc.cluster.local
```

## Problemas de Rendimiento

### Pods constantemente reiniciándose
**Problema**: Los pods se reinician frecuentemente debido a problemas de recursos.

**Solución**:
1. Verifica los límites de recursos en los manifiestos
2. Aumenta los recursos asignados si es necesario
3. Verifica si hay memory leaks en la aplicación

```yaml
# En el manifiesto de Kubernetes:
spec:
  containers:
  - name: product-service
    resources:
      requests:
        memory: "128Mi"
        cpu: "250m"
      limits:
        memory: "512Mi"
        cpu: "500m"
```

### Alta latencia en respuestas
**Problema**: Las respuestas de los servicios son más lentas de lo esperado.

**Solución**:
1. Usa Jaeger para identificar cuellos de botella
2. Verifica las conexiones a bases de datos
3. Optimiza consultas y algoritmos

```bash
# Ver métricas de recursos
kubectl top pods -n flores-victoria

# Ver logs de monitoreo
kubectl logs prometheus-xxx -n flores-victoria
```

## Recomendaciones Generales

1. **Siempre verifica los logs**: Los logs son la primera fuente de información para diagnosticar problemas.

2. **Valida la configuración**: Asegúrate de que todas las variables de entorno y configuraciones estén correctamente establecidas.

3. **Prueba la conectividad**: Verifica que los servicios puedan comunicarse entre sí.

4. **Monitorea los recursos**: Observa el uso de CPU y memoria para identificar problemas de rendimiento.

5. **Mantén actualizadas las dependencias**: Asegúrate de usar versiones compatibles de las tecnologías.

6. **Documenta los cambios**: Registra cualquier solución encontrada para futuras referencias.