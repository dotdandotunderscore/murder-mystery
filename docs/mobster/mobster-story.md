# Mobster Faction - Story Reference

## Voice

1920s gangster internal monologue. Second-person, gender-neutral. Confident, measured, menacing. Short declarative sentences. Everything is power, loyalty, and leverage. Think *The Godfather* meets *Boardwalk Empire*. Not flashy - controlled. Every sentence carries weight. This person doesn't ask for things twice. Absolutely never use em-dash "—"

## Premise

The player is a lieutenant in the Kay crime family. Don Kay - the family patriarch and owner of the Broken Drum Casino - has just died. His will is a test: whoever proves they understand how the casino runs inherits the family business. But every mobster here tonight thinks *they're* the one. And everyone's got dirt on everyone else.

## Key NPCs

- **Don Kay** - the dead patriarch. Built the Broken Drum. Left a puzzle instead of naming a successor. Mentioned but never seen.
- **Mrs. Kay** - Don Kay's widow. In mourning. Mentioned but never seen.
- **The Executor** - Don Kay's oldest friend and lawyer. The mobster's **dedicated actor** (the only NPC played by a real person in this faction). Manages the succession test, gives out assignments, validates progress. Buttoned up, measured, knows everything, reveals nothing.
- **Vincent Vane / "The Viper"** - the casino's fixer (page-only NPC). Runs rigged private games. Killed Mr. Sage without family authority - his freelancing makes him unfit to succeed. The mobster learns about him through cross-faction intel and the Executor.

All other NPCs the mobster encounters (the card sharp, the barkeep, figures on the floor) exist only through page content, not live actors.

## Special Mechanic 1: The Dirt (PvP Rumour War)

Dirt clues are rumours, accusations, and gossip that mobsters collect throughout their path and weaponise against rival mobsters.

### How it works

1. **Collect:** Dirt clues are granted liberally - by page visits, mini-game wins, prompt completions, and cross-faction missions.

2. **Immediate fire:** When a mobster receives a dirt clue, they are **immediately shown the leaderboard and must send it to another mobster right then**. No hoarding, no strategic timing. You get dirt, you pick a target, it's gone. This keeps the leaderboard shifting throughout the game rather than allowing an endgame dump.

3. **Stuck:** Once received, dirt cannot be traded away, discarded, or removed. It appears in a separate **"Rumours"** section on the target's player sheet.

4. **Leaderboard:** A special page (`the board`) shows all mobster players ranked by dirt count. Least dirt = cleanest reputation = strongest claim to the seat. Also shown every time dirt is granted.

### Strategic choices

- Who do you target? The current leader? The person closest to finishing? A personal rival?
- Spread dirt across targets or pile it all on one?
- Cooperate with some mobsters against others?
- You can't re-fire received dirt - only dirt you collected yourself
- Players who finish early are still vulnerable to incoming dirt from others still playing

### Dirt clue pool

Dirt should be drawn randomly from a large pool so that players don't get duplicates and each game feels different. Pages/mini-games that grant dirt should pull from this list rather than granting a fixed word.

**Pool (aim for 40+ entries):**

SKIMMING OFF THE TOP, RATTED TO THE FEDS, FRISKY WITH THE DON'S WIFE, WATERED DOWN THE WHISKEY, POCKETED THE COLLECTION, DOUBLE-BOOKED THE FIGHTS, SOLD OUT A FAMILY MAN, COOKING THE BOOKS, TALKING TO THE COPS, RUNNING A SIDE GAME, RIGGED THE CARD TABLE, SHORT-CHANGED THE FAMILY, BORROWED FROM THE KITTY, FAKED THE RECEIPTS, SNITCHED TO THE PAPERS, SKIPPED THE FUNERAL, STIFFED THE BARKEEP, TIPPED OFF A RIVAL, LOST THE SHIPMENT, POCKETED THE TIPS, CHEATED AT POKER, LIED ABOUT THE NUMBERS, KEPT A SECOND SET OF BOOKS, MISSED THE DROP, FORGOT THE PASSWORD, SOLD FAKE CIGARS, WATERED DOWN THE GIN, BRIBED THE WRONG COP, OWE MONEY TO EVERYONE, WORE A WIRE, DUCKED OUT OF A FIGHT, SQUEALED UNDER PRESSURE, SKIMMED THE DOOR TAKE, SHORTED THE BOOKIE, PLAYED BOTH SIDES, PAWNED THE SILVER, DRANK THE STOCK, LOST AT THEIR OWN GAME, BACKED THE WRONG HORSE, CLIPPED THE WRONG GUY, LET ONE WALK

Each mobster should receive **~8-10 dirt clues** throughout their path (immediately sent on receipt), giving plenty of leaderboard churn across 6 players. With 6 mobsters collecting ~9 each, that's ~54 draws from the pool per game, so the pool needs to be large enough to minimise repeats.

## Special Mechanic 2: The Floor (Cross-Faction Delegation)

The mobster's other signature: they don't do the dirty work themselves - they get other factions to do it.

### The pattern (same for all three missions)

1. The Executor gives the mobster a mission (as a code phrase)
2. The mission page explains what's needed and grants a **KEY clue**
3. Mobster trades the KEY to a player from the right faction
4. That player uses **their faction's special mechanic** (UV torch / QR scanner) to access a mission-specific page
5. The page has a prompt requiring the KEY clue
6. Completing the prompt grants a **REWARD clue**
7. The faction player trades the REWARD back to the mobster
8. The mobster uses the REWARD in their own progression

Both sides benefit - the helper gets something useful from the mobster in return.

### Mission A: The Filing Office (delegate to Thief)

The Don's will is stored in the casino's Filing Office, locked. The mobster needs it stolen.

```
Mobster visits `hiring` (page 81) → gets FILING OFFICE KEY
  → trades FILING OFFICE KEY to a Thief player
    → Thief uses Crystal Eye to scan QR code on the filing office
      → Page prompt requires FILING OFFICE KEY
      → Prompt grants: DON'S SEAL
    → Thief trades DON'S SEAL back to Mobster
      → Mobster uses DON'S SEAL in a follow-up prompt → grants `got the seal`
```

**Payment to thief:** Mobster pays with CHIPS or another tradeable clue. (TBD - may be naturally useful to thief, or just currency.)

### Mission B: The Hidden Will (delegate to Investigator)

The will is a single physical prop in the room. The front is readable, but the back has UV-ink writing only visible with the Pale Flame. The Executor hints there's more to the will than meets the eye.

```
Mobster has WILL FRAGMENT (earned from a mini-game or earlier page)
  → trades WILL FRAGMENT to an Investigator
    → Investigator uses Pale Flame (UV torch) on the physical will
      → Sees a UV code phrase on the back, types it in
      → Page prompt requires WILL FRAGMENT
      → Prompt grants: DON'S FINAL WORD
    → Investigator trades DON'S FINAL WORD back to Mobster
      → Mobster uses DON'S FINAL WORD in a follow-up prompt → grants `read the will`
```

**Payment to investigator:** The mobster trades **THE VIPER** - the name the investigator needs for their Part 3 accusation. This is the natural exchange: the mobster knows the underworld, the investigator needs the killer's name.

### Mission C: The Spirits (delegate to Occultist)

Don Kay had unconventional advisors. The Executor hints at a supernatural element in the Don's legacy that needs consulting.

```
Mobster has OFFERING (earned from a mini-game or earlier page)
  → trades OFFERING to an Occultist
    → Occultist uses their AR camera on a physical image target
      → AR page renders a 3D entity with text/symbol relevant to the Don's legacy
      → Page prompt requires OFFERING
      → Prompt grants: DON'S BLESSING
    → Occultist trades DON'S BLESSING back to Mobster
      → Mobster uses DON'S BLESSING in a follow-up prompt → grants `got the blessing`
```

**AR implementation:** Needs a second `.mind` target file compiled for this mission (see `docs/ar system/AR_HANDOFF.md` for the compilation process). The target image should be a physical printed image placed in the venue. The 3D entity rendered on it should display text or a symbol that is relevant to the Don's spiritual legacy. This target and its AR page need to be configured in the admin panel.

**Payment to occultist:** TBD - needs coordination with occultist designer.

**COORDINATION REQUIRED** - see Coordination section below.

---

## Three-Part Structure

### Part 1 - The Setup (Tutorial)

The mobster learns Don Kay is dead, recalls the will reading, heads to the Broken Drum. The cross-faction trading mechanic is established early: the `business in the dark` scene requires NOTES ON A PROPHETIC DREAM from an occultist before the mobster can even enter the casino.

**Existing pages (need minor tweaks):**

| Page | Code Phrase | What Happens | Grants |
|---|---|---|---|
| 43 | `start` | Don Kay is dead. Go find the will. | CIGAR, SWITCH BLADE, COOL SHADES, BROKEN DRUM CASINO + flag `don kay is gone` |
| 44 | `the will` | Recall the will reading. Where was the executor? | Prompt: BROKEN DRUM CASINO → flag `i remember` |
| 45 | `broken drum` | Walking through the rain to the casino | BUSINESS + flag `business time`, removes `don kay is gone` |
| 59 | `business in the dark` | Meet a figure outside the casino | Prompt: NOTES ON A PROPHETIC DREAM → flag `off to don's` |
| 46 | `move on` | Arriving at the casino entrance | (needs link to entry page) |

**New pages needed:**

| Code Phrase | Title | What Happens | Grants |
|---|---|---|---|
| TBD | Mobster casino entry | Soul-coin scene, mobster flavour - you walk in like you own the place | flag `in the broken drum` |
| `the executor` | First meeting | The Executor explains the test. Four pillars. Introduces the dirt. | flag `met the executor` + 1-2 dirt clues + links/phrases for each pillar |

### Part 2 - The Don's Test (Core Loop)

All four pillars open simultaneously after meeting the Executor. Open-world - tackle in any order.

#### Pillar 1: The Tables

*"The Don always said: a man who can't read the table shouldn't sit at it."*

| Code Phrase | Type | What Happens | Grants |
|---|---|---|---|
| TBD | text | Narrative setup for the tables challenge | links to coin flip |
| TBD | coin_flip | Win target: 3 consecutive. Lower than default to keep pacing. | SPECIAL CHIP + 1 dirt clue + flag `proved your nerve` |
| TBD (physical) | text | The SPECIAL CHIP's marking matches a physical object/location in the venue. Player finds it, discovers a code phrase. | [clue for final prompt] + 1 dirt clue + flag `read the chip` |

**Physical element:** A real poker chip (or image) with a picture/symbol. The mobster must recognise what it depicts in the venue, go there, and find a code phrase written/hidden at that spot.

#### Pillar 2: The Machines

*"The house always wins. That's not luck - that's design. Understand the machine."*

| Code Phrase | Type | What Happens | Grants |
|---|---|---|---|
| TBD | text | Narrative setup for the machines challenge | links to slot machine |
| TBD | slot_machine | Win. Jackpot chance configurable. | WILL FRAGMENT or OFFERING (feeds a Floor mission) + 1 dirt clue + flag `beat the house` |
| TBD | text | The winning symbol means something - follow-up page | [clue or context] + 1 dirt clue + flag `understood the house` |

#### Pillar 3: The Floor

*"A Don who can't get people to do things for him ain't a Don."*

Driven by the Executor actor. The Executor gives each mission as a code phrase when the mobster is ready.

| Mission | Delegate To | Mobster Gives | Mobster Gets Back | Payment |
|---|---|---|---|---|
| A: Filing Office | Thief | FILING OFFICE KEY | DON'S SEAL | CHIPS or similar |
| B: Hidden Will | Investigator | WILL FRAGMENT | DON'S FINAL WORD | THE VIPER |
| C: The Spirits | Occultist | OFFERING | DON'S BLESSING | TBD (coordination) |

Each mission completion grants a flag (`got the seal`, `read the will`, `got the blessing`) and 1 dirt clue.

**Pages needed for helpers:**

| Code Phrase | Accessible By | Mechanic | Prompt Requires | Grants |
|---|---|---|---|---|
| `filing office` | Thief (QR scan) | Crystal Eye QR on physical cabinet | FILING OFFICE KEY | DON'S SEAL |
| TBD (UV on will) | Investigator (UV) | Pale Flame reveals code on physical will | WILL FRAGMENT | DON'S FINAL WORD |
| TBD | Occultist (AR camera) | AR page with dedicated `.mind` target, renders 3D entity with Don's legacy text | OFFERING | DON'S BLESSING |

#### Pillar 4: The Dirt (Ongoing)

No dedicated progression - dirt accumulates from all other pillars. One dedicated page:

| Code Phrase | Type | What It Does |
|---|---|---|
| `the board` | leaderboard (new type) | Shows all mobster players ranked by dirt count. Visitable anytime. "In this family, reputation is the only currency that matters." |

**Dirt sources (approximate per mobster):**
- The Executor meeting: 1-2 dirt clues
- Coin flip win: 1 dirt clue
- Slot machine win: 1 dirt clue
- Physical chip location: 1 dirt clue
- Each mission completion: 1 dirt clue (x3)
- Miscellaneous narrative pages: 1-2 dirt clues
- **Total: ~8-10 dirt clues collected per mobster**

### Part 3 - The Claim (Endgame)

The mobster returns to the Executor with everything gathered. A multi-blank prompt proves they understand the business.

| Code Phrase | Requires Flags | What Happens |
|---|---|---|
| `the claim` | `proved your nerve` + `beat the house` + `got the seal` + `read the will` + `got the blessing` | Final prompt. Multi-blank, Cluedo-style. |

**Final prompt (draft - exact wording TBD):**

> The Don built this place on _____. He kept it running with _____. The biggest threat to this family is a man they call _____ - he _____ without authority. The Don's final word was _____.

Answers drawn from clues collected across all pillars + cross-faction trades.

Success grants flag: `the new don`

The leaderboard (`the board`) shows final dirt standings for bragging rights.

---

## Flag Progression (All Parts)

```
Part 1:
  start → [CIGAR, SWITCH BLADE, COOL SHADES, BROKEN DRUM CASINO] + don kay is gone
    → the will (prompt: BROKEN DRUM CASINO) → i remember
      → broken drum → business time [+ BUSINESS, - don kay is gone]
        → business in the dark (prompt: NOTES ON A PROPHETIC DREAM) → off to don's
          → move on → [enter the casino] → in the broken drum
            → the executor → met the executor [+ dirt x2]

Part 2 (open-world, any order):

  Pillar 1 - Tables:
    [intro page]
      → coin flip win → proved your nerve [+ SPECIAL CHIP, + dirt]
        → [physical code phrase] → read the chip [+ clue, + dirt]

  Pillar 2 - Machines:
    [intro page]
      → slot machine win → beat the house [+ mission-enabling clue, + dirt]
        → [follow-up] → understood the house [+ clue, + dirt]

  Pillar 3 - Floor (Executor-driven):
    hiring → [trade KEY to thief → DON'S SEAL back] → got the seal [+ dirt]
    [will mission] → [trade FRAGMENT to investigator → DON'S FINAL WORD back] → read the will [+ dirt]
    [spirit mission] → [trade OFFERING to occultist → DON'S BLESSING back] → got the blessing [+ dirt]

  Pillar 4 - Dirt:
    the board → (leaderboard, anytime)

Part 3:
  the claim (requires all 5 pillar flags)
    → Final prompt: [DON'S SEAL, DON'S FINAL WORD, DON'S BLESSING, + pillar 1/2 clues]
      → the new don
```

## Clue Inventory Progression

| Point | Gained | Lost |
|---|---|---|
| Start | CIGAR, SWITCH BLADE, COOL SHADES, BROKEN DRUM CASINO | |
| The Will prompt | | BROKEN DRUM CASINO |
| Broken Drum walk | BUSINESS | |
| Business in the Dark | *(trade for NOTES ON A PROPHETIC DREAM from Occultist)* | |
| Business in the Dark prompt | | NOTES ON A PROPHETIC DREAM |
| The Executor meeting | 2 dirt clues | |
| Coin flip win | SPECIAL CHIP + 1 dirt | |
| Physical chip location | [final-prompt clue] + 1 dirt | SPECIAL CHIP (consumed) |
| Slot machine win | WILL FRAGMENT or OFFERING + 1 dirt | |
| Slot follow-up | [final-prompt clue] + 1 dirt | |
| Mission A: trade out | | FILING OFFICE KEY |
| Mission A: trade back | DON'S SEAL + 1 dirt | *(payment to thief)* |
| Mission B: trade out | | WILL FRAGMENT |
| Mission B: trade back | DON'S FINAL WORD + 1 dirt | THE VIPER *(payment to investigator)* |
| Mission C: trade out | | OFFERING |
| Mission C: trade back | DON'S BLESSING + 1 dirt | *(payment to occultist)* |
| Various narrative pages | 1-2 more dirt | |
| Firing dirt at rivals | | *(dirt clues sent away)* |
| The Claim prompt | | DON'S SEAL, DON'S FINAL WORD, DON'S BLESSING, [pillar clues] |

## Cross-Faction Dependencies

### Clues the Mobster Needs

| Clue | From | When | How |
|---|---|---|---|
| NOTES ON A PROPHETIC DREAM | Occultist | Part 1 | Trade (gate before entering casino) |
| DON'S SEAL | Thief (via Mission A) | Part 2 | Delegation: trade KEY, get SEAL back |
| DON'S FINAL WORD | Investigator (via Mission B) | Part 2 | Delegation: trade FRAGMENT, get WORD back |
| DON'S BLESSING | Occultist (via Mission C) | Part 2 | Delegation: trade OFFERING, get BLESSING back |

### Clues the Mobster Provides

| Clue | To | Why They Need It |
|---|---|---|
| THE VIPER | Investigator | Names the killer in their Part 3 accusation |
| FILING OFFICE KEY | Thief (Mission A) | Needed for filing office prompt |
| WILL FRAGMENT | Investigator (Mission B) | Needed for hidden will prompt |
| OFFERING | Occultist (Mission C) | Needed for spirits prompt |
| CIGAR | TBD | Trade currency (natural fit for investigator?) |
| SWITCH BLADE, COOL SHADES | TBD | Trade currency / flavour |

---

## The Executor - Actor Brief

**Character:** Don Kay's oldest friend and lawyer. The only person the Don fully trusted. Not a mobster - a civilian adjacent to organised crime for 40 years. Unflappable.

**Demeanour:** Measured. Unhurried. Complete sentences. Formal address. Never raises voice. Makes eye contact that feels like a contract being drawn up.

### What they do at each stage

**Part 1:** Not involved. The mobster hasn't reached the casino yet.

**Part 2 - First Meeting:**
- Explain the succession test: *"The Don didn't trust any of you enough to name a successor. So he left a test."*
- Outline the pillars: *"The tables. The machines. The people. He wanted to know you understand all of it."*
- Introduce the dirt: *"In this family, reputation is the only currency that counts. Whatever you hear about the others... don't waste it."*
- Provide code phrases for the pillars (verbally or via app)

**Part 2 - Pillar 3 Mission Briefings:**
- Mission A: *"The Don's will is in the Filing Office. Locked. You'll need someone with nimble fingers."*
- Mission B: *"There's more to that document than what's on the surface. Find someone who can shed some light."*
- Mission C: *"The Don had... unconventional advisors. Their counsel was part of how this place runs. You'll need to consult them."*

**Part 2 - Check-ins:**
- React to leaderboard: *"You're running clean... for now"* or *"People are talking about you. Not favourably."*
- Acknowledge pillar completion with a nod and brief comment

**Part 3 - The Claim:**
- When all pillars complete, give the `the claim` code phrase
- After completion: *"The Don would've approved. Maybe."*

**Progressive hints if stuck:**
- Tables: *"The coin game's running tonight. Ask around."*
- Machines: *"Every machine in this place tells a story. Try your luck."*
- Floor: *"You don't do the work yourself. That's the point of running a family."*
- Trading: *"The investigator needs a name. You know a name. Think about it."*

---

## Coordination Needed (Occultist Faction)

### 1. NOTES ON A PROPHETIC DREAM - Part 1 gate

Page 59 (`business in the dark`) requires this clue from the occultist to progress. This is the mobster's first cross-faction interaction.

**Need to confirm:**
- Does the occultist path still grant NOTES ON A PROPHETIC DREAM?
- At what stage? It needs to be early enough that mobsters aren't stuck in Part 1
- What does the mobster offer the occultist in return?

### 2. Mission C: The Spirits - Part 2 Pillar 3

A new AR page is needed that the occultist accesses using their AR camera.

**Need to build together:**
- A new `.mind` target file compiled from a physical image that will be placed in the venue
- An AR page (page_type: `ar`) that renders a 3D entity with text/symbol about the Don's spiritual legacy
- The page must have a prompt requiring OFFERING (traded from mobster)
- The prompt must grant DON'S BLESSING (traded back to mobster)
- What does the mobster pay the occultist? What do they actually need?
- Where should the physical AR target image be placed in the venue?

### 3. Shared world questions

- Does the occultist interact with the Executor at all?
- Does the occultist storyline reference Don Kay or the succession?

---

## Code Changes Required (Dirt Mechanic)

The dirt mechanic needs new features that don't exist in the current app:

### 1. Dirt pool and random granting

Rather than pages granting a fixed dirt clue, pages/mini-games that grant dirt should draw randomly from a large pool (40+ entries, defined in the DB or config). The system should avoid giving a player a dirt word that's already in circulation in the current game session.

### 2. Dirt identification

Add a way to distinguish dirt clues from normal clues. Recommended: `is_dirt` boolean column on `player_words` (default `false`). Dirt words arrive with `is_dirt = true`.

### 3. Immediate-send flow

When a dirt clue is granted, the player does NOT see it in their regular inventory. Instead, the UI immediately shows:
- The dirt word they just received
- The current leaderboard (all mobster players ranked by dirt count)
- A target picker: they must choose a mobster to send it to before they can continue

This is a blocking UI. The player cannot dismiss it or proceed without firing the dirt. This prevents hoarding and keeps the leaderboard dynamic throughout the game.

### 4. Send Dirt endpoint

New `POST /api/send-dirt` endpoint:
- Input: `{ wordText, targetPlayerId }` (or similar)
- Adds the dirt word to target's inventory, marked as stuck (not tradeable, not removable)
- Validates: target must be a mobster-role player, target must not be self
- Pushes real-time update to both players via WebSocket

### 5. UI - Rumours section

On the player sheet, received (stuck) dirt appears in a separate **"Rumours"** section:
- Visually distinct from regular clues (different colour/section)
- Cannot be dragged into prompts
- Cannot be traded
- Shows the rumour text (e.g. "SKIMMING OFF THE TOP")

### 6. Leaderboard page type

New page type `leaderboard`:
- Queries all mobster-role players
- Counts stuck dirt per player
- Displays ranked list (least dirt first)
- Content field provides flavour text, dynamic ranking is appended
- Also embedded in the immediate-send flow (step 3 above)

---

## Production Notes

### Physical elements needed

| Element | Description | Where |
|---|---|---|
| The Will | A single physical document. Front: readable text with partial will contents. Back: UV-ink code phrase only visible with investigator's Pale Flame. | Displayed at a fixed location in the venue (e.g. a table, a frame). Mobsters can come look at it anytime. |
| Special Chip | A poker chip (or card with a chip image) showing a recognisable feature of the venue - a painting, a chandelier, a specific table. | Given to player by the Executor after coin flip win, or represented in the app text. Player must find the matching physical spot. |
| Code phrase at chip location | A visible (not UV, not QR) code phrase hidden at the physical location matching the chip. | Written on/under/behind the relevant object. |
| Filing Office QR | A QR code on a physical cabinet or door representing the filing office. | Placed in a staff-area or back-room location. Scanned by the thief using Crystal Eye. |
| Occultist AR target | A printed image that serves as the AR target for Mission C. Needs a compiled `.mind` file. High contrast, detailed, non-symmetric. Could be a ritual symbol, a portrait of Don Kay, an old document. | Placed at a fixed location in the venue. Occultist points AR camera at it. TBD exact placement - coordination with occultist designer. |

### Materials checklist

- [ ] Physical will document (front text + UV ink on back)
- [ ] UV-reactive ink pen (for writing on will back)
- [ ] Special chip prop (or printed card with venue image)
- [ ] Code phrase placed at chip location
- [ ] QR code for filing office
- [ ] Occultist AR target image (printed, high contrast, 10cm+)
- [ ] Compiled `.mind` file for the AR target (via MindAR compiler)
- [ ] AR page configured in admin with target file URL and 3D entity
- [ ] Executor actor fully briefed
