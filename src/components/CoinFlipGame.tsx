import React, { useState, useRef } from "react";
import { useTradeContext } from "../context/TradeContext";

interface CoinFlipGameProps {
  pageId: number;
  grantsFlags: string[] | null;
  grantsWords: string[] | null;
  target?: number;
}

type Face = "heads" | "tails";

export default function CoinFlipGame({ pageId, grantsFlags, grantsWords, target = 5 }: CoinFlipGameProps) {
  const REQUIRED = target;
  const { refreshInventory, refreshFlags } = useTradeContext();
  const [streak, setStreak] = useState(0);
  const [won, setWon] = useState(false);
  const [flipping, setFlipping] = useState(false);
  const [lastResult, setLastResult] = useState<Face | null>(null);
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null);
  const [rotation, setRotation] = useState(0);
  const coinRef = useRef<HTMLDivElement>(null);

  const hasGrants = (grantsWords?.length ?? 0) > 0 || (grantsFlags?.length ?? 0) > 0;

  const handlePredict = (prediction: Face) => {
    if (flipping || won) return;

    const result: Face = Math.random() < 0.5 ? "heads" : "tails";
    const correct = prediction === result;

    // Calculate new rotation: 3 full spins + land on correct face
    const spins = 1080;
    const currentMod = ((rotation % 360) + 360) % 360;
    const targetFace = result === "tails" ? 180 : 0;
    const extra = (targetFace - currentMod + 360) % 360 || 360;
    const newRotation = rotation + spins + extra;

    setFlipping(true);
    setRotation(newRotation);

    setTimeout(() => {
      setFlipping(false);
      setLastResult(result);
      setLastCorrect(correct);

      if (correct) {
        const newStreak = streak + 1;
        setStreak(newStreak);
        if (newStreak >= REQUIRED) {
          setWon(true);
          fetch(`/api/pages/${pageId}/claim`, { method: "POST" }).then(() => {
            refreshInventory();
            refreshFlags();
          });
        }
      } else {
        setStreak(0);
      }
    }, 1600);
  };

  return (
    <div className="border border-gold/25 bg-surface p-6 mb-6">
      <p className="text-gold text-xs tracking-[0.35em] uppercase mb-6 text-center">
        — The Coin —
      </p>

      {/* Coin */}
      <div className="flex justify-center mb-6">
        <div style={{ perspective: "600px" }}>
          <div
            ref={coinRef}
            style={{
              width: 96,
              height: 96,
              position: "relative",
              transformStyle: "preserve-3d",
              transform: `rotateY(${rotation}deg)`,
              transition: flipping ? "transform 1.6s cubic-bezier(0.25, 0.1, 0.25, 1)" : "none",
            }}
          >
            {/* Heads face */}
            <div
              style={{ backfaceVisibility: "hidden" }}
              className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-600 border-4 border-yellow-500 flex items-center justify-center shadow-lg"
            >
              <div className="text-center text-yellow-950">
                <div className="text-2xl leading-none">♛</div>
                <div className="text-xs font-bold tracking-widest mt-0.5">HEADS</div>
              </div>
            </div>
            {/* Tails face */}
            <div
              style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
              className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-600 border-4 border-yellow-500 flex items-center justify-center shadow-lg"
            >
              <div className="text-center text-yellow-950">
                <div className="text-2xl leading-none">♦</div>
                <div className="text-xs font-bold tracking-widest mt-0.5">TAILS</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Streak indicator */}
      {!won && (
        <div className="flex justify-center gap-2 mb-6">
          {Array.from({ length: REQUIRED }).map((_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full border transition-colors ${
                i < streak
                  ? "bg-gold border-gold"
                  : "bg-transparent border-muted/40"
              }`}
            />
          ))}
        </div>
      )}

      {/* Result feedback — always occupies space to prevent layout shift */}
      <div className="h-6 mb-4 flex items-center justify-center">
        {lastResult !== null && !flipping && !won && (
          <p
            className={`text-center text-sm tracking-wide ${
              lastCorrect ? "text-gold" : "text-red-400"
            }`}
          >
            {lastCorrect
              ? streak > 0
                ? `Correct! ${streak}/${REQUIRED} in a row`
                : "Correct!"
              : `Wrong — it was ${lastResult}. Streak reset.`}
          </p>
        )}
      </div>

      {/* Won state */}
      {won ? (
        <div>
          <p className="text-gold text-center text-sm tracking-widest uppercase mb-5">
            — {REQUIRED} in a Row! —
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
              You beat the coin. Well played.
            </p>
          )}
        </div>
      ) : (
        /* Prediction buttons */
        <div className="flex gap-4 justify-center">
          {(["heads", "tails"] as Face[]).map((face) => (
            <button
              key={face}
              onClick={() => handlePredict(face)}
              disabled={flipping}
              className={`px-6 py-2 text-xs tracking-widest uppercase border transition-all ${
                flipping
                  ? "border-muted/20 text-muted/30 cursor-not-allowed"
                  : "border-gold/40 text-cream hover:border-gold hover:text-gold"
              }`}
            >
              {face}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
