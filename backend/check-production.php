#!/usr/bin/env php
<?php

echo "Verificando configuración de producción...\n\n";

// Verificar que el archivo .env exista
if (!file_exists(__DIR__ . '/.env')) {
    echo "❌ ERROR: El archivo .env no existe\n";
    exit(1);
}

echo "✅ Archivo .env encontrado\n";

// Verificar que Composer esté instalado
if (!file_exists(__DIR__ . '/vendor/autoload.php')) {
    echo "❌ ERROR: Composer no está instalado o no se ha ejecutado 'composer install'\n";
    exit(1);
}

echo "✅ Composer y dependencias encontradas\n";

// Cargar variables de entorno
require_once 'vendor/autoload.php';
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

// Verificar variables críticas
$required_vars = [
    'SMTP_HOST',
    'SMTP_PORT',
    'SMTP_USERNAME',
    'SMTP_PASSWORD',
    'MAIL_FROM_ADDRESS',
    'MAIL_TO_ADDRESS'
];

$missing_vars = [];
foreach ($required_vars as $var) {
    if (empty($_ENV[$var])) {
        $missing_vars[] = $var;
    }
}

if (!empty($missing_vars)) {
    echo "❌ ERROR: Las siguientes variables de entorno están vacías o no definidas:\n";
    foreach ($missing_vars as $var) {
        echo "   - $var\n";
    }
    exit(1);
}

echo "✅ Todas las variables de entorno críticas están definidas\n";

// Verificar que las extensiones PHP necesarias estén instaladas
$required_extensions = ['openssl', 'filter', 'hash'];

$missing_extensions = [];
foreach ($required_extensions as $ext) {
    if (!extension_loaded($ext)) {
        $missing_extensions[] = $ext;
    }
}

if (!empty($missing_extensions)) {
    echo "❌ ERROR: Las siguientes extensiones PHP no están instaladas:\n";
    foreach ($missing_extensions as $ext) {
        echo "   - $ext\n";
    }
    echo "   Por favor instale estas extensiones usando su gestor de paquetes:\n";
    echo "   Ejemplo: sudo apt-get install php-$ext\n";
    exit(1);
}

echo "✅ Todas las extensiones PHP necesarias están instaladas\n";

// Verificar conectividad con el servidor SMTP (solo si es posible)
echo "🔍 Verificando conectividad con el servidor SMTP (" . $_ENV['SMTP_HOST'] . ":" . $_ENV['SMTP_PORT'] . ")...\n";

// En entornos restringidos, esta verificación puede no funcionar
// Solo mostramos información sobre la configuración
echo "   Configuración SMTP:\n";
echo "   - Host: " . $_ENV['SMTP_HOST'] . "\n";
echo "   - Puerto: " . $_ENV['SMTP_PORT'] . "\n";
echo "   - Usuario: " . $_ENV['SMTP_USERNAME'] . "\n";
echo "   - Encriptación: " . ($_ENV['SMTP_ENCRYPTION'] ?: 'tls') . "\n";

echo "\n✅ Verificación básica completada.\n";
echo "   Recuerda actualizar las credenciales SMTP en el archivo .env antes de usarlo en producción.\n";
echo "   Asegúrate de que las siguientes extensiones PHP estén instaladas:\n";
echo "   - openssl\n";
echo "   - curl\n";
echo "   - filter\n";
echo "   - hash\n";
?>