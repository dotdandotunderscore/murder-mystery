import React, { useState, useEffect } from "react";

// ── Constants ──────────────────────────────────────────────────────────────────

export const fieldCls =
  "bg-ink border border-gold/30 text-cream px-4 py-2.5 text-sm focus:outline-none focus:border-gold transition-colors";
export const inputCls = `w-full ${fieldCls}`;

export const saveBtnCls =
  "w-full bg-gold text-ink py-3 text-xs tracking-widest uppercase font-semibold hover:bg-gold-light transition-colors disabled:opacity-50 mt-1";

// ── Helpers ────────────────────────────────────────────────────────────────────

// Safely parse an error response that may or may not be JSON
export async function getErrorMessage(res: Response): Promise<string> {
  try {
    const data = await res.json();
    return data.error ?? "Failed to save";
  } catch {
    return `Server error (${res.status})`;
  }
}

// Filter blank entries; return null when empty (DB expects null not [])
export function toArr(arr: string[]): string[] | null {
  const filtered = arr.filter(Boolean);
  return filtered.length > 0 ? filtered : null;
}

// ── Shared UI ──────────────────────────────────────────────────────────────────

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="fixed inset-0 bg-ink/80 animate-fade-in-fast" onClick={onClose} />
      <div className="fixed top-3 bottom-3 inset-x-0 xl:left-[12.5%] xl:right-[12.5%] bg-surface-3 border border-gold/30 flex flex-col animate-fade-in">
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-gold/20 bg-surface-3 shrink-0">
          <h3 className="text-xl text-cream">{title}</h3>
          <button
            onClick={onClose}
            className="text-muted hover:text-cream transition-colors text-2xl leading-none pb-0.5"
          >
            ×
          </button>
        </div>
        <div className="px-6 py-5 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
}

export function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 transition-colors shrink-0 ${
        checked ? "bg-gold" : "bg-surface-2 outline outline-1 outline-gold/30"
      }`}
    >
      <span
        className={`absolute top-1 left-1 w-4 h-4 bg-cream transition-transform ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-5">
      <label className="block text-gold text-xs tracking-widest uppercase mb-2">
        {label}
      </label>
      {children}
      {hint && <p className="text-muted text-xs mt-1.5">{hint}</p>}
    </div>
  );
}

export function AutocompleteInput({
  value,
  onChange,
  suggestions = [],
  className,
  placeholder,
  autoCapitalize,
  autoCorrect,
  spellCheck,
}: {
  value: string;
  onChange: (v: string) => void;
  suggestions?: string[];
  className?: string;
  placeholder?: string;
  autoCapitalize?: string;
  autoCorrect?: string;
  spellCheck?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const filtered = (
    value
      ? suggestions.filter(
          (s) =>
            s.toLowerCase().includes(value.toLowerCase()) &&
            s.toLowerCase() !== value.toLowerCase()
        )
      : suggestions
  ).slice(0, 8);

  return (
    <div className={`relative ${className ?? ""}`}>
      <input
        className={`w-full ${fieldCls}`}
        value={value}
        onChange={(e) => { onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 200)}
        placeholder={placeholder}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
        spellCheck={spellCheck}
      />
      {open && filtered.length > 0 && (
        <ul className="absolute top-full left-0 right-0 z-50 bg-surface-3 border border-gold/30 border-t-0 max-h-40 overflow-y-auto">
          {filtered.map((s) => (
            <li key={s}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => { onChange(s); setOpen(false); }}
                className="w-full text-left px-4 py-2 text-sm text-cream hover:bg-gold/10 active:bg-gold/20 transition-colors"
              >
                {s}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function TagInput({
  values,
  onChange,
  placeholder,
  suggestions = [],
}: {
  values: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
  suggestions?: string[];
}) {
  const update = (i: number, val: string) => {
    const next = [...values];
    next[i] = val;
    onChange(next);
  };
  const remove = (i: number) => onChange(values.filter((_, j) => j !== i));
  const add = () => onChange([...values, ""]);
  return (
    <div className="space-y-2">
      {values.map((v, i) => (
        <div key={i} className="flex gap-2">
          <AutocompleteInput
            className="flex-1 min-w-0"
            value={v}
            onChange={(val) => update(i, val)}
            placeholder={placeholder}
            suggestions={suggestions}
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
          />
          <button
            type="button"
            onClick={() => remove(i)}
            className="text-muted hover:text-danger transition-colors text-xl leading-none px-1 shrink-0"
          >
            −
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="text-gold text-xs tracking-widest uppercase hover:text-gold-light transition-colors"
      >
        + Add
      </button>
    </div>
  );
}

// ── Required Flags Editor ──────────────────────────────────────────────────────

export function RequiredFlagsEditor({
  flags,
  hints,
  onChange,
  flagSuggestions = [],
}: {
  flags: string[];
  hints: string[];
  onChange: (flags: string[], hints: string[]) => void;
  flagSuggestions?: string[];
}) {
  const rows = flags.map((f, i) => ({ flag: f, hint: hints[i] ?? "" }));

  const update = (i: number, key: "flag" | "hint", val: string) => {
    const next = rows.map((r, j) => (j === i ? { ...r, [key]: val } : r));
    onChange(next.map((r) => r.flag), next.map((r) => r.hint));
  };
  const remove = (i: number) => {
    const next = rows.filter((_, j) => j !== i);
    onChange(next.map((r) => r.flag), next.map((r) => r.hint));
  };
  const add = () => onChange([...flags, ""], [...hints, ""]);

  return (
    <div className="space-y-2">
      {rows.map((row, i) => (
        <div key={i} className="flex gap-2">
          <AutocompleteInput
            className="w-5/12 shrink-0"
            value={row.flag}
            onChange={(val) => update(i, "flag", val)}
            placeholder="e.g. found the body"
            suggestions={flagSuggestions}
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
          />
          <input
            className={`flex-1 min-w-0 ${fieldCls}`}
            value={row.hint}
            onChange={(e) => update(i, "hint", e.target.value)}
            placeholder="Hint shown if missing (optional)"
          />
          <button
            type="button"
            onClick={() => remove(i)}
            className="text-muted hover:text-danger transition-colors text-xl leading-none px-1 shrink-0"
          >
            −
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="text-gold text-xs tracking-widest uppercase hover:text-gold-light transition-colors"
      >
        + Add
      </button>
    </div>
  );
}

// ── Wrong Answer Hints Editor ──────────────────────────────────────────────────

export function WrongAnswerHintsEditor({
  rows,
  onChange,
  wordSuggestions = [],
}: {
  rows: { clue: string; hint: string }[];
  onChange: (v: { clue: string; hint: string }[]) => void;
  wordSuggestions?: string[];
}) {
  const update = (i: number, key: "clue" | "hint", val: string) =>
    onChange(rows.map((r, j) => (j === i ? { ...r, [key]: val } : r)));
  const remove = (i: number) => onChange(rows.filter((_, j) => j !== i));
  const add = () => onChange([...rows, { clue: "", hint: "" }]);

  return (
    <div className="space-y-2">
      {rows.map((row, i) => (
        <div key={i} className="flex gap-2">
          <AutocompleteInput
            className="w-5/12 shrink-0"
            value={row.clue}
            onChange={(val) => update(i, "clue", val)}
            placeholder="e.g. KNIFE"
            suggestions={wordSuggestions}
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
          />
          <input
            className={`flex-1 min-w-0 ${fieldCls}`}
            value={row.hint}
            onChange={(e) => update(i, "hint", e.target.value)}
            placeholder="Hint shown if this clue is used"
          />
          <button
            type="button"
            onClick={() => remove(i)}
            className="text-muted hover:text-danger transition-colors text-xl leading-none px-1 shrink-0"
          >
            −
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="text-gold text-xs tracking-widest uppercase hover:text-gold-light transition-colors"
      >
        + Add
      </button>
    </div>
  );
}
