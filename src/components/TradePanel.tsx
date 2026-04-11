import React, { useEffect, useState } from "react";
import { useTradeContext, type Trade } from "../context/TradeContext";
import { usePlayer } from "../context/PlayerContext";
import { toast } from "sonner";

function InventorySummary() {
  const { inventory, flags, setPanelOpen, setOfferWord } = useTradeContext();

  if (inventory.length === 0 && flags.length === 0) return null;

  return (
    <div className="border-b border-gold/20 px-6 py-4 space-y-4">
      {inventory.length > 0 && (
        <div>
          <p className="text-gold text-xs tracking-[0.35em] uppercase mb-1">Your Clues</p>
          <p className="text-muted text-xs mb-2">Tap a clue to offer it in a trade</p>
          <div className="flex flex-wrap gap-1.5">
            {inventory.map((w) => (
              <button
                key={w}
                onClick={() => { setPanelOpen(false); setOfferWord(w); }}
                className="border border-gold/30 text-cream font-mono text-xs px-2 py-0.5 hover:border-gold hover:text-gold transition-colors"
              >
                {w}
              </button>
            ))}
          </div>
        </div>
      )}
      {flags.length > 0 && (
        <div>
          <p className="text-gold text-xs tracking-[0.35em] uppercase mb-2">Your Flags</p>
          <div className="flex flex-wrap gap-1.5">
            {flags.map((f) => (
              <span
                key={f}
                className="border border-gold/20 text-muted text-xs px-2 py-0.5 tracking-wide"
              >
                {f}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function TradeCard({ trade }: { trade: Trade }) {
  const { player } = usePlayer();
  const { counterOffer, acceptOffer, cancelOffer, inventory } = useTradeContext();
  const [counterWord, setCounterWord] = useState<string | null>(null);
  const [showCounter, setShowCounter] = useState(false);
  const [initiatorWords, setInitiatorWords] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  const isInitiator = player?.id === trade.initiator_id;
  const isRecipient = player?.id === trade.recipient_id;

  const openCounter = () => {
    fetch(`/api/players/${trade.initiator_id}/inventory`)
      .then((r) => r.ok ? r.json() : [])
      .then(setInitiatorWords);
    setShowCounter(true);
  };

  const handleCounter = async () => {
    if (!counterWord) return;
    setBusy(true);
    const ok = await counterOffer(trade.id, counterWord);
    if (!ok) toast.error("Couldn't counter — word may no longer be in your inventory");
    setBusy(false);
    setShowCounter(false);
    setCounterWord(null);
    setInitiatorWords([]);
  };

  const handleAccept = async () => {
    setBusy(true);
    const result = await acceptOffer(trade.id);
    if (result.ok) {
      toast.success("Trade complete!");
    } else {
      toast.error(result.error ?? "Trade failed");
    }
    setBusy(false);
  };

  const handleCancel = async () => {
    setBusy(true);
    const ok = await cancelOffer(trade.id);
    if (!ok) toast.error("Couldn't cancel");
    setBusy(false);
  };

  return (
    <div className="border border-gold/20 bg-surface p-4 mb-3">
      {/* Status line */}
      {trade.status === "offered" && isRecipient && (
        <p className="text-muted text-xs tracking-wide mb-3">
          Trade offer from{" "}
          <span className="text-cream">{trade.initiator_name}</span>
        </p>
      )}
      {trade.status === "offered" && isInitiator && (
        <p className="text-muted text-xs tracking-wide mb-3">
          Awaiting response from{" "}
          <span className="text-cream">{trade.recipient_name}</span>
        </p>
      )}
      {trade.status === "countered" && isInitiator && (
        <p className="text-muted text-xs tracking-wide mb-3">
          Counter-offer from{" "}
          <span className="text-cream">{trade.recipient_name}</span>
        </p>
      )}
      {trade.status === "countered" && isRecipient && (
        <p className="text-muted text-xs tracking-wide mb-3">
          Waiting for{" "}
          <span className="text-cream">{trade.initiator_name}</span> to decide
        </p>
      )}

      {/* Word display */}
      <div className="flex flex-col gap-1 mb-4">
        <div>
          <p className="text-gold text-[10px] tracking-widest uppercase mb-1">
            {isInitiator ? "You offer" : `${trade.initiator_name} offers`}
          </p>
          <span className="inline-block border border-gold/40 text-cream font-mono text-sm px-3 py-1">
            {trade.initiator_word}
          </span>
        </div>
        <span className="text-gold/40 text-xs">⇅</span>
        <div>
          <p className="text-gold text-[10px] tracking-widest uppercase mb-1">
            {isRecipient ? "You offer" : `${trade.recipient_name} offers`}
          </p>
          {trade.recipient_word ? (
            <span className="inline-block border border-gold/40 text-cream font-mono text-sm px-3 py-1">
              {trade.recipient_word}
            </span>
          ) : (
            <span className="inline-block border border-gold/20 text-muted font-mono text-sm px-3 py-1 italic">
              ?
            </span>
          )}
        </div>
      </div>

      {/* Counter word picker */}
      {showCounter && (
        <div className="mb-4">
          <p className="text-muted text-xs tracking-wide mb-2">
            Select a word to offer:
          </p>
          {inventory.length === 0 ? (
            <p className="text-muted text-xs italic">Your inventory is empty</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {inventory.map((w) => {
                const alreadyHas = initiatorWords.includes(w);
                return (
                  <button
                    key={w}
                    disabled={alreadyHas}
                    onClick={() => !alreadyHas && setCounterWord(w === counterWord ? null : w)}
                    title={alreadyHas ? `${trade.initiator_name} already has this` : undefined}
                    className={`font-mono text-xs px-3 py-1.5 border transition-colors ${
                      alreadyHas
                        ? "border-gold/10 text-muted opacity-40 cursor-not-allowed"
                        : counterWord === w
                        ? "border-gold bg-gold/10 text-gold"
                        : "border-gold/30 text-cream hover:border-gold/60"
                    }`}
                  >
                    {w}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-4 flex-wrap">
        {trade.status === "offered" && isRecipient && !showCounter && (
          <>
            <button
              onClick={openCounter}
              className="text-gold text-xs tracking-widest uppercase hover:text-gold-light transition-colors"
            >
              Counter
            </button>
            <button
              onClick={handleCancel}
              disabled={busy}
              className="text-muted text-xs tracking-widest uppercase hover:text-danger transition-colors"
            >
              Decline
            </button>
          </>
        )}
        {showCounter && (
          <>
            <button
              onClick={handleCounter}
              disabled={!counterWord || busy}
              className="text-gold text-xs tracking-widest uppercase hover:text-gold-light transition-colors disabled:opacity-40"
            >
              Propose
            </button>
            <button
              onClick={() => { setShowCounter(false); setCounterWord(null); setInitiatorWords([]); }}
              className="text-muted text-xs tracking-widest uppercase hover:text-cream transition-colors"
            >
              Back
            </button>
          </>
        )}
        {trade.status === "countered" && isInitiator && (
          <>
            <button
              onClick={handleAccept}
              disabled={busy}
              className="text-gold text-xs tracking-widest uppercase hover:text-gold-light transition-colors"
            >
              Accept
            </button>
            <button
              onClick={handleCancel}
              disabled={busy}
              className="text-muted text-xs tracking-widest uppercase hover:text-danger transition-colors"
            >
              Cancel
            </button>
          </>
        )}
        {((trade.status === "offered" && isInitiator) ||
          (trade.status === "countered" && isRecipient)) && (
          <button
            onClick={handleCancel}
            disabled={busy}
            className="text-muted text-xs tracking-widest uppercase hover:text-danger transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}

export default function TradePanel() {
  const { trades, panelOpen, setPanelOpen } = useTradeContext();
  const { player } = usePlayer();

  useEffect(() => {
    if (!panelOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setPanelOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [panelOpen]);

  if (!panelOpen) return null;

  const active = trades.filter((t) => t.status === "offered" || t.status === "countered");
  const needsAction = active.filter(
    (t) =>
      (t.status === "offered" && t.recipient_id === player?.id) ||
      (t.status === "countered" && t.initiator_id === player?.id)
  );
  const waiting = active.filter((t) => !needsAction.includes(t));

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="fixed inset-0 bg-ink/70 animate-fade-in-fast"
        onClick={() => setPanelOpen(false)}
      />
      <div className="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-surface-3 border-l border-gold/20 z-10 flex flex-col animate-fade-in overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gold/20 shrink-0">
          <h3 className="text-xl text-cream">Clues</h3>
          <button
            onClick={() => setPanelOpen(false)}
            className="text-muted hover:text-cream transition-colors text-2xl leading-none pb-0.5"
          >
            ×
          </button>
        </div>

        <InventorySummary />

        <div className="px-6 py-5 flex-1">
          {active.length === 0 ? (
            <p className="text-muted text-sm text-center py-10">No active trades</p>
          ) : (
            <>
              {needsAction.length > 0 && (
                <div className="mb-6">
                  <p className="text-gold text-xs tracking-[0.35em] uppercase mb-3">
                    — Awaiting your response —
                  </p>
                  {needsAction.map((t) => (
                    <TradeCard key={t.id} trade={t} />
                  ))}
                </div>
              )}
              {waiting.length > 0 && (
                <div>
                  <p className="text-muted text-xs tracking-[0.35em] uppercase mb-3">
                    — Waiting on others —
                  </p>
                  {waiting.map((t) => (
                    <TradeCard key={t.id} trade={t} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
