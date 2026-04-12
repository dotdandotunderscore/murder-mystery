/**
 * Seeds all Mobster pages and prompts into the database.
 * Run with: bun scripts/seed-mobster.ts
 *
 * Creates:
 *  - 3 folders (Part 1, Part 2, Part 3) under Mobster Pages (id=5)
 *  - Updates existing pages 46, 81
 *  - All new pages and prompts for Parts 1-3
 *  - Helper pages for cross-faction missions
 */
import { sql } from "bun";
import {
  createPage,
  createPrompt,
  createFolder,
  initializeDatabase,
} from "../db/index";

await initializeDatabase();

// ═══════════════════════════════════════
// Folders
// ═══════════════════════════════════════

const MOBSTER_PARENT = 5; // Mobster Pages folder

const f1 = await createFolder("Part 1 - The Setup", MOBSTER_PARENT);
const f2 = await createFolder("Part 2 - The Don's Test", MOBSTER_PARENT);
const f3 = await createFolder("Part 3 - The Claim", MOBSTER_PARENT);
console.log(`Folders: Part1=${f1.id}, Part2=${f2.id}, Part3=${f3.id}`);

// ═══════════════════════════════════════
// Part 1: Move existing pages into folder
// ═══════════════════════════════════════

// Move pages 43, 44, 45, 59 into Part 1 folder (content unchanged)
for (const id of [43, 44, 45, 59]) {
  await sql`UPDATE pages SET folder_id = ${f1.id} WHERE id = ${id}`;
}
console.log("Moved pages 43, 44, 45, 59 → Part 1 folder");

// Update page 46 (move on) - add [[the big time]] link + move to folder
await sql`UPDATE pages SET
  content = ${`You hear The Broken Drum before you see it. Low, like a pulse. Music bleeding through the walls, something with brass in it, something good. Then the sign swings into view and you gotta admit, even on a night like this, the place has got style. The whole front is lit up clean and bright, the kind of place that wants to be seen. Polished brass on the doors. A canopy keeping the sidewalk dry. The light spilling out ain't just gold, it's warm. The kind that promises a good pour and a soft chair and the sound of money moving around a room the way it's supposed to.

The way the Kay family like it.

Then the first real drop of rain hits the brim of your hat.

Alright. [[The big time]].`},
  folder_id = ${f1.id}
WHERE id = 46`;
console.log("Updated page 46 (move on) - added link + moved to folder");

// ═══════════════════════════════════════
// Part 1: New pages
// ═══════════════════════════════════════

let sort1 = 10; // start above existing pages

const theBigTime = await createPage({
  code_phrase: "the big time",
  title: "You own this place",
  content: `Some mook at the door presses your thumb to a coin. You feel something shift, like a pickpocket working from the inside out. Your name appears on the metal.

"House rules," the mook says. "Standard procedure."

You look at him the way you look at people who explain things you already know. He finds somewhere else to be.

The Broken Drum. You grew up on the stories. Don Kay built this joint from a hole in the ground, turned it into the jewel of the strip, ran every racket worth running out of the back rooms while the champagne kept the front of house too happy to notice. And now the old man's cold and every two-bit wiseguy with a pulse thinks it's their turn.

Not if you got something to say about it.

Somewhere in this crowd of silk suits and cheap perfume, there's a man holding the keys to the kingdom. The Executor. Don Kay's lawyer and oldest pal. Word is he's running the old man's little succession game.

He'll be the one who looks like he's been to more funerals than weddings. Ask around for [[the executor]].`,
  page_type: "text",
  visible_to_roles: ["mobster"],
  required_flags: ["off to don's"],
  grants_flags: ["in the broken drum"],
  // DIRT: 1 random dirt clue should be granted here once mechanic is built
  sort_order: sort1++,
  folder_id: f1.id,
});
console.log(`Created: ${theBigTime.title} (id=${theBigTime.id})`);

const theExecutor = await createPage({
  code_phrase: "the executor",
  title: "Terms of the will",
  content: `You find him at a corner table, nursing a drink he ain't touched. Grey suit. Grey hair. Grey eyes that got no quit in them. This is the man Don Kay trusted with everything. The money. The secrets. The will.

He don't stand when you approach. Don't need to.

"*Sit down.*"

You sit. You don't usually sit when you're told. But this man buried your boss, and the ink on the will ain't dry.

"*The Don didn't name a successor. You knew that already. What you don't know is why.*"

He folds his hands. Slow. Like he's got all night and you don't.

"*He left a test. Prove you understand how this place works. The tables, the machines, the people, the business. Top to bottom. Prove it, and the seat's yours.*"

He lets that hang. Then leans forward.

"*One more thing. In this family, reputation is everything. Whatever you hear about the competition, and you will hear things, use it. The cleanest pair of hands gets the crown.*"

He slides a card across the table. Four words on the back.

[[The tables]]. [[The machines]]. [[The floor]]. [[The board]].

"*Oh, and keep an eye on a man called the Viper. Vincent Vane. He's been running operations in this casino that the Don turned a blind eye to. Whether that eye stays blind is up to the next boss.*"

He picks up his drink. The meeting's over.`,
  page_type: "text",
  visible_to_roles: ["mobster"],
  required_flags: ["in the broken drum"],
  grants_flags: ["met the executor"],
  grants_words: ["THE VIPER"],
  // DIRT: 2 random dirt clues should be granted here once mechanic is built
  sort_order: sort1++,
  folder_id: f1.id,
});
console.log(`Created: ${theExecutor.title} (id=${theExecutor.id})`);

// ═══════════════════════════════════════
// Part 2: Pillar 1 - The Tables
// ═══════════════════════════════════════

let sort2 = 0;

const theTables = await createPage({
  code_phrase: "the tables",
  title: "Read the room",
  content: `The Don always said you can tell everything about a person by how they handle a losing hand. Do they sweat? Do they bluff? Do they flip the table and reach for a piece?

Or do they smile, order another round, and take the next pot?

The tables are where this casino makes its bread. Cards, coins, the whole song and dance. The Don ran this floor like a general runs a war. Every dealer, every shuffle, every odd tilted just enough to keep the house fat and the customers happy.

You want the big chair? Show me you got the nerve for it.

Time to play some [[high stakes]].`,
  page_type: "text",
  visible_to_roles: ["mobster"],
  required_flags: ["met the executor"],
  // DIRT: 1 random dirt clue once mechanic is built
  sort_order: sort2++,
  folder_id: f2.id,
});
console.log(`Created: ${theTables.title} (id=${theTables.id})`);

const highStakes = await createPage({
  code_phrase: "high stakes",
  title: "High stakes",
  content: `The coin hits the table. Heads or tails. Simple game. Oldest game there is.

Don't let that fool you. The Don used to say that anyone who calls a coin flip "luck" don't understand probability, nerve, or the fine art of knowing when the universe owes you one.

Three in a row. That's what it takes. That's what the Don would've done.`,
  page_type: "coin_flip",
  game_config: { target: 3 },
  visible_to_roles: ["mobster"],
  required_flags: ["met the executor"],
  grants_flags: ["proved your nerve"],
  grants_words: ["SPECIAL CHIP"],
  // DIRT: 1 random dirt clue once mechanic is built (granted on claim)
  sort_order: sort2++,
  folder_id: f2.id,
});
console.log(`Created: ${highStakes.title} (id=${highStakes.id})`);

const houseEdge = await createPage({
  code_phrase: "the house edge",
  title: "The house always wins",
  content: `There it is. Right where the chip said it'd be. And scratched into the surface, small enough that you'd miss it unless you were looking, a message from the old man himself.

A torn scrap of the will. Not the whole thing. Not even close. But enough to know there's more hidden where this came from.

The Don was a careful man. Hid pieces of his legacy all over this joint like a squirrel with trust issues. This fragment's a start, but you're gonna need help reading the rest. Someone with the right tools. The right light.

Hold onto this. You'll know who to give it to when the time comes.`,
  page_type: "text",
  visible_to_roles: ["mobster"],
  required_flags: ["proved your nerve"],
  required_flags_hints: ["You haven't earned this yet."],
  grants_flags: ["read the chip"],
  grants_words: ["WILL FRAGMENT"],
  removes_words: ["SPECIAL CHIP"],
  // DIRT: 1 random dirt clue once mechanic is built
  sort_order: sort2++,
  folder_id: f2.id,
});
console.log(`Created: ${houseEdge.title} (id=${houseEdge.id})`);

// ═══════════════════════════════════════
// Part 2: Pillar 2 - The Machines
// ═══════════════════════════════════════

const theMachines = await createPage({
  code_phrase: "the machines",
  title: "Understand the machine",
  content: `Every slot machine in this joint is a little money printer. Put a dollar in, the house keeps sixty cents, gives back forty, and the sucker thinks he had a good time.

The Don understood that. Built half his empire on it. A man who can't see how the machine works got no business owning the machine.

Time to pull the lever and see what comes up. Try your luck at [[lucky sevens]].`,
  page_type: "text",
  visible_to_roles: ["mobster"],
  required_flags: ["met the executor"],
  sort_order: sort2++,
  folder_id: f2.id,
});
console.log(`Created: ${theMachines.title} (id=${theMachines.id})`);

const luckySevens = await createPage({
  code_phrase: "lucky sevens",
  title: "Lucky sevens",
  content: `Three reels. One lever. The Don's favourite machine, kept behind the floor for VIPs only. They say it ain't been hit in years.

They say a lot of things.`,
  page_type: "slot_machine",
  game_config: { jackpot_chance: 20 },
  visible_to_roles: ["mobster"],
  required_flags: ["met the executor"],
  grants_flags: ["beat the house"],
  grants_words: ["OFFERING"],
  // DIRT: 1 random dirt clue once mechanic is built (granted on claim)
  sort_order: sort2++,
  folder_id: f2.id,
});
console.log(`Created: ${luckySevens.title} (id=${luckySevens.id})`);

// ═══════════════════════════════════════
// Part 2: Pillar 3 - The Floor
// ═══════════════════════════════════════

const theFloor = await createPage({
  code_phrase: "the floor",
  title: "Delegation",
  content: `The Don used to say: a boss who does his own dirty work ain't a boss. He's a janitor with a nicer suit.

Three jobs need doing. Three jobs you ain't gonna handle yourself. That's what the other people in this casino are for. Find the right hands, grease the right palms, get the goods delivered.

You need a [[thief|hiring]] to crack a lock. You need a [[snooper|the hidden will]] to read between the lines. And you need somebody who talks to [[the other side|consult the spirits]].

Get it done. Don't get your hands dirty.`,
  page_type: "text",
  visible_to_roles: ["mobster"],
  required_flags: ["met the executor"],
  sort_order: sort2++,
  folder_id: f2.id,
});
console.log(`Created: ${theFloor.title} (id=${theFloor.id})`);

// Update page 81 (hiring) - rewrite content, add required_flags, move to folder
const hiringContent = `One of your boys put you in touch with somebody. Says they're the best in the biz, even did a couple jobs for the old man back in the day. Can break into anywhere and steal anything, for a price. Smart enough not to cross you, neither. A reputation like yours ain't easy to build.

Here's the play. The Don's will got stashed in the Filing Office right here in the casino. Locked up tight. You need what's in there, but when that will turns up missing, all hell's gonna break loose. Ain't no chance you're getting caught near that mess with the whole family watching.

Find a thief. Trade them the key. Let them do what they do. Then collect the goods.`;
const hiringSort = sort2++;
await sql`UPDATE pages SET
  content = ${hiringContent},
  required_flags = ARRAY['met the executor']::text[],
  required_flags_hints = ARRAY['You don''t know what you''re looking for yet.']::text[],
  folder_id = ${f2.id},
  sort_order = ${hiringSort}
WHERE id = 81`;
console.log("Updated page 81 (hiring) - new content, flags, folder");

// Add prompt to page 81
await createPrompt({
  page_id: 81,
  question: "Deliver the goods to the Executor",
  template: "The thief did their part. Show the Executor the _____",
  answer: ["DON'S SEAL"],
  grants_flags: ["got the seal"],
  // DIRT: 1 random dirt clue once mechanic is built
  success_text: `A wax seal with the Don's mark. The real deal. This is what makes the succession legitimate. The Executor gives you a nod. One job down.`,
  wrong_answer_hints: {
    "FILING OFFICE KEY": "That's what you gave them. What did they bring back?",
  },
  generic_wrong_text:
    "The thief went into that office for you. What did they come back with?",
});
console.log("  Created prompt for page 81 (hiring)");

// Mission B: The Hidden Will
const hiddenWill = await createPage({
  code_phrase: "the hidden will",
  title: "The other half",
  content: `You got a fragment of the will from the chip, but you know there's more. The Executor told you the Don left the real message hidden. Invisible ink on the back of the original document, right there in the casino for anyone to see. If they got the right light.

You ain't got the right light. But you know who does. Those investigator types been walking around with some kind of fancy torch, shining it on everything that sits still. One of them reads that will for you, they'll see what you can't.

Trade them the fragment. They'll know what to do with it. And when they bring back what it says, you make it worth their while. You got a name they need. A name that solves their little murder case. The Viper.`,
  page_type: "text",
  visible_to_roles: ["mobster"],
  required_flags: ["met the executor"],
  required_flags_hints: ["You don't know what you're looking for yet."],
  sort_order: sort2++,
  folder_id: f2.id,
});
console.log(`Created: ${hiddenWill.title} (id=${hiddenWill.id})`);

await createPrompt({
  page_id: hiddenWill.id,
  question: "Receive the investigator's findings",
  template: "The investigator brought back the Don's message: _____",
  answer: ["DON'S FINAL WORD"],
  grants_flags: ["read the will"],
  // DIRT: 1 random dirt clue once mechanic is built
  success_text: `The Don's final word. What he truly wanted for this family, written where only the right light could find it. The Executor reads it once, folds it, nods. Two down.`,
  wrong_answer_hints: {
    "WILL FRAGMENT":
      "That's what you gave them. What did they find written in the invisible ink?",
    "THE VIPER": "That's your payment to them, not what they owe you.",
  },
  generic_wrong_text:
    "An investigator with a UV light can read the back of the will. Give them the fragment, they give you what it says.",
});
console.log(`  Created prompt for: ${hiddenWill.title}`);

// Mission C: Consult the Spirits
const spirits = await createPage({
  code_phrase: "consult the spirits",
  title: "Old friends on the other side",
  content: `The Don had advisors nobody talked about. Not the lawyers, not the accountants, not the muscle. Something else. Something that burned candles and spoke in tongues and told the old man things no living person shoulda known.

You don't believe in that stuff. You also don't disbelieve in it, because the Don made a lot of very good calls for a man who shoulda been dead six times over.

There's people in this casino who deal in that world. Strange folks. The kind who look at you like they can see your skeleton. One of them can tap into whatever the Don left behind on the other side.

Give them something to work with. That old token from the machine, it's got their kind of stink on it. See what they bring back.`,
  page_type: "text",
  visible_to_roles: ["mobster"],
  required_flags: ["met the executor"],
  required_flags_hints: ["You don't know what you're looking for yet."],
  sort_order: sort2++,
  folder_id: f2.id,
});
console.log(`Created: ${spirits.title} (id=${spirits.id})`);

await createPrompt({
  page_id: spirits.id,
  question: "Receive the occultist's findings",
  template: "The spirits have spoken through the occultist: _____",
  answer: ["DON'S BLESSING"],
  grants_flags: ["got the blessing"],
  // DIRT: 1 random dirt clue once mechanic is built
  success_text: `Something from beyond the veil. You don't understand it and you don't want to. But the Executor takes one look and his face changes. Whatever this is, it's real. Three for three.`,
  wrong_answer_hints: {
    OFFERING:
      "That's what you gave them. What did they bring back from the other side?",
  },
  generic_wrong_text:
    "Find an occultist. Trade them the offering. Let them do their ritual. They'll bring something back.",
});
console.log(`  Created prompt for: ${spirits.title}`);

// ═══════════════════════════════════════
// Part 2: Helper pages (cross-faction)
// ═══════════════════════════════════════

// Helper: Filing Office (thief)
const filingOffice = await createPage({
  code_phrase: "filing office",
  title: "The Filing Office",
  content: `Locked. Naturally. But the key fits clean and the door swings open like it's been waiting.

Inside: filing cabinets, dust, and the stale air of a room nobody visits on purpose. You find what you're looking for in the third drawer. A document with a heavy wax seal. The Don's personal mark, pressed into crimson.

You don't know what it means. You don't need to. The job is the job. Grab it and get back to your employer.`,
  page_type: "scan_target",
  visible_to_roles: ["thief"],
  required_flags: ["found the crystal eye"],
  required_flags_hints: ["You can't get in here without the right tools."],
  sort_order: sort2++,
  folder_id: f2.id,
});
console.log(
  `Created helper: ${filingOffice.title} (id=${filingOffice.id}, scan_code=${filingOffice.scan_code})`
);

await createPrompt({
  page_id: filingOffice.id,
  question: "Open the filing cabinet",
  template: "I use the _____ to open the filing cabinet",
  answer: ["FILING OFFICE KEY"],
  removes_words: ["FILING OFFICE KEY"],
  grants_words: ["DON'S SEAL"],
  success_text: `The seal breaks free of the drawer. Heavy paper, old wax, and the smell of cigar smoke baked into the fibres. Whatever this is, it matters to somebody. Take it back.`,
  generic_wrong_text: "You need a key. Someone must have given you one.",
});
console.log(`  Created prompt for: ${filingOffice.title}`);

// Helper: The Don's Last Wish (investigator)
const donsLastWish = await createPage({
  code_phrase: "dons last wish",
  title: "The Don's last wish",
  content: `The Pale Flame catches something on the back of this old document. Not just a watermark. Words. Sentences. A whole message, hidden in ink that only this light can show.

It's a letter. From someone called Don Kay. Written to whoever proved sharp enough to find it.

The handwriting is shaky but deliberate. A dying man's last instructions, meant for eyes that earned the right to read them.

Someone out there needs to hear what this says.`,
  page_type: "text",
  visible_to_roles: ["investigator"],
  required_flags: ["the pale flame"],
  required_flags_hints: ["You need a way to see what's hidden."],
  sort_order: sort2++,
  folder_id: f2.id,
});
console.log(`Created helper: ${donsLastWish.title} (id=${donsLastWish.id})`);

await createPrompt({
  page_id: donsLastWish.id,
  question: "Read the hidden message",
  template: "I examine the document with the _____",
  answer: ["WILL FRAGMENT"],
  removes_words: ["WILL FRAGMENT"],
  grants_words: ["DON'S FINAL WORD"],
  success_text: `The fragment completes the picture. The Don's final word, his true wishes for the family, laid bare in invisible ink. This means nothing to you, but it'll mean everything to whoever sent you here. Take it back.`,
  generic_wrong_text:
    "You need the matching fragment to make sense of what's written here.",
});
console.log(`  Created prompt for: ${donsLastWish.title}`);

// Helper: Occultist AR page (placeholder)
const occultistHelper = await createPage({
  code_phrase: "the dons spirit",
  title: "A voice from beyond",
  content: `[PLACEHOLDER - Content TBD, coordinate with occultist faction designer]

This page will use the AR camera mechanic. The occultist points their camera at a physical image target to receive a message from Don Kay's spiritual legacy.`,
  page_type: "text", // Should be "ar" once target file is created
  visible_to_roles: ["occultist"],
  // required_flags TBD - needs occultist's AR mechanic flag
  sort_order: sort2++,
  folder_id: f2.id,
});
console.log(
  `Created helper (placeholder): ${occultistHelper.title} (id=${occultistHelper.id})`
);

await createPrompt({
  page_id: occultistHelper.id,
  question: "Channel the spirits",
  template: "I channel the spirits with the _____",
  answer: ["OFFERING"],
  removes_words: ["OFFERING"],
  grants_words: ["DON'S BLESSING"],
  success_text: `The offering is consumed. Something answers. You don't understand the words, but you understand the weight. Take this back to whoever asked for it.`,
  generic_wrong_text:
    "You need something to offer. Someone must have given you a token.",
});
console.log(`  Created prompt for: ${occultistHelper.title}`);

// ═══════════════════════════════════════
// Part 2: Pillar 4 - The Board
// ═══════════════════════════════════════

const theBoard = await createPage({
  code_phrase: "the board",
  title: "Family standings",
  content: `In this family, reputation is the only currency that don't depreciate.

[PLACEHOLDER - This page needs the leaderboard page type. Once the dirt mechanic is implemented, change page_type to "leaderboard" and this will dynamically show all mobster players ranked by dirt count.]`,
  page_type: "text", // Should be "leaderboard" once the new page type is built
  visible_to_roles: ["mobster"],
  required_flags: ["met the executor"],
  sort_order: sort2++,
  folder_id: f2.id,
});
console.log(`Created (placeholder): ${theBoard.title} (id=${theBoard.id})`);

// ═══════════════════════════════════════
// Part 3: The Claim
// ═══════════════════════════════════════

const theClaim = await createPage({
  code_phrase: "the claim",
  title: "The big chair",
  content: `You done it. The tables, the machines, the people, the dirt. All of it. You walked into this casino tonight as one of six hopefuls and you're about to walk out as the only one that matters.

The Executor is waiting where you left him. Same corner table. Same untouched drink. But something's different. The way he looks at you. Like you're not wasting his time anymore.

"*You got something to show me?*"

Yeah. You got something to show him.

Three things the Don scattered across this place like breadcrumbs for the worthy. The seal that makes it legal. The words that make it true. And the blessing that makes it forever.

Time to lay them on the table and take what's yours.`,
  page_type: "text",
  visible_to_roles: ["mobster"],
  required_flags: [
    "proved your nerve",
    "beat the house",
    "got the seal",
    "read the will",
    "got the blessing",
  ],
  required_flags_hints: [
    "You ain't proved yourself at the tables yet.",
    "You ain't figured out the machines yet.",
    "You still need the Don's seal.",
    "You still need the Don's final word.",
    "You still need the Don's blessing.",
  ],
  sort_order: 0,
  folder_id: f3.id,
});
console.log(`Created: ${theClaim.title} (id=${theClaim.id})`);

await createPrompt({
  page_id: theClaim.id,
  question: "Claim the succession",
  template:
    "The Don's _____ makes the succession legitimate. His _____ reveals what he truly wanted. And his _____ proves the powers that be approve.",
  answer: ["DON'S SEAL", "DON'S FINAL WORD", "DON'S BLESSING"],
  grants_flags: ["the new don"],
  removes_words: ["DON'S SEAL", "DON'S FINAL WORD", "DON'S BLESSING"],
  success_text: `The Executor takes each one. Holds it. Studies it. Sets it down.

The seal. The word. The blessing. Three pieces of a puzzle the Don spent his last days building, and you're the one who put it together.

He says nothing for a long time. Then he finishes his drink. First sip all night.

"*The Don would've picked you. I think he did pick you, in his way. The test wasn't about the answers. It was about how you got them. You didn't do the work yourself. You found the right people, put them in the right places, and got it done. That's what a boss does.*"

He stands. First time tonight.

"*There is the matter of the Viper. Vincent Vane. He's been running his own game inside this casino. Killed a man without the family's say-so. That kind of freelancing don't fly under new management. I trust you'll handle it.*"

He extends a hand. You shake it.

The Broken Drum is yours.

Check [[the board]] one last time. See how the family shook out.`,
  wrong_answer_hints: {
    "FILING OFFICE KEY":
      "That's what you gave the thief. What did they bring back?",
    "WILL FRAGMENT":
      "That's what you gave the investigator. What did they find?",
    OFFERING:
      "That's what you gave the occultist. What did they bring back?",
    "THE VIPER":
      "The Viper's a problem, not a solution. You traded that name already.",
    "SPECIAL CHIP": "The chip led you somewhere. What did you find there?",
    CIGAR: "Save it for the victory smoke.",
    "SWITCH BLADE": "Nobody's getting stabbed tonight. Probably.",
  },
  generic_wrong_text:
    "Three things. One from the filing office job. One from the hidden will. One from the spirits. You know what they are.",
});
console.log(`  Created prompt for: ${theClaim.title}`);

// ═══════════════════════════════════════
// Summary
// ═══════════════════════════════════════

console.log("\n========================================");
console.log("SEED COMPLETE");
console.log("========================================\n");

console.log("PAGES CREATED/UPDATED:");
console.log("  Part 1: 2 new (the big time, the executor) + 5 existing moved to folder + page 46 updated");
console.log("  Part 2: 12 new + page 81 updated with prompt");
console.log("  Part 3: 1 new (the claim)");
console.log(`\n  Filing Office scan_code: ${filingOffice.scan_code}`);
console.log("  ^ Print this as a QR code for the filing office prop\n");

console.log("========================================");
console.log("TODO - NEEDS MANUAL/PHYSICAL SETUP:");
console.log("========================================\n");

console.log("PHYSICAL PROPS:");
console.log("  [ ] Will document - print a physical will prop, write 'dons last wish' in UV ink on the back");
console.log("  [ ] Special Chip landmark - decide what venue feature the chip depicts");
console.log("      Then write 'the house edge' near/under that physical landmark");
console.log(`  [ ] Filing Office QR - print QR code for scan_code: ${filingOffice.scan_code}`);
console.log("      Place on a cabinet/door in a staff area");
console.log("  [ ] Occultist AR target - design + print image, compile .mind file, update page to type 'ar'");
console.log("");

console.log("CODE CHANGES NEEDED:");
console.log("  [ ] Dirt mechanic - is_dirt column, send-dirt endpoint, immediate-send UI, rumours section");
console.log("      Once built, add dirt grants to these pages:");
console.log(`      - the big time (id=${theBigTime.id}): 1 dirt`);
console.log(`      - the executor (id=${theExecutor.id}): 2 dirt`);
console.log(`      - the tables (id=${theTables.id}): 1 dirt`);
console.log(`      - high stakes (id=${highStakes.id}): 1 dirt (on claim)`);
console.log(`      - the house edge (id=${houseEdge.id}): 1 dirt`);
console.log(`      - lucky sevens (id=${luckySevens.id}): 1 dirt (on claim)`);
console.log("      - hiring prompt (page 81): 1 dirt");
console.log(`      - the hidden will prompt (id=${hiddenWill.id}): 1 dirt`);
console.log(`      - consult the spirits prompt (id=${spirits.id}): 1 dirt`);
console.log(`  [ ] Leaderboard page type - then change the board (id=${theBoard.id}) to page_type 'leaderboard'`);
console.log("");

console.log("COORDINATE WITH OCCULTIST DESIGNER:");
console.log(`  [ ] Occultist helper page (id=${occultistHelper.id}) - needs:`);
console.log("      - Real content (replace placeholder)");
console.log("      - page_type changed to 'ar'");
console.log("      - AR target .mind file created and configured in game_config");
console.log("      - required_flags set to occultist's AR mechanic flag");
console.log("      - Decide what mobster pays occultist for the trade");
console.log("  [ ] 'business in the dark' (page 59) requires NOTES ON A PROPHETIC DREAM");
console.log("      - Confirm occultist path still grants this clue early enough");
console.log("      - Decide what mobster offers occultist in return");
console.log("");

console.log("PAGE UPDATES PENDING:");
console.log("  [ ] Page 43 (start) - move grants_words for dirt once mechanic exists");
console.log(`  [ ] The board (id=${theBoard.id}) - change page_type from 'text' to 'leaderboard'`);
console.log(`  [ ] Occultist helper (id=${occultistHelper.id}) - change page_type from 'text' to 'ar'`);

process.exit(0);
