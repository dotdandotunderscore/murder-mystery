import { sql } from "bun";

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
  sort_order: number;
  created_at: Date;
}

export interface PlayerFlag {
  id: number;
  player_id: number;
  flag: string;
  granted_at: Date;
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
  sort_order?: number;
}): Promise<Clue> {
  const [clue] = await sql`
    INSERT INTO clues (
      code_phrase, title, content, page_type,
      visible_to_teams, visible_to_players,
      required_flags, grants_flags, sort_order
    )
    VALUES (
      ${data.code_phrase},
      ${data.title},
      ${data.content ?? ""},
      ${data.page_type ?? "text"},
      ${data.visible_to_teams ?? null},
      ${data.visible_to_players ?? null},
      ${data.required_flags ?? null},
      ${data.grants_flags ?? null},
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
    sort_order?: number;
  }
): Promise<Clue | null> {
  const [clue] = await sql`
    UPDATE clues SET
      code_phrase = ${data.code_phrase},
      title = ${data.title},
      content = ${data.content ?? ""},
      page_type = ${data.page_type ?? "text"},
      visible_to_teams = ${data.visible_to_teams ?? null},
      visible_to_players = ${data.visible_to_players ?? null},
      required_flags = ${data.required_flags ?? null},
      grants_flags = ${data.grants_flags ?? null},
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

export async function getAllProgress(): Promise<Array<{ player: Omit<Player, "pin">; flags: string[] }>> {
  const players = await getAllPlayers();
  const result = [];
  for (const player of players) {
    const flags = await getPlayerFlags(player.id);
    const { pin, ...safePlayer } = player;
    result.push({ player: safePlayer, flags });
  }
  return result;
}
