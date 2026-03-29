import React, { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import QRCode from "qrcode";
import { PromptModal } from "./PromptModal";
import { Modal, Field, TagInput, RequiredFlagsEditor, inputCls, fieldCls, saveBtnCls, toArr, getErrorMessage } from "./shared";
import { emptySuggestions } from "./types";
import type { Page, Folder, Prompt, Suggestions } from "./types";

// ── QR Code Display ───────────────────────────────────────────────────────────

function QRDisplay({ value, label }: { value: string; label: string }) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    QRCode.toDataURL(value, { width: 256, margin: 2, color: { dark: "#000000", light: "#ffffff" } })
      .then(setDataUrl);
  }, [value]);

  if (!dataUrl) return null;

  return (
    <div className="mt-2 mb-1 inline-block bg-white p-3" onClick={(e) => e.stopPropagation()}>
      <img src={dataUrl} alt={`QR code for ${label}`} className="w-48 h-48" />
      <p className="text-center text-black text-xs mt-1 font-mono">{label}</p>
    </div>
  );
}

// ── Pages Panel (tree view) ────────────────────────────────────────────────────

export const defaultPageForm = {
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
export function folderOptions(
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

export function PagesPanel() {
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
  const touchMovePrevent = useRef<((e: TouchEvent) => void) | null>(null);
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
  const [qrModal, setQrModal] = useState<number | null>(null);
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
                className="flex items-center gap-2 py-1.5 group hover:bg-surface-2 transition-colors cursor-pointer select-none"
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
                  // Attach non-passive listener immediately so preventDefault works as soon as drag initiates
                  const prevent = (ev: TouchEvent) => { if (touchDragInitiated.current) ev.preventDefault(); };
                  touchMovePrevent.current = prevent;
                  document.addEventListener("touchmove", prevent, { passive: false });
                  longPressTimer.current = setTimeout(() => {
                    touchDragInitiated.current = true;
                    setTouchDragging(page);
                    setGhostPos({ x: clientX, y: clientY });
                    navigator.vibrate?.(40);
                  }, 300);
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
                  // Edge-scroll when finger is near top or bottom of viewport
                  const ZONE = 80;
                  if (touch.clientY < ZONE) window.scrollBy(0, -8);
                  else if (touch.clientY > window.innerHeight - ZONE) window.scrollBy(0, 8);
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
                  if (touchMovePrevent.current) { document.removeEventListener("touchmove", touchMovePrevent.current); touchMovePrevent.current = null; }
                  endTouchDrag();
                }}
                onTouchCancel={() => {
                  if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null; }
                  if (touchMovePrevent.current) { document.removeEventListener("touchmove", touchMovePrevent.current); touchMovePrevent.current = null; }
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

              {/* Scan code for scan_target pages */}
              {isExpanded && page.page_type === "scan_target" && page.scan_code && (
                <div
                  className="py-1"
                  style={{ paddingLeft: (depth + 1) * 16 + 8, paddingRight: 8 }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-muted text-xs w-4 shrink-0 text-center">⎗</span>
                    <span className="text-muted text-xs shrink-0">Scan Code:</span>
                    <code className="text-cream text-xs font-mono select-all bg-surface-2 px-2 py-0.5">{page.scan_code}</code>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigator.clipboard.writeText(page.scan_code!);
                        toast.success("Scan code copied");
                      }}
                      className="text-gold text-xs hover:text-gold-light transition-colors shrink-0"
                    >
                      Copy
                    </button>
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        setQrModal((prev) => prev === page.id ? null : page.id);
                      }}
                      className="text-gold text-xs hover:text-gold-light transition-colors shrink-0"
                    >
                      QR
                    </button>
                  </div>
                  {qrModal === page.id && (
                    <QRDisplay value={page.scan_code} label={page.title} />
                  )}
                </div>
              )}

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
              <option value="ar">AR</option>
            </select>
          </Field>
          {form.page_type === "ar" && (
            <>
              <Field label="Target File URL" hint="Path to compiled .mind file. Use hiukim.github.io/mind-ar-js-doc/tools/compile to generate from any image.">
                <input
                  className={inputCls}
                  value={(form.game_config.mind_file_url as string) ?? ""}
                  onChange={(e) =>
                    setF("game_config", { ...form.game_config, mind_file_url: e.target.value })
                  }
                  placeholder="/targets/my-image.mind"
                />
              </Field>
              <Field label="Hold Duration (seconds)" hint="How long the player must hold the marker in view. 0 = instant.">
                <input
                  className={inputCls}
                  type="number"
                  min={0}
                  max={30}
                  value={(form.game_config.hold_duration as number) ?? 0}
                  onChange={(e) =>
                    setF("game_config", { ...form.game_config, hold_duration: parseFloat(e.target.value) || 0 })
                  }
                />
              </Field>
            </>
          )}
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
