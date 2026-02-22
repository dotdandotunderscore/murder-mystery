import React, { useState } from "react";
import { usePlayer } from "../context/PlayerContext";
import { TradeProvider, useTradeContext } from "../context/TradeContext";
import LoginPage from "./pages/LoginPage";
import AdminPage from "./pages/AdminPage";
import HomePage from "./pages/HomePage";
import PageView from "./pages/PageView";
import TradePanel from "./TradePanel";
import TradeOfferModal from "./TradeOfferModal";

interface ClueResult {
  id: number;
  title: string;
  content: string;
  page_type: string;
  grants_flags: string[] | null;
  grants_words: string[] | null;
}

function AppInner() {
  const { player, loading, logout } = usePlayer();
  const { pendingActionCount, setPanelOpen } = useTradeContext();
  const [codeInput, setCodeInput] = useState("");
  const [currentPage, setCurrentPage] = useState<string | null>(null);
  const [clue, setClue] = useState<ClueResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hints, setHints] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center">
        <p className="text-muted text-xs tracking-[0.35em] uppercase animate-pulse">
          Loading…
        </p>
      </div>
    );
  }

  if (!player) return <LoginPage />;

  const handleSubmit = async () => {
    if (!codeInput.trim()) return;
    setSubmitting(true);
    setError(null);
    setHints([]);
    try {
      const res = await fetch("/api/pages/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code_phrase: codeInput.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setClue(data);
        setCurrentPage("clue");
      } else {
        setError(data.error ?? "Invalid code");
        setHints(data.hints ?? []);
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    setCurrentPage(null);
    setClue(null);
    setCodeInput("");
    setError(null);
    setHints([]);
  };

  const renderPage = () => {
    if (currentPage === "admin" && player.is_admin) return <AdminPage />;

    if (currentPage === "clue" && clue) {
      return <PageView clue={clue} onBack={handleBack} />;
    }

    return <HomePage />;
  };

  return (
    <div className="min-h-screen bg-ink">
      {/* Header */}
      <header className="border-b border-gold/20 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <span className="text-muted text-xs tracking-widest uppercase">
            {player.name}
            {player.team ? (
              <span className="text-muted/60"> · {player.team}</span>
            ) : null}
          </span>
          <div className="flex items-center gap-6">
            {player.is_admin && (
              <button
                onClick={() =>
                  setCurrentPage(currentPage === "admin" ? null : "admin")
                }
                className="text-gold text-xs tracking-widest uppercase hover:text-gold-light transition-colors"
              >
                {currentPage === "admin" ? "← Home" : "Admin"}
              </button>
            )}
            <button
              onClick={() => setPanelOpen(true)}
              className="relative text-gold text-xs tracking-widest uppercase hover:text-gold-light transition-colors"
              aria-label="Clues"
            >
              Clues
              {pendingActionCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-gold text-ink text-[9px] font-bold w-4 h-4 flex items-center justify-center">
                  {pendingActionCount}
                </span>
              )}
            </button>
            <button
              onClick={logout}
              className="text-muted text-xs tracking-widest uppercase hover:text-cream transition-colors"
            >
              Leave
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-2xl mx-auto px-6 py-10">
        {/* Code entry — only on home */}
        {currentPage !== "admin" && currentPage !== "clue" && (
          <div className="text-center mb-12">
            <div className="flex items-center gap-4 mb-8">
              <div className="flex-1 h-px bg-gold/20" />
              <div className="w-1.5 h-1.5 bg-gold rotate-45 shrink-0" />
              <div className="flex-1 h-px bg-gold/20" />
            </div>
            <div className="flex max-w-xs mx-auto">
              <input
                className="flex-1 bg-surface border border-gold/30 text-cream px-4 py-3 text-sm focus:outline-none focus:border-gold transition-colors min-w-0"
                placeholder="Enter code…"
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
              />
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="bg-gold text-ink px-5 py-3 text-xs tracking-widest uppercase font-semibold hover:bg-gold-light transition-colors disabled:opacity-50 shrink-0"
                style={{ fontFamily: "var(--font-family-display)" }}
              >
                {submitting ? "…" : "Submit"}
              </button>
            </div>
            {error && (
              <p className="text-danger text-sm mt-3">{error}</p>
            )}
            {hints.map((h, i) => (
              <p key={i} className="text-muted text-sm mt-1 italic">{h}</p>
            ))}
          </div>
        )}

        {renderPage()}
      </main>

      <TradePanel />
      <TradeOfferModal />
    </div>
  );
}

export default function App() {
  return (
    <TradeProvider>
      <AppInner />
    </TradeProvider>
  );
}
