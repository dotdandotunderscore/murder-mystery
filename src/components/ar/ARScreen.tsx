/**
 * ARScreen.tsx
 *
 * AR puzzle page type using MindAR (Three.js mode).
 * Renders a camera view with image target tracking. When the player points
 * their phone at the physical target image, a 3D entity appears anchored
 * to it and a confirmation button lets them claim the reward.
 *
 * Admin-configurable values (game_config):
 *   - briefing_text: flavour text shown before opening the camera
 *   - mind_file_url: path to compiled .mind target file
 *   - hold_duration: seconds the target must be held before reveal (0 = instant)
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useARScene } from "./useARScene";
import { useTradeContext } from "../../context/TradeContext";

interface ARScreenProps {
  pageId: number;
  gameConfig: Record<string, unknown> | null;
  grantsFlags: string[] | null;
  grantsWords: string[] | null;
}

export default function ARScreen({ pageId, gameConfig, grantsFlags, grantsWords }: ARScreenProps) {
  const config = gameConfig ?? {};
  const briefingText = (config.briefing_text as string) || "Point your camera at the target to reveal what's hidden.";
  const mindFileUrl = (config.mind_file_url as string) || "/targets/default.mind";
  const holdDuration = (config.hold_duration as number) || 0;

  const { refreshInventory, refreshFlags } = useTradeContext();
  const containerRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<"briefing" | "ar" | "complete">("briefing");
  const [holdProgress, setHoldProgress] = useState(0);
  const [won, setWon] = useState(false);
  const holdStartRef = useRef<number | null>(null);
  const holdTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearHoldTimer = () => {
    if (holdTimerRef.current) {
      clearInterval(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    holdStartRef.current = null;
  };

  const handleTargetFound = useCallback(() => {
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

  const handleTargetLost = useCallback(() => {
    clearHoldTimer();
    setHoldProgress((prev) => (prev >= 1 ? prev : 0));
  }, []);

  const { loadState, error, activate, deactivate, targetVisible } = useARScene({
    containerRef,
    mindFileUrl,
    onTargetFound: handleTargetFound,
    onTargetLost: handleTargetLost,
  });

  const handleBegin = () => {
    setPhase("ar");
    // Small delay to ensure container is mounted before MindAR attaches
    setTimeout(() => activate(), 50);
  };

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
    return () => clearHoldTimer();
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
  if (phase === "briefing") {
    return (
      <div className="border border-gold/25 bg-surface p-6 mb-6 text-center">
        <p className="text-cream/80 text-sm leading-relaxed mb-4 whitespace-pre-line">{briefingText}</p>
        <button
          onClick={handleBegin}
          className="border border-gold/40 text-gold px-6 py-2 text-xs tracking-[0.15em] uppercase hover:bg-gold/10 transition-colors"
        >
          Open Camera
        </button>
      </div>
    );
  }

  // Active AR — fullscreen takeover
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "#000" }}>
      {/* MindAR renders into this container */}
      <div
        ref={containerRef}
        style={{ width: "100%", height: "100%", position: "relative" }}
      />

      {/* React UI overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 10,
          pointerEvents: "none",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "1rem",
        }}
      >
        <button
          onClick={handleExit}
          style={{
            alignSelf: "flex-end",
            pointerEvents: "all",
            background: "rgba(0,0,0,0.6)",
            border: "1px solid rgba(200,169,126,0.4)",
            color: "#c8a97e",
            padding: "0.5rem 1rem",
            fontSize: "0.85rem",
            cursor: "pointer",
            borderRadius: 2,
          }}
        >
          ✕ Close
        </button>

        <div style={{ pointerEvents: "all", textAlign: "center" }}>
          {loadState === "loading" && (
            <p
              style={{
                background: "rgba(0,0,0,0.65)",
                color: "#b89a6e",
                fontSize: "0.85rem",
                padding: "0.6rem 1.2rem",
                display: "inline-block",
                borderRadius: 2,
              }}
            >
              Starting camera...
            </p>
          )}

          {loadState === "error" && error && (
            <div
              style={{
                background: "rgba(0,0,0,0.85)",
                padding: "1rem",
                display: "inline-block",
                borderRadius: 2,
              }}
            >
              <p style={{ color: "#c8a97e", fontSize: "0.85rem", margin: "0 0 0.5rem" }}>{error}</p>
              <button
                onClick={() => activate()}
                style={{
                  background: "transparent",
                  border: "1px solid rgba(200,169,126,0.4)",
                  color: "#c8a97e",
                  padding: "0.4rem 1rem",
                  fontSize: "0.8rem",
                  cursor: "pointer",
                }}
              >
                Try Again
              </button>
            </div>
          )}

          {loadState === "ready" && !targetVisible && holdProgress < 1 && (
            <p
              style={{
                background: "rgba(0,0,0,0.65)",
                color: "#b89a6e",
                fontSize: "0.85rem",
                padding: "0.6rem 1.2rem",
                display: "inline-block",
                borderRadius: 2,
                fontStyle: "italic",
              }}
            >
              Point camera at the target
            </p>
          )}

          {loadState === "ready" && targetVisible && holdProgress < 1 && (
            <div
              style={{
                background: "rgba(0,0,0,0.8)",
                padding: "0.8rem 1.5rem",
                display: "inline-block",
                borderRadius: 2,
              }}
            >
              <p style={{ color: "#e8c87e", fontSize: "0.85rem", margin: "0 0 0.5rem" }}>
                Hold steady...
              </p>
              <div
                style={{
                  width: 200,
                  height: 4,
                  background: "rgba(255,255,255,0.15)",
                  borderRadius: 2,
                  margin: "0 auto",
                }}
              >
                <div
                  style={{
                    width: `${holdProgress * 100}%`,
                    height: "100%",
                    background: "#e8c87e",
                    borderRadius: 2,
                    transition: "width 0.1s",
                  }}
                />
              </div>
            </div>
          )}

          {loadState === "ready" && holdProgress >= 1 && (
            <div
              style={{
                background: "rgba(10,0,0,0.9)",
                border: "1px solid #8B0000",
                padding: "1rem",
                borderRadius: 2,
              }}
            >
              <p
                style={{
                  color: "#e8c87e",
                  fontSize: "0.9rem",
                  margin: "0 0 0.75rem",
                  letterSpacing: "0.1em",
                }}
              >
                Target detected
              </p>
              <button
                onClick={handleConfirm}
                style={{
                  background: "#8B0000",
                  border: "none",
                  color: "#e8c87e",
                  padding: "0.65rem 1.5rem",
                  fontSize: "0.85rem",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                }}
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
