import React, { useState, useEffect } from "react";
import PromptBlock from "../PromptBlock";
import { useTradeContext } from "../../context/TradeContext";

interface ClueResult {
  id: number;
  title: string;
  content: string;
  page_type: string;
  grants_flags: string[] | null;
  grants_words: string[] | null;
}

interface Prompt {
  id: number;
  page_id: number;
  question: string;
  template: string;
  grants_flags: string[] | null;
  grants_words: string[] | null;
  sort_order: number;
  completed: boolean;
}

interface PageViewProps {
  clue: ClueResult;
  onBack: () => void;
}

function parseTemplate(template: string): string[] {
  return template.split("_____");
}

function highlightText(text: string, terms: string[]): React.ReactNode {
  if (!terms.length || !text) return text;
  const escaped = terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const pattern = new RegExp(`(${escaped.join("|")})`, "gi");
  const parts = text.split(pattern);
  return parts.map((part, i) =>
    terms.some((t) => t.toLowerCase() === part.toLowerCase()) ? (
      <span key={i} className="text-gold font-semibold">
        {part}
      </span>
    ) : (
      part
    )
  );
}

export default function PageView({ clue, onBack }: PageViewProps) {
  const { inventory, refreshInventory } = useTradeContext();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [placements, setPlacements] = useState<Record<number, (string | null)[]>>({});

  useEffect(() => {
    fetch(`/api/pages/${clue.id}/prompts`)
      .then((r) => r.json())
      .then((data: Prompt[]) => {
        setPrompts(data);
        const init: Record<number, (string | null)[]> = {};
        for (const p of data) {
          const gapCount = parseTemplate(p.template).length - 1;
          init[p.id] = Array(gapCount).fill(null);
        }
        setPlacements(init);
      });
    refreshInventory();
  }, [clue.id]);

  const placedWords = new Set<string>(
    Object.values(placements).flat().filter(Boolean) as string[]
  );

  const handleSelectWord = (word: string) => {
    setSelectedWord((prev) => (prev === word ? null : word));
  };

  const handleGapClick = (promptId: number, gapIndex: number, currentWord: string | null) => {
    if (selectedWord) {
      setPlacements((prev) => {
        const slots = [...(prev[promptId] ?? [])];
        const displaced = slots[gapIndex];
        slots[gapIndex] = selectedWord;
        setSelectedWord(displaced ?? null);
        return { ...prev, [promptId]: slots };
      });
    } else if (currentWord) {
      setPlacements((prev) => {
        const slots = [...(prev[promptId] ?? [])];
        slots[gapIndex] = null;
        return { ...prev, [promptId]: slots };
      });
      setSelectedWord(currentWord);
    }
  };

  const highlightTerms = [...(clue.grants_words ?? []), ...(clue.grants_flags ?? [])];
  const hasGrants = (clue.grants_words?.length ?? 0) > 0 || (clue.grants_flags?.length ?? 0) > 0;
  const hasActivePrompts = prompts.some((p) => !p.completed);

  return (
    <div className="animate-fade-in">
      {/* Clue content */}
      <div className="border border-gold/25 bg-surface p-8 mb-6">
        <h2 className="text-3xl text-cream mb-5">{clue.title}</h2>
        <div className="h-px bg-gold/25 mb-6" />
        <p className="text-cream leading-relaxed whitespace-pre-wrap text-lg">
          {highlightText(clue.content, highlightTerms)}
        </p>
        <div className="flex justify-end mt-6">
          <button
            onClick={onBack}
            className="text-muted text-xs tracking-widest uppercase hover:text-gold transition-colors"
          >
            ← Return
          </button>
        </div>
      </div>

      {/* Grants panel */}
      {hasGrants && (
        <div className="border border-gold/40 bg-gold/5 p-5 mb-6">
          <p className="text-gold text-xs tracking-[0.35em] uppercase mb-3">
            — You Received —
          </p>
          {clue.grants_words && clue.grants_words.length > 0 && (
            <div className="mb-3">
              <p className="text-muted text-xs uppercase tracking-wide mb-2">Clues</p>
              <div className="flex flex-wrap gap-2">
                {clue.grants_words.map((w) => (
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
          {clue.grants_flags && clue.grants_flags.length > 0 && (
            <div>
              <p className="text-muted text-xs uppercase tracking-wide mb-2">Flags</p>
              <div className="flex flex-wrap gap-2">
                {clue.grants_flags.map((f) => (
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
      )}

      {/* Prompts */}
      {prompts.length > 0 && (
        <div className="mb-6">
          <p className="text-muted text-xs tracking-[0.35em] uppercase mb-4">
            — Questions —
          </p>
          {prompts.map((prompt) => (
            <PromptBlock
              key={prompt.id}
              prompt={prompt}
              selectedWord={selectedWord}
              placements={placements[prompt.id] ?? []}
              onGapClick={handleGapClick}
              onCorrect={refreshInventory}
            />
          ))}
        </div>
      )}

      {/* Inline clue inventory — only shown when there are active prompts to fill */}
      {hasActivePrompts && inventory.length > 0 && (
        <div className="border border-gold/20 bg-surface-3 p-5 mb-6">
          <p className="text-gold text-xs tracking-[0.35em] uppercase mb-3">
            — Your Clues —
          </p>
          <div className="flex flex-wrap gap-2 mb-3">
            {inventory.map((word) => {
              const placed = placedWords.has(word);
              const selected = selectedWord === word;
              return (
                <button
                  key={word}
                  onClick={() => !placed && handleSelectWord(word)}
                  disabled={placed}
                  className={`px-3 py-1.5 text-xs tracking-widest uppercase font-mono border transition-all ${
                    placed
                      ? "border-gold/15 text-muted/40 cursor-default"
                      : selected
                      ? "border-gold bg-gold text-ink"
                      : "border-gold/40 text-cream hover:border-gold hover:text-gold"
                  }`}
                >
                  {word}
                </button>
              );
            })}
          </div>
          <p className="text-muted/60 text-xs">
            {selectedWord
              ? `"${selectedWord}" selected — tap a gap to place it`
              : "Tap a clue to select it, then tap a gap above"}
          </p>
        </div>
      )}

    </div>
  );
}
