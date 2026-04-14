<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $stmt = $pdo->query("SELECT name FROM categories ORDER BY name ASC");
        $categories = $stmt->fetchAll(PDO::FETCH_COLUMN);
        echo json_encode($categories);
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);
        if (isset($data['name'])) {
            $stmt = $pdo->prepare("INSERT IGNORE INTO categories (name) VALUES (?)");
            $stmt->execute([$data['name']]);
            echo json_encode(["success" => true]);
        }
        break;

    case 'DELETE':
        if (isset($_GET['name'])) {
            $stmt = $pdo->prepare("DELETE FROM categories WHERE name = ?");
            $stmt->execute([$_GET['name']]);
            echo json_encode(["success" => true]);
        }
        break;
}
?>
