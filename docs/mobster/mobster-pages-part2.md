# Mobster Pages - Part 2: The Don's Test

All pages: `page_type: text`, `visible_to_roles: ["mobster"]` unless noted. All four pillars open simultaneously after meeting the Executor.

---

## Pillar 1: The Tables

### NEW - "Read the room" (code: `the tables`)

**Required flags:** `met the executor`
**Grants dirt:** 1 (random from pool)
**Text links:** `[[high stakes]]`

> The Don always said you can tell everything about a person by how they handle a losing hand. Do they sweat? Do they bluff? Do they flip the table and reach for a piece?
>
> Or do they smile, order another round, and take the next pot?
>
> The tables are where this casino makes its bread. Cards, coins, the whole song and dance. The Don ran this floor like a general runs a war. Every dealer, every shuffle, every odd tilted just enough to keep the house fat and the customers happy.
>
> You want the big chair? Show me you got the nerve for it.
>
> Time to play some [[high stakes]].

---

### NEW - "High stakes" (code: `high stakes`)

**page_type:** `coin_flip`
**game_config:** `{"target": 3}`
**Required flags:** `met the executor`
**Grants on win (claimed via /claim):** SPECIAL CHIP + flag `proved your nerve` + 1 dirt (random from pool)

> The coin hits the table. Heads or tails. Simple game. Oldest game there is.
>
> Don't let that fool you. The Don used to say that anyone who calls a coin flip "luck" don't understand probability, nerve, or the fine art of knowing when the universe owes you one.
>
> Three in a row. That's what it takes. That's what the Don would've done.

**Win text (suggested):** *"Three for three. The dealer slides something across the felt. A chip, but not a regular one. Heavy. Old. Got a picture stamped into the back, some kinda landmark. You've seen it in this casino. Find it."*

**Physical element:** The SPECIAL CHIP describes a recognisable feature of the venue (roulette wheel, a painting, the main bar, a chandelier, etc.). The player must find the matching physical object and discover a code phrase written near it. **Production note: decide on the physical landmark and write `the house edge` near/under it.**

---

### NEW - "The house always wins" (code: `the house edge`)

**Required flags:** `proved your nerve`
**Missing flag hint:** `"You haven't earned this yet."`
**Grants flags:** `read the chip`
**Grants clues:** WILL FRAGMENT
**Removes clues:** SPECIAL CHIP
**Grants dirt:** 1 (random from pool)

> There it is. Right where the chip said it'd be. And scratched into the surface, small enough that you'd miss it unless you were looking, a message from the old man himself.
>
> A torn scrap of the will. Not the whole thing. Not even close. But enough to know there's more hidden where this came from.
>
> The Don was a careful man. Hid pieces of his legacy all over this joint like a squirrel with trust issues. This fragment's a start, but you're gonna need help reading the rest. Someone with the right tools. The right light.
>
> Hold onto this. You'll know who to give it to when the time comes.

**Code phrase source:** Written near a physical landmark in the venue matching the SPECIAL CHIP description.

---

## Pillar 2: The Machines

### NEW - "Understand the machine" (code: `the machines`)

**Required flags:** `met the executor`
**Text links:** `[[lucky sevens]]`

> Every slot machine in this joint is a little money printer. Put a dollar in, the house keeps sixty cents, gives back forty, and the sucker thinks he had a good time.
>
> The Don understood that. Built half his empire on it. A man who can't see how the machine works got no business owning the machine.
>
> Time to pull the lever and see what comes up. Try your luck at [[lucky sevens]].

---

### NEW - "Lucky sevens" (code: `lucky sevens`)

**page_type:** `slot_machine`
**game_config:** `{"jackpot_chance": 20}`
**Required flags:** `met the executor`
**Grants on win (claimed via /claim):** OFFERING + flag `beat the house` + 1 dirt (random from pool)

> Three reels. One lever. The Don's favourite machine, kept behind the floor for VIPs only. They say it ain't been hit in years.
>
> They say a lot of things.

**Win text (suggested):** *"Jackpot. The reels line up and the machine spits out something that ain't coins. An old token, stamped with a symbol you don't recognise. Looks ceremonial. Looks old. Looks like the kind of thing that belongs to people who deal in candles and strange prayers. Interesting. Pocket it for now."*

---

## Pillar 3: The Floor

### NEW - "Delegation" (code: `the floor`)

**Required flags:** `met the executor`
**Text links:** `[[hiring]]`, `[[the hidden will]]`, `[[consult the spirits]]`

> The Don used to say: a boss who does his own dirty work ain't a boss. He's a janitor with a nicer suit.
>
> Three jobs need doing. Three jobs you ain't gonna handle yourself. That's what the other people in this casino are for. Find the right hands, grease the right palms, get the goods delivered.
>
> You need a [[thief|hiring]] to crack a lock. You need a [[snooper|the hidden will]] to read between the lines. And you need somebody who talks to [[the other side|consult the spirits]].
>
> Get it done. Don't get your hands dirty.

---

### #81 - "Keep your hands clean" (code: `hiring`)

*Exists in DB. Content rewritten below (second person, cleaned up). Prompt added for mission debrief.*

**Required flags:** `met the executor`
**Missing flag hint:** `"You don't know what you're looking for yet."`
**Grants clues:** FILING OFFICE KEY

> One of your boys put you in touch with somebody. Says they're the best in the biz, even did a couple jobs for the old man back in the day. Can break into anywhere and steal anything, for a price. Smart enough not to cross you, neither. A reputation like yours ain't easy to build.
>
> Here's the play. The Don's will got stashed in the Filing Office right here in the casino. Locked up tight. You need what's in there, but when that will turns up missing, all hell's gonna break loose. Ain't no chance you're getting caught near that mess with the whole family watching.
>
> Find a thief. Trade them the key. Let them do what they do. Then collect the goods.

**Prompt:** `The thief did their part. Show the Executor the _____`
**Answer:** DON'S SEAL
**Prompt grants flags:** `got the seal`
**Prompt grants dirt:** 1 (random from pool)

**Wrong answer hints:**

| Wrong answer | Hint text |
|---|---|
| FILING OFFICE KEY | `That's what you gave them. What did they bring back?` |

**Generic wrong text:** `The thief went into that office for you. What did they come back with?`
**Prompt success:** *"A wax seal with the Don's mark. The real deal. This is what makes the succession legitimate. The Executor gives you a nod. One job down."*

**Cross-faction flow:** Trade FILING OFFICE KEY to a Thief → they scan the `filing office` QR → they get DON'S SEAL → they trade it back. The thief gets paid in COOL SHADES, SWITCH BLADE, or whatever the mobster can spare.

---

### NEW - "The other half" (code: `the hidden will`)

**Required flags:** `met the executor`
**Missing flag hint:** `"You don't know what you're looking for yet."`

> You got a fragment of the will from the chip, but you know there's more. The Executor told you the Don left the real message hidden. Invisible ink on the back of the original document, right there in the casino for anyone to see. If they got the right light.
>
> You ain't got the right light. But you know who does. Those investigator types been walking around with some kind of fancy torch, shining it on everything that sits still. One of them reads that will for you, they'll see what you can't.
>
> Trade them the fragment. They'll know what to do with it. And when they bring back what it says, you make it worth their while. You got a name they need. A name that solves their little murder case. The Viper.

**Prompt:** `The investigator brought back the Don's message: _____`
**Answer:** DON'S FINAL WORD
**Prompt grants flags:** `read the will`
**Prompt grants dirt:** 1 (random from pool)

**Wrong answer hints:**

| Wrong answer | Hint text |
|---|---|
| WILL FRAGMENT | `That's what you gave them. What did they find written in the invisible ink?` |
| THE VIPER | `That's your payment to them, not what they owe you.` |

**Generic wrong text:** `An investigator with a UV light can read the back of the will. Give them the fragment, they give you what it says.`
**Prompt success:** *"The Don's final word. What he truly wanted for this family, written where only the right light could find it. The Executor reads it once, folds it, nods. Two down."*

**Cross-faction flow:** Trade WILL FRAGMENT to an Investigator → they use Pale Flame on the physical will prop → see UV code phrase `dons last wish` → type it in → page prompt requires WILL FRAGMENT → grants DON'S FINAL WORD → they trade it back. Mobster pays with THE VIPER (the investigator needs this for their Part 3 accusation).

---

### NEW - "Old friends on the other side" (code: `consult the spirits`)

**Required flags:** `met the executor`
**Missing flag hint:** `"You don't know what you're looking for yet."`

> The Don had advisors nobody talked about. Not the lawyers, not the accountants, not the muscle. Something else. Something that burned candles and spoke in tongues and told the old man things no living person shoulda known.
>
> You don't believe in that stuff. You also don't disbelieve in it, because the Don made a lot of very good calls for a man who shoulda been dead six times over.
>
> There's people in this casino who deal in that world. Strange folks. The kind who look at you like they can see your skeleton. One of them can tap into whatever the Don left behind on the other side.
>
> Give them something to work with. That old token from the machine, it's got their kind of stink on it. See what they bring back.

**Prompt:** `The spirits have spoken through the occultist: _____`
**Answer:** DON'S BLESSING
**Prompt grants flags:** `got the blessing`
**Prompt grants dirt:** 1 (random from pool)

**Wrong answer hints:**

| Wrong answer | Hint text |
|---|---|
| OFFERING | `That's what you gave them. What did they bring back from the other side?` |

**Generic wrong text:** `Find an occultist. Trade them the offering. Let them do their ritual. They'll bring something back.`
**Prompt success:** *"Something from beyond the veil. You don't understand it and you don't want to. But the Executor takes one look and his face changes. Whatever this is, it's real. Three for three."*

**Cross-faction flow:** Trade OFFERING to an Occultist → they use AR camera on the physical target image → page prompt requires OFFERING → grants DON'S BLESSING → they trade it back. Mobster payment TBD (coordinate with occultist designer).

**COORDINATION REQUIRED:** The occultist's AR page, target image, and trade payment need to be built with the occultist faction designer.

---

## Helper Pages (Cross-Faction)

These pages are NOT visible to mobsters. They exist so other factions can complete the mobster's missions.

### NEW - "The Filing Office" (code: `filing office`)

**page_type:** `scan_target` (QR code on a physical cabinet/door at the venue)
**visible_to_roles:** `["thief"]`
**Required flags:** `found the crystal eye`
**Missing flag hint:** `"You can't get in here without the right tools."`

> Locked. Naturally. But the key fits clean and the door swings open like it's been waiting.
>
> Inside: filing cabinets, dust, and the stale air of a room nobody visits on purpose. You find what you're looking for in the third drawer. A document with a heavy wax seal. The Don's personal mark, pressed into crimson.
>
> You don't know what it means. You don't need to. The job is the job. Grab it and get back to your employer.

**Prompt:** `I use the _____ to open the filing cabinet`
**Answer:** FILING OFFICE KEY
**Prompt grants clues:** DON'S SEAL
**Prompt removes clues:** FILING OFFICE KEY

**Prompt success:** *"The seal breaks free of the drawer. Heavy paper, old wax, and the smell of cigar smoke baked into the fibres. Whatever this is, it matters to somebody. Take it back."*

**Physical element:** QR code placed on a cabinet, door, or staff-area prop at the venue.

---

### NEW - "The Don's last wish" (code: `dons last wish`)

**visible_to_roles:** `["investigator"]`
**Required flags:** `the pale flame`
**Missing flag hint:** `"You need a way to see what's hidden."`
**Code phrase source:** Written in UV ink on the back of the physical will document.

> The Pale Flame catches something on the back of this old document. Not just a watermark. Words. Sentences. A whole message, hidden in ink that only this light can show.
>
> It's a letter. From someone called Don Kay. Written to whoever proved sharp enough to find it.
>
> The handwriting is shaky but deliberate. A dying man's last instructions, meant for eyes that earned the right to read them.
>
> Someone out there needs to hear what this says.

**Prompt:** `I examine the document with the _____`
**Answer:** WILL FRAGMENT
**Prompt grants clues:** DON'S FINAL WORD
**Prompt removes clues:** WILL FRAGMENT

**Prompt success:** *"The fragment completes the picture. The Don's final word, his true wishes for the family, laid bare in invisible ink. This means nothing to you, but it'll mean everything to whoever sent you here. Take it back."*

**Physical element:** The code phrase `dons last wish` must be written in UV ink on the back of the physical will document. The investigator discovers it with their Pale Flame torch.

---

### NEW - Occultist AR page (code: TBD)

**page_type:** `ar`
**visible_to_roles:** `["occultist"]`
**Required flags:** TBD (coordinate with occultist faction designer)
**game_config:** `{"target_file_url": "/targets/dons-legacy.mind", "briefing_text": "Something old calls to you from this place...", "hold_duration": 3}`

> *Content TBD. Coordinate with occultist faction designer.*
>
> The AR entity should display text or a symbol connected to Don Kay's spiritual legacy. On claim, the page grants access to the prompt below.

**Prompt:** `I channel the spirits with the _____`
**Answer:** OFFERING
**Prompt grants clues:** DON'S BLESSING
**Prompt removes clues:** OFFERING

**Prompt success:** *"The offering is consumed. Something answers. You don't understand the words, but you understand the weight. Take this back to whoever asked for it."*

**COORDINATION REQUIRED:**
- Target image design + `.mind` file compilation
- Physical placement in venue
- Occultist required flags (must have their AR mechanic unlocked)
- What the occultist receives as payment from the mobster

---

## Pillar 4: The Board

### NEW - "Family standings" (code: `the board`)

**page_type:** `leaderboard` (new page type, see Code Changes in mobster-story.md)
**Required flags:** `met the executor`

> In this family, reputation is the only currency that don't depreciate.
>
> *[Dynamic leaderboard: all mobster players ranked by dirt count, least to most]*

This page can be visited any time. It is also shown automatically whenever a player receives dirt (as part of the immediate-send flow).

---

## Summary Table

### Pillar 1: The Tables

| Code Phrase | Title | Type | Flags Required | Flags Granted | Clues Granted | Clues Consumed | Dirt |
|---|---|---|---|---|---|---|---|
| `the tables` | Read the room | text | `met the executor` | — | — | — | 1 |
| `high stakes` | High stakes | coin_flip | `met the executor` | `proved your nerve` | SPECIAL CHIP | — | 1 |
| `the house edge` | The house always wins | text | `proved your nerve` | `read the chip` | WILL FRAGMENT | SPECIAL CHIP | 1 |

### Pillar 2: The Machines

| Code Phrase | Title | Type | Flags Required | Flags Granted | Clues Granted | Dirt |
|---|---|---|---|---|---|---|
| `the machines` | Understand the machine | text | `met the executor` | — | — | — |
| `lucky sevens` | Lucky sevens | slot_machine | `met the executor` | `beat the house` | OFFERING | 1 |

### Pillar 3: The Floor

| Code Phrase | Title | Flags Required | Flags Granted | Clues Granted | Clues Consumed | Dirt |
|---|---|---|---|---|---|---|
| `the floor` | Delegation | `met the executor` | — | — | — | — |
| `hiring` | Keep your hands clean | `met the executor` | `got the seal` (prompt) | FILING OFFICE KEY (page), DON'S SEAL consumed by prompt | — | 1 |
| `the hidden will` | The other half | `met the executor` | `read the will` (prompt) | — | — | 1 |
| `consult the spirits` | Old friends on the other side | `met the executor` | `got the blessing` (prompt) | — | — | 1 |

### Helper Pages (Cross-Faction)

| Code Phrase | Title | Visible To | Type | Prompt Key | Grants |
|---|---|---|---|---|---|
| `filing office` | The Filing Office | thief | scan_target | FILING OFFICE KEY | DON'S SEAL |
| `dons last wish` | The Don's last wish | investigator | text (UV) | WILL FRAGMENT | DON'S FINAL WORD |
| TBD | TBD | occultist | ar | OFFERING | DON'S BLESSING |

### Pillar 4: The Board

| Code Phrase | Title | Type | Flags Required |
|---|---|---|---|
| `the board` | Family standings | leaderboard | `met the executor` |
