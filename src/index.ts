import index from "./index.html";
import {
  initializeDatabase,
  createSession,
  getSessionPlayer,
  deleteSession,
  getPlayerByNameAndPin,
  getPlayerById,
  getAllPlayers,
  createPlayer,
  updatePlayer,
  deletePlayer,
  getAllPages,
  getPageByCodeForPlayer,
  getPageByScanCode,
  createPage,
  updatePage,
  deletePage,
  reorderPages,
  getAllFolders,
  createFolder,
  updateFolder,
  deleteFolder,
  reorderFolders,
  getPlayerFlags,
  grantPlayerFlags,
  getAllProgress,
  getPlayerWords,
  getPlayerWordsWithIds,
  grantPlayerWords,
  removePlayerWord,
  removePlayerFlags,
  removePlayerWordsByText,
  resetPlayerProgress,
  getPagePrompts,
  getAllPrompts,
  createPrompt,
  updatePrompt,
  deletePrompt,
  submitPromptAnswer,
  getTradeById,
  getPlayerActiveTrades,
  getPlayersWithWordStatus,
  createTrade,
  counterTrade,
  acceptTrade,
  cancelTrade,
  type Player,
} from "../db/index";

// --- WebSocket connections ---

type WSData = { playerId: number };
const connections = new Map<number, import("bun").ServerWebSocket<WSData>>();

function pushToPlayer(playerId: number, data: object) {
  const ws = connections.get(playerId);
  if (ws && ws.readyState === 1) ws.send(JSON.stringify(data));
}

// Initialize DB on startup
await initializeDatabase();

// Helper: extract session token from cookie header
function getSessionId(req: Request): string | null {
  const cookie = req.headers.get("cookie");
  if (!cookie) return null;
  const match = cookie.match(/mystery_session=([^;]+)/);
  return match?.[1] ?? null;
}

// Helper: resolve current player from session cookie
async function getCurrentPlayer(req: Request): Promise<Player | null> {
  const sessionId = getSessionId(req);
  if (!sessionId) return null;
  return getSessionPlayer(sessionId);
}

// Helper: strip pin before sending player to client
function safePlayer(player: Player) {
  const { pin, ...rest } = player;
  return rest;
}

// Helper: standard JSON response
function json(data: unknown, status = 200, extraHeaders?: Record<string, string>) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...extraHeaders },
  });
}

// Shared unlock logic used by both /api/pages/unlock and /api/pages/scan-unlock.
// scanned=true means the request came via QR scan (scanned_<phrase> already granted).
async function unlockPage(player: Player, codePhrase: string, scanned: boolean): Promise<Response> {
  if (!codePhrase) return json({ error: "Unknown code, have you tried looking around?" }, 404);

  const playerFlags = await getPlayerFlags(player.id);
  const result = await getPageByCodeForPlayer(codePhrase, player.id, player.role ?? null, playerFlags);
  if (!result) return json({ error: "Unknown code, have you tried looking around?" }, 404);

  // Player is visible for this page but missing required flags — show hints
  if ("blocked" in result) {
    const blocked = result.blocked;
    const playerFlagsLower = playerFlags.map((f) => f.toLowerCase());
    const missingHints = (blocked.required_flags ?? [])
      .map((f, i) => ({ missing: !playerFlagsLower.includes(f.toLowerCase()), hint: blocked.required_flags_hints?.[i] ?? "" }))
      .filter((x) => x.missing && x.hint)
      .map((x) => x.hint);
    return json({ error: "You're missing a prerequisite", hints: missingHints.length > 0 ? missingHints : undefined }, 403);
  }

  const page = result.page;

  // For scan_target pages, implicitly require scanned_<phrase> and remove it on success.
  // This auto-flag is NOT checked during page selection — only here.
  const autoFlag = page.page_type === "scan_target" ? `scanned_${codePhrase}` : null;

  if (autoFlag) {
    const playerFlagsLower = playerFlags.map((f) => f.toLowerCase());
    if (!playerFlagsLower.includes(autoFlag.toLowerCase())) {
      return json({ error: "You're missing a prerequisite" }, 403);
    }
  }

  // Grant flags and words — skipped for mini-game/AR pages (claimed separately on win/confirm)
  if (page.page_type !== "coin_flip" && page.page_type !== "slot_machine" && page.page_type !== "ar") {
    if (page.grants_flags && page.grants_flags.length > 0) {
      await grantPlayerFlags(player.id, page.grants_flags);
    }
    if (page.grants_words && page.grants_words.length > 0) {
      await grantPlayerWords(player.id, page.grants_words);
    }
  }
  // Remove flags and words
  const effectiveRemoves = autoFlag
    ? [...(page.removes_flags ?? []), autoFlag]
    : (page.removes_flags ?? []);
  if (effectiveRemoves.length > 0) {
    await removePlayerFlags(player.id, effectiveRemoves);
  }
  if (page.page_type !== "coin_flip" && page.page_type !== "slot_machine" && page.page_type !== "ar" && page.removes_words && page.removes_words.length > 0) {
    await removePlayerWordsByText(player.id, page.removes_words);
  }

  const { visible_to_roles, required_flags, removes_flags, removes_words, scan_code, ...pageData } = page;
  return json(pageData);
}

let server: ReturnType<typeof Bun.serve>;
server = Bun.serve({
  routes: {
    // --- Auth ---

    "/api/auth/login": {
      POST: async (req) => {
        const body = (await req.json()) as { name: string; pin: string };
        const player = await getPlayerByNameAndPin(body.name?.trim(), body.pin?.trim());
        if (!player) return json({ error: "Invalid name or PIN" }, 401);
        const sessionId = await createSession(player.id);
        return json(safePlayer(player), 200, {
          "Set-Cookie": `mystery_session=${sessionId}; Path=/; Max-Age=${7 * 24 * 60 * 60}`,
        });
      },
    },

    "/api/auth/logout": {
      POST: async (req) => {
        const sessionId = getSessionId(req);
        if (sessionId) await deleteSession(sessionId);
        return json({ ok: true }, 200, {
          "Set-Cookie": "mystery_session=; Path=/; Max-Age=0",
        });
      },
    },

    "/api/auth/me": {
      GET: async (req) => {
        const player = await getCurrentPlayer(req);
        if (!player) return json({ error: "Unauthorized" }, 401);
        return json(safePlayer(player));
      },
    },

    // --- Page unlock ---

    "/api/pages/unlock": {
      POST: async (req) => {
        const player = await getCurrentPlayer(req);
        if (!player) return json({ error: "Unauthorized" }, 401);

        const body = (await req.json()) as { code_phrase: string };
        const codePhrase = body.code_phrase?.trim()?.toLowerCase();
        return unlockPage(player, codePhrase, false);
      },
    },

    // --- QR scan unlock (by UUID scan_code — preferred for scan_target pages) ---

    "/api/pages/scan-unlock": {
      POST: async (req) => {
        const player = await getCurrentPlayer(req);
        if (!player) return json({ error: "Unauthorized" }, 401);

        const body = (await req.json()) as { scan_code?: string; code_phrase?: string };

        // Try UUID-based scan first (new approach)
        if (body.scan_code) {
          const page = await getPageByScanCode(body.scan_code);
          if (!page) return json({ error: "Unknown code, go find an admin" }, 404);

          const codePhrase = page.code_phrase;
          await grantPlayerFlags(player.id, [`scanned_${codePhrase}`]);
          return unlockPage(player, codePhrase, true);
        }

        // Fallback: legacy code_phrase-based scan
        const codePhrase = body.code_phrase?.trim()?.toLowerCase();
        if (!codePhrase) return json({ error: "Unknown code, go find an admin" }, 404);

        await grantPlayerFlags(player.id, [`scanned_${codePhrase}`]);
        return unlockPage(player, codePhrase, true);
      },
    },

    // --- Mini-game claim (grants rewards after winning) ---

    "/api/pages/:id/claim": {
      POST: async (req) => {
        const player = await getCurrentPlayer(req);
        if (!player) return json({ error: "Unauthorized" }, 401);

        const pageId = parseInt(req.params.id);
        const pages = await getAllPages();
        const page = pages.find((p) => p.id === pageId);
        if (!page) return json({ error: "Not found" }, 404);

        if (page.grants_flags && page.grants_flags.length > 0) {
          await grantPlayerFlags(player.id, page.grants_flags);
        }
        if (page.grants_words && page.grants_words.length > 0) {
          await grantPlayerWords(player.id, page.grants_words);
        }
        if (page.removes_flags && page.removes_flags.length > 0) {
          await removePlayerFlags(player.id, page.removes_flags);
        }
        if (page.removes_words && page.removes_words.length > 0) {
          await removePlayerWordsByText(player.id, page.removes_words);
        }

        return json({ ok: true });
      },
    },

    // --- Admin: Players ---

    "/api/admin/players": {
      GET: async (req) => {
        const player = await getCurrentPlayer(req);
        if (!player?.is_admin) return json({ error: "Forbidden" }, 403);
        const players = await getAllPlayers();
        return json(players.map(safePlayer));
      },
      POST: async (req) => {
        const player = await getCurrentPlayer(req);
        if (!player?.is_admin) return json({ error: "Forbidden" }, 403);
        const body = (await req.json()) as {
          name: string;
          pin: string;
          role?: string;
          team?: string;
          is_admin?: boolean;
        };
        const newPlayer = await createPlayer(
          body.name,
          body.pin,
          body.role?.trim() || null,
          body.team?.trim() || null,
          body.is_admin ?? false
        );
        return json(safePlayer(newPlayer), 201);
      },
    },

    "/api/admin/players/:id": {
      PUT: async (req) => {
        const player = await getCurrentPlayer(req);
        if (!player?.is_admin) return json({ error: "Forbidden" }, 403);
        const id = parseInt(req.params.id);
        const body = (await req.json()) as {
          name: string;
          pin?: string;
          role?: string;
          team?: string;
          is_admin?: boolean;
        };

        // If PIN left blank, keep existing
        let pin = body.pin?.trim();
        if (!pin) {
          const existing = await getPlayerById(id);
          if (!existing) return json({ error: "Not found" }, 404);
          pin = existing.pin;
        }

        const updated = await updatePlayer(
          id,
          body.name,
          pin,
          body.role?.trim() || null,
          body.team?.trim() || null,
          body.is_admin ?? false
        );
        if (!updated) return json({ error: "Not found" }, 404);
        return json(safePlayer(updated));
      },
      DELETE: async (req) => {
        const player = await getCurrentPlayer(req);
        if (!player?.is_admin) return json({ error: "Forbidden" }, 403);
        const id = parseInt(req.params.id);
        const ok = await deletePlayer(id);
        return json({ ok }, ok ? 200 : 404);
      },
    },

    // --- Admin: Pages ---

    "/api/admin/pages": {
      GET: async (req) => {
        const player = await getCurrentPlayer(req);
        if (!player?.is_admin) return json({ error: "Forbidden" }, 403);
        return json(await getAllPages());
      },
      POST: async (req) => {
        const player = await getCurrentPlayer(req);
        if (!player?.is_admin) return json({ error: "Forbidden" }, 403);
        const body = await req.json();
        const page = await createPage(body);
        return json(page, 201);
      },
    },

    "/api/admin/pages/reorder": {
      POST: async (req) => {
        const player = await getCurrentPlayer(req);
        if (!player?.is_admin) return json({ error: "Forbidden" }, 403);
        const body = await req.json() as { updates: { id: number; sort_order: number; folder_id: number | null }[] };
        if (!Array.isArray(body.updates)) return json({ error: "Bad request" }, 400);
        await reorderPages(body.updates);
        return json({ ok: true });
      },
    },

    "/api/admin/pages/:id": {
      PUT: async (req) => {
        const player = await getCurrentPlayer(req);
        if (!player?.is_admin) return json({ error: "Forbidden" }, 403);
        const id = parseInt(req.params.id);
        const body = await req.json();
        const page = await updatePage(id, body);
        if (!page) return json({ error: "Not found" }, 404);
        return json(page);
      },
      DELETE: async (req) => {
        const player = await getCurrentPlayer(req);
        if (!player?.is_admin) return json({ error: "Forbidden" }, 403);
        const id = parseInt(req.params.id);
        const ok = await deletePage(id);
        return json({ ok }, ok ? 200 : 404);
      },
    },

    // --- Inventory ---

    "/api/inventory": {
      GET: async (req) => {
        const player = await getCurrentPlayer(req);
        if (!player) return json({ error: "Unauthorized" }, 401);
        const words = await getPlayerWords(player.id);
        return json(words);
      },
    },

    "/api/flags": {
      GET: async (req) => {
        const player = await getCurrentPlayer(req);
        if (!player) return json({ error: "Unauthorized" }, 401);
        const flags = await getPlayerFlags(player.id);
        return json(flags);
      },
    },

    // --- Prompts ---

    "/api/pages/:id/prompts": {
      GET: async (req) => {
        const player = await getCurrentPlayer(req);
        if (!player) return json({ error: "Unauthorized" }, 401);
        const pageId = parseInt(req.params.id);
        const prompts = await getPagePrompts(pageId, player.id);
        // Strip answer, wrong_answer_hints, generic_wrong_text, and submitted_words from incomplete prompts.
        // For completed prompts, return submitted_words so the UI can display what the player entered.
        return json(prompts.map(({ answer, wrong_answer_hints, generic_wrong_text, submitted_words, ...p }) => ({
          ...p,
          ...(p.completed ? { submitted_words } : {}),
        })));
      },
    },

    "/api/prompts/:id/submit": {
      POST: async (req) => {
        const player = await getCurrentPlayer(req);
        if (!player) return json({ error: "Unauthorized" }, 401);
        const promptId = parseInt(req.params.id);
        const body = (await req.json()) as { words: string[] };
        if (!Array.isArray(body.words)) return json({ error: "Bad request" }, 400);
        const result = await submitPromptAnswer(promptId, player.id, body.words);
        return json(result);
      },
    },

    // --- Admin: Player words ---

    "/api/admin/players/:id/reset-progress": {
      POST: async (req) => {
        const player = await getCurrentPlayer(req);
        if (!player?.is_admin) return json({ error: "Forbidden" }, 403);
        const id = parseInt(req.params.id);
        await resetPlayerProgress(id);
        pushToPlayer(id, { type: "player_updated" });
        return json({ ok: true });
      },
    },

    "/api/admin/players/:id/words": {
      GET: async (req) => {
        const player = await getCurrentPlayer(req);
        if (!player?.is_admin) return json({ error: "Forbidden" }, 403);
        const id = parseInt(req.params.id);
        const words = await getPlayerWordsWithIds(id);
        return json(words);
      },
      POST: async (req) => {
        const player = await getCurrentPlayer(req);
        if (!player?.is_admin) return json({ error: "Forbidden" }, 403);
        const id = parseInt(req.params.id);
        const body = (await req.json()) as { words: string[] };
        if (!Array.isArray(body.words)) return json({ error: "Bad request" }, 400);
        await grantPlayerWords(id, body.words);
        pushToPlayer(id, { type: "player_updated" });
        return json({ ok: true });
      },
    },

    "/api/admin/players/:id/words/:wordId": {
      DELETE: async (req) => {
        const player = await getCurrentPlayer(req);
        if (!player?.is_admin) return json({ error: "Forbidden" }, 403);
        const id = parseInt(req.params.id);
        const wordId = parseInt(req.params.wordId);
        const ok = await removePlayerWord(id, wordId);
        if (ok) pushToPlayer(id, { type: "player_updated" });
        return json({ ok }, ok ? 200 : 404);
      },
    },

    "/api/admin/players/:id/flags": {
      GET: async (req) => {
        const player = await getCurrentPlayer(req);
        if (!player?.is_admin) return json({ error: "Forbidden" }, 403);
        const id = parseInt(req.params.id);
        const flags = await getPlayerFlags(id);
        return json(flags);
      },
      POST: async (req) => {
        const player = await getCurrentPlayer(req);
        if (!player?.is_admin) return json({ error: "Forbidden" }, 403);
        const id = parseInt(req.params.id);
        const body = (await req.json()) as { flags: string[] };
        if (!Array.isArray(body.flags)) return json({ error: "Bad request" }, 400);
        await grantPlayerFlags(id, body.flags);
        pushToPlayer(id, { type: "player_updated" });
        return json({ ok: true });
      },
      DELETE: async (req) => {
        const player = await getCurrentPlayer(req);
        if (!player?.is_admin) return json({ error: "Forbidden" }, 403);
        const id = parseInt(req.params.id);
        const body = (await req.json()) as { flags: string[] };
        if (!Array.isArray(body.flags)) return json({ error: "Bad request" }, 400);
        await removePlayerFlags(id, body.flags);
        pushToPlayer(id, { type: "player_updated" });
        return json({ ok: true });
      },
    },

    // --- Admin: Prompts ---

    "/api/admin/prompts": {
      GET: async (req) => {
        const player = await getCurrentPlayer(req);
        if (!player?.is_admin) return json({ error: "Forbidden" }, 403);
        return json(await getAllPrompts());
      },
      POST: async (req) => {
        const player = await getCurrentPlayer(req);
        if (!player?.is_admin) return json({ error: "Forbidden" }, 403);
        const body = await req.json();
        const prompt = await createPrompt(body);
        return json(prompt, 201);
      },
    },

    "/api/admin/prompts/:id": {
      PUT: async (req) => {
        const player = await getCurrentPlayer(req);
        if (!player?.is_admin) return json({ error: "Forbidden" }, 403);
        const id = parseInt(req.params.id);
        const body = await req.json();
        const prompt = await updatePrompt(id, body);
        if (!prompt) return json({ error: "Not found" }, 404);
        return json(prompt);
      },
      DELETE: async (req) => {
        const player = await getCurrentPlayer(req);
        if (!player?.is_admin) return json({ error: "Forbidden" }, 403);
        const id = parseInt(req.params.id);
        const ok = await deletePrompt(id);
        return json({ ok }, ok ? 200 : 404);
      },
    },

    // --- Admin: Folders ---

    "/api/admin/folders": {
      GET: async (req) => {
        const player = await getCurrentPlayer(req);
        if (!player?.is_admin) return json({ error: "Forbidden" }, 403);
        return json(await getAllFolders());
      },
      POST: async (req) => {
        const player = await getCurrentPlayer(req);
        if (!player?.is_admin) return json({ error: "Forbidden" }, 403);
        const body = (await req.json()) as { name: string; parent_id?: number | null };
        const folder = await createFolder(body.name, body.parent_id ?? null);
        return json(folder, 201);
      },
    },

    "/api/admin/folders/reorder": {
      POST: async (req) => {
        const player = await getCurrentPlayer(req);
        if (!player?.is_admin) return json({ error: "Forbidden" }, 403);
        const body = await req.json() as { updates: { id: number; sort_order: number; parent_id: number | null }[] };
        if (!Array.isArray(body.updates)) return json({ error: "Bad request" }, 400);
        await reorderFolders(body.updates);
        return json({ ok: true });
      },
    },

    "/api/admin/folders/:id": {
      PUT: async (req) => {
        const player = await getCurrentPlayer(req);
        if (!player?.is_admin) return json({ error: "Forbidden" }, 403);
        const id = parseInt(req.params.id);
        const body = await req.json();
        const folder = await updateFolder(id, body);
        if (!folder) return json({ error: "Not found or circular reference" }, 404);
        return json(folder);
      },
      DELETE: async (req) => {
        const player = await getCurrentPlayer(req);
        if (!player?.is_admin) return json({ error: "Forbidden" }, 403);
        const id = parseInt(req.params.id);
        const result = await deleteFolder(id);
        if (!result.ok) return json({ error: result.error }, 409);
        return json({ ok: true });
      },
    },

    // --- Admin: Suggestions (autocomplete values) ---

    "/api/admin/suggestions": {
      GET: async (req) => {
        const player = await getCurrentPlayer(req);
        if (!player?.is_admin) return json({ error: "Forbidden" }, 403);

        const [pages, prompts, players] = await Promise.all([
          getAllPages(),
          getAllPrompts(),
          getAllPlayers(),
        ]);

        const flags = new Set<string>();
        const words = new Set<string>();
        const roles = new Set<string>();

        for (const c of pages) {
          c.required_flags?.forEach((f) => flags.add(f));
          c.grants_flags?.forEach((f) => flags.add(f));
          c.grants_words?.forEach((w) => words.add(w));
          c.removes_flags?.forEach((f) => flags.add(f));
          c.removes_words?.forEach((w) => words.add(w));
        }
        for (const p of prompts) {
          p.grants_flags?.forEach((f) => flags.add(f));
          p.grants_words?.forEach((w) => words.add(w));
          p.removes_flags?.forEach((f) => flags.add(f));
          p.removes_words?.forEach((w) => words.add(w));
        }
        for (const p of players) {
          if (p.role) roles.add(p.role);
        }

        return json({
          flags: [...flags].sort(),
          words: [...words].sort(),
          roles: [...roles].sort(),
          players: players.map((p) => ({ id: p.id, name: p.name })),
        });
      },
    },

    // --- Admin: Progress ---

    "/api/admin/progress": {
      GET: async (req) => {
        const player = await getCurrentPlayer(req);
        if (!player?.is_admin) return json({ error: "Forbidden" }, 403);
        return json(await getAllProgress());
      },
    },

    // --- WebSocket upgrade ---

    "/api/ws": async (req) => {
      const player = await getCurrentPlayer(req);
      if (!player) return json({ error: "Unauthorized" }, 401);
      const ok = server.upgrade(req, { data: { playerId: player.id } });
      return ok ? new Response() : json({ error: "Upgrade failed" }, 400);
    },

    // --- Players (public list for trade recipient picker) ---

    "/api/players": {
      GET: async (req) => {
        const player = await getCurrentPlayer(req);
        if (!player) return json({ error: "Unauthorized" }, 401);
        const word = new URL(req.url).searchParams.get("word");
        if (word) {
          return json(await getPlayersWithWordStatus(player.id, word));
        }
        const all = await getAllPlayers();
        return json(
          all
            .filter((p) => p.id !== player.id)
            .map((p) => ({ id: p.id, name: p.name, role: p.role, team: p.team }))
        );
      },
    },

    // --- Player inventory (public, for trade validation) ---

    "/api/players/:id/inventory": {
      GET: async (req) => {
        const player = await getCurrentPlayer(req);
        if (!player) return json({ error: "Unauthorized" }, 401);
        const id = parseInt(req.params.id);
        const words = await getPlayerWords(id);
        return json(words);
      },
    },

    // --- Trades ---

    "/api/trades": {
      GET: async (req) => {
        const player = await getCurrentPlayer(req);
        if (!player) return json({ error: "Unauthorized" }, 401);
        return json(await getPlayerActiveTrades(player.id));
      },
      POST: async (req) => {
        const player = await getCurrentPlayer(req);
        if (!player) return json({ error: "Unauthorized" }, 401);
        const body = (await req.json()) as { word: string; recipient_id: number };
        if (!body.word || !body.recipient_id) return json({ error: "Bad request" }, 400);
        if (body.recipient_id === player.id) return json({ error: "Cannot trade with yourself" }, 400);
        const recipientWords = await getPlayerWords(body.recipient_id);
        if (recipientWords.includes(body.word.trim().toUpperCase())) {
          return json({ error: "That player already has this clue" }, 400);
        }
        const trade = await createTrade(player.id, body.word, body.recipient_id);
        if (!trade) return json({ error: "Word not in your inventory" }, 400);
        pushToPlayer(body.recipient_id, { type: "trade_update", trade });
        return json(trade, 201);
      },
    },

    "/api/trades/:id/counter": {
      PUT: async (req) => {
        const player = await getCurrentPlayer(req);
        if (!player) return json({ error: "Unauthorized" }, 401);
        const id = parseInt(req.params.id);
        const body = (await req.json()) as { word: string };
        const pendingTrade = await getTradeById(id);
        if (pendingTrade) {
          const initiatorWords = await getPlayerWords(pendingTrade.initiator_id);
          if (initiatorWords.includes(body.word.trim().toUpperCase())) {
            return json({ error: "That player already has this clue" }, 400);
          }
        }
        const trade = await counterTrade(id, player.id, body.word);
        if (!trade) return json({ error: "Cannot counter this trade" }, 400);
        pushToPlayer(trade.initiator_id, { type: "trade_update", trade });
        return json(trade);
      },
    },

    "/api/trades/:id/accept": {
      POST: async (req) => {
        const player = await getCurrentPlayer(req);
        if (!player) return json({ error: "Unauthorized" }, 401);
        const id = parseInt(req.params.id);
        const result = await acceptTrade(id, player.id);
        if (!result.ok) return json({ error: result.error }, 400);
        const trade = await getTradeById(id);
        if (trade) {
          pushToPlayer(trade.initiator_id, { type: "trade_update", trade });
          pushToPlayer(trade.recipient_id, { type: "trade_update", trade });
        }
        return json({ ok: true });
      },
    },

    "/api/trades/:id": {
      DELETE: async (req) => {
        const player = await getCurrentPlayer(req);
        if (!player) return json({ error: "Unauthorized" }, 401);
        const id = parseInt(req.params.id);
        const trade = await getTradeById(id);
        const ok = await cancelTrade(id, player.id);
        if (!ok) return json({ error: "Trade not found or cannot be cancelled" }, 404);
        if (trade) {
          const otherId = trade.initiator_id === player.id ? trade.recipient_id : trade.initiator_id;
          pushToPlayer(otherId, { type: "trade_removed", tradeId: id });
        }
        return json({ ok: true });
      },
    },

    // --- Static files from public/ ---
    "/targets/*": async (req) => {
      const url = new URL(req.url);
      const file = Bun.file(`public${url.pathname}`);
      if (await file.exists()) return new Response(file);
      return json({ error: "Not found" }, 404);
    },

    // --- Frontend catch-all ---
    "/*": index,
  },

  websocket: {
    open(ws: import("bun").ServerWebSocket<WSData>) {
      connections.set(ws.data.playerId, ws);
    },
    message() {},
    close(ws: import("bun").ServerWebSocket<WSData>) {
      connections.delete(ws.data.playerId);
    },
  },

  error(err) {
    console.error("Unhandled server error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  },

  development: process.env.NODE_ENV !== "production" && {
    hmr: true,
    console: true,
  },
});

console.log(`Server running at ${server.url}`);
