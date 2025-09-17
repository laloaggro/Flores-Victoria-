<?php
// Este archivo ya no se usa, el sistema vuelve a usar Node.js para la autenticación
http_response_code(404);
header('Content-Type: application/json');
echo json_encode(['error' => 'Este endpoint ya no está disponible']);
?>