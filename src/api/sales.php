<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $stmt = $pdo->query("SELECT * FROM sales ORDER BY timestamp DESC");
        $sales = $stmt->fetchAll();
        echo json_encode($sales);
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);
        
        if (!$data || !isset($data['items']) || !is_array($data['items'])) {
            http_response_code(400);
            echo json_encode(["error" => "Invalid sale data. Expected an 'items' array."]);
            exit();
        }

        try {
            $pdo->beginTransaction();
            $batchId = uniqid('BATCH_');
            $timestamp = date('Y-m-d H:i:s');
            
            foreach ($data['items'] as $item) {
                // 1. Get current product info
                $stmt = $pdo->prepare("SELECT name, price, cost_price, current_stock FROM products WHERE id = ? FOR UPDATE");
                $stmt->execute([$item['product_id']]);
                $product = $stmt->fetch();

                if (!$product) throw new Exception("Product " . $item['product_id'] . " not found");
                if ($product['current_stock'] < $item['quantity']) {
                    throw new Exception("Insufficient stock for " . $product['name'] . ". Available: " . $product['current_stock']);
                }

                // 2. Record the sale
                $saleId = uniqid('SALE_');
                $totalPrice = $product['price'] * $item['quantity'];
                $costTotal = ($product['cost_price'] ?? 0) * $item['quantity'];
                
                $stmt = $pdo->prepare("INSERT INTO sales (id, product_id, product_name, quantity, total_price, cost_total, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)");
                $stmt->execute([
                    $saleId,
                    $item['product_id'],
                    $product['name'],
                    $item['quantity'],
                    $totalPrice,
                    $costTotal,
                    $timestamp
                ]);

                // 3. Update stock
                $stmt = $pdo->prepare("UPDATE products SET current_stock = current_stock - ?, last_sold = ? WHERE id = ?");
                $stmt->execute([$item['quantity'], $timestamp, $item['product_id']]);
            }

            $pdo->commit();
            echo json_encode(["success" => true, "batch_id" => $batchId]);

        } catch (Exception $e) {
            $pdo->rollBack();
            http_response_code(400);
            echo json_encode(["error" => $e->getMessage()]);
        }
        break;
}
?>
