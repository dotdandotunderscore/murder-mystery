# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Runtime & Tooling

Use Bun throughout — never Node/npm/yarn/pnpm/vite/webpack.

- `bun --hot src/index.ts` — dev server with HMR
- `bun run tsc --noEmit` — type-check (no build step needed in dev)
- `bun install` — install dependencies
- Bun auto-loads `.env`; no dotenv needed
- `Bun.serve()` for the HTTP server (not express)
- `import { sql } from "bun"` for PostgreSQL (not pg/postgres.js)

## Architecture

**Single-process full-stack app.** `src/index.ts` runs `Bun.serve()` which serves both the React SPA and all API routes. The frontend is a standard React 19 + Tailwind 4 SPA bundled on-the-fly by Bun from `src/index.html`.

```
src/index.ts          — Bun.serve(): all API routes + WebSocket + DB init on startup
src/index.html        — SPA entry point (imports main.tsx)
src/main.tsx          — React root: PlayerProvider + App + Toaster
db/index.ts           — All DB schema (CREATE TABLE + ALTER TABLE migrations), types, and query functions
```

**Database** is PostgreSQL via `Bun.sql`. `db/index.ts` is the only file that touches the DB — it exports typed query functions consumed by `src/index.ts`. Schema migrations run idempotently on every startup via `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`.

**Important Bun.sql gotcha:** JS arrays are NOT serialized to PostgreSQL array literals automatically. Always use the `pgTextArray()`/`pgIntArray()` helpers in `db/index.ts` when passing array parameters. Reading arrays back from Postgres works fine.

**API routes** in `src/index.ts` use the object format for parameterized/multi-method routes:
```ts
"/api/admin/pages/:id": {
  PUT: async (req) => { ... req.params.id ... },
  DELETE: async (req) => { ... },
}
```
The catch-all `"/*": index` must be last. Static literal routes (e.g. `/api/admin/pages/reorder`) must appear **before** parameterized routes like `/api/admin/pages/:id` or the param will match first.

**Auth** uses a `mystery_session` cookie (UUID, 7-day expiry). `getCurrentPlayer(req)` resolves the session on every request. Default admin seeded on first start: name=`Admin`, pin=`0000`.

**WebSocket** pushes real-time updates to players (trade events, inventory changes). `pushToPlayer(id, data)` sends to a connected player by ID. The `connections` map lives in `src/index.ts`.

## Frontend Structure

```
src/components/
  App.tsx                   — Login gate, code-phrase entry, routing between views
  pages/
    AdminPage.tsx           — Tab switcher only (imports from admin/)
    PageView.tsx            — Player view of an unlocked page
    HomePage.tsx, LoginPage.tsx
  admin/                    — Admin panel components (split from the original monolith)
    types.ts                — Shared interfaces: Player, Folder, Page, Prompt, Progress, Suggestions
    shared.tsx              — Modal, Field, Toggle, AutocompleteInput, TagInput, RequiredFlagsEditor,
                              WrongAnswerHintsEditor, fieldCls/inputCls/saveBtnCls constants, toArr
    TemplateEditor.tsx      — toRichTemplate, fromRichTemplate, TemplateEditor
    PromptModal.tsx         — Prompt create/edit modal
    PlayersPanel.tsx        — Player CRUD
    PagesPanel.tsx          — Page/folder tree with drag-and-drop reorder, inline prompts
    ProgressPanel.tsx       — Player progress viewer
  context/
    PlayerContext.tsx       — Current player session (login state)
    TradeContext.tsx        — Trade state, inventory, WebSocket, pending action count
```

**State management** is React context only — no Redux/Zustand. `PlayerContext` holds the logged-in player; `TradeContext` holds inventory, trades, and the WebSocket connection.

## Game Concepts (important for understanding data flow)

- **Pages** — content unlocked by typing a code phrase. DB table `pages`. A code phrase can map to multiple pages with different visibility rules (player-specific → role-specific → open).
- **Clues** — word tokens in a player's inventory, tradeable between players. DB table `player_words`. The UI calls these "Clues".
- **Flags** — progress markers. DB table `player_flags`. Used as prerequisites and grants on pages/prompts.
- **Prompts** — fill-in-the-gap puzzles on a page. Template uses `_____` gaps in DB; admin UI uses `[WORD]` or `[WORD1|WORD2]` notation (alternatives). Answers are stripped from API responses to players.

## Case Normalisation (enforced at DB write layer in `db/index.ts`)

- `code_phrase`, flags, team/role names → **lowercase**
- Words (clues, prompt answers) → **UPPERCASE**
- `required_flags_hints` → trimmed only (free text, positional alignment matters)

## Page Types

`page_type` controls rendering in `PageView.tsx`: `text` (default), `coin_flip`, `slot_machine`, `scan_target`. Mini-game pages (`coin_flip`, `slot_machine`) do **not** auto-grant words/flags on unlock — rewards are granted separately on win via `/api/pages/:id/claim-game-reward`.
