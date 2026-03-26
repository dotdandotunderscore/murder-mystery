import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { getErrorMessage } from "./shared";
import type { Progress } from "./types";

// ── Progress Panel ─────────────────────────────────────────────────────────────

export function ProgressPanel() {
  const [progress, setProgress] = useState<Progress[]>([]);
  const [loading, setLoading] = useState(false);
  const [confirmReset, setConfirmReset] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/progress");
    if (res.ok) setProgress(await res.json());
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleReset = async (id: number) => {
    const res = await fetch(`/api/admin/players/${id}/reset-progress`, { method: "POST" });
    if (res.ok) {
      load();
      toast.success("Progress reset");
    } else {
      toast.error(await getErrorMessage(res));
    }
    setConfirmReset(null);
  };

  return (
    <>
      <div className="flex items-center justify-between mb-5">
        <span className="text-muted text-xs tracking-widest uppercase">
          {progress.length} player{progress.length !== 1 ? "s" : ""}
        </span>
        <button
          onClick={load}
          className="text-gold text-xs tracking-widest uppercase hover:text-gold-light transition-colors"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <p className="text-muted text-sm text-center py-10">Loading…</p>
      ) : (
        <div className="space-y-3">
          {progress.map(({ player, flags, words }) => (
            <div
              key={player.id}
              className="border border-gold/20 bg-surface p-4"
            >
              <div className="flex items-start justify-between mb-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-cream font-medium">{player.name}</span>
                  {player.role && (
                    <span className="text-muted text-xs">({player.role})</span>
                  )}
                  {player.team && (
                    <span className="text-muted text-xs">Team {player.team}</span>
                  )}
                  {player.is_admin && (
                    <span className="text-gold text-xs tracking-widest">
                      Admin
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 shrink-0 ml-2">
                  <span className="text-muted text-xs">
                    {flags.length} flag{flags.length !== 1 ? "s" : ""} · {words.length} word{words.length !== 1 ? "s" : ""}
                  </span>
                  {confirmReset === player.id ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="text-muted text-xs">Reset?</span>
                      <button
                        onClick={() => handleReset(player.id)}
                        className="text-danger text-xs hover:underline"
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => setConfirmReset(null)}
                        className="text-muted text-xs hover:text-cream"
                      >
                        No
                      </button>
                    </span>
                  ) : (
                    <button
                      onClick={() => setConfirmReset(player.id)}
                      className="text-muted text-xs tracking-widest uppercase hover:text-danger transition-colors"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>
              {flags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {flags.map((f) => (
                    <span
                      key={f}
                      className="border border-gold/30 text-gold text-xs px-2 py-0.5 tracking-wide"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              )}
              {words.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {words.map((w) => (
                    <span
                      key={w}
                      className="border border-gold/20 text-cream font-mono text-xs px-2 py-0.5"
                    >
                      {w}
                    </span>
                  ))}
                </div>
              )}
              {flags.length === 0 && words.length === 0 && (
                <p className="text-muted text-xs mt-1">No progress yet</p>
              )}
            </div>
          ))}
          {progress.length === 0 && (
            <p className="text-muted text-sm text-center py-10">
              No players yet
            </p>
          )}
        </div>
      )}
    </>
  );
}
