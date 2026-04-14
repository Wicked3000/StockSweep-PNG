import { useEffect, useState, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { toast } from 'sonner';
import { PackageX, ArchiveRestore, PackagePlus, ScanLine } from 'lucide-react';
import { useInventoryStore } from '../store';

type ScanMode = 'outbound' | 'inbound';

export function ScannerPage() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanMode, setScanMode] = useState<ScanMode>('outbound');
  const [flash, setFlash] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  
  const updateStock = useInventoryStore((state) => state.updateStock);
  const products = useInventoryStore((state) => state.products);
  
  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.start();
      gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 0.1);
      oscillator.stop(audioCtx.currentTime + 0.1);
    } catch (e) {
      console.log('Audio disabled or unsupported');
    }
  };

  const handleScanSuccess = async (decodedText: string) => {
    if (!scannerRef.current) return;
    
    // Pause briefly to prevent rapid double-scans
    scannerRef.current.pause(true);
    
    // Visual and haptic feedback
    setFlash(true);
    setTimeout(() => setFlash(false), 300);
    if ('vibrate' in navigator) navigator.vibrate([100, 50, 100]);
    playBeep();

    const product = products.find(p => p.barcode === decodedText);

    if (scanMode === 'outbound') {
      if (product) {
        updateStock(decodedText, -1);
        toast.success(`Scanned: ${product.name} (Qty: -1)`);
      } else {
        toast.error(`Unknown Barcode: ${decodedText}`);
      }
      setTimeout(() => scannerRef.current?.resume(), 1500);
    } else {
      // Inbound mode: Prompt for quantity
      toast.dismiss();
      const qtyStr = window.prompt(`Bulk Restock for ${product?.name || decodedText}\nEnter quantity received:`, "1");
      const qty = parseInt(qtyStr || '0', 10);
      
      if (!isNaN(qty) && qty > 0) {
         updateStock(decodedText, qty);
         toast.success(`Added ${qty} to ${product?.name || decodedText}`);
      } else {
         toast.info("Restock cancelled.");
      }
      scannerRef.current.resume();
    }
  };

  const startScanner = async () => {
    try {
      scannerRef.current = new Html5Qrcode("reader");
      await scannerRef.current.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        handleScanSuccess,
        undefined
      );
      setIsScanning(true);
    } catch (err) {
      console.error("Camera startup error:", err);
      toast.error("Could not start camera. Check permissions.");
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      await scannerRef.current.stop();
      setIsScanning(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  return (
    <div className={`relative flex flex-col h-full bg-slate-950 transition-colors duration-200 ${flash ? 'bg-emerald-500' : ''}`}>
      
      {/* Header & Modes */}
      <div className="absolute top-0 inset-x-0 z-20 flex flex-col items-center p-6 space-y-4 bg-gradient-to-b from-slate-950 to-transparent pt-safe">
        <div className="flex bg-slate-900/80 backdrop-blur rounded-2xl p-1 border border-slate-700/50 shadow-xl w-full max-w-sm">
          <button
            onClick={() => setScanMode('outbound')}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl text-sm font-bold transition-all ${
              scanMode === 'outbound'
                ? 'bg-emerald-500 text-emerald-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <PackageX size={18} />
            <span>Checkout</span>
          </button>
          <button
            onClick={() => setScanMode('inbound')}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl text-sm font-bold transition-all ${
              scanMode === 'inbound'
                ? 'bg-emerald-500 text-emerald-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <PackagePlus size={18} />
            <span>Restock</span>
          </button>
        </div>
      </div>

      {/* Scanner Viewport */}
      <div className="flex-1 flex flex-col items-center justify-center relative">
        <div 
          id="reader" 
          className="w-full h-full object-cover bg-slate-900 overflow-hidden min-h-[60vh]"
          aria-label="Barcode scanner view"
        />
        
        {/* Overlay instructions when not scanning */}
        {!isScanning && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm z-10">
            <button
              onClick={startScanner}
              className="bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold py-4 px-8 rounded-full shadow-[0_0_30px_rgba(16,185,129,0.3)] flex items-center space-x-3 transition-transform active:scale-95"
            >
              <ScanLine size={24} />
              <span className="text-lg">Start Camera</span>
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
