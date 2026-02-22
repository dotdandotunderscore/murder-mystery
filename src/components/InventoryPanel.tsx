import React, { useEffect } from "react";

interface InventoryPanelProps {
  words: string[];
  placedWords: Set<string>;
  selectedWord: string | null;
  onSelectWord: (word: string) => void;
  open: boolean;
  onClose: () => void;
  hint?: string;
}

export default function InventoryPanel({
  words,
  placedWords,
  selectedWord,
  onSelectWord,
  open,
  onClose,
  hint,
}: InventoryPanelProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-ink/60"
          onClick={onClose}
        />
      )}

      <div
        className={`fixed bottom-0 left-0 right-0 z-40 bg-surface-3 border-t border-gold/30 transition-transform duration-300 ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="max-w-2xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between mb-4">
            <h3
              className="text-gold text-xs tracking-[0.4em] uppercase"
              style={{ fontFamily: "var(--font-family-display)" }}
            >
              Your Clues
            </h3>
            <button
              onClick={onClose}
              className="text-muted hover:text-cream transition-colors text-xl leading-none"
            >
              ×
            </button>
          </div>

          {words.length === 0 ? (
            <p className="text-muted text-sm py-4 text-center">
              No words in your possession yet.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2 pb-2">
              {words.map((word) => {
                const placed = placedWords.has(word);
                const selected = selectedWord === word;
                return (
                  <button
                    key={word}
                    onClick={() => !placed && onSelectWord(word)}
                    disabled={placed}
                    className={`
                      px-3 py-1.5 text-xs tracking-widest uppercase font-mono border transition-all
                      ${placed
                        ? "border-gold/15 text-muted/40 cursor-default"
                        : selected
                        ? "border-gold bg-gold text-ink"
                        : "border-gold/40 text-cream hover:border-gold hover:text-gold"
                      }
                    `}
                  >
                    {word}
                  </button>
                );
              })}
            </div>
          )}

          <p className="text-muted/60 text-xs mt-3">
            {hint ?? (selectedWord
              ? `"${selectedWord}" selected — tap a gap to place it`
              : "Tap a word to select it, then tap a gap in a prompt above")}
          </p>
        </div>
      </div>
    </>
  );
}
