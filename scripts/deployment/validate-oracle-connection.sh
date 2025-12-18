#!/bin/bash
# ============================================
# Validación de Conexión Oracle Cloud
# Flores Victoria - 161.153.219.198
# ============================================

set -e

ORACLE_IP="161.153.219.198"
SSH_KEY="/home/impala/Documentos/flores-victoria-free.pem"

echo "🔍 VALIDACIÓN DE CONEXIÓN ORACLE CLOUD"
echo "=========================================="
echo ""

# 1. Verificar clave privada
echo "✓ 1/5 - Verificando clave privada..."
if [ -f "$SSH_KEY" ]; then
    PERMS=$(stat -c %a "$SSH_KEY")
    if [ "$PERMS" == "600" ]; then
        echo "   ✅ Clave encontrada con permisos correctos (600)"
    else
        echo "   ⚠️  Corrigiendo permisos..."
        chmod 600 "$SSH_KEY"
        echo "   ✅ Permisos corregidos"
    fi
else
    echo "   ❌ Clave privada NO encontrada en: $SSH_KEY"
    exit 1
fi

echo ""

# 2. Test de ping
echo "✓ 2/5 - Verificando conectividad IP..."
if ping -c 2 -W 3 $ORACLE_IP >/dev/null 2>&1; then
    echo "   ✅ IP responde a ping"
else
    echo "   ⚠️  IP no responde a ping (normal si ICMP está bloqueado)"
fi

echo ""

# 3. Test de puerto 22
echo "✓ 3/5 - Verificando puerto SSH (22)..."
if timeout 5 bash -c "echo >/dev/tcp/$ORACLE_IP/22" 2>/dev/null; then
    echo "   ✅ Puerto 22 está ABIERTO"
else
    echo "   ❌ Puerto 22 está CERRADO o filtrado"
    echo ""
    echo "   📋 ACCIÓN REQUERIDA en Oracle Cloud Console:"
    echo "   1. Ve a: Networking → Virtual Cloud Networks → vcn-flores-victoria"
    echo "   2. Click en tu subnet"
    echo "   3. Click en Security List"
    echo "   4. Add Ingress Rule:"
    echo "      - Source CIDR: 0.0.0.0/0"
    echo "      - IP Protocol: TCP"
    echo "      - Destination Port: 22"
    echo ""
    exit 1
fi

echo ""

# 4. Test de autenticación SSH
echo "✓ 4/5 - Probando autenticación SSH..."
if ssh -i "$SSH_KEY" -o ConnectTimeout=10 -o StrictHostKeyChecking=no \
   ubuntu@$ORACLE_IP 'echo "SSH OK"' 2>/dev/null | grep -q "SSH OK"; then
    echo "   ✅ Autenticación SSH EXITOSA"
else
    echo "   ❌ Autenticación SSH falló"
    echo ""
    echo "   📋 POSIBLES CAUSAS:"
    echo "   1. La instancia no está iniciada (estado: Terminated)"
    echo "      → Ve a Oracle Cloud Console y click en 'Start'"
    echo ""
    echo "   2. La clave SSH no está agregada a la instancia"
    echo "      → Agrega esta clave pública en Instance → Edit → SSH keys:"
    echo ""
    cat /home/impala/Documentos/ssh-key-2025-11-25.key.pub
    echo ""
    exit 1
fi

echo ""

# 5. Información del sistema remoto
echo "✓ 5/5 - Información del servidor..."
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no ubuntu@$ORACLE_IP << 'ENDSSH'
echo "   Sistema: $(cat /etc/os-release | grep PRETTY_NAME | cut -d'"' -f2)"
echo "   Kernel: $(uname -r)"
echo "   Memoria: $(free -h | grep Mem | awk '{print $2}')"
echo "   Disco: $(df -h / | tail -1 | awk '{print $2 " total, " $4 " libre"}')"
echo "   Uptime: $(uptime -p)"
ENDSSH

echo ""
echo "=========================================="
echo "✅ TODAS LAS VALIDACIONES EXITOSAS"
echo "=========================================="
echo ""
echo "🚀 Comandos útiles:"
echo "   - Conectar: ssh flores-oracle"
echo "   - O bien: ssh -i $SSH_KEY ubuntu@$ORACLE_IP"
echo "   - Copiar archivos: scp -i $SSH_KEY archivo ubuntu@$ORACLE_IP:/home/ubuntu/"
echo ""
