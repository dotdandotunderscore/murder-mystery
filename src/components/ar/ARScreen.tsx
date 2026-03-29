/**
 * ARScreen.tsx
 *
 * Full-screen AR puzzle page type. Renders a camera view with marker tracking.
 * When the player points their phone at the physical marker, a 3D entity
 * appears and a confirmation button reveals the puzzle reward.
 *
 * All admin-configurable values come from game_config:
 *   - briefing_text: flavour text shown before opening the camera
 *   - marker_type: "hiro" (default) or "custom"
 *   - marker_url: path to .patt file (only used when marker_type is "custom")
 *   - hold_duration: seconds the marker must be held before reveal (0 = instant)
 *
 * See docs/ar system/AR_HANDOFF.md for physical setup and deployment notes.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useARScene } from "./useARScene";
import { useTradeContext } from "../../context/TradeContext";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ARScreenProps {
  pageId: number;
  gameConfig: Record<string, unknown> | null;
  grantsFlags: string[] | null;
  grantsWords: string[] | null;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ARBriefing({ text, onBegin }: { text: string; onBegin: () => void }) {
  return (
    <div className="border border-gold/25 bg-surface p-6 mb-6 text-center">
      <p className="text-cream/80 text-sm leading-relaxed mb-4 whitespace-pre-line">{text}</p>
      <button
        onClick={onBegin}
        className="border border-gold/40 text-gold px-6 py-2 text-xs tracking-[0.15em] uppercase hover:bg-gold/10 transition-colors"
      >
        Open Camera
      </button>
    </div>
  );
}

function ARLoading({ stage }: { stage: string }) {
  return (
    <div className="border border-gold/25 bg-surface p-6 mb-6 text-center">
      <p className="text-muted text-xs tracking-[0.1em]">{stage}</p>
    </div>
  );
}

function ARError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="border border-gold/25 bg-surface p-6 mb-6 text-center">
      <p className="text-cream/80 text-sm mb-3">{message}</p>
      <button
        onClick={onRetry}
        className="border border-gold/40 text-gold px-4 py-1.5 text-xs tracking-[0.1em] uppercase hover:bg-gold/10 transition-colors"
      >
        Try Again
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function ARScreen({ pageId, gameConfig, grantsFlags, grantsWords }: ARScreenProps) {
  const config = gameConfig ?? {};
  const briefingText = (config.briefing_text as string) || "Point your camera at the marker to reveal what's hidden.";
  const markerType = (config.marker_type as string) || "hiro";
  const markerUrl = (config.marker_url as string) || "";
  const holdDuration = (config.hold_duration as number) || 0;

  const { refreshInventory, refreshFlags } = useTradeContext();
  const [phase, setPhase] = useState<"briefing" | "ar" | "complete">("briefing");
  const [holdProgress, setHoldProgress] = useState(0);
  const [won, setWon] = useState(false);
  const holdStartRef = useRef<number | null>(null);
  const holdTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleMarkerFound = useCallback(() => {
    if (holdDuration > 0) {
      holdStartRef.current = Date.now();
      holdTimerRef.current = setInterval(() => {
        const elapsed = (Date.now() - holdStartRef.current!) / 1000;
        const progress = Math.min(elapsed / holdDuration, 1);
        setHoldProgress(progress);
        if (progress >= 1) {
          clearInterval(holdTimerRef.current!);
          holdTimerRef.current = null;
        }
      }, 100);
    } else {
      setHoldProgress(1);
    }
  }, [holdDuration]);

  const handleMarkerLost = useCallback(() => {
    if (holdTimerRef.current) {
      clearInterval(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    holdStartRef.current = null;
    if (holdProgress < 1) {
      setHoldProgress(0);
    }
  }, [holdProgress]);

  const { loadState, error, activate, deactivate, markerVisible } = useARScene({
    onReady: () => setPhase("ar"),
    onMarkerFound: handleMarkerFound,
    onMarkerLost: handleMarkerLost,
  });

  const handleBegin = () => activate();

  const handleConfirm = async () => {
    deactivate();
    setPhase("complete");
    setWon(true);
    await fetch(`/api/pages/${pageId}/claim`, { method: "POST" });
    refreshInventory();
    refreshFlags();
  };

  const handleExit = () => {
    deactivate();
    setPhase("briefing");
    setHoldProgress(0);
  };

  // Lock scroll while AR is active
  useEffect(() => {
    if (phase === "ar") {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [phase]);

  // Cleanup hold timer on unmount
  useEffect(() => {
    return () => {
      if (holdTimerRef.current) clearInterval(holdTimerRef.current);
    };
  }, []);

  // Already completed
  if (won) {
    return (
      <div className="border border-gold/40 bg-gold/5 p-5 mb-6">
        <p className="text-gold text-xs tracking-[0.35em] uppercase mb-3">— You Received —</p>
        {grantsWords && grantsWords.length > 0 && (
          <div className="mb-3">
            <p className="text-muted text-xs uppercase tracking-wide mb-2">Clues</p>
            <div className="flex flex-wrap gap-2">
              {grantsWords.map((w) => (
                <span key={w} className="bg-gold/10 border border-gold/30 text-gold text-xs px-2 py-1">{w}</span>
              ))}
            </div>
          </div>
        )}
        {grantsFlags && grantsFlags.length > 0 && (
          <div>
            <p className="text-muted text-xs uppercase tracking-wide mb-2">Progress</p>
            <div className="flex flex-wrap gap-2">
              {grantsFlags.map((f) => (
                <span key={f} className="bg-gold/10 border border-gold/30 text-gold text-xs px-2 py-1">{f}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Briefing
  if (phase === "briefing" && loadState === "idle") {
    return <ARBriefing text={briefingText} onBegin={handleBegin} />;
  }

  // Loading
  if (loadState === "loading-scripts") {
    return <ARLoading stage="Loading AR..." />;
  }
  if (loadState === "requesting-camera") {
    return <ARLoading stage="Allow camera access to proceed..." />;
  }

  // Error
  if (loadState === "error" && error) {
    return <ARError message={error} onRetry={handleBegin} />;
  }

  // Active AR scene — fullscreen takeover
  if (loadState === "ready") {
    const markerProps = markerType === "custom" && markerUrl
      ? { type: "pattern", url: markerUrl }
      : { preset: "hiro" };

    return (
      <div style={{ position: "fixed", inset: 0, zIndex: 1000 }}>
        <a-scene
          embedded
          arjs="sourceType: webcam; debugUIEnabled: false; detectionMode: mono_and_matrix; matrixCodeType: 3x3;"
          renderer="logarithmicDepthBuffer: true; antialias: true;"
          vr-mode-ui="enabled: false"
          loading-screen="enabled: false"
        >
          <a-entity light="type: ambient; color: #ffffff; intensity: 0.2" />

          <a-marker
            {...markerProps}
            smooth="true"
            smooth-count="10"
            smooth-tolerance="0.01"
          >
            {/* Nested wireframe polyhedra — rotating at different speeds */}
            <a-entity
              position="0 0.5 0"
              animation__breathe="property: position; from: 0 0.45 0; to: 0 0.55 0; dir: alternate; loop: true; dur: 3000; easing: easeInOutSine"
            >
              <a-entity
                geometry="primitive: icosahedron; radius: 0.32; detail: 0"
                material="color: #e8c87e; emissive: #e8c87e; emissiveIntensity: 0.6; wireframe: true; opacity: 0.5; transparent: true"
                animation="property: rotation; from: 0 0 0; to: 0 360 0; loop: true; dur: 14000; easing: linear"
              />
              <a-entity
                geometry="primitive: dodecahedron; radius: 0.26"
                material="color: #ff6600; emissive: #ff6600; emissiveIntensity: 0.75; wireframe: true; opacity: 0.65; transparent: true"
                rotation="45 0 20"
                animation="property: rotation; from: 45 0 20; to: 45 360 20; loop: true; dur: 9000; easing: linear"
              />
              <a-entity
                geometry="primitive: octahedron; radius: 0.20"
                material="color: #ff3300; emissive: #ff3300; emissiveIntensity: 0.85; wireframe: true; opacity: 0.8; transparent: true"
                animation="property: rotation; from: 0 0 0; to: 360 -360 0; loop: true; dur: 7000; easing: linear"
              />
              <a-entity
                geometry="primitive: tetrahedron; radius: 0.14"
                material="color: #cc0000; emissive: #cc0000; emissiveIntensity: 1; wireframe: true"
                rotation="30 0 30"
                animation="property: rotation; from: 30 0 30; to: 390 360 30; loop: true; dur: 4500; easing: linear"
              />
              <a-entity
                geometry="primitive: icosahedron; radius: 0.07; detail: 0"
                material="color: #ffddaa; emissive: #ffddaa; emissiveIntensity: 1; wireframe: true"
                animation="property: rotation; from: 0 0 0; to: -360 360 -360; loop: true; dur: 3000; easing: linear"
                animation__pulse="property: scale; from: 0.85 0.85 0.85; to: 1.15 1.15 1.15; dir: alternate; loop: true; dur: 800; easing: easeInOutSine"
              />
            </a-entity>
          </a-marker>

          <a-camera position="0 0 0" />
        </a-scene>

        {/* React UI overlay */}
        <div style={{ position: "absolute", inset: 0, zIndex: 10, pointerEvents: "none", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "1rem" }}>
          <button
            onClick={handleExit}
            style={{ alignSelf: "flex-end", pointerEvents: "all", background: "rgba(0,0,0,0.6)", border: "1px solid rgba(200,169,126,0.4)", color: "#c8a97e", padding: "0.5rem 1rem", fontSize: "0.85rem", cursor: "pointer", borderRadius: 2 }}
          >
            ✕ Close
          </button>

          <div style={{ pointerEvents: "all", textAlign: "center" }}>
            {!markerVisible && (
              <p style={{ background: "rgba(0,0,0,0.65)", color: "#b89a6e", fontSize: "0.85rem", padding: "0.6rem 1.2rem", display: "inline-block", borderRadius: 2, fontStyle: "italic" }}>
                Point camera at the marker
              </p>
            )}

            {markerVisible && holdProgress < 1 && (
              <div style={{ background: "rgba(0,0,0,0.8)", padding: "0.8rem 1.5rem", display: "inline-block", borderRadius: 2 }}>
                <p style={{ color: "#e8c87e", fontSize: "0.85rem", margin: "0 0 0.5rem" }}>Hold steady...</p>
                <div style={{ width: 200, height: 4, background: "rgba(255,255,255,0.15)", borderRadius: 2, margin: "0 auto" }}>
                  <div style={{ width: `${holdProgress * 100}%`, height: "100%", background: "#e8c87e", borderRadius: 2, transition: "width 0.1s" }} />
                </div>
              </div>
            )}

            {markerVisible && holdProgress >= 1 && (
              <div style={{ background: "rgba(10,0,0,0.9)", border: "1px solid #8B0000", padding: "1rem", borderRadius: 2 }}>
                <p style={{ color: "#e8c87e", fontSize: "0.9rem", margin: "0 0 0.75rem", letterSpacing: "0.1em" }}>
                  Marker detected
                </p>
                <button
                  onClick={handleConfirm}
                  style={{ background: "#8B0000", border: "none", color: "#e8c87e", padding: "0.65rem 1.5rem", fontSize: "0.85rem", letterSpacing: "0.12em", textTransform: "uppercase", cursor: "pointer" }}
                >
                  Claim Reward
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
