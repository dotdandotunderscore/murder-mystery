import React, { useState, useEffect } from "react";
import { usePlayer } from "../context/PlayerContext";

interface LeaderboardEntry {
  id: number;
  name: string;
  dirt_count: number;
}

interface DirtSendOverlayProps {
  /** The rumour strings the player must fire at targets, one at a time */
  pendingDirt: string[];
  /** Called when all dirt has been sent */
  onComplete: () => void;
}

export default function DirtSendOverlay({ pendingDirt, onComplete }: DirtSendOverlayProps) {
  const { player } = usePlayer();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  const currentRumour = pendingDirt[currentIndex];

  useEffect(() => {
    fetch("/api/dirt/leaderboard")
      .then((r) => r.json())
      .then((data) => { setLeaderboard(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [currentIndex]);

  const handleSend = async (targetId: number) => {
    if (sending || !currentRumour) return;
    setSending(true);
    try {
      const res = await fetch("/api/dirt/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rumour: currentRumour, target_id: targetId }),
      });
      if (res.ok) {
        const nextIndex = currentIndex + 1;
        if (nextIndex >= pendingDirt.length) {
          onComplete();
        } else {
          setCurrentIndex(nextIndex);
        }
      }
    } catch { /* ignore */ }
    setSending(false);
  };

  const targets = leaderboard.filter((e) => e.id !== player?.id);

  return (
    <div className="fixed inset-0 z-50">
      <div className="fixed inset-0 bg-ink/90" />

      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center py-8 px-4">
          <div className="relative bg-surface-3 border border-red-500/40 w-full sm:max-w-sm z-10 animate-fade-in">
            {/* Header */}
            <div className="border-b border-red-500/20 px-6 py-4 text-center">
              <p className="text-red-400 text-xs tracking-[0.35em] uppercase mb-2">
                Rumour Acquired
              </p>
              <p className="text-red-300 text-sm font-mono tracking-wide">
                {currentRumour}
              </p>
              {pendingDirt.length > 1 && (
                <p className="text-muted text-xs mt-1">
                  {currentIndex + 1} of {pendingDirt.length}
                </p>
              )}
            </div>

            {/* Instruction */}
            <div className="px-6 py-3 border-b border-red-500/10">
              <p className="text-muted text-xs text-center">
                Pick a target. The dirt sticks.
              </p>
            </div>

            {/* Leaderboard + Target picker */}
            <div className="px-6 py-4">
              {loading ? (
                <p className="text-muted text-xs text-center animate-pulse">Loading...</p>
              ) : targets.length === 0 ? (
                <p className="text-muted text-xs text-center">No other mobsters found</p>
              ) : (
                <div className="space-y-2">
                  {targets.map((target, i) => (
                    <button
                      key={target.id}
                      onClick={() => handleSend(target.id)}
                      disabled={sending}
                      className="w-full flex items-center justify-between px-4 py-3 border border-muted/20 hover:border-red-400/50 hover:bg-red-500/5 transition-colors disabled:opacity-40"
                    >
                      <span className="flex items-center gap-3">
                        <span className="text-muted text-xs w-4">{i + 1}.</span>
                        <span className="text-cream text-sm">{target.name}</span>
                      </span>
                      <span className="text-red-400/70 text-xs font-mono">
                        {target.dirt_count} {target.dirt_count === 1 ? "rumour" : "rumours"}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
