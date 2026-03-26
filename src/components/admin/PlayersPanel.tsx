import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Modal, Toggle, Field, inputCls, saveBtnCls, getErrorMessage } from "./shared";
import type { Player } from "./types";

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
