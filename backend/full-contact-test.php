#!/usr/bin/env php
<?php

// Simular datos de contacto
$contactData = [
    'name' => 'Usuario de Prueba',
    'email' => 'test@ejemplo.com',
    'phone' => '123456789',
    'message' => 'Este es un mensaje de prueba para verificar el sistema de contacto.'
];

// Convertir a JSON
$jsonData = json_encode($contactData);

// Guardar en un archivo temporal
file_put_contents('test-contact-data.json', $jsonData);

echo "Datos de prueba guardados en test-contact-data.json\n";
echo "Ejecutando el script de contacto mejorado...\n\n";

// Ejecutar el script de contacto mejorado
$output = shell_exec('php contact-enhanced.php');

echo "Resultado de la ejecución:\n";
echo $output;

// Limpiar archivo temporal
unlink('test-contact-data.json');

echo "Prueba completada.\n";
?>