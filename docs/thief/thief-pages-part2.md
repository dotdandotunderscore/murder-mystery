# Thief Pages — Part 2: Finding the Man on the Inside

All pages: `page_type: text`, `visible_to_roles: ["thief"]` unless noted

---

## #47 — "A Friend of a Friend" (code: `dane kidd`)

**Required flags:** `in the broken drum`
**Missing flag hint:** `"You need to get inside first"`
**Grants flags:** `met the contact`

> Dane Kidd. Tall guy. Leaning against the bar like they own the place. Maybe they do.
>
> You sidle up. They don't look at you. Good - means they know you're there.
>
> *"So you're the one."* A half-smile. *"A friend of mine says you're looking for someone. The Man on the Inside."*
>
> You say nothing. That's a yes.
>
> *"I can get you to him. But he doesn't meet just anyone. You need to prove you've got hands worth shaking."*
>
> They slide a napkin across the bar. On it, a single line:
>
> ***"The house keeps their secrets in plain sight. Find the set list pinned up backstage - your answer is between the lines."***
>
> One task. Find the right tool for the job. Then come back.
>
> Fine. You like scavenger hunts.

**No text links.** Player must physically find a set list document at the venue containing the code phrase for the crystal eye page.

---

## #48 — "Tools of the Trade" (code: `---set list clue`)

**Required flags:** `met the contact`
**Grants flags:** `found the crystal eye`

> Well, well. Aren't you a pretty thing. "The [[crystal eye]]".
>
> A lens. Looks old - older than this building. But the way it catches the light tells you it's worth more than everything else in this room combined.
>
> You pocket it. Obviously.
>
> Through it, things look... different. Marks on walls. Symbols on people. Invisible ink for invisible hands.
>
> This changes the game.

**Note:** Code phrase `---set list clue` is a placeholder. The real code phrase will be whatever is hidden in the physical set list document at the venue.

---

## #24 — "The Crystal Eye" (code: `crystal eye`)

**page_type:** `scanner`
**visible_to_roles:** null (open)
**Required flags:** `found the crystal eye`
**Missing flag hint:** `"You haven't found this yet"`

This is the QR scanner page. Once unlocked, the thief can scan QR codes on physical objects around the venue.

---

## #49 — "Six Finger Discount" (code: `dane kidd`)

**Required flags:** `met the contact`, `found the crystal eye`
**Grants flags:** `got the hit list`

> You flash the lens. The Kidd raises an eyebrow. Impressed? Hard to tell. These types don't give much away.
>
> *"Alright. You found the eye. Now use it."*
>
> They lean in close. Smoke and cologne.
>
> *"Six things. Scattered across this place. People carrying them, places hiding them. Lift them all and bring them back to me. Then we'll talk about the Man on the Inside."*
>
> They tick them off on their fingers:
>
> A **corkscrew** — *"The bartender keeps one close. Don't let him see your hands."*
> A **safe key** — *"Management's office, hanging on the coat rack like it doesn't matter."*
> An **ID badge** — *"Security rotates every hour. Catch one on break."*
> A **bottle** — *"Top shelf, behind the bar. The good stuff. A trophy."*
> A **coin** — *"Lucky coin. The dealer at table 3 never lets it go. Until now."*
> A **ledger** — *"The bookkeeper's pride and joy. She keeps it in her apron."*
>
> Six targets. One eye. No second chances.
>
> You love this part.

**No text links.** Player must physically find and scan QR codes.

---

## The Six Heists (QR Scan Targets)

All six are `page_type: scan_target`, `visible_to_roles: ["thief"]`, require flag `got the hit list`.

### #50 — "Uncorked" (code: `corkscrew heist`)

**Grants flags:** `uncorked`
**Grants clues:** CORKSCREW

> Four seconds with his back turned. Three to grab it. One to breathe.
>
> He won't realise its gone until closing. By then you'll be a ghost.

### #51 — "Pocketed" (code: `safe key heist`)

**Grants flags:** `pocketed`
**Grants clues:** SAFE KEY

> Cold metal, warm pocket. Hanging there on the coat rack like it doesn't matter.
>
> It matters now.

### #52 — "Borrowed" (code: `id badge heist`)

**Grants flags:** `borrowed`
**Grants clues:** ID BADGE

> Photo doesn't look a thing like you. Good news - nobody checks. They see the lanyard, they see the badge, they see a person who belongs here.
>
> You always belong here.

### #53 — "Liberated" (code: `bottle heist`)

**Grants flags:** `liberated`
**Grants clues:** BOTTLE

> Heavy. Expensive. The label alone is worth more than your rent.
>
> You cradle it like a newborn. A very alcoholic newborn.

### #54 — "Lifted" (code: `coin heist`)

**Grants flags:** `lifted`
**Grants clues:** COIN

> Warm from the dealer's grip. He's been rubbing it between hands all night. Nervous habit.
>
> Your lucky coin now, friend.

### #55 — "Swiped" (code: `ledger heist`)

**Grants flags:** `swiped`
**Grants clues:** LEDGER

> Numbers, names, debts owed and favours bought. The bookkeeper guards this thing like scripture.
>
> Knowledge is power. Power fits in your back pocket.

---

## #56 — "Lay Your Cards on the Table" (code: `dane kidd`)

**Required flags:** `got the hit list`, `uncorked`, `pocketed`, `borrowed`, `liberated`, `lifted`, `swiped`

**Six prompts** (one per heist item):

| Prompt | Answer | Success Text |
|---|---|---|
| `I uncorked a _____` | CORKSCREW | `3` |
| `I pocketed a _____` | SAFE KEY | `4` |
| `I borrowed an _____` | ID BADGE | `2` |
| `I liberated a _____` | BOTTLE | `4` |
| `I lifted a _____` | COIN | `3` |
| `I swiped a _____` | LEDGER | `2` |

**The cipher:** Each success text is a number — the position of a letter in the answer word:
- co**R**kscrew (3rd) → R
- saf**E** key (4th) → E
- i**D** badge (2nd) → D
- bot**T**le (4th) → T
- co**I**n (3rd) → I
- l**E**dger (2nd) → E

Spells: **RED TIE**

**Content:**

> Six for six. Not bad for a night's work.
>
> Kidd is waiting where you left them. Same lean. Same half-smile. Like they knew you'd be back.
>
> *"Not bad. Not bad at all."*
>
> They pour you a drink from the bottle you just stole. Cheeky.
>
> *"You want the Man on the Inside? Here's your codeword:* ***ORCHID****.*
>
> *But I'm not going to tell you who to say it to. You're a thief - figure it out.*
>
> *They've been closer than you think."*

**Physical resolution:** The player decodes the numbers from the prompt success texts, extracts letters from the heist item names, spells RED TIE, and realises Dane Kidd is (or is wearing) the red tie. They say "ORCHID" to the actor in person. Part 2 ends here.

---

## Summary Table

| Page | Code Phrase | Title | Flags Required | Flags Granted | Clues Granted | Type |
|---|---|---|---|---|---|---|
| 47 | `dane kidd` | A Friend of a Friend | `in the broken drum` | `met the contact` | — | Contact |
| 48 | `---set list clue` | Tools of the Trade | `met the contact` | `found the crystal eye` | — | Physical clue |
| 24 | `crystal eye` | The Crystal Eye | `found the crystal eye` | — | — | Scanner |
| 49 | `dane kidd` | Six Finger Discount | `met the contact`, `found the crystal eye` | `got the hit list` | — | Hit list |
| 50 | `corkscrew heist` | Uncorked | `got the hit list` | `uncorked` | CORKSCREW | QR scan |
| 51 | `safe key heist` | Pocketed | `got the hit list` | `pocketed` | SAFE KEY | QR scan |
| 52 | `id badge heist` | Borrowed | `got the hit list` | `borrowed` | ID BADGE | QR scan |
| 53 | `bottle heist` | Liberated | `got the hit list` | `liberated` | BOTTLE | QR scan |
| 54 | `coin heist` | Lifted | `got the hit list` | `lifted` | COIN | QR scan |
| 55 | `ledger heist` | Swiped | `got the hit list` | `swiped` | LEDGER | QR scan |
| 56 | `dane kidd` | Lay Your Cards on the Table | all 7 heist flags | — | — | Cipher/reveal |
