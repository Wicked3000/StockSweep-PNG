import { useState } from 'react';
import { Search, Minus, Plus, ShoppingBag, Receipt, Package, Trash2, RotateCcw, X, ShoppingCart } from 'lucide-react';
import { useInventoryStore, formatKina, Product } from '../store';
import { toast } from 'sonner';
import { ScannerOverlay } from './ScannerOverlay';
import { playScannerBeep, playErrorBeep } from '../utils/audio';

interface CartItem {
    product: Product;
    quantity: number;
}

export function RecordSale() {
  const { products, recordSale } = useInventoryStore();
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [cashTendered, setCashTendered] = useState<string>('');

  const filteredProducts = search.trim() === '' 
    ? [] 
    : products.filter(p => 
        p.name.toLowerCase().includes(search.toLowerCase()) || 
        p.category.toLowerCase().includes(search.toLowerCase()) ||
        p.barcode.includes(search)
      );

  const addToCart = () => {
    if (!selectedProduct) return;
    
    // Check if enough stock exists (considering existing cart quantity)
    const existingInCart = cart.find(item => item.product.id === selectedProduct.id);
    const totalRequested = (existingInCart?.quantity || 0) + quantity;
    
    if (selectedProduct.currentStock < totalRequested) {
        toast.error(`Insufficient stock! Only ${selectedProduct.currentStock} remaining.`);
        return;
    }

    if (existingInCart) {
        setCart(cart.map(item => 
            item.product.id === selectedProduct.id 
                ? { ...item, quantity: item.quantity + quantity }
                : item
        ));
    } else {
        setCart([...cart, { product: selectedProduct, quantity }]);
    }

    toast.success(`Added ${quantity}x ${selectedProduct.name} to cart`);
    setSelectedProduct(null);
    setSearch('');
    setQuantity(1);
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product.id !== productId));
    toast.info('Item removed from cart');
  };

  const openCheckout = () => {
    if (cart.length === 0) return;
    setShowCheckoutModal(true);
    setCashTendered('');
  };

  const confirmSale = async () => {
    if (cart.length === 0) return;
    if (Number(cashTendered) < grandTotal) return;
    
    const items = cart.map(item => ({
        product_id: item.product.id,
        quantity: item.quantity
    }));

    try {
        await recordSale(items);
        toast.success(`Transaction complete! Recorded ${cart.length} items.`);
        setCart([]);
        setShowCheckoutModal(false);
    } catch (err: any) {
        toast.error(`Sale failed: ${err.message}`);
    }
  };

  const handleScan = (barcode: string) => {
    const product = products.find(p => p.barcode === barcode);
    if (product) {
       playScannerBeep();
       setSelectedProduct(product);
       setIsScannerOpen(false);
       toast.success(`Found: ${product.name}`);
    } else {
       playErrorBeep();
       toast.error(`Barcode ${barcode} not found.`);
    }
  };

  const grandTotal = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  const currentItemTotal = selectedProduct ? selectedProduct.price * quantity : 0;

  return (
    <div className="flex flex-col h-full bg-slate-950">
      {/* Top Section: Search and Product Selection */}
      <div className="p-6 space-y-4 border-b border-white/5 bg-slate-900/50">
        <header className="flex justify-between items-center mb-2">
            <h1 className="text-xl font-black text-white px-1 tracking-tight uppercase italic">New Sale</h1>
            {cart.length > 0 && (
                <div className="bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">{cart.length} Items</span>
                </div>
            )}
        </header>

        <div className="flex gap-3">
          <div className="relative group flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                    handleScan(search.trim());
                }
              }}
              placeholder="Search or scan barcode..."
              className="block w-full pl-11 pr-4 py-4 bg-slate-900 border border-white/5 rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-medium input-mobile-fix"
            />


            {filteredProducts.length > 0 && !selectedProduct && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl z-[60] max-h-60 overflow-y-auto">
                {filteredProducts.map(p => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setSelectedProduct(p);
                      setSearch(p.name);
                    }}
                    className="w-full text-left p-4 hover:bg-emerald-500/10 border-b border-white/5 last:border-0 transition-colors"
                    disabled={p.currentStock <= 0}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-800 rounded-lg flex-shrink-0 flex items-center justify-center border border-white/5">
                        <Package size={16} className="text-slate-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-100 truncate">{p.name}</p>
                        <p className="text-[10px] text-slate-500 uppercase font-black">{p.category} • Stock: {p.currentStock}</p>
                      </div>
                      <p className="text-sm font-black text-emerald-400 flex-shrink-0 ml-2">{formatKina(p.price)}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setShowManualEntry(true)}
              className="p-4 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-2xl shadow-lg active:scale-95 transition-all outline-none"
              title="Type Barcode"
            >
              <div className="font-bold text-sm leading-none px-2 py-0.5 max-w-[60px] text-center uppercase tracking-widest break-words overflow-hidden">
                123
              </div>
            </button>
            <button 
              onClick={() => setIsScannerOpen(true)}
              className="p-4 bg-emerald-600 hover:bg-emerald-400 text-white rounded-2xl shadow-lg active:scale-95 transition-all"
              aria-label="Scan barcode"
            >
              <ScanLine size={24} />
            </button>
          </div>
        </div>

        {selectedProduct && (
            <div className="bg-slate-900 border border-emerald-500/20 rounded-3xl p-4 animate-in zoom-in-95">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center relative">
                        <Package size={24} className="text-slate-700" />
                        <button onClick={() => setSelectedProduct(null)} className="absolute -top-1 -right-1 bg-red-500 rounded-full p-1 text-white border-2 border-slate-950">
                            <X size={10} />
                        </button>
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-white">{selectedProduct.name}</h3>
                        <p className="text-[10px] text-emerald-400 font-black uppercase">{formatKina(selectedProduct.price)} / unit</p>
                    </div>
                    <div className="flex items-center gap-3 bg-slate-800 p-2 rounded-xl">
                        <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="text-slate-400"><Minus size={16} /></button>
                        <span className="text-lg font-black text-white w-6 text-center">{quantity}</span>
                        <button onClick={() => setQuantity(q => q + 1)} className="text-white"><Plus size={16} /></button>
                    </div>
                </div>
                <button 
                    onClick={addToCart}
                    className="w-full mt-4 py-3 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-black uppercase tracking-widest text-xs rounded-xl transition-all active:scale-95"
                >
                    Add to Cart ({formatKina(currentItemTotal)})
                </button>
            </div>
        )}
      </div>

      {/* Bottom Section: Cart Items and Grand Total */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
            {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center opacity-20 py-20">
                    <ShoppingCart size={48} className="text-slate-500 mb-4" />
                    <p className="font-black uppercase tracking-widest text-xs text-slate-500">Cart is empty</p>
                </div>
            ) : (
                <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4 px-2">Current Bill</p>
                    {cart.map(item => (
                        <div key={item.product.id} className="bg-slate-900/40 border border-white/5 p-4 rounded-2xl flex items-center gap-4 group hover:bg-slate-900 transition-colors">
                            <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-slate-600 border border-white/5">
                                <Package size={16} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-bold text-slate-200 truncate leading-tight">{item.product.name}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase">{formatKina(item.product.price)} / ea</span>
                                    <span className="text-[10px] text-slate-700">•</span>
                                    <span className="text-[10px] font-black text-emerald-500/80 uppercase">Qty: {item.quantity}</span>
                                </div>
                            </div>
                            
                            {/* In-Cart Controls */}
                            <div className="flex items-center gap-1 bg-slate-800/50 rounded-lg p-1">
                                <button 
                                    onClick={() => {
                                        if (item.quantity > 1) {
                                            setCart(cart.map(i => i.product.id === item.product.id ? { ...i, quantity: i.quantity - 1 } : i));
                                        } else {
                                            removeFromCart(item.product.id);
                                        }
                                    }}
                                    className="p-1 text-slate-500 hover:text-white transition-colors"
                                >
                                    <Minus size={14} />
                                </button>
                                <button 
                                    onClick={() => {
                                        if (item.product.currentStock > item.quantity) {
                                            setCart(cart.map(i => i.product.id === item.product.id ? { ...i, quantity: i.quantity + 1 } : i));
                                        } else {
                                            toast.error('Maximum stock reached');
                                        }
                                    }}
                                    className="p-1 text-slate-500 hover:text-white transition-colors"
                                >
                                    <Plus size={14} />
                                </button>
                            </div>

                            <div className="text-right ml-2 min-w-[70px]">
                                <p className="text-sm font-black text-white">{formatKina(item.product.price * item.quantity)}</p>
                                <button 
                                    onClick={() => removeFromCart(item.product.id)}
                                    className="text-[9px] font-black text-red-500 uppercase tracking-widest mt-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    Void
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>

        {/* Checkout Footer */}
        <div className="p-6 bg-slate-900 border-t border-white/10 space-y-4">
            <div className="flex justify-between items-baseline">
                <span className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Grand Total</span>
                <span className="text-4xl font-black text-emerald-400 tracking-tighter drop-shadow-[0_0_15px_rgba(52,211,153,0.3)]">
                    {formatKina(grandTotal)}
                </span>
            </div>
            <button
                disabled={cart.length === 0}
                onClick={openCheckout}
                className={`w-full py-5 rounded-2xl font-black text-lg tracking-widest uppercase transition-all shadow-xl active:scale-[0.98] flex items-center justify-center gap-3 ${
                    cart.length === 0
                        ? 'bg-slate-800 text-slate-600 grayscale cursor-not-allowed border border-white/5'
                        : 'bg-emerald-600 text-white shadow-emerald-500/20 hover:bg-emerald-500 border border-emerald-400/30'
                }`}
            >
                <ShoppingBag size={22} />
                <span>Continue to Pay</span>
            </button>
        </div>
      </div>

      {isScannerOpen && (
        <ScannerOverlay 
          onScan={handleScan} 
          onClose={() => setIsScannerOpen(false)} 
        />
      )}

      {showManualEntry && (
        <div className="absolute inset-0 z-[60] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95">
                <h3 className="font-black text-white text-xl mb-4 italic tracking-tighter">Enter Barcode</h3>
                <input
                    type="text"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && manualCode.trim()) {
                            handleScan(manualCode.trim());
                            setShowManualEntry(false);
                            setManualCode('');
                        }
                    }}
                    placeholder="Type numbers here..."
                    className="w-full bg-slate-950 border border-white/10 p-4 rounded-xl text-white font-black text-center mb-4 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    autoFocus
                />
                <div className="flex gap-3">
                    <button onClick={() => setShowManualEntry(false)} className="flex-1 py-3 bg-slate-800 text-slate-400 rounded-xl font-bold uppercase transition-colors hover:text-white">Cancel</button>
                    <button 
                        onClick={() => {
                            if (manualCode.trim()) {
                                handleScan(manualCode.trim());
                                setShowManualEntry(false);
                                setManualCode('');
                            }
                        }} 
                        className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black uppercase transition-colors shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                    >
                        Submit
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Checkout & Cash Modal */}
      {showCheckoutModal && (
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-black text-white italic tracking-tight">Checkout</h2>
                    <button onClick={() => setShowCheckoutModal(false)} className="text-slate-500 hover:text-white p-2 transition-colors">
                        <X size={24} />
                    </button>
                </div>
                
                <div className="space-y-6">
                    {/* Total Box */}
                    <div className="bg-slate-800/50 rounded-2xl p-6 text-center border border-white/5">
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">Total Due</p>
                        <p className="text-5xl font-black text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.2)]">{formatKina(grandTotal)}</p>
                    </div>

                    {/* Cash Input */}
                    <div>
                        <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Cash Given (Kina)</label>
                        <input 
                            type="number" 
                            step="0.10"
                            value={cashTendered} 
                            onChange={(e) => setCashTendered(e.target.value)}
                            placeholder="e.g. 50"
                            className="w-full bg-slate-950 border border-white/10 rounded-xl py-4 px-6 text-3xl font-black text-white text-center focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all placeholder-slate-700 hover:bg-slate-900 input-mobile-fix"
                            autoFocus
                        />

                    </div>

                    {/* Change Display */}
                    {Number(cashTendered) > 0 && (
                        <div className={`rounded-2xl p-6 text-center border animate-in slide-in-from-top-2 duration-300 ${Number(cashTendered) >= grandTotal ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                            <p className="text-sm font-bold uppercase tracking-widest mb-1 text-slate-400">Change Due</p>
                            <p className={`text-4xl font-black tracking-tight ${Number(cashTendered) >= grandTotal ? 'text-white' : 'text-red-400'}`}>
                                {Number(cashTendered) >= grandTotal 
                                    ? formatKina(Number(cashTendered) - grandTotal)
                                    : 'Insufficient Cash'}
                            </p>
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        disabled={Number(cashTendered) < grandTotal}
                        onClick={confirmSale}
                        className={`w-full mt-4 py-5 rounded-2xl font-black text-lg tracking-widest uppercase transition-all shadow-xl active:scale-[0.98] flex items-center justify-center gap-3 ${
                            Number(cashTendered) < grandTotal
                                ? 'bg-slate-800 text-slate-600 grayscale cursor-not-allowed border border-white/5'
                                : 'bg-emerald-600 text-white shadow-emerald-500/20 hover:bg-emerald-500 border border-emerald-400/30'
                        }`}
                    >
                        <Receipt size={22} />
                        <span>Confirm Sale</span>
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}

const ScanLine = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
);
