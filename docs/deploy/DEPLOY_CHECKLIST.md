# ✅ Checklist de Deploy a Oracle Cloud

## Pre-Deploy (Local)

### 1. Verificar Build
- [ ] Build de producción sin errores: `npm run build`
- [ ] Verificar tamaño de assets en `dist/`:
  - [ ] CSS products: ~185KB (31KB gzip)
  - [ ] JS chunks: <10KB cada uno
  - [ ] Imágenes WebP presentes

### 2. Verificar Configuración
- [ ] `frontend/nginx-production.conf` actualizado
- [ ] Scripts de deploy ejecutables:
  - [ ] `scripts/deploy/deploy-oracle-cloud.sh` o `scripts/deploy-oracle-cloud.sh`
  - [ ] `scripts/deploy/verify-performance.sh` o `scripts/verify-performance.sh`
- [ ] `.gitignore` no incluye archivos necesarios

### 3. Commit y Push
```bash
git add .
git commit -m "Optimizaciones de performance para producción"
git push origin main
```

## Deploy en Oracle Cloud

### 1. Conectar al Servidor
```bash
ssh ubuntu@<TU_IP_ORACLE>
```

### 2. Primera Vez - Setup Inicial

#### Instalar Dependencias
```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Instalar Nginx
sudo apt install -y nginx

# Instalar Git
sudo apt install -y git

# Verificar versiones
node -v  # v20.x.x
npm -v   # 10.x.x
nginx -v # nginx/1.x.x
```

#### Clonar Repositorio
```bash
cd /var/www
sudo git clone https://github.com/laloaggro/Flores-Victoria-.git flores-victoria
sudo chown -R $USER:$USER /var/www/flores-victoria
cd flores-victoria
```

#### Configurar Nginx
```bash
# Copiar configuración
sudo cp frontend/nginx-production.conf /etc/nginx/sites-available/flores-victoria

# Crear symlink
sudo ln -sf /etc/nginx/sites-available/flores-victoria /etc/nginx/sites-enabled/

# Eliminar default
sudo rm -f /etc/nginx/sites-enabled/default

# Verificar configuración
sudo nginx -t

# Si OK, recargar
sudo systemctl reload nginx
```

#### Configurar Firewall
```bash
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw enable
```

### 3. Deploy (Primera vez y actualizaciones)

```bash
cd /var/www/flores-victoria

# Opción 1: Script principal en raíz
./scripts/deploy-oracle-cloud.sh

# Opción 2: Script en carpeta deploy
./scripts/deploy/deploy-oracle.sh
```

El script automáticamente:
1. ✅ Pull de cambios
2. ✅ Instala dependencias
3. ✅ Build de producción
4. ✅ Backup anterior
5. ✅ Deploy a /var/www/html
6. ✅ Reload nginx
7. ✅ Lighthouse audit

### 4. Configurar SSL (Después del primer deploy)

```bash
# Instalar Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtener certificado (reemplazar con tu dominio)
sudo certbot --nginx -d arreglosvictoria.com -d www.arreglosvictoria.com

# Verificar renovación automática
sudo certbot renew --dry-run
```

## Post-Deploy

### 1. Verificar Performance

```bash
# Desde el servidor
./scripts/verify-performance.sh https://arreglosvictoria.com
```

### 2. Checklist de Verificación Manual

#### HTTP/2
```bash
curl --http2 -I https://arreglosvictoria.com
# Debe mostrar: HTTP/2 200
```

#### Gzip
```bash
curl -H "Accept-Encoding: gzip" -I https://arreglosvictoria.com/assets/css/products-0e22c5be.css
# Debe mostrar: content-encoding: gzip
```

#### Cache Headers
```bash
curl -I https://arreglosvictoria.com/assets/css/products-0e22c5be.css
# Debe mostrar: cache-control: public, max-age=31536000, immutable
```

#### SSL
```bash
openssl s_client -servername arreglosvictoria.com -connect arreglosvictoria.com:443 < /dev/null 2>/dev/null | grep "Protocol"
# Debe mostrar: Protocol  : TLSv1.3
```

### 3. Lighthouse Audit (Desde local)

```bash
npx lighthouse https://arreglosvictoria.com/pages/products.html \
  --only-categories=performance \
  --view
```

**Métricas esperadas**:
- ✅ Performance: 60-75/100
- ✅ FCP: 1.5-2.5s
- ✅ LCP: 2.5-4.0s
- ✅ TBT: <200ms
- ✅ CLS: <0.1

### 4. PageSpeed Insights

Visitar: https://pagespeed.web.dev/analysis?url=https://arreglosvictoria.com/pages/products.html

## Troubleshooting

### Score <60/100

#### 1. Verificar Build
```bash
cd /var/www/flores-victoria/frontend
ls -lh dist/assets/css/products-*.css
# Debe ser ~185KB
```

#### 2. Verificar Nginx
```bash
sudo nginx -t
# Debe mostrar: syntax is ok
```

#### 3. Revisar Logs
```bash
sudo tail -f /var/log/nginx/error.log
```

### LCP >4s

#### 1. Mover imágenes a Oracle Object Storage
```bash
# Crear bucket
oci os bucket create --name flores-victoria-images --public-access-type ObjectRead

# Subir imágenes
cd /var/www/html/assets/images
for img in *.webp; do
  oci os object put --bucket-name flores-victoria-images --file "$img" --name "images/$img"
done
```

#### 2. Actualizar products.json con URLs de Object Storage

### TBT >200ms

Verificar que code-splitting funciona:
```bash
ls -lh /var/www/html/assets/js/
# Debe mostrar múltiples archivos <10KB
```

### Nginx no inicia

```bash
# Ver errores
sudo systemctl status nginx
sudo journalctl -xe -u nginx

# Verificar puertos
sudo netstat -tlnp | grep :80
sudo netstat -tlnp | grep :443
```

## Mantenimiento

### Deploy de Actualizaciones

```bash
ssh ubuntu@<TU_IP_ORACLE>
cd /var/www/flores-victoria
./scripts/deploy-oracle-cloud.sh
```

### Rollback

```bash
# Ver backups disponibles
ls -lh /var/www/backups/

# Restaurar backup
sudo tar -xzf /var/www/backups/backup_YYYYMMDD_HHMMSS.tar.gz -C /var/www/html
sudo systemctl reload nginx
```

### Actualizar SSL

```bash
# Certbot renueva automáticamente, pero puedes forzar:
sudo certbot renew --force-renewal
```

### Ver Logs

```bash
# Access logs
sudo tail -f /var/log/nginx/access.log

# Error logs
sudo tail -f /var/log/nginx/error.log

# Logs de aplicación
journalctl -u nginx -f
```

## Monitoreo Continuo

### Cron para Lighthouse Diario

```bash
# Crear script
sudo tee /usr/local/bin/daily-lighthouse.sh > /dev/null << 'SCRIPT'
#!/bin/bash
DATE=$(date +%Y%m%d)
npx lighthouse https://arreglosvictoria.com/pages/products.html \
  --only-categories=performance \
  --output=json \
  --output-path=/var/log/lighthouse/audit-$DATE.json \
  --chrome-flags="--headless --no-sandbox" \
  --quiet
SCRIPT

sudo chmod +x /usr/local/bin/daily-lighthouse.sh

# Agregar a crontab (3 AM diario)
echo "0 3 * * * /usr/local/bin/daily-lighthouse.sh" | sudo crontab -
```

## Documentación Adicional

- **Performance**: `ORACLE_CLOUD_PERFORMANCE.md`
- **Deploy completo**: `ORACLE_CLOUD_DEPLOYMENT.md`
- **Resumen**: `RESUMEN_OPTIMIZACIONES.md`

## Contacto y Soporte

Si encuentras problemas, revisar la documentación o logs de error.

---

✨ **¡Listo para producción!**
