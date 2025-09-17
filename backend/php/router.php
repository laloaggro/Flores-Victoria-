<?php
require_once 'config.php';

// Leer los datos de la solicitud
$input = file_get_contents('php://input');
$requestData = json_decode($input, true);

// Si no hay datos JSON, intentar obtenerlos de otra manera
if (!$requestData) {
    $requestData = [
        'method' => $_SERVER['REQUEST_METHOD'],
        'url' => $_SERVER['REQUEST_URI'],
        'headers' => getallheaders(),
        'body' => $_POST,
        'query' => $_GET
    ];
}

// Determinar la ruta solicitada
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$pathParts = explode('/', trim($path, '/'));

// Verificar si es una solicitud a la API de usuarios
if (count($pathParts) >= 3 && $pathParts[0] === 'api' && $pathParts[1] === 'users') {
    $endpoint = $pathParts[2];
    
    // Incluir el archivo correspondiente al endpoint
    $scriptPath = __DIR__ . '/' . $endpoint . '.php';
    
    if (file_exists($scriptPath)) {
        // Pasar los datos de la solicitud al script
        $_SERVER['REQUEST_DATA'] = $requestData;
        include $scriptPath;
        exit;
    }
}

// Si no se encuentra el endpoint, devolver error 404
http_response_code(404);
header('Content-Type: application/json');
echo json_encode(['error' => 'Endpoint no encontrado']);
?>