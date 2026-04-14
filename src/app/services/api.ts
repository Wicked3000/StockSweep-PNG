/**
 * API Service Layer for StockSweep PNG
 * Handles communication with XAMPP (Local) / Supabase (Future)
 */

import { Product, Sale } from '../store';

export interface User {
    id: number;
    username: string;
    role: 'admin' | 'cashier';
}

const API_BASE_URL = 'http://127.0.0.1/api'; // Native IP for local stability

export const ApiService = {
    // Products
    async getProducts(): Promise<Product[]> {
        const response = await fetch(`${API_BASE_URL}/products.php`);
        if (!response.ok) throw new Error('Failed to fetch products');
        const raw = await response.json();
        return raw.map((p: any) => ({
            ...p,
            costPrice: Number(p.cost_price || 0),
            currentStock: Number(p.current_stock || 0),
            reorderLimit: Number(p.reorder_limit || 0),
            price: Number(p.price || 0)
        }));
    },

    async addProduct(product: Product): Promise<void> {
        const payload = {
            action: 'add',
            ...product,
            cost_price: product.costPrice,
            current_stock: product.currentStock,
            reorder_limit: product.reorderLimit
        };
        const response = await fetch(`${API_BASE_URL}/products.php`, {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error('Failed to add product');
    },

    async updateProduct(id: string, updates: Partial<Product>): Promise<void> {
        // Fetch full product first to ensure we have all required fields for the PHP update
        const products = await this.getProducts();
        const existing = products.find(p => p.id === id);
        if (!existing) throw new Error('Product not found');

        const merged = { ...existing, ...updates };
        const payload = {
            action: 'update',
            ...merged,
            cost_price: merged.costPrice,
            current_stock: merged.currentStock,
            reorder_limit: merged.reorderLimit
        };

        const response = await fetch(`${API_BASE_URL}/products.php`, {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error('Failed to update product');
    },

    async deleteProduct(id: string): Promise<void> {
        const response = await fetch(`${API_BASE_URL}/products.php?id=${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to delete product');
    },

    // Categories
    async getCategories(): Promise<string[]> {
        const response = await fetch(`${API_BASE_URL}/categories.php`);
        if (!response.ok) throw new Error('Failed to fetch categories');
        return response.json();
    },

    async addCategory(name: string): Promise<void> {
        const response = await fetch(`${API_BASE_URL}/categories.php`, {
            method: 'POST',
            body: JSON.stringify({ name })
        });
        if (!response.ok) throw new Error('Failed to add category');
    },

    // Sales
    async getSales(): Promise<Sale[]> {
        const response = await fetch(`${API_BASE_URL}/sales.php`);
        if (!response.ok) throw new Error('Failed to fetch sales');
        return response.json();
    },

    async recordSale(items: { product_id: string, quantity: number }[]): Promise<void> {
        const response = await fetch(`${API_BASE_URL}/sales.php`, {
            method: 'POST',
            body: JSON.stringify({ items })
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to record sale');
        }
    },

    // Auth
    async login(pin: string): Promise<User> {
        const response = await fetch(`${API_BASE_URL}/auth.php`, {
            method: 'POST',
            body: JSON.stringify({ pin })
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Invalid PIN');
        }
        return data.user;
    }
};
