# Murder Mystery ARG — Planning Notes

## Current State

**Stack:** Bun + React 19 + PostgreSQL + Ant Design v6 (dark theme) + Tailwind CSS 4.1
**Deployment:** Railway (auto-deploys from GitHub `main` branch)
**Local dev:** Docker Postgres + `bun dev`

### What's Built
- Character name + PIN login with persistent sessions (cookie-based, 7-day expiry)
- DB-backed clue system — players enter a code, server validates access and returns content
- Access gating per clue: by team, by player ID, and/or by required flags
- Flag system — clues can grant flags when unlocked; flags can be required prerequisites
- Full admin panel (Players tab, Clues tab, Progress tab) — non-technical-friendly CRUD UI
- Admin can see all players and their earned flags in real time

### Database Tables
| Table | Purpose |
|-------|---------|
| `players` | Character accounts (name, PIN, team, is_admin) |
| `sessions` | Login sessions (UUID token → player, 7-day expiry) |
| `clues` | Code-gated pages with access rules, flag grants, and word grants |
| `player_flags` | Which flags each player has earned |
| `player_words` | Each player's word inventory (one row per word token held) |
| `prompts` | Fill-in-the-gap questions attached to clue pages |
| `player_prompt_completions` | Which players have correctly answered which prompts |

### Default Admin Account
On first startup the server seeds: **name `Admin`, PIN `0000`** — change this immediately via the admin panel once deployed.

### API Surface
```
POST /api/auth/login          POST /api/auth/logout         GET  /api/auth/me
POST /api/clues/unlock
GET  /api/inventory
GET  /api/clues/:id/prompts
POST /api/prompts/:id/submit
GET/POST /api/admin/players      PUT/DELETE /api/admin/players/:id
POST/DELETE /api/admin/players/:id/words
GET/POST /api/admin/clues        PUT/DELETE /api/admin/clues/:id
GET/POST /api/admin/prompts      PUT/DELETE /api/admin/prompts/:id
GET  /api/admin/progress
```

---

## Things To Do / Remember

- [x] Change the default Admin PIN from `0000` after first deploy
- [ ] Add real clue content via the admin panel — no hardcoded pages anymore
- [ ] Mobile layout testing — guests will use phones, Ant Design dark theme untested on small screens
- [ ] The `SecretPage`, `TestPage` components in `src/components/pages/` are now unused — can delete
- [ ] UI is functional but not atmospheric — noir/gothic polish still to come (see build order below)
- [x] Decide: inventory is a unique set per player — no duplicates (`UNIQUE(player_id, word)`)
- [x] Decide: words are NOT consumed on correct submission — they stay in inventory (may revisit)
- [ ] Drag-and-drop needs a tap-to-place fallback for mobile (no drag on touchscreens)

---

## Suggested Build Order

1. ~~**DB-backed code system + admin panel**~~ ✅ Done
2. **Word inventory + prompt system** (see section below) — core new interaction mechanic
3. **Content authoring** — write the actual mystery clues and enter them via the admin panel
4. **Mobile-first UI polish** — noir/gothic aesthetic, atmospheric typography, dark imagery
5. **Evidence board** — visual payoff as players unlock clues (pins on cork board, red string)
6. **One minigame** — safe cracker or cipher decoder to start

---

## Word Inventory & Prompt System

### Concept
Instead of free-text answers, players fill in gaps in a pre-written sentence by dragging word tiles from their personal inventory. The system validates the answer server-side.

**Example flow:**
1. Player finds a card in the room with code `DRAWING-ROOM`
2. They enter it on the site → clue page appears; viewing it grants word `CANDLESTICK`
3. Page has a prompt: *"Who killed the victim?"*
   Template: `"It was _____ with the _____ in the _____."`
   Correct answer: `["COLONEL MUSTARD", "CANDLESTICK", "DRAWING ROOM"]`
4. Player drags tiles from their inventory into the three gaps and hits Submit
5. Server validates → correct! Player is granted flag `solved_drawing_room` and word `SECRET_PASSAGE`

---

### New DB Tables

**`player_words`** — one row per word in a player's inventory (unique set per player)
```sql
CREATE TABLE player_words (
  id SERIAL PRIMARY KEY,
  player_id INT REFERENCES players(id) ON DELETE CASCADE,
  word TEXT NOT NULL,
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(player_id, word)
);
```

**`prompts`** — fill-in-the-gap questions, each belonging to a clue page
```sql
CREATE TABLE prompts (
  id SERIAL PRIMARY KEY,
  clue_id INT REFERENCES clues(id) ON DELETE CASCADE,
  question TEXT NOT NULL,          -- e.g. "Where was the body found?"
  template TEXT NOT NULL,          -- e.g. "The body was found at _____ in the _____."
  answer TEXT[] NOT NULL,          -- ordered correct words, one per gap
  grants_flags TEXT[],             -- flags granted on correct answer
  grants_words TEXT[],             -- words granted on correct answer
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**`player_prompt_completions`** — records which prompts a player has already solved
```sql
CREATE TABLE player_prompt_completions (
  id SERIAL PRIMARY KEY,
  player_id INT REFERENCES players(id) ON DELETE CASCADE,
  prompt_id INT REFERENCES prompts(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(player_id, prompt_id)
);
```

**Clue table addition:** add `grants_words TEXT[]` column — words granted just by visiting the page.

---

### New API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/inventory` | Current player's word list |
| `GET` | `/api/clues/:id/prompts` | Prompts for a clue page, with per-player completion status |
| `POST` | `/api/prompts/:id/submit` | Submit `{ words: string[] }` — validated server-side |
| `POST` | `/api/admin/players/:id/words` | Admin: grant word(s) to a player |
| `DELETE` | `/api/admin/players/:id/words/:wordId` | Admin: remove a word from a player |
| `GET/POST` | `/api/admin/prompts` | Admin: list/create prompts |
| `PUT/DELETE` | `/api/admin/prompts/:id` | Admin: edit/delete a prompt |

The existing `POST /api/clues/unlock` should also grant any `grants_words` on the clue when it's successfully unlocked.

---

### Frontend Components

**`InventoryPanel`**
- Persistent drawer/tray showing the player's words as draggable chips
- Accessible from any page via a button (e.g. "Your Evidence" or bag icon)
- Words currently placed in an active prompt appear greyed out / locked in tray

**`PromptBlock`** (shown on a clue page when prompts exist)
- Displays the question text
- Renders the template with `_____` gaps replaced by drop-zones
- Player drags word chips from InventoryPanel into gaps
- On mobile: tap a word to select it, tap a gap to place it (no drag)
- "Clear" button returns all placed words to inventory
- "Submit" button → POST to server → show correct/incorrect feedback
- On correct: prompt locks with a success state; granted flags/words appear

**Admin Enhancements**
- Prompts sub-tab per clue (or top-level Prompts tab) with full CRUD
- Fields: question, template, answer (tag/array input), grants_flags, grants_words
- Player detail view shows inventory; admin can grant or remove words

---

## Minigame Ideas

| Idea | How it works | Effort |
|------|-------------|--------|
| **Cipher decoder** | Show a cryptogram; players find the key physically and type decoded answer | Low |
| **Safe cracker** | CSS combination lock — drag/click three dials to numbers found on a clue | Low-Med |
| **Alibi timeline** | Drag suspects onto a timeline, submit theory — good for the finale | Med |
| **Evidence board** | As clues unlock, pins appear on a cork board connected by red string | Med |
| **Suspect vote** | End-game ballot, everyone submits their guess, results revealed dramatically | Low |
| **Morse audio** | Play a morse code clip via Web Audio API, players decode it for the next code | Med |

**Best first minigame:** Cipher decoder or safe cracker — self-contained, mobile-friendly, ties into the physical room-hunt mechanic.

---

## Notes

- Keep the code-entry mechanic central — it's the "old video game" feel
- Everything should work well on mobile (guests will use their phones)
- Dark mode first throughout
- The physical/digital loop (find clue in room → enter code on phone) is the core experience
- `page_type` field on clues is reserved for future minigame routing (`'text'`, `'cipher'`, `'safecracker'`)