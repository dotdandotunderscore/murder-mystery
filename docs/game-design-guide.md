# The Broken Drum — Game Design Guide

## What Is This?

A virtual escape room set in a 1920s casino called the Broken Drum. Players use a web app on their phones alongside physical elements in the room. The game is built around four interconnecting factions — **Mobsters**, **Occultists**, **Investigators**, and **Thieves** — each with their own storyline, puzzles, and unique midgame mechanic.

The app is a single-page React app backed by a Bun server and PostgreSQL database. An admin panel lets the game runner create and manage all content.

---

## Core Concepts

### Pages

Pages are the fundamental unit of content. Each page has a **code phrase** — a word or short phrase that players type into the app (or reach via a link) to unlock it. The same code phrase can map to multiple pages with different visibility rules, so different factions can type the same phrase and see different content.

**Page fields:**

| Field | Purpose |
|---|---|
| `code_phrase` | What the player types to reach this page (stored lowercase) |
| `title` | Display title shown to the player |
| `content` | The narrative text (supports [[links]], **bold**, *italic*) |
| `page_type` | How the page renders: `text`, `coin_flip`, `slot_machine`, `scan_target`, `scanner` |
| `visible_to_roles` | Which roles can see this page (e.g. `["investigator"]`) |
| `visible_to_players` | Specific player IDs who can see this page (highest priority) |
| `required_flags` | Flags the player must have to access the page |
| `required_flags_hints` | Hints shown when the player is missing a required flag (parallel array — hint[0] maps to flag[0]) |
| `grants_flags` | Flags granted when the page is unlocked |
| `grants_words` | Clues granted when the page is unlocked |
| `removes_flags` | Flags removed when the page is unlocked |
| `removes_words` | Clues removed when the page is unlocked |
| `folder_id` | Which admin folder this page lives in (organisational only) |
| `sort_order` | Ordering within folder; also determines priority when multiple pages share a code phrase |

**Visibility priority:** When multiple pages share the same code phrase, the system checks in order: player-specific → role-specific → open to all. Within a tier, the highest `sort_order` wins.

### Links

Double-bracket syntax `[[code phrase]]` in page content, prompt text, success text, or hints creates a clickable link. When tapped, it behaves as if the player typed that code phrase. The link text is the phrase itself, rendered in gold.

Links are the primary way to guide players from one page to the next. They can appear in:
- Page content
- Prompt success text
- Wrong answer hints
- Required flag hints

### Prompts

Prompts are fill-in-the-gap puzzles attached to a page. A page can have multiple prompts. Players drag clues from their inventory into the gaps to answer.

**Template syntax:**
- In the database: gaps are `_____` (five underscores)
- In the admin UI: gaps are `[WORD]` or `[WORD1|WORD2]` for alternatives

**Example:** `I use my _____ to light my _____` — the player drags LIGHTER into gap 1 and CIGARETTE into gap 2.

**Prompt fields:**

| Field | Purpose |
|---|---|
| `template` | The puzzle text with `_____` gaps |
| `answer` | Array of correct answers, one per gap. Pipe-separated alternatives allowed (e.g. `["KNIFE\|CANDLESTICK", "LIBRARY"]`) |
| `allow_any_order` | If true, correct words can go in any gap (default: false, gaps must match positionally) |
| `success_text` | Text shown on correct answer (supports [[links]]) |
| `wrong_answer_hints` | Object mapping specific wrong words to hint text (e.g. `{"THE MOON": "Not quite..."}`) |
| `generic_wrong_text` | Fallback hint shown for any wrong answer not covered by specific hints |
| `grants_flags` | Flags granted on correct answer |
| `grants_words` | Clues granted on correct answer |
| `removes_flags` | Flags removed on correct answer |
| `removes_words` | Clues removed on correct answer |

**Unsolvable prompts:** Setting the answer to something like `UNOBTAINABLE` creates a prompt that can never be completed normally. Combined with `wrong_answer_hints`, this lets you create puzzles where the real goal is to learn something from the hint rather than solve the prompt (see: the Madame Web tarot puzzle).

**Completion is permanent:** Once a player completes a prompt, it stays completed. Their submitted words are stored so the UI shows what they entered.

### Clues (Words)

Clues are word tokens in a player's inventory. The UI calls them "Clues". They are the currency of the game — used to answer prompts and traded between players.

- Always stored and displayed in **UPPERCASE**
- Granted by pages, prompts, or mini-game wins
- Removed by pages or prompts (e.g. consuming a CIGARETTE when you smoke it)
- Unique per player — granting a duplicate is silently ignored
- Visible in the player's inventory panel and draggable into prompt gaps

### Flags

Flags are invisible progress markers that control what pages and prompts a player can access. Players don't see flag names directly — they experience flags as gates that open or close content.

- Always stored in **lowercase**
- Granted/removed by pages, prompts, or mini-game wins
- Used in `required_flags` to gate access to pages
- `required_flags_hints` provides player-facing text explaining what they need to do (with [[links]] to guide them)

**Flag design patterns:**
- **Progression gates:** `spoke to jennette` → unlocks the next Madame Web page
- **State tracking:** `found mr. sage` granted when finding the body, removed when returning to Madame Web (so the page version changes)
- **Mechanic unlocks:** `the pale flame` gates all UV-light content behind receiving the item
- **Composite gates:** A page can require multiple flags, e.g. `["consulted the mistress", "found mr. sage"]` — both must be present

### Required Flag Hints

When a player tries to access a page but is missing one or more required flags, the app shows hints instead of the page content. Hints are a parallel array to `required_flags` — hint at index 0 corresponds to flag at index 0.

Hints support [[links]], making them a way to redirect players who are trying to skip ahead:
- *"Need to find some [[shelter]]"*
- *"You don't have any reason to go here"*
- *"I can't think straight yet, need to [[smoke]]"*

If a hint is an empty string, no hint is shown for that missing flag.

---

## Page Types

### Text
Standard narrative page. Shows content, any attached prompts, and grants/removes on unlock.

### Coin Flip
Mini-game. Player predicts heads or tails repeatedly. Need N consecutive correct guesses (configurable via `game_config.target`, default 5). Rewards are not granted on page unlock — they are claimed separately after winning via a claim button.

### Slot Machine
Mini-game. Player pulls a lever to spin 3 reels. Win when all 3 match. Win probability configurable via `game_config.jackpot_chance` (0–100%, default 10%). Like coin flip, rewards claimed after winning.

### Scan Target
Page unlocked by scanning a QR code with the in-app scanner. Gets an auto-generated UUID (`scan_code`). The QR code encodes this UUID. Can also be reached via its code phrase.

### Scanner
Page that embeds the QR scanner interface, allowing the player to scan QR codes from within the app.

---

## Trading

Players can trade clues with each other. This is how cross-faction cooperation works — factions start with different clues and need items from other factions to solve their puzzles.

**Trade flow:**
1. **Offer:** Player A offers a clue to Player B
2. **Counter:** Player B offers a clue back
3. **Accept:** Player A accepts the counter-offer → clues swap

Trades can be declined at any step. They auto-expire after 30 minutes. Both players must still have their offered clues when the trade is accepted.

The WebSocket pushes real-time updates so both players see trade status changes immediately.

---

## Design Patterns

### Gating with flag removal
Grant a flag on one page, require it on the next, then remove it when the story moves on. This lets the same code phrase show different content at different points:
```
green room → grants "found mr. sage"
madame web (requires "found mr. sage") → removes "found mr. sage", grants "found the shell"
```
Now typing `madame web` again shows the *next* version of that page.

### Unsolvable prompts as hint delivery
Set the answer to something unobtainable. Use `wrong_answer_hints` to give targeted feedback when players try specific words. The "failure" IS the puzzle — players learn what they need from the hint.

### Required flag hints as redirects
Use [[links]] in required flag hints to push players toward the content they're missing:
*"I can't think straight yet, need to [[smoke]]"*

### Parallel arrays for flag hints
`required_flags` and `required_flags_hints` are positional. If a player is missing flag[1], they see hint[1]. Use empty strings for flags that don't need player-facing hints.

### Multiple pages, same code phrase
Different factions typing `start` see different opening pages because each has `visible_to_roles` set to their faction. This also works within a faction for progression — multiple `madame web` pages exist, gated by different flags.

---

## Normalisation Rules

| Data | Case | Example |
|---|---|---|
| Code phrases | lowercase | `madame web` |
| Flags | lowercase | `found mr. sage` |
| Clues (words) | UPPERCASE | `LIGHTER` |
| Roles / teams | lowercase | `investigator` |
| Required flag hints | as written (free text) | *"Need to find some [[shelter]]"* |
| Prompt answers | UPPERCASE, pipe-separated alternatives | `KNIFE\|CANDLESTICK` |

---

## Faction Unique Mechanics

Each faction has a special ability or mechanic that activates in the midgame:

| Faction | Mechanic | Physical element |
|---|---|---|
| **Investigators** | The Pale Flame (UV torch) — reveals hidden code phrases written in UV ink around the room | UV light pen + UV ink messages on surfaces |
| **Thieves** | QR scanner fetch quest — scan QR codes on physical objects to "steal" them, then solve a riddle | QR codes on props around the room |
| **Mobsters** | TBD | TBD |
| **Occultists** | TBD | TBD |
