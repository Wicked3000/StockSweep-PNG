import { useState } from 'react';
import { Search, Minus, Plus, ScanLine, RotateCcw, Package } from 'lucide-react';
import { useInventoryStore, formatKina, Product } from '../store';
import { toast } from 'sonner';
import { ScannerOverlay } from './ScannerOverlay';
import { playScannerBeep, playErrorBeep } from '../utils/audio';

export function StockCount() {
  const { products, updateStock } = useInventoryStore();
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [adjustment, setAdjustment] = useState(0);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualCode, setManualCode] = useState('');

  const filteredProducts = search.trim() === '' 
    ? [] 
    : products.filter(p => 
        p.name.toLowerCase().includes(search.toLowerCase()) || 
        p.barcode.includes(search)
      );

  const handleUpdate = async () => {
    if (!selectedProduct) return;
    try {
        await updateStock(selectedProduct.barcode, adjustment);
        toast.success(`Updated ${selectedProduct.name} stock by ${adjustment > 0 ? '+' : ''}${adjustment}`);
        setAdjustment(0);
        setSelectedProduct(null);
        setSearch('');
    } catch (err: any) {
        toast.error(`Update failed: ${err.message}`);
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
       toast.error(`Barcode ${barcode} not found in inventory.`);
    }
  };

  return (
    <div className="flex flex-col p-6 space-y-6 animate-in slide-in-from-bottom-4 duration-500 min-h-full">
      <header className="flex justify-between items-center">
        <h1 className="text-2xl font-black text-white px-1 tracking-tight">Stock Count</h1>
      </header>

      {/* Search Bar */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search product or barcode..."
          className="block w-full pl-11 pr-4 py-4 bg-slate-900 border border-white/5 rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all font-medium"
        />
        
        {/* Search Results Dropdown */}
        {filteredProducts.length > 0 && !selectedProduct && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl z-20 max-h-60 overflow-y-auto">
            {filteredProducts.map(p => (
              <button
                key={p.id}
                onClick={() => {
                  setSelectedProduct(p);
                  setSearch(p.name);
                }}
                className="w-full text-left p-4 hover:bg-emerald-500/10 border-b border-white/5 last:border-0 transition-colors"
              >
                <p className="font-bold text-slate-100">{p.name}</p>
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>SKU: {p.sku}</span>
                  <span className="font-bold text-emerald-400">Current: {p.currentStock}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Controls - Grid following the guide */}
      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => setIsScannerOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-500 border border-emerald-400/30 p-4 rounded-2xl flex items-center justify-center space-x-2 text-white font-bold transition-all active:scale-95 shadow-lg shadow-emerald-500/10"
        >
          <ScanLine size={20} />
          <span>Scan</span>
        </button>
        <button 
          onClick={() => setShowManualEntry(true)}
          className="bg-slate-800/50 hover:bg-slate-800 border border-white/5 p-4 rounded-2xl flex items-center justify-center space-x-2 text-slate-400 font-bold transition-all active:scale-95"
        >
          <span>Enter Barcode</span>
        </button>
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

      {/* Counter Component */}
      <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-6 space-y-4">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest text-center">New Stock Count</p>
        
        <div className="flex items-center justify-between gap-4">
          <button 
            onClick={() => setAdjustment(a => a - 1)}
            className="w-14 h-14 bg-slate-800 hover:bg-slate-700 rounded-2xl flex items-center justify-center text-slate-400 active:scale-90 transition-all border border-white/5"
            aria-label="Decrease adjustment"
          >
            <Minus size={24} />
          </button>
          
          <div className="flex-1 text-center group">
            <div className="relative inline-block">
                <input
                    type="number"
                    value={adjustment}
                    onChange={(e) => setAdjustment(parseInt(e.target.value) || 0)}
                    className="text-5xl font-black text-white tabular-nums drop-shadow-lg bg-transparent border-b-2 border-transparent hover:border-white/20 focus:border-emerald-500 outline-none text-center w-32 transition-all p-0 focus:ring-0"
                />
            </div>
            {selectedProduct && (
              <p className="text-xs text-slate-500 font-bold mt-2 uppercase">
                Final: {selectedProduct.currentStock + adjustment}
              </p>
            )}
          </div>

          <button 
            onClick={() => setAdjustment(a => a + 1)}
            className="w-14 h-14 bg-slate-800 hover:bg-slate-700 rounded-2xl flex items-center justify-center text-white active:scale-90 transition-all border border-white/5"
            aria-label="Increase adjustment"
          >
            <Plus size={24} />
          </button>
        </div>
      </div>

      {/* Update Button */}
      <button
        disabled={!selectedProduct || adjustment === 0}
        onClick={handleUpdate}
        className={`w-full py-5 rounded-2xl font-black text-lg tracking-widest uppercase transition-all shadow-xl active:scale-[0.98] ${
          !selectedProduct || adjustment === 0
            ? 'bg-slate-800 text-slate-600 grayscale cursor-not-allowed border border-white/5'
            : 'bg-emerald-600 text-white shadow-emerald-500/20 hover:bg-emerald-500 border border-emerald-400/30'
        }`}
      >
        Update Stock Count
      </button>

      {/* Recently Adjusted - Minor history at bottom */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex items-center justify-between text-slate-500 py-4 px-2">
            <span className="text-[10px] font-black uppercase tracking-widest">Selected Item</span>
            {selectedProduct && (
              <button 
                onClick={() => setSelectedProduct(null)} 
                className="text-slate-400"
                aria-label="Clear selection"
              >
                <RotateCcw size={14} />
              </button>
            )}
        </div>
        
        {selectedProduct ? (
            <div className="bg-emerald-500/5 border border-emerald-500/20 p-5 rounded-3xl animate-in zoom-in-95 flex gap-4">
                <div className="w-16 h-16 bg-slate-800 rounded-2xl flex-shrink-0 overflow-hidden flex items-center justify-center border border-white/5">
                    {selectedProduct.image ? (
                        <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-full object-cover" />
                    ) : (
                        <Package size={24} className="text-slate-700" />
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                        <div className="min-w-0 pr-2">
                            <h2 className="text-lg font-bold text-white truncate">{selectedProduct.name}</h2>
                            <p className="text-xs text-slate-500 font-medium">{selectedProduct.category}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                            <p className="text-sm font-bold text-slate-400">{formatKina(selectedProduct.price)}</p>
                            <p className="text-xs text-emerald-400 font-black mt-1 uppercase">Stock: {selectedProduct.currentStock}</p>
                        </div>
                    </div>
                </div>
            </div>
        ) : (
            <div className="bg-slate-900/20 border border-white/5 border-dashed p-10 rounded-3xl flex flex-col items-center opacity-40">
                <Package size={32} className="text-slate-700 mb-2" />
                <p className="text-sm font-medium text-slate-600">Select a product to adjust stock</p>
            </div>
        )}
      </div>
    </div>
  );
}
