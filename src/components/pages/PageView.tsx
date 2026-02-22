import React, { useState, useEffect } from "react";
import PromptBlock from "../PromptBlock";
import InventoryPanel from "../InventoryPanel";
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
  const [inventoryOpen, setInventoryOpen] = useState(false);
  const [prompts, setPrompts] = useState<Prompt[]>([]);

  // selectedWord: which word chip the player has tapped/clicked
  const [selectedWord, setSelectedWord] = useState<string | null>(null);

  // placements: Record<promptId, (string|null)[]>
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

  // All words currently sitting in any gap
  const placedWords = new Set<string>(
    Object.values(placements).flat().filter(Boolean) as string[]
  );

  const handleSelectWord = (word: string) => {
    setSelectedWord((prev) => (prev === word ? null : word));
  };

  const handleGapClick = (promptId: number, gapIndex: number, currentWord: string | null) => {
    setPlacements((prev) => {
      const slots = [...(prev[promptId] ?? [])];

      if (selectedWord) {
        const displaced = slots[gapIndex];
        slots[gapIndex] = selectedWord;
        setSelectedWord(displaced ?? null);
      } else if (currentWord) {
        slots[gapIndex] = null;
        setSelectedWord(currentWord);
      }

      return { ...prev, [promptId]: slots };
    });
  };

  const highlightTerms = [...(clue.grants_words ?? []), ...(clue.grants_flags ?? [])];
  const hasGrants = (clue.grants_words?.length ?? 0) > 0 || (clue.grants_flags?.length ?? 0) > 0;

  return (
    <div className="animate-fade-in">
      {/* Clue content */}
      <div className="border border-gold/25 bg-surface p-8 mb-6">
        <p className="text-gold text-xs tracking-[0.45em] uppercase mb-4">
          — Classified —
        </p>
        <h2 className="text-3xl text-cream mb-5">{clue.title}</h2>
        <div className="h-px bg-gold/25 mb-6" />
        <p className="text-cream leading-relaxed whitespace-pre-wrap text-lg">
          {highlightText(clue.content, highlightTerms)}
        </p>
      </div>

      {/* Grants panel */}
      {hasGrants && (
        <div className="border border-gold/40 bg-gold/5 p-5 mb-6">
          <p className="text-gold text-xs tracking-[0.35em] uppercase mb-3">
            — You Received —
          </p>
          {clue.grants_words && clue.grants_words.length > 0 && (
            <div className="mb-3">
              <p className="text-muted text-xs uppercase tracking-wide mb-2">
                Clues
              </p>
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
              <p className="text-muted text-xs uppercase tracking-wide mb-2">
                Flags
              </p>
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

      {/* Footer nav */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="text-muted text-xs tracking-widest uppercase hover:text-gold transition-colors"
        >
          ← Return
        </button>

        {inventory.length > 0 && (
          <button
            onClick={() => setInventoryOpen(true)}
            className="text-gold text-xs tracking-widest uppercase hover:text-gold-light transition-colors"
          >
            Clues ({inventory.length})
          </button>
        )}
      </div>

      <InventoryPanel
        words={inventory}
        placedWords={placedWords}
        selectedWord={selectedWord}
        onSelectWord={handleSelectWord}
        open={inventoryOpen}
        onClose={() => setInventoryOpen(false)}
      />
    </div>
  );
}
