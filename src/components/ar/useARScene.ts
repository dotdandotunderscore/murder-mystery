import { useEffect, useRef, useState } from "react";

// AR.js and A-Frame must be loaded as external scripts rather than bundled.
// A-Frame registers custom HTML elements globally on load; if it's bundled into
// a module it can race with React's DOM hydration and break custom element
// recognition. Loading order matters: A-Frame first, then AR.js.
const AFRAME_CDN = "https://aframe.io/releases/1.5.0/aframe.min.js";
const ARJS_CDN =
  "https://raw.githack.com/AR-js-org/AR.js/master/aframe/build/aframe-ar.js";

export type ARLoadState =
  | "idle"
  | "loading-scripts"
  | "requesting-camera"
  | "ready"
  | "error";

export interface UseARSceneOptions {
  /** Called once the AR scene is fully initialised and tracking */
  onReady?: () => void;
  /** Called when the marker comes into view */
  onMarkerFound?: () => void;
  /** Called when the marker leaves the frame */
  onMarkerLost?: () => void;
}

interface UseARSceneReturn {
  loadState: ARLoadState;
  error: string | null;
  /** Imperatively activate the AR scene (call on user gesture) */
  activate: () => void;
  /** Tear down the scene and release the camera */
  deactivate: () => void;
  markerVisible: boolean;
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = false; // preserve load order
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(script);
  });
}

export function useARScene(options: UseARSceneOptions = {}): UseARSceneReturn {
  const { onReady, onMarkerFound, onMarkerLost } = options;

  const [loadState, setLoadState] = useState<ARLoadState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [markerVisible, setMarkerVisible] = useState(false);

  const streamRef = useRef<MediaStream | null>(null);
  const activeRef = useRef(false);

  const activate = async () => {
    if (activeRef.current) return;
    activeRef.current = true;
    setError(null);

    try {
      // 1. Load A-Frame then AR.js (order is critical)
      setLoadState("loading-scripts");
      await loadScript(AFRAME_CDN);
      await loadScript(ARJS_CDN);

      // 2. Request camera permission explicitly so we can give a friendly error
      setLoadState("requesting-camera");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      streamRef.current = stream;

      setLoadState("ready");
      onReady?.();
    } catch (err) {
      activeRef.current = false;
      const message =
        err instanceof Error ? err.message : "Unknown error starting AR";
      const friendlyMessage = message.includes("Permission")
        ? "Camera permission denied. Please allow camera access and try again."
        : `Could not start AR scene: ${message}`;
      setError(friendlyMessage);
      setLoadState("error");
    }
  };

  const deactivate = () => {
    activeRef.current = false;

    // Stop all camera tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }

    // AR.js injects a <video> element directly into <body>; remove it
    document
      .querySelectorAll("video[autoplay]")
      .forEach((v) => v.parentNode?.removeChild(v));

    setLoadState("idle");
    setMarkerVisible(false);
  };

  // Attach marker event listeners once the scene is ready
  useEffect(() => {
    if (loadState !== "ready") return;

    const pollForMarker = setInterval(() => {
      const marker = document.querySelector("a-marker");
      if (!marker) return;

      clearInterval(pollForMarker);

      const handleFound = () => {
        setMarkerVisible(true);
        onMarkerFound?.();
      };
      const handleLost = () => {
        setMarkerVisible(false);
        onMarkerLost?.();
      };

      marker.addEventListener("markerFound", handleFound);
      marker.addEventListener("markerLost", handleLost);

      return () => {
        marker.removeEventListener("markerFound", handleFound);
        marker.removeEventListener("markerLost", handleLost);
      };
    }, 200);

    return () => clearInterval(pollForMarker);
  }, [loadState, onMarkerFound, onMarkerLost]);

  // Deactivate on unmount
  useEffect(() => {
    return () => {
      if (activeRef.current) deactivate();
    };
  }, []);

  return { loadState, error, activate, deactivate, markerVisible };
}
