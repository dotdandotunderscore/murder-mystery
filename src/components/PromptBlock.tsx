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
  submitted_words?: string[] | null;
}

interface PromptBlockProps {
  prompt: Prompt;
  selectedWord: string | null;
  onGapClick: (promptId: number, gapIndex: number, currentWord: string | null) => void;
  placements: (string | null)[];
  onCorrect?: () => void;
  onCode?: (phrase: string) => void;
  onPendingDirt?: (dirt: { rumour: string; flavour: string }[]) => void;
}

// Splits a template string on "_____" (5 underscores) into text segments.
// e.g. "Found at _____ in the _____." → ["Found at ", " in the ", "."]
function parseTemplate(template: string): string[] {
  return template.split("_____");
}

// Splits template segments into lines. Each line is an array of { text, gapAfter } items.
// This lets us render each line as its own flex row so \n actually breaks.
function segmentsToLines(segments: string[]): { text: string; gapAfter: boolean }[][] {
  const lines: { text: string; gapAfter: boolean }[][] = [[]];
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i]!;
    const hasGap = i < segments.length - 1;
    const parts = seg.split("\n");
    for (let j = 0; j < parts.length; j++) {
      if (j > 0) lines.push([]);
      const isLastPart = j === parts.length - 1;
      lines[lines.length - 1]!.push({ text: parts[j]!, gapAfter: isLastPart && hasGap });
    }
  }
  return lines;
}


export default function PromptBlock({
  prompt,
  selectedWord,
  onGapClick,
  placements,
  onCorrect,
  onCode,
  onPendingDirt,
}: PromptBlockProps) {
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(prompt.completed);
  const [wrong, setWrong] = useState(false);
  const [wrongHints, setWrongHints] = useState<string[]>([]);
  const [genericWrongText, setGenericWrongText] = useState<string | null>(null);
  const [reward, setReward] = useState<{ flags?: string[]; words?: string[]; successText?: string } | null>(null);

  // Clear wrong feedback when the player changes their answer
  useEffect(() => {
    if (wrong || wrongHints.length > 0 || genericWrongText) {
      setWrong(false);
      setWrongHints([]);
      setGenericWrongText(null);
    }
  }, [placements]);

  const segments = parseTemplate(prompt.template);
  const gapCount = segments.length - 1;
  const lines = segmentsToLines(segments);
  // Map (lineIndex, itemIndex) → flat gap index
  const gapIndex = (li: number, ii: number): number => {
    let count = 0;
    for (let l = 0; l < lines.length; l++) {
      for (let i = 0; i < lines[l]!.length; i++) {
        if (l === li && i === ii) return count;
        if (lines[l]![i]!.gapAfter) count++;
      }
    }
    return count;
  };
  const allFilled = placements.slice(0, gapCount).every((w) => w !== null);

  const handleSubmit = async () => {
    if (!allFilled || submitting) return;
    setSubmitting(true);
    setWrong(false);
    setWrongHints([]);
    setGenericWrongText(null);
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
        if (data.pending_dirt?.length && onPendingDirt) onPendingDirt(data.pending_dirt);
        onCorrect?.();
      } else {
        setWrong(true);
        if (data.hints?.length) setWrongHints(data.hints);
        if (data.generic_wrong_text) setGenericWrongText(data.generic_wrong_text);
      }
    } catch {
      setWrong(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (completed) {
    const rawSuccessText = reward?.successText ?? prompt.success_text;
    // Replace [1], [2], etc. with the words the player submitted
    const submittedWords = prompt.submitted_words ?? placements;
    const successText = rawSuccessText?.replace(/\[(\d+)\]/g, (_, n) => {
      const word = submittedWords[parseInt(n) - 1];
      return word ?? `[${n}]`;
    }) ?? null;
    const highlightTerms = [
      ...(prompt.grants_words ?? []),
      ...(prompt.grants_flags ?? []),
      ...(submittedWords.filter(Boolean) as string[]),
    ];
    const hasRewardGrants =
      (reward?.words?.length ?? 0) > 0 || (reward?.flags?.length ?? 0) > 0;

    return (
      <div className="border border-gold/30 bg-surface-2 p-5 mb-4">
        <p className="text-gold text-xs tracking-[0.35em] uppercase mb-2">
          — Solved —
        </p>
        <p className="text-muted text-sm italic mb-2"><RichText text={prompt.question} onCode={onCode} /></p>
        <div className="text-cream leading-loose">
          {lines.map((line, li) => (
            <React.Fragment key={li}>
              {li > 0 && <br />}
              {line.map((item, ii) => (
                <React.Fragment key={ii}>
                  {item.text && <RichText text={item.text} onCode={onCode} />}
                  {item.gapAfter && (
                    <span className="inline-flex items-center border-b border-gold/50 text-gold font-mono text-xs px-1.5 py-0.5 mx-0.5 align-baseline">
                      {placements[gapIndex(li, ii)] ?? "—"}
                    </span>
                  )}
                </React.Fragment>
              ))}
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
      <p className="text-muted text-sm italic mb-4"><RichText text={prompt.question} onCode={onCode} /></p>

      {/* Template with gaps */}
      <div className="mb-5 text-cream leading-loose">
        {lines.map((line, li) => (
          <React.Fragment key={li}>
            {li > 0 && <br />}
            {line.map((item, ii) => (
              <React.Fragment key={ii}>
                {item.text && <RichText text={item.text} onCode={onCode} />}
                {item.gapAfter && (() => {
                  const gi = gapIndex(li, ii);
                  return (
                    <button
                      onClick={() => onGapClick(prompt.id, gi, placements[gi] ?? null)}
                      className={`
                        inline-flex items-center justify-center min-w-[5rem] px-1.5 py-0.5 mx-0.5
                        border-b-2 text-xs font-mono tracking-wide transition-all align-baseline
                        ${placements[gi]
                          ? "border-gold text-gold bg-gold/10"
                          : selectedWord
                          ? "border-gold/60 text-muted/60 hover:border-gold animate-pulse"
                          : "border-gold/30 text-muted/40"
                        }
                      `}
                    >
                      {placements[gi] ?? (selectedWord ? "place here" : "·····")}
                    </button>
                  );
                })()}
              </React.Fragment>
            ))}
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
      {(wrongHints.length > 0 || genericWrongText) && (
        <div className="mt-3 space-y-1">
          {wrongHints.map((hint, i) => (
            <p key={i} className="text-muted text-xs italic"><RichText text={hint} /></p>
          ))}
          {genericWrongText && (
            <p className="text-muted text-xs italic"><RichText text={genericWrongText} /></p>
          )}
        </div>
      )}
    </div>
  );
}
