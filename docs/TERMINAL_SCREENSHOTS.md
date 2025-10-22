# Capturas de Pantalla y Documentación Visual

## Introducción

Este documento proporciona pautas sobre cómo capturar y almacenar capturas de pantalla e imágenes de
los resultados del terminal para incluir en la documentación del proyecto. Estas imágenes ayudan a
ilustrar visualmente el funcionamiento del sistema y los resultados de los comandos.

## Directorio de Imágenes

Todas las capturas de pantalla e imágenes relacionadas con la documentación se deben almacenar en el
directorio:

```
/home/laloaggro/Proyectos/flores-victoria/docs/images/
```

## Cómo Capturar Imágenes del Terminal

### Método 1: Usando herramientas del sistema operativo

#### En Ubuntu/GNOME:

1. Presiona `Ctrl + Shift + Print Screen` para capturar un área específica
2. Guarda la imagen en `/home/laloaggro/Proyectos/flores-victoria/docs/images/`
3. Nombra el archivo con un nombre descriptivo, por ejemplo: `terminal_docker_ps.png`

#### En otras distribuciones Linux:

1. Usa la herramienta de captura de pantalla proporcionada por tu entorno de escritorio
2. Guarda la imagen en el directorio mencionado anteriormente
3. Usa nombres de archivo descriptivos

### Método 2: Usando comandos de terminal

#### Para capturar la salida de un comando:

```bash
# Ejecutar el comando y guardar la salida en un archivo de texto
docker ps > /home/laloaggro/Proyectos/flores-victoria/docs/images/docker_containers_output.txt

# Para incluir el comando en la salida:
echo "docker ps" > /home/laloaggro/Proyectos/flores-victoria/docs/images/docker_containers_with_command.txt
docker ps >> /home/laloaggro/Proyectos/flores-victoria/docs/images/docker_containers_with_command.txt
```

## Convenciones de Nombres

Para mantener la organización, seguir estas convenciones de nombres:

1. **Capturas de pantalla**: `categoria_descripcion_fecha.png`
   - Ejemplo: `terminal_docker_status_20250922.png`

2. **Archivos de texto con salidas**: `categoria_descripcion_fecha.txt`
   - Ejemplo: `docker_containers_list_20250922.txt`

3. **Diagramas y gráficos**: `categoria_descripcion_fecha.png` o `.jpg`
   - Ejemplo: `microservices_architecture_20250922.png`

## Formatos de Archivo Recomendados

1. **Capturas de pantalla**: PNG (mejor calidad para texto)
2. **Diagramas**: PNG o JPG
3. **Salidas de terminal**: TXT (para preservar el formato)
4. **Gráficos**: PNG (con transparencia si es necesario)

## Incluir Imágenes en la Documentación

### En documentos Markdown:

```markdown
![Descripción de la imagen](images/nombre_del_archivo.png)
```

### Ejemplo:

```markdown
![Estado de los contenedores Docker](images/terminal_docker_ps_20250922.png)
```

## Ejemplos Prácticos

### Capturar el estado de los contenedores Docker:

```bash
# Guardar la salida en un archivo de texto
docker ps > /home/laloaggro/Proyectos/flores-victoria/docs/images/docker_containers_status_$(date +%Y%m%d).txt

# O crear una captura de pantalla manualmente y guardarla como:
# /home/laloaggro/Proyectos/flores-victoria/docs/images/terminal_docker_ps_20250922.png
```

### Capturar información del sistema:

```bash
# Guardar información del sistema
uname -a > /home/laloaggro/Proyectos/flores-victoria/docs/images/system_info_$(date +%Y%m%d).txt
```

### Capturar información de red:

```bash
# Guardar información de los puertos en uso
netstat -tulpn > /home/laloaggro/Proyectos/flores-victoria/docs/images/network_ports_$(date +%Y%m%d).txt
```

## Buenas Prácticas

1. **Mantener la consistencia**: Usa siempre el mismo directorio para todas las imágenes
2. **Nombres descriptivos**: Usa nombres que claramente indiquen el contenido de la imagen
3. **Fechas en nombres de archivo**: Incluye la fecha para mantener un historial
4. **Formato adecuado**: Usa el formato de archivo apropiado para cada tipo de imagen
5. **Tamaño de archivo**: Optimiza las imágenes para reducir el tamaño del repositorio
6. **Información contextual**: Incluye el comando que generó la salida en los archivos de texto

## Ejemplo de Documentación con Imágenes

### Antes de incluir una imagen:

```
## Estado de los Contenedores

El sistema está funcionando correctamente con todos los contenedores en ejecución.
```

### Después de incluir una imagen:

```
## Estado de los Contenedores

El sistema está funcionando correctamente con todos los contenedores en ejecución.

![Estado de los contenedores Docker](images/terminal_docker_ps_20250922.png)

También puedes ver la salida del comando en formato de texto: [docker_containers_status_20250922.txt](images/docker_containers_status_20250922.txt)
```

## Automatización de Capturas

Puedes crear scripts para automatizar la captura de información importante:

```bash
#!/bin/bash
# script para capturar información del sistema
DATE=$(date +%Y%m%d)

# Capturar estado de contenedores
docker ps > /home/laloaggro/Proyectos/flores-victoria/docs/images/docker_status_$DATE.txt

# Capturar uso de recursos
top -bn1 | head -20 > /home/laloaggro/Proyectos/flores-victoria/docs/images/system_resources_$DATE.txt

# Capturar información de red
netstat -tulpn > /home/laloaggro/Proyectos/flores-victoria/docs/images/network_status_$DATE.txt

echo "Capturas de información del sistema completadas"
```

## Consideraciones de Seguridad

1. **Evitar información sensible**: No incluir contraseñas, tokens o información sensible en las
   capturas
2. **Revisar contenido**: Siempre revisar el contenido antes de guardar las imágenes
3. **Archivos temporales**: Eliminar archivos temporales después de usarlos

## Mantenimiento

1. **Revisión periódica**: Revisar las imágenes periódicamente para asegurar que sigan siendo
   relevantes
2. **Actualización**: Actualizar las imágenes cuando el sistema cambie significativamente
3. **Limpieza**: Eliminar imágenes antiguas que ya no sean relevantes

Este sistema de documentación visual ayuda a que otros desarrolladores comprendan mejor el estado y
funcionamiento del sistema a través de ejemplos visuales concretos.
