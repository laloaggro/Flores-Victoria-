#!/bin/bash

# Script para configurar secretos de Docker de forma segura
# Uso: bash scripts/setup-secrets.sh

set -e

SECRETS_DIR="./secrets"
BOLD="\033[1m"
GREEN="\033[0;32m"
YELLOW="\033[1;33m"
RED="\033[0;31m"
NC="\033[0m" # No Color

echo -e "${BOLD}🔐 Configuración de Secretos - Flores Victoria${NC}\n"

# Crear directorio de secretos si no existe
if [ ! -d "$SECRETS_DIR" ]; then
    mkdir -p "$SECRETS_DIR"
    echo -e "${GREEN}✓${NC} Directorio de secretos creado: $SECRETS_DIR"
fi

# Asegurar permisos restrictivos
chmod 700 "$SECRETS_DIR"

# Función para generar secreto aleatorio
generate_secret() {
    openssl rand -base64 32 | tr -d "=+/" | cut -c1-32
}

# Función para solicitar o generar secreto
setup_secret() {
    local secret_name=$1
    local secret_file="$SECRETS_DIR/${secret_name}.txt"
    local prompt_message=$2
    local auto_generate=${3:-true}
    
    if [ -f "$secret_file" ]; then
        echo -e "${YELLOW}⚠${NC}  $secret_file ya existe. ¿Sobrescribir? (y/N): "
        read -r response
        if [[ ! "$response" =~ ^[Yy]$ ]]; then
            echo -e "${GREEN}✓${NC} Conservando secreto existente: $secret_name"
            return
        fi
    fi
    
    if [ "$auto_generate" = true ]; then
        echo -e "${YELLOW}?${NC} $prompt_message"
        echo -e "  Presiona Enter para generar automáticamente o ingresa un valor:"
        read -r user_input
        
        if [ -z "$user_input" ]; then
            user_input=$(generate_secret)
            echo -e "${GREEN}✓${NC} Secreto generado automáticamente: $secret_name"
        else
            echo -e "${GREEN}✓${NC} Secreto personalizado configurado: $secret_name"
        fi
    else
        echo -e "${YELLOW}?${NC} $prompt_message"
        read -r user_input
        
        if [ -z "$user_input" ]; then
            echo -e "${RED}✗${NC} Secreto requerido: $secret_name"
            exit 1
        fi
        echo -e "${GREEN}✓${NC} Secreto configurado: $secret_name"
    fi
    
    echo -n "$user_input" > "$secret_file"
    chmod 600 "$secret_file"
}

# Configurar secretos
echo -e "\n${BOLD}Base de Datos${NC}"
setup_secret "postgres_password" "Contraseña para PostgreSQL"
setup_secret "mongo_password" "Contraseña para MongoDB"

echo -e "\n${BOLD}Autenticación${NC}"
setup_secret "jwt_secret" "Secret para tokens JWT (mínimo 32 caracteres)"

echo -e "\n${BOLD}Email / SMTP${NC}"
setup_secret "email_password" "Contraseña de aplicación para Gmail/SMTP" false

echo -e "\n${BOLD}Pasarelas de Pago${NC}"
setup_secret "stripe_secret" "Stripe Secret Key (sk_live_... o sk_test_...)" false
setup_secret "paypal_secret" "PayPal Client Secret" false
setup_secret "transbank_secret" "Transbank Secret Key" false

# Crear .gitignore en secrets/
cat > "$SECRETS_DIR/.gitignore" << 'EOF'
# Ignorar todos los archivos de secretos
*.txt
!.gitignore
!README.md
EOF

# Crear README en secrets/
cat > "$SECRETS_DIR/README.md" << 'EOF'
# Directorio de Secretos

Este directorio contiene archivos de secretos para Docker Compose secrets.

## Archivos

- `postgres_password.txt` - Contraseña de PostgreSQL
- `mongo_password.txt` - Contraseña de MongoDB
- `jwt_secret.txt` - Secret para JWT (32+ caracteres)
- `email_password.txt` - Contraseña de aplicación SMTP
- `stripe_secret.txt` - Stripe Secret Key
- `paypal_secret.txt` - PayPal Client Secret
- `transbank_secret.txt` - Transbank Secret Key

## Uso

Estos secretos son montados en los contenedores a través de Docker secrets.

Ver `docker-compose.secrets.yml` para la configuración.

## Seguridad

⚠️ **NUNCA** commitear estos archivos a Git.
⚠️ Usar variables de entorno en CI/CD (GitHub Secrets).
⚠️ Rotar secretos regularmente.
EOF

echo -e "\n${BOLD}${GREEN}✓ Configuración de secretos completada${NC}"
echo -e "\n${YELLOW}📝 Notas importantes:${NC}"
echo -e "  • Secretos guardados en: $SECRETS_DIR/"
echo -e "  • Los archivos están ignorados por Git (.gitignore configurado)"
echo -e "  • Para usar los secretos: ${BOLD}docker-compose -f docker-compose.yml -f docker-compose.secrets.yml up${NC}"
echo -e "  • En CI/CD, usar GitHub Secrets en lugar de archivos"
echo -e "\n${YELLOW}🔐 Secretos pendientes de configurar:${NC}"

# Verificar qué secretos necesitan valores reales (no generados)
for secret in email_password stripe_secret paypal_secret transbank_secret; do
    secret_file="$SECRETS_DIR/${secret}.txt"
    if [ -f "$secret_file" ]; then
        content=$(cat "$secret_file")
        if [ ${#content} -lt 10 ]; then
            echo -e "  ${RED}✗${NC} $secret (valor muy corto o vacío)"
        fi
    fi
done

echo ""
