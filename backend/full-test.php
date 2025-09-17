<?php
// Simular una solicitud POST
$_SERVER['REQUEST_METHOD'] = 'POST';

// Simular datos de entrada
$inputData = [
    'name' => 'Usuario de Prueba',
    'email' => 'test@ejemplo.com',
    'phone' => '123456789',
    'message' => 'Este es un mensaje de prueba para verificar la funcionalidad de contacto.'
];

// Convertir a JSON
$inputJSON = json_encode($inputData);

// Simular file_get_contents('php://input')
file_put_contents('/tmp/test-input.json', $inputJSON);

// Modificar el script principal para usar el archivo temporal
$content = file_get_contents('contact-enhanced.php');
$content = str_replace("file_get_contents('php://input')", "file_get_contents('/tmp/test-input.json')", $content);
file_put_contents('temp-contact.php', $content);

// Ejecutar el script modificado
include 'temp-contact.php';

// Limpiar archivos temporales
unlink('/tmp/test-input.json');
unlink('temp-contact.php');
?>