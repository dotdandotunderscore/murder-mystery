import { useEffect, useRef, useState } from "react";
import { BrowserQRCodeReader } from "@zxing/browser";
import { X } from "lucide-react";

interface Props {
  /** Return true on success (scanner stays stopped), false on failure (scanner restarts). */
  onScan: (value: string) => Promise<boolean>;
  onClose: () => void;
  /** Render as an embedded block instead of a full-screen modal */
  inline?: boolean;
}

export default function QRScanner({ onScan, onClose, inline = false }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<{ stop: () => void } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rotated, setRotated] = useState(false);
  const [restartKey, setRestartKey] = useState(0);

  useEffect(() => {
    const reader = new BrowserQRCodeReader();

    reader
      .decodeFromConstraints(
        { video: { facingMode: "environment" } },
        videoRef.current!,
        (result, _err, controls) => {
          controlsRef.current = controls;
          if (!result) return;
          const text = result.getText();
          controls.stop();
          onScan(text).then((success) => {
            if (!success) setRestartKey((k) => k + 1);
          });
        }
      )
      .catch(() => {
        setError("Camera access denied or unavailable.");
      });

    return () => {
      controlsRef.current?.stop();
    };
  }, [restartKey]);

  const handleLoadedMetadata = () => {
    const v = videoRef.current;
    if (v && v.videoWidth > v.videoHeight) {
      setNeedsRotation(true);
    }
  };

  function setNeedsRotation(val: boolean) {
    setRotated(val);
  }

  const viewfinder = (
    <div className="relative bg-black border border-gold/30 overflow-hidden aspect-square">
      <video
        ref={videoRef}
        onLoadedMetadata={handleLoadedMetadata}
        className={`w-full h-full object-cover${rotated ? " rotate-90" : ""}`}
        autoPlay
        muted
        playsInline
      />
      {!error && (
        <>
          <span className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-gold" />
          <span className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-gold" />
          <span className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-gold" />
          <span className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-gold" />
        </>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
          <p className="text-danger text-sm">{error}</p>
        </div>
      )}
    </div>
  );

  if (inline) {
    return (
      <div className="w-full max-w-xs mx-auto">
        {viewfinder}
        <p className="text-muted text-xs text-center mt-3 tracking-wide">
          Point at a QR code to scan
        </p>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/90"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-gold text-xs tracking-[0.25em] uppercase">
            Scan Code
          </span>
          <button
            onClick={onClose}
            className="text-muted hover:text-cream transition-colors"
            aria-label="Close scanner"
          >
            <X size={18} />
          </button>
        </div>
        {viewfinder}
        <p className="text-muted text-xs text-center mt-3 tracking-wide">
          Point at a QR code to scan
        </p>
      </div>
    </div>
  );
}
