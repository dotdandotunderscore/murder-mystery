import React, { useRef } from "react";
import { inputCls, fieldCls } from "./shared";

// ── Template editor helpers ─────────────────────────────────────────────────────

// Convert stored template + answers back to the [WORD] rich format for editing
export function toRichTemplate(template: string, answers: string[]): string {
  let i = 0;
  return template.replace(/_____/g, () => `[${answers[i++] ?? ""}]`);
}

// Parse [WORD] rich format into the stored template + answer array.
// Supports alternatives: [KNIFE|CANDLESTICK] → answer entry "KNIFE|CANDLESTICK"
export function fromRichTemplate(rich: string): { template: string; answer: string[] } {
  const answer: string[] = [];
  const template = rich.replace(/\[([^\]]*)\]/g, (_, w) => {
    const alts = w.split("|").map((s: string) => s.trim().toUpperCase()).filter(Boolean).join("|");
    answer.push(alts);
    return "_____";
  });
  return { template, answer };
}

export function TemplateEditor({
  value,
  onChange,
  wordSuggestions,
}: {
  value: string;
  onChange: (v: string) => void;
  wordSuggestions: string[];
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const insertWord = (word: string) => {
    const el = inputRef.current;
    const insertion = `[${word}]`;
    if (!el) { onChange(value + insertion); return; }
    const start = el.selectionStart ?? value.length;
    const end = el.selectionEnd ?? start;
    const next = value.slice(0, start) + insertion + value.slice(end);
    onChange(next);
    requestAnimationFrame(() => {
      el.focus();
      const pos = start + insertion.length;
      el.setSelectionRange(pos, pos);
    });
  };

  const gaps = [...value.matchAll(/\[([^\]]*)\]/g)]
    .map((m) => (m[1] ?? "").split("|").map((s) => s.trim().toUpperCase()).filter(Boolean).join(" / "))
    .filter(Boolean);

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        className={inputCls}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g. The [CANDLESTICK|KNIFE] was found in the [LIBRARY]."
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
      />
      {wordSuggestions.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {wordSuggestions.map((w) => (
            <button
              key={w}
              type="button"
              onClick={() => insertWord(w)}
              className="border border-gold/25 text-muted font-mono text-xs px-2 py-0.5 hover:border-gold hover:text-gold transition-colors"
            >
              {w}
            </button>
          ))}
        </div>
      )}
      {gaps.length > 0 && (
        <p className="text-muted text-xs">
          {gaps.length} gap{gaps.length !== 1 ? "s" : ""}:{" "}
          <span className="text-cream font-mono">{gaps.join(" → ")}</span>
        </p>
      )}
    </div>
  );
}
