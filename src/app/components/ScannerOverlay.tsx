import { useEffect, useState, useRef } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { X, Zap, ZapOff, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  onClose: () => void;
}

export function ScannerOverlay({ onScan, onClose }: BarcodeScannerProps) {
  const [isActive, setIsActive] = useState(false);
  const [flash, setFlash] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);


  const handleScanSuccess = (decodedText: string) => {
    // Visual and tactile feedback only (audio is handled by parent)
    setFlash(true);
    setTimeout(() => setFlash(false), 200);
    if ('vibrate' in navigator) navigator.vibrate(100);

    onScan(decodedText);
  };

  const startScanner = async () => {
    try {
      if (scannerRef.current?.isScanning) return;

      scannerRef.current = new Html5Qrcode("scanner-region", {
          formatsToSupport: [
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.UPC_A,
            Html5QrcodeSupportedFormats.EAN_8,
            Html5QrcodeSupportedFormats.UPC_E,
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.CODE_39,
            Html5QrcodeSupportedFormats.QR_CODE // Added QR code support just in case products use modern QR labels
          ]
      });

      const config = { 
        fps: 20, 
        qrbox: { width: 280, height: 180 },
        aspectRatio: 1.0
      };

      try {
        // First try the rear/environment camera (Tablets/Phones)
        await scannerRef.current.start({ facingMode: "environment" }, config, handleScanSuccess, undefined);
      } catch (err) {
        console.log("Environment camera not found, falling back to webcam...");
        // Fallback to front camera (Laptops/Desktop Webcams)
        await scannerRef.current.start({ facingMode: "user" }, config, handleScanSuccess, undefined);
      }

      // Attempt to enable continuous focus for better mobile scanning
      try {
        const track = scannerRef.current.getVideoTracks()[0];
        const capabilities = track.getCapabilities();
        if ((capabilities as any).focusMode?.includes('continuous')) {
          await scannerRef.current.applyVideoConstraints({
            focusMode: "continuous"
          } as any);
        }
      } catch (e) {
        console.log("Advanced focus constraints not supported on this device.");
      }

      setIsActive(true);
    } catch (err) {
      console.error("Scanner start failed:", err);
      toast.error("Camera access denied or device busy.");
      onClose();
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current?.isScanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current = null;
      } catch (e) {
        console.error("Scanner stop failed:", e);
      }
    }
  };

  useEffect(() => {
    startScanner();
    return () => {
      stopScanner();
    };
  }, []);

  return (
    <div className={`absolute inset-0 z-[100] bg-slate-950 flex flex-col transition-colors duration-200 ${flash ? 'bg-emerald-500' : ''}`}>
      {/* Header Overlay */}
      <div className="absolute top-0 inset-x-0 z-20 flex justify-between items-center p-6 bg-gradient-to-b from-slate-950/80 to-transparent">
        <div className="flex flex-col">
          <h2 className="text-white font-black text-lg uppercase tracking-tight">Bar Scanner</h2>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Center barcode in frame</p>
        </div>
        <button 
          onClick={onClose}
          className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl text-white transition-all active:scale-90"
          aria-label="Close scanner"
        >
          <X size={24} />
        </button>
      </div>

      {/* Main Scanner Area */}
      <div className="flex-1 relative overflow-hidden flex flex-col items-center justify-center">
        <div id="scanner-region" className="w-full h-full object-cover grayscale brightness-110" />
        
        {/* Fancy Scan Overlay Design */}
        <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center">
             <div className="w-[280px] h-[180px] border-2 border-white/20 rounded-3xl relative">
                  {/* Corners */}
                  <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-emerald-500 rounded-tl-xl shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                  <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-emerald-500 rounded-tr-xl shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                  <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-emerald-500 rounded-bl-xl shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-emerald-500 rounded-br-xl shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                  
                  {/* Laser Line */}
                  <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-emerald-500/50 shadow-[0_0_10px_#10b981] animate-pulse" />
             </div>
        </div>

        {!isActive && (
            <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4 bg-slate-950 z-30">
                <div className="animate-spin text-emerald-500">
                    <RotateCcw size={40} />
                </div>
                <p className="text-slate-500 font-bold uppercase text-xs tracking-widest">Initializing Camera...</p>
            </div>
        )}
      </div>

      {/* Footer controls */}
      <div className="absolute bottom-0 inset-x-0 p-8 flex justify-center space-x-6 z-20 bg-gradient-to-t from-slate-950/80 to-transparent">
          <button 
            className="p-4 bg-slate-900 border border-white/5 rounded-3xl text-slate-400 hover:text-white transition-all"
            aria-label="Toggle flash"
          >
              <ZapOff size={24} />
          </button>
      </div>
    </div>
  );
}
