import React, { useState, useEffect, useRef } from "react";
import { toast } from "sonner";

// ── Types ──────────────────────────────────────────────────────────────────────

interface Player {
  id: number;
  name: string;
  role: string | null;
  team: string | null;
  is_admin: boolean;
  created_at: string;
}

interface Folder {
  id: number;
  name: string;
  parent_id: number | null;
  sort_order: number;
}

interface Page {
  id: number;
  code_phrase: string;
  title: string;
  content: string;
  page_type: string;
  visible_to_roles: string[] | null;
  visible_to_players: number[] | null;
  required_flags: string[] | null;
  required_flags_hints: string[] | null;
  grants_flags: string[] | null;
  grants_words: string[] | null;
  removes_flags: string[] | null;
  removes_words: string[] | null;
  game_config: Record<string, unknown> | null;
  sort_order: number;
  folder_id: number | null;
}

interface Prompt {
  id: number;
  page_id: number;
  question: string;
  template: string;
  answer: string[];
  grants_flags: string[] | null;
  grants_words: string[] | null;
  removes_flags: string[] | null;
  removes_words: string[] | null;
  success_text: string | null;
  wrong_answer_hints: Record<string, string> | null;
  sort_order: number;
}

interface Progress {
  player: Player;
  flags: string[];
  words: string[];
}

// Safely parse an error response that may or may not be JSON
async function getErrorMessage(res: Response): Promise<string> {
  try {
    const data = await res.json();
    return data.error ?? "Failed to save";
  } catch {
    return `Server error (${res.status})`;
  }
}

// ── Shared UI ──────────────────────────────────────────────────────────────────

function Modal({
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
        <div className="sticky top-0 flex items-center justify-between px-6 py-4 border-b border-gold/20 bg-surface-3 shrink-0">
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

function Toggle({
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

function Field({
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

const fieldCls =
  "bg-ink border border-gold/30 text-cream px-4 py-2.5 text-sm focus:outline-none focus:border-gold transition-colors";
const inputCls = `w-full ${fieldCls}`;

const saveBtnCls =
  "w-full bg-gold text-ink py-3 text-xs tracking-widest uppercase font-semibold hover:bg-gold-light transition-colors disabled:opacity-50 mt-1";

// ── Players Panel ──────────────────────────────────────────────────────────────

const defaultPlayerForm = { name: "", pin: "", role: "", team: "", is_admin: false };

function PlayersPanel() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Player | null>(null);
  const [form, setForm] = useState(defaultPlayerForm);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/players");
    if (res.ok) setPlayers(await res.json());
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(defaultPlayerForm);
    setModalOpen(true);
  };

  const openEdit = (p: Player) => {
    setEditing(p);
    setForm({ name: p.name, pin: "", role: p.role ?? "", team: p.team ?? "", is_admin: p.is_admin });
    setModalOpen(true);
  };

  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const body = {
      name: form.name.trim(),
      pin: form.pin.trim(),
      role: form.role.trim() || null,
      team: form.team.trim() || null,
      is_admin: form.is_admin,
    };
    const res = editing
      ? await fetch(`/api/admin/players/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        })
      : await fetch("/api/admin/players", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
    if (res.ok) {
      setModalOpen(false);
      load();
      toast.success(editing ? "Player updated" : "Player created");
    } else {
      toast.error(await getErrorMessage(res));
    }
    setSaving(false);
  };

  const handleDelete = async (id: number) => {
    const res = await fetch(`/api/admin/players/${id}`, { method: "DELETE" });
    if (res.ok) {
      load();
      toast.success("Player deleted");
    } else {
      toast.error("Failed to delete");
    }
    setConfirmDelete(null);
  };

  return (
    <>
      <div className="flex items-center justify-between mb-5">
        <span className="text-muted text-xs tracking-widest uppercase">
          {players.length} player{players.length !== 1 ? "s" : ""}
        </span>
        <button
          onClick={openCreate}
          className="bg-gold text-ink px-4 py-2 text-xs tracking-widest uppercase font-semibold hover:bg-gold-light transition-colors"
          style={{ fontFamily: "var(--font-family-display)" }}
        >
          Add Player
        </button>
      </div>

      {loading ? (
        <p className="text-muted text-sm text-center py-10">Loading…</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gold/20">
                {["Name", "Role", "Team", ""].map((h) => (
                  <th
                    key={h}
                    className="text-left text-gold text-xs tracking-widest uppercase font-normal py-3 pr-4"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {players.map((p) => (
                <tr key={p.id} className="border-b border-gold/10">
                  <td className="py-3 pr-4 text-cream">
                    {p.name}
                    {p.is_admin && (
                      <span className="text-gold text-xs tracking-widest ml-2">Admin</span>
                    )}
                  </td>
                  <td className="py-3 pr-4 text-muted">{p.role ?? "—"}</td>
                  <td className="py-3 pr-4 text-muted">{p.team ?? "—"}</td>
                  <td className="py-3 text-right whitespace-nowrap">
                    {confirmDelete === p.id ? (
                      <span className="inline-flex items-center gap-3">
                        <span className="text-muted text-xs">Delete?</span>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="text-danger text-xs hover:underline"
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => setConfirmDelete(null)}
                          className="text-muted text-xs hover:text-cream"
                        >
                          No
                        </button>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-4">
                        <button
                          onClick={() => openEdit(p)}
                          className="text-gold text-xs tracking-widest uppercase hover:text-gold-light transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setConfirmDelete(p.id)}
                          className="text-muted text-xs tracking-widest uppercase hover:text-danger transition-colors"
                        >
                          Delete
                        </button>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {players.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="py-10 text-center text-muted text-sm"
                  >
                    No players yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Player" : "Add Player"}
      >
        <form onSubmit={handleSave}>
          <Field label="Character Name">
            <input
              className={inputCls}
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              required
              autoCapitalize="words"
            />
          </Field>
          <Field
            label="PIN"
            hint={editing ? "Leave blank to keep current PIN" : undefined}
          >
            <input
              className={inputCls}
              value={form.pin}
              onChange={(e) => set("pin", e.target.value)}
              placeholder={editing ? "(unchanged)" : "e.g. 7421"}
              required={!editing}
            />
          </Field>
          <Field label="Role" hint="Optional — e.g. detective, suspect">
            <input
              className={inputCls}
              value={form.role}
              onChange={(e) => set("role", e.target.value)}
              placeholder="Leave blank for no role"
            />
          </Field>
          <Field label="Team" hint="Optional — e.g. 1, 2">
            <input
              className={inputCls}
              value={form.team}
              onChange={(e) => set("team", e.target.value)}
              placeholder="Leave blank for no team"
            />
          </Field>
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-gold text-xs tracking-widest uppercase">
                Admin Access
              </p>
              <p className="text-muted text-xs mt-1">Can access the admin panel</p>
            </div>
            <Toggle
              checked={form.is_admin}
              onChange={(v) => set("is_admin", v)}
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className={saveBtnCls}
            style={{ fontFamily: "var(--font-family-display)" }}
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </form>
      </Modal>
    </>
  );
}

// ── Shared helpers ─────────────────────────────────────────────────────────────

// Filter blank entries; return null when empty (DB expects null not [])
function toArr(arr: string[]): string[] | null {
  const filtered = arr.filter(Boolean);
  return filtered.length > 0 ? filtered : null;
}

function AutocompleteInput({
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

function TagInput({
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

function RequiredFlagsEditor({
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

function WrongAnswerHintsEditor({
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

// ── Template editor helpers ─────────────────────────────────────────────────────

// Convert stored template + answers back to the [WORD] rich format for editing
function toRichTemplate(template: string, answers: string[]): string {
  let i = 0;
  return template.replace(/_____/g, () => `[${answers[i++] ?? ""}]`);
}

// Parse [WORD] rich format into the stored template + answer array.
// Supports alternatives: [KNIFE|CANDLESTICK] → answer entry "KNIFE|CANDLESTICK"
function fromRichTemplate(rich: string): { template: string; answer: string[] } {
  const answer: string[] = [];
  const template = rich.replace(/\[([^\]]*)\]/g, (_, w) => {
    const alts = w.split("|").map((s: string) => s.trim().toUpperCase()).filter(Boolean).join("|");
    answer.push(alts);
    return "_____";
  });
  return { template, answer };
}

function TemplateEditor({
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

// ── Suggestions type ───────────────────────────────────────────────────────────

type Suggestions = {
  flags: string[];
  words: string[];
  roles: string[];
  players: { id: number; name: string }[];
};
const emptySuggestions: Suggestions = { flags: [], words: [], roles: [], players: [] };

// ── Prompt Modal ───────────────────────────────────────────────────────────────

const defaultPromptForm = {
  page_id: "" as string | number,
  question: "",
  rich_template: "",
  grants_flags: [] as string[],
  grants_words: [] as string[],
  removes_flags: [] as string[],
  removes_words: [] as string[],
  success_text: "",
  wrong_answer_hints: [] as { clue: string; hint: string }[],
  sort_order: 0,
};

interface PromptModalProps {
  open: boolean;
  onClose: () => void;
  editing: Prompt | null;
  presetPageId?: number;
  pages: Page[];
  suggestions: Suggestions;
  onSaved: () => void;
}

function PromptModal({ open, onClose, editing, presetPageId, pages, suggestions, onSaved }: PromptModalProps) {
  const [form, setForm] = useState(defaultPromptForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (editing) {
      const wah: { clue: string; hint: string }[] = editing.wrong_answer_hints
        ? Object.entries(editing.wrong_answer_hints).map(([clue, hint]) => ({ clue, hint: hint as string }))
        : [];
      setForm({
        page_id: editing.page_id,
        question: editing.question,
        rich_template: toRichTemplate(editing.template, editing.answer ?? []),
        grants_flags: editing.grants_flags ?? [],
        grants_words: editing.grants_words ?? [],
        removes_flags: editing.removes_flags ?? [],
        removes_words: editing.removes_words ?? [],
        success_text: editing.success_text ?? "",
        wrong_answer_hints: wah,
        sort_order: editing.sort_order,
      });
    } else {
      setForm({ ...defaultPromptForm, page_id: presetPageId ?? (pages[0]?.id ?? "") });
    }
  }, [open, editing, presetPageId]);

  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { template, answer } = fromRichTemplate(form.rich_template.trim());
    const wahEntries = (form.wrong_answer_hints as { clue: string; hint: string }[])
      .filter((r) => r.clue.trim() && r.hint.trim());
    const wrong_answer_hints = wahEntries.length > 0
      ? Object.fromEntries(wahEntries.map((r) => [r.clue.trim().toUpperCase(), r.hint.trim()]))
      : null;
    const body = {
      page_id: Number(form.page_id),
      question: form.question.trim(),
      template,
      answer,
      grants_flags: toArr(form.grants_flags as string[]),
      grants_words: toArr(form.grants_words as string[]),
      removes_flags: toArr(form.removes_flags as string[]),
      removes_words: toArr(form.removes_words as string[]),
      success_text: form.success_text.trim() || null,
      wrong_answer_hints,
      sort_order: form.sort_order,
    };
    const res = editing
      ? await fetch(`/api/admin/prompts/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        })
      : await fetch("/api/admin/prompts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
    if (res.ok) {
      onClose();
      onSaved();
      toast.success(editing ? "Prompt updated" : "Prompt created");
    } else {
      toast.error(await getErrorMessage(res));
    }
    setSaving(false);
  };

  return (
    <Modal open={open} onClose={onClose} title={editing ? "Edit Prompt" : "Add Prompt"}>
      <form onSubmit={handleSave}>
        <Field label="Page">
          <select
            className={`${inputCls} cursor-pointer`}
            value={form.page_id}
            onChange={(e) => set("page_id", e.target.value)}
            required
          >
            {pages.map((p) => (
              <option key={p.id} value={p.id}>{p.title} ({p.code_phrase})</option>
            ))}
          </select>
        </Field>
        <Field label="Question" hint="Shown above the fill-in-the-gap sentence">
          <input
            className={inputCls}
            value={form.question}
            onChange={(e) => set("question", e.target.value)}
            placeholder="Where was the body found?"
            required
          />
        </Field>
        <Field label="Template" hint="Use [WORD] to mark each gap, or [WORD1|WORD2] to accept alternatives — click a word below to insert">
          <TemplateEditor
            value={form.rich_template}
            onChange={(v) => set("rich_template", v)}
            wordSuggestions={suggestions.words}
          />
        </Field>
        <Field label="Wrong Answer Hints" hint="Show a hint when a specific clue is used incorrectly">
          <WrongAnswerHintsEditor
            rows={form.wrong_answer_hints as { clue: string; hint: string }[]}
            onChange={(v) => set("wrong_answer_hints", v)}
            wordSuggestions={suggestions.words}
          />
        </Field>
        <Field label="Success Text" hint="Optional — shown after a correct answer. Use [[code-phrase]] for clickable links.">
          <textarea
            className={`${inputCls} resize-none`}
            rows={3}
            value={form.success_text}
            onChange={(e) => set("success_text", e.target.value)}
            placeholder="Well done! You've uncovered…"
          />
        </Field>
        <Field label="Grants Flags" hint="Flags awarded on correct answer">
          <TagInput
            values={form.grants_flags as string[]}
            onChange={(v) => set("grants_flags", v)}
            placeholder="e.g. solved the cipher"
            suggestions={suggestions.flags}
          />
        </Field>
        <Field label="Grants Clues" hint="Words added to inventory on correct answer">
          <TagInput
            values={form.grants_words as string[]}
            onChange={(v) => set("grants_words", v)}
            placeholder="e.g. SECRET PASSAGE"
            suggestions={suggestions.words}
          />
        </Field>
        <Field label="Removes Flags" hint="Flags stripped from the player on correct answer">
          <TagInput
            values={form.removes_flags as string[]}
            onChange={(v) => set("removes_flags", v)}
            placeholder="e.g. has alibi"
            suggestions={suggestions.flags}
          />
        </Field>
        <Field label="Removes Clues" hint="Words removed from inventory on correct answer">
          <TagInput
            values={form.removes_words as string[]}
            onChange={(v) => set("removes_words", v)}
            placeholder="e.g. SECRET PASSAGE"
            suggestions={suggestions.words}
          />
        </Field>
        <Field label="Order">
          <input
            className={inputCls}
            type="number"
            value={form.sort_order}
            onChange={(e) => set("sort_order", parseInt(e.target.value) || 0)}
          />
        </Field>
        <button type="submit" disabled={saving} className={saveBtnCls} style={{ fontFamily: "var(--font-family-display)" }}>
          {saving ? "Saving…" : "Save"}
        </button>
      </form>
    </Modal>
  );
}

// ── Pages Panel (tree view) ────────────────────────────────────────────────────

const defaultPageForm = {
  code_phrase: "",
  title: "",
  content: "",
  page_type: "text",
  visible_to_roles: [] as string[],
  visible_to_players: [] as string[],
  required_flags: [] as string[],
  required_flags_hints: [] as string[],
  grants_flags: [] as string[],
  grants_words: [] as string[],
  removes_flags: [] as string[],
  removes_words: [] as string[],
  game_config: {} as Record<string, unknown>,
  folder_id: null as number | null,
};

// DFS folder options for select dropdown with depth-based indent
function folderOptions(
  folders: Folder[],
  parentId: number | null = null,
  depth = 0
): { folder: Folder; depth: number }[] {
  const children = folders
    .filter((f) => f.parent_id === parentId)
    .sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name));
  const result: { folder: Folder; depth: number }[] = [];
  for (const child of children) {
    result.push({ folder: child, depth });
    result.push(...folderOptions(folders, child.id, depth + 1));
  }
  return result;
}

function PagesPanel() {
  const [pages, setPages] = useState<Page[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestions>(emptySuggestions);
  const [expandedFolders, setExpandedFolders] = useState<Set<number>>(new Set());
  const [expandedPages, setExpandedPages] = useState<Set<number>>(new Set());
  const [search, setSearch] = useState("");
  const [dragOverFolder, setDragOverFolder] = useState<number | "root" | null>(null);
  const [dragOverPage, setDragOverPage] = useState<{ id: number; position: "before" | "after" } | null>(null);
  const [touchDragging, setTouchDragging] = useState<Page | null>(null);
  const [ghostPos, setGhostPos] = useState<{ x: number; y: number } | null>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchDragInitiated = useRef(false);
  const pageRowRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const folderRowRefs = useRef<Map<number | "root", HTMLDivElement>>(new Map());
  const [renamingFolder, setRenamingFolder] = useState<number | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [creatingInFolder, setCreatingInFolder] = useState<number | "root" | null>(null);
  const [newFolderName, setNewFolderName] = useState("");
  const [promptModal, setPromptModal] = useState<{ open: boolean; editing: Prompt | null; presetPageId?: number }>({ open: false, editing: null });
  const [form, setForm] = useState(defaultPageForm);
  const [editing, setEditing] = useState<Page | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [confirmDeleteFolder, setConfirmDeleteFolder] = useState<number | null>(null);
  const [confirmDeletePrompt, setConfirmDeletePrompt] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [pagesRes, foldersRes, promptsRes, suggRes] = await Promise.all([
        fetch("/api/admin/pages"),
        fetch("/api/admin/folders"),
        fetch("/api/admin/prompts"),
        fetch("/api/admin/suggestions"),
      ]);
      if (pagesRes.ok) setPages(await pagesRes.json());
      if (foldersRes.ok) setFolders(await foldersRes.json());
      if (promptsRes.ok) {
        const pr = await promptsRes.json();
        setPrompts(Array.isArray(pr) ? pr : []);
      }
      if (suggRes.ok) setSuggestions(await suggRes.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // Prevent page scroll while a touch drag is in progress
  useEffect(() => {
    if (!touchDragging) return;
    const prevent = (e: TouchEvent) => e.preventDefault();
    document.addEventListener("touchmove", prevent, { passive: false });
    return () => document.removeEventListener("touchmove", prevent);
  }, [!!touchDragging]);

  const playerName = (id: number) =>
    suggestions.players.find((p) => p.id === id)?.name ?? String(id);
  const playerId = (name: string) =>
    suggestions.players.find((p) => p.name === name)?.id ?? Number(name);

  // ── Page CRUD ──────────────────────────────────────────────────────────────

  const openCreate = () => {
    setEditing(null);
    setForm(defaultPageForm);
    setModalOpen(true);
  };

  const openEdit = (c: Page) => {
    setEditing(c);
    setForm({
      code_phrase: c.code_phrase,
      title: c.title,
      content: c.content,
      page_type: c.page_type,
      visible_to_roles: c.visible_to_roles ?? [],
      visible_to_players: (c.visible_to_players ?? []).map(playerName),
      required_flags: c.required_flags ?? [],
      required_flags_hints: c.required_flags_hints ?? [],
      grants_flags: c.grants_flags ?? [],
      grants_words: c.grants_words ?? [],
      removes_flags: c.removes_flags ?? [],
      removes_words: c.removes_words ?? [],
      game_config: (c.game_config as Record<string, unknown>) ?? {},
      folder_id: c.folder_id ?? null,
    });
    setModalOpen(true);
  };

  const setF = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const flagHintPairs = form.required_flags
      .map((f, i) => ({ flag: f.trim().toLowerCase(), hint: (form.required_flags_hints[i] ?? "").trim() }))
      .filter((p) => p.flag);
    const required_flags = flagHintPairs.length > 0 ? flagHintPairs.map((p) => p.flag) : null;
    const required_flags_hints =
      flagHintPairs.length > 0 && flagHintPairs.some((p) => p.hint)
        ? flagHintPairs.map((p) => p.hint)
        : null;

    const body = {
      code_phrase: form.code_phrase.trim().toLowerCase(),
      title: form.title.trim(),
      content: form.content,
      page_type: form.page_type,
      visible_to_roles: toArr(form.visible_to_roles),
      visible_to_players: toArr(form.visible_to_players)?.map(playerId) ?? null,
      required_flags,
      required_flags_hints,
      grants_flags: toArr(form.grants_flags),
      grants_words: toArr(form.grants_words),
      removes_flags: toArr(form.removes_flags),
      removes_words: toArr(form.removes_words),
      game_config: Object.keys(form.game_config).length > 0 ? form.game_config : null,
      folder_id: form.folder_id ?? null,
    };
    const res = editing
      ? await fetch(`/api/admin/pages/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        })
      : await fetch("/api/admin/pages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
    if (res.ok) {
      setModalOpen(false);
      if (form.folder_id) setExpandedFolders((prev) => new Set([...prev, form.folder_id as number]));
      load();
      toast.success(editing ? "Page updated" : "Page created");
    } else {
      toast.error(await getErrorMessage(res));
    }
    setSaving(false);
  };

  const handleDelete = async (id: number) => {
    const res = await fetch(`/api/admin/pages/${id}`, { method: "DELETE" });
    if (res.ok) {
      load();
      toast.success("Page deleted");
    } else {
      toast.error("Failed to delete");
    }
    setConfirmDelete(null);
  };

  // ── Drag and drop ──────────────────────────────────────────────────────────

  const handleDrop = async (e: React.DragEvent, targetFolderId: number | null) => {
    e.preventDefault();
    setDragOverFolder(null);
    const pageIdStr = e.dataTransfer.getData("pageId");
    const folderIdStr = e.dataTransfer.getData("folderId");

    if (pageIdStr) {
      const pageId = parseInt(pageIdStr);
      const page = pages.find((p) => p.id === pageId);
      if (!page) return;
      setPages((prev) => prev.map((p) => p.id === pageId ? { ...p, folder_id: targetFolderId } : p));
      const res = await fetch(`/api/admin/pages/${pageId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...page, folder_id: targetFolderId }),
      });
      if (!res.ok) { toast.error("Failed to move page"); load(); }
    } else if (folderIdStr) {
      const draggedId = parseInt(folderIdStr);
      if (draggedId === targetFolderId) return;
      // Optimistic update
      setFolders((prev) => prev.map((f) => f.id === draggedId ? { ...f, parent_id: targetFolderId } : f));
      const res = await fetch(`/api/admin/folders/${draggedId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parent_id: targetFolderId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error ?? "Failed to move folder");
        load();
      } else {
        // Auto-expand the target so you can see where it landed
        if (targetFolderId !== null) setExpandedFolders((prev) => new Set([...prev, targetFolderId]));
      }
    }
  };

  const dropPageOnPage = async (draggedPage: Page, targetPage: Page, position: "before" | "after") => {
    const folderPages = pages
      .filter((p) => p.folder_id === targetPage.folder_id)
      .sort((a, b) => a.sort_order - b.sort_order);

    const without = folderPages.filter((p) => p.id !== draggedPage.id);
    const targetIdx = without.findIndex((p) => p.id === targetPage.id);
    const insertAt = position === "before" ? targetIdx : targetIdx + 1;
    const reordered = [...without.slice(0, insertAt), draggedPage, ...without.slice(insertAt)];
    const updates = reordered.map((p, i) => ({ id: p.id, sort_order: i, folder_id: targetPage.folder_id }));

    setPages((prev) => prev.map((p) => {
      const u = updates.find((u) => u.id === p.id);
      return u ? { ...p, sort_order: u.sort_order, folder_id: u.folder_id } : p;
    }));

    const res = await fetch("/api/admin/pages/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ updates }),
    });
    if (!res.ok) { toast.error("Failed to reorder pages"); load(); }
  };

  const handleDropOnPage = async (e: React.DragEvent, targetPage: Page) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const position = e.clientY < rect.top + rect.height / 2 ? "before" : "after";
    setDragOverPage(null);
    setDragOverFolder(null);

    const pageIdStr = e.dataTransfer.getData("pageId");
    if (!pageIdStr) return;
    const draggedPage = pages.find((p) => p.id === parseInt(pageIdStr));
    if (!draggedPage || draggedPage.id === targetPage.id) return;
    await dropPageOnPage(draggedPage, targetPage, position);
  };

  const endTouchDrag = async () => {
    const dragged = touchDragging;
    const overPage = dragOverPage;
    const overFolder = dragOverFolder;

    touchDragInitiated.current = false;
    setTouchDragging(null);
    setGhostPos(null);
    setDragOverPage(null);
    setDragOverFolder(null);

    if (!dragged) return;

    if (overPage && overPage.id !== dragged.id) {
      const target = pages.find((p) => p.id === overPage.id);
      if (target) await dropPageOnPage(dragged, target, overPage.position);
    } else if (overFolder !== null) {
      const folderId = overFolder === "root" ? null : overFolder;
      setPages((prev) => prev.map((p) => p.id === dragged.id ? { ...p, folder_id: folderId } : p));
      const res = await fetch(`/api/admin/pages/${dragged.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...dragged, folder_id: folderId }),
      });
      if (!res.ok) { toast.error("Failed to move page"); load(); }
    }
  };

  // ── Folder CRUD ────────────────────────────────────────────────────────────

  const commitNewFolder = async (parentId: number | null) => {
    const name = newFolderName.trim();
    setCreatingInFolder(null);
    setNewFolderName("");
    if (!name) return;
    const res = await fetch("/api/admin/folders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, parent_id: parentId }),
    });
    if (res.ok) {
      const folder: Folder = await res.json();
      setFolders((prev) => [...prev, folder]);
      if (parentId !== null) setExpandedFolders((prev) => new Set([...prev, parentId]));
    } else {
      toast.error("Failed to create folder");
    }
  };

  const commitRename = async (id: number) => {
    const name = renameValue.trim();
    setRenamingFolder(null);
    if (!name) return;
    const res = await fetch(`/api/admin/folders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (res.ok) {
      const updated: Folder = await res.json();
      setFolders((prev) => prev.map((f) => f.id === id ? updated : f));
    } else {
      toast.error("Failed to rename folder");
    }
  };

  const handleDeleteFolder = async (id: number) => {
    setConfirmDeleteFolder(null);
    const res = await fetch(`/api/admin/folders/${id}`, { method: "DELETE" });
    if (res.ok) {
      setFolders((prev) => prev.filter((f) => f.id !== id));
      toast.success("Folder deleted");
    } else {
      const data = await res.json().catch(() => ({}));
      toast.error(data.error ?? "Failed to delete folder");
    }
  };

  // ── Prompt delete ──────────────────────────────────────────────────────────

  const handleDeletePrompt = async (id: number) => {
    setConfirmDeletePrompt(null);
    const res = await fetch(`/api/admin/prompts/${id}`, { method: "DELETE" });
    if (res.ok) {
      setPrompts((prev) => prev.filter((p) => p.id !== id));
      toast.success("Prompt deleted");
    } else {
      toast.error("Failed to delete prompt");
    }
  };

  // ── Tree rendering ─────────────────────────────────────────────────────────

  const renderTree = (parentId: number | null, depth: number): React.ReactNode => {
    const childFolders = folders
      .filter((f) => f.parent_id === parentId)
      .sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name));
    const childPages = pages
      .filter((p) => p.folder_id === parentId)
      .sort((a, b) => a.sort_order - b.sort_order);

    return (
      <>
        {childFolders.map((folder) => {
          const isExpanded = expandedFolders.has(folder.id);
          const isRenaming = renamingFolder === folder.id;
          const isConfirmingDelete = confirmDeleteFolder === folder.id;
          const isCreatingIn = creatingInFolder === folder.id;
          const isDragOver = dragOverFolder === folder.id;

          const toggleFolderExpand = () => setExpandedFolders((prev) => {
            const next = new Set(prev);
            if (next.has(folder.id)) next.delete(folder.id); else next.add(folder.id);
            return next;
          });

          return (
            <div key={`f-${folder.id}`}>
              {/* Folder row */}
              <div
                ref={(el) => { if (el) folderRowRefs.current.set(folder.id, el); else folderRowRefs.current.delete(folder.id); }}
                className={`flex items-center gap-2 py-1.5 group transition-colors cursor-pointer ${isDragOver ? "ring-1 ring-inset ring-gold bg-gold/10" : "hover:bg-surface-2"}`}
                style={{ paddingLeft: depth * 16 + 8, paddingRight: 8 }}
                draggable
                onClick={() => {
                  if (clickTimerRef.current) {
                    clearTimeout(clickTimerRef.current);
                    clickTimerRef.current = null;
                  } else {
                    clickTimerRef.current = setTimeout(() => {
                      clickTimerRef.current = null;
                      toggleFolderExpand();
                    }, 220);
                  }
                }}
                onDoubleClick={() => {
                  if (clickTimerRef.current) {
                    clearTimeout(clickTimerRef.current);
                    clickTimerRef.current = null;
                  }
                  setRenamingFolder(folder.id);
                  setRenameValue(folder.name);
                }}
                onDragStart={(e) => { e.dataTransfer.setData("folderId", String(folder.id)); e.dataTransfer.effectAllowed = "move"; }}
                onDragOver={(e) => { e.preventDefault(); setDragOverFolder(folder.id); }}
                onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOverFolder(null); }}
                onDrop={(e) => handleDrop(e, folder.id)}
              >
                <span className="text-muted text-xs w-4 shrink-0 select-none">
                  {isExpanded ? "▾" : "▸"}
                </span>
                <span className="text-muted text-xs shrink-0">📁</span>
                {isRenaming ? (
                  <input
                    className={`${fieldCls} flex-1 py-0.5 text-sm`}
                    autoFocus
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") { e.preventDefault(); commitRename(folder.id); }
                      if (e.key === "Escape") setRenamingFolder(null);
                    }}
                    onBlur={() => commitRename(folder.id)}
                  />
                ) : (
                  <span
                    className="text-cream text-sm flex-1 select-none min-w-0 truncate"
                  >
                    {folder.name}
                  </span>
                )}
                {!isRenaming && (
                  <span className={`flex items-center gap-2 shrink-0 ${isConfirmingDelete ? "" : "hidden group-hover:flex"}`}>
                    <button
                      className="text-muted text-xs hover:text-gold transition-colors whitespace-nowrap"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCreatingInFolder(folder.id);
                        setNewFolderName("");
                        setExpandedFolders((prev) => new Set([...prev, folder.id]));
                      }}
                    >
                      + sub-folder
                    </button>
                    {isConfirmingDelete ? (
                      <>
                        <span className="text-muted text-xs">Delete?</span>
                        <button onClick={(e) => { e.stopPropagation(); handleDeleteFolder(folder.id); }} className="text-danger text-xs hover:underline">Yes</button>
                        <button onClick={(e) => { e.stopPropagation(); setConfirmDeleteFolder(null); }} className="text-muted text-xs hover:text-cream">No</button>
                      </>
                    ) : (
                      <button
                        className="text-muted text-xs hover:text-danger transition-colors"
                        onClick={(e) => { e.stopPropagation(); setConfirmDeleteFolder(folder.id); }}
                      >
                        ×
                      </button>
                    )}
                  </span>
                )}
              </div>

              {/* Folder children */}
              {isExpanded && (
                <>
                  {renderTree(folder.id, depth + 1)}
                  {isCreatingIn && (
                    <div style={{ paddingLeft: (depth + 1) * 16 + 8, paddingRight: 8 }} className="py-1.5">
                      <input
                        className={`${inputCls} text-sm py-0.5`}
                        autoFocus
                        value={newFolderName}
                        onChange={(e) => setNewFolderName(e.target.value)}
                        placeholder="Folder name…"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") { e.preventDefault(); commitNewFolder(folder.id); }
                          if (e.key === "Escape") { setCreatingInFolder(null); setNewFolderName(""); }
                        }}
                        onBlur={() => commitNewFolder(folder.id)}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}

        {childPages.map((page) => {
          const isExpanded = expandedPages.has(page.id);
          const pagePrompts = prompts
            .filter((p) => p.page_id === page.id)
            .sort((a, b) => a.sort_order - b.sort_order);

          const togglePageExpand = () => setExpandedPages((prev) => {
            const next = new Set(prev);
            if (next.has(page.id)) next.delete(page.id); else next.add(page.id);
            return next;
          });

          const isDragOverBefore = dragOverPage?.id === page.id && dragOverPage.position === "before";
          const isDragOverAfter = dragOverPage?.id === page.id && dragOverPage.position === "after";

          return (
            <div key={`p-${page.id}`} className={isDragOverBefore ? "border-t-2 border-gold" : isDragOverAfter ? "border-b-2 border-gold" : ""}>
              {/* Page row */}
              <div
                ref={(el) => { if (el) pageRowRefs.current.set(page.id, el); else pageRowRefs.current.delete(page.id); }}
                className="flex items-center gap-2 py-1.5 group hover:bg-surface-2 transition-colors cursor-pointer"
                style={{ paddingLeft: depth * 16 + 8, paddingRight: 8 }}
                draggable
                onClick={() => {
                  if (clickTimerRef.current) {
                    // Second click of a double-click — cancel pending expand, let onDoubleClick handle it
                    clearTimeout(clickTimerRef.current);
                    clickTimerRef.current = null;
                  } else {
                    clickTimerRef.current = setTimeout(() => {
                      clickTimerRef.current = null;
                      togglePageExpand();
                    }, 220);
                  }
                }}
                onDoubleClick={() => {
                  if (clickTimerRef.current) {
                    clearTimeout(clickTimerRef.current);
                    clickTimerRef.current = null;
                  }
                  openEdit(page);
                }}
                onDragStart={(e) => {
                  e.dataTransfer.setData("pageId", String(page.id));
                  e.dataTransfer.effectAllowed = "move";
                }}
                onDragEnd={() => setDragOverPage(null)}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const rect = e.currentTarget.getBoundingClientRect();
                  const position = e.clientY < rect.top + rect.height / 2 ? "before" : "after";
                  setDragOverPage((prev) =>
                    prev?.id === page.id && prev.position === position ? prev : { id: page.id, position }
                  );
                  setDragOverFolder(null);
                }}
                onDragLeave={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOverPage(null);
                }}
                onDrop={(e) => handleDropOnPage(e, page)}
                onTouchStart={(e) => {
                  const touch = e.touches[0];
                  if (!touch) return;
                  const { clientX, clientY } = touch;
                  touchDragInitiated.current = false;
                  longPressTimer.current = setTimeout(() => {
                    touchDragInitiated.current = true;
                    setTouchDragging(page);
                    setGhostPos({ x: clientX, y: clientY });
                    navigator.vibrate?.(40);
                  }, 500);
                }}
                onTouchMove={(e) => {
                  const touch = e.touches[0];
                  if (!touch) return;
                  if (!touchDragInitiated.current) {
                    // Still in long-press window — cancel if finger moved
                    if (longPressTimer.current) {
                      clearTimeout(longPressTimer.current);
                      longPressTimer.current = null;
                    }
                    return;
                  }
                  setGhostPos({ x: touch.clientX, y: touch.clientY });
                  // Hit-test all page rows
                  let found = false;
                  for (const [id, el] of pageRowRefs.current) {
                    const rect = el.getBoundingClientRect();
                    if (touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
                      const pos = touch.clientY < rect.top + rect.height / 2 ? "before" : "after";
                      setDragOverPage((prev) => prev?.id === id && prev.position === pos ? prev : { id, position: pos });
                      setDragOverFolder(null);
                      found = true;
                      break;
                    }
                  }
                  if (!found) {
                    for (const [id, el] of folderRowRefs.current) {
                      const rect = el.getBoundingClientRect();
                      if (touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
                        setDragOverFolder(id);
                        setDragOverPage(null);
                        found = true;
                        break;
                      }
                    }
                  }
                  if (!found) { setDragOverPage(null); setDragOverFolder(null); }
                }}
                onTouchEnd={() => {
                  if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null; }
                  endTouchDrag();
                }}
                onTouchCancel={() => {
                  if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null; }
                  touchDragInitiated.current = false;
                  setTouchDragging(null);
                  setGhostPos(null);
                  setDragOverPage(null);
                  setDragOverFolder(null);
                }}
              >
                <span className="text-muted text-xs w-4 shrink-0 select-none">
                  {isExpanded ? "▾" : "▸"}
                </span>
                <span className="font-mono text-xs text-gold shrink-0">{page.code_phrase}</span>
                <span className="text-cream text-sm flex-1 truncate min-w-0">{page.title}</span>
                <span className="text-muted text-xs hidden sm:block shrink-0">{page.page_type}</span>
<span className={`flex items-center gap-3 shrink-0 ${confirmDelete === page.id ? "" : "hidden group-hover:flex"}`}>
                  {confirmDelete === page.id ? (
                    <>
                      <span className="text-muted text-xs">Delete?</span>
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(page.id); }} className="text-danger text-xs hover:underline">Yes</button>
                      <button onClick={(e) => { e.stopPropagation(); setConfirmDelete(null); }} className="text-muted text-xs hover:text-cream">No</button>
                    </>
                  ) : (
                    <>
                      <button onClick={(e) => { e.stopPropagation(); openEdit(page); }} className="text-gold text-xs tracking-widest uppercase hover:text-gold-light transition-colors">Edit</button>
                      <button onClick={(e) => { e.stopPropagation(); setConfirmDelete(page.id); }} className="text-muted text-xs tracking-widest uppercase hover:text-danger transition-colors">Delete</button>
                    </>
                  )}
                </span>
              </div>

              {/* Inline prompts */}
              {isExpanded && (
                <div>
                  {pagePrompts.map((prompt) => (
                    <div
                      key={`pr-${prompt.id}`}
                      className="flex items-center gap-2 py-1 group hover:bg-surface-2/50 transition-colors cursor-pointer"
                      style={{ paddingLeft: (depth + 1) * 16 + 8, paddingRight: 8 }}
                      onDoubleClick={() => setPromptModal({ open: true, editing: prompt, presetPageId: page.id })}
                    >
                      <span className="text-muted text-xs w-4 shrink-0 text-center">↳</span>
                      <div className="flex-1 min-w-0">
                        <span className="text-cream text-xs">{prompt.question}</span>
                        <span className="text-muted text-xs font-mono ml-2">{prompt.template}</span>
                      </div>
                      <span className={`flex items-center gap-3 shrink-0 ${confirmDeletePrompt === prompt.id ? "" : "hidden group-hover:flex"}`}>
                        {confirmDeletePrompt === prompt.id ? (
                          <>
                            <span className="text-muted text-xs">Delete?</span>
                            <button onClick={() => handleDeletePrompt(prompt.id)} className="text-danger text-xs hover:underline">Yes</button>
                            <button onClick={() => setConfirmDeletePrompt(null)} className="text-muted text-xs hover:text-cream">No</button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => setPromptModal({ open: true, editing: prompt, presetPageId: page.id })}
                              className="text-gold text-xs tracking-widest uppercase hover:text-gold-light transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => setConfirmDeletePrompt(prompt.id)}
                              className="text-muted text-xs tracking-widest uppercase hover:text-danger transition-colors"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </span>
                    </div>
                  ))}
                  <div style={{ paddingLeft: (depth + 1) * 16 + 8, paddingRight: 8 }} className="py-1">
                    <button
                      onClick={() => setPromptModal({ open: true, editing: null, presetPageId: page.id })}
                      className="text-gold text-xs tracking-widest uppercase hover:text-gold-light transition-colors"
                    >
                      + Add Prompt
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </>
    );
  };

  // ── Search mode: flat filtered list ───────────────────────────────────────

  const searchResults = search.trim()
    ? pages.filter(
        (p) =>
          p.title.toLowerCase().includes(search.toLowerCase()) ||
          p.code_phrase.toLowerCase().includes(search.toLowerCase())
      )
    : null;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Top bar */}
      <div className="flex items-center gap-3 mb-4">
        <input
          className={`${fieldCls} flex-1 text-sm`}
          placeholder="Search pages…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          onClick={openCreate}
          className="bg-gold text-ink px-4 py-2 text-xs tracking-widest uppercase font-semibold hover:bg-gold-light transition-colors shrink-0"
          style={{ fontFamily: "var(--font-family-display)" }}
        >
          Add Page
        </button>
      </div>

      {loading ? (
        <p className="text-muted text-sm text-center py-10">Loading…</p>
      ) : searchResults ? (
        /* Search results — flat list */
        <div className="border border-gold/20">
          {searchResults.length === 0 ? (
            <p className="text-muted text-sm text-center py-10">No pages match.</p>
          ) : (
            searchResults.map((page) => (
              <div
                key={page.id}
                className="flex items-center gap-2 py-1.5 px-2 group hover:bg-surface-2 transition-colors border-b border-gold/10 last:border-b-0"
              >
                <span className="font-mono text-xs text-gold shrink-0">{page.code_phrase}</span>
                <span className="text-cream text-sm flex-1 truncate min-w-0">{page.title}</span>
                <span className="hidden group-hover:flex items-center gap-3 shrink-0">
                  <button onClick={() => openEdit(page)} className="text-gold text-xs tracking-widest uppercase hover:text-gold-light transition-colors">Edit</button>
                  <button onClick={() => { setConfirmDelete(page.id); }} className="text-muted text-xs tracking-widest uppercase hover:text-danger transition-colors">Delete</button>
                </span>
              </div>
            ))
          )}
        </div>
      ) : (
        /* Tree view */
        <div className="border border-gold/20">
          {/* Root drop zone + new folder button */}
          <div
            ref={(el) => { if (el) folderRowRefs.current.set("root", el); else folderRowRefs.current.delete("root"); }}
            className={`flex items-center gap-2 py-1.5 px-2 border-b border-gold/10 transition-colors ${dragOverFolder === "root" ? "bg-gold/10 ring-1 ring-inset ring-gold" : ""}`}
            onDragOver={(e) => { e.preventDefault(); setDragOverFolder("root"); }}
            onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOverFolder(null); }}
            onDrop={(e) => handleDrop(e, null)}
          >
            <span className="text-muted text-xs flex-1">Root</span>
            <button
              className="text-gold text-xs tracking-widest uppercase hover:text-gold-light transition-colors"
              onClick={() => { setCreatingInFolder("root"); setNewFolderName(""); }}
            >
              + New Folder
            </button>
          </div>

          {/* Root-level folder creation input */}
          {creatingInFolder === "root" && (
            <div className="px-2 py-1.5 border-b border-gold/10">
              <input
                className={`${inputCls} text-sm py-0.5`}
                autoFocus
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Folder name…"
                onKeyDown={(e) => {
                  if (e.key === "Enter") { e.preventDefault(); commitNewFolder(null); }
                  if (e.key === "Escape") { setCreatingInFolder(null); setNewFolderName(""); }
                }}
                onBlur={() => commitNewFolder(null)}
              />
            </div>
          )}

          {/* Tree */}
          {renderTree(null, 0)}

          {pages.length === 0 && folders.length === 0 && (
            <p className="text-muted text-sm text-center py-10">No pages yet. Add one to get started.</p>
          )}
        </div>
      )}

      {/* Page edit/create modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Page" : "Add Page"}>
        <form onSubmit={handleSave}>
          <Field label="Code Phrase" hint="What players type in — stored lowercase">
            <input
              className={inputCls}
              value={form.code_phrase}
              onChange={(e) => setF("code_phrase", e.target.value)}
              placeholder="e.g. butler did it"
              required
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
            />
          </Field>
          <Field label="Title">
            <input
              className={inputCls}
              value={form.title}
              onChange={(e) => setF("title", e.target.value)}
              placeholder="Heading shown to player"
              required
            />
          </Field>
          <Field label="Folder">
            <select
              className={`${inputCls} cursor-pointer`}
              value={form.folder_id ?? ""}
              onChange={(e) => setF("folder_id", e.target.value === "" ? null : parseInt(e.target.value))}
            >
              <option value="">(Root — no folder)</option>
              {folderOptions(folders).map(({ folder, depth }) => (
                <option key={folder.id} value={folder.id}>
                  {"\u00a0\u00a0".repeat(depth)}{folder.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Content" hint="Use [[code-phrase]] to insert a clickable link to another page">
            <textarea
              className={`${inputCls} resize-none`}
              rows={5}
              value={form.content}
              onChange={(e) => setF("content", e.target.value)}
              placeholder="Page text…"
            />
          </Field>
          <Field label="Type">
            <select
              className={`${inputCls} cursor-pointer`}
              value={form.page_type}
              onChange={(e) => setF("page_type", e.target.value)}
            >
              <option value="text">Text</option>
              <option value="scanner">Scanner</option>
              <option value="scan_target">Scan Target</option>
              <option value="coin_flip">Coin Flip</option>
              <option value="slot_machine">Slot Machine</option>
            </select>
          </Field>
          {form.page_type === "coin_flip" && (
            <Field label="Flips Required" hint="Consecutive correct predictions to win">
              <input
                className={inputCls}
                type="number"
                min={1}
                max={20}
                value={(form.game_config.target as number) ?? 5}
                onChange={(e) =>
                  setF("game_config", { ...form.game_config, target: parseInt(e.target.value) || 5 })
                }
              />
            </Field>
          )}
          {form.page_type === "slot_machine" && (
            <Field label="Jackpot Chance (%)" hint="Probability of hitting the jackpot per spin (0–100)">
              <input
                className={inputCls}
                type="number"
                min={1}
                max={100}
                value={(form.game_config.jackpot_chance as number) ?? 10}
                onChange={(e) =>
                  setF("game_config", { ...form.game_config, jackpot_chance: parseFloat(e.target.value) || 10 })
                }
              />
            </Field>
          )}
          <Field label="Visible to Roles" hint="Blank = all roles">
            <TagInput
              values={form.visible_to_roles}
              onChange={(v) => setF("visible_to_roles", v)}
              placeholder="e.g. investigator"
              suggestions={suggestions.roles}
            />
          </Field>
          <Field label="Visible to Players" hint="Blank = all players">
            <TagInput
              values={form.visible_to_players}
              onChange={(v) => setF("visible_to_players", v)}
              placeholder="Player name"
              suggestions={suggestions.players.map((p) => p.name)}
            />
          </Field>
          <Field label="Required Flags" hint="Player must have all of these to unlock — hint text supports [[code-phrase]] links">
            <RequiredFlagsEditor
              flags={form.required_flags}
              hints={form.required_flags_hints}
              onChange={(flags, hints) => setForm((f) => ({ ...f, required_flags: flags, required_flags_hints: hints }))}
              flagSuggestions={suggestions.flags}
            />
          </Field>
          <Field label="Grants Flags" hint="Awarded when this page is unlocked">
            <TagInput
              values={form.grants_flags}
              onChange={(v) => setF("grants_flags", v)}
              placeholder="e.g. searched the study"
              suggestions={suggestions.flags}
            />
          </Field>
          <Field label="Grants Clues" hint="Words added to player inventory when unlocked">
            <TagInput
              values={form.grants_words}
              onChange={(v) => setF("grants_words", v)}
              placeholder="e.g. CANDLESTICK"
              suggestions={suggestions.words}
            />
          </Field>
          <Field label="Removes Flags" hint="Flags stripped from the player when unlocked">
            <TagInput
              values={form.removes_flags}
              onChange={(v) => setF("removes_flags", v)}
              placeholder="e.g. has alibi"
              suggestions={suggestions.flags}
            />
          </Field>
          <Field label="Removes Clues" hint="Words removed from player inventory when unlocked">
            <TagInput
              values={form.removes_words}
              onChange={(v) => setF("removes_words", v)}
              placeholder="e.g. CANDLESTICK"
              suggestions={suggestions.words}
            />
          </Field>
          <button
            type="submit"
            disabled={saving}
            className={saveBtnCls}
            style={{ fontFamily: "var(--font-family-display)" }}
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </form>
      </Modal>

      {/* Prompt modal */}
      <PromptModal
        open={promptModal.open}
        onClose={() => setPromptModal({ open: false, editing: null })}
        editing={promptModal.editing}
        presetPageId={promptModal.presetPageId}
        pages={pages}
        suggestions={suggestions}
        onSaved={load}
      />

      {/* Touch drag ghost */}
      {touchDragging && ghostPos && (
        <div
          className="fixed pointer-events-none z-50 bg-surface-2 border border-gold/50 px-3 py-1.5 shadow-lg opacity-90 max-w-[60vw]"
          style={{ left: ghostPos.x + 14, top: ghostPos.y - 16 }}
        >
          <span className="font-mono text-xs text-gold">{touchDragging.code_phrase}</span>
          <span className="text-cream text-xs ml-2 truncate">{touchDragging.title}</span>
        </div>
      )}
    </>
  );
}

// ── Progress Panel ─────────────────────────────────────────────────────────────

function ProgressPanel() {
  const [progress, setProgress] = useState<Progress[]>([]);
  const [loading, setLoading] = useState(false);
  const [confirmReset, setConfirmReset] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/progress");
    if (res.ok) setProgress(await res.json());
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleReset = async (id: number) => {
    const res = await fetch(`/api/admin/players/${id}/reset-progress`, { method: "POST" });
    if (res.ok) {
      load();
      toast.success("Progress reset");
    } else {
      toast.error(await getErrorMessage(res));
    }
    setConfirmReset(null);
  };

  return (
    <>
      <div className="flex items-center justify-between mb-5">
        <span className="text-muted text-xs tracking-widest uppercase">
          {progress.length} player{progress.length !== 1 ? "s" : ""}
        </span>
        <button
          onClick={load}
          className="text-gold text-xs tracking-widest uppercase hover:text-gold-light transition-colors"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <p className="text-muted text-sm text-center py-10">Loading…</p>
      ) : (
        <div className="space-y-3">
          {progress.map(({ player, flags, words }) => (
            <div
              key={player.id}
              className="border border-gold/20 bg-surface p-4"
            >
              <div className="flex items-start justify-between mb-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-cream font-medium">{player.name}</span>
                  {player.role && (
                    <span className="text-muted text-xs">({player.role})</span>
                  )}
                  {player.team && (
                    <span className="text-muted text-xs">Team {player.team}</span>
                  )}
                  {player.is_admin && (
                    <span className="text-gold text-xs tracking-widest">
                      Admin
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 shrink-0 ml-2">
                  <span className="text-muted text-xs">
                    {flags.length} flag{flags.length !== 1 ? "s" : ""} · {words.length} word{words.length !== 1 ? "s" : ""}
                  </span>
                  {confirmReset === player.id ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="text-muted text-xs">Reset?</span>
                      <button
                        onClick={() => handleReset(player.id)}
                        className="text-danger text-xs hover:underline"
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => setConfirmReset(null)}
                        className="text-muted text-xs hover:text-cream"
                      >
                        No
                      </button>
                    </span>
                  ) : (
                    <button
                      onClick={() => setConfirmReset(player.id)}
                      className="text-muted text-xs tracking-widest uppercase hover:text-danger transition-colors"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>
              {flags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {flags.map((f) => (
                    <span
                      key={f}
                      className="border border-gold/30 text-gold text-xs px-2 py-0.5 tracking-wide"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              )}
              {words.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {words.map((w) => (
                    <span
                      key={w}
                      className="border border-gold/20 text-cream font-mono text-xs px-2 py-0.5"
                    >
                      {w}
                    </span>
                  ))}
                </div>
              )}
              {flags.length === 0 && words.length === 0 && (
                <p className="text-muted text-xs mt-1">No progress yet</p>
              )}
            </div>
          ))}
          {progress.length === 0 && (
            <p className="text-muted text-sm text-center py-10">
              No players yet
            </p>
          )}
        </div>
      )}
    </>
  );
}

// ── Admin Page ─────────────────────────────────────────────────────────────────

const TABS = ["players", "pages", "progress"] as const;
type Tab = (typeof TABS)[number];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>("players");

  return (
    <div className="animate-fade-in">
      <h2
        className="text-2xl text-cream mb-6"
        style={{ fontFamily: "var(--font-family-display)" }}
      >
        Admin Panel
      </h2>

      {/* Tabs */}
      <div className="border-b border-gold/20 mb-6 flex overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`shrink-0 px-5 py-3 text-xs tracking-[0.3em] uppercase transition-colors capitalize ${
              activeTab === tab
                ? "text-gold border-b-2 border-gold -mb-px"
                : "text-muted hover:text-cream"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="min-h-[55vh]">
        {activeTab === "players" && <PlayersPanel />}
        {activeTab === "pages" && <PagesPanel />}
        {activeTab === "progress" && <ProgressPanel />}
      </div>
    </div>
  );
}
