import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { toRichTemplate, fromRichTemplate, TemplateEditor } from "./TemplateEditor";
import { Modal, Field, TagInput, WrongAnswerHintsEditor, inputCls, saveBtnCls, toArr, getErrorMessage } from "./shared";
import type { Prompt, Page, Suggestions } from "./types";

// ── Prompt Modal ───────────────────────────────────────────────────────────────

export const defaultPromptForm = {
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

export interface PromptModalProps {
  open: boolean;
  onClose: () => void;
  editing: Prompt | null;
  presetPageId?: number;
  pages: Page[];
  suggestions: Suggestions;
  onSaved: () => void;
}

export function PromptModal({ open, onClose, editing, presetPageId, pages, suggestions, onSaved }: PromptModalProps) {
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
