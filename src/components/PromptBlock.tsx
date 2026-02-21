import React, { useState } from "react";

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

interface PromptBlockProps {
  prompt: Prompt;
  selectedWord: string | null;
  onGapClick: (promptId: number, gapIndex: number, currentWord: string | null) => void;
  placements: (string | null)[];
  onCorrect?: () => void;
}

// Splits a template string on "_____" (5 underscores) into text segments.
// e.g. "Found at _____ in the _____." → ["Found at ", " in the ", "."]
function parseTemplate(template: string): string[] {
  return template.split("_____");
}

export default function PromptBlock({
  prompt,
  selectedWord,
  onGapClick,
  placements,
  onCorrect,
}: PromptBlockProps) {
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(prompt.completed);
  const [wrong, setWrong] = useState(false);
  const [reward, setReward] = useState<{ flags?: string[]; words?: string[] } | null>(null);

  const segments = parseTemplate(prompt.template);
  const gapCount = segments.length - 1;
  const allFilled = placements.slice(0, gapCount).every((w) => w !== null);

  const handleSubmit = async () => {
    if (!allFilled || submitting) return;
    setSubmitting(true);
    setWrong(false);
    try {
      const res = await fetch(`/api/prompts/${prompt.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ words: placements.slice(0, gapCount) }),
      });
      const data = await res.json();
      if (data.correct) {
        setCompleted(true);
        const hasReward = data.grants_flags?.length || data.grants_words?.length;
        if (hasReward) setReward({ flags: data.grants_flags, words: data.grants_words });
        onCorrect?.();
      } else {
        setWrong(true);
      }
    } catch {
      setWrong(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (completed) {
    return (
      <div className="border border-gold/30 bg-surface p-5 mb-4">
        <p className="text-gold text-xs tracking-[0.35em] uppercase mb-2">
          — Solved —
        </p>
        <p className="text-muted text-sm italic mb-2">{prompt.question}</p>
        <div className="flex flex-wrap gap-1 text-cream text-sm leading-relaxed">
          {segments.map((seg, i) => (
            <React.Fragment key={i}>
              <span>{seg}</span>
              {i < gapCount && (
                <span className="border-b border-gold/50 text-gold font-mono text-xs px-2 py-0.5">
                  {placements[i] ?? "—"}
                </span>
              )}
            </React.Fragment>
          ))}
        </div>
        {reward && (
          <div className="mt-3 pt-3 border-t border-gold/20">
            {reward.words && reward.words.length > 0 && (
              <p className="text-gold text-xs tracking-wide mb-1">
                New words: {reward.words.map((w) => `"${w}"`).join(", ")}
              </p>
            )}
            {reward.flags && reward.flags.length > 0 && (
              <p className="text-muted text-xs">
                Flags earned: {reward.flags.join(", ")}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="border border-gold/20 bg-surface p-5 mb-4">
      <p className="text-gold text-xs tracking-[0.35em] uppercase mb-3">
        — Prompt —
      </p>
      <p className="text-cream text-sm mb-4">{prompt.question}</p>

      {/* Template with gaps */}
      <div className="flex flex-wrap items-baseline gap-x-1 gap-y-2 mb-5 text-cream text-sm leading-relaxed">
        {segments.map((seg, i) => (
          <React.Fragment key={i}>
            <span>{seg}</span>
            {i < gapCount && (
              <button
                onClick={() => onGapClick(prompt.id, i, placements[i] ?? null)}
                className={`
                  inline-flex items-center justify-center min-w-[5rem] px-2 py-0.5
                  border-b-2 text-xs font-mono tracking-wide transition-all
                  ${placements[i]
                    ? "border-gold text-gold bg-gold/10"
                    : selectedWord
                    ? "border-gold/60 text-muted/60 hover:border-gold animate-pulse"
                    : "border-gold/30 text-muted/40"
                  }
                `}
              >
                {placements[i] ?? (selectedWord ? "place here" : "·····")}
              </button>
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={handleSubmit}
          disabled={!allFilled || submitting}
          className="bg-gold text-ink px-5 py-2 text-xs tracking-widest uppercase font-semibold hover:bg-gold-light transition-colors disabled:opacity-40"
          style={{ fontFamily: "var(--font-family-display)" }}
        >
          {submitting ? "Checking…" : "Submit"}
        </button>

        {wrong && (
          <span className="text-danger text-xs tracking-wide">
            Incorrect — try again
          </span>
        )}
      </div>
    </div>
  );
}
