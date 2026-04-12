# Mobster Faction - TODO

Everything that needs doing before the mobster faction is fully playable.

## Physical Props

- [ ] **Will document** - Print a physical will prop. Front: readable text (partial will contents). Back: write `dons last wish` in UV ink. Place at a fixed location in the venue where players can come look at it.
- [ ] **Special Chip landmark** - Decide what venue feature the SPECIAL CHIP depicts (roulette wheel, painting, chandelier, etc). Write `the house edge` near/under that physical landmark so mobsters can find it.
- [ ] **Filing Office QR** - Print QR code for scan_code `4b4f6dbd-9212-4400-84c9-6bd38995c100`. Place on a cabinet or door in a staff/back area of the venue.
- [ ] **Occultist AR target** - Design and print a high-contrast image (10cm+). Compile it to a `.mind` file via MindAR compiler. Place at a venue location accessible to occultists.

## Code Changes

- [ ] **Dirt mechanic** (the big one)
  - `is_dirt` column on `player_words` (or equivalent identification)
  - Dirt pool table/config with 40+ rumour strings
  - Random dirt granting (pages flag "grant dirt" rather than naming a specific word)
  - `POST /api/send-dirt` endpoint (one-way, no acceptance, target must be mobster)
  - Immediate-send UI: when dirt is granted, show leaderboard + target picker, block until sent
  - Rumours section on player sheet (stuck dirt, visually distinct, not tradeable, not draggable)
  - Once built, add dirt grants to these pages:
    - `the big time` (id=117): 1 dirt
    - `the executor` (id=118): 2 dirt
    - `the tables` (id=119): 1 dirt
    - `high stakes` (id=120): 1 dirt (on claim)
    - `the house edge` (id=121): 1 dirt
    - `lucky sevens` (id=123): 1 dirt (on claim)
    - `hiring` prompt (page 81): 1 dirt
    - `the hidden will` prompt (id=125): 1 dirt
    - `consult the spirits` prompt (id=126): 1 dirt
- [ ] **Leaderboard page type** - New `page_type: "leaderboard"` that dynamically queries dirt counts per mobster and displays rankings. Then change `the board` (id=130) from `text` to `leaderboard`.

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
