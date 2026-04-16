import { useState, useMemo, useRef } from 'react';
import { Share2, Plus, Edit3, Trash2, Search, X, Package } from 'lucide-react';
import { useInventoryStore, formatKina, Product } from '../store';
import { ProductEditor } from './ProductEditor';
import { toast } from 'sonner';

export function Inventory() {
  const { products, deleteProduct, categories } = useInventoryStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null | undefined>(undefined);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           p.barcode.includes(searchTerm) ||
                           p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           p.category.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory ? p.category === selectedCategory : true;
      
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  const handleDelete = async (id: string) => {
    const product = products.find(p => p.id === id);
    if (product) {
        try {
            await deleteProduct(id);
            toast.error(`Deleted ${product.name}`);
            setDeletingProduct(null);
        } catch (err: any) {
            toast.error(`Delete failed: ${err.message}`);
        }
    }
  };

  const handleShareRestock = () => {
    const lowStock = products.filter(p => p.currentStock <= p.reorderLimit);
    if (lowStock.length === 0) {
      toast.info("All stock levels are healthy");
      return;
    }

    let msg = "*StockSweep PNG Restock Order* 🇵🇳📦\n\n";
    lowStock.forEach(p => {
      msg += `▪️ ${p.name}\n  SKU: ${p.sku}\n  Stock: ${p.currentStock}\n`;
    });
    msg += "\nPlease prepare a quote. Tenkyu tru!";

    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="flex flex-col p-6 space-y-6 animate-in slide-in-from-right-4 duration-700 min-h-full">
      <header className="flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-black text-white px-1 tracking-tight uppercase">Inventory</h1>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Managed stock items</p>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={() => setEditingProduct(null)}
                className="p-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-emerald-950 shadow-lg transition-all active:scale-90"
                aria-label="Add new product"
            >
                <Plus size={20} />
            </button>
            <button 
                onClick={handleShareRestock}
                className="p-3 rounded-2xl bg-slate-900 border border-white/5 text-emerald-400 hover:bg-slate-800 transition-all active:scale-90"
                aria-label="Share restock list"
            >
                <Share2 size={20} />
            </button>
        </div>
      </header>

      {/* Modern Search Bar */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search items, categories..."
          className="block w-full pl-11 pr-12 py-4 bg-slate-900 border border-white/5 rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all font-medium input-mobile-fix"
        />

        {searchTerm && (
            <button 
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-white"
                aria-label="Clear search"
            >
                <X size={18} />
            </button>
        )}
      </div>

      {/* Category Filter Pills */}
      <div 
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto pb-2 no-scrollbar scroll-smooth"
      >
        <button
            onClick={() => setSelectedCategory(null)}
            className={`whitespace-nowrap px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                selectedCategory === null 
                ? 'bg-emerald-500 text-emerald-950 shadow-lg shadow-emerald-500/20' 
                : 'bg-slate-900 border border-white/5 text-slate-500'
            }`}
        >
            All Items
        </button>
        {categories.map(c => (
            <button
                key={c}
                onClick={() => setSelectedCategory(c === selectedCategory ? null : c)}
                className={`whitespace-nowrap px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    selectedCategory === c 
                    ? 'bg-emerald-500 text-emerald-950 shadow-lg shadow-emerald-500/20' 
                    : 'bg-slate-900 border border-white/5 text-slate-500'
                }`}
            >
                {c}
            </button>
        ))}
      </div>

      {/* Product List */}
      <div className="grid grid-cols-1 gap-4 pb-20">
        {filteredProducts.map((product) => (
          <div 
            key={product.id} 
            className="bg-slate-900 border border-white/5 rounded-3xl p-5 space-y-4 relative group overflow-hidden transition-all hover:bg-slate-800/80"
          >
            {/* Main Info Row */}
            <div className="flex gap-4">
              <div className="w-16 h-16 bg-slate-800 rounded-2xl border border-white/5 flex items-center justify-center relative overflow-hidden flex-shrink-0 group">
                  {product.image ? (
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                      <Package size={24} className="text-slate-700" />
                  )}
                  <div className="absolute top-0 left-0 bg-emerald-500 text-emerald-950 text-[6px] font-black px-1.5 py-0.5 rounded-br-lg uppercase tracking-tighter">
                      {product.category.substring(0, 3)}
                  </div>
              </div>
              
              <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <div className="min-w-0 pr-2">
                        <h3 className="text-lg font-bold text-slate-100 leading-tight truncate">{product.name}</h3>
                        <p className="text-xs text-slate-500 font-medium">{product.category}</p>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                        <button 
                            onClick={() => setEditingProduct(product)}
                            className="p-3 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-xl transition-all active:scale-75"
                            aria-label={`Edit ${product.name}`}
                        >
                            <Edit3 size={16}/>
                        </button>
                        <button 
                            onClick={() => setDeletingProduct(product)}
                            className="p-3 bg-slate-800 hover:bg-red-950/30 text-red-500/50 hover:text-red-500 rounded-xl transition-all active:scale-75"
                            aria-label={`Delete ${product.name}`}
                        >
                            <Trash2 size={16}/>
                        </button>
                    </div>
                  </div>
              </div>
            </div>

            {/* Metrics Bar */}
            <div className="flex justify-between items-end border-t border-white/5 pt-4">
               <div>
                  <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mb-1">In Stock</p>
                  <p className={`text-xl font-black leading-none ${product.currentStock <= product.reorderLimit ? 'text-red-500 animate-pulse' : 'text-emerald-400'}`}>
                    {product.currentStock}
                  </p>
               </div>
               <div className="text-right">
                  <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mb-1">MSRP</p>
                  <p className="text-xl font-black text-slate-100 leading-none">{formatKina(product.price)}</p>
               </div>
            </div>

            {/* Quick Details Chips */}
            <div className="flex gap-2 text-[8px] font-bold text-slate-600 uppercase tracking-wider">
               <span className="bg-white/5 px-2 py-1 rounded-lg">SKU: {product.sku || 'N/A'}</span>
               <span className="bg-white/5 px-2 py-1 rounded-lg flex-1 truncate">BC: {product.barcode}</span>
            </div>
          </div>
        ))}

        {filteredProducts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                <div className="p-8 bg-slate-900 rounded-[2.5rem] text-slate-800 border border-white/5">
                    <Search size={64} />
                </div>
                <div>
                   <p className="font-black text-slate-500 uppercase tracking-[0.2em]">No Items Found</p>
                   <p className="text-xs text-slate-600 font-bold mt-1 uppercase">Try a broader search or different category</p>
                </div>
            </div>
        )}
      </div>

      {/* Modals */}
      {editingProduct !== undefined && (
        <ProductEditor 
          product={editingProduct} 
          onClose={() => setEditingProduct(undefined)} 
        />
      )}

      {deletingProduct && (
        <div className="absolute inset-0 z-[60] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-slate-900 border border-white/10 rounded-[3rem] p-10 max-w-sm w-full shadow-2xl space-y-8 animate-in zoom-in-95 duration-300">
                <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mx-auto border border-red-500/20">
                    <Trash2 size={48} />
                </div>
                <div className="text-center space-y-3">
                    <h3 className="text-2xl font-black text-white uppercase tracking-tight">Confirm Delete?</h3>
                    <p className="text-slate-500 font-medium">
                        Are you sure about removing <span className="text-slate-200 font-bold">{deletingProduct.name}</span>? This action is permanent.
                    </p>
                </div>
                <div className="flex flex-col gap-3">
                    <button 
                        onClick={() => handleDelete(deletingProduct.id)}
                        className="w-full py-5 bg-red-600 hover:bg-red-500 text-white rounded-3xl font-black uppercase tracking-widest transition-all active:scale-95 shadow-xl shadow-red-500/20"
                    >
                        Delete Forever
                    </button>
                    <button 
                        onClick={() => setDeletingProduct(null)}
                        className="w-full py-5 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-3xl font-bold uppercase tracking-widest transition-all"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
