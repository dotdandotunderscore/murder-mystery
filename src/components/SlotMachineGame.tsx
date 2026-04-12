import { useState, useEffect, useRef } from "react";
import { useTradeContext } from "../context/TradeContext";
import { getAudioCtx, playReelStop, playSlotTick, playSlotJackpot } from "./gameAudio";

const SYMBOLS = ["🔍", "🗡️", "💀", "🕯️", "🔑", "🃏", "⚗️", "💎"];

function randSymbol(): string {
  return SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]!;
}

function randReel(middle?: string): ReelState {
  const pool = middle ? SYMBOLS.filter((s) => s !== middle) : [...SYMBOLS];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j]!, pool[i]!];
  }
  const centre = middle ?? pool[0]!;
  const candidates = pool.filter((s) => s !== centre);
  return [candidates[0]!, centre, candidates[1]!];
}

interface SlotMachineGameProps {
  pageId: number;
  grantsFlags: string[] | null;
  grantsWords: string[] | null;
  jackpotChance: number; // 0–100 percentage
  onPendingDirt?: (dirt: string[]) => void;
}

// Each reel shows [above, middle, below]
type ReelState = [string, string, string];

export default function SlotMachineGame({
  pageId,
  grantsFlags,
  grantsWords,
  jackpotChance,
  onPendingDirt,
}: SlotMachineGameProps) {
  const { refreshInventory, refreshFlags } = useTradeContext();
  const [won, setWon] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [stoppedCount, setStoppedCount] = useState(3);
  const [reels, setReels] = useState<[ReelState, ReelState, ReelState]>([
    randReel(),
    randReel(),
    randReel(),
  ]);
  const [missed, setMissed] = useState(false);

  const reelIntervalRefs = useRef<(ReturnType<typeof setInterval> | null)[]>([null, null, null]);
  const timeoutRefs = useRef<ReturnType<typeof setTimeout>[]>([]);
  const tickIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const hasGrants = (grantsWords?.length ?? 0) > 0 || (grantsFlags?.length ?? 0) > 0;

  const clearAllTimers = () => {
    reelIntervalRefs.current.forEach((id) => { if (id !== null) clearInterval(id); });
    reelIntervalRefs.current = [null, null, null];
    timeoutRefs.current.forEach(clearTimeout);
    timeoutRefs.current = [];
    if (tickIntervalRef.current !== null) {
      clearInterval(tickIntervalRef.current);
      tickIntervalRef.current = null;
    }
  };

  useEffect(() => () => clearAllTimers(), []);

  const pull = () => {
    if (spinning || won) return;

    clearAllTimers();
    setSpinning(true);
    setStoppedCount(0);
    setMissed(false);

    const ctx = getAudioCtx(audioCtxRef);

    const isJackpot = Math.random() * 100 < jackpotChance;
    const finalMiddles: [string, string, string] = isJackpot
      ? ["💎", "💎", "💎"]
      : (() => {
          const r0 = randSymbol();
          let r1: string;
          do { r1 = randSymbol(); } while (r1 === r0);
          // r0 !== r1, so r2 can never equal both — three-of-a-kind is impossible
          const r2 = randSymbol();
          return [r0, r1, r2] as [string, string, string];
        })();

    // Tick sound while spinning
    tickIntervalRef.current = setInterval(() => playSlotTick(ctx), 100);

    // Start each reel spinning independently
    for (let i = 0; i < 3; i++) {
      reelIntervalRefs.current[i] = setInterval(() => {
        setReels((prev) => {
          const next = [...prev] as [ReelState, ReelState, ReelState];
          next[i] = randReel();
          return next;
        });
      }, 80);
    }

    // Stop reels sequentially
    const stopTimes = [1000, 1700, 2400];
    stopTimes.forEach((time, i) => {
      const t = setTimeout(() => {
        clearInterval(reelIntervalRefs.current[i]!);
        reelIntervalRefs.current[i] = null;

        playReelStop(ctx);

        setReels((prev) => {
          const next = [...prev] as [ReelState, ReelState, ReelState];
          next[i] = randReel(finalMiddles[i]);
          return next;
        });
        setStoppedCount(i + 1);

        if (i === 2) {
          if (tickIntervalRef.current !== null) {
            clearInterval(tickIntervalRef.current);
            tickIntervalRef.current = null;
          }
          setSpinning(false);
          if (isJackpot) {
            setTimeout(() => playSlotJackpot(ctx), 100);
            setWon(true);
            fetch(`/api/pages/${pageId}/claim`, { method: "POST" })
              .then((r) => r.json())
              .then((data) => {
                refreshInventory();
                refreshFlags();
                if (data.pending_dirt?.length && onPendingDirt) onPendingDirt(data.pending_dirt);
              });
          } else {
            setMissed(true);
          }
        }
      }, time);
      timeoutRefs.current.push(t);
    });
  };

  return (
    <div className="border border-gold/25 bg-surface p-6 mb-6">
      <p className="text-gold text-xs tracking-[0.35em] uppercase mb-6 text-center">
        — The Slot Machine —
      </p>

      {/* Reels */}
      <div className="flex justify-center gap-3 mb-6">
        {reels.map((reel, i) => {
          const isSpinning = spinning && i >= stoppedCount;
          return (
            <div
              key={i}
              className={`flex flex-col border-2 overflow-hidden transition-colors ${
                isSpinning ? "border-gold" : "border-gold/30"
              }`}
              style={{ width: 72 }}
            >
              {reel.map((symbol, row) => (
                <div
                  key={row}
                  className={`flex items-center justify-center transition-all select-none ${
                    row === 1
                      ? isSpinning
                        ? "bg-gold/10 border-y border-gold/60 py-3 text-3xl"
                        : "bg-gold/5 border-y border-gold/25 py-3 text-3xl"
                      : "py-2 text-xl opacity-35"
                  }`}
                >
                  {symbol}
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* Result feedback */}
      <div className="h-6 mb-4 flex items-center justify-center">
        {missed && !spinning && (
          <p className="text-muted text-sm tracking-wide text-center">
            No match. Try again.
          </p>
        )}
      </div>

      {/* Won state */}
      {won ? (
        <div>
          <p className="text-gold text-center text-sm tracking-widest uppercase mb-5">
            — Jackpot! —
          </p>
          {hasGrants ? (
            <div className="border border-gold/40 bg-gold/5 p-5">
              <p className="text-gold text-xs tracking-[0.35em] uppercase mb-3">
                — You Received —
              </p>
              {grantsWords && grantsWords.length > 0 && (
                <div className="mb-3">
                  <p className="text-muted text-xs uppercase tracking-wide mb-2">Clues</p>
                  <div className="flex flex-wrap gap-2">
                    {grantsWords.map((w) => (
                      <span
                        key={w}
                        className="bg-gold/20 border border-gold/40 text-gold text-xs font-mono px-2 py-1 tracking-wide"
                      >
                        {w}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {grantsFlags && grantsFlags.length > 0 && (
                <div>
                  <p className="text-muted text-xs uppercase tracking-wide mb-2">Flags</p>
                  <div className="flex flex-wrap gap-2">
                    {grantsFlags.map((f) => (
                      <span
                        key={f}
                        className="bg-surface border border-muted/30 text-muted text-xs px-2 py-0.5"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-muted text-xs text-center tracking-wide">
              The machine yields its secrets.
            </p>
          )}
        </div>
      ) : (
        <div className="flex justify-center">
          <button
            onClick={pull}
            disabled={spinning}
            className={`px-8 py-2 text-xs tracking-widest uppercase border transition-all ${
              spinning
                ? "border-muted/20 text-muted/30 cursor-not-allowed"
                : "border-gold/40 text-cream hover:border-gold hover:text-gold"
            }`}
          >
            {spinning ? "Spinning…" : "Pull"}
          </button>
        </div>
      )}
    </div>
  );
}
