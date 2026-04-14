import { useState } from 'react';
import { useInventory } from '../hooks/useInventory';
import { Search, Check, Plus, Minus } from 'lucide-react';
import { toast } from 'sonner';

export function Sales() {
  const { products, recordSale } = useInventory();
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.barcode?.includes(searchTerm) ||
    p.sku?.includes(searchTerm)
  );

  const currentProduct = products.find(p => p.id === selectedProduct);

  const handleSubmit = () => {
    if (!selectedProduct || !quantity) {
      toast.error('Please select a product and enter quantity');
      return;
    }

    const qty = parseInt(quantity);
    if (isNaN(qty) || qty <= 0) {
      toast.error('Please enter a valid quantity');
      return;
    }

    const product = products.find(p => p.id === selectedProduct);
    if (!product) return;

    if (qty > product.currentStock) {
      toast.error('Not enough stock available');
      return;
    }

    recordSale(selectedProduct, qty);
    toast.success(`Sale recorded: ${product.name} x${qty}`);
    setQuantity('');
    setSelectedProduct('');
    setSearchTerm('');
  };

  const adjustQuantity = (delta: number) => {
    const current = parseInt(quantity) || 0;
    const newValue = Math.max(0, current + delta);
    setQuantity(newValue.toString());
  };

  const totalPrice = currentProduct && quantity
    ? currentProduct.unitPrice * parseInt(quantity)
    : 0;

  return (
    <div className="pb-20 px-4 pt-6">
      <h1 className="text-2xl font-bold mb-6">Record Sale</h1>

      <div className="space-y-4">
        <div className="relative">
          <Search size={20} className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg"
          />
        </div>

        {searchTerm && filteredProducts.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg divide-y max-h-64 overflow-y-auto">
            {filteredProducts.map((product) => (
              <button
                key={product.id}
                onClick={() => {
                  setSelectedProduct(product.id);
                  setSearchTerm('');
                }}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 flex gap-3 items-center"
              >
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-12 h-12 object-cover rounded border border-gray-200"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-100 rounded border border-gray-200" />
                )}
                <div className="flex-1">
                  <p className="font-medium">{product.name}</p>
                  <p className="text-sm text-gray-600">
                    K{product.unitPrice.toFixed(2)} • Stock: {product.currentStock}
                  </p>
                </div>
                {selectedProduct === product.id && <Check size={20} className="text-green-600" />}
              </button>
            ))}
          </div>
        )}

        {currentProduct && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-800 mb-2">Selected Product</p>
            <div className="flex gap-3 items-center">
              {currentProduct.imageUrl && (
                <img
                  src={currentProduct.imageUrl}
                  alt={currentProduct.name}
                  className="w-16 h-16 object-cover rounded border border-green-300"
                />
              )}
              <div>
                <p className="font-bold text-lg">{currentProduct.name}</p>
                <p className="text-sm text-green-700">
                  K{currentProduct.unitPrice.toFixed(2)} • Available: {currentProduct.currentStock}
                </p>
              </div>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-2">Quantity</label>
          <div className="flex gap-2">
            <button
              onClick={() => adjustQuantity(-1)}
              className="bg-gray-200 p-3 rounded-lg"
            >
              <Minus size={20} />
            </button>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="0"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-center text-xl font-bold"
            />
            <button
              onClick={() => adjustQuantity(1)}
              className="bg-gray-200 p-3 rounded-lg"
            >
              <Plus size={20} />
            </button>
          </div>
        </div>

        {currentProduct && quantity && (
          <div className="bg-gray-900 text-white rounded-lg p-4">
            <p className="text-sm opacity-80 mb-1">Total</p>
            <p className="text-3xl font-bold">K{totalPrice.toFixed(2)}</p>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={!selectedProduct || !quantity}
          className="w-full bg-green-600 text-white py-4 rounded-lg font-semibold text-lg disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Record Sale
        </button>
      </div>
    </div>
  );
}
