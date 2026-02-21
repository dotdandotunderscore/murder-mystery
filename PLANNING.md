# Murder Mystery ARG — Planning Notes

## Current State

**Stack:** Bun + React 19 + PostgreSQL + Tailwind CSS 4.1 + sonner (toasts) + lucide-react (icons)
**Deployment:** Railway (auto-deploys from GitHub `main` branch)
**Local dev:** Docker Postgres + `bun dev`

### What's Built

- Character name + PIN login with persistent sessions (cookie-based, 7-day expiry)
- DB-backed clue system — players enter a code, server validates access and returns content
- Access gating per clue: by team, by player ID, and/or by required flags
- Flag system — clues can grant flags when unlocked; flags can be required prerequisites
- Word inventory — each player holds a unique set of word tokens; clues and prompts can grant words
- Fill-in-the-gap prompts — tap a word from inventory, tap a gap to place it, submit for server validation
- Admin panel with four tabs: Players, Clues, Prompts, Progress
  - Full CRUD for players, clues, and prompts
  - Progress tab shows each player's flags and words, with a Reset button for testing
  - Tab bar scrolls horizontally on mobile
- Custom Tailwind UI throughout — no component library dependency

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
GET/POST   /api/admin/players             PUT/DELETE /api/admin/players/:id
POST       /api/admin/players/:id/reset-progress
GET/POST   /api/admin/players/:id/words   DELETE     /api/admin/players/:id/words/:wordId
GET/POST   /api/admin/clues              PUT/DELETE /api/admin/clues/:id
GET/POST   /api/admin/prompts            PUT/DELETE /api/admin/prompts/:id
GET        /api/admin/progress
```

---

## Things To Do / Remember

- [x] Change the default Admin PIN from `0000` after first deploy
- [ ] Add real clue content via the admin panel — no hardcoded pages
- [ ] End-to-end playtest on mobile with real content
- [ ] The `SecretPage`, `TestPage` components in `src/components/pages/` are probably unused — check and delete
- [ ] Atmospheric polish — the UI is functional but not yet noir/gothic (typography, imagery, texture)
- [x] Inventory is a unique set per player — no duplicates (`UNIQUE(player_id, word)`)
- [x] Words are NOT consumed on use — they stay in inventory after being placed (may revisit)
- [x] Tap-to-place mechanic implemented for mobile (tap word → tap gap, no drag required)
- [x] Admin tab bar scrollable on mobile

---

## Suggested Build Order

1. ~~**DB-backed code system + admin panel**~~ ✅ Done
2. ~~**Word inventory + prompt system**~~ ✅ Done
3. ~~**Word trading system**~~ ✅ Done (see spec below)
4. **Content authoring** — write the actual mystery clues and enter them via the admin panel
4. **Mobile-first UI polish** — noir/gothic aesthetic, atmospheric typography, dark imagery
5. **Evidence board** — visual payoff as players unlock clues (pins on cork board, red string)
6. **One minigame** — safe cracker or cipher decoder to start

---

## Word Trading System

### Mechanics
- Words are **consumed on trade** — the giver loses the word from their inventory
- True bilateral **trade**: both players offer a word; both must agree before anything transfers
- **Real-time push** via WebSocket — player gets an instant bell notification when a trade arrives
- Offers expire after **30 minutes**

### Flow
1. Player A taps "Offer" on a word in their inventory → picks a recipient → sends offer
2. Player B's bell icon lights up instantly (WebSocket push)
3. Player B opens trade panel → sees the offer → picks one of their own words to counter with
4. Player A gets notified → sees the counter-offer → accepts or cancels
5. On accept: both words atomically swap; both inventories update

Either party can cancel at any time before acceptance.

### DB Schema
```sql
CREATE TABLE trades (
  id SERIAL PRIMARY KEY,
  initiator_id    INT REFERENCES players(id) ON DELETE CASCADE,
  initiator_word  TEXT NOT NULL,
  recipient_id    INT REFERENCES players(id) ON DELETE CASCADE,
  recipient_word  TEXT,              -- null until recipient counters
  status          TEXT DEFAULT 'offered',  -- offered | countered | accepted | cancelled
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  expires_at      TIMESTAMPTZ DEFAULT NOW() + INTERVAL '30 minutes'
);
```

### API
```
GET/POST   /api/trades                  — list active trades / create offer
PUT        /api/trades/:id/counter      — recipient proposes their word back
POST       /api/trades/:id/accept       — initiator confirms the counter
DELETE     /api/trades/:id              — either party cancels
GET        /api/players                 — public player list (for picking trade recipients)
WS         /api/ws                      — persistent connection for push notifications
```

### Frontend
- Bell icon in header with badge count (trades needing your action)
- "Evidence (N)" button in header — always opens the app-level trade panel regardless of current page
- Trade panel (slide-in from right) — shows incoming/outgoing trades with action buttons; also shows your inventory inline
- Tapping a word in the app-level evidence panel opens the trade offer modal for that word
- On clue pages a separate local evidence panel (footer button) is used for gap-filling — these two panels are independent
- Inline word picker in the trade panel for countering (uses shared inventory from `TradeContext`)
- WebSocket managed in `TradeContext` (connects on login, disconnects on logout); inventory also lives in `TradeContext`

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
