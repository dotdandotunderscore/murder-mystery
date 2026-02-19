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
| `clues` | Code-gated pages with access rules and flag grants |
| `player_flags` | Which flags each player has earned |

### Default Admin Account
On first startup the server seeds: **name `Admin`, PIN `0000`** — change this immediately via the admin panel once deployed.

### API Surface
```
POST /api/auth/login          POST /api/auth/logout         GET  /api/auth/me
POST /api/clues/unlock
GET/POST /api/admin/players   PUT/DELETE /api/admin/players/:id
GET/POST /api/admin/clues     PUT/DELETE /api/admin/clues/:id
GET  /api/admin/progress
```

---

## Things To Do / Remember

- [ ] Change the default Admin PIN from `0000` after first deploy
- [ ] Add real clue content via the admin panel — no hardcoded pages anymore
- [ ] Mobile layout testing — guests will use phones, Ant Design dark theme untested on small screens
- [ ] The `SecretPage`, `TestPage` components in `src/components/pages/` are now unused — can delete
- [ ] UI is functional but not atmospheric — noir/gothic polish still to come (see build order below)

---

## Suggested Build Order

1. ~~**DB-backed code system + admin panel**~~ ✅ Done
2. **Content authoring** — write the actual mystery clues and enter them via the admin panel
3. **Mobile-first UI polish** — noir/gothic aesthetic, atmospheric typography, dark imagery
4. **Evidence board** — visual payoff as players unlock clues (pins on cork board, red string)
5. **One minigame** — safe cracker or cipher decoder to start

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
