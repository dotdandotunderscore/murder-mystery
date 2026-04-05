# Thief Part 3 — The Vault Job

All pages are `page_type: text`, `visible_to_roles: ["thief"]` unless noted otherwise.

---

## Phase A: Getting In

### Page — "The Real Game"

**Code phrase:** `the real game`
**Code phrase source:** Given verbally by Dane Kidd actor after player says ORCHID

**Required flags:** `got the hit list`, `uncorked`, `pocketed`, `borrowed`, `liberated`, `lifted`, `swiped`
**Required flags hints:** `"You're not ready for this yet."`, `""`, `""`, `""`, `""`, `""`, `""`

**Grants flags:** `briefed on the vault`

**Content:**

> Kidd straightens up. No more leaning. No more half-smiles. This is business.
>
> *"You've got fast hands and a cool head. Good. You're going to need both."*
>
> They unfold a piece of paper on the bar. Floor plan. The Broken Drum's basement — not the bit the guests see. The bit underneath that.
>
> *"The Crimson Star. Heard of it?"*
>
> You haven't. Kidd smiles like that's the correct answer.
>
> *"Thirty-carat ruby. Been sitting in the owner's vault since this place opened. Nobody knows it's down there except the man who put it there. And me. And now you."*
>
> Three layers between you and the stone. The stage — your way into the back corridors. A security checkpoint. And the vault itself, behind a door that doesn't officially exist.
>
> *"Get to the stage. Blend in with the band. Then find your way down. I'll be here when you get back."*
>
> You fold the floor plan into your pocket. Thirty carats. That's a lot of reasons to be careful.
>
> Time for an [[encore]].

**Prompt:** None
**Text links:** `[[encore]]`

---

### Page — "Encore"

**Code phrase:** `encore`

**Required flags:** `briefed on the vault`
**Required flags hints:** `"You don't have a reason to be up here yet."`

**Grants flags:** (none — granted by prompt)

**Content:**

> The band is mid-set when you slide in. Trumpet, drums, piano, and now you. Nobody bats an eye — musicians come and go in a place like this. That's what makes it perfect.
>
> You play. Not well, not badly. Just enough to belong. The music covers everything — the sound of your feet shifting toward the wings, the click of a door you shouldn't be opening, the quiet thud of your heart doing something it hasn't done in a while.
>
> Enjoying itself.
>
> The last note rings out. Applause. You take a bow nobody sees.

**Prompt:** `I take my place with my _____`
**Answer:** INSTRUMENT
**Prompt grants flag:** `past the stage`
**Prompt removes clue:** INSTRUMENT

**Wrong answer hints:**

| Wrong answer | Hint text |
|---|---|
| LOCKPICKS | `Save those for later. Right now you need to look like you belong in a band.` |
| CORKSCREW | `Nobody plays a corkscrew. Not even in this band.` |
| ID BADGE | `Credentials won't help you here. You need to look the part, not flash a badge.` |

**Generic wrong text:** `You're joining a band. What would a musician bring on stage?`

**Prompt success text:** *"The set ends. The crowd claps for the music. You clap for the timing. The curtain's right there and nobody's watching the wings. You slip through like smoke. Welcome [[backstage|backstage pass]]."*

---

### Page — "Backstage Pass"

**Code phrase:** `backstage pass`

**Required flags:** `past the stage`
**Required flags hints:** `"You need to get past the stage first."`

**Grants flags:** (none — granted by prompt)

**Content:**

> The corridor behind the stage smells like sweat and stale beer and ambition. Dressing rooms. Storage. A fire exit nobody's opened in years.
>
> And a door marked STAFF ONLY with a keycard reader and a little red light that says *not you*.
>
> Good thing you've got credentials.

**Prompt 1:** `I flash my _____`
**Answer:** ID BADGE
**Prompt removes clue:** ID BADGE

**Wrong answer hints (prompt 1):**

| Wrong answer | Hint text |
|---|---|
| COIN | `You can't bribe a keycard reader.` |
| SAFE KEY | `Wrong kind of key. This door wants a badge, not a skeleton key.` |

**Generic wrong text (prompt 1):** `You need credentials to get through a locked door.`

**Prompt 1 success text:** *"The light turns green. You walk through like you've done it a hundred times. You have. But there's a problem at the other end of this corridor — a big one, leaning against the wall with his arms crossed. Security. Not sleeping. Everyone has a weakness, though, and this one keeps eyeing your coat like a man who hasn't had a drink since his shift started."*

**Prompt 2:** `I leave a _____ where he can find it`
**Answer:** BOTTLE
**Prompt grants flag:** `past security`
**Prompt removes clue:** BOTTLE

**Wrong answer hints (prompt 2):**

| Wrong answer | Hint text |
|---|---|
| COIN | `He's not a vending machine. You need something more... indulgent.` |
| INSTRUMENT | `He doesn't look like the musical type.` |
| CORKSCREW | `What's he supposed to do with that? You need to give him a reason to walk away.` |

**Generic wrong text (prompt 2):** `What would tempt a man who's been on his feet all night?`

**Prompt 2 success text:** *"You set it on a supply crate, label facing out. Top shelf. The good stuff. He'll find it in thirty seconds. You'll be gone in twenty. Now — Kidd said there's a door down here that doesn't exist on any blueprint. Time to put that [[crystal eye]] to work."*

**Text links:** `[[crystal eye]]` (opens the QR scanner for the next step)

---

### Page — "The Snake's Study"

**Code phrase:** `the snakes study`
**page_type:** `scan_target` (QR code on a physical prop at the venue — a door, wall panel, or cupboard in the back corridor area)

**Required flags:** `past security`
**Required flags hints:** `"You can't get down here yet."`

**Grants flags:** (none — granted by prompts)
**Grants clues:** JADE DAGGER (on page unlock)

**Content:**

> The crystal eye doesn't lie. What looked like a supply closet has a second layer — a mark on the frame, invisible to anyone without the right lens.
>
> Behind the door: not a closet. An office. Somebody important's office — mahogany desk, leather chair, whisky decanter with one glass. Whoever sits here has taste and money and the kind of job that requires both.
>
> On the desk, catching the light like it wants to be noticed: a dagger. Beautiful thing. Jade handle, silver blade, the kind of weapon that costs more than it kills. You don't know what it's for and you don't care. It's pretty and it's portable.
>
> You pocket it. Obviously.
>
> A locked cabinet sits behind the desk. And behind a panel in the far wall — you can see the seams if you know where to look — something bigger. Something with a combination lock. Old-fashioned. Heavy.
>
> First things first. That cabinet might have what you need to crack the vault.

**Prompt 1:** `I open the cabinet with the _____`
**Answer:** SAFE KEY
**Prompt removes clue:** SAFE KEY

**Wrong answer hints (prompt 1):**

| Wrong answer | Hint text |
|---|---|
| LOCKPICKS | `Save those. You've got the right key for this one somewhere.` |
| CORKSCREW | `You're breaking into a cabinet, not opening a bottle.` |

**Generic wrong text (prompt 1):** `There's a lock. You have a key. This one's not complicated.`

**Prompt 1 success text:** *"Click. Smooth as silk. Inside: papers, receipts, and a set of books that looks an awful lot like a second set of accounts. Cross-reference these against something you've already got and you might just find a combination."*

**Prompt 2:** `I cross-reference the figures with the _____`
**Answer:** LEDGER
**Prompt grants flag:** `got the combination`
**Prompt removes clue:** LEDGER

**Wrong answer hints (prompt 2):**

| Wrong answer | Hint text |
|---|---|
| SHIPPING MANIFEST | `Shipping records won't help you crack a vault combination. You need financial figures.` |

**Generic wrong text (prompt 2):** `You need a book of numbers to compare against the ones in this cabinet.`

**Prompt 2 success text:** *"There it is. Three numbers, buried in a column of phantom transactions. The combination was hiding in the books all along — you just needed the right book to compare it to. Now for [[the vault]]."*

**Text links:** `[[the vault]]`

---

## Phase B: The Vault Door

### Page — "The Vault"

**Code phrase:** `the vault`

**Required flags:** `got the combination`
**Required flags hints:** `"You don't have the combination yet."`

**Grants flags:** (none — granted by prompt)

**Content:**

> The panel swings open when you punch in the numbers. Behind it: steel. Cold, serious, beautiful steel. A vault door that means business.
>
> The combination got you through the outer layer. But the lock itself is something else — old, intricate, the kind of mechanism built by someone who loved their work. Tumblers and springs and a keyhole that's more suggestion than invitation.
>
> And next to the keyhole, a slot. Coin-sized. Because of course. Every lock in this place has a price tag.
>
> You crack your knuckles. This is the bit you were born for.

**Prompt:** `I pick the lock with my _____ and slide the _____ into the slot`
**Answer:** LOCKPICKS, COIN
**Prompt grants flag:** `cracked the vault`
**Prompt removes clues:** LOCKPICKS, COIN

**Wrong answer hints:**

| Wrong answer | Hint text |
|---|---|
| SAFE KEY (slot 1) | `That key opened the cabinet upstairs. This lock needs something more delicate.` |
| CORKSCREW (slot 1) | `Brave. But no. This lock needs finesse, not brute force.` |
| CORKSCREW (slot 2) | `The slot wants something round and flat. Not pointed and sharp.` |

**Generic wrong text:** `Slot one needs a lockpicking tool. Slot two needs something that fits a coin-sized slot.`

**Prompt success text:**

> The tumblers fall like dominoes. The coin drops. Something inside the door goes *clunk* — the satisfied sound of a mechanism that hasn't been triggered in years.
>
> The vault door swings open. It's dark inside. Very dark. And you can hear the clock ticking already — the alarm won't stay quiet forever.
>
> You need to move fast. Grab everything you can. If only you had a light...
>
> Maybe someone out there owes you a favour. Or maybe they will after tonight.
>
> **Go. Now. Use that [[crystal eye]] and take everything that isn't nailed down.**

**Physical transition:** The vault actor opens the real vault door. The thief has **90 seconds** to scan every QR code inside the dark room. They'll want someone with a phone flashlight to help them see.

---

## Phase C: The Vault Room (Timed Physical Scan — 90 seconds)

The vault is a **dark room** at the venue with 6 QR code scan targets inside. An actor controls the door — opens it when the thief completes the vault prompt, pulls them out after 90 seconds.

All items below are `page_type: scan_target`, `visible_to_roles: ["thief"]`, require flag `cracked the vault`.

### "The Crimson Star"

**Code phrase:** `crimson star`

**Grants clues:** CRIMSON STAR

> Thirty carats of deep red perfection sitting on black velvet like it's been waiting for you personally.
>
> You've stolen a lot of things in your life. This is the first one that made you hold your breath.

---

### "The Shadow Ledger"

**Code phrase:** `shadow ledger`

**Grants clues:** BLACK LEDGER

> A heavy book. Black binding. No title. The pages are thin as onionskin and covered in columns of figures — names, dates, amounts. None of it means anything to you.
>
> But someone out there is going to want this very badly.

---

### "Sealed Orders"

**Code phrase:** `sealed orders`

**Grants clues:** SEALED ENVELOPE

> An envelope. Thick paper. Wax seal, unbroken, stamped with initials you don't recognise. Smells like cigar smoke and expensive decisions.
>
> Whatever's inside, it wasn't meant for you. That's never stopped you before.

---

### "The Ivory Mask"

**Code phrase:** `ivory mask`

**Grants clues:** IVORY MASK

> A mask. White as bone. Heavier than it looks.
>
> The eye holes are wrong — too wide, too many. And for a second, just a second, you could swear it was warm.
>
> You don't like this one. You take it anyway.

---

### "The Viper's Ring"

**Code phrase:** `vipers ring`

**Grants clues:** SIGNET RING

> A gold ring. Thick band. The initials V.V. are engraved on the inside, deep and deliberate. Whoever owned this wanted to leave a mark.
>
> Pretty. Heavy. Yours now.

---

### "The Dead Drop"

**Code phrase:** `dead drop`

**Grants clues:** DEAD DROP KEY

> A small brass key on a numbered tag. Locker 7. Somewhere in this building there's a locker that this opens, and inside that locker is something somebody wanted hidden.
>
> You love a mystery. Especially one you can carry in your pocket.

---

## Phase D: The Escape

### Page — "Loose Ends"

**Code phrase:** `loose ends`

**Required flags:** `cracked the vault`
**Required flags hints:** `"You don't need an exit yet."`

**Grants flags:** (none — granted by prompt)

**Content:**

> The actor pulls you out. Ninety seconds. Your pockets are heavier than they've ever been and your heart is going like a snare drum.
>
> Then the alarm kicks in. Not the screaming kind. The quiet kind. The kind that tells the right people to start locking doors.
>
> The corridor is sealed. You can hear footsteps — organised, deliberate. Not casino staff. The kind of people who get paid to handle exactly this sort of situation.
>
> The way you came in just became the way you don't get out.
>
> Think. Think. Think.
>
> There — a vent panel in the wall, painted to match the plaster. Too small for most people. Not too small for you. But the screws are stripped and your fingers aren't screwdrivers.
>
> Good thing a corkscrew isn't just for corks.

**Prompt:** `I pry the panel with the _____`
**Answer:** CORKSCREW
**Prompt grants flag:** `clean getaway`
**Prompt removes clue:** CORKSCREW

**Wrong answer hints:**

| Wrong answer | Hint text |
|---|---|
| LOCKPICKS | `Too delicate. You need leverage, not finesse.` |
| JADE DAGGER | `That's worth more than you are. Don't bend it on a vent panel.` |

**Generic wrong text:** `You need something with a point and a grip. Something you can use as a lever.`

**Prompt success text:**

> The screws give. The panel comes free. You slide through like water through a pipe and pull the grate shut behind you.
>
> Twenty minutes of crawling through the guts of the building. Dust, cobwebs, the distant sound of people who are never going to find you.
>
> You emerge into the alley behind the casino. The rain's still coming down. Feels good on your face.
>
> Time to collect. [[Dane Kidd]] is waiting.

---

### Page — "The Score"

**Code phrase:** `dane kidd`

**Required flags:** `clean getaway`
**Required flags hints:** `"You haven't finished the job yet."`

**Grants flags:** `job done`

**Content:**

> Kidd is exactly where you left them. Same bar. Same lean. But the half-smile is gone. Replaced by something you haven't seen before.
>
> Respect.
>
> *"You actually did it."*
>
> You empty your pockets onto the bar. The Crimson Star. A jade dagger. A black book. An envelope. A mask. A ring. A key. The light catches the ruby and throws red across the wood grain. Even in a place like this, it looks like it belongs in a museum.
>
> Kidd picks up the Crimson Star. Turns it in their fingers. Sets it back down.
>
> *"Keep it. You earned it."*
>
> You look at them. That's not how this works. There's always a cut. Always a percentage. Always someone with their hand out.
>
> *"I didn't hire you for the stone. I hired you to see if it could be done. It can."*
>
> They finish their drink. Set the glass down. Stand up straight for the second time tonight.
>
> *"You're the real deal. And this place — this casino, these people, this whole rotten operation — it's going to shake itself apart soon enough. When it does, I want someone like you on my side of the table."*
>
> They extend a hand. You shake it. Firm grip. Honest grip. Rare thing in a casino.
>
> Everything goes back in your pockets. The star, the dagger, the book, the ring, the mask, the envelope, the key. Seven reasons to be the most popular person in this building tonight.
>
> Not bad for a night's work.

**Prompt:** None
**Text links:** None

---

## Summary Table

### Phase A: Getting In

| Page | Code Phrase | Title | Flags Required | Flags Granted | Clues Granted | Clues Consumed | Type |
|---|---|---|---|---|---|---|---|
| — | `the real game` | The Real Game | Part 2 completion (7 flags) | `briefed on the vault` | — | — | Briefing |
| — | `encore` | Encore | `briefed on the vault` | `past the stage` | — | INSTRUMENT | Stage |
| — | `backstage pass` | Backstage Pass | `past the stage` | `past security` | — | ID BADGE, BOTTLE | Corridor |
| — | `the snakes study` | The Snake's Study | `past security` | `got the combination` | JADE DAGGER | SAFE KEY, LEDGER | Office (scan_target) |

### Phase B: The Vault Door

| Page | Code Phrase | Title | Flags Required | Flags Granted | Clues Granted | Clues Consumed | Type |
|---|---|---|---|---|---|---|---|
| — | `the vault` | The Vault | `got the combination` | `cracked the vault` | — | LOCKPICKS, COIN | Vault door |

### Phase C: The Vault Room (90-second timed scan)

| Page | Code Phrase | Title | Clues Granted | For Faction |
|---|---|---|---|---|
| — | `crimson star` | The Crimson Star | CRIMSON STAR | Thief (trophy) |
| — | `shadow ledger` | The Shadow Ledger | BLACK LEDGER | Investigators + Occultists |
| — | `sealed orders` | Sealed Orders | SEALED ENVELOPE | Mobsters |
| — | `ivory mask` | The Ivory Mask | IVORY MASK | Occultists |
| — | `vipers ring` | The Viper's Ring | SIGNET RING | Investigators or Mobsters |
| — | `dead drop` | The Dead Drop | DEAD DROP KEY | Mobsters or Occultists |

All vault room pages: `page_type: scan_target`, require flag `cracked the vault`.

### Phase D: The Escape

| Page | Code Phrase | Title | Flags Required | Flags Granted | Clues Consumed | Type |
|---|---|---|---|---|---|---|
| — | `loose ends` | Loose Ends | `cracked the vault` | `clean getaway` | CORKSCREW | Escape |
| — | `dane kidd` | The Score | `clean getaway` | `job done` | — | Completion |

## Item Consumption (Phase A + B)

| Item | Consumed At | Purpose |
|---|---|---|
| INSTRUMENT | Encore | Blend in with the band |
| ID BADGE | Backstage Pass | Badge past the keycard door |
| BOTTLE | Backstage Pass | Distract the security guard |
| SAFE KEY | The Snake's Study | Open the locked cabinet |
| LEDGER | The Snake's Study | Cross-reference vault combination |
| LOCKPICKS | The Vault | Pick the vault lock |
| COIN | The Vault | Coin-operated vault mechanism |
| CORKSCREW | Loose Ends | Pry open escape vent |

## Vault Haul (Phase C)

| Clue | What the thief sees | What it means | Who needs it |
|---|---|---|---|
| **CRIMSON STAR** | Thirty-carat ruby. The prize. | The thief's completion trophy | Thief |
| **JADE DAGGER** | Pretty knife from the office | The murder weapon (Vincent Vane killed Mr. Sage with it) | Investigators |
| **BLACK LEDGER** | Book of numbers, means nothing to the thief | The casino's shadow financial records | Investigators + Occultists |
| **SEALED ENVELOPE** | Wax-sealed, smells like cigars | Orders/evidence from the mob operation | Mobsters |
| **IVORY MASK** | Creepy, old, heavier than it looks | Ritual artifact connected to the supernatural layer | Occultists |
| **SIGNET RING** | Gold ring, initials V.V. | Vincent Vane's personal seal — proof of identity | Investigators or Mobsters |
| **DEAD DROP KEY** | Brass key, tag says Locker 7 | Access to a hidden stash elsewhere in the casino | Mobsters or Occultists |

## Items at End of Part 3

| Clue | Status |
|---|---|
| CRIMSON STAR | Thief's trophy |
| JADE DAGGER | Tradeable → Investigators |
| BLACK LEDGER | Tradeable → Investigators or Occultists |
| SEALED ENVELOPE | Tradeable → Mobsters |
| IVORY MASK | Tradeable → Occultists |
| SIGNET RING | Tradeable → Investigators or Mobsters |
| DEAD DROP KEY | Tradeable → Mobsters or Occultists |
| SHIPPING MANIFEST | Optional from Part 1 — tradeable |

## Cross-Faction Trade Dynamics

The thief emerges from Part 3 as the **most trade-rich faction** in the game. They have 6 tradeable items (7 counting SHIPPING MANIFEST) and every other faction needs at least one thing from them.

| Faction | Items they need from thief | What they might offer |
|---|---|---|
| Investigators | JADE DAGGER, BLACK LEDGER, SIGNET RING | LIGHTER, NOTEBOOK, MARKED CARDS, BLOOD MONEY |
| Mobsters | SEALED ENVELOPE, SIGNET RING, DEAD DROP KEY | THE VIPER (clue naming Vane), mob-specific items TBD |
| Occultists | IVORY MASK, BLACK LEDGER, DEAD DROP KEY | Occult items TBD, supernatural knowledge |

The thief doesn't *need* anything from other factions to complete their storyline — `job done` is already granted. Their endgame is pure trading: figuring out who wants what and what it's worth.

## Dane Kidd Actor Hints (Part 3)

| Player seems... | Say something like... |
|---|---|
| Hasn't started | *"The band's playing. That's your way in. Blend in, slip out."* |
| Past the stage, stuck at security | *"Badge gets you through the door. The guard needs something else — something to take the edge off a long shift."* |
| Past security, can't find the office | *"Use that eye of yours. The door's down there — it just doesn't want to be found."* |
| In the office, stuck on combination | *"You lifted a bookkeeper's ledger, didn't you? Numbers talk to numbers."* |
| At the vault | *"You're a thief. This is what you do. Lock wants picking, slot wants filling."* |
| Ready for the vault room | **Open the vault door. Start the 90-second timer.** |
| Finished scanning | **Pull them out. "Time's up. Let's see what you got."** |
| Has the goods, needs to escape | *"You got in through the walls. Get out through them too."* |
