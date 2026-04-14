import { create } from 'zustand';
import { ApiService, User } from './services/api';

export interface Product {
  id: string;
  barcode: string;
  name: string;
  category: string;
  sku: string;
  price: number;
  costPrice: number;
  currentStock: number;
  reorderLimit: number;
  image?: string;
  last_sold?: string;
}

export interface Sale {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  total_price: number;
  cost_total: number;
  timestamp: string;
}

interface InventoryState {
  products: Product[];
  sales: Sale[];
  categories: string[];
  isLoading: boolean;
  error: string | null;
  
  // Initialization
  initialize: () => Promise<void>;
  
  // Product Actions
  addProduct: (product: Product) => Promise<void>;
  updateStock: (barcode: string, quantityChange: number) => Promise<void>;
  recordSale: (items: { product_id: string, quantity: number }[]) => Promise<void>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  
  // Category Actions
  addCategory: (name: string) => Promise<void>;
  
  // Computed helpers (Local for speed)
  getInventoryValue: () => number;
  getTodaySales: () => number;
  getTodayProfit: () => number;
  getLowStockCount: () => number;

  // Auth
  currentUser: User | null;
  login: (pin: string) => Promise<void>;
  logout: () => void;
}

export const useInventoryStore = create<InventoryState>((set, get) => ({
  products: [],
  sales: [],
  categories: [],
  isLoading: false,
  error: null,
  currentUser: null,

  initialize: async () => {
    set({ isLoading: true, error: null });
    try {
      const [products, sales, categories] = await Promise.all([
        ApiService.getProducts(),
        ApiService.getSales(),
        ApiService.getCategories()
      ]);
      set({ products, sales, categories, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  addProduct: async (product) => {
    try {
      await ApiService.addProduct(product);
      set((state) => ({ products: [product, ...state.products] }));
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  },

  updateStock: async (barcode, quantityChange) => {
    const product = get().products.find(p => p.barcode === barcode);
    if (!product) return;
    
    const newStock = Math.max(0, Number(product.currentStock) + quantityChange);
    try {
      await ApiService.updateProduct(product.id, { currentStock: newStock });
      set((state) => ({
        products: state.products.map(p => 
          p.barcode === barcode ? { ...p, currentStock: newStock } : p
        )
      }));
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  recordSale: async (items: { product_id: string, quantity: number }[]) => {
    try {
      await ApiService.recordSale(items);
      // Re-initialize to get updated stock and sales list from server
      const [products, sales] = await Promise.all([
        ApiService.getProducts(),
        ApiService.getSales()
      ]);
      set({ products, sales });
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  },

  updateProduct: async (id, updates) => {
    try {
      await ApiService.updateProduct(id, updates);
      set((state) => ({
        products: state.products.map(p => p.id === id ? { ...p, ...updates } : p)
      }));
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  deleteProduct: async (id) => {
    try {
      await ApiService.deleteProduct(id);
      set((state) => ({
        products: state.products.filter(p => p.id !== id)
      }));
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  addCategory: async (name) => {
    try {
      await ApiService.addCategory(name);
      const categories = await ApiService.getCategories();
      set({ categories });
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  getInventoryValue: () => {
    return get().products.reduce((acc, p) => acc + (Number(p.currentStock) * Number(p.price)), 0);
  },

  getTodaySales: () => {
    const today = new Date().toISOString().split('T')[0];
    return get().sales
      .filter(s => s.timestamp.startsWith(today))
      .reduce((acc, s) => acc + Number(s.total_price), 0);
  },

  getTodayProfit: () => {
    const today = new Date().toISOString().split('T')[0];
    return get().sales
      .filter(s => s.timestamp.startsWith(today))
      .reduce((acc, s) => acc + (Number(s.total_price) - Number(s.cost_total || 0)), 0);
  },

  getLowStockCount: () => {
    return get().products.filter(p => Number(p.currentStock) <= Number(p.reorderLimit)).length;
  },

  login: async (pin: string) => {
    try {
      const user = await ApiService.login(pin);
      set({ currentUser: user, error: null });
    } catch (err: any) {
      throw err;
    }
  },

  logout: () => {
    set({ currentUser: null });
  }
}));

export const formatKina = (amount: number | string) => {
  const num = Number(amount);
  if (isNaN(num)) return 'K0.00';
  return `K${num.toFixed(2)}`;
};
