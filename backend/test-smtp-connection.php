#!/usr/bin/env php
<?php

require_once 'vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

// Cargar variables de entorno
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

echo "Probando conexión SMTP con credenciales reales...\n\n";

$mail = new PHPMailer(true);

try {
    // Configuración del servidor
    $mail->isSMTP();
    $mail->Host       = $_ENV['SMTP_HOST'];
    $mail->SMTPAuth   = true;
    $mail->Username   = $_ENV['SMTP_USERNAME'];
    $mail->Password   = $_ENV['SMTP_PASSWORD'];
    $mail->SMTPSecure = $_ENV['SMTP_ENCRYPTION'];
    $mail->Port       = $_ENV['SMTP_PORT'];
    
    // Habilitar depuración SMTP detallada
    $mail->SMTPDebug = SMTP::DEBUG_CONNECTION;
    
    echo "Conectando a " . $_ENV['SMTP_HOST'] . ":" . $_ENV['SMTP_PORT'] . "...\n";
    
    // Intentar conectar
    $mail->smtpConnect();
    
    echo "✅ Conexión SMTP exitosa\n";
    
    // Probar autenticación
    echo "Autenticando con usuario: " . $_ENV['SMTP_USERNAME'] . "\n";
    echo "✅ Autenticación exitosa\n";
    
} catch (Exception $e) {
    echo "❌ Error al conectar con el servidor SMTP: " . $e->getMessage() . "\n";
    exit(1);
}

echo "\n✅ Todas las pruebas SMTP completadas exitosamente.\n";
echo "El sistema de correo está listo para enviar mensajes.\n";
?>