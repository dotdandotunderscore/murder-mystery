# Mobster Faction - TODO

Everything that needs doing before the mobster faction is fully playable.

## Physical Props

- [ ] **Will document** - Print a physical will prop. Front: readable text (partial will contents). Back: write `dons last wish` in UV ink. Place at a fixed location in the venue where players can come look at it.
- [ ] **Special Chip landmark** - Decide what venue feature the SPECIAL CHIP depicts (roulette wheel, painting, chandelier, etc). Write `the house edge` near/under that physical landmark so mobsters can find it.
- [ ] **Filing Office QR** - Print QR code for scan_code `4b4f6dbd-9212-4400-84c9-6bd38995c100`. Place on a cabinet or door in a staff/back area of the venue.
- [ ] **Occultist AR target** - Design and print a high-contrast image (10cm+). Compile it to a `.mind` file via MindAR compiler. Place at a venue location accessible to occultists.

## Code Changes

- [x] **Dirt mechanic** - Implemented
  - `player_dirt` table (separate from player_words, clean separation)
  - `dirt_pool` table seeded with 43 rumour strings
  - `grants_dirt` column on both `pages` and `prompts` tables
  - `POST /api/dirt/send` endpoint (one-way, validates mobster target)
  - `GET /api/dirt/leaderboard` and `GET /api/dirt/mine` endpoints
  - `DirtSendOverlay` component - blocking modal shown when dirt is granted, forces immediate target selection
  - Wired into all three grant flows: page unlock, mini-game claim, prompt submit
  - `LeaderboardView` component for the `leaderboard` page type
  - `RumoursSection` in TradePanel showing stuck dirt on player's sheet
  - Admin panel: `grants_dirt` field on both page and prompt editors, `leaderboard` page type option
  - WebSocket messages: `dirt_received` and `leaderboard_updated`
  - All mobster pages/prompts configured with their `grants_dirt` values
- [x] **Leaderboard page type** - page 130 (the board) changed to `leaderboard`

## Coordinate with Occultist Designer

- [ ] **Occultist helper page** (id=129, `the dons spirit`) - currently a placeholder. Needs:
  - Real narrative content replacing the placeholder text
  - `page_type` changed from `text` to `ar`
  - `.mind` target file created and path set in `game_config.target_file_url`
  - `required_flags` set to whatever flag the occultist gets when their AR camera unlocks
  - Decide what the mobster pays the occultist for the DON'S BLESSING trade
- [ ] **NOTES ON A PROPHETIC DREAM** (page 59, `business in the dark`) - confirm the occultist path still grants this clue early enough for the mobster's Part 1. Decide what the mobster trades to the occultist in return.

## Existing Page Cleanup

- [ ] **Old mobster folders** - Folders 9 ("Part 1 - getting in to the broken drum") and 13 ("Part 2 - Let's go gambling") under Mobster Pages are from ideation. Can be deleted once confirmed they're empty.
- [ ] **Test mini-game pages** - Pages 28 (`coin`) and 34 (`slot`) are test pages with placeholder content. These are NOT the mobster's mini-game pages (those are `high stakes` id=120 and `lucky sevens` id=123). The test pages can be deleted or repurposed.
