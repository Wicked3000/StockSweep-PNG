export interface Product {
  id: string;
  name: string;
  barcode?: string;
  sku?: string;
  currentStock: number;
  minStock: number;
  unitPrice: number;
  category?: string;
  imageUrl?: string;
  lastUpdated: string;
}

export interface StockEntry {
  id: string;
  productId: string;
  quantity: number;
  type: 'count' | 'adjustment' | 'sale';
  timestamp: string;
  note?: string;
}

export interface Sale {
  id: string;
  productId: string;
  quantity: number;
  totalPrice: number;
  timestamp: string;
}
