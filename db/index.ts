import { sql } from "bun";

// --- Array helpers ---
// Bun.sql doesn't serialize JS arrays to PostgreSQL array literals automatically.
// These helpers produce the correct literal format, e.g. {"foo","bar"} or {1,2,3}.

/** Strip punctuation and collapse whitespace for code phrase comparison. */
export function normalizeCodePhrase(s: string): string {
  return s.replace(/[^\w\s]/g, "").replace(/\s+/g, " ").trim().toLowerCase();
}

function normalizeLower(arr: string[] | null | undefined): string[] | null {
  if (!arr || arr.length === 0) return null;
  return arr.map((s) => s.trim().toLowerCase()).filter(Boolean);
}

function normalizeUpper(arr: string[] | null | undefined): string[] | null {
  if (!arr || arr.length === 0) return null;
  return arr.map((s) => s.trim().toUpperCase()).filter(Boolean);
}

function pgTextArray(arr: string[] | null | undefined): string | null {
  if (!arr || arr.length === 0) return null;
  const escaped = arr.map((s) => '"' + s.replace(/\\/g, "\\\\").replace(/"/g, '\\"') + '"');
  return "{" + escaped.join(",") + "}";
}

function pgIntArray(arr: number[] | null | undefined): string | null {
  if (!arr || arr.length === 0) return null;
  return "{" + arr.join(",") + "}";
}

// Normalise hint text: trim but preserve empty strings (positional),
// return null only when no hints are non-empty.
function normalizeHints(arr: string[] | null | undefined): string[] | null {
  if (!arr || arr.length === 0) return null;
  const trimmed = arr.map((s) => s.trim());
  return trimmed.some(Boolean) ? trimmed : null;
}

// --- Types ---

export interface Player {
  id: number;
  name: string;
  pin: string;
  role: string | null;
  team: string | null;
  is_admin: boolean;
  created_at: Date;
}

export interface Session {
  id: string;
  player_id: number;
  expires_at: Date;
  created_at: Date;
}

export interface Folder {
  id: number;
  name: string;
  parent_id: number | null;
  sort_order: number;
}

export interface Page {
  id: number;
  code_phrase: string;
  title: string;
  content: string;
  page_type: string;
  visible_to_roles: string[] | null;
  required_flags: string[] | null;
  required_flags_hints: string[] | null;
  excluded_by_flags: string[] | null;
  grants_flags: string[] | null;
  grants_words: string[] | null;
  removes_flags: string[] | null;
  removes_words: string[] | null;
  grants_soul: boolean;
  grants_dirt: number;
  game_config: Record<string, unknown> | null;
  scan_code: string | null;
  sort_order: number;
  folder_id: number | null;
  created_at: Date;
}

export interface PlayerFlag {
  id: number;
  player_id: number;
  flag: string;
  granted_at: Date;
}

export interface PlayerWord {
  id: number;
  player_id: number;
  word: string;
  granted_at: Date;
}

export interface Prompt {
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
  generic_wrong_text: string | null;
  allow_any_order: boolean;
  grants_dirt: number;
  sort_order: number;
  created_at: Date;
}

export interface PlayerDirt {
  id: number;
  player_id: number;
  rumour: string;
  sent_by: number | null;
  granted_at: Date;
}

export interface PromptWithCompletion extends Prompt {
  completed: boolean;
  submitted_words: string[] | null;
}

export interface Trade {
  id: number;
  initiator_id: number;
  initiator_name: string;
  initiator_word: string;
  recipient_id: number;
  recipient_name: string;
  recipient_word: string | null;
  status: "offered" | "countered" | "accepted" | "cancelled";
  created_at: Date;
  expires_at: Date;
}

// --- Schema setup ---

export async function initializeDatabase() {
  await sql`
    CREATE TABLE IF NOT EXISTS players (
      id SERIAL PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      pin TEXT NOT NULL,
      role TEXT,
      team TEXT,
      is_admin BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      player_id INT REFERENCES players(id) ON DELETE CASCADE,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS pages (
      id SERIAL PRIMARY KEY,
      code_phrase TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT DEFAULT '',
      page_type TEXT DEFAULT 'text',
      visible_to_roles TEXT[],
      required_flags TEXT[],
      required_flags_hints TEXT[],
      excluded_by_flags TEXT[],
      grants_flags TEXT[],
      grants_words TEXT[],
      removes_flags TEXT[],
      removes_words TEXT[],
      grants_soul BOOLEAN DEFAULT FALSE,
      game_config JSONB,
      scan_code UUID,
      sort_order INT DEFAULT 0,
      folder_id INT REFERENCES page_folders(id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS player_flags (
      id SERIAL PRIMARY KEY,
      player_id INT REFERENCES players(id) ON DELETE CASCADE,
      flag TEXT NOT NULL,
      granted_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(player_id, flag)
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS player_words (
      id SERIAL PRIMARY KEY,
      player_id INT REFERENCES players(id) ON DELETE CASCADE,
      word TEXT NOT NULL,
      granted_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(player_id, word)
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS prompts (
      id SERIAL PRIMARY KEY,
      page_id INT REFERENCES pages(id) ON DELETE CASCADE,
      question TEXT NOT NULL,
      template TEXT NOT NULL,
      answer TEXT[] NOT NULL,
      grants_flags TEXT[],
      grants_words TEXT[],
      removes_flags TEXT[],
      removes_words TEXT[],
      success_text TEXT,
      wrong_answer_hints JSONB,
      allow_any_order BOOLEAN DEFAULT false,
      generic_wrong_text TEXT,
      sort_order INT DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS player_prompt_completions (
      id SERIAL PRIMARY KEY,
      player_id INT REFERENCES players(id) ON DELETE CASCADE,
      prompt_id INT REFERENCES prompts(id) ON DELETE CASCADE,
      submitted_words TEXT[],
      completed_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(player_id, prompt_id)
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS player_page_claims (
      player_id INT REFERENCES players(id) ON DELETE CASCADE,
      page_id INT REFERENCES pages(id) ON DELETE CASCADE,
      claimed_at TIMESTAMPTZ DEFAULT NOW(),
      PRIMARY KEY (player_id, page_id)
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS trades (
      id SERIAL PRIMARY KEY,
      initiator_id INT REFERENCES players(id) ON DELETE CASCADE,
      initiator_word TEXT NOT NULL,
      recipient_id INT REFERENCES players(id) ON DELETE CASCADE,
      recipient_word TEXT,
      status TEXT DEFAULT 'offered',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '30 minutes'
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS page_folders (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      parent_id INT REFERENCES page_folders(id) ON DELETE RESTRICT,
      sort_order INT DEFAULT 0
    )
  `;

  // --- Dirt mechanic tables ---

  await sql`
    CREATE TABLE IF NOT EXISTS dirt_pool (
      id SERIAL PRIMARY KEY,
      rumour TEXT UNIQUE NOT NULL
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS player_dirt (
      id SERIAL PRIMARY KEY,
      player_id INT REFERENCES players(id) ON DELETE CASCADE,
      rumour TEXT NOT NULL,
      sent_by INT REFERENCES players(id) ON DELETE SET NULL,
      granted_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`ALTER TABLE pages ADD COLUMN IF NOT EXISTS grants_dirt INT DEFAULT 0`;
  await sql`ALTER TABLE prompts ADD COLUMN IF NOT EXISTS grants_dirt INT DEFAULT 0`;

  // Seed initial admin if none exists
  const adminCount = await sql`SELECT COUNT(*) as count FROM players WHERE is_admin = true`;
  if (Number(adminCount[0].count) === 0) {
    await sql`
      INSERT INTO players (name, pin, is_admin)
      VALUES ('Admin', '0000', true)
      ON CONFLICT (name) DO NOTHING
    `;
    console.log("Seeded default admin: name='Admin', pin='0000'");
  }
}

// --- Session functions ---

export async function createSession(playerId: number): Promise<string> {
  const id = crypto.randomUUID();
  await sql`
    INSERT INTO sessions (id, player_id, expires_at)
    VALUES (${id}, ${playerId}, NOW() + INTERVAL '7 days')
  `;
  return id;
}

export async function getSessionPlayer(sessionId: string): Promise<Player | null> {
  const rows = await sql`
    SELECT p.* FROM players p
    JOIN sessions s ON s.player_id = p.id
    WHERE s.id = ${sessionId}
      AND s.expires_at > NOW()
  `;
  return rows[0] ?? null;
}

export async function deleteSession(sessionId: string): Promise<void> {
  await sql`DELETE FROM sessions WHERE id = ${sessionId}`;
}

// --- Player functions ---

export async function getPlayerByNameAndPin(name: string, pin: string): Promise<Player | null> {
  const rows = await sql`
    SELECT * FROM players WHERE name = ${name} AND pin = ${pin}
  `;
  return rows[0] ?? null;
}

export async function getPlayerById(id: number): Promise<Player | null> {
  const rows = await sql`SELECT * FROM players WHERE id = ${id}`;
  return rows[0] ?? null;
}

export async function getAllPlayers(): Promise<Player[]> {
  return await sql`SELECT * FROM players ORDER BY name`;
}

export async function createPlayer(
  name: string,
  pin: string,
  role: string | null,
  team: string | null,
  isAdmin: boolean
): Promise<Player> {
  const [player] = await sql`
    INSERT INTO players (name, pin, role, team, is_admin)
    VALUES (${name}, ${pin}, ${role?.trim().toLowerCase() ?? null}, ${team?.trim().toLowerCase() ?? null}, ${isAdmin})
    RETURNING *
  `;
  return player;
}

export async function updatePlayer(
  id: number,
  name: string,
  pin: string,
  role: string | null,
  team: string | null,
  isAdmin: boolean
): Promise<Player | null> {
  const [player] = await sql`
    UPDATE players
    SET name = ${name}, pin = ${pin}, role = ${role?.trim().toLowerCase() ?? null}, team = ${team?.trim().toLowerCase() ?? null}, is_admin = ${isAdmin}
    WHERE id = ${id}
    RETURNING *
  `;
  return player ?? null;
}

export async function deletePlayer(id: number): Promise<boolean> {
  const result = await sql`DELETE FROM players WHERE id = ${id} RETURNING id`;
  return result.length > 0;
}

// --- Page functions ---

// Bun.sql returns JSONB columns as raw strings, not parsed objects.
// This helper parses game_config after every DB read.
function parsePageRow(row: any): Page {
  if (row && typeof row.game_config === "string") {
    try { row.game_config = JSON.parse(row.game_config); } catch { row.game_config = null; }
  }
  return row as Page;
}

export async function getAllPages(): Promise<Page[]> {
  const rows = await sql`SELECT * FROM pages ORDER BY sort_order, created_at`;
  return rows.map(parsePageRow);
}

export async function getPageByCode(codePhrase: string): Promise<Page | null> {
  const rows = await sql`SELECT * FROM pages WHERE code_phrase = ${codePhrase}`;
  return rows[0] ? parsePageRow(rows[0]) : null;
}

export async function getPageByScanCode(scanCode: string): Promise<Page | null> {
  const rows = await sql`SELECT * FROM pages WHERE scan_code = ${scanCode} AND page_type = 'scan_target'`;
  return rows[0] ? parsePageRow(rows[0]) : null;
}

export async function getPageByCodeForPlayer(
  codePhrase: string,
  playerId: number,
  playerRole: string | null,
  playerFlags: string[]
): Promise<{ page: Page } | { blocked: Page } | null> {
  const rawRows = await sql`SELECT * FROM pages WHERE code_phrase = ${codePhrase}`;
  const rows = rawRows.map(parsePageRow) as Page[];
  if (rows.length === 0) return null;

  const role = playerRole?.toLowerCase() ?? null;
  const flagsLower = playerFlags.map((f) => f.toLowerCase());

  const meetsFlags = (page: Page): boolean => {
    if (!page.required_flags || page.required_flags.length === 0) return true;
    return page.required_flags.every((f) => flagsLower.includes(f.toLowerCase()));
  };

  const isExcluded = (page: Page): boolean => {
    if (!page.excluded_by_flags || page.excluded_by_flags.length === 0) return false;
    return page.excluded_by_flags.some((f) => flagsLower.includes(f.toLowerCase()));
  };

  // Remove pages the player is excluded from — they're completely invisible
  const eligible = rows.filter((p) => !isExcluded(p));
  if (eligible.length === 0) return null;

  // Within each tier, pick the qualifying page with the highest sort_order
  // (furthest down in the admin list). This lets admins stack progressively
  // harder versions of a page and the player sees the most advanced one they qualify for.
  const bestIn = (candidates: Page[]): Page | null => {
    const qualified = candidates.filter(meetsFlags);
    if (qualified.length === 0) return null;
    return qualified.reduce((a, b) => (b.sort_order >= a.sort_order ? b : a));
  };

  // Priority 1: listed for this player's role
  const roleSpecific = eligible.filter(
    (p) =>
      role &&
      p.visible_to_roles &&
      p.visible_to_roles.map((r) => r.toLowerCase()).includes(role)
  );
  const p1 = bestIn(roleSpecific);
  if (p1) return { page: p1 };

  // Priority 2: open to all (no restrictions)
  const open = eligible.filter((p) => !p.visible_to_roles);
  const p2 = bestIn(open);
  if (p2) return { page: p2 };

  // No qualifying page found — return the visible-but-blocked page with the
  // lowest sort_order (highest in the admin list, i.e. the next one they need to unlock)
  // so the caller can show its required_flags_hints.
  const visiblePages = [
    ...roleSpecific,
    ...open,
  ];
  if (visiblePages.length > 0) {
    const best = visiblePages.reduce((a, b) => (a.sort_order <= b.sort_order ? a : b));
    return { blocked: best };
  }

  return null;
}

export async function createPage(data: {
  code_phrase: string;
  title: string;
  content?: string;
  page_type?: string;
  visible_to_roles?: string[] | null;
  required_flags?: string[] | null;
  required_flags_hints?: string[] | null;
  excluded_by_flags?: string[] | null;
  grants_flags?: string[] | null;
  grants_words?: string[] | null;
  removes_flags?: string[] | null;
  removes_words?: string[] | null;
  grants_soul?: boolean;
  grants_dirt?: number;
  game_config?: Record<string, unknown> | null;
  sort_order?: number;
  folder_id?: number | null;
}): Promise<Page> {
  const folderId = data.folder_id ?? null;
  let sortOrder = data.sort_order;
  if (sortOrder === undefined) {
    const [row] = await sql`SELECT COALESCE(MAX(sort_order), -1) + 1 AS next FROM pages WHERE folder_id ${folderId === null ? sql`IS NULL` : sql`= ${folderId}`}`;
    sortOrder = row.next;
  }
  const pageType = data.page_type ?? "text";
  const scanCode = pageType === "scan_target" ? crypto.randomUUID() : null;
  const [page] = await sql`
    INSERT INTO pages (
      code_phrase, title, content, page_type,
      visible_to_roles,
      required_flags, required_flags_hints, excluded_by_flags,
      grants_flags, grants_words,
      removes_flags, removes_words, grants_soul, grants_dirt, game_config, scan_code, sort_order, folder_id
    )
    VALUES (
      ${normalizeCodePhrase(data.code_phrase)},
      ${data.title},
      ${data.content ?? ""},
      ${pageType},
      ${pgTextArray(normalizeLower(data.visible_to_roles))},
      ${pgTextArray(normalizeLower(data.required_flags))},
      ${pgTextArray(normalizeHints(data.required_flags_hints))},
      ${pgTextArray(normalizeLower(data.excluded_by_flags))},
      ${pgTextArray(normalizeLower(data.grants_flags))},
      ${pgTextArray(normalizeUpper(data.grants_words))},
      ${pgTextArray(normalizeLower(data.removes_flags))},
      ${pgTextArray(normalizeUpper(data.removes_words))},
      ${data.grants_soul ?? false},
      ${data.grants_dirt ?? 0},
      ${data.game_config ? JSON.stringify(data.game_config) : null},
      ${scanCode},
      ${sortOrder},
      ${folderId}
    )
    RETURNING *
  `;
  return parsePageRow(page);
}

export async function updatePage(
  id: number,
  data: {
    code_phrase: string;
    title: string;
    content?: string;
    page_type?: string;
    visible_to_roles?: string[] | null;
    required_flags?: string[] | null;
    required_flags_hints?: string[] | null;
    excluded_by_flags?: string[] | null;
    grants_soul?: boolean;
    grants_dirt?: number;
    grants_flags?: string[] | null;
    grants_words?: string[] | null;
    removes_flags?: string[] | null;
    removes_words?: string[] | null;
    game_config?: Record<string, unknown> | null;
    sort_order?: number;
    folder_id?: number | null;
  }
): Promise<Page | null> {
  const pageType = data.page_type ?? "text";
  // Auto-manage scan_code: generate if becoming scan_target and doesn't have one,
  // clear if changing away from scan_target
  const scanCodeExpr = pageType === "scan_target"
    ? sql`COALESCE(pages.scan_code, gen_random_uuid())`
    : sql`NULL`;
  const [page] = await sql`
    UPDATE pages SET
      code_phrase = ${normalizeCodePhrase(data.code_phrase)},
      title = ${data.title},
      content = ${data.content ?? ""},
      page_type = ${pageType},
      visible_to_roles = ${pgTextArray(normalizeLower(data.visible_to_roles))},
      required_flags = ${pgTextArray(normalizeLower(data.required_flags))},
      required_flags_hints = ${pgTextArray(normalizeHints(data.required_flags_hints))},
      excluded_by_flags = ${pgTextArray(normalizeLower(data.excluded_by_flags))},
      grants_flags = ${pgTextArray(normalizeLower(data.grants_flags))},
      grants_words = ${pgTextArray(normalizeUpper(data.grants_words))},
      removes_flags = ${pgTextArray(normalizeLower(data.removes_flags))},
      removes_words = ${pgTextArray(normalizeUpper(data.removes_words))},
      grants_soul = ${data.grants_soul ?? false},
      grants_dirt = ${data.grants_dirt ?? 0},
      game_config = ${data.game_config ? JSON.stringify(data.game_config) : null},
      scan_code = ${scanCodeExpr},
      sort_order = COALESCE(${data.sort_order !== undefined ? data.sort_order : null}, pages.sort_order),
      folder_id = ${data.folder_id ?? null}
    WHERE id = ${id}
    RETURNING *
  `;
  return page ? parsePageRow(page) : null;
}

export async function deletePage(id: number): Promise<boolean> {
  const result = await sql`DELETE FROM pages WHERE id = ${id} RETURNING id`;
  return result.length > 0;
}

export async function reorderPages(
  updates: { id: number; sort_order: number; folder_id: number | null }[]
): Promise<void> {
  for (const { id, sort_order, folder_id } of updates) {
    await sql`UPDATE pages SET sort_order = ${sort_order}, folder_id = ${folder_id ?? null} WHERE id = ${id}`;
  }
}

// --- Folder functions ---

export async function getAllFolders(): Promise<Folder[]> {
  return await sql`SELECT * FROM page_folders ORDER BY sort_order, name`;
}

export async function createFolder(name: string, parentId: number | null): Promise<Folder> {
  const [folder] = await sql`
    INSERT INTO page_folders (name, parent_id)
    VALUES (${name.trim()}, ${parentId ?? null})
    RETURNING *
  `;
  return folder;
}

export async function updateFolder(
  id: number,
  data: { name?: string; parent_id?: number | null; sort_order?: number }
): Promise<Folder | null> {
  const existing = await sql`SELECT * FROM page_folders WHERE id = ${id}`;
  if (existing.length === 0) return null;

  const current = existing[0] as Folder;
  const newParentId = "parent_id" in data ? (data.parent_id ?? null) : current.parent_id;

  // Cycle detection: walk proposed parent chain, reject if own id appears
  if (newParentId !== null) {
    let cursor: number | null = newParentId;
    while (cursor !== null) {
      if (cursor === id) return null; // cycle detected
      const rows: { parent_id: number | null }[] = await sql`SELECT parent_id FROM page_folders WHERE id = ${cursor}`;
      cursor = rows[0]?.parent_id ?? null;
    }
  }

  const [folder] = await sql`
    UPDATE page_folders SET
      name = ${data.name?.trim() ?? current.name},
      parent_id = ${newParentId},
      sort_order = ${data.sort_order ?? current.sort_order}
    WHERE id = ${id}
    RETURNING *
  `;
  return folder ?? null;
}

export async function deleteFolder(id: number): Promise<{ ok: boolean; error?: string }> {
  const pages = await sql`SELECT id FROM pages WHERE folder_id = ${id} LIMIT 1`;
  if (pages.length > 0) return { ok: false, error: "Folder contains pages — move or delete them first" };

  const subFolders = await sql`SELECT id FROM page_folders WHERE parent_id = ${id} LIMIT 1`;
  if (subFolders.length > 0) return { ok: false, error: "Folder contains sub-folders — delete them first" };

  await sql`DELETE FROM page_folders WHERE id = ${id}`;
  return { ok: true };
}

export async function reorderFolders(
  updates: { id: number; sort_order: number; parent_id: number | null }[]
): Promise<void> {
  for (const { id, sort_order, parent_id } of updates) {
    await sql`UPDATE page_folders SET sort_order = ${sort_order}, parent_id = ${parent_id ?? null} WHERE id = ${id}`;
  }
}

// --- Player flags functions ---

export async function getPlayerFlags(playerId: number): Promise<string[]> {
  const rows = await sql`
    SELECT flag FROM player_flags WHERE player_id = ${playerId}
  `;
  return rows.map((r: { flag: string }) => r.flag);
}

export async function grantPlayerFlags(playerId: number, flags: string[]): Promise<void> {
  for (const flag of flags) {
    await sql`
      INSERT INTO player_flags (player_id, flag)
      VALUES (${playerId}, ${flag.trim().toLowerCase()})
      ON CONFLICT (player_id, flag) DO NOTHING
    `;
  }
}

export async function getAllProgress(): Promise<Array<{ player: Omit<Player, "pin">; flags: string[]; words: string[] }>> {
  const players = await getAllPlayers();
  const result = [];
  for (const player of players) {
    const flags = await getPlayerFlags(player.id);
    const words = await getPlayerWords(player.id);
    const { pin, ...safePlayer } = player;
    result.push({ player: safePlayer, flags, words });
  }
  return result;
}

// --- Player words functions ---

export async function getPlayerWords(playerId: number): Promise<string[]> {
  const rows = await sql`
    SELECT word FROM player_words WHERE player_id = ${playerId} ORDER BY granted_at
  `;
  return rows.map((r: { word: string }) => r.word);
}

export async function getPlayerWordsWithIds(playerId: number): Promise<PlayerWord[]> {
  return await sql`
    SELECT * FROM player_words WHERE player_id = ${playerId} ORDER BY granted_at
  `;
}

export async function hasClaimedPage(playerId: number, pageId: number): Promise<boolean> {
  const rows = await sql`SELECT 1 FROM player_page_claims WHERE player_id = ${playerId} AND page_id = ${pageId}`;
  return rows.length > 0;
}

export async function claimPage(playerId: number, pageId: number): Promise<void> {
  await sql`INSERT INTO player_page_claims (player_id, page_id) VALUES (${playerId}, ${pageId}) ON CONFLICT DO NOTHING`;
}

export async function resetPlayerProgress(playerId: number): Promise<void> {
  await sql`DELETE FROM player_flags WHERE player_id = ${playerId}`;
  await sql`DELETE FROM player_words WHERE player_id = ${playerId}`;
  await sql`DELETE FROM player_prompt_completions WHERE player_id = ${playerId}`;
  await sql`DELETE FROM player_page_claims WHERE player_id = ${playerId}`;
  await sql`DELETE FROM player_dirt WHERE player_id = ${playerId}`;
  await sql`DELETE FROM player_dirt WHERE sent_by = ${playerId}`;
}

const SOUL_SUFFIX = "'S SOUL";

export function isSoulWord(word: string): boolean {
  return word.trim().toUpperCase().endsWith(SOUL_SUFFIX);
}

/** Grants words to a player. For soul words, enforces uniqueness by removing
 *  them from all other players first. Returns IDs of other players who lost a soul. */
export async function grantPlayerWords(playerId: number, words: string[]): Promise<number[]> {
  const affectedIds = new Set<number>();
  for (const word of words) {
    const upper = word.trim().toUpperCase();
    if (isSoulWord(upper)) {
      const removed = await sql`
        DELETE FROM player_words WHERE word = ${upper} AND player_id != ${playerId} RETURNING player_id
      `;
      for (const r of removed) affectedIds.add(r.player_id);
    }
    await sql`
      INSERT INTO player_words (player_id, word)
      VALUES (${playerId}, ${upper})
      ON CONFLICT (player_id, word) DO NOTHING
    `;
  }
  return [...affectedIds];
}

export async function removePlayerWord(playerId: number, wordId: number): Promise<boolean> {
  const result = await sql`
    DELETE FROM player_words WHERE id = ${wordId} AND player_id = ${playerId} RETURNING id
  `;
  return result.length > 0;
}

export async function removePlayerFlags(playerId: number, flags: string[]): Promise<void> {
  for (const flag of flags) {
    await sql`
      DELETE FROM player_flags WHERE player_id = ${playerId} AND flag = ${flag.trim().toLowerCase()}
    `;
  }
}

export async function removePlayerWordsByText(playerId: number, words: string[]): Promise<void> {
  for (const word of words) {
    await sql`
      DELETE FROM player_words WHERE player_id = ${playerId} AND word = ${word.trim().toUpperCase()}
    `;
  }
}

// --- Prompt functions ---

function parsePromptRow(row: any): Prompt {
  if (row && typeof row.wrong_answer_hints === "string") {
    try { row.wrong_answer_hints = JSON.parse(row.wrong_answer_hints); } catch { row.wrong_answer_hints = null; }
  }
  return row as Prompt;
}

function normalizeWrongAnswerHints(hints: Record<string, string> | null | undefined): string | null {
  if (!hints) return null;
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(hints)) {
    const k = key.trim().toUpperCase();
    const v = value.trim();
    if (k && v) out[k] = v;
  }
  return Object.keys(out).length > 0 ? JSON.stringify(out) : null;
}

export async function getPagePrompts(pageId: number, playerId: number): Promise<PromptWithCompletion[]> {
  const rows = await sql`
    SELECT p.*, (ppc.id IS NOT NULL) AS completed, ppc.submitted_words
    FROM prompts p
    LEFT JOIN player_prompt_completions ppc
      ON ppc.prompt_id = p.id AND ppc.player_id = ${playerId}
    WHERE p.page_id = ${pageId}
    ORDER BY p.sort_order, p.created_at
  `;
  return rows.map((r: Prompt & { completed: unknown; submitted_words: string[] | null }) => ({
    ...parsePromptRow(r),
    completed: Boolean(r.completed),
    submitted_words: r.submitted_words ?? null,
  }));
}

export async function getAllPrompts(): Promise<Prompt[]> {
  const rows = await sql`SELECT * FROM prompts ORDER BY page_id, sort_order, created_at`;
  return rows.map(parsePromptRow);
}

export async function getPromptById(id: number): Promise<Prompt | null> {
  const rows = await sql`SELECT * FROM prompts WHERE id = ${id}`;
  return rows[0] ? parsePromptRow(rows[0]) : null;
}

export async function createPrompt(data: {
  page_id: number;
  question: string;
  template: string;
  answer: string[];
  grants_flags?: string[] | null;
  grants_words?: string[] | null;
  removes_flags?: string[] | null;
  removes_words?: string[] | null;
  success_text?: string | null;
  wrong_answer_hints?: Record<string, string> | null;
  generic_wrong_text?: string | null;
  allow_any_order?: boolean;
  grants_dirt?: number;
  sort_order?: number;
}): Promise<Prompt> {
  const [prompt] = await sql`
    INSERT INTO prompts (page_id, question, template, answer, grants_flags, grants_words, removes_flags, removes_words, success_text, wrong_answer_hints, generic_wrong_text, allow_any_order, grants_dirt, sort_order)
    VALUES (
      ${data.page_id},
      ${data.question},
      ${data.template},
      ${pgTextArray(normalizeUpper(data.answer))},
      ${pgTextArray(normalizeLower(data.grants_flags))},
      ${pgTextArray(normalizeUpper(data.grants_words))},
      ${pgTextArray(normalizeLower(data.removes_flags))},
      ${pgTextArray(normalizeUpper(data.removes_words))},
      ${data.success_text ?? null},
      ${normalizeWrongAnswerHints(data.wrong_answer_hints)},
      ${data.generic_wrong_text ?? null},
      ${data.allow_any_order ?? false},
      ${data.grants_dirt ?? 0},
      ${data.sort_order ?? 0}
    )
    RETURNING *
  `;
  return parsePromptRow(prompt);
}

export async function updatePrompt(
  id: number,
  data: {
    page_id: number;
    question: string;
    template: string;
    answer: string[];
    grants_flags?: string[] | null;
    grants_words?: string[] | null;
    removes_flags?: string[] | null;
    removes_words?: string[] | null;
    success_text?: string | null;
    wrong_answer_hints?: Record<string, string> | null;
    generic_wrong_text?: string | null;
    allow_any_order?: boolean;
    grants_dirt?: number;
    sort_order?: number;
  }
): Promise<Prompt | null> {
  const [prompt] = await sql`
    UPDATE prompts SET
      page_id = ${data.page_id},
      question = ${data.question},
      template = ${data.template},
      answer = ${pgTextArray(normalizeUpper(data.answer))},
      grants_flags = ${pgTextArray(normalizeLower(data.grants_flags))},
      grants_words = ${pgTextArray(normalizeUpper(data.grants_words))},
      removes_flags = ${pgTextArray(normalizeLower(data.removes_flags))},
      removes_words = ${pgTextArray(normalizeUpper(data.removes_words))},
      success_text = ${data.success_text ?? null},
      wrong_answer_hints = ${normalizeWrongAnswerHints(data.wrong_answer_hints)},
      generic_wrong_text = ${data.generic_wrong_text ?? null},
      allow_any_order = ${data.allow_any_order ?? false},
      grants_dirt = ${data.grants_dirt ?? 0},
      sort_order = ${data.sort_order ?? 0}
    WHERE id = ${id}
    RETURNING *
  `;
  return prompt ? parsePromptRow(prompt) : null;
}

export async function deletePrompt(id: number): Promise<boolean> {
  const result = await sql`DELETE FROM prompts WHERE id = ${id} RETURNING id`;
  return result.length > 0;
}

// --- Trade functions ---

export async function getTradeById(id: number): Promise<Trade | null> {
  const rows = await sql`
    SELECT t.*, p1.name AS initiator_name, p2.name AS recipient_name
    FROM trades t
    JOIN players p1 ON p1.id = t.initiator_id
    JOIN players p2 ON p2.id = t.recipient_id
    WHERE t.id = ${id}
  `;
  return rows[0] ?? null;
}

export async function getPlayerActiveTrades(playerId: number): Promise<Trade[]> {
  return await sql`
    SELECT t.*, p1.name AS initiator_name, p2.name AS recipient_name
    FROM trades t
    JOIN players p1 ON p1.id = t.initiator_id
    JOIN players p2 ON p2.id = t.recipient_id
    WHERE (t.initiator_id = ${playerId} OR t.recipient_id = ${playerId})
      AND t.status IN ('offered', 'countered')
      AND t.expires_at > NOW()
    ORDER BY t.created_at DESC
  `;
}

export async function getPlayersWithWordStatus(
  excludeId: number,
  word: string
): Promise<{ id: number; name: string; role: string | null; team: string | null; has_word: boolean }[]> {
  const upper = word.trim().toUpperCase();
  const rows = await sql`
    SELECT p.id, p.name, p.role, p.team, (pw.id IS NOT NULL) AS has_word
    FROM players p
    LEFT JOIN player_words pw ON pw.player_id = p.id AND pw.word = ${upper}
    WHERE p.id != ${excludeId}
    ORDER BY p.name
  `;
  return rows.map((r: { id: number; name: string; role: string | null; team: string | null; has_word: unknown }) => ({
    ...r,
    has_word: Boolean(r.has_word),
  }));
}

export async function createTrade(
  initiatorId: number,
  initiatorWord: string,
  recipientId: number
): Promise<Trade | null> {
  const words = await getPlayerWords(initiatorId);
  if (!words.includes(initiatorWord)) return null;

  const [row] = await sql`
    INSERT INTO trades (initiator_id, initiator_word, recipient_id)
    VALUES (${initiatorId}, ${initiatorWord}, ${recipientId})
    RETURNING id
  `;
  return getTradeById(row.id);
}

export async function counterTrade(
  tradeId: number,
  recipientId: number,
  recipientWord: string
): Promise<Trade | null> {
  const trade = await getTradeById(tradeId);
  if (!trade || trade.recipient_id !== recipientId || trade.status !== "offered") return null;

  const words = await getPlayerWords(recipientId);
  if (!words.includes(recipientWord)) return null;

  await sql`
    UPDATE trades SET recipient_word = ${recipientWord}, status = 'countered'
    WHERE id = ${tradeId}
  `;
  return getTradeById(tradeId);
}

export async function acceptTrade(
  tradeId: number,
  initiatorId: number
): Promise<{ ok: boolean; error?: string; affectedPlayerIds?: number[] }> {
  const trade = await getTradeById(tradeId);
  if (!trade) return { ok: false, error: "Trade not found" };
  if (trade.initiator_id !== initiatorId) return { ok: false, error: "Not your trade" };
  if (trade.status !== "countered") return { ok: false, error: "Trade not ready to accept" };
  if (!trade.recipient_word) return { ok: false, error: "No counter offer" };

  const [initiatorWords, recipientWords] = await Promise.all([
    getPlayerWords(trade.initiator_id),
    getPlayerWords(trade.recipient_id),
  ]);

  if (!initiatorWords.includes(trade.initiator_word)) {
    await sql`UPDATE trades SET status = 'cancelled' WHERE id = ${tradeId}`;
    return { ok: false, error: "Your offered word is no longer in your inventory" };
  }
  if (!recipientWords.includes(trade.recipient_word)) {
    await sql`UPDATE trades SET status = 'cancelled' WHERE id = ${tradeId}`;
    return { ok: false, error: "Partner's offered word is no longer in their inventory" };
  }

  // Swap words — enforce soul uniqueness for any soul words changing hands
  const affectedIds = new Set<number>();
  await sql`DELETE FROM player_words WHERE player_id = ${trade.initiator_id} AND word = ${trade.initiator_word}`;
  await sql`DELETE FROM player_words WHERE player_id = ${trade.recipient_id} AND word = ${trade.recipient_word}`;
  if (isSoulWord(trade.initiator_word)) {
    const removed = await sql`DELETE FROM player_words WHERE word = ${trade.initiator_word} AND player_id != ${trade.recipient_id} RETURNING player_id`;
    for (const r of removed) affectedIds.add(r.player_id);
  }
  if (isSoulWord(trade.recipient_word)) {
    const removed = await sql`DELETE FROM player_words WHERE word = ${trade.recipient_word} AND player_id != ${trade.initiator_id} RETURNING player_id`;
    for (const r of removed) affectedIds.add(r.player_id);
  }
  await sql`INSERT INTO player_words (player_id, word) VALUES (${trade.recipient_id}, ${trade.initiator_word}) ON CONFLICT DO NOTHING`;
  await sql`INSERT INTO player_words (player_id, word) VALUES (${trade.initiator_id}, ${trade.recipient_word}) ON CONFLICT DO NOTHING`;
  await sql`UPDATE trades SET status = 'accepted' WHERE id = ${tradeId}`;

  // Remove the two traders from affected set — they're already notified via trade_update
  affectedIds.delete(trade.initiator_id);
  affectedIds.delete(trade.recipient_id);

  return { ok: true, affectedPlayerIds: [...affectedIds] };
}

export async function cancelTrade(tradeId: number, playerId: number): Promise<boolean> {
  const result = await sql`
    UPDATE trades SET status = 'cancelled'
    WHERE id = ${tradeId}
      AND (initiator_id = ${playerId} OR recipient_id = ${playerId})
      AND status IN ('offered', 'countered')
    RETURNING id
  `;
  return result.length > 0;
}

export async function submitPromptAnswer(
  promptId: number,
  playerId: number,
  words: string[]
): Promise<{ correct: boolean; grants_flags?: string[]; grants_words?: string[]; success_text?: string; hints?: string[]; affectedPlayerIds?: number[]; grants_dirt?: number }> {
  const prompt = await getPromptById(promptId);
  if (!prompt) return { correct: false };

  const normalize = (s: string) => s.trim().toUpperCase();
  let correct: boolean;

  if (prompt.allow_any_order) {
    // Each submitted word must match a different answer slot (no duplicates)
    if (prompt.answer.length !== words.length) {
      correct = false;
    } else {
      const used = new Set<number>();
      correct = words.every((w) => {
        const norm = normalize(w);
        const idx = prompt.answer.findIndex((a, i) => {
          if (used.has(i)) return false;
          return a.split("|").map((s) => s.trim().toUpperCase()).includes(norm);
        });
        if (idx === -1) return false;
        used.add(idx);
        return true;
      });
    }
  } else {
    correct =
      prompt.answer.length === words.length &&
      prompt.answer.every((a, i) => {
        const alternatives = a.split("|").map((s) => s.trim().toUpperCase());
        return alternatives.includes(normalize(words[i] ?? ""));
      });
  }

  if (!correct) {
    const hints: string[] = [];
    if (prompt.wrong_answer_hints) {
      for (let i = 0; i < words.length; i++) {
        const expected = prompt.answer[i];
        const submitted = normalize(words[i] ?? "");
        // Skip hints for words that are correct in their position
        if (expected) {
          const alternatives = expected.split("|").map((s) => s.trim().toUpperCase());
          if (alternatives.includes(submitted)) continue;
        }
        const hint = prompt.wrong_answer_hints[submitted];
        if (hint) hints.push(hint);
      }
    }
    return { correct: false, ...(hints.length > 0 ? { hints } : prompt.generic_wrong_text ? { generic_wrong_text: prompt.generic_wrong_text } : {}) };
  }

  const submittedUpper = words.map((w) => w.trim().toUpperCase());
  await sql`
    INSERT INTO player_prompt_completions (player_id, prompt_id, submitted_words)
    VALUES (${playerId}, ${promptId}, ${pgTextArray(submittedUpper)})
    ON CONFLICT (player_id, prompt_id) DO NOTHING
  `;

  if (prompt.grants_flags && prompt.grants_flags.length > 0) {
    await grantPlayerFlags(playerId, prompt.grants_flags);
  }
  let affectedPlayerIds: number[] = [];
  if (prompt.grants_words && prompt.grants_words.length > 0) {
    affectedPlayerIds = await grantPlayerWords(playerId, prompt.grants_words);
  }
  if (prompt.removes_flags && prompt.removes_flags.length > 0) {
    await removePlayerFlags(playerId, prompt.removes_flags);
  }
  if (prompt.removes_words && prompt.removes_words.length > 0) {
    await removePlayerWordsByText(playerId, prompt.removes_words);
  }

  return {
    correct: true,
    grants_flags: prompt.grants_flags ?? undefined,
    grants_words: prompt.grants_words ?? undefined,
    success_text: prompt.success_text ?? undefined,
    affectedPlayerIds: affectedPlayerIds.length > 0 ? affectedPlayerIds : undefined,
    grants_dirt: prompt.grants_dirt > 0 ? prompt.grants_dirt : undefined,
  };
}

// --- Dirt mechanic functions ---

export async function seedDirtPool(rumours: string[]): Promise<void> {
  for (const r of rumours) {
    await sql`INSERT INTO dirt_pool (rumour) VALUES (${r.trim().toUpperCase()}) ON CONFLICT DO NOTHING`;
  }
}

export async function getAllDirtPool(): Promise<{ id: number; rumour: string }[]> {
  return await sql`SELECT id, rumour FROM dirt_pool ORDER BY id`;
}

/** Pick N random rumours from the pool. Tries to avoid rumours already on any player. */
export async function getRandomDirt(count: number): Promise<string[]> {
  // Prefer rumours not yet in play
  const fresh = await sql`
    SELECT rumour FROM dirt_pool
    WHERE rumour NOT IN (SELECT rumour FROM player_dirt)
    ORDER BY RANDOM()
    LIMIT ${count}
  `;
  if (fresh.length >= count) return fresh.map((r: any) => r.rumour as string);
  // Fall back to any random rumour if pool is nearly exhausted
  const fallback = await sql`
    SELECT rumour FROM dirt_pool ORDER BY RANDOM() LIMIT ${count}
  `;
  return fallback.map((r: any) => r.rumour as string);
}

export async function sendDirt(
  targetId: number,
  rumour: string,
  sentBy: number
): Promise<void> {
  await sql`
    INSERT INTO player_dirt (player_id, rumour, sent_by)
    VALUES (${targetId}, ${rumour.trim().toUpperCase()}, ${sentBy})
  `;
}

export async function getPlayerDirt(playerId: number): Promise<PlayerDirt[]> {
  return await sql`
    SELECT * FROM player_dirt WHERE player_id = ${playerId} ORDER BY granted_at
  `;
}

export async function getMobsterLeaderboard(): Promise<
  { id: number; name: string; dirt_count: number }[]
> {
  return await sql`
    SELECT p.id, p.name, COUNT(d.id)::int AS dirt_count
    FROM players p
    LEFT JOIN player_dirt d ON d.player_id = p.id
    WHERE p.role = 'mobster'
    GROUP BY p.id, p.name
    ORDER BY dirt_count ASC, p.name ASC
  `;
}
