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
  getAllClues,
  getClueByCode,
  createClue,
  updateClue,
  deleteClue,
  getPlayerFlags,
  grantPlayerFlags,
  getAllProgress,
  getPlayerWords,
  getPlayerWordsWithIds,
  grantPlayerWords,
  removePlayerWord,
  resetPlayerProgress,
  getCluePrompts,
  getAllPrompts,
  createPrompt,
  updatePrompt,
  deletePrompt,
  submitPromptAnswer,
  type Player,
} from "../db/index";

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

const server = Bun.serve({
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

    // --- Clue unlock ---

    "/api/clues/unlock": {
      POST: async (req) => {
        const player = await getCurrentPlayer(req);
        if (!player) return json({ error: "Unauthorized" }, 401);

        const body = (await req.json()) as { code_phrase: string };
        const codePhrase = body.code_phrase?.trim()?.toLowerCase();
        const clue = await getClueByCode(codePhrase);
        if (!clue) return json({ error: "Unknown code" }, 404);

        // Team access check
        if (clue.visible_to_teams && clue.visible_to_teams.length > 0) {
          if (!player.team || !clue.visible_to_teams.includes(player.team)) {
            return json({ error: "Access denied" }, 403);
          }
        }

        // Player access check
        if (clue.visible_to_players && clue.visible_to_players.length > 0) {
          if (!clue.visible_to_players.includes(player.id)) {
            return json({ error: "Access denied" }, 403);
          }
        }

        // Required flags check
        if (clue.required_flags && clue.required_flags.length > 0) {
          const playerFlags = await getPlayerFlags(player.id);
          const hasAll = clue.required_flags.every((f) => playerFlags.includes(f));
          if (!hasAll) return json({ error: "You're missing a prerequisite" }, 403);
        }

        // Grant flags and words
        if (clue.grants_flags && clue.grants_flags.length > 0) {
          await grantPlayerFlags(player.id, clue.grants_flags);
        }
        if (clue.grants_words && clue.grants_words.length > 0) {
          await grantPlayerWords(player.id, clue.grants_words);
        }

        const { visible_to_teams, visible_to_players, required_flags, grants_flags, grants_words, ...clueData } = clue;
        return json(clueData);
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
          team?: string;
          is_admin?: boolean;
        };
        const newPlayer = await createPlayer(
          body.name,
          body.pin,
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

    // --- Admin: Clues ---

    "/api/admin/clues": {
      GET: async (req) => {
        const player = await getCurrentPlayer(req);
        if (!player?.is_admin) return json({ error: "Forbidden" }, 403);
        return json(await getAllClues());
      },
      POST: async (req) => {
        const player = await getCurrentPlayer(req);
        if (!player?.is_admin) return json({ error: "Forbidden" }, 403);
        const body = await req.json();
        const clue = await createClue(body);
        return json(clue, 201);
      },
    },

    "/api/admin/clues/:id": {
      PUT: async (req) => {
        const player = await getCurrentPlayer(req);
        if (!player?.is_admin) return json({ error: "Forbidden" }, 403);
        const id = parseInt(req.params.id);
        const body = await req.json();
        const clue = await updateClue(id, body);
        if (!clue) return json({ error: "Not found" }, 404);
        return json(clue);
      },
      DELETE: async (req) => {
        const player = await getCurrentPlayer(req);
        if (!player?.is_admin) return json({ error: "Forbidden" }, 403);
        const id = parseInt(req.params.id);
        const ok = await deleteClue(id);
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

    // --- Prompts ---

    "/api/clues/:id/prompts": {
      GET: async (req) => {
        const player = await getCurrentPlayer(req);
        if (!player) return json({ error: "Unauthorized" }, 401);
        const clueId = parseInt(req.params.id);
        const prompts = await getCluePrompts(clueId, player.id);
        // Strip answer from response so players can't cheat via devtools
        return json(prompts.map(({ answer, ...p }) => p));
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
        return json({ ok }, ok ? 200 : 404);
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

    // --- Admin: Progress ---

    "/api/admin/progress": {
      GET: async (req) => {
        const player = await getCurrentPlayer(req);
        if (!player?.is_admin) return json({ error: "Forbidden" }, 403);
        return json(await getAllProgress());
      },
    },

    // --- Frontend catch-all ---
    "/*": index,
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
