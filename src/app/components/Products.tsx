import { useState, useRef, useEffect } from 'react';
import { useInventory } from '../hooks/useInventory';
import { Plus, Edit2, Trash2, X, Camera } from 'lucide-react';
import { toast } from 'sonner';
import { ImageCapture } from './ImageCapture';
import { BrowserMultiFormatReader } from '@zxing/library';

export function Products() {
  const { products, addProduct, updateProduct, deleteProduct } = useInventory();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [scanningBarcode, setScanningBarcode] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    barcode: '',
    sku: '',
    currentStock: '0',
    minStock: '5',
    unitPrice: '0',
    category: '',
    imageUrl: '',
  });

  const resetForm = () => {
    setFormData({
      name: '',
      barcode: '',
      sku: '',
      currentStock: '0',
      minStock: '5',
      unitPrice: '0',
      category: '',
      imageUrl: '',
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      toast.error('Product name is required');
      return;
    }

    const productData = {
      name: formData.name,
      barcode: formData.barcode || undefined,
      sku: formData.sku || undefined,
      currentStock: parseInt(formData.currentStock) || 0,
      minStock: parseInt(formData.minStock) || 5,
      unitPrice: parseFloat(formData.unitPrice) || 0,
      category: formData.category || undefined,
      imageUrl: formData.imageUrl || undefined,
    };

    if (editingId) {
      updateProduct(editingId, productData);
      toast.success('Product updated');
    } else {
      addProduct(productData);
      toast.success('Product added');
    }

    resetForm();
  };

  const handleEdit = (product: typeof products[0]) => {
    setFormData({
      name: product.name,
      barcode: product.barcode || '',
      sku: product.sku || '',
      currentStock: product.currentStock.toString(),
      minStock: product.minStock.toString(),
      unitPrice: product.unitPrice.toString(),
      category: product.category || '',
      imageUrl: product.imageUrl || '',
    });
    setEditingId(product.id);
    setShowForm(true);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Delete ${name}?`)) {
      deleteProduct(id);
      toast.success('Product deleted');
    }
  };

  const startBarcodeScanning = async () => {
    setScanningBarcode(true);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast.error('Camera not supported on this device');
        setScanningBarcode(false);
        return;
      }

      codeReaderRef.current = new BrowserMultiFormatReader();
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();

        codeReaderRef.current.decodeFromVideoDevice(undefined, videoRef.current, (result, error) => {
          if (result) {
            const barcode = result.getText();
            setFormData({ ...formData, barcode });
            toast.success(`Barcode scanned: ${barcode}`);
            stopBarcodeScanning();
          }
        });
      }
    } catch (error: any) {
      console.error('Camera error:', error);
      setScanningBarcode(false);

      if (error.name === 'NotAllowedError') {
        toast.error('Camera permission denied. Please allow camera access.');
      } else if (error.name === 'NotFoundError') {
        toast.error('No camera found on this device');
      } else if (error.name === 'NotReadableError') {
        toast.error('Camera is in use by another app');
      } else {
        toast.error('Cannot access camera');
      }
    }
  };

  const stopBarcodeScanning = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    if (codeReaderRef.current) {
      codeReaderRef.current.reset();
    }
    setScanningBarcode(false);
  };

  useEffect(() => {
    return () => stopBarcodeScanning();
  }, []);

  return (
    <div className="pb-20 px-4 pt-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white p-2 rounded-lg"
        >
          <Plus size={20} />
        </button>
      </div>

      {scanningBarcode && (
        <div className="absolute inset-0 bg-black z-[60] flex flex-col">
          <video ref={videoRef} className="flex-1 w-full object-cover" />
          <div className="bg-black p-4">
            <p className="text-white text-center mb-2">Scan Product Barcode</p>
            <button
              onClick={stopBarcodeScanning}
              className="w-full bg-white text-black py-3 rounded-lg font-semibold"
            >
              Cancel Scan
            </button>
          </div>
        </div>
      )}

      {showForm && (
        <div className="absolute inset-0 bg-black bg-opacity-50 z-50 flex items-end">
          <div className="bg-white w-full rounded-t-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {editingId ? 'Edit Product' : 'Add Product'}
              </h2>
              <button onClick={resetForm} className="p-2">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <ImageCapture
                currentImage={formData.imageUrl}
                onImageCapture={(imageData) => setFormData({ ...formData, imageUrl: imageData })}
              />

              <div>
                <label className="block text-sm font-medium mb-1">Product Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Barcode</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.barcode}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg"
                    placeholder="Optional"
                  />
                  <button
                    type="button"
                    onClick={startBarcodeScanning}
                    className="bg-gray-900 text-white px-4 py-3 rounded-lg"
                  >
                    <Camera size={20} />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">SKU</label>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  placeholder="Optional"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  placeholder="e.g. Beverages, Snacks"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Current Stock</label>
                  <input
                    type="number"
                    value={formData.currentStock}
                    onChange={(e) => setFormData({ ...formData, currentStock: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Min Stock Alert</label>
                  <input
                    type="number"
                    value={formData.minStock}
                    onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Unit Price (Kina)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.unitPrice}
                  onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  min="0"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold"
              >
                {editingId ? 'Update Product' : 'Add Product'}
              </button>
            </form>
          </div>
        </div>
      )}

      {products.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="mb-4">No products yet</p>
          <button
            onClick={() => setShowForm(true)}
            className="text-blue-600 font-semibold"
          >
            Add your first product
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white border border-gray-200 rounded-lg p-4"
            >
              <div className="flex gap-3 mb-3">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                  />
                ) : (
                  <div className="w-20 h-20 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 text-xs">
                    No image
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{product.name}</h3>
                  {product.category && (
                    <p className="text-sm text-gray-600">{product.category}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(product)}
                    className="p-2 text-blue-600"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(product.id, product.name)}
                    className="p-2 text-red-600"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Stock</p>
                  <p className={`font-bold ${product.currentStock <= product.minStock ? 'text-red-600' : 'text-green-600'}`}>
                    {product.currentStock}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Price</p>
                  <p className="font-bold">K{product.unitPrice.toFixed(2)}</p>
                </div>
              </div>

              {(product.sku || product.barcode) && (
                <div className="mt-2 pt-2 border-t text-xs text-gray-500">
                  {product.sku && <span>SKU: {product.sku}</span>}
                  {product.sku && product.barcode && <span className="mx-2">•</span>}
                  {product.barcode && <span>Barcode: {product.barcode}</span>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
