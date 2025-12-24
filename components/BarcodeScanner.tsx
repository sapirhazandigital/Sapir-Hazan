
import React, { useEffect, useRef } from 'react';
import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode';
import { X, Camera } from 'lucide-react';

interface Props {
  onScan: (decodedText: string) => void;
  onClose: () => void;
}

const BarcodeScanner: React.FC<Props> = ({ onScan, onClose }) => {
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    const html5QrCode = new Html5Qrcode("reader");
    scannerRef.current = html5QrCode;

    const config = { fps: 10, qrbox: { width: 250, height: 150 } };

    html5QrCode.start(
      { facingMode: "environment" },
      config,
      (decodedText) => {
        onScan(decodedText);
        html5QrCode.stop();
      },
      (errorMessage) => {
        // Just debug or ignore
      }
    ).catch(err => {
      console.error("Unable to start scanning", err);
    });

    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(e => console.error(e));
      }
    };
  }, [onScan]);

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-4">
      <div className="absolute top-6 right-6 z-[110]">
        <button 
          onClick={onClose}
          className="bg-white/10 hover:bg-white/20 p-3 rounded-full text-white transition-colors"
        >
          <X size={24} />
        </button>
      </div>

      <div className="w-full max-w-sm relative">
        <div id="reader" className="overflow-hidden rounded-3xl border-2 border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.5)]"></div>
        
        {/* Overlay laser effect */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-[250px] h-[150px] border-2 border-white/30 rounded-lg relative overflow-hidden">
                <div className="scanner-laser"></div>
            </div>
        </div>
      </div>

      <div className="mt-8 text-center text-white space-y-2">
        <div className="flex items-center justify-center gap-2 text-indigo-400">
            <Camera size={20} />
            <span className="font-bold">סורק פעיל</span>
        </div>
        <p className="text-sm text-slate-400">מקמו את הברקוד בתוך המסגרת</p>
      </div>
    </div>
  );
};

export default BarcodeScanner;
