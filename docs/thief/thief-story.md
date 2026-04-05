# Thief Faction — Story Reference

## Voice

1920s heist-movie internal monologue. Second-person, gender-neutral. Cocky, observational, self-amused. Short punchy sentences. They're always casing the room — noticing exits, pockets, who's watching. Think *Ocean's Eleven* meets 1920s street smarts. Lighter tone than the Investigator's noir brood. This person is having fun.

## Premise

The player is a professional thief disguised as a member of the Broken Drum Casino's house band. They've been hired for a job and need to find their contact inside — someone called "the Man on the Inside." The trail leads through Dane Kidd (a.k.a. Pink Neckerchief / Red Tie), who turns out to BE the Man on the Inside. The thief must prove themselves through a series of heists before being trusted with the real job.

## Key NPCs

- **Dane Kidd (Pink Neckerchief / Red Tie)** — the contact and the Man on the Inside. Leans against the bar, half-smiles, gives nothing away. Sends the thief on a proving mission. Wears a pink neckerchief initially; the Red Tie reveal happens when the thief solves the cipher at the end of Part 2.
- **The Chef** — staff member on a smoke break at the staff door. Suspicious. Can be bribed with a $5 BILL.
- **Vincent Vane / "The Viper"** — casino fixer (shared NPC). The thief may encounter evidence of his activities during Part 3.

## Special Mechanic: The Crystal Eye (QR Scanner)

A lens found via a physical clue (hidden in a set list backstage). When the thief "pockets" it, it unlocks the in-app QR scanner. This lets them scan QR codes on physical objects around the venue to "steal" items. The crystal eye is the thief's equivalent of the investigator's Pale Flame — where the investigator *deduces*, the thief *collects*.

## Three-Part Structure

### Part 1 — Getting In (Tutorial)

The thief arrives at the casino in the rain, dressed as a band member. Two entry options: deliveries entrance (dead end, optional SHIPPING MANIFEST) or staff door (main path, bribe the Chef with a $5 BILL traded from the Investigator). Establishes the voice, the cover story, and the cross-faction trading mechanic.

### Part 2 — Finding the Man on the Inside

The thief finds Dane Kidd (pink neckerchief) inside the casino. Kidd sends them to find the Crystal Eye (hidden in a physical set list). With the scanner unlocked, Kidd gives a hit list of 6 items to steal via QR codes around the venue. The final check-in uses a cipher — the success numbers on each prompt spell out "RED TIE," revealing that Dane Kidd IS the Man on the Inside. The codeword ORCHID completes the introduction.

### Part 3 — The Vault Job

Dane Kidd briefs the thief on the real job: steal THE CRIMSON STAR, a thirty-carat ruby locked in the owner's vault beneath the casino. Three layers of security — the stage (blend in with the band), a guarded corridor (badge and bribery), and a hidden office found via Crystal Eye (where the JADE DAGGER sits on the desk). Every heist item from Part 2 is consumed as a tool along the way. The vault itself is a physical dark room at the venue — an actor opens the door and gives the thief 90 seconds to scan as many QR codes as they can in near-darkness. The vault contains 6 items that every other faction needs something from: BLACK LEDGER, SEALED ENVELOPE, IVORY MASK, SIGNET RING, DEAD DROP KEY, and the CRIMSON STAR. The thief emerges as the most trade-rich faction in the game. Alarm goes off, escape through a vent, back to Dane Kidd. Job done.

## Flag Progression (All Parts)

```
Part 1:
  start → [CIGARETTE, INSTRUMENT, LOCKPICKS]
    → deliveries entrance (optional) → [SHIPPING MANIFEST]
    → staff door (prompt: $5 BILL) → in through the staff door [- $5 BILL]
      → broken drum → in the broken drum

Part 2:
  → dane kidd (physical: pink neckerchief) → met the contact
    → ---set list clue (physical: find set list backstage) → found the crystal eye
      → crystal eye (scanner page unlocked)
        → dane kidd (page 49) → got the hit list
          ├─ corkscrew heist (QR scan) → uncorked [+ CORKSCREW]
          ├─ safe key heist (QR scan) → pocketed [+ SAFE KEY]
          ├─ id badge heist (QR scan) → borrowed [+ ID BADGE]
          ├─ bottle heist (QR scan) → liberated [+ BOTTLE]
          ├─ coin heist (QR scan) → lifted [+ COIN]
          └─ ledger heist (QR scan) → swiped [+ LEDGER]
            → dane kidd (page 56, 6 prompts) → codeword ORCHID + cipher → RED TIE

Part 3:
  → orchid (said to Red Tie IRL) → actor gives `the real game`
    → the real game → briefed on the vault
      → encore (prompt: INSTRUMENT) → past the stage [- INSTRUMENT]
        → backstage pass (prompt: ID BADGE, BOTTLE) → past security [- ID BADGE, - BOTTLE]
          → the snakes study (QR scan, prompt: SAFE KEY, LEDGER) → got the combination [+ JADE DAGGER, - SAFE KEY, - LEDGER]
            → the vault (prompt: LOCKPICKS, COIN) → cracked the vault [- LOCKPICKS, - COIN]
              → VAULT ROOM (physical, 90 seconds, dark, actor-controlled):
              │   ├─ crimson star (QR scan) → [+ CRIMSON STAR]
              │   ├─ shadow ledger (QR scan) → [+ BLACK LEDGER]
              │   ├─ sealed orders (QR scan) → [+ SEALED ENVELOPE]
              │   ├─ ivory mask (QR scan) → [+ IVORY MASK]
              │   ├─ vipers ring (QR scan) → [+ SIGNET RING]
              │   └─ dead drop (QR scan) → [+ DEAD DROP KEY]
              └─ loose ends (prompt: CORKSCREW) → clean getaway [- CORKSCREW]
                  → dane kidd → job done
```

## Clue Inventory Progression

| Point | Gained | Lost |
|---|---|---|
| Start (page 20) | CIGARETTE, INSTRUMENT, LOCKPICKS | |
| Deliveries entrance (page 22, optional) | SHIPPING MANIFEST | |
| CIGARETTE traded to Investigator for $5 BILL | $5 BILL | CIGARETTE |
| Staff door prompt (page 21) | | $5 BILL |
| Crystal Eye set list (page 48) | (scanner unlocked) | |
| QR: corkscrew heist | CORKSCREW | |
| QR: safe key heist | SAFE KEY | |
| QR: id badge heist | ID BADGE | |
| QR: bottle heist | BOTTLE | |
| QR: coin heist | COIN | |
| QR: ledger heist | LEDGER | |
| End of Part 2 | Codeword ORCHID (verbal) | |
| Encore (Part 3) | | INSTRUMENT |
| Backstage Pass (Part 3) | | ID BADGE, BOTTLE |
| The Snake's Study (Part 3) | JADE DAGGER | SAFE KEY, LEDGER |
| The Vault (Part 3) | | LOCKPICKS, COIN |
| Vault Room: crimson star | CRIMSON STAR | |
| Vault Room: shadow ledger | BLACK LEDGER | |
| Vault Room: sealed orders | SEALED ENVELOPE | |
| Vault Room: ivory mask | IVORY MASK | |
| Vault Room: vipers ring | SIGNET RING | |
| Vault Room: dead drop | DEAD DROP KEY | |
| Loose Ends (Part 3) | | CORKSCREW |

**At end of Part 2:** INSTRUMENT, LOCKPICKS, SHIPPING MANIFEST (optional), CORKSCREW, SAFE KEY, ID BADGE, BOTTLE, COIN, LEDGER

**At end of Part 3:** CRIMSON STAR, JADE DAGGER, BLACK LEDGER, SEALED ENVELOPE, IVORY MASK, SIGNET RING, DEAD DROP KEY, SHIPPING MANIFEST (optional)

## Cross-Faction Dependencies

### Clues the Thief Needs

| Clue | From Faction | How |
|---|---|---|
| **$5 BILL** | Investigators | Investigators start with it; natural trade for CIGARETTE |

### Clues the Thief Can Trade Away

| Clue | Suggested Recipient | Why They'd Want It |
|---|---|---|
| **CIGARETTE** | Investigators | Needed for their "smoke" prompt (Part 1 trade) |
| **JADE DAGGER** | Investigators | The murder weapon — thief doesn't know this |
| **BLACK LEDGER** | Investigators + Occultists | Shadow financial records / occult debt book |
| **SEALED ENVELOPE** | Mobsters | Orders or evidence from the mob operation |
| **IVORY MASK** | Occultists | Ritual artifact connected to the supernatural layer |
| **SIGNET RING** | Investigators or Mobsters | Vincent Vane's personal seal |
| **DEAD DROP KEY** | Mobsters or Occultists | Access to a hidden stash (Locker 7) |
| **SHIPPING MANIFEST** | Mobsters? | Supply chain info (optional Part 1 clue) |

## Named Entities Available to Other Factions

| Name | What It Is | Storyline Hooks |
|---|---|---|
| **Dane Kidd / Red Tie** | The thief's inside contact | Could appear in other faction's storylines as a mysterious figure |
| **The Crystal Eye** | A magical lens that reveals hidden things | Occultists (artifact of power), Investigators (another way to see the hidden) |
