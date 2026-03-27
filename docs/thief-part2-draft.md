# Thief Part 2 — Finding the Man on the Inside

## Story Arc

The Thief has made it into the Broken Drum Casino and found the person wearing the Pink Neckerchief. Pink Neckerchief claims to be a friend of "the Man on the Inside" and sends the Thief on a proving mission: find the crystal eye, then steal 6 items from around the casino by scanning hidden QR codes. The twist — Pink Neckerchief *is* the Man on the Inside, and the final puzzle spells that out.

## Voice Guide

The Thief's internal monologue is **cocky, observational, and self-amused**. Short punchy sentences. They're always casing the room — noticing exits, pockets, who's watching. They enjoy the game. Think heist-movie narration meets 1920s street smarts. Lighter tone than the Investigator's noir brood or the Occultist's introspection. This person is having fun.

## Prerequisites from Part 1

- **Flag:** `in the broken drum`
- **Clues held:** INSTRUMENT, LOCKPICKS, optionally SHIPPING MANIFEST

---

## Flow

### Beat 1: "pink neckerchief" — The Contact (physical person)
The player finds a real person wearing a pink neckerchief at the venue.

**Page: "A Friend of a Friend"** (thief-only)
- **Requires flag:** `in the broken drum`
- **Grants flag:** `met the contact`

> **Physical element:** A document at the venue (poster, setlist, menu, etc.) contains the code phrase for the crystal eye page. The Thief must find it in the real world. Adapt the hint below to match.

**Content:**

Pink neckerchief. There they are. Leaning against the bar like they own the place. Maybe they do.

You sidle up. They don't look at you. Good — means they know you're there.

*"So you're the one."* A half-smile. *"A friend of mine says you're looking for someone. The Man on the Inside."*

You say nothing. That's a yes.

*"I can get you to him. But he doesn't meet just anyone. You need to prove you've got hands worth shaking."*

They slide a napkin across the bar. On it, a single line:

***"The house keeps their secrets in plain sight. Find the setlist pinned up backstage — your answer is between the lines."***

One task. Find the right tool for the job. Then come back.

Fine. You like scavenger hunts.

### Beat 2: "crystal eye" (or thief-specific equivalent)
**Page: "Tools of the Trade"** (thief-only or open)
- **Requires flag:** `met the contact`
- **Grants flag:** `has the crystal eye`
- **Page type:** `scanner` — enables QR code scanning

> **Design decision:** This could be the same crystal eye page as the Investigator's with a thief-specific version gated by `met the contact`, or a completely separate code phrase. Separate is probably cleaner since the flavour is different.

**Content:**

Well, well. Aren't you a pretty thing.

A lens. Looks old — older than this building. But the way it catches the light tells you it's worth more than everything else in this room combined.

You pocket it. Obviously.

Through it, things look... different. Marks on walls. Symbols on people. Invisible ink for invisible hands.

This changes the game.

### Beat 3: Return to Pink Neckerchief — The Hit List
**Page: "Six Finger Discount"** (thief-only)
- **Requires flags:** `met the contact` + `has the crystal eye`
- **Grants flag:** `got the hit list`

> The hints guide the player to physical locations/people at the venue where QR codes are hidden. Adapt them to match your venue.

**Content:**

You flash the lens. Pink Neckerchief raises an eyebrow. Impressed? Hard to tell. These types don't give much away.

*"Alright. You found the eye. Now use it."*

They lean in close. Smoke and cologne.

*"Six things. Scattered across this place. People carrying them, places hiding them. Lift them all and bring them back to me. Then we'll talk about the Man on the Inside."*

They tick them off on their fingers:

A **corkscrew** — *"The bartender keeps one close. Don't let him see your hands."*
A **safe key** — *"Management's office, hanging on the coat rack like it doesn't matter."*
An **ID badge** — *"Security rotates every hour. Catch one on break."*
A **bottle** — *"Top shelf, behind the bar. The good stuff. A trophy."*
A **coin** — *"Lucky coin. The dealer at table 3 never lets it go. Until now."*
A **ledger** — *"The bookkeeper's pride and joy. She keeps it in her apron."*

Six targets. One eye. No second chances.

You love this part.

### Beats 4–9: The Six Scans (scan_target pages)
Each QR code, when scanned, is a `scan_target` page that grants the corresponding clue word.

| # | Code Phrase | Title | Requires Flag | Grants Clue |
|---|-----------|-------|---------------|-------------|
| 1 | corkscrew heist | "Uncorked" | `got the hit list` | CORKSCREW |
| 2 | safe key heist | "Pocketed" | `got the hit list` | SAFE KEY |
| 3 | id badge heist | "Borrowed" | `got the hit list` | ID BADGE |
| 4 | bottle heist | "Liberated" | `got the hit list` | BOTTLE |
| 5 | coin heist | "Lifted" | `got the hit list` | COIN |
| 6 | ledger heist | "Swiped" | `got the hit list` | LEDGER |

**Content for each:**

**"Uncorked"** (CORKSCREW):
Four seconds with his back turned. Three to grab it. One to breathe.

He won't miss it until closing. By then you'll be a ghost.

**"Pocketed"** (SAFE KEY):
Cold metal, warm pocket. Hanging there on the coat rack like it doesn't matter.

It matters now.

**"Borrowed"** (ID BADGE):
Photo doesn't look a thing like you. Good news — nobody checks. They see the lanyard, they see the badge, they see a person who belongs here.

You always belong here.

**"Liberated"** (BOTTLE):
Heavy. Expensive. The label alone is worth more than your rent.

You cradle it like a newborn. A very alcoholic newborn.

**"Lifted"** (COIN):
Warm from the dealer's grip. He's been rubbing it between hands all night. Nervous habit.

Your lucky coin now, friend.

**"Swiped"** (LEDGER):
Numbers, names, debts owed and favours bought. The bookkeeper guards this thing like scripture.

Knowledge is power. Power fits in your back pocket.

### Beat 10: Return to Pink Neckerchief — The Proof
**Page: "Lay Your Cards on the Table"** (thief-only)
- **Requires flag:** `got the hit list`

**Content:**

Six for six. Not bad for a night's work.

Pink Neckerchief is waiting where you left them. Same lean. Same half-smile. Like they knew you'd be back.

*"Well? Show me what you've got."*

**Prompt:** "Lay out your haul"
- **Template:** "I stole a _____, a _____, an _____, a _____, a _____ and a _____"
- **Answer:** CORKSCREW, SAFE KEY, ID BADGE, BOTTLE, COIN, LEDGER
- **On correct:** grants flag `proved yourself`
- **Success text:**

*"Not bad. Not bad at all."*

They pour you a drink from the bottle you just stole. Cheeky.

*"You want the Man on the Inside? Here's your codeword:* ***ORCHID****.*

*But I'm not going to tell you who to say it to. You're a thief — figure it out.*

*Take the **3rd** letter of your first take. The **4th** of your second. The **2nd** of your third. The **4th** of your fourth. The **3rd** of your fifth. The **2nd** of your sixth.*

*Spell it out. That's who you're looking for.*

*They've been closer than you think."*

> co**R**kscrew, saf**E** key, i**D** badge, bot**T**le, co**I**n, l**E**dger → **RED TIE**
>
> The player realises Pink Neckerchief is wearing a red tie (or the host swaps to one). They say "ORCHID" to them in real life. Part 2 complete.

### Beat 11: "orchid" — The Man on the Inside (spoken to Pink Neckerchief IRL)
**Page: "The Man on the Inside"** (thief-only)
- **Requires flag:** `proved yourself`
- **Grants flag:** `found the man on the inside`
- Could grant new clues or intel for future parts

**Content:**

The word hangs in the air between you. *Orchid.*

Pink Neckerchief — no. *Red Tie* — stops leaning. Stands up straight for the first time all night. The half-smile becomes a whole one.

*"Took you long enough."*

They straighten their tie. Red. Of course it's red. It's been red the whole time.

*"There is no Man on the Inside. There's just me. And now, there's you."*

They extend a hand.

*"Welcome to the real game."*

---

## Flag Progression Chain

```
(from Part 1) "in the broken drum"
  -> pink neckerchief (physical): grants "met the contact"
  -> crystal eye (code phrase from physical document): grants "has the crystal eye"
  -> pink neckerchief again: requires "met the contact" + "has the crystal eye" -> grants "got the hit list"
  -> 6x QR scans: each grants a clue (CORKSCREW, SAFE KEY, ID BADGE, BOTTLE, COIN, LEDGER)
  -> pink neckerchief final: prompt uses all 6 clues -> grants "proved yourself"
     -> success text reveals codeword ORCHID + spells RED TIE
  -> "orchid" (said to Red Tie IRL): grants "found the man on the inside"
```

## Clue Inventory at End of Part 2

- INSTRUMENT (still held from Part 1)
- LOCKPICKS (still held from Part 1)
- SHIPPING MANIFEST (optional, from Part 1)
- CORKSCREW, SAFE KEY, ID BADGE, BOTTLE, COIN, LEDGER (from the heist)
- Whatever Part 3 setup grants

---

## Future Ideas (not Part 2)

### Part 3+ — The Vault Job
- Find floorplans (records room)
- Get past security (use INSTRUMENT as band cover)
- Break into the vault (use LOCKPICKS + vault code)
- Steal the big diamond (THE KARACHI DIAMOND or similar)
- Escape

### Cross-Role Touchpoints
- The Thief may find info in the records room relevant to the Investigator's murder case (transaction records, names)
- The sub-basement might border occult territory — the Thief sees something strange they can mention to the Occultist
- The vault or records could contain evidence of the Mobster's dealings
- SHIPPING MANIFEST could be tradeable to other roles who need supply chain info

### Role Dynamics
- 4 roles: Investigator, Thief, Occultist, Mobster
- Same team, independent story arcs within the same casino
- Cross-role interaction is primarily clue trading and info sharing
- The Thief doesn't care about the murder but may gain useful intelligence as a byproduct of the heist
