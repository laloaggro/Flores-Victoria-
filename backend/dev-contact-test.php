<?php
// Establecer encabezados para permitir solicitudes CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

// Simular una solicitud POST
$_SERVER['REQUEST_METHOD'] = 'POST';

// Simular datos de entrada
$inputData = [
    'name' => 'Usuario de Prueba',
    'email' => 'test@ejemplo.com',
    'phone' => '123456789',
    'message' => 'Este es un mensaje de prueba para verificar la funcionalidad de contacto.'
];

// Validar los datos (simplificado para prueba)
if (!isset($inputData['name']) || !isset($inputData['email']) || !isset($inputData['message'])) {
    http_response_code(400);
    echo json_encode(['message' => 'Faltan campos requeridos']);
    exit;
}

$name = htmlspecialchars(trim($inputData['name']));
$email = htmlspecialchars(trim($inputData['email']));
$phone = isset($inputData['phone']) ? htmlspecialchars(trim($inputData['phone'])) : '';
$message = htmlspecialchars(trim($inputData['message']));

// Validar formato de correo electrónico
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['message' => 'Formato de correo electrónico inválido']);
    exit;
}

// Configurar los detalles del correo
$to = "arreglosvictoriafloreria@gmail.com";
$subject = "Nuevo mensaje de contacto de la web - " . $name;

// Crear el contenido del correo en HTML
$mailBody = "
<html>
<head>
    <title>Nuevo mensaje de contacto</title>
</head>
<body>
    <h2>Nuevo mensaje de contacto desde la web</h2>
    <p><strong>Nombre:</strong> {$name}</p>
    <p><strong>Email:</strong> {$email}</p>
    <p><strong>Teléfono:</strong> {$phone}</p>
    <p><strong>Mensaje:</strong></p>
    <p>" . nl2br($message) . "</p>
    <hr>
    <p><small>Este mensaje fue enviado desde el formulario de contacto de la web de Arreglos Victoria Florería</small></p>
</body>
</html>
";

// Configurar encabezados
$headers = "MIME-Version: 1.0" . "\r\n";
$headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
$headers .= "From: " . $email . "\r\n";
$headers .= "Reply-To: " . $email . "\r\n";

// En lugar de enviar realmente el correo, solo mostrar que se enviaría
echo json_encode([
    'message' => '¡Gracias por tu mensaje! En un entorno de producción, esto se enviaría por correo electrónico.',
    'status' => 'success',
    'debug_info' => [
        'to' => $to,
        'subject' => $subject,
        'body' => $mailBody,
        'headers' => $headers
    ]
]);
?>