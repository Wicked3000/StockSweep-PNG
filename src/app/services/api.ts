/**
 * API Service Layer for StockSweep PNG
 * Handles communication with Supabase (Cloud)
 */

import { createClient } from '@supabase/supabase-js';
import { Product, Sale } from '../store';

export interface User {
    id: string;
    username: string;
    role: 'admin' | 'cashier';
}

// Supabase Configuration
const SUPABASE_URL = 'https://iuzlrtkhwkcfvnvvlshm.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_I1IXTGm0Ybv7lq75evTWSw_kG5afuEe';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const ApiService = {
    // Products
    async getProducts(): Promise<Product[]> {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('name');
        
        if (error) throw error;
        
        return data.map((p: any) => ({
            id: p.id,
            barcode: p.barcode,
            name: p.name,
            category: p.category,
            sku: p.sku,
            price: Number(p.price),
            costPrice: Number(p.cost_price),
            currentStock: Number(p.current_stock),
            reorderLimit: Number(p.reorder_limit),
            image: p.image,
            lastSold: p.last_sold,
            createdAt: p.created_at,
            updatedAt: p.updated_at
        }));
    },

    async addProduct(product: Product): Promise<void> {
        const { error } = await supabase
            .from('products')
            .insert([{
                id: product.id,
                barcode: product.barcode,
                name: product.name,
                category: product.category,
                sku: product.sku,
                price: product.price,
                cost_price: product.costPrice,
                current_stock: product.currentStock,
                reorder_limit: product.reorderLimit,
                image: product.image
            }]);
        
        if (error) throw error;
    },

    async updateProduct(id: string, updates: Partial<Product>): Promise<void> {
        const mappedUpdates: any = { ...updates };
        if (updates.costPrice !== undefined) mappedUpdates.cost_price = updates.costPrice;
        if (updates.currentStock !== undefined) mappedUpdates.current_stock = updates.currentStock;
        if (updates.reorderLimit !== undefined) mappedUpdates.reorder_limit = updates.reorderLimit;
        
        // Remove camelCase versions to keep Supabase happy
        delete mappedUpdates.costPrice;
        delete mappedUpdates.currentStock;
        delete mappedUpdates.reorderLimit;

        const { error } = await supabase
            .from('products')
            .update(mappedUpdates)
            .eq('id', id);
        
        if (error) throw error;
    },

    async deleteProduct(id: string): Promise<void> {
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
    },

    // Categories
    async getCategories(): Promise<string[]> {
        const { data, error } = await supabase
            .from('categories')
            .select('name')
            .order('name');
        
        if (error) throw error;
        return data.map(c => c.name);
    },

    async addCategory(name: string): Promise<void> {
        const { error } = await supabase
            .from('categories')
            .insert([{ name }]);
        
        if (error) throw error;
    },

    // Sales
    async getSales(): Promise<Sale[]> {
        const { data, error } = await supabase
            .from('sales')
            .select('*')
            .order('timestamp', { ascending: false });
        
        if (error) throw error;
        
        return data.map((s: any) => ({
            id: s.id,
            product_id: s.product_id,
            product_name: s.product_name,
            quantity: s.quantity,
            total_price: Number(s.total_price),
            cost_total: Number(s.cost_total),
            timestamp: s.timestamp
        }));

    },

    async recordSale(items: { product_id: string, quantity: number }[]): Promise<void> {
        // Record each item and update stock
        for (const item of items) {
            // Get product name, price, and cost price
            const { data: product, error: pError } = await supabase
                .from('products')
                .select('name, price, cost_price, current_stock')
                .eq('id', item.product_id)
                .single();
            
            if (pError) throw pError;

            // Insert sale record with cost_total for profit tracking
            const { error: sError } = await supabase
                .from('sales')
                .insert([{
                    id: crypto.randomUUID(),
                    product_id: item.product_id,
                    product_name: product.name,
                    quantity: item.quantity,
                    total_price: product.price * item.quantity,
                    cost_total: product.cost_price * item.quantity,
                    timestamp: new Date().toISOString()
                }]);
            
            if (sError) throw sError;


            // Update product stock
            const { error: uError } = await supabase
                .from('products')
                .update({ 
                    current_stock: product.current_stock - item.quantity,
                    last_sold: new Date().toISOString()
                })
                .eq('id', item.product_id);
            
            if (uError) throw uError;
        }
    },

    // Auth (Cloud Powered)
    async login(pin: string): Promise<User> {
        const { data, error } = await supabase
            .from('users')
            .select('id, username, role')
            .eq('pin', pin)
            .single();

        if (error || !data) {
            throw new Error('Invalid PIN. Please try again.');
        }

        return {
            id: String(data.id),
            username: data.username,
            role: data.role as 'admin' | 'cashier'
        };
    }
};


