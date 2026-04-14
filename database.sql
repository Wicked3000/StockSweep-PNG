-- StockSweep PNG Database Schema
-- Optimized for XAMPP / MySQL

CREATE DATABASE IF NOT EXISTS stocksweep_png;
USE stocksweep_png;

-- Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products Table
CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(50) PRIMARY KEY,
    barcode VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    sku VARCHAR(50),
    price DECIMAL(10, 2) NOT NULL,
    cost_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    current_stock INT NOT NULL DEFAULT 0,
    reorder_limit INT NOT NULL DEFAULT 5,
    image MEDIUMTEXT, -- Stores Base64 data strings
    last_sold DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Sales Table
CREATE TABLE IF NOT EXISTS sales (
    id VARCHAR(50) PRIMARY KEY,
    product_id VARCHAR(50) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    quantity INT NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    cost_total DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Initial Categories
INSERT IGNORE INTO categories (name) VALUES 
('Groceries'), ('Canned Goods'), ('Beverages'), ('Hygiene'), ('Hardware'), ('Tobacco');

-- Sample Data (Optional)
INSERT IGNORE INTO products (id, barcode, name, category, sku, price, cost_price, current_stock, reorder_limit) VALUES
('p1', '9310072019876', 'Ramu Sugar 1kg', 'Groceries', 'GRO-002', 4.50, 3.80, 15, 10),
('p2', '123456789', 'Ox & Palm Corned Beef', 'Canned Goods', 'CAN-001', 18.50, 15.00, 5, 5);
