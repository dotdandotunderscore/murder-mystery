import React, { useState, useEffect, useCallback } from "react";
import { usePlayer } from "../context/PlayerContext";

interface LeaderboardEntry {
  id: number;
  name: string;
  dirt_count: number;
}

export default function LeaderboardView() {
  const { player } = usePlayer();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    fetch("/api/dirt/leaderboard")
      .then((r) => r.json())
      .then((data) => { setEntries(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  // Re-fetch on WebSocket leaderboard_updated (listen via BroadcastChannel or just poll)
  useEffect(() => {
    const interval = setInterval(refresh, 10000);
    return () => clearInterval(interval);
  }, [refresh]);

  if (loading) return <p className="text-muted text-xs animate-pulse">Loading standings...</p>;
  if (entries.length === 0) return <p className="text-muted text-xs">No mobsters found.</p>;

  return (
    <div className="border border-gold/30 bg-surface-2 p-5 mb-6">
      <p className="text-gold text-xs tracking-[0.35em] uppercase mb-4">
        — Family Standings —
      </p>
      <div className="space-y-2">
        {entries.map((entry, i) => {
          const isMe = entry.id === player?.id;
          return (
            <div
              key={entry.id}
              className={`flex items-center justify-between px-4 py-3 border ${
                isMe ? "border-gold/40 bg-gold/5" : "border-muted/15"
              }`}
            >
              <span className="flex items-center gap-3">
                <span className="text-gold text-sm font-mono w-6">{i + 1}.</span>
                <span className={`text-sm ${isMe ? "text-gold" : "text-cream"}`}>
                  {entry.name}{isMe ? " (you)" : ""}
                </span>
              </span>
              <span className={`text-xs font-mono ${entry.dirt_count === 0 ? "text-green-400/70" : "text-red-400/70"}`}>
                {entry.dirt_count === 0 ? "Clean" : `${entry.dirt_count} ${entry.dirt_count === 1 ? "rumour" : "rumours"}`}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
