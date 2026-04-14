import { useLocalStorage } from './useLocalStorage';
import { Product, StockEntry, Sale } from '../types';

export function useInventory() {
  const [products, setProducts] = useLocalStorage<Product[]>('stocksweep_products', []);
  const [stockEntries, setStockEntries] = useLocalStorage<StockEntry[]>('stocksweep_entries', []);
  const [sales, setSales] = useLocalStorage<Sale[]>('stocksweep_sales', []);

  const addProduct = (product: Omit<Product, 'id' | 'lastUpdated'>) => {
    const newProduct: Product = {
      ...product,
      id: crypto.randomUUID(),
      lastUpdated: new Date().toISOString(),
    };
    setProducts([...products, newProduct]);
    return newProduct;
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(products.map(p =>
      p.id === id ? { ...p, ...updates, lastUpdated: new Date().toISOString() } : p
    ));
  };

  const deleteProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
  };

  const updateStock = (productId: string, quantity: number, type: 'count' | 'adjustment' | 'sale', note?: string) => {
    const entry: StockEntry = {
      id: crypto.randomUUID(),
      productId,
      quantity,
      type,
      timestamp: new Date().toISOString(),
      note,
    };
    setStockEntries([...stockEntries, entry]);

    if (type === 'count') {
      updateProduct(productId, { currentStock: quantity });
    } else if (type === 'adjustment') {
      const product = products.find(p => p.id === productId);
      if (product) {
        updateProduct(productId, { currentStock: product.currentStock + quantity });
      }
    }
  };

  const recordSale = (productId: string, quantity: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const sale: Sale = {
      id: crypto.randomUUID(),
      productId,
      quantity,
      totalPrice: quantity * product.unitPrice,
      timestamp: new Date().toISOString(),
    };
    setSales([...sales, sale]);

    updateStock(productId, -quantity, 'sale');
    updateProduct(productId, { currentStock: product.currentStock - quantity });
  };

  const getLowStockProducts = () => {
    return products.filter(p => p.currentStock <= p.minStock);
  };

  return {
    products,
    stockEntries,
    sales,
    addProduct,
    updateProduct,
    deleteProduct,
    updateStock,
    recordSale,
    getLowStockProducts,
  };
}
