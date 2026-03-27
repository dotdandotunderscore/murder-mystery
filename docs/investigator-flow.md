# Investigator Role - Game Flow Summary

## Overview

The Investigator is a noir-style private detective hired by Mrs. Sage to find her missing husband at the Broken Drum Casino. The story progresses through two acts: gaining entry to the casino, then descending into its underground to find Mr. Sage — only to discover he's been murdered and must use occult means to find his killer.

## Inventory & Mechanics

- Players start with clues (words) granted by pages, and use them to solve prompts (fill-in-the-gap puzzles)
- Flags gate progression — a page's `required_flags` must all be held before a player can access it
- Some pages are investigator-only (`visible_to_roles: ["investigator"]`), others are open to all roles but sit within the investigator's narrative path
- Pages sharing a code phrase resolve by: player-specific > role-specific > open, with the furthest-down (highest sort_order) qualifying page winning within each tier
- `[[code phrase]]` in page content renders as a clickable link that auto-submits that code
- `scan_target` pages require a QR scan (grants a `scanned_<phrase>` flag before the required_flags check)

---

## Part 1 — Getting into the Broken Drum Casino

**Folder:** "Part 1 - getting into the Broken Drum Casino" (folder_id: 3)

### Step 1: "start"
**Page: "A long dark night"** (investigator-only)
- No prerequisites
- Sets the scene: rainy night, the investigator arrives at the casino steps, needs a smoke before going in
- **Grants clues:** NOTEBOOK, $5 BILL, PENCIL
- **Links to:** `[[smoke]]`

### Step 2: "shelter"
**Page: "Undercover, again"** (open — all roles see this)
- No prerequisites
- The investigator gets out of the rain, finds soaked cigarettes and a lighter
- **Grants flag:** `got out of the rain`
- **Grants clues:** LIGHTER

### Step 3: "smoke"
**Page: "Time to clear your mind"** (investigator-only)
- **Requires flag:** `got out of the rain` (hint: "Need to find some [[shelter]]")
- Page has no content itself — it's a prompt-only page
- **Prompt:** "What do you do?" — template: "I use my _____ to light my _____"
  - **Answer:** LIGHTER, CIGARETTE
  - **On correct:** grants flag `had your fix`, removes clue CIGARETTE
  - **Success text:** "Three deep breaths in. Much better. Time to cross the threshold of the [[Broken Drum]]."

> Note: The player needs to have obtained a CIGARETTE clue from somewhere (likely traded from another player, since start only gives NOTEBOOK, $5 BILL, PENCIL). This is the first cross-role interaction point.

### Step 4: "broken drum"
**Page: "Welcome to the Broken Drum Casino"** (open)
- **Requires flag:** `had your fix` (hint: "I can't think straight yet, need to [[smoke]]")
- The investigator enters the casino, grabs champagne, starts looking for Mr. Sage
- **Grants flag:** `in the broken drum`
- **Links to:** `[[Mr Sage]]` (no matching page found for investigator — likely prompts the player to ask around physically or the code phrase leads elsewhere)

---

## Part 2 — Finding the Eye, Finding the Body

**Folder:** "Part 2 - finding the eye, finding the body" (folder_id: 8)

### Step 5: "private rooms"
**Page: "Hive of scum and villainy"** (investigator-only, sort_order: 0)
- No prerequisites (presumably the player discovers this code phrase through in-person exploration or another player)
- The investigator descends into the underground warren of the casino
- **Grants flag:** `in the warren`
- Narrative: needs to find someone who knows the place, remembers a name from a past life

### Step 6: "jennette orilae"
**Page: "An island in the tempest"** (investigator-only, sort_order: 1)
- **Requires flag:** `in the warren` (hint: "She doesn't seem to be around right now")
- Jennette is an old contact. She nervously tells the investigator to find Madame Web
- **Grants flag:** `spoke to jennette`
- **Links to:** `[[Madame Web]]`

### Step 7: "madame web" (first visit)
**Page: "The Mistress of Mysteries"** (open, sort_order: 2)
- **Requires flag:** `spoke to jennette` (hint: "You don't know where to find her")
- The investigator enters Madame Web's incense-filled den
- **Prompt:** "What do you show Madame Web?" — template: "I show her the _____"
  - **Answer:** UNOBTAINABLE (a placeholder clue — likely meant to be replaced with an actual item)
  - No success grants

### Step 7b: "bew emadam" (the reversed visit)
**Page: "seiretsyM fo ssertsiM ehT"** (investigator-only, sort_order: 3)
- **Requires flags:** `in the warren` + `spoke to jennette`
- Everything is backwards/reversed — a puzzle page. The content is mirrored text
- **Prompt:** "?beW emadaM wohs uoy od tahW" — template: "_____ eht reh wohs I"
  - **Answer:** MAJOR ARCANA - THE MOON
  - **On correct:** grants flag `reversed the illuson`
  - **Success text:** "Ah. I see you are no stranger to the esoteric arts. Come back to my room again."

> The "MAJOR ARCANA - THE MOON" clue comes from another role (the Occultist, via folder_id: 2). This is another cross-role trade point.

### Step 8: "madame web" (second visit)
**Page: "The Mistress of Mysteries, Unveiled"** (investigator-only, sort_order: 4)
- **Requires flag:** `reversed the illuson`
- Madame Web tells the investigator Mr. Sage is in the Green Room, and gives them something they'll need
- **Grants flags:** `found the crystal eye`, `consulted the mistress`
- **Links to:** `[[Green Room]]`

### Step 9: "green room"
**Page: "The Green Room"** (open, sort_order: 5)
- **Requires flag:** `consulted the mistress` (hint: "You don't have any reason to go here")
- The investigator finds Mr. Sage dead — sprawled out, lifeless
- Searches the room but finds nothing, considers interrogation
- **Grants flag:** `found mr. sage`
- **Links to:** `[[Madame Web]]` (return visit)

### Step 10: "madame web" (third visit)
**Page: "The Lantern of the Soul Guide"** (investigator-only, sort_order: 6)
- **Requires flags:** `consulted the mistress` + `found mr. sage`
- Madame Web says the investigator found only the shell, not the man. Tells them to use the crystal eye to peer upon the casino's proprietors to unravel the threads of fate
- **Grants flag:** `found the shell of mr. sage`
- **Removes flag:** `found mr. sage`
- **Links to:** `[[crystal eye]]`

### Step 11: "crystal eye"
**Page: "The Crystal Eye"** (open, scanner page)
- **Requires flag:** `found the crystal eye` (hint: "You haven't found this yet")
- **Page type:** `scanner` — the player uses their phone camera to scan QR codes
- This is the mechanic for "peering through the crystal eye" at real people/staff

### Step 12: "mr. sage's ghost"
**Page: "This must be the place"** (open, sort_order: 7)
- **Requires flag:** `found the shell of mr. sage`
- **Page type:** `scan_target` — can only be accessed by scanning a QR code (not by typing the phrase)
- Content: *"The silhouette of this member of staff hums with the energy of a stranded soul. This person holds the soul of Mr. Sage. Call his name"*
- This is the climax — the player must find the right staff member wearing a QR code and scan them

---

## Flag Progression Chain

```
(start)
  -> shelter: grants "got out of the rain"
  -> smoke: requires "got out of the rain" -> prompt grants "had your fix"
  -> broken drum: requires "had your fix" -> grants "in the broken drum"
  -> private rooms: grants "in the warren"
  -> jennette orilae: requires "in the warren" -> grants "spoke to jennette"
  -> madame web (reversed): requires "in the warren" + "spoke to jennette" -> prompt grants "reversed the illuson"
  -> madame web (unveiled): requires "reversed the illuson" -> grants "found the crystal eye" + "consulted the mistress"
  -> green room: requires "consulted the mistress" -> grants "found mr. sage"
  -> madame web (lantern): requires "consulted the mistress" + "found mr. sage" -> grants "found the shell of mr. sage", removes "found mr. sage"
  -> crystal eye: requires "found the crystal eye" (scanner page)
  -> mr. sage's ghost: requires "found the shell of mr. sage" (scan_target — QR only)
```

## Cross-Role Dependencies

1. **CIGARETTE clue** — needed for the "smoke" prompt. Not granted by any investigator page. Must be traded from another role.
2. **MAJOR ARCANA - THE MOON clue** — needed for the reversed Madame Web prompt. Comes from the Occultist's flow (folder_id: 2). Must be traded.

## Key Design Patterns

- **Progressive code phrase reuse:** "madame web" is used 4 times (sort_orders 2, 3, 4, 6) — the player sees whichever version they qualify for, preferring the furthest down
- **Reversed text puzzle:** The "bew emadam" page has all content reversed as a puzzle mechanic
- **Physical world integration:** QR scanning (`scanner` and `scan_target` page types) bridges the digital game with real-world exploration
- **Inline navigation:** `[[code phrase]]` links guide the player naturally through the story
- **Flag gating with hints:** Required flags hints use `[[links]]` to nudge players toward what they need to do
- **Flag removal:** "found mr. sage" is granted then removed to transition the player from "found the body" state to "found the shell" state, preventing them from re-entering the Green Room discovery
