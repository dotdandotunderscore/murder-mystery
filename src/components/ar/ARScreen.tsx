/**
 * ARScreen.tsx
 *
 * Inline AR puzzle component using MindAR (Three.js mode).
 * Auto-starts the camera on mount, like QRScanner does.
 *
 * Admin-configurable via game_config:
 *   - mind_file_url: path to compiled .mind target file
 *   - hold_duration: seconds target must be held before reveal (0 = instant)
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useARScene } from "./useARScene";
import { useTradeContext } from "../../context/TradeContext";

interface ARScreenProps {
  pageId: number;
  gameConfig: Record<string, unknown> | null;
  grantsFlags: string[] | null;
  grantsWords: string[] | null;
  onPendingDirt?: (dirt: string[]) => void;
}

export default function ARScreen({ pageId, gameConfig, grantsFlags, grantsWords, onPendingDirt }: ARScreenProps) {
  const config = gameConfig ?? {};
  const mindFileUrl = (config.mind_file_url as string) || "/targets/default.mind";
  const holdDuration = (config.hold_duration as number) || 0;
  const entityOffset = (config.entity_offset as string) || "0, 0, 0.5";
  const entityScale = (config.entity_scale as number) || 0.8;
  const arText = (config.ar_text as string) || "GLEAMING EYES,\nRESPOND?";

  const { refreshInventory, refreshFlags } = useTradeContext();
  const containerRef = useRef<HTMLDivElement>(null);
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

  const { loadState, error, targetVisible } = useARScene({
    containerRef,
    mindFileUrl,
    entityOffset,
    entityScale,
    arText,
    onTargetFound: handleTargetFound,
    onTargetLost: handleTargetLost,
  });

  const handleConfirm = async () => {
    setWon(true);
    const res = await fetch(`/api/pages/${pageId}/claim`, { method: "POST" });
    const data = await res.json().catch(() => ({}));
    refreshInventory();
    refreshFlags();
    if (data.pending_dirt?.length && onPendingDirt) onPendingDirt(data.pending_dirt);
  };

  useEffect(() => {
    return () => clearHoldTimer();
  }, []);

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

  return (
    <div className="border border-gold/25 bg-surface mb-6 overflow-hidden">
      {/* AR viewfinder — MindAR renders video + canvas into this div.
          MindAR positions its children with position:absolute, so this
          container must have explicit dimensions and relative positioning.
          aspect-[3/4] gives a phone-portrait shape. */}
      <div
        ref={containerRef}
        className="relative bg-black w-full overflow-hidden"
        style={{ aspectRatio: "3/4" }}
      />

      {/* Status / controls below the viewfinder */}
      <div className="p-4 text-center">
        {loadState === "loading" && (
          <p className="text-muted text-xs tracking-wide">Starting camera...</p>
        )}

        {loadState === "error" && (
          <p className="text-red-400 text-xs">{error}</p>
        )}

        {loadState === "ready" && !targetVisible && holdProgress < 1 && (
          <p className="text-muted text-xs tracking-wide italic">
            Point camera at the target
          </p>
        )}

        {loadState === "ready" && targetVisible && holdProgress < 1 && (
          <div>
            <p className="text-gold text-xs tracking-wide mb-2">Hold steady...</p>
            <div className="w-48 h-1 bg-white/10 rounded mx-auto">
              <div
                className="h-full bg-gold rounded transition-all duration-100"
                style={{ width: `${holdProgress * 100}%` }}
              />
            </div>
          </div>
        )}

        {loadState === "ready" && holdProgress >= 1 && (
          <button
            onClick={handleConfirm}
            className="bg-gold/20 border border-gold/40 text-gold px-6 py-2 text-xs tracking-[0.15em] uppercase hover:bg-gold/30 transition-colors"
          >
            Claim Reward
          </button>
        )}
      </div>
    </div>
  );
}
