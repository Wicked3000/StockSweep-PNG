import { useState, useRef } from 'react';
import { Camera, Upload, X } from 'lucide-react';
import { toast } from 'sonner';

interface ImageCaptureProps {
  onImageCapture: (imageData: string) => void;
  currentImage?: string;
}

export function ImageCapture({ onImageCapture, currentImage }: ImageCaptureProps) {
  const [showCamera, setShowCamera] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setShowCamera(true);
      setShowOptions(false);
    } catch (error: any) {
      console.error('Camera error:', error);
      if (error.name === 'NotAllowedError') {
        toast.error('Camera permission denied');
      } else {
        toast.error('Cannot access camera');
      }
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(videoRef.current, 0, 0);
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    onImageCapture(imageData);
    stopCamera();
    toast.success('Photo captured');
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image too large. Max 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = e.target?.result as string;
      onImageCapture(imageData);
      setShowOptions(false);
      toast.success('Image uploaded');
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    onImageCapture('');
    toast.success('Image removed');
  };

  return (
    <div>
      {showCamera && (
        <div className="absolute inset-0 bg-black z-50 flex flex-col">
          <video ref={videoRef} className="flex-1 w-full object-cover" />
          <div className="bg-black p-4 flex gap-2">
            <button
              onClick={stopCamera}
              className="flex-1 bg-gray-600 text-white py-3 rounded-lg font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={capturePhoto}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold"
            >
              Capture
            </button>
          </div>
        </div>
      )}

      {showOptions && (
        <div className="absolute inset-0 bg-black bg-opacity-50 z-40 flex items-end" onClick={() => setShowOptions(false)}>
          <div className="bg-white w-full rounded-t-2xl p-4" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={startCamera}
              className="w-full bg-gray-900 text-white py-4 rounded-lg flex items-center justify-center gap-2 font-semibold mb-2"
            >
              <Camera size={20} />
              Take Photo
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full bg-blue-600 text-white py-4 rounded-lg flex items-center justify-center gap-2 font-semibold mb-2"
            >
              <Upload size={20} />
              Upload from Gallery
            </button>
            <button
              onClick={() => setShowOptions(false)}
              className="w-full bg-gray-200 py-4 rounded-lg font-semibold"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {currentImage ? (
        <div className="relative">
          <img
            src={currentImage}
            alt="Product"
            className="w-full h-48 object-cover rounded-lg border border-gray-300"
          />
          <div className="absolute top-2 right-2 flex gap-2">
            <button
              onClick={() => setShowOptions(true)}
              className="bg-blue-600 text-white p-2 rounded-lg shadow-lg"
            >
              <Camera size={18} />
            </button>
            <button
              onClick={removeImage}
              className="bg-red-600 text-white p-2 rounded-lg shadow-lg"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowOptions(true)}
          className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-2 text-gray-500 hover:border-blue-500 hover:text-blue-500 transition-colors"
        >
          <Camera size={32} />
          <span className="font-medium">Add Product Image</span>
          <span className="text-sm">Take photo or upload</span>
        </button>
      )}
    </div>
  );
}
