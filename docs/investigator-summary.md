# Investigator Faction — Summary (Parts 1 & 2)

## Premise

The player is a private detective hired by Mrs. Sage to find her missing husband, Mr. Sage. The trail leads to the Broken Drum Casino. What starts as a routine missing-person case becomes a murder investigation when the detective finds Sage dead in the Green Room. The story is told in second-person noir internal monologue — world-weary, cynical, sensory, gender-neutral.

## Special Mechanic: The Pale Flame (UV Light)

The investigator's unique midgame tool is a UV torch called **the Pale Flame**, given to them by Madame Web after they discover Mr. Sage's body. It reveals hidden messages (code phrases written in UV ink) around the physical room. Players shine the light on surfaces to find new code phrases they can type into the app, unlocking new pages and advancing the investigation. This is the investigator equivalent of the thieves' QR scanner fetch quest.

## Key NPCs

- **Mrs. Sage** — the client. Beautiful, wealthy. Hired the detective to find her husband. Mentioned but never seen.
- **Jennette Orilae** — old contact who works in the private rooms downstairs. Nervous, guarded. Directs the player to Madame Web.
- **Madame Web** — tarot reader/seer in the basement. Genuinely has mysterious, eldritch powers (not a con artist). Knows things she shouldn't, candles flicker when she speaks, her shadow doesn't match her shape. Guides the detective through the investigation and ultimately gives them the Pale Flame.
- **Mr. Sage** — the victim. Found dead in the Green Room. His ghost/soul is somehow tethered to a staff member, discoverable via the Pale Flame.

## Page-by-Page Flow

### Part 1: Getting In (Tutorial)

---

**Page 13 — "A long dark night"** (code: `start`)

Opening. Detective arrives at the casino steps in the rain. Establishes Mrs. Sage, the case, the voice.

- Grants clues: NOTEBOOK, $5 BILL, PENCIL
- Text links to: `[[smoke]]`

---

**Page 18 — "Undercover, again"** (code: `shelter`)

Player finds shelter from rain. Cigarettes are soaked but lighter is dry — they have a lighter but nothing to smoke. Nudges toward trading.

- Grants flag: `got out of the rain`
- Grants clue: LIGHTER
- No text links (player needs to go back to `smoke` which is now accessible)

---

**Page 17 — "Time to clear your mind"** (code: `smoke`)

Player has cigarettes narratively but no lighter — needs to trade with other players to get one.

- Requires flag: `got out of the rain`
- Missing flag hint: *"Need to find some [[shelter]]"*
- **Prompt:** `I use my _____ to light my _____` → Answer: LIGHTER, CIGARETTE
- **Prompt success text:** *"Three deep breaths in. Much better. Time to cross the threshold of the [[Broken Drum]]."*
- Prompt grants flag: `had your fix`
- Prompt removes clue: CIGARETTE

---

**Page 19 — "Welcome to the Broken Drum Casino"** (code: `broken drum`)

The detective enters the casino proper. Chandeliers, champagne, socialites. Cases the room.

- Requires flag: `had your fix`
- Missing flag hint: *"I can't think straight yet, need to [[smoke]]"*
- Grants flag: `in the broken drum`
- Text links to: `[[Mr. Sage]]` (directs player to ask around)

---

### Part 2: The Investigation

---

**Page 31 — "Downstairs"** (code: `private rooms`)

Descend into the private rooms below the casino. Darker, quieter, shadier. Player needs to remember the name of a contact who works down here — the text says "There's a name rattling around in the back of your mind" but doesn't give it directly.

- Grants flag: `in the warren`
- No text links (player must recall or discover `jennette orilae`)

---

**Page 32 — "An island in the tempest"** (code: `jennette orilae`)

Jennette is nervous, scanning for someone. Directs the player to Madame Web.

- Requires flag: `in the warren`
- Missing flag hint: *"She doesn't seem to be around right now"*
- Grants flag: `spoke to jennette`
- Text links to: `[[Madame Web]]`

---

**Page 35 — "The Mistress of Mysteries"** (code: `madame web`)

First encounter with Madame Web. Beaded curtain, incense, cards, candles that burn too steady. She tells you to sit. You sit. This is the tarot puzzle page.

- Requires flag: `spoke to jennette`
- Missing flag hint: *"You don't know where to find her"*
- **Prompt:** `I show her the _____` → Answer: UNOBTAINABLE (this prompt is deliberately unsolvable)
- **Wrong answer hint for "MAJOR ARCANA - THE MOON":** *"The Moon. But you are not looking for more mysteries. Maybe this isn't the question you seek."*
- The Moon is correct thematically but wrong mechanically — hint tells the player to invert. In tarot, inverting = reversing the card. This clues players to reverse the code phrase `madame web` → `bew emadam`
- No text links (the puzzle IS the progression)

---

**Page 33 — "seiretsyM fo ssertsiM ehT"** (code: `bew emadam`)

The reversed page. All text is written backwards. Same room but *wrong* — candles burn downward, smoke sinks, cards are all blank and face-up, Madame Web's shadow has too many edges and doesn't match her shape, her lips don't move when she speaks. The player sits involuntarily.

- Requires flags: `in the warren`, `spoke to jennette`
- Missing flag hints (also reversed): *"eb thgim ehs erehw wonk t'nod uoY"*, *"reh tuoba erom uoy llet nac ohw enoemos dnif ot deen uoY"*
- **Prompt (reversed):** `_____ eht reh wohs I` → Answer: MAJOR ARCANA - THE MOON
- **Prompt success text:** *"She places a single card face-down on the table. You reach for it. She shakes her head. 'Not here. Go back. The way you came. She is waiting for you on the other side.' She means herself. The other her. The right-way-round her. Find [[Madame Web]]."*
- Prompt grants flag: `reversed the illusion`
- No text links (the redirect to `madame web` is in the prompt success text)

---

**Page 38 — "The Woman Who Knows"** (code: `madame web`)

Second real encounter with Madame Web, unlocked after solving the reversal puzzle. She knows the detective's name without being told. She directs them to the Green Room. No item given — just information.

- Requires flag: `reversed the illusion`
- Grants flag: `consulted the mistress`
- Text links to: `[[Green Room]]`

---

**Page 39 — "The Green Room"** (code: `green room`)

The murder discovery — biggest story beat so far. Mr. Sage is dead on the floor. No weapon, no note, scene has been cleaned. The champagne turns sour. Three days ago a beautiful woman asked you to find her husband. You found him. The room has no answers.

- Requires flag: `consulted the mistress`
- Missing flag hint: *"You don't have any reason to go here"*
- Grants flag: `found mr. sage`
- Text links to: `[[Madame Web]]`

---

**Page 40 — "Dead End"** (code: `madame web`)

Madame Web gives the detective **the Pale Flame**. She explains it reveals hidden writing — secrets written in ink only this light can show. The detective clicks it on and sees marks on the walls of her parlour. Words. Hidden in plain sight. Directs the player to investigate the mob (the casino owners). Ends with: *"Your mother always said you should have been a dentist."*

- Requires flags: `consulted the mistress`, `found mr. sage`
- Grants flags: `found the shell of mr. sage`, `the pale flame`
- Removes flag: `found mr. sage`
- Text links to: `[[pale flame]]`

---

**Page 41 — "The Man Behind the Man"** (code: `ghost`)

Found via UV ink code phrase written somewhere in the physical room. Through the Pale Flame, a staff member shimmers with a double-exposure second shape — Mr. Sage's ghost, trapped and tethered. Player is told to call his name.

- Requires flags: `found the shell of mr. sage`, `pale flame`
- Missing flag hints: *"You see something strange, but you don't understand what."*, *""* (second hint empty)
- No text links (player must act on the instruction to "call his name" — presumably a code phrase)

---

## Clue Inventory Progression

| Point in story | Clues held |
|---|---|
| Start (page 13) | NOTEBOOK, $5 BILL, PENCIL |
| After shelter (page 18) | + LIGHTER |
| After smoke prompt (page 17) | − CIGARETTE (note: CIGARETTE is never granted, see below) |

**Note:** The detective narratively "has cigarettes" but CIGARETTE is never granted as a clue, they must trade foer it — the smoke prompt removes it anyway. The $5 BILL, NOTEBOOK, and PENCIL are presumably tradeable items for the cross-faction economy. The $5 BILL is traded away during part 1. LIGHTER is obtained from shelter and used in the smoke prompt but is not removed.

## Flag Progression

```
start
  → shelter → got out of the rain
    → smoke (prompt: LIGHTER + CIGARETTE) → had your fix
      → broken drum → in the broken drum
        → private rooms → in the warren
          → jennette orilae → spoke to jennette
            → madame web (page 35, unsolvable prompt — Moon hint)
            → bew emadam (reversed prompt: MAJOR ARCANA - THE MOON) → reversed the illusion
              → madame web (page 38) → consulted the mistress
                → green room → found mr. sage
                  → madame web (page 40) → found the shell of mr. sage + the pale flame (removes: found mr. sage)
                    → mr. sage's ghost (found via UV in physical room) → Part 3 begins
```

## What's Set Up for Part 3

- The detective has the Pale Flame (UV torch) and knows the mob (casino owners) are the prime suspects
- Mr. Sage's ghost is tethered to a staff member — calling his name presumably advances the story
- The UV mechanic is live — players can now explore the physical room finding hidden code phrases written in UV ink
- The investigation needs to narrow from "the mob did it" to identifying specific suspects and uncovering the motive
- The eldritch/occult layer is established through Madame Web — the supernatural is real in this world, which connects to the Occultist faction's storyline
