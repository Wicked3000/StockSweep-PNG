<?php
/**
 * StockSweep PNG - Auto Setup Script
 * Creates the database and tables automatically.
 */

header("Content-Type: text/plain");

$host = '127.0.0.1';
$user = 'root';
$pass = ''; // Default XAMPP password

echo "--- StockSweep PNG: Database Setup ---\n\n";

try {
    // 1. Connect to MySQL without a database
    $pdo = new PDO("mysql:host=$host", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    echo "[OK] Connected to MySQL server.\n";

    // 2. Create Database
    echo "[INFO] Creating database 'stocksweep_png'...\n";
    $pdo->exec("CREATE DATABASE IF NOT EXISTS stocksweep_png CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    echo "[OK] Database 'stocksweep_png' is ready.\n";

    // 3. Select the database
    $pdo->exec("USE stocksweep_png");

    // 4. Create Tables & Handle Migrations
    echo "[INFO] Syncing table structures...\n";

    // Categories
    $pdo->exec("CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");

    // Users
    $pdo->exec("CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        pin VARCHAR(20) NOT NULL,
        role VARCHAR(20) NOT NULL DEFAULT 'cashier',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");

    // Products
    $pdo->exec("CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(50) PRIMARY KEY,
        barcode VARCHAR(100) NOT NULL,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        sku VARCHAR(50),
        price DECIMAL(10, 2) NOT NULL,
        current_stock INT NOT NULL DEFAULT 0,
        reorder_limit INT NOT NULL DEFAULT 5,
        image MEDIUMTEXT,
        last_sold DATETIME,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )");

    // Ensure cost_price exists in products
    $cols = $pdo->query("SHOW COLUMNS FROM products LIKE 'cost_price'")->fetch();
    if (!$cols) {
        echo "[INFO] Adding 'cost_price' to products table...\n";
        $pdo->exec("ALTER TABLE products ADD COLUMN cost_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00 AFTER price");
    }

    // Sales
    $pdo->exec("CREATE TABLE IF NOT EXISTS sales (
        id VARCHAR(50) PRIMARY KEY,
        product_id VARCHAR(50) NOT NULL,
        product_name VARCHAR(255) NOT NULL,
        quantity INT NOT NULL,
        total_price DECIMAL(10, 2) NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    )");

    // Ensure cost_total exists in sales
    $cols = $pdo->query("SHOW COLUMNS FROM sales LIKE 'cost_total'")->fetch();
    if (!$cols) {
        echo "[INFO] Adding 'cost_total' to sales table...\n";
        $pdo->exec("ALTER TABLE sales ADD COLUMN cost_total DECIMAL(10, 2) NOT NULL DEFAULT 0.00 AFTER total_price");
    }

    echo "[OK] Database structure is correctly synced.\n";

    // 5. Seed Initial Data
    echo "[INFO] Seeding initial categories...\n";
    $categories = ['Groceries', 'Canned Goods', 'Beverages', 'Hygiene', 'Hardware', 'Tobacco'];
    $stmt = $pdo->prepare("INSERT IGNORE INTO categories (name) VALUES (?)");
    foreach ($categories as $cat) {
        $stmt->execute([$cat]);
    }

    echo "[INFO] Seeding initial users...\n";
    $users = [
        ['Admin', '1234', 'admin'],
        ['Cashier', '0000', 'cashier']
    ];
    $stmt = $pdo->prepare("INSERT IGNORE INTO users (username, pin, role) VALUES (?, ?, ?)");
    foreach ($users as $u) {
        $stmt->execute($u);
    }

    echo "[INFO] Seeding sample products...\n";
    $sampleProducts = [
        ['p1', '9310072019876', 'Ramu Sugar 1kg', 'Groceries', 'GRO-002', 4.50, 3.80, 15, 10],
        ['p2', '123456789', 'Ox & Palm Corned Beef', 'Canned Goods', 'CAN-001', 18.50, 15.00, 5, 5]
    ];
    $stmt = $pdo->prepare("INSERT IGNORE INTO products (id, barcode, name, category, sku, price, cost_price, current_stock, reorder_limit) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
    foreach ($sampleProducts as $p) {
        $stmt->execute($p);
    }

    echo "\n[SUCCESS] StockSweep PNG is now fully configured!\n";
    echo "You can now close this tab and refresh your app at http://localhost:5173 (or your dev port).\n";

} catch (PDOException $e) {
    echo "\n[ERROR] Setup failed: " . $e->getMessage() . "\n";
    echo "Please ensure XAMPP is running and MySQL is started.\n";
}
?>
