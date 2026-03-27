import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Modal, Toggle, Field, inputCls, fieldCls, saveBtnCls, getErrorMessage } from "./shared";
import type { Player, Suggestions } from "./types";
import { emptySuggestions } from "./types";

// ── Players Panel ──────────────────────────────────────────────────────────────

export const defaultPlayerForm = { name: "", pin: "", role: "", team: "", is_admin: false };

export function PlayersPanel() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Player | null>(null);
  const [form, setForm] = useState(defaultPlayerForm);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  // Inventory modal state
  const [invPlayer, setInvPlayer] = useState<Player | null>(null);
  const [invWords, setInvWords] = useState<{ id: number; word: string }[]>([]);
  const [invFlags, setInvFlags] = useState<string[]>([]);
  const [newWord, setNewWord] = useState("");
  const [newFlag, setNewFlag] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestions>(emptySuggestions);
  const [confirmReset, setConfirmReset] = useState(false);

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

  // ── Inventory modal ──────────────────────────────────────────────────────────

  const openInventory = async (p: Player) => {
    setInvPlayer(p);
    setNewWord("");
    setNewFlag("");
    const [wordsRes, flagsRes, sugRes] = await Promise.all([
      fetch(`/api/admin/players/${p.id}/words`),
      fetch(`/api/admin/players/${p.id}/flags`),
      fetch("/api/admin/suggestions"),
    ]);
    if (wordsRes.ok) setInvWords(await wordsRes.json());
    if (flagsRes.ok) setInvFlags(await flagsRes.json());
    if (sugRes.ok) setSuggestions(await sugRes.json());
  };

  const addWord = async () => {
    if (!invPlayer || !newWord.trim()) return;
    const res = await fetch(`/api/admin/players/${invPlayer.id}/words`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ words: [newWord.trim()] }),
    });
    if (res.ok) {
      setNewWord("");
      const r = await fetch(`/api/admin/players/${invPlayer.id}/words`);
      if (r.ok) setInvWords(await r.json());
      toast.success("Clue added");
    } else {
      toast.error(await getErrorMessage(res));
    }
  };

  const removeWord = async (wordId: number) => {
    if (!invPlayer) return;
    const res = await fetch(`/api/admin/players/${invPlayer.id}/words/${wordId}`, { method: "DELETE" });
    if (res.ok) {
      setInvWords((prev) => prev.filter((w) => w.id !== wordId));
      toast.success("Clue removed");
    }
  };

  const addFlag = async () => {
    if (!invPlayer || !newFlag.trim()) return;
    const res = await fetch(`/api/admin/players/${invPlayer.id}/flags`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ flags: [newFlag.trim()] }),
    });
    if (res.ok) {
      setNewFlag("");
      const r = await fetch(`/api/admin/players/${invPlayer.id}/flags`);
      if (r.ok) setInvFlags(await r.json());
      toast.success("Flag added");
    } else {
      toast.error(await getErrorMessage(res));
    }
  };

  const removeFlag = async (flag: string) => {
    if (!invPlayer) return;
    const res = await fetch(`/api/admin/players/${invPlayer.id}/flags`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ flags: [flag] }),
    });
    if (res.ok) {
      setInvFlags((prev) => prev.filter((f) => f !== flag));
      toast.success("Flag removed");
    }
  };

  const handleResetProgress = async () => {
    if (!invPlayer) return;
    const res = await fetch(`/api/admin/players/${invPlayer.id}/reset-progress`, { method: "POST" });
    if (res.ok) {
      setInvWords([]);
      setInvFlags([]);
      setConfirmReset(false);
      toast.success("Progress reset");
    } else {
      toast.error(await getErrorMessage(res));
    }
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
                          onClick={() => openInventory(p)}
                          className="text-gold text-xs tracking-widest uppercase hover:text-gold-light transition-colors"
                        >
                          Inventory
                        </button>
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

      {/* Inventory Modal */}
      <Modal
        open={!!invPlayer}
        onClose={() => setInvPlayer(null)}
        title={invPlayer ? `${invPlayer.name} — Inventory` : ""}
      >
        {invPlayer && (
          <div className="space-y-8">
            {/* Clues */}
            <div>
              <h4 className="text-gold text-xs tracking-widest uppercase mb-3">Clues</h4>
              {invWords.length > 0 ? (
                <div className="flex flex-wrap gap-2 mb-3">
                  {invWords.map((w) => (
                    <span
                      key={w.id}
                      className="inline-flex items-center gap-1.5 border border-gold/20 text-cream font-mono text-xs px-2 py-1"
                    >
                      {w.word}
                      <button
                        onClick={() => removeWord(w.id)}
                        className="text-muted hover:text-danger transition-colors text-sm leading-none"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-muted text-xs mb-3">No clues</p>
              )}
              <div className="flex gap-2">
                <input
                  className={`flex-1 min-w-0 ${fieldCls}`}
                  value={newWord}
                  onChange={(e) => setNewWord(e.target.value)}
                  placeholder="Add clue (e.g. KNIFE)"
                  list="word-suggestions"
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addWord(); } }}
                />
                <datalist id="word-suggestions">
                  {suggestions.words.map((w) => <option key={w} value={w} />)}
                </datalist>
                <button
                  type="button"
                  onClick={addWord}
                  className="bg-gold text-ink px-4 py-2 text-xs tracking-widest uppercase font-semibold hover:bg-gold-light transition-colors shrink-0"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Flags */}
            <div>
              <h4 className="text-gold text-xs tracking-widest uppercase mb-3">Flags</h4>
              {invFlags.length > 0 ? (
                <div className="flex flex-wrap gap-2 mb-3">
                  {invFlags.map((f) => (
                    <span
                      key={f}
                      className="inline-flex items-center gap-1.5 border border-gold/30 text-gold text-xs px-2 py-1 tracking-wide"
                    >
                      {f}
                      <button
                        onClick={() => removeFlag(f)}
                        className="text-muted hover:text-danger transition-colors text-sm leading-none"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-muted text-xs mb-3">No flags</p>
              )}
              <div className="flex gap-2">
                <input
                  className={`flex-1 min-w-0 ${fieldCls}`}
                  value={newFlag}
                  onChange={(e) => setNewFlag(e.target.value)}
                  placeholder="Add flag (e.g. found_weapon)"
                  list="flag-suggestions"
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addFlag(); } }}
                />
                <datalist id="flag-suggestions">
                  {suggestions.flags.map((f) => <option key={f} value={f} />)}
                </datalist>
                <button
                  type="button"
                  onClick={addFlag}
                  className="bg-gold text-ink px-4 py-2 text-xs tracking-widest uppercase font-semibold hover:bg-gold-light transition-colors shrink-0"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Reset progress */}
            <div className="border-t border-gold/20 pt-6">
              {confirmReset ? (
                <div className="flex items-center gap-3">
                  <span className="text-muted text-xs">Reset all progress for {invPlayer.name}?</span>
                  <button
                    onClick={handleResetProgress}
                    className="text-danger text-xs tracking-widest uppercase hover:underline"
                  >
                    Yes, Reset
                  </button>
                  <button
                    onClick={() => setConfirmReset(false)}
                    className="text-muted text-xs hover:text-cream"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmReset(true)}
                  className="text-muted text-xs tracking-widest uppercase hover:text-danger transition-colors"
                >
                  Reset All Progress
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
