# Valkey - Open Source Redis Fork
# 100% compatible con Redis, mejor rendimiento

FROM valkey/valkey:8-alpine

LABEL maintainer="Flores Victoria Team"
LABEL description="Valkey cache server for Flores Victoria"
LABEL version="8.0"

# Variables de entorno por defecto
ENV VALKEY_MAXMEMORY=256mb
ENV VALKEY_MAXMEMORY_POLICY=allkeys-lru
ENV PORT=6379

# Puerto por defecto (Railway lo sobreescribe con $PORT)
EXPOSE 6379

# Healthcheck - usa el puerto configurado
HEALTHCHECK --interval=10s --timeout=5s --start-period=5s --retries=3 \
  CMD valkey-cli -p ${PORT:-6379} ping | grep -q PONG || exit 1

# Usar shell form para que las variables se expandan correctamente
CMD sh -c "valkey-server --port ${PORT:-6379} --appendonly yes --protected-mode no --maxmemory ${VALKEY_MAXMEMORY:-256mb} --maxmemory-policy ${VALKEY_MAXMEMORY_POLICY:-allkeys-lru} --tcp-keepalive 300 --timeout 0"
