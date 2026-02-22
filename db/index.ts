import { sql } from "bun";

// --- Array helpers ---
// Bun.sql doesn't serialize JS arrays to PostgreSQL array literals automatically.
// These helpers produce the correct literal format, e.g. {"foo","bar"} or {1,2,3}.

function pgTextArray(arr: string[] | null | undefined): string | null {
  if (!arr || arr.length === 0) return null;
  const escaped = arr.map((s) => '"' + s.replace(/\\/g, "\\\\").replace(/"/g, '\\"') + '"');
  return "{" + escaped.join(",") + "}";
}

function pgIntArray(arr: number[] | null | undefined): string | null {
  if (!arr || arr.length === 0) return null;
  return "{" + arr.join(",") + "}";
}

// --- Types ---

export interface Player {
  id: number;
  name: string;
  pin: string;
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

export interface Clue {
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
  clue_id: number;
  question: string;
  template: string;
  answer: string[];
  grants_flags: string[] | null;
  grants_words: string[] | null;
  success_text: string | null;
  sort_order: number;
  created_at: Date;
}

export interface PromptWithCompletion extends Prompt {
  completed: boolean;
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
    CREATE TABLE IF NOT EXISTS clues (
      id SERIAL PRIMARY KEY,
      code_phrase TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      content TEXT DEFAULT '',
      page_type TEXT DEFAULT 'text',
      visible_to_teams TEXT[],
      visible_to_players INT[],
      required_flags TEXT[],
      grants_flags TEXT[],
      sort_order INT DEFAULT 0,
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

  await sql`ALTER TABLE clues ADD COLUMN IF NOT EXISTS grants_words TEXT[]`;

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
      clue_id INT REFERENCES clues(id) ON DELETE CASCADE,
      question TEXT NOT NULL,
      template TEXT NOT NULL,
      answer TEXT[] NOT NULL,
      grants_flags TEXT[],
      grants_words TEXT[],
      success_text TEXT,
      sort_order INT DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`ALTER TABLE prompts ADD COLUMN IF NOT EXISTS success_text TEXT`;

  await sql`
    CREATE TABLE IF NOT EXISTS player_prompt_completions (
      id SERIAL PRIMARY KEY,
      player_id INT REFERENCES players(id) ON DELETE CASCADE,
      prompt_id INT REFERENCES prompts(id) ON DELETE CASCADE,
      completed_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(player_id, prompt_id)
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
  team: string | null,
  isAdmin: boolean
): Promise<Player> {
  const [player] = await sql`
    INSERT INTO players (name, pin, team, is_admin)
    VALUES (${name}, ${pin}, ${team}, ${isAdmin})
    RETURNING *
  `;
  return player;
}

export async function updatePlayer(
  id: number,
  name: string,
  pin: string,
  team: string | null,
  isAdmin: boolean
): Promise<Player | null> {
  const [player] = await sql`
    UPDATE players
    SET name = ${name}, pin = ${pin}, team = ${team}, is_admin = ${isAdmin}
    WHERE id = ${id}
    RETURNING *
  `;
  return player ?? null;
}

export async function deletePlayer(id: number): Promise<boolean> {
  const result = await sql`DELETE FROM players WHERE id = ${id} RETURNING id`;
  return result.length > 0;
}

// --- Clue functions ---

export async function getAllClues(): Promise<Clue[]> {
  return await sql`SELECT * FROM clues ORDER BY sort_order, created_at`;
}

export async function getClueByCode(codePhrase: string): Promise<Clue | null> {
  const rows = await sql`SELECT * FROM clues WHERE code_phrase = ${codePhrase}`;
  return rows[0] ?? null;
}

export async function createClue(data: {
  code_phrase: string;
  title: string;
  content?: string;
  page_type?: string;
  visible_to_teams?: string[] | null;
  visible_to_players?: number[] | null;
  required_flags?: string[] | null;
  grants_flags?: string[] | null;
  grants_words?: string[] | null;
  sort_order?: number;
}): Promise<Clue> {
  const [clue] = await sql`
    INSERT INTO clues (
      code_phrase, title, content, page_type,
      visible_to_teams, visible_to_players,
      required_flags, grants_flags, grants_words, sort_order
    )
    VALUES (
      ${data.code_phrase},
      ${data.title},
      ${data.content ?? ""},
      ${data.page_type ?? "text"},
      ${pgTextArray(data.visible_to_teams)},
      ${pgIntArray(data.visible_to_players)},
      ${pgTextArray(data.required_flags)},
      ${pgTextArray(data.grants_flags)},
      ${pgTextArray(data.grants_words)},
      ${data.sort_order ?? 0}
    )
    RETURNING *
  `;
  return clue;
}

export async function updateClue(
  id: number,
  data: {
    code_phrase: string;
    title: string;
    content?: string;
    page_type?: string;
    visible_to_teams?: string[] | null;
    visible_to_players?: number[] | null;
    required_flags?: string[] | null;
    grants_flags?: string[] | null;
    grants_words?: string[] | null;
    sort_order?: number;
  }
): Promise<Clue | null> {
  const [clue] = await sql`
    UPDATE clues SET
      code_phrase = ${data.code_phrase},
      title = ${data.title},
      content = ${data.content ?? ""},
      page_type = ${data.page_type ?? "text"},
      visible_to_teams = ${pgTextArray(data.visible_to_teams)},
      visible_to_players = ${pgIntArray(data.visible_to_players)},
      required_flags = ${pgTextArray(data.required_flags)},
      grants_flags = ${pgTextArray(data.grants_flags)},
      grants_words = ${pgTextArray(data.grants_words)},
      sort_order = ${data.sort_order ?? 0}
    WHERE id = ${id}
    RETURNING *
  `;
  return clue ?? null;
}

export async function deleteClue(id: number): Promise<boolean> {
  const result = await sql`DELETE FROM clues WHERE id = ${id} RETURNING id`;
  return result.length > 0;
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
      VALUES (${playerId}, ${flag})
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

export async function resetPlayerProgress(playerId: number): Promise<void> {
  await sql`DELETE FROM player_flags WHERE player_id = ${playerId}`;
  await sql`DELETE FROM player_words WHERE player_id = ${playerId}`;
  await sql`DELETE FROM player_prompt_completions WHERE player_id = ${playerId}`;
}

export async function grantPlayerWords(playerId: number, words: string[]): Promise<void> {
  for (const word of words) {
    await sql`
      INSERT INTO player_words (player_id, word)
      VALUES (${playerId}, ${word})
      ON CONFLICT (player_id, word) DO NOTHING
    `;
  }
}

export async function removePlayerWord(playerId: number, wordId: number): Promise<boolean> {
  const result = await sql`
    DELETE FROM player_words WHERE id = ${wordId} AND player_id = ${playerId} RETURNING id
  `;
  return result.length > 0;
}

// --- Prompt functions ---

export async function getCluePrompts(clueId: number, playerId: number): Promise<PromptWithCompletion[]> {
  const rows = await sql`
    SELECT p.*, (ppc.id IS NOT NULL) AS completed
    FROM prompts p
    LEFT JOIN player_prompt_completions ppc
      ON ppc.prompt_id = p.id AND ppc.player_id = ${playerId}
    WHERE p.clue_id = ${clueId}
    ORDER BY p.sort_order, p.created_at
  `;
  return rows.map((r: Prompt & { completed: unknown }) => ({ ...r, completed: Boolean(r.completed) }));
}

export async function getAllPrompts(): Promise<Prompt[]> {
  return await sql`SELECT * FROM prompts ORDER BY clue_id, sort_order, created_at`;
}

export async function getPromptById(id: number): Promise<Prompt | null> {
  const rows = await sql`SELECT * FROM prompts WHERE id = ${id}`;
  return rows[0] ?? null;
}

export async function createPrompt(data: {
  clue_id: number;
  question: string;
  template: string;
  answer: string[];
  grants_flags?: string[] | null;
  grants_words?: string[] | null;
  success_text?: string | null;
  sort_order?: number;
}): Promise<Prompt> {
  const [prompt] = await sql`
    INSERT INTO prompts (clue_id, question, template, answer, grants_flags, grants_words, success_text, sort_order)
    VALUES (
      ${data.clue_id},
      ${data.question},
      ${data.template},
      ${pgTextArray(data.answer)},
      ${pgTextArray(data.grants_flags)},
      ${pgTextArray(data.grants_words)},
      ${data.success_text ?? null},
      ${data.sort_order ?? 0}
    )
    RETURNING *
  `;
  return prompt;
}

export async function updatePrompt(
  id: number,
  data: {
    clue_id: number;
    question: string;
    template: string;
    answer: string[];
    grants_flags?: string[] | null;
    grants_words?: string[] | null;
    success_text?: string | null;
    sort_order?: number;
  }
): Promise<Prompt | null> {
  const [prompt] = await sql`
    UPDATE prompts SET
      clue_id = ${data.clue_id},
      question = ${data.question},
      template = ${data.template},
      answer = ${pgTextArray(data.answer)},
      grants_flags = ${pgTextArray(data.grants_flags)},
      grants_words = ${pgTextArray(data.grants_words)},
      success_text = ${data.success_text ?? null},
      sort_order = ${data.sort_order ?? 0}
    WHERE id = ${id}
    RETURNING *
  `;
  return prompt ?? null;
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
): Promise<{ ok: boolean; error?: string }> {
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

  // Swap words
  await sql`DELETE FROM player_words WHERE player_id = ${trade.initiator_id} AND word = ${trade.initiator_word}`;
  await sql`DELETE FROM player_words WHERE player_id = ${trade.recipient_id} AND word = ${trade.recipient_word}`;
  await sql`INSERT INTO player_words (player_id, word) VALUES (${trade.recipient_id}, ${trade.initiator_word}) ON CONFLICT DO NOTHING`;
  await sql`INSERT INTO player_words (player_id, word) VALUES (${trade.initiator_id}, ${trade.recipient_word}) ON CONFLICT DO NOTHING`;
  await sql`UPDATE trades SET status = 'accepted' WHERE id = ${tradeId}`;

  return { ok: true };
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
): Promise<{ correct: boolean; grants_flags?: string[]; grants_words?: string[]; success_text?: string }> {
  const prompt = await getPromptById(promptId);
  if (!prompt) return { correct: false };

  const normalize = (s: string) => s.trim().toUpperCase();
  const correct =
    prompt.answer.length === words.length &&
    prompt.answer.every((a, i) => normalize(a) === normalize(words[i] ?? ""));

  if (!correct) return { correct: false };

  await sql`
    INSERT INTO player_prompt_completions (player_id, prompt_id)
    VALUES (${playerId}, ${promptId})
    ON CONFLICT (player_id, prompt_id) DO NOTHING
  `;

  if (prompt.grants_flags && prompt.grants_flags.length > 0) {
    await grantPlayerFlags(playerId, prompt.grants_flags);
  }
  if (prompt.grants_words && prompt.grants_words.length > 0) {
    await grantPlayerWords(playerId, prompt.grants_words);
  }

  return {
    correct: true,
    grants_flags: prompt.grants_flags ?? undefined,
    grants_words: prompt.grants_words ?? undefined,
    success_text: prompt.success_text ?? undefined,
  };
}
