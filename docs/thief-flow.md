# Thief Role - Game Flow Summary

## Overview

The Thief is a musician-disguised burglar infiltrating the Broken Drum Casino. They're dressed as a member of the house band and need to sneak in without drawing attention. Their contact inside is someone wearing a pink neckerchief. Part 1 covers getting into the casino.

## Starting Inventory

On entering code "start", the thief receives:
- **CIGARETTE** — tradeable to other roles (the Investigator needs this)
- **INSTRUMENT** — fits the band member cover
- **LOCKPICKS** — core thief tool (unused in Part 1, presumably key for Part 2)

## Key Design Notes

- The Thief starts with clues that other roles need (CIGARETTE for the Investigator), establishing early cross-role trading
- The $5 BILL needed to bribe the Chef must come from another role (the Investigator starts with it) — another trade dependency
- The deliveries entrance is a dead-end/optional path that rewards exploration with a SHIPPING MANIFEST clue
- The "Pink Neckerchief" contact is a physical element — no digital page exists for this code phrase

---

## Part 1 — Getting into the Broken Drum Casino

**Folder:** "Part 1 - getting into the Broken Drum Casino" (folder_id: 6, parent: folder_id 4 "Thief Pages")

### Step 1: "start"
**Page: "Double time swing"** (thief-only)
- No prerequisites
- Scene: heavy rain, the thief is dressed as a band member. Can't use the front doors — needs to find a side entrance
- **Grants clues:** CIGARETTE, INSTRUMENT, LOCKPICKS
- **Links to:** `[[deliveries entrance]]`, `[[staff door]]`

### Step 2a (optional): "deliveries entrance"
**Page: "Input/Output"** (open — all roles)
- No prerequisites
- A dead-end: a shipment has come in blocking the way. The thief swipes a clipboard out of habit
- **Grants clues:** SHIPPING MANIFEST
- No flags granted — doesn't advance the main path

### Step 2b (main path): "staff door"
**Page: "Part of the crew"** (thief-only)
- No prerequisites
- The thief enters through the staff door and encounters a Chef on a smoke break
- The Chef is suspicious and asks who the thief's shift manager is
- The thief needs to bribe him but doesn't have cash
- **Prompt:** "How do you shut him up?" — template: "I bribe the Chef with a _____"
  - **Answer:** $5 BILL
  - **On correct:** grants flag `in through the staff door`, removes clue $5 BILL
  - **Success text:** "A smirk crosses his ugly face as you produce that green gold from your pocket. 'Oh well why didn't you say so, welcome to the [[Broken Drum]]'"

> **Cross-role dependency:** The $5 BILL is not in the Thief's starting inventory. The Investigator starts with it. Players must trade.

### Step 3: "broken drum"
**Page: "Welcome to the Broken Drum Casino"** (thief-only)
- **Requires flag:** `in through the staff door` (hint: "Still need to find a way in without anyone noticing or caring")
- The casino is poorly lit and busy — perfect for the thief. They need to find their contact wearing a pink neckerchief
- **Grants flag:** `in the broken drum`
- **Links to:** `[[Pink Neckerchief]]` (physical element — no digital page, the player must find a real person)

---

## Flag Progression Chain

```
(start) -> grants clues: CIGARETTE, INSTRUMENT, LOCKPICKS
  -> deliveries entrance (optional): grants clue SHIPPING MANIFEST
  -> staff door: prompt requires $5 BILL (from Investigator) -> grants "in through the staff door"
  -> broken drum: requires "in through the staff door" -> grants "in the broken drum"
  -> Pink Neckerchief: physical element (Part 1 ends here)
```

## Cross-Role Dependencies

1. **$5 BILL** — needed to bribe the Chef. Comes from the Investigator's starting inventory. Must be traded.
2. **CIGARETTE** — the Thief starts with this. The Investigator needs it for their "smoke" prompt. Trading this for the $5 BILL is the natural early exchange.

## Clue Inventory at End of Part 1

Assuming the player traded CIGARETTE for $5 BILL and explored both entrances:
- ~~CIGARETTE~~ (traded away)
- INSTRUMENT (still held)
- LOCKPICKS (still held)
- ~~$5 BILL~~ (used to bribe Chef)
- SHIPPING MANIFEST (from deliveries entrance, if explored)

## Open Questions for Part 2

- What does the Pink Neckerchief contact set in motion?
- What role do LOCKPICKS, INSTRUMENT, and SHIPPING MANIFEST play?
- Does the Thief descend into the underground warren like the Investigator, or operate on a different floor?
- What is the Thief's relationship to Mr. Sage / the murder — are they involved, or do they stumble into it?
