# Investigator Faction — Story Reference

## Voice

1920s noir detective internal monologue. Second-person, gender-neutral. World-weary, cynical, sensory. Think Raymond Chandler, *The Big Sleep*, *The Maltese Falcon*. Short punchy observations. Everything filtered through someone who's seen too much and trusts too little.

## Premise

The player is a private detective hired by Mrs. Sage to find her missing husband. The trail leads to the Broken Drum Casino. What starts as a missing-person case becomes a murder investigation when the detective finds Sage dead in the Green Room.

## Key NPCs

- **Mrs. Sage** — the client. Beautiful, wealthy. Hired the detective. Mentioned but never seen.
- **Jennette Orilae** — old contact who works in the private rooms downstairs. Nervous, guarded. Directs the player to Madame Web.
- **Madame Web** — tarot reader in the basement. Genuinely has eldritch powers (not a con artist). Candles flicker when she speaks, her shadow doesn't match her shape. Guides the detective and gives them the Pale Flame.
- **Mr. Sage** — the victim. Accountant. Found dead in the Green Room. Ghost tethered to a staff member.
- **Vincent Vane / "The Viper"** — the casino's fixer. Killed Sage. Runs rigged private games. Has a hit list.

## The Murder

Mr. Sage was an accountant who noticed the Broken Drum's private card games were rigged. The casino was laundering money through phantom winners. Sage took a page from the shadow ledger as proof and tried to blackmail the casino. Vincent Vane ("the Viper"), the casino's fixer, lured him to the Green Room and killed him with a jade-handled dagger. The room was cleaned, the staff told to forget.

## Special Mechanic: The Pale Flame (UV Light)

A UV torch given by Madame Web after discovering the body. It reveals hidden messages (code phrases in UV ink) around the physical room. This is the investigator's equivalent of the thieves' QR scanner — but the investigator *deduces* where the thief *collects*.

## Three-Part Structure

### Part 1 — Getting In (Tutorial)

The detective arrives at the casino, needs a smoke, trades for a lighter/cigarette, and enters the Broken Drum. Establishes the voice, the case, and the cross-faction trading mechanic.

### Part 2 — Finding the Body

Descends into the private rooms. Finds Jennette, who directs them to Madame Web. Solves the tarot/reversal puzzle. Madame Web sends them to the Green Room where they find Sage's body. Returns to Madame Web who gives them the Pale Flame. Uses it to find Sage's ghost tethered to a staff member.

### Part 3 — Who Killed Mr. Sage?

The detective speaks "Sage" to the ghost-host actor, who performs a fragmented testimony scene and gives the code phrase `the hunt begins`. From here, the detective uses the Pale Flame to find UV clues around the room — some are real leads, some are red herrings. Each real UV page grants a clue and a piece of the story. The detective trades with other factions for the remaining evidence. The finale is a 7-blank Cluedo-style accusation prompt.

## Flag Progression (All Parts)

```
Part 1:
  start → [NOTEBOOK, $5 BILL, PENCIL]
    → shelter → got out of the rain [+ LIGHTER]
      → smoke (prompt: LIGHTER + CIGARETTE) → had your fix [- CIGARETTE]
        → broken drum → in the broken drum

Part 2:
  → private rooms → in the warren
    → jennette orilae → spoke to jennette
      → madame web (page 35, unsolvable prompt — Moon hint)
      → bew emadam (reversed prompt: MAJOR ARCANA - THE MOON) → reversed the illusion
        → madame web (page 38) → consulted the mistress
          → green room → found mr. sage
            → madame web (page 40) → found the shell of mr. sage + the pale flame [- found mr. sage]
              → ghost (player finds via Pale Flame, speaks "Sage" to actor)

Part 3:
  the hunt begins → sage spoke [+ TORN PAGE]
  │
  ├─ snake eyes → found the viper [+ MARKED CARDS]
  ├─ last orders → heard the barkeep [+ BARKEEP'S NOTE]
  ├─ no witnesses → saw the cleanup [+ CLEANING ROTA]
  ├─ dead mans hand → saw the last hand [+ GREEN ROOM]
  ├─ the vipers nest (needs: found the viper) → knows the truth [+ HIT LIST]
  ├─ blood money → followed the money [+ BLOOD MONEY]
  │
  ├─ lucky streak → (dead end)
  ├─ house rules → (dead end)
  ├─ cold deck → (dead end)
  ├─ high roller → (dead end)
  ├─ after hours → (dead end)
  │
  ├─ [TRADING: get THE VIPER, JADE DAGGER, BLACK LEDGER from other factions]
  │
  └─ accusation (needs: sage spoke + knows the truth) → case closed
      [- THE VIPER, JADE DAGGER, GREEN ROOM, BLACK LEDGER, HIT LIST, BARKEEP'S NOTE, CLEANING ROTA]
```

## Clue Inventory Progression

| Point | Gained | Lost |
|---|---|---|
| Start (page 13) | NOTEBOOK, $5 BILL, PENCIL | |
| Shelter (page 18) | LIGHTER | |
| Smoke prompt (page 17) | | CIGARETTE |
| $5 BILL traded away during Part 1 | | $5 BILL |
| Ghost scene → `the hunt begins` | TORN PAGE | |
| UV: `snake eyes` | MARKED CARDS | |
| UV: `last orders` | BARKEEP'S NOTE | |
| UV: `no witnesses` | CLEANING ROTA | |
| UV: `dead mans hand` | GREEN ROOM | |
| UV: `the vipers nest` | HIT LIST | |
| UV: `blood money` | BLOOD MONEY | |
| Trade: Mobsters | THE VIPER | BLOOD MONEY (proposed) |
| Trade: Thieves | JADE DAGGER | LIGHTER or NOTEBOOK (proposed) |
| Trade: Occultists | BLACK LEDGER | TORN PAGE (proposed) |
| Accusation prompt (on success) | | THE VIPER, JADE DAGGER, GREEN ROOM, BLACK LEDGER, HIT LIST, BARKEEP'S NOTE, CLEANING ROTA |

## Known Issue

Page 41 (`ghost`) requires flag `pale flame` but page 40 grants `the pale flame`. Check this still resolves correctly.
