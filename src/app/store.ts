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
    
    // Try to load from LocalStorage first (for instant startup/standalone mode)
    const localProducts = localStorage.getItem('ss_products');
    const localSales = localStorage.getItem('ss_sales');
    const localCategories = localStorage.getItem('ss_categories');

    if (localProducts) set({ products: JSON.parse(localProducts) });
    if (localSales) set({ sales: JSON.parse(localSales) });
    if (localCategories) set({ categories: JSON.parse(localCategories) });

    try {
      const [products, sales, categories] = await Promise.all([
        ApiService.getProducts(),
        ApiService.getSales(),
        ApiService.getCategories()
      ]);
      
      // Update local storage with fresh server data
      localStorage.setItem('ss_products', JSON.stringify(products));
      localStorage.setItem('ss_sales', JSON.stringify(sales));
      localStorage.setItem('ss_categories', JSON.stringify(categories));
      
      set({ products, sales, categories, isLoading: false });
    } catch (err: any) {
      console.warn("API Offline, using local cache:", err.message);
      // If we have local data, we don't treat it as a hard error
      if (localProducts) {
        set({ isLoading: false, error: null });
      } else {
        set({ error: err.message, isLoading: false });
      }
    }
  },

  addProduct: async (product) => {
    try {
      const updatedProducts = [product, ...get().products];
      set({ products: updatedProducts });
      localStorage.setItem('ss_products', JSON.stringify(updatedProducts));
      
      await ApiService.addProduct(product);
    } catch (err: any) {
      console.error("Failed to sync new product to server:", err.message);
    }
  },

  updateStock: async (barcode, quantityChange) => {
    const product = get().products.find(p => p.barcode === barcode);
    if (!product) return;
    
    const newStock = Math.max(0, Number(product.currentStock) + quantityChange);
    const updatedProducts = get().products.map(p => 
      p.barcode === barcode ? { ...p, currentStock: newStock } : p
    );
    
    set({ products: updatedProducts });
    localStorage.setItem('ss_products', JSON.stringify(updatedProducts));

    try {
      await ApiService.updateProduct(product.id, { currentStock: newStock });
    } catch (err: any) {
      console.error("Failed to sync stock update to server:", err.message);
    }
  },

  recordSale: async (items: { product_id: string, quantity: number }[]) => {
    try {
      await ApiService.recordSale(items);
      const [products, sales] = await Promise.all([
        ApiService.getProducts(),
        ApiService.getSales()
      ]);
      set({ products, sales });
      localStorage.setItem('ss_products', JSON.stringify(products));
      localStorage.setItem('ss_sales', JSON.stringify(sales));
    } catch (err: any) {
      console.error("Failed to record sale to server, updating locally only:", err.message);
      // Optional: Logic to record sale locally could go here
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
