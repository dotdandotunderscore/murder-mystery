import React, { useState, useEffect } from "react";
import { useTradeContext } from "../context/TradeContext";
import { toast } from "sonner";

type PlayerWithWordStatus = { id: number; name: string; team: string | null; has_word: boolean };

export default function TradeOfferModal() {
  const { offerWord, setOfferWord, players, createOffer, setPanelOpen } = useTradeContext();
  const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null);
  const [enrichedPlayers, setEnrichedPlayers] = useState<PlayerWithWordStatus[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!offerWord) { setEnrichedPlayers([]); return; }
    fetch(`/api/players?word=${encodeURIComponent(offerWord)}`)
      .then((r) => r.ok ? r.json() : players.map((p) => ({ ...p, has_word: false })))
      .then(setEnrichedPlayers);
  }, [offerWord]);

  if (!offerWord) return null;

  const handleConfirm = async () => {
    if (!selectedPlayerId) return;
    setBusy(true);
    const ok = await createOffer(offerWord, selectedPlayerId);
    if (ok) {
      toast.success("Trade offer sent");
      setOfferWord(null);
      setSelectedPlayerId(null);
      setPanelOpen(true);
    } else {
      toast.error("Couldn't create offer — word may no longer be in your inventory");
    }
    setBusy(false);
  };

  const handleClose = () => {
    setOfferWord(null);
    setSelectedPlayerId(null);
  };

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="fixed inset-0 bg-ink/80 animate-fade-in-fast"
        onClick={handleClose}
      />
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-start justify-center py-8 px-4">
          <div className="relative bg-surface-3 border border-gold/30 w-full sm:max-w-sm z-10 animate-fade-in">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gold/20">
              <h3 className="text-xl text-cream">Offer Trade</h3>
              <button
                onClick={handleClose}
                className="text-muted hover:text-cream transition-colors text-2xl leading-none pb-0.5"
              >
                ×
              </button>
            </div>

            <div className="px-6 py-5">
              <div className="mb-5">
                <p className="text-gold text-xs tracking-widest uppercase mb-2">You are offering</p>
                <span className="border border-gold/40 text-cream font-mono text-sm px-4 py-2 inline-block">
                  {offerWord}
                </span>
                <p className="text-muted text-xs mt-2">
                  This word will be removed from your inventory when the trade completes.
                </p>
              </div>

              <div className="mb-6">
                <p className="text-gold text-xs tracking-widest uppercase mb-3">Trade with</p>
                {enrichedPlayers.length === 0 ? (
                  <p className="text-muted text-sm italic">No other players found</p>
                ) : (
                  <div className="space-y-2">
                    {enrichedPlayers.map((p) => (
                      <button
                        key={p.id}
                        disabled={p.has_word}
                        onClick={() => !p.has_word && setSelectedPlayerId(p.id)}
                        className={`w-full text-left px-4 py-3 border transition-colors ${
                          p.has_word
                            ? "border-gold/10 text-muted cursor-not-allowed opacity-50"
                            : selectedPlayerId === p.id
                            ? "border-gold bg-gold/10 text-gold"
                            : "border-gold/20 text-cream hover:border-gold/40"
                        }`}
                      >
                        <span className="text-sm">{p.name}</span>
                        {p.team && (
                          <span className="text-muted text-xs ml-2">({p.team})</span>
                        )}
                        {p.has_word && (
                          <span className="text-muted text-xs ml-2 italic">already has this</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={handleConfirm}
                disabled={!selectedPlayerId || busy}
                className="w-full bg-gold text-ink py-3 text-xs tracking-widest uppercase font-semibold hover:bg-gold-light transition-colors disabled:opacity-50"
                style={{ fontFamily: "var(--font-family-display)" }}
              >
                {busy ? "Sending…" : "Send Offer"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
