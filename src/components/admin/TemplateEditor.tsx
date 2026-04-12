import React, { useRef } from "react";
import { inputCls, fieldCls } from "./shared";

// ── Template editor helpers ─────────────────────────────────────────────────────

// Convert stored template + answers back to the [WORD] rich format for editing
export function toRichTemplate(template: string, answers: string[]): string {
  let i = 0;
  return template.replace(/_____/g, () => {
    const a = answers[i++] ?? "";
    return a === "*" ? "[_]" : `[${a}]`;
  });
}

// Parse [WORD] rich format into the stored template + answer array.
// Supports alternatives: [KNIFE|CANDLESTICK] → answer entry "KNIFE|CANDLESTICK"
// Supports wildcard: [_] → answer entry "*" (any clue accepted)
export function fromRichTemplate(rich: string): { template: string; answer: string[] } {
  const answer: string[] = [];
  const template = rich.replace(/\[([^\]]*)\]/g, (_, w) => {
    if (w.trim() === "_") {
      answer.push("*");
    } else {
      const alts = w.split("|").map((s: string) => s.trim().toUpperCase()).filter(Boolean).join("|");
      answer.push(alts);
    }
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
  const inputRef = useRef<HTMLTextAreaElement>(null);

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
    .map((m) => {
      const inner = (m[1] ?? "").trim();
      if (inner === "_") return "(any clue)";
      return inner.split("|").map((s) => s.trim().toUpperCase()).filter(Boolean).join(" / ");
    })
    .filter(Boolean);

  return (
    <div className="space-y-2">
      <textarea
        ref={inputRef}
        className={inputCls}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g. The [CANDLESTICK|KNIFE] was found in the [LIBRARY]."
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        rows={3}
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
