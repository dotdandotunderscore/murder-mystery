/**
 * Seeds the dirt pool from data/dirt-pool.txt and sets grants_dirt on mobster pages/prompts.
 * Run with: bun scripts/seed-dirt.ts
 */
import { sql } from "bun";
import { initializeDatabase, seedDirtPool } from "../db/index";
import { readFileSync } from "fs";
import { join } from "path";

await initializeDatabase();

// ═══════════════════════════════════════
// 1. Parse dirt-pool.txt and seed
// ═══════════════════════════════════════

const raw = readFileSync(join(import.meta.dir, "../data/dirt-pool.txt"), "utf-8");
const lines = raw.split("\n");
const entries: { rumour: string; flavour: string }[] = [];

let i = 0;
while (i < lines.length) {
  const line = lines[i]!.trim();
  // Skip blank lines and comments
  if (!line || line.startsWith("#")) { i++; continue; }
  // This line is the rumour, next line is the flavour
  const rumour = line;
  const flavour = (lines[i + 1] ?? "").trim();
  entries.push({ rumour, flavour });
  i += 2;
}

await seedDirtPool(entries);
console.log(`Seeded ${entries.length} rumours into dirt_pool`);

// ═══════════════════════════════════════
// 2. Set grants_dirt on mobster pages
// ═══════════════════════════════════════

// Page grants (dirt on page unlock)
const pageUpdates = [
  { id: 117, dirt: 1 }, // the big time (casino entry)
  { id: 118, dirt: 2 }, // the executor (first meeting)
  { id: 119, dirt: 1 }, // the tables (intro)
];

for (const { id, dirt } of pageUpdates) {
  await sql`UPDATE pages SET grants_dirt = ${dirt} WHERE id = ${id}`;
  console.log(`Set grants_dirt=${dirt} on page ${id}`);
}

// Mini-game pages (dirt on claim)
const gamePages = [
  { id: 120, dirt: 1 }, // high stakes (coin flip)
  { id: 123, dirt: 1 }, // lucky sevens (slot machine)
];

for (const { id, dirt } of gamePages) {
  await sql`UPDATE pages SET grants_dirt = ${dirt} WHERE id = ${id}`;
  console.log(`Set grants_dirt=${dirt} on game page ${id} (granted on claim)`);
}

// Prompt grants (dirt on correct answer)
const hiringPrompts = await sql`SELECT id FROM prompts WHERE page_id = 81 ORDER BY id DESC LIMIT 1`;
const hiddenWillPrompts = await sql`SELECT id FROM prompts WHERE page_id = 125 ORDER BY id DESC LIMIT 1`;
const spiritsPrompts = await sql`SELECT id FROM prompts WHERE page_id = 126 ORDER BY id DESC LIMIT 1`;

const promptUpdates = [
  { id: hiringPrompts[0]?.id, dirt: 1, label: "hiring (page 81)" },
  { id: hiddenWillPrompts[0]?.id, dirt: 1, label: "the hidden will (page 125)" },
  { id: spiritsPrompts[0]?.id, dirt: 1, label: "consult the spirits (page 126)" },
];

for (const { id, dirt, label } of promptUpdates) {
  if (id) {
    await sql`UPDATE prompts SET grants_dirt = ${dirt} WHERE id = ${id}`;
    console.log(`Set grants_dirt=${dirt} on prompt ${id} (${label})`);
  } else {
    console.log(`WARNING: No prompt found for ${label}`);
  }
}

// ═══════════════════════════════════════
// 3. Change "the board" to leaderboard type
// ═══════════════════════════════════════

await sql`UPDATE pages SET page_type = 'leaderboard' WHERE id = 130`;
console.log("Changed page 130 (the board) to page_type='leaderboard'");

console.log("\nDone!");
process.exit(0);
