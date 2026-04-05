# Thief Faction — Production Reference

## Physical Setup (All Parts)

### Part 1 — Props

| Item | Purpose |
|---|---|
| Pink neckerchief (for Dane Kidd actor) | Visual identifier for the contact. Player is told to find someone wearing it. |

### Part 2 — QR Codes (6 scan targets)

Place QR codes on physical objects or people around the venue. Each QR encodes the scan_target UUID for the corresponding page.

| QR Target | Physical Location | Page Title | Clue Granted |
|---|---|---|---|
| `corkscrew heist` | On or near the bar / bartender's station | Uncorked | CORKSCREW |
| `safe key heist` | On a coat rack near an office or staff area | Pocketed | SAFE KEY |
| `id badge heist` | On or near a security guard / break area | Borrowed | ID BADGE |
| `bottle heist` | Behind the bar, top shelf | Liberated | BOTTLE |
| `coin heist` | At a card/gaming table | Lifted | COIN |
| `ledger heist` | On a staff member or near the bookkeeper's area | Swiped | LEDGER |

### Part 2 — Physical Document

A **set list** (poster, menu, or similar) placed backstage or in a visible staff area. It contains the code phrase for the Crystal Eye page (currently `---set list clue` — replace with final code phrase). The code phrase should be hidden but discoverable — between lines of text, in a margin, as an acrostic, etc.

### Part 3 — QR Codes (7 scan targets)

**The Snake's Study (1 scan — in the back corridor):**

| QR Target | Physical Location | Page Title |
|---|---|---|
| `the snakes study` | A door, wall panel, or cupboard in a back corridor / restricted area | The Snake's Study |

The thief uses the Crystal Eye (QR scanner) to find this hidden office. Place the QR code somewhere that requires active searching — not in plain sight.

**The Vault Room (6 scans — inside the locked dark room):**

A physical room at the venue, kept locked and dark until the thief unlocks the vault in-app. An actor controls access — opens the door, starts a **90-second timer**, then pulls the thief out.

The room should be dark enough that the thief needs someone else's phone flashlight to see the QR codes. This naturally forces cooperation with another player.

| QR Target | Physical Placement (inside vault room) | Clue Granted | For Faction |
|---|---|---|---|
| `crimson star` | Centrepiece — on a pedestal or table, most visible | CRIMSON STAR | Thief (trophy) |
| `shadow ledger` | On a shelf or in a stack of books | BLACK LEDGER | Investigators + Occultists |
| `sealed orders` | In a drawer or pinned to a board | SEALED ENVELOPE | Mobsters |
| `ivory mask` | Mounted on a wall or displayed on a stand | IVORY MASK | Occultists |
| `vipers ring` | In a small box or case | SIGNET RING | Investigators or Mobsters |
| `dead drop` | Hidden low — under a table, behind something | DEAD DROP KEY | Mobsters or Occultists |

**Vault room setup notes:**
- 90 seconds is tight but achievable — the thief should be able to scan all 6 if they move quickly
- The room doesn't need to be large — a closet or small side room works fine
- Scatter the QR codes at different heights and positions so the thief has to physically search
- The CRIMSON STAR should be the most prominent — the thief will grab it first
- The DEAD DROP KEY should be the hardest to spot — tucked low or behind something

---

## Dane Kidd Actor Briefing

### Who They Are

The thief's contact and the Man on the Inside. Presents as "Dane Kidd" wearing a pink neckerchief. The twist: Kidd IS the Man on the Inside, revealed at the end of Part 2 via the RED TIE cipher.

### Costume

- **Part 1–2:** Pink neckerchief (visible identifier). Optionally also wearing a red tie underneath or switching at the reveal moment.
- **Part 2 reveal onward:** Red tie visible. The neckerchief can be removed or kept.

### Part 1: First Contact

When a thief approaches and mentions the pink neckerchief:
1. Stay cool. Half-smile. Don't look at them directly at first.
2. Tell them to type `dane kidd` into the app.

### Part 2: The Hit List

When the thief returns after finding the Crystal Eye:
- The app handles the progression (page 49 loads automatically when they type `dane kidd` with the right flags).
- If they're stuck finding QR codes, give spatial hints: *"The bartender keeps one close..."*, *"Check the coat rack..."*, etc.

### Part 2: The Cipher Reveal

After the thief completes all 6 prompts on page 56:
- They'll see numbers (3, 4, 2, 4, 3, 2) as prompt success texts.
- They need to extract letters from each heist item name at those positions → RED TIE.
- If stuck, nudge: *"Those numbers mean something. Look at what you stole, letter by letter."*
- When they figure out RED TIE and say ORCHID: react. Stand up straight. Drop the half-smile. Reveal you ARE the Man on the Inside.

### Part 3: The Briefing

After the ORCHID reveal:
1. Brief them on the vault job (improvise or follow the script — the Crimson Star, three layers, the stage is the way in).
2. Tell them to type `the real game` into the app.

### Part 3: The Vault Room

When the thief completes the vault door prompt (`cracked the vault` flag granted):
1. Open the physical vault door.
2. Say: *"Ninety seconds. Take everything you can. Go."*
3. Start a 90-second timer (phone stopwatch works fine).
4. When the timer runs out, pull them out: *"Time's up."*
5. If the thief asks to bring someone with a light, allow it — encourage it even. The room is dark.

### Part 3: Ongoing Hints

Players can return anytime during the heist:

| Player seems... | Say something like... |
|---|---|
| Hasn't started the heist | *"The band's playing. That's your way in. Blend in, slip out."* |
| Past the stage, stuck at security | *"Badge gets you through the door. The guard needs something else — something to take the edge off a long shift."* |
| Past security, can't find the office | *"Use that eye of yours. The door's down there — it just doesn't want to be found."* |
| In the office, stuck on combination | *"You lifted a bookkeeper's ledger, didn't you? Numbers talk to numbers."* |
| At the vault | *"You're a thief. This is what you do. Lock wants picking, slot wants filling."* |
| Vault done, needs to escape | *"You got in through the walls. Get out through them too."* |
| Finished the heist | *"Not bad. Not bad at all."* (They know. The app handles the rest.) |

### General Demeanour

Cool, unhurried, amused. Leans on things. Half-smiles. Gives just enough information and never more. Think jazz-club regular who happens to run the place. When the reveal happens (RED TIE / ORCHID), shift to something more direct — respect, professional recognition.

---

## Cross-Faction Dependencies

### Clues the Thief Provides

The thief is the **most trade-rich faction** in the endgame. Every other faction needs at least one thing from the vault.

| Clue | To Faction | Context |
|---|---|---|
| **CIGARETTE** | Investigators | Traded in Part 1 (for $5 BILL) |
| **JADE DAGGER** | Investigators | The murder weapon. Stolen from the Viper's office — the thief just thinks it's a pretty knife. |
| **BLACK LEDGER** | Investigators + Occultists | Shadow financial records. Means nothing to the thief. |
| **SEALED ENVELOPE** | Mobsters | Wax-sealed orders. Smells like cigars and leverage. |
| **IVORY MASK** | Occultists | Ritual artifact. The thief finds it unsettling but valuable. |
| **SIGNET RING** | Investigators or Mobsters | Gold ring, initials V.V. — Vincent Vane's personal seal. |
| **DEAD DROP KEY** | Mobsters or Occultists | Brass key for Locker 7 — access to a hidden stash. |
| **SHIPPING MANIFEST** | Any | Optional Part 1 clue — supply chain info. |

### Clues the Thief Needs

| Clue | From Faction | Context |
|---|---|---|
| **$5 BILL** | Investigators | Needed in Part 1 to bribe the Chef. Natural trade for CIGARETTE. |

The thief doesn't need anything from other factions to complete their storyline. Their endgame is pure trading: figuring out who wants what and what it's worth.

### Proposed Trades

| Thief Gives | Thief Gets | Faction | When |
|---|---|---|---|
| CIGARETTE | $5 BILL | Investigators | Part 1 |
| JADE DAGGER | LIGHTER or NOTEBOOK | Investigators | After Part 3 |
| BLACK LEDGER | TBD | Investigators or Occultists | After Part 3 |
| SEALED ENVELOPE | TBD | Mobsters | After Part 3 |
| IVORY MASK | TBD | Occultists | After Part 3 |
| SIGNET RING | TBD | Investigators or Mobsters | After Part 3 |
| DEAD DROP KEY | TBD | Mobsters or Occultists | After Part 3 |

---

## Named Entities Available to Other Factions

| Name | What It Is | Storyline Hooks |
|---|---|---|
| **Dane Kidd / Red Tie** | Thief's inside contact, runs the heist | Mysterious figure other factions might encounter |
| **The Crystal Eye** | Magical lens that reveals hidden things | Occultists (artifact), Investigators (parallel to Pale Flame) |
| **The Crimson Star** | 30-carat ruby hidden in the casino vault | Any faction — the casino's biggest secret |
| **The Snake's Study** | Vincent Vane's hidden office | Investigators (evidence), Mobsters (their boss's office) |

---

## Endgame

The thief's completion flag is `job done`. This feeds into a shared endgame across all factions (to be designed separately).

---

## Physical Items Checklist

- [ ] Pink neckerchief for Dane Kidd actor
- [ ] Red tie for Dane Kidd actor (reveal moment)
- [ ] Physical set list document with hidden code phrase (Part 2)
- [ ] 6 QR codes for heist targets (Part 2) — printed and placed at venue
- [ ] 1 QR code for The Snake's Study (Part 3) — placed on hidden door/panel
- [ ] Vault room prepared: dark, locked, 6 QR codes placed inside at varying heights/positions
- [ ] Vault room has a door that can be opened/closed by actor
- [ ] 90-second timer method ready (phone stopwatch)
- [ ] Dane Kidd actor briefed on all three parts (including vault room procedure)
- [ ] Game runner available to check player progress
