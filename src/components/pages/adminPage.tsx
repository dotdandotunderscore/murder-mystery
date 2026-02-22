import React, { useState, useEffect } from "react";
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

const inputCls =
  "w-full bg-ink border border-gold/30 text-cream px-4 py-2.5 text-sm focus:outline-none focus:border-gold transition-colors";

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

// ── Clues Panel ────────────────────────────────────────────────────────────────

const defaultClueForm = {
  code_phrase: "",
  title: "",
  content: "",
  page_type: "text",
  sort_order: 0,
  visible_to_teams: "",
  visible_to_players: "",
  required_flags: "",
  grants_flags: "",
  grants_words: "",
};

function csvToArray(v: string): string[] | null {
  const trimmed = v.trim();
  if (!trimmed) return null;
  return trimmed.split(",").map((s) => s.trim()).filter(Boolean);
}

function arrayToCsv(arr: string[] | number[] | null): string {
  return arr?.join(", ") ?? "";
}

function CluesPanel() {
  const [clues, setClues] = useState<Clue[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Clue | null>(null);
  const [form, setForm] = useState(defaultClueForm);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/clues");
    if (res.ok) setClues(await res.json());
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(defaultClueForm);
    setModalOpen(true);
  };

  const openEdit = (c: Clue) => {
    setEditing(c);
    setForm({
      code_phrase: c.code_phrase,
      title: c.title,
      content: c.content,
      page_type: c.page_type,
      sort_order: c.sort_order,
      visible_to_teams: arrayToCsv(c.visible_to_teams),
      visible_to_players: arrayToCsv(c.visible_to_players),
      required_flags: arrayToCsv(c.required_flags),
      grants_flags: arrayToCsv(c.grants_flags),
      grants_words: arrayToCsv(c.grants_words),
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
      sort_order: form.sort_order,
      visible_to_teams: csvToArray(form.visible_to_teams),
      visible_to_players:
        csvToArray(form.visible_to_players)?.map(Number) ?? null,
      required_flags: csvToArray(form.required_flags),
      grants_flags: csvToArray(form.grants_flags),
      grants_words: csvToArray(form.grants_words),
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
      toast.success(editing ? "Clue updated" : "Clue created");
    } else {
      toast.error(await getErrorMessage(res));
    }
    setSaving(false);
  };

  const handleDelete = async (id: number) => {
    const res = await fetch(`/api/admin/clues/${id}`, { method: "DELETE" });
    if (res.ok) {
      load();
      toast.success("Clue deleted");
    } else {
      toast.error("Failed to delete");
    }
    setConfirmDelete(null);
  };

  return (
    <>
      <div className="flex items-center justify-between mb-5">
        <span className="text-muted text-xs tracking-widest uppercase">
          {clues.length} clue{clues.length !== 1 ? "s" : ""}
        </span>
        <button
          onClick={openCreate}
          className="bg-gold text-ink px-4 py-2 text-xs tracking-widest uppercase font-semibold hover:bg-gold-light transition-colors"
          style={{ fontFamily: "var(--font-family-display)" }}
        >
          Add Clue
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
                    No clues yet. Add one to get started.
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
        title={editing ? "Edit Clue" : "Add Clue"}
      >
        <form onSubmit={handleSave}>
          <Field label="Code Phrase" hint="What players type in — auto-lowercased">
            <input
              className={inputCls}
              value={form.code_phrase}
              onChange={(e) => set("code_phrase", e.target.value)}
              placeholder="e.g. butler-did-it"
              required
              autoCapitalize="none"
              autoCorrect="off"
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
              placeholder="Clue text…"
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
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
            <Field label="Order">
              <input
                className={inputCls}
                type="number"
                value={form.sort_order}
                onChange={(e) =>
                  set("sort_order", parseInt(e.target.value) || 0)
                }
              />
            </Field>
          </div>
          <Field
            label="Visible to Teams"
            hint="Comma-separated, blank = all teams"
          >
            <input
              className={inputCls}
              value={form.visible_to_teams}
              onChange={(e) => set("visible_to_teams", e.target.value)}
              placeholder="red, blue"
            />
          </Field>
          <Field
            label="Visible to Player IDs"
            hint="Comma-separated IDs, blank = all"
          >
            <input
              className={inputCls}
              value={form.visible_to_players}
              onChange={(e) => set("visible_to_players", e.target.value)}
              placeholder="1, 3, 5"
            />
          </Field>
          <Field
            label="Required Flags"
            hint="Player must have all these flags first"
          >
            <input
              className={inputCls}
              value={form.required_flags}
              onChange={(e) => set("required_flags", e.target.value)}
              placeholder="found_body, decoded_cipher"
            />
          </Field>
          <Field label="Grants Flags" hint="Flags awarded when unlocked">
            <input
              className={inputCls}
              value={form.grants_flags}
              onChange={(e) => set("grants_flags", e.target.value)}
              placeholder="found_key"
            />
          </Field>
          <Field label="Grants Words" hint="Words added to player inventory when unlocked">
            <input
              className={inputCls}
              value={form.grants_words}
              onChange={(e) => set("grants_words", e.target.value)}
              placeholder="CANDLESTICK, LIBRARY"
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
  answer: "",
  grants_flags: "",
  grants_words: "",
  success_text: "",
  sort_order: 0,
};

function PromptsPanel() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [clues, setClues] = useState<Clue[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Prompt | null>(null);
  const [form, setForm] = useState(defaultPromptForm);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [pr, cl] = await Promise.all([
        fetch("/api/admin/prompts").then((r) => r.json()),
        fetch("/api/admin/clues").then((r) => r.json()),
      ]);
      setPrompts(Array.isArray(pr) ? pr : []);
      setClues(Array.isArray(cl) ? cl : []);
      if (!Array.isArray(pr)) toast.error(pr?.error ?? "Failed to load prompts");
    } catch {
      toast.error("Failed to load prompts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const clueTitle = (id: number) => clues.find((c) => c.id === id)?.title ?? `Clue #${id}`;

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
      answer: p.answer.join(", "),
      grants_flags: arrayToCsv(p.grants_flags),
      grants_words: arrayToCsv(p.grants_words),
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
      answer: csvToArray(form.answer) ?? [],
      grants_flags: csvToArray(form.grants_flags),
      grants_words: csvToArray(form.grants_words),
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
          <Field label="Clue">
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
          <Field label="Template" hint={`Use _____ (5 underscores) for each gap`}>
            <input
              className={inputCls}
              value={form.template}
              onChange={(e) => set("template", e.target.value)}
              placeholder="Found at _____ in the _____."
              required
            />
          </Field>
          <Field label="Answer" hint="Comma-separated words in gap order">
            <input
              className={inputCls}
              value={form.answer}
              onChange={(e) => set("answer", e.target.value)}
              placeholder="LIBRARY, EVENING"
              required
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
            <input
              className={inputCls}
              value={form.grants_flags}
              onChange={(e) => set("grants_flags", e.target.value)}
              placeholder="solved_room_1"
            />
          </Field>
          <Field label="Grants Words" hint="Words added to inventory on correct answer">
            <input
              className={inputCls}
              value={form.grants_words}
              onChange={(e) => set("grants_words", e.target.value)}
              placeholder="SECRET PASSAGE"
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

const TABS = ["players", "clues", "prompts", "progress"] as const;
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
        {activeTab === "clues" && <CluesPanel />}
        {activeTab === "prompts" && <PromptsPanel />}
        {activeTab === "progress" && <ProgressPanel />}
      </div>
    </div>
  );
}
