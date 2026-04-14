<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $stmt = $pdo->query("SELECT * FROM products ORDER BY created_at DESC");
        $products = $stmt->fetchAll();
        echo json_encode($products);
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);
        
        if (!$data || !isset($data['action'])) {
            http_response_code(400);
            echo json_encode(["error" => "Invalid request data"]);
            exit();
        }

        if ($data['action'] === 'add') {
            $stmt = $pdo->prepare("INSERT INTO products (id, barcode, name, category, sku, price, cost_price, current_stock, reorder_limit, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $data['id'], 
                $data['barcode'], 
                $data['name'], 
                $data['category'], 
                $data['sku'], 
                $data['price'], 
                $data['cost_price'] ?? 0, 
                $data['current_stock'], 
                $data['reorder_limit'], 
                $data['image'] ?? null
            ]);
            echo json_encode(["success" => true]);
        } 
        elseif ($data['action'] === 'update') {
            $stmt = $pdo->prepare("UPDATE products SET name=?, barcode=?, category=?, sku=?, price=?, cost_price=?, current_stock=?, reorder_limit=?, image=? WHERE id=?");
            $stmt->execute([
                $data['name'], 
                $data['barcode'], 
                $data['category'], 
                $data['sku'], 
                $data['price'], 
                $data['cost_price'] ?? 0,
                $data['current_stock'], 
                $data['reorder_limit'], 
                $data['image'] ?? null,
                $data['id']
            ]);
            echo json_encode(["success" => true]);
        }
        break;

    case 'DELETE':
        if (isset($_GET['id'])) {
            $stmt = $pdo->prepare("DELETE FROM products WHERE id = ?");
            $stmt->execute([$_GET['id']]);
            echo json_encode(["success" => true]);
        } else {
            http_response_code(400);
            echo json_encode(["error" => "Missing ID"]);
        }
        break;
}
?>
