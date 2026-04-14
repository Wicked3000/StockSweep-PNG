<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    
    if (!$data || !isset($data['pin'])) {
        http_response_code(400);
        echo json_encode(["error" => "Invalid request. PIN required."]);
        exit();
    }

    $stmt = $pdo->prepare("SELECT id, username, role FROM users WHERE pin = ?");
    $stmt->execute([$data['pin']]);
    $user = $stmt->fetch();

    if ($user) {
        echo json_encode([
            "success" => true,
            "user" => [
                "id" => $user['id'],
                "username" => $user['username'],
                "role" => $user['role'] // 'admin' | 'cashier'
            ]
        ]);
    } else {
        http_response_code(401);
        echo json_encode(["error" => "Invalid PIN. Access Denied."]);
    }
} else {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
}
?>
