<?php
// Configuración de correo para la florería
return [
    'smtp' => [
        'host' => getenv('SMTP_HOST') ?: 'smtp.gmail.com',
        'port' => getenv('SMTP_PORT') ?: 587,
        'username' => getenv('SMTP_USERNAME') ?: 'arreglosvictoriafloreria@gmail.com',
        'password' => getenv('SMTP_PASSWORD') ?: '',
        'encryption' => getenv('SMTP_ENCRYPTION') ?: 'tls',
    ],
    'from' => [
        'address' => getenv('MAIL_FROM_ADDRESS') ?: 'arreglosvictoriafloreria@gmail.com',
        'name' => getenv('MAIL_FROM_NAME') ?: 'Arreglos Victoria Florería',
    ],
    'to' => [
        'address' => getenv('MAIL_TO_ADDRESS') ?: 'arreglosvictoriafloreria@gmail.com',
        'name' => getenv('MAIL_TO_NAME') ?: 'Arreglos Victoria Florería',
    ],
];