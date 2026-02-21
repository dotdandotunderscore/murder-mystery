import React, { useState, useEffect } from "react";
import PromptBlock from "../PromptBlock";
import InventoryPanel from "../InventoryPanel";
import { useTradeContext } from "../../context/TradeContext";

interface ClueResult {
  id: number;
  title: string;
  content: string;
  page_type: string;
}

interface Prompt {
  id: number;
  clue_id: number;
  question: string;
  template: string;
  grants_flags: string[] | null;
  grants_words: string[] | null;
  sort_order: number;
  completed: boolean;
}

interface CluePageProps {
  clue: ClueResult;
  onBack: () => void;
}

function parseTemplate(template: string): string[] {
  return template.split("_____");
}

export default function CluePage({ clue, onBack }: CluePageProps) {
  const { inventory, refreshInventory } = useTradeContext();
  const [inventoryOpen, setInventoryOpen] = useState(false);
  const [prompts, setPrompts] = useState<Prompt[]>([]);

  // selectedWord: which word chip the player has tapped/clicked
  const [selectedWord, setSelectedWord] = useState<string | null>(null);

  // placements: Record<promptId, (string|null)[]>
  const [placements, setPlacements] = useState<Record<number, (string | null)[]>>({});

  useEffect(() => {
    fetch(`/api/clues/${clue.id}/prompts`)
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
          {clue.content}
        </p>
      </div>

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
            Evidence ({inventory.length})
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
