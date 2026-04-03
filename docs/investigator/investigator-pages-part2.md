# Investigator Pages — Part 2: Finding the Body

All pages: `page_type: text`, `visible_to_roles: ["investigator"]`

---

## #31 — "Downstairs" (code: `private rooms`)

**Required flags:** none
**Grants flags:** `in the warren`

> Someone upstairs told you the real action is below. You believed them. People lie to you all the time but you never learn.
>
> The velvet-lined stairs take you down into the guts of the place. It's darker here. Quieter. The kind of quiet where conversations happen in whispers and deals get done with handshakes that leave bruises.
>
> The music from the main floor bleeds through the ceiling like a half-remembered dream. Down here it's all smoke and shadows and the clink of glasses being refilled by people who don't want to be seen.
>
> No sign of Sage. But this place has more corners than a hall of mirrors. You need a local. Someone who owes you, or at least someone who remembers you fondly enough to pretend they do. There's a name rattling around in the back of your mind — a woman who works these rooms.

**No text links.** Player must recall or discover the name `jennette orilae`.

---

## #32 — "An island in the tempest" (code: `jennette orilae`)

**Required flags:** `in the warren`
**Missing flag hint:** `"She doesn't seem to be around right now"`
**Grants flags:** `spoke to jennette`
**Text links:** `[[Madame Web]]`

> Jennette Orilae. You worked a case together three years ago. Or was it five. Time does that when you drink.
>
> She's older now. So are you. Neither of you mention it.
>
> You ask about Sage. The change is instant — her eyes flick sideways, scanning the room like she's counting exits. Someone down here makes her nervous. She won't say who.
>
> She leans in. Close enough that you can smell the gin on her breath and the jasmine in her hair.
>
> *"You want Sage? Find [[Madame Web]]. She knows everyone who passes through these rooms. If your man's down here, she'll know where they put him."*

---

## #35 — "The Mistress of Mysteries" (code: `madame web`)

**Required flags:** `spoke to jennette`
**Missing flag hint:** `"You don't know where to find her"`

**Prompt:** `I show her the _____`
**Answer:** UNOBTAINABLE (deliberately unsolvable)
**Wrong answer hint for MAJOR ARCANA - THE MOON:** `"The Moon. But you are not looking for *more* mysteries. Maybe this isn't the question you seek."`

This page is a puzzle gate. The Moon is thematically correct but mechanically wrong — the hint tells the player to *invert*. In tarot, inverting = reversing the card. This clues players to reverse the code phrase `madame web` → `bew emadam`.

> You push through a beaded curtain into a room that smells like a church and feels like a tomb. Incense, thick as fog, wraps around you before you've taken two steps.
>
> Madame Web sits at the centre of it all. Cards spread before her. Candles that burn too steady. Eyes that don't blink enough.
>
> Every instinct you have says turn around. Every instinct you have is wrong tonight.
>
> "Sit," she says. Her voice sounds like it's been buried and dug back up.
>
> You sit.

---

## #33 — "seiretsyM fo ssertsiM ehT" (code: `bew emadam`)

**Required flags:** `in the warren`, `spoke to jennette`
**Missing flag hints (reversed):** `"eb thgim ehs erehw wonk t'nod uoY"`, `"reh tuoba erom uoy llet nac ohw enoemos dnif ot deen uoY"`

**Prompt (reversed):** `_____ eht reh wohs I`
**Answer:** MAJOR ARCANA - THE MOON
**Prompt grants flag:** `reversed the illusion`

All text is reversed. The room is *wrong* — candles burn downward, smoke sinks, cards are blank and face-up, Madame Web's shadow has too many edges, her lips don't move when she speaks.

> .knalb si meht fo eno elgnis yreve dna pu ecaf era elbat eht no sdrac ehT .sesir fo daetsni sknis ekoms esnecni ehT .roolf eht ta tniop semalf eht tub drawnwod nrub seldnac ehT .emas eht ton si tI .emas eht si moor ehT
>
> .ot ton uoy sllet gnihtemoS .yltcerid ti ta kool t'nod uoY .segde ynam oot sah tI .epahs reh hctam t'nseod tI .gnorw si wodahs reh tuB .erofeb saw ehs erehw gnittis si beW emadaM
>
> .siht ekil diarfa neeb reve ev'uoy erus ton er'uoY .siht ekil diarfa erew uoy emit tsal eht rebmemer t'nod uoy dna gnidnats si smra ruoy no riah yrevE .selkcirp niks ruoY .sehcruhc dlo dna reppoc ekil setsat ria ehT
>
> .evom t'nod spil reh ,skaeps ehs nehW
>
> ".tiS"
>
> .ot esoohc t'ndid uoY .tis uoY

**Prompt success:** *"She places a single card face-down on the table. You reach for it. She shakes her head. 'Not here. Go back. The way you came. She is waiting for you on the other side.' She means herself. The other her. The right-way-round her. Find [[Madame Web]]."*

---

## #38 — "The Woman Who Knows" (code: `madame web`)

**Required flags:** `reversed the illusion`
**Grants flags:** `consulted the mistress`
**Text links:** `[[Green Room]]`

> You don't tell her your name. She doesn't ask. She already knows it — you can see that in the way she looks at you. Not at your face. Through it.
>
> You've met fortune tellers before. Card tricks and cold reads. This isn't that. The candles in this room flicker when she speaks, and not because of a draught.
>
> "You're looking for Mr. Sage."
>
> You open your mouth. She raises a hand.
>
> "He came to me seeking answers. The cards showed him something he was not prepared for. You will find what remains of his evening in the [[Green Room]]."
>
> That's all she gives you. No explanation, no directions, no small talk. The conversation is over because she says it is.
>
> You want to argue. You want to tell her you don't believe in any of this. But your mouth stays shut. Some part of you — the old part, the part that still trusts its instincts — knows better.

---

## #39 — "The Green Room" (code: `green room`)

**Required flags:** `consulted the mistress`
**Missing flag hint:** `"You don't have any reason to go here"`
**Grants flags:** `found mr. sage`
**Text links:** `[[Madame Web]]`

> The Green Room. Private. Quiet. The kind of room where important people have important conversations.
>
> Not tonight.
>
> Mr. Sage is on the floor. Face down. He isn't sleeping and he isn't drunk. The rug beneath him is dark and wet and the smell hits you like a freight train. You've seen enough bodies to know one when you find one.
>
> You stand there for a long moment. The champagne turns sour in your stomach. Three days ago a beautiful woman sat across your desk and asked you to find her husband. You found him.
>
> You search the room. Nothing. No weapon, no note, no sign of whoever did this. The place has been cleaned — not well, but well enough. Somebody knew what they were doing.
>
> The room has no answers. But you know someone who might. Time to pay [[Madame Web]] another visit.

---

## #40 — "Dead End" (code: `madame web`)

**Required flags:** `consulted the mistress`, `found mr. sage`
**Grants flags:** `found the shell of mr. sage`, `the pale flame`
**Removes flags:** `found mr. sage`
**Text links:** `[[pale flame]]`

> You tell her what you found in the Green Room. She doesn't flinch. Not even a little. She knew before you walked back in.
>
> "You found what is left of Mr. Sage, detective. But a body is not the truth. It is only the last lie someone told."
>
> The room feels smaller than it did a minute ago. You came here tonight to catch a man with his hand in the wrong cookie jar. Now the man is dead and you're taking counsel from a woman whose candles burn without wax melting.
>
> She reaches beneath the table and places something in front of you. A light — small, strange, old. It doesn't look like much. But then, neither did Madame Web the first time you saw her.
>
> "The [[pale flame]]. It will show you what the guilty have tried to hide. Their words, their marks, their secrets — written in ink that only this light can reveal."
>
> She means the mob. The people who run the Broken Drum. The people with every reason in the world to make a man disappear.
>
> "Shine it where you would not think to look. The truth is written on the walls of this place, detective. But only for those willing to see it."
>
> You pick it up. Click it on. A thin violet beam cuts through the incense smoke. Even here, in her parlour, you can see marks on the wall you'd never have noticed. Words. Hidden in plain sight.
>
> Wonderful. A missing person case just became a murder investigation, and your only lead is a magic torch given to you by a woman who reads tarot cards in a basement.
>
> Your mother always said you should have been a dentist.

---

## #41 — "The Man Behind the Man" (code: `ghost`)

**Required flags:** `found the shell of mr. sage`, `pale flame`
**Missing flag hints:** `"You see something strange, but you don't understand what."`, `""`

> The flame shows you something that shouldn't be there.
>
> This person — just staff, just another face in the crowd — but through the light they shimmer. A second shape layered over the first, like a double exposure on a photograph. The outline of someone who isn't there anymore. Someone you found face-down on a rug twenty minutes ago.
>
> Sage. Or what's left of him. Trapped. Tethered. However you want to say it — none of the words feel right because none of the words were built for this.
>
> Call his name. See what answers.

**No text links.** Player must physically speak "Sage" to the ghost-host actor, who performs the testimony scene and gives them the code phrase `the hunt begins` (Part 3).
