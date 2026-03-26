import React, { useEffect, useState } from "react";
import RichText from "./RichText";

interface Prompt {
  id: number;
  page_id: number;
  question: string;
  template: string;
  grants_flags: string[] | null;
  grants_words: string[] | null;
  success_text: string | null;
  sort_order: number;
  completed: boolean;
}

interface PromptBlockProps {
  prompt: Prompt;
  selectedWord: string | null;
  onGapClick: (promptId: number, gapIndex: number, currentWord: string | null) => void;
  placements: (string | null)[];
  onCorrect?: () => void;
  onCode?: (phrase: string) => void;
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
  onCode,
}: PromptBlockProps) {
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(prompt.completed);
  const [wrong, setWrong] = useState(false);
  const [wrongHints, setWrongHints] = useState<string[]>([]);
  const [reward, setReward] = useState<{ flags?: string[]; words?: string[]; successText?: string } | null>(null);

  // Clear wrong feedback when the player changes their answer
  useEffect(() => {
    if (wrong || wrongHints.length > 0) {
      setWrong(false);
      setWrongHints([]);
    }
  }, [placements]);

  const segments = parseTemplate(prompt.template);
  const gapCount = segments.length - 1;
  const allFilled = placements.slice(0, gapCount).every((w) => w !== null);

  const handleSubmit = async () => {
    if (!allFilled || submitting) return;
    setSubmitting(true);
    setWrong(false);
    setWrongHints([]);
    try {
      const res = await fetch(`/api/prompts/${prompt.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ words: placements.slice(0, gapCount) }),
      });
      const data = await res.json();
      if (data.correct) {
        setCompleted(true);
        const hasReward = data.grants_flags?.length || data.grants_words?.length || data.success_text;
        if (hasReward) setReward({ flags: data.grants_flags, words: data.grants_words, successText: data.success_text });
        onCorrect?.();
      } else {
        setWrong(true);
        if (data.hints?.length) setWrongHints(data.hints);
      }
    } catch {
      setWrong(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (completed) {
    const successText = reward?.successText ?? prompt.success_text;
    const highlightTerms = [
      ...(prompt.grants_words ?? []),
      ...(prompt.grants_flags ?? []),
    ];
    const hasRewardGrants =
      (reward?.words?.length ?? 0) > 0 || (reward?.flags?.length ?? 0) > 0;

    return (
      <div className="border border-gold/30 bg-surface-2 p-5 mb-4">
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
        {successText && (
          <p className="text-cream text-sm mt-3 leading-relaxed">
            <RichText text={successText} highlights={highlightTerms} onCode={onCode} />
          </p>
        )}
        {hasRewardGrants && (
          <div className="mt-3 pt-3 border-t border-gold/20">
            <p className="text-gold text-xs tracking-[0.35em] uppercase mb-3">
              — You Received —
            </p>
            {reward!.words && reward!.words.length > 0 && (
              <div className="mb-2">
                <p className="text-muted text-xs uppercase tracking-wide mb-1.5">
                  Clues
                </p>
                <div className="flex flex-wrap gap-2">
                  {reward!.words.map((w) => (
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
            {reward!.flags && reward!.flags.length > 0 && (
              <div>
                <p className="text-muted text-xs uppercase tracking-wide mb-1.5">
                  Flags
                </p>
                <div className="flex flex-wrap gap-2">
                  {reward!.flags.map((f) => (
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
      </div>
    );
  }

  return (
    <div className="border border-gold/20 bg-surface-2 p-5 mb-4">
      <p className="text-muted text-sm italic mb-4">{prompt.question}</p>

      {/* Template with gaps */}
      <div className="flex flex-wrap items-baseline gap-x-1 gap-y-2 mb-5 text-cream leading-relaxed">
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
      {wrongHints.length > 0 && (
        <div className="mt-3 space-y-1">
          {wrongHints.map((hint, i) => (
            <p key={i} className="text-muted text-xs italic">{hint}</p>
          ))}
        </div>
      )}
    </div>
  );
}
