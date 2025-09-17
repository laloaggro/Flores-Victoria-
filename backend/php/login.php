<?php
require_once 'config.php';

header('Content-Type: application/json');

// Verificar que la solicitud sea POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido']);
    exit;
}

// Obtener datos del cuerpo de la solicitud
$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    http_response_code(400);
    echo json_encode(['error' => 'Datos inválidos']);
    exit;
}

$email = isset($input['email']) ? trim($input['email']) : null;
$password = isset($input['password']) ? $input['password'] : null;

// Validar campos requeridos
if (!$email || !$password) {
    http_response_code(400);
    echo json_encode(['error' => 'Email y contraseña son obligatorios']);
    exit;
}

try {
    // Buscar usuario por email
    $stmt = $pdo->prepare("SELECT id, name, email, phone, password, role FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user) {
        http_response_code(401);
        echo json_encode(['error' => 'Credenciales inválidas']);
        exit;
    }
    
    // Verificar contraseña
    if (!password_verify($password, $user['password'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Credenciales inválidas']);
        exit;
    }
    
    // Generar token de sesión
    $token = generateToken($user['id']);
    
    // Guardar información en la sesión
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['token'] = $token;
    
    // No enviar la contraseña en la respuesta
    unset($user['password']);
    
    echo json_encode([
        'message' => 'Inicio de sesión exitoso',
        'user' => $user,
        'token' => $token
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error al iniciar sesión']);
    error_log($e->getMessage());
}
?>