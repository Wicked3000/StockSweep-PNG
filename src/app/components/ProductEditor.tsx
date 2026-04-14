import { useState, useEffect, useRef } from 'react';
import { X, ScanLine, Save, Package, Camera, Trash2, Plus } from 'lucide-react';
import { Product, useInventoryStore } from '../store';
import { ScannerOverlay } from './ScannerOverlay';
import { toast } from 'sonner';
import { playScannerBeep } from '../utils/audio';

interface ProductEditorProps {
  product?: Product | null;
  onClose: () => void;
}

export function ProductEditor({ product, onClose }: ProductEditorProps) {
  const { addProduct, updateProduct, categories, addCategory } = useInventoryStore();
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [showAddCat, setShowAddCat] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    barcode: '',
    sku: '',
    category: categories[0] || 'Groceries',
    price: 0,
    costPrice: 0,
    currentStock: 0,
    reorderLimit: 5,
    image: undefined
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        barcode: product.barcode,
        sku: product.sku,
        category: product.category,
        price: product.price,
        costPrice: product.costPrice,
        currentStock: product.currentStock,
        reorderLimit: product.reorderLimit,
        image: product.image
      });
    }
  }, [product]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Simple canvas compression
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 400;
        const scale = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scale;
        
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
        setFormData({ ...formData, image: compressedBase64 });
        toast.success("Photo optimized and added");
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleAddCategory = async () => {
    if (!newCatName.trim()) return;
    try {
        await addCategory(newCatName.trim());
        setFormData({ ...formData, category: newCatName.trim() });
        setNewCatName('');
        setShowAddCat(false);
        toast.success(`Category "${newCatName}" created`);
    } catch (err: any) {
        toast.error(`Failed to create category: ${err.message}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
        if (product) {
          await updateProduct(product.id, formData);
          toast.success(`Updated ${formData.name}`);
        } else {
          const newProduct: Product = {
            ...formData as Product,
            id: Math.random().toString(36).substr(2, 9),
          };
          await addProduct(newProduct);
          toast.success(`Added ${formData.name} to inventory`);
        }
        onClose();
    } catch (err: any) {
        toast.error(`Save failed: ${err.message}`);
    }
  };

  return (
    <div className="absolute inset-0 z-50 flex flex-col bg-slate-950 animate-in fade-in zoom-in-95 duration-300">
      <header className="flex justify-between items-center p-6 bg-slate-900 border-b border-white/5">
        <div>
          <h2 className="text-xl font-black text-white uppercase tracking-tight">
            {product ? 'Edit Product' : 'New Product'}
          </h2>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Enterprise Inventory PNG</p>
        </div>
        <button 
          onClick={onClose} 
          className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-slate-400"
          aria-label="Close editor"
        >
          <X size={24} />
        </button>
      </header>

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-8 scroll-smooth">
        {/* Image Section */}
        <div className="flex flex-col items-center space-y-4">
             <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-40 h-40 bg-slate-900 rounded-[2.5rem] border-2 border-dashed border-white/10 flex flex-col items-center justify-center text-slate-600 hover:text-emerald-400 hover:border-emerald-500/50 transition-all cursor-pointer relative overflow-hidden group shadow-2xl"
             >
                 {formData.image ? (
                     <img src={formData.image} alt="Preview" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                 ) : (
                     <>
                        <Camera size={40} />
                        <span className="text-[10px] font-bold uppercase tracking-widest mt-2">Add Photo</span>
                     </>
                 )}
                 {formData.image && (
                     <button 
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            setFormData({ ...formData, image: undefined });
                        }}
                        className="absolute bottom-2 right-2 p-2 bg-red-600 text-white rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Remove image"
                        title="Remove image"
                     >
                         <Trash2 size={16} />
                     </button>
                 )}
             </div>
             <input 
                ref={fileInputRef}
                type="file" 
                accept="image/*" 
                capture="environment"
                className="hidden" 
                onChange={handleImageUpload}
                aria-label="Upload product image"
                title="Upload image"
             />
             <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Tap to snap or upload</p>
        </div>

        <div className="space-y-6 max-w-lg mx-auto pb-10">
          {/* Barcode Section */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1">Barcode / EAN</label>
            <div className="flex gap-3">
              <input
                required
                type="text"
                value={formData.barcode}
                onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                className="flex-1 bg-slate-900 border border-white/5 rounded-2xl p-4 text-white focus:ring-2 focus:ring-emerald-500/50 outline-none font-bold"
                placeholder="0000000000000"
                aria-label="Barcode"
              />
              <button
                type="button"
                onClick={() => setIsScannerOpen(true)}
                className="p-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl shadow-lg active:scale-95 transition-all"
                aria-label="Scan barcode"
              >
                <ScanLine size={24} />
              </button>
            </div>
          </div>

          {/* Name & SKU */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1">Product Name</label>
              <input
                required
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-900 border border-white/5 rounded-2xl p-4 text-white focus:ring-2 focus:ring-emerald-500/50 outline-none font-bold"
                placeholder="e.g. Ramu Sugar 1kg"
              />
            </div>
          </div>

          {/* Dynamic Categories */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1 flex justify-between">
                <span>Category</span>
                <button 
                    type="button" 
                    onClick={() => setShowAddCat(!showAddCat)}
                    className="text-emerald-500 hover:text-emerald-400 flex items-center gap-1"
                >
                    <Plus size={10} strokeWidth={4} /> {showAddCat ? 'Cancel' : 'New Category'}
                </button>
            </label>
            
            {!showAddCat ? (
                <div className="relative group">
                    <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full bg-slate-900 border border-white/5 rounded-2xl p-4 text-slate-300 focus:ring-2 focus:ring-emerald-500/50 outline-none font-bold appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%20stroke%3D%22currentColor%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:20px] bg-[right_1rem_center] bg-no-repeat"
                        aria-label="Product category"
                    >
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
            ) : (
                <div className="flex gap-2 animate-in slide-in-from-left-2 duration-300">
                    <input
                        type="text"
                        value={newCatName}
                        onChange={(e) => setNewCatName(e.target.value)}
                        className="flex-1 bg-slate-900 border-2 border-emerald-500/30 rounded-2xl p-4 text-white outline-none font-bold"
                        placeholder="Cat Name..."
                        autoFocus
                    />
                    <button
                        type="button"
                        onClick={handleAddCategory}
                        className="p-4 bg-emerald-600 text-white rounded-2xl font-bold"
                    >
                        Add
                    </button>
                </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1">SKU</label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className="w-full bg-slate-900 border border-white/5 rounded-2xl p-4 text-white focus:ring-2 focus:ring-emerald-500/50 outline-none font-mono text-sm uppercase"
                placeholder="SKU-XXX"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1 text-center block text-blue-400">Cost (K)</label>
              <input
                required
                type="number"
                step="0.10"
                value={formData.costPrice}
                onChange={(e) => setFormData({ ...formData, costPrice: parseFloat(e.target.value) })}
                className="w-full bg-slate-900 border border-blue-500/20 rounded-2xl p-4 text-center text-xl font-black text-blue-400 outline-none focus:ring-2 focus:ring-blue-500/50"
                placeholder="Buying Price"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1 text-center block text-emerald-500">Sell Price (K)</label>
              <input
                required
                type="number"
                step="0.10"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                className="w-full bg-slate-900 border border-emerald-500/20 rounded-2xl p-4 text-center text-xl font-black text-emerald-400 outline-none focus:ring-2 focus:ring-emerald-500/50"
                placeholder="Sale Price"
              />
            </div>
          </div>

          <div className="bg-slate-900/50 border border-white/5 p-6 rounded-3xl space-y-6">
               <div className="grid grid-cols-2 gap-6 pt-4 border-t border-white/5">
                    <div className="space-y-2 text-center">
                        <label htmlFor="currentStock" className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Stock Level</label>
                        <input
                            id="currentStock"
                            type="number"
                            value={formData.currentStock}
                            onChange={(e) => setFormData({ ...formData, currentStock: parseInt(e.target.value) })}
                            className="w-full bg-transparent border-none text-center text-2xl font-black text-white outline-none"
                            placeholder="0"
                        />
                    </div>
                    <div className="space-y-2 text-center">
                        <label htmlFor="reorderLimit" className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Reorder Threshold</label>
                        <input
                            id="reorderLimit"
                            type="number"
                            value={formData.reorderLimit}
                            onChange={(e) => setFormData({ ...formData, reorderLimit: parseInt(e.target.value) })}
                            className="w-full bg-transparent border-none text-center text-2xl font-black text-red-500/70 outline-none"
                            placeholder="5"
                        />
                    </div>
               </div>
          </div>

          <button
            type="submit"
            className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-lg font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-3 border border-emerald-400/30 mt-6"
          >
            <Save size={20} />
            <span>{product ? 'Save Changes' : 'Create Product'}</span>
          </button>
        </div>
      </form>

      {isScannerOpen && (
        <ScannerOverlay
          onScan={(barcode) => {
            playScannerBeep();
            setFormData({ ...formData, barcode });
            setIsScannerOpen(false);
            toast.success("Barcode Captured!");
          }}
          onClose={() => setIsScannerOpen(false)}
        />
      )}
    </div>
  );
}
