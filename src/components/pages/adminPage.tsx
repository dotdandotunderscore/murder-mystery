import React, { useState, useEffect, useId } from "react";
import { toast } from "sonner";

// ── Types ──────────────────────────────────────────────────────────────────────

interface Player {
  id: number;
  name: string;
  team: string | null;
  is_admin: boolean;
  created_at: string;
}

interface Clue {
  id: number;
  code_phrase: string;
  title: string;
  content: string;
  page_type: string;
  visible_to_teams: string[] | null;
  visible_to_players: number[] | null;
  required_flags: string[] | null;
  grants_flags: string[] | null;
  grants_words: string[] | null;
  removes_flags: string[] | null;
  removes_words: string[] | null;
  sort_order: number;
}

interface Prompt {
  id: number;
  clue_id: number;
  question: string;
  template: string;
  answer: string[];
  grants_flags: string[] | null;
  grants_words: string[] | null;
  removes_flags: string[] | null;
  removes_words: string[] | null;
  success_text: string | null;
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
    if (open) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [open]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div
        className="fixed inset-0 bg-ink/80 animate-fade-in-fast"
        onClick={onClose}
      />
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-start justify-center py-8 px-4">
      <div className="relative bg-surface-3 border border-gold/30 w-full sm:max-w-lg z-10 animate-fade-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gold/20">
          <h3 className="text-xl text-cream">{title}</h3>
          <button
            onClick={onClose}
            className="text-muted hover:text-cream transition-colors text-2xl leading-none pb-0.5"
          >
            ×
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
        </div>
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
        checked ? "bg-gold" : "bg-surface-2 border border-gold/30"
      }`}
    >
      <span
        className={`absolute top-1 w-4 h-4 bg-cream transition-transform ${
          checked ? "translate-x-6" : "translate-x-1"
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

const defaultPlayerForm = { name: "", pin: "", team: "", is_admin: false };

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
    setForm({ name: p.name, pin: "", team: p.team ?? "", is_admin: p.is_admin });
    setModalOpen(true);
  };

  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const body = {
      name: form.name.trim(),
      pin: form.pin.trim(),
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
                {["Name", "Team", "Role", ""].map((h) => (
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
                  <td className="py-3 pr-4 text-cream">{p.name}</td>
                  <td className="py-3 pr-4 text-muted">{p.team ?? "—"}</td>
                  <td className="py-3 pr-4">
                    {p.is_admin && (
                      <span className="text-gold text-xs tracking-widest">
                        Admin
                      </span>
                    )}
                  </td>
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
          <Field label="Team" hint="Optional — e.g. red, blue">
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
  const id = useId();
  const listId = suggestions.length > 0 ? `taginput-${id}` : undefined;

  const update = (i: number, val: string) => {
    const next = [...values];
    next[i] = val;
    onChange(next);
  };
  const remove = (i: number) => onChange(values.filter((_, j) => j !== i));
  const add = () => onChange([...values, ""]);
  return (
    <div className="space-y-2">
      {listId && (
        <datalist id={listId}>
          {suggestions.map((s) => <option key={s} value={s} />)}
        </datalist>
      )}
      {values.map((v, i) => (
        <div key={i} className="flex gap-2">
          <input
            className={`flex-1 min-w-0 ${fieldCls}`}
            value={v}
            onChange={(e) => update(i, e.target.value)}
            placeholder={placeholder}
            list={listId}
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

// ── Pages Panel ─────────────────────────────────────────────────────────────────

const defaultPageForm = {
  code_phrase: "",
  title: "",
  content: "",
  page_type: "text",
  visible_to_teams: [] as string[],
  visible_to_players: [] as string[],
  required_flags: [] as string[],
  grants_flags: [] as string[],
  grants_words: [] as string[],
  removes_flags: [] as string[],
  removes_words: [] as string[],
};

type Suggestions = {
  flags: string[];
  words: string[];
  teams: string[];
  players: { id: number; name: string }[];
};
const emptySuggestions: Suggestions = { flags: [], words: [], teams: [], players: [] };

function PagesPanel() {
  const [clues, setClues] = useState<Clue[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestions>(emptySuggestions);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Clue | null>(null);
  const [form, setForm] = useState(defaultPageForm);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    const [cluesRes, suggRes] = await Promise.all([
      fetch("/api/admin/clues"),
      fetch("/api/admin/suggestions"),
    ]);
    if (cluesRes.ok) setClues(await cluesRes.json());
    if (suggRes.ok) setSuggestions(await suggRes.json());
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const playerName = (id: number) =>
    suggestions.players.find((p) => p.id === id)?.name ?? String(id);
  const playerId = (name: string) =>
    suggestions.players.find((p) => p.name === name)?.id ?? Number(name);

  const openCreate = () => {
    setEditing(null);
    setForm(defaultPageForm);
    setModalOpen(true);
  };

  const openEdit = (c: Clue) => {
    setEditing(c);
    setForm({
      code_phrase: c.code_phrase,
      title: c.title,
      content: c.content,
      page_type: c.page_type,
      visible_to_teams: c.visible_to_teams ?? [],
      visible_to_players: (c.visible_to_players ?? []).map(playerName),
      required_flags: c.required_flags ?? [],
      grants_flags: c.grants_flags ?? [],
      grants_words: c.grants_words ?? [],
      removes_flags: c.removes_flags ?? [],
      removes_words: c.removes_words ?? [],
    });
    setModalOpen(true);
  };

  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const body = {
      code_phrase: form.code_phrase.trim().toLowerCase(),
      title: form.title.trim(),
      content: form.content,
      page_type: form.page_type,
      visible_to_teams: toArr(form.visible_to_teams),
      visible_to_players: toArr(form.visible_to_players)?.map(playerId) ?? null,
      required_flags: toArr(form.required_flags),
      grants_flags: toArr(form.grants_flags),
      grants_words: toArr(form.grants_words),
      removes_flags: toArr(form.removes_flags),
      removes_words: toArr(form.removes_words),
    };
    const res = editing
      ? await fetch(`/api/admin/clues/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        })
      : await fetch("/api/admin/clues", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
    if (res.ok) {
      setModalOpen(false);
      load();
      toast.success(editing ? "Page updated" : "Page created");
    } else {
      toast.error(await getErrorMessage(res));
    }
    setSaving(false);
  };

  const handleDelete = async (id: number) => {
    const res = await fetch(`/api/admin/clues/${id}`, { method: "DELETE" });
    if (res.ok) {
      load();
      toast.success("Page deleted");
    } else {
      toast.error("Failed to delete");
    }
    setConfirmDelete(null);
  };

  return (
    <>
      <div className="flex items-center justify-between mb-5">
        <span className="text-muted text-xs tracking-widest uppercase">
          {clues.length} page{clues.length !== 1 ? "s" : ""}
        </span>
        <button
          onClick={openCreate}
          className="bg-gold text-ink px-4 py-2 text-xs tracking-widest uppercase font-semibold hover:bg-gold-light transition-colors"
          style={{ fontFamily: "var(--font-family-display)" }}
        >
          Add Page
        </button>
      </div>

      {loading ? (
        <p className="text-muted text-sm text-center py-10">Loading…</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gold/20">
                <th className="text-left text-gold text-xs tracking-widest uppercase font-normal py-3 pr-4">
                  Code
                </th>
                <th className="text-left text-gold text-xs tracking-widest uppercase font-normal py-3 pr-4">
                  Title
                </th>
                <th className="text-left text-gold text-xs tracking-widest uppercase font-normal py-3 pr-4 hidden sm:table-cell">
                  Type
                </th>
                <th className="py-3" />
              </tr>
            </thead>
            <tbody>
              {clues.map((c) => (
                <tr key={c.id} className="border-b border-gold/10">
                  <td className="py-3 pr-4 font-mono text-xs text-gold">
                    {c.code_phrase}
                  </td>
                  <td className="py-3 pr-4 text-cream">{c.title}</td>
                  <td className="py-3 pr-4 text-muted hidden sm:table-cell">
                    {c.page_type}
                  </td>
                  <td className="py-3 text-right whitespace-nowrap">
                    {confirmDelete === c.id ? (
                      <span className="inline-flex items-center gap-3">
                        <span className="text-muted text-xs">Delete?</span>
                        <button
                          onClick={() => handleDelete(c.id)}
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
                          onClick={() => openEdit(c)}
                          className="text-gold text-xs tracking-widest uppercase hover:text-gold-light transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setConfirmDelete(c.id)}
                          className="text-muted text-xs tracking-widest uppercase hover:text-danger transition-colors"
                        >
                          Delete
                        </button>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {clues.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="py-10 text-center text-muted text-sm"
                  >
                    No pages yet. Add one to get started.
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
        title={editing ? "Edit Page" : "Add Page"}
      >
        <form onSubmit={handleSave}>
          <Field label="Code Phrase" hint="What players type in — stored lowercase">
            <input
              className={inputCls}
              value={form.code_phrase}
              onChange={(e) => set("code_phrase", e.target.value)}
              placeholder="e.g. butler-did-it"
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
              onChange={(e) => set("title", e.target.value)}
              placeholder="Heading shown to player"
              required
            />
          </Field>
          <Field label="Content">
            <textarea
              className={`${inputCls} resize-none`}
              rows={5}
              value={form.content}
              onChange={(e) => set("content", e.target.value)}
              placeholder="Page text…"
            />
          </Field>
          <Field label="Type">
            <select
              className={`${inputCls} cursor-pointer`}
              value={form.page_type}
              onChange={(e) => set("page_type", e.target.value)}
            >
              <option value="text">Text</option>
              <option value="cipher">Cipher</option>
              <option value="safecracker">Safecracker</option>
            </select>
          </Field>
          <Field label="Visible to Teams" hint="Blank = all teams">
            <TagInput
              values={form.visible_to_teams}
              onChange={(v) => set("visible_to_teams", v)}
              placeholder="e.g. red"
              suggestions={suggestions.teams}
            />
          </Field>
          <Field label="Visible to Players" hint="Blank = all players">
            <TagInput
              values={form.visible_to_players}
              onChange={(v) => set("visible_to_players", v)}
              placeholder="Player name"
              suggestions={suggestions.players.map((p) => p.name)}
            />
          </Field>
          <Field label="Required Flags" hint="Player must have all of these to unlock">
            <TagInput
              values={form.required_flags}
              onChange={(v) => set("required_flags", v)}
              placeholder="e.g. found the body"
              suggestions={suggestions.flags}
            />
          </Field>
          <Field label="Grants Flags" hint="Awarded when this page is unlocked">
            <TagInput
              values={form.grants_flags}
              onChange={(v) => set("grants_flags", v)}
              placeholder="e.g. searched the study"
              suggestions={suggestions.flags}
            />
          </Field>
          <Field label="Grants Clues" hint="Words added to player inventory when unlocked">
            <TagInput
              values={form.grants_words}
              onChange={(v) => set("grants_words", v)}
              placeholder="e.g. CANDLESTICK"
              suggestions={suggestions.words}
            />
          </Field>
          <Field label="Removes Flags" hint="Flags stripped from the player when unlocked">
            <TagInput
              values={form.removes_flags}
              onChange={(v) => set("removes_flags", v)}
              placeholder="e.g. has alibi"
              suggestions={suggestions.flags}
            />
          </Field>
          <Field label="Removes Clues" hint="Words removed from player inventory when unlocked">
            <TagInput
              values={form.removes_words}
              onChange={(v) => set("removes_words", v)}
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
                  {player.team && (
                    <span className="text-muted text-xs">({player.team})</span>
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

// ── Prompts Panel ──────────────────────────────────────────────────────────────

const defaultPromptForm = {
  clue_id: "" as string | number,
  question: "",
  template: "",
  answer: [] as string[],
  grants_flags: [] as string[],
  grants_words: [] as string[],
  removes_flags: [] as string[],
  removes_words: [] as string[],
  success_text: "",
  sort_order: 0,
};

function PromptsPanel() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [clues, setClues] = useState<Clue[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestions>(emptySuggestions);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Prompt | null>(null);
  const [form, setForm] = useState(defaultPromptForm);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [pr, cl, sg] = await Promise.all([
        fetch("/api/admin/prompts").then((r) => r.json()),
        fetch("/api/admin/clues").then((r) => r.json()),
        fetch("/api/admin/suggestions").then((r) => r.json()),
      ]);
      setPrompts(Array.isArray(pr) ? pr : []);
      setClues(Array.isArray(cl) ? cl : []);
      if (sg && !sg.error) setSuggestions(sg);
      if (!Array.isArray(pr)) toast.error(pr?.error ?? "Failed to load prompts");
    } catch {
      toast.error("Failed to load prompts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const clueTitle = (id: number) => clues.find((c) => c.id === id)?.title ?? `Page #${id}`;

  const openCreate = () => {
    setEditing(null);
    setForm({ ...defaultPromptForm, clue_id: clues[0]?.id ?? "" });
    setModalOpen(true);
  };

  const openEdit = (p: Prompt) => {
    setEditing(p);
    setForm({
      clue_id: p.clue_id,
      question: p.question,
      template: p.template,
      answer: p.answer ?? [],
      grants_flags: p.grants_flags ?? [],
      grants_words: p.grants_words ?? [],
      removes_flags: p.removes_flags ?? [],
      removes_words: p.removes_words ?? [],
      success_text: p.success_text ?? "",
      sort_order: p.sort_order,
    });
    setModalOpen(true);
  };

  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const body = {
      clue_id: Number(form.clue_id),
      question: form.question.trim(),
      template: form.template.trim(),
      answer: (form.answer as string[]).filter(Boolean),
      grants_flags: toArr(form.grants_flags as string[]),
      grants_words: toArr(form.grants_words as string[]),
      removes_flags: toArr(form.removes_flags as string[]),
      removes_words: toArr(form.removes_words as string[]),
      success_text: form.success_text.trim() || null,
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
      setModalOpen(false);
      load();
      toast.success(editing ? "Prompt updated" : "Prompt created");
    } else {
      toast.error(await getErrorMessage(res));
    }
    setSaving(false);
  };

  const handleDelete = async (id: number) => {
    const res = await fetch(`/api/admin/prompts/${id}`, { method: "DELETE" });
    if (res.ok) {
      load();
      toast.success("Prompt deleted");
    } else {
      toast.error("Failed to delete");
    }
    setConfirmDelete(null);
  };

  return (
    <>
      <div className="flex items-center justify-between mb-5">
        <span className="text-muted text-xs tracking-widest uppercase">
          {prompts.length} prompt{prompts.length !== 1 ? "s" : ""}
        </span>
        <button
          onClick={openCreate}
          className="bg-gold text-ink px-4 py-2 text-xs tracking-widest uppercase font-semibold hover:bg-gold-light transition-colors"
          style={{ fontFamily: "var(--font-family-display)" }}
        >
          Add Prompt
        </button>
      </div>

      {loading ? (
        <p className="text-muted text-sm text-center py-10">Loading…</p>
      ) : (
        <div className="space-y-2">
          {prompts.map((p) => (
            <div key={p.id} className="border border-gold/20 bg-surface p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-muted text-xs tracking-wide mb-1">
                    {clueTitle(p.clue_id)}
                  </p>
                  <p className="text-cream text-sm truncate">{p.question}</p>
                  <p className="text-muted text-xs font-mono mt-1 truncate">
                    {p.template}
                  </p>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  {confirmDelete === p.id ? (
                    <span className="inline-flex items-center gap-3">
                      <span className="text-muted text-xs">Delete?</span>
                      <button onClick={() => handleDelete(p.id)} className="text-danger text-xs hover:underline">Yes</button>
                      <button onClick={() => setConfirmDelete(null)} className="text-muted text-xs hover:text-cream">No</button>
                    </span>
                  ) : (
                    <>
                      <button onClick={() => openEdit(p)} className="text-gold text-xs tracking-widest uppercase hover:text-gold-light transition-colors">Edit</button>
                      <button onClick={() => setConfirmDelete(p.id)} className="text-muted text-xs tracking-widest uppercase hover:text-danger transition-colors">Delete</button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
          {prompts.length === 0 && (
            <p className="text-muted text-sm text-center py-10">No prompts yet.</p>
          )}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Prompt" : "Add Prompt"}>
        <form onSubmit={handleSave}>
          <Field label="Page">
            <select
              className={`${inputCls} cursor-pointer`}
              value={form.clue_id}
              onChange={(e) => set("clue_id", e.target.value)}
              required
            >
              {clues.map((c) => (
                <option key={c.id} value={c.id}>{c.title} ({c.code_phrase})</option>
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
          <Field label="Template" hint="Use _____ (5 underscores) for each gap">
            <input
              className={inputCls}
              value={form.template}
              onChange={(e) => set("template", e.target.value)}
              placeholder="Found at _____ in the _____."
              required
            />
          </Field>
          <Field label="Answer" hint="One word per gap, in order">
            <TagInput
              values={form.answer as string[]}
              onChange={(v) => set("answer", v)}
              placeholder="e.g. LIBRARY"
              suggestions={suggestions.words}
            />
          </Field>
          <Field label="Success Text" hint="Optional — shown to the player after a correct answer">
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
    </>
  );
}

// ── Admin Page ─────────────────────────────────────────────────────────────────

const TABS = ["players", "pages", "prompts", "progress"] as const;
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
        {activeTab === "prompts" && <PromptsPanel />}
        {activeTab === "progress" && <ProgressPanel />}
      </div>
    </div>
  );
}
