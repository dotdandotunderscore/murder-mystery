import React, { useState } from "react";
import { usePlayer } from "../../context/PlayerContext";

export default function LoginPage() {
  const { setPlayer } = usePlayer();
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !pin.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), pin: pin.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setPlayer(data);
      } else {
        setError(data.error ?? "Login failed");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm animate-fade-in">

        {/* Masthead */}
        <div className="text-center mb-10">
          <p className="text-gold text-xs tracking-[0.5em] uppercase mb-6">
            — Strictly Confidential —
          </p>
          <h1
            className="text-cream text-5xl leading-none mb-1"
            style={{ fontFamily: "var(--font-family-display)" }}
          >
            Murder
          </h1>
          <h1
            className="text-gold text-4xl leading-none"
            style={{ fontFamily: "var(--font-family-display)", fontStyle: "italic" }}
          >
            Mystery
          </h1>
          {/* Gold rule with diamond */}
          <div className="flex items-center gap-4 mt-8">
            <div className="flex-1 h-px bg-gold/30" />
            <div className="w-1.5 h-1.5 bg-gold rotate-45 shrink-0" />
            <div className="flex-1 h-px bg-gold/30" />
          </div>
        </div>

        {/* Form card */}
        <div className="border border-gold/25 bg-surface px-8 py-8">
          <p className="text-muted text-xs tracking-[0.35em] uppercase text-center mb-7">
            Identify Yourself
          </p>
          <form onSubmit={handleSubmit}>
            <div className="mb-5">
              <label className="block text-gold text-xs tracking-widest uppercase mb-2">
                Character
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-ink border border-gold/30 text-cream px-4 py-3 text-base focus:outline-none focus:border-gold transition-colors"
                placeholder="e.g. The Butler"
                autoComplete="username"
                autoCapitalize="words"
              />
            </div>

            <div className="mb-7">
              <label className="block text-gold text-xs tracking-widest uppercase mb-2">
                PIN
              </label>
              <input
                type="password"
                inputMode="numeric"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full bg-ink border border-gold/30 text-cream px-4 py-3 text-base focus:outline-none focus:border-gold transition-colors tracking-[0.4em]"
                placeholder="••••"
                autoComplete="current-password"
              />
            </div>

            {error && (
              <p className="text-danger text-sm text-center mb-5">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gold text-ink py-3 text-xs tracking-[0.35em] uppercase font-semibold hover:bg-gold-light transition-colors disabled:opacity-50"
              style={{ fontFamily: "var(--font-family-display)" }}
            >
              {loading ? "Verifying…" : "Enter"}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
