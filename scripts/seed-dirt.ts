/**
 * Seeds the dirt pool and sets grants_dirt on mobster pages/prompts.
 * Run with: bun scripts/seed-dirt.ts
 */
import { sql } from "bun";
import { initializeDatabase, seedDirtPool } from "../db/index";

await initializeDatabase();

// ═══════════════════════════════════════
// 1. Seed the dirt pool (40+ rumours)
// ═══════════════════════════════════════

const rumours = [
  "SKIMMING OFF THE TOP",
  "RATTED TO THE FEDS",
  "FRISKY WITH THE DON'S WIFE",
  "WATERED DOWN THE WHISKEY",
  "POCKETED THE COLLECTION",
  "DOUBLE-BOOKED THE FIGHTS",
  "SOLD OUT A FAMILY MAN",
  "COOKING THE BOOKS",
  "TALKING TO THE COPS",
  "RUNNING A SIDE GAME",
  "RIGGED THE CARD TABLE",
  "SHORT-CHANGED THE FAMILY",
  "BORROWED FROM THE KITTY",
  "FAKED THE RECEIPTS",
  "SNITCHED TO THE PAPERS",
  "SKIPPED THE FUNERAL",
  "STIFFED THE BARKEEP",
  "TIPPED OFF A RIVAL",
  "LOST THE SHIPMENT",
  "POCKETED THE TIPS",
  "CHEATED AT POKER",
  "LIED ABOUT THE NUMBERS",
  "KEPT A SECOND SET OF BOOKS",
  "MISSED THE DROP",
  "FORGOT THE PASSWORD",
  "SOLD FAKE CIGARS",
  "WATERED DOWN THE GIN",
  "BRIBED THE WRONG COP",
  "OWES MONEY TO EVERYONE",
  "WORE A WIRE",
  "DUCKED OUT OF A FIGHT",
  "SQUEALED UNDER PRESSURE",
  "SKIMMED THE DOOR TAKE",
  "SHORTED THE BOOKIE",
  "PLAYED BOTH SIDES",
  "PAWNED THE SILVER",
  "DRANK THE STOCK",
  "LOST AT THEIR OWN GAME",
  "BACKED THE WRONG HORSE",
  "CLIPPED THE WRONG GUY",
  "LET ONE WALK",
  "POCKETED THE HOUSE CUT",
  "TALKED IN THEIR SLEEP",
];

await seedDirtPool(rumours);
console.log(`Seeded ${rumours.length} rumours into dirt_pool`);

// ═══════════════════════════════════════
// 2. Set grants_dirt on mobster pages
// ═══════════════════════════════════════

// Page grants (dirt on page unlock)
const pageUpdates = [
  { id: 117, dirt: 1 }, // the big time (casino entry)
  { id: 118, dirt: 2 }, // the executor (first meeting)
  { id: 119, dirt: 1 }, // the tables (intro)
  { id: 121, dirt: 1 }, // the house edge (physical follow-up)
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
// Find prompt IDs for the mission debrief prompts
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
