/**
 * Seeds all Thief Part 3 pages and prompts into the database.
 * Run with: bun scripts/seed-thief-part3.ts
 */
import { createPage, createPrompt, createFolder, initializeDatabase } from "../db/index";

await initializeDatabase();

// Create folder for Part 3
const folder = await createFolder("Part 3 - the vault job", 4); // parent: Thief Pages (id=4)
const fid = folder.id;
console.log(`Created folder: ${folder.name} (id=${fid})`);

let sort = 0;

// --- Phase A: Getting In ---

// Page: The Real Game
const theRealGame = await createPage({
  code_phrase: "the real game",
  title: "The Real Game",
  content: `Kidd straightens up. No more leaning. No more half-smiles. This is business.

*"You've got fast hands and a cool head. Good. You're going to need both."*

They unfold a piece of paper on the bar. Floor plan. The Broken Drum's basement — not the bit the guests see. The bit underneath that.

*"The Crimson Star. Heard of it?"*

You haven't. Kidd smiles like that's the correct answer.

*"Thirty-carat ruby. Been sitting in the owner's vault since this place opened. Nobody knows it's down there except the man who put it there. And me. And now you."*

Three layers between you and the stone. The stage — your way into the back corridors. A security checkpoint. And the vault itself, behind a door that doesn't officially exist.

*"Get to the stage. Blend in with the band. Then find your way down. I'll be here when you get back."*

You fold the floor plan into your pocket. Thirty carats. That's a lot of reasons to be careful.

Time for an [[encore]].`,
  page_type: "text",
  visible_to_roles: ["thief"],
  required_flags: ["got the hit list", "uncorked", "pocketed", "borrowed", "liberated", "lifted", "swiped"],
  required_flags_hints: ["You're not ready for this yet.", "", "", "", "", "", ""],
  grants_flags: ["briefed on the vault"],
  sort_order: sort++,
  folder_id: fid,
});
console.log(`Created page: ${theRealGame.title} (id=${theRealGame.id})`);

// Page: Encore
const encore = await createPage({
  code_phrase: "encore",
  title: "Encore",
  content: `The band is mid-set when you slide in. Trumpet, drums, piano, and now you. Nobody bats an eye — musicians come and go in a place like this. That's what makes it perfect.

You play. Not well, not badly. Just enough to belong. The music covers everything — the sound of your feet shifting toward the wings, the click of a door you shouldn't be opening, the quiet thud of your heart doing something it hasn't done in a while.

Enjoying itself.

The last note rings out. Applause. You take a bow nobody sees.`,
  page_type: "text",
  visible_to_roles: ["thief"],
  required_flags: ["briefed on the vault"],
  required_flags_hints: ["You don't have a reason to be up here yet."],
  sort_order: sort++,
  folder_id: fid,
});
console.log(`Created page: ${encore.title} (id=${encore.id})`);

await createPrompt({
  page_id: encore.id,
  question: "Join the band",
  template: "I take my place with my _____",
  answer: ["INSTRUMENT"],
  grants_flags: ["past the stage"],
  removes_words: ["INSTRUMENT"],
  success_text: `The set ends. The crowd claps for the music. You clap for the timing. The curtain's right there and nobody's watching the wings. You slip through like smoke. Welcome [[backstage pass]].`,
  wrong_answer_hints: {
    "LOCKPICKS": "Save those for later. Right now you need to look like you belong in a band.",
    "CORKSCREW": "Nobody plays a corkscrew. Not even in this band.",
    "ID BADGE": "Credentials won't help you here. You need to look the part, not flash a badge.",
  },
  generic_wrong_text: "You're joining a band. What would a musician bring on stage?",
});
console.log(`  Created prompt for: ${encore.title}`);

// Page: Backstage Pass
const backstagePass = await createPage({
  code_phrase: "backstage pass",
  title: "Backstage Pass",
  content: `The corridor behind the stage smells like sweat and stale beer and ambition. Dressing rooms. Storage. A fire exit nobody's opened in years.

And a door marked STAFF ONLY with a keycard reader and a little red light that says *not you*.

Good thing you've got credentials.`,
  page_type: "text",
  visible_to_roles: ["thief"],
  required_flags: ["past the stage"],
  required_flags_hints: ["You need to get past the stage first."],
  sort_order: sort++,
  folder_id: fid,
});
console.log(`Created page: ${backstagePass.title} (id=${backstagePass.id})`);

await createPrompt({
  page_id: backstagePass.id,
  question: "Get through the door",
  template: "I flash my _____",
  answer: ["ID BADGE"],
  removes_words: ["ID BADGE"],
  success_text: `The light turns green. You walk through like you've done it a hundred times. You have. But there's a problem at the other end of this corridor — a big one, leaning against the wall with his arms crossed. Security. Not sleeping. Everyone has a weakness, though, and this one keeps eyeing your coat like a man who hasn't had a drink since his shift started.`,
  wrong_answer_hints: {
    "COIN": "You can't bribe a keycard reader.",
    "SAFE KEY": "Wrong kind of key. This door wants a badge, not a skeleton key.",
  },
  generic_wrong_text: "You need credentials to get through a locked door.",
  sort_order: 0,
});
console.log(`  Created prompt 1 for: ${backstagePass.title}`);

await createPrompt({
  page_id: backstagePass.id,
  question: "Deal with the guard",
  template: "I leave a _____ where he can find it",
  answer: ["BOTTLE"],
  grants_flags: ["past security"],
  removes_words: ["BOTTLE"],
  success_text: `You set it on a supply crate, label facing out. Top shelf. The good stuff. He'll find it in thirty seconds. You'll be gone in twenty. Now — Kidd said there's a door down here that doesn't exist on any blueprint. Time to put that [[crystal eye]] to work.`,
  wrong_answer_hints: {
    "COIN": "He's not a vending machine. You need something more... indulgent.",
    "INSTRUMENT": "He doesn't look like the musical type.",
    "CORKSCREW": "What's he supposed to do with that? You need to give him a reason to walk away.",
  },
  generic_wrong_text: "What would tempt a man who's been on his feet all night?",
  sort_order: 1,
});
console.log(`  Created prompt 2 for: ${backstagePass.title}`);

// Page: The Snake's Study (scan_target)
const snakesStudy = await createPage({
  code_phrase: "the snakes study",
  title: "The Snake's Study",
  content: `The crystal eye doesn't lie. What looked like a supply closet has a second layer — a mark on the frame, invisible to anyone without the right lens.

Behind the door: not a closet. An office. Somebody important's office — mahogany desk, leather chair, whisky decanter with one glass. Whoever sits here has taste and money and the kind of job that requires both.

On the desk, catching the light like it wants to be noticed: a dagger. Beautiful thing. Jade handle, silver blade, the kind of weapon that costs more than it kills. You don't know what it's for and you don't care. It's pretty and it's portable.

You pocket it. Obviously.

A locked cabinet sits behind the desk. And behind a panel in the far wall — you can see the seams if you know where to look — something bigger. Something with a combination lock. Old-fashioned. Heavy.

First things first. That cabinet might have what you need to crack the vault.`,
  page_type: "scan_target",
  visible_to_roles: ["thief"],
  required_flags: ["past security"],
  required_flags_hints: ["You can't get down here yet."],
  grants_words: ["JADE DAGGER"],
  sort_order: sort++,
  folder_id: fid,
});
console.log(`Created page: ${snakesStudy.title} (id=${snakesStudy.id}, scan_code=${snakesStudy.scan_code})`);

await createPrompt({
  page_id: snakesStudy.id,
  question: "Open the cabinet",
  template: "I open the cabinet with the _____",
  answer: ["SAFE KEY"],
  removes_words: ["SAFE KEY"],
  success_text: `Click. Smooth as silk. Inside: papers, receipts, and a set of books that looks an awful lot like a second set of accounts. Cross-reference these against something you've already got and you might just find a combination.`,
  wrong_answer_hints: {
    "LOCKPICKS": "Save those. You've got the right key for this one somewhere.",
    "CORKSCREW": "You're breaking into a cabinet, not opening a bottle.",
  },
  generic_wrong_text: "There's a lock. You have a key. This one's not complicated.",
  sort_order: 0,
});
console.log(`  Created prompt 1 for: ${snakesStudy.title}`);

await createPrompt({
  page_id: snakesStudy.id,
  question: "Find the combination",
  template: "I cross-reference the figures with the _____",
  answer: ["LEDGER"],
  grants_flags: ["got the combination"],
  removes_words: ["LEDGER"],
  success_text: `There it is. Three numbers, buried in a column of phantom transactions. The combination was hiding in the books all along — you just needed the right book to compare it to. Now for [[the vault]].`,
  wrong_answer_hints: {
    "SHIPPING MANIFEST": "Shipping records won't help you crack a vault combination. You need financial figures.",
  },
  generic_wrong_text: "You need a book of numbers to compare against the ones in this cabinet.",
  sort_order: 1,
});
console.log(`  Created prompt 2 for: ${snakesStudy.title}`);

// --- Phase B: The Vault Door ---

const theVault = await createPage({
  code_phrase: "the vault",
  title: "The Vault",
  content: `The panel swings open when you punch in the numbers. Behind it: steel. Cold, serious, beautiful steel. A vault door that means business.

The combination got you through the outer layer. But the lock itself is something else — old, intricate, the kind of mechanism built by someone who loved their work. Tumblers and springs and a keyhole that's more suggestion than invitation.

And next to the keyhole, a slot. Coin-sized. Because of course. Every lock in this place has a price tag.

You crack your knuckles. This is the bit you were born for.`,
  page_type: "text",
  visible_to_roles: ["thief"],
  required_flags: ["got the combination"],
  required_flags_hints: ["You don't have the combination yet."],
  sort_order: sort++,
  folder_id: fid,
});
console.log(`Created page: ${theVault.title} (id=${theVault.id})`);

await createPrompt({
  page_id: theVault.id,
  question: "Crack the vault",
  template: "I pick the lock with my _____ and slide the _____ into the slot",
  answer: ["LOCKPICKS", "COIN"],
  grants_flags: ["cracked the vault"],
  removes_words: ["LOCKPICKS", "COIN"],
  success_text: `The tumblers fall like dominoes. The coin drops. Something inside the door goes *clunk* — the satisfied sound of a mechanism that hasn't been triggered in years.

The vault door swings open. It's dark inside. Very dark. And you can hear the clock ticking already — the alarm won't stay quiet forever.

You need to move fast. Grab everything you can. If only you had a light...

Maybe someone out there owes you a favour. Or maybe they will after tonight.

**Go. Now. Use that [[crystal eye]] and take everything that isn't nailed down.**`,
  wrong_answer_hints: {
    "SAFE KEY": "That key opened the cabinet upstairs. This lock needs something more delicate.",
    "CORKSCREW": "Brave. But no. This lock needs finesse, not brute force.",
  },
  generic_wrong_text: "Slot one needs a lockpicking tool. Slot two needs something that fits a coin-sized slot.",
});
console.log(`  Created prompt for: ${theVault.title}`);

// --- Phase C: The Vault Room (6 scan targets) ---

const vaultItems = [
  {
    code_phrase: "crimson star",
    title: "The Crimson Star",
    content: `Thirty carats of deep red perfection sitting on black velvet like it's been waiting for you personally.

You've stolen a lot of things in your life. This is the first one that made you hold your breath.`,
    grants_words: ["CRIMSON STAR"],
  },
  {
    code_phrase: "shadow ledger",
    title: "The Shadow Ledger",
    content: `A heavy book. Black binding. No title. The pages are thin as onionskin and covered in columns of figures — names, dates, amounts. None of it means anything to you.

But someone out there is going to want this very badly.`,
    grants_words: ["BLACK LEDGER"],
  },
  {
    code_phrase: "sealed orders",
    title: "Sealed Orders",
    content: `An envelope. Thick paper. Wax seal, unbroken, stamped with initials you don't recognise. Smells like cigar smoke and expensive decisions.

Whatever's inside, it wasn't meant for you. That's never stopped you before.`,
    grants_words: ["SEALED ENVELOPE"],
  },
  {
    code_phrase: "ivory mask",
    title: "The Ivory Mask",
    content: `A mask. White as bone. Heavier than it looks.

The eye holes are wrong — too wide, too many. And for a second, just a second, you could swear it was warm.

You don't like this one. You take it anyway.`,
    grants_words: ["IVORY MASK"],
  },
  {
    code_phrase: "vipers ring",
    title: "The Viper's Ring",
    content: `A gold ring. Thick band. The initials V.V. are engraved on the inside, deep and deliberate. Whoever owned this wanted to leave a mark.

Pretty. Heavy. Yours now.`,
    grants_words: ["SIGNET RING"],
  },
  {
    code_phrase: "dead drop",
    title: "The Dead Drop",
    content: `A small brass key on a numbered tag. Locker 7. Somewhere in this building there's a locker that this opens, and inside that locker is something somebody wanted hidden.

You love a mystery. Especially one you can carry in your pocket.`,
    grants_words: ["DEAD DROP KEY"],
  },
];

for (const item of vaultItems) {
  const page = await createPage({
    ...item,
    page_type: "scan_target",
    visible_to_roles: ["thief"],
    required_flags: ["cracked the vault"],
    required_flags_hints: ["The vault isn't open yet."],
    sort_order: sort++,
    folder_id: fid,
  });
  console.log(`Created vault scan: ${page.title} (id=${page.id}, scan_code=${page.scan_code})`);
}

// --- Phase D: The Escape ---

const looseEnds = await createPage({
  code_phrase: "loose ends",
  title: "Loose Ends",
  content: `The actor pulls you out. Ninety seconds. Your pockets are heavier than they've ever been and your heart is going like a snare drum.

Then the alarm kicks in. Not the screaming kind. The quiet kind. The kind that tells the right people to start locking doors.

The corridor is sealed. You can hear footsteps — organised, deliberate. Not casino staff. The kind of people who get paid to handle exactly this sort of situation.

The way you came in just became the way you don't get out.

Think. Think. Think.

There — a vent panel in the wall, painted to match the plaster. Too small for most people. Not too small for you. But the screws are stripped and your fingers aren't screwdrivers.

Good thing a corkscrew isn't just for corks.`,
  page_type: "text",
  visible_to_roles: ["thief"],
  required_flags: ["cracked the vault"],
  required_flags_hints: ["You don't need an exit yet."],
  sort_order: sort++,
  folder_id: fid,
});
console.log(`Created page: ${looseEnds.title} (id=${looseEnds.id})`);

await createPrompt({
  page_id: looseEnds.id,
  question: "Escape",
  template: "I pry the panel with the _____",
  answer: ["CORKSCREW"],
  grants_flags: ["clean getaway"],
  removes_words: ["CORKSCREW"],
  success_text: `The screws give. The panel comes free. You slide through like water through a pipe and pull the grate shut behind you.

Twenty minutes of crawling through the guts of the building. Dust, cobwebs, the distant sound of people who are never going to find you.

You emerge into the alley behind the casino. The rain's still coming down. Feels good on your face.

Time to collect. [[Dane Kidd]] is waiting.`,
  wrong_answer_hints: {
    "LOCKPICKS": "Too delicate. You need leverage, not finesse.",
    "JADE DAGGER": "That's worth more than you are. Don't bend it on a vent panel.",
  },
  generic_wrong_text: "You need something with a point and a grip. Something you can use as a lever.",
});
console.log(`  Created prompt for: ${looseEnds.title}`);

// Page: The Score (dane kidd - final)
const theScore = await createPage({
  code_phrase: "dane kidd",
  title: "The Score",
  content: `Kidd is exactly where you left them. Same bar. Same lean. But the half-smile is gone. Replaced by something you haven't seen before.

Respect.

*"You actually did it."*

You empty your pockets onto the bar. The Crimson Star. A jade dagger. A black book. An envelope. A mask. A ring. A key. The light catches the ruby and throws red across the wood grain. Even in a place like this, it looks like it belongs in a museum.

Kidd picks up the Crimson Star. Turns it in their fingers. Sets it back down.

*"Keep it. You earned it."*

You look at them. That's not how this works. There's always a cut. Always a percentage. Always someone with their hand out.

*"I didn't hire you for the stone. I hired you to see if it could be done. It can."*

They finish their drink. Set the glass down. Stand up straight for the second time tonight.

*"You're the real deal. And this place — this casino, these people, this whole rotten operation — it's going to shake itself apart soon enough. When it does, I want someone like you on my side of the table."*

They extend a hand. You shake it. Firm grip. Honest grip. Rare thing in a casino.

Everything goes back in your pockets. The star, the dagger, the book, the ring, the mask, the envelope, the key. Seven reasons to be the most popular person in this building tonight.

Not bad for a night's work.`,
  page_type: "text",
  visible_to_roles: ["thief"],
  required_flags: ["clean getaway"],
  required_flags_hints: ["You haven't finished the job yet."],
  grants_flags: ["job done"],
  sort_order: sort++,
  folder_id: fid,
});
console.log(`Created page: ${theScore.title} (id=${theScore.id})`);

console.log("\n--- Done! ---");
console.log(`Created ${sort} pages + 6 vault scan targets in folder "${folder.name}" (id=${fid})`);
process.exit(0);
