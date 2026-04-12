# Mobster Pages - Part 1: The Setup

All pages: `page_type: text`, `visible_to_roles: ["mobster"]` unless noted

---

## #43 - "Your Godfather is dead" (code: `start`)

*Exists in DB. Content below matches current state.*

**Required flags:** none
**Grants flags:** `don kay is gone`
**Grants clues:** CIGAR, SWITCH BLADE, COOL SHADES, BROKEN DRUM CASINO
**Text links:** `[[the will]]`

> The old man's gone. Your old man. Everyone's old man, if you wanna get technical about it. Don Kay. Gone. Clipped too soon? Sure, maybe. But that score gets settled later. When Mrs. K's done with her black dresses and her weeping. She deserves that much, at least.
>
> Right now though, right now something's eating at you worse than grief.
>
> [[The will]].

---

## #44 - "Lay of the land" (code: `the will`)

*Exists in DB. Content cleaned up below (removed em-dashes).*

**Required flags:** `don kay is gone`

> You sat there in that room, hat in your hands, and you listened real careful like. And what'd you hear? Nothing. A whole lotta nothing dressed up in lawyer talk. No mention of the money. Not a word about the territories. And the seat. Who sits in the big chair now? The Don left that question hanging in the air like cigar smoke. Said whoever cracks the puzzle he left behind's got what it takes to run this family. Cute. Real cute, old man.
>
> But here's what's keeping you up. That will was snatched off the table faster than a hand in a card game, and you been around long enough to know that when something moves that quick, somebody's got a reason for it. You caught maybe half of what was written on that paper. Maybe less.
>
> And you got a feeling, the kind you don't ignore if you wanna keep breathing, that the other half was the part that mattered. One thing you did catch? The name of the Old Man's favourite business: The Broken Drum.

**Prompt:** `You will find the Executor at the _____`
**Answer:** BROKEN DRUM CASINO
**Prompt grants flag:** `i remember`
**Prompt success:** *"The Broken Drum. The Don's crown jewel. You should head there."*

---

## #45 - "Hey! I'm walking here!" (code: `broken drum`)

*Exists in DB. Content matches current state.*

**visible_to_roles:** null (gated by `don kay is gone` which only mobsters receive)
**Required flags:** `don kay is gone`
**Grants flags:** `business time`
**Grants clues:** BUSINESS
**Removes flags:** `don kay is gone`
**Text links:** `[[business in the dark]]`, `[[move on]]`

> The city don't sleep, but tonight it's restless.
>
> The rain ain't here yet, not properly, but it's coming. You can feel it in the way the air sits heavy, thick with damp stone and something electric. What's left of the moon keeps disappearing behind the clouds like it don't want to be a witness to whatever tonight's got planned.
>
> Smart moon.
>
> The streetlamps are doing their best, throwing down sad little pools of amber that don't quite reach each other. In the gaps between them, the city does what it always does, conducts its [[business in the dark]]. You [[move on]].

---

## #59 - "A deal is struck" (code: `business in the dark`)

*Exists in DB. Content matches current state.*

**visible_to_roles:** null
**Required flags:** `business time`

> Then you see them.
>
> Standing just off the light, the way these guys always do, like the dark is a habit they never bothered breaking. A cigarette ember glowing somewhere around where their face ought to be. You adjust your coat against the cold and walk over.
>
> Unhurried.
>
> You don't hurry for anybody.
>
> "*You're late,*" they say.
>
> You glance up at the sky. At the nothing where the moon used to be.
>
> "It's a wet night," you say. "I walked slow."
>
> They seem to consider that. Then something that ain't quite a smile moves across their face, and the business begins.

**Prompt:** `I guess I may need their _____`
**Answer:** NOTES ON A PROPHETIC DREAM
**Prompt grants flag:** `off to don's`
**Prompt success:** *"The hand's been shook."*

**Cross-faction dependency:** NOTES ON A PROPHETIC DREAM must come from an Occultist player via trade. This is the mobster's first cross-faction gate.

---

## #46 - "Don's Place" (code: `move on`)

*Exists in DB. Content updated below to add a text link to the casino entry.*

**visible_to_roles:** null
**Required flags:** `off to don's`
**Text links:** `[[the big time]]`

> You hear The Broken Drum before you see it. Low, like a pulse. Music bleeding through the walls, something with brass in it, something good. Then the sign swings into view and you gotta admit, even on a night like this, the place has got style. The whole front is lit up clean and bright, the kind of place that wants to be seen. Polished brass on the doors. A canopy keeping the sidewalk dry. The light spilling out ain't just gold, it's warm. The kind that promises a good pour and a soft chair and the sound of money moving around a room the way it's supposed to.
>
> The way the Kay family like it.
>
> Then the first real drop of rain hits the brim of your hat.
>
> Alright. [[The big time]].

---

## NEW - "You own this place" (code: `the big time`)

**Required flags:** `off to don's`
**Grants flags:** `in the broken drum`
**Grants dirt:** 1 (random from pool)

> Some mook at the door presses your thumb to a coin. You feel something shift, like a pickpocket working from the inside out. Your name appears on the metal.
>
> "House rules," the mook says. "Standard procedure."
>
> You look at him the way you look at people who explain things you already know. He finds somewhere else to be.
>
> The Broken Drum. You grew up on the stories. Don Kay built this joint from a hole in the ground, turned it into the jewel of the strip, ran every racket worth running out of the back rooms while the champagne kept the front of house too happy to notice. And now the old man's cold and every two-bit wiseguy with a pulse thinks it's their turn.
>
> Not if you got something to say about it.
>
> Somewhere in this crowd of silk suits and cheap perfume, there's a man holding the keys to the kingdom. The Executor. Don Kay's lawyer and oldest pal. Word is he's running the old man's little succession game.
>
> He'll be the one who looks like he's been to more funerals than weddings. Ask around for [[the executor]].

---

## NEW - "Terms of the will" (code: `the executor`)

**Required flags:** `in the broken drum`
**Grants flags:** `met the executor`
**Grants clues:** THE VIPER
**Grants dirt:** 2 (random from pool)

> You find him at a corner table, nursing a drink he ain't touched. Grey suit. Grey hair. Grey eyes that got no quit in them. This is the man Don Kay trusted with everything. The money. The secrets. The will.
>
> He don't stand when you approach. Don't need to.
>
> "*Sit down.*"
>
> You sit. You don't usually sit when you're told. But this man buried your boss, and the ink on the will ain't dry.
>
> "*The Don didn't name a successor. You knew that already. What you don't know is why.*"
>
> He folds his hands. Slow. Like he's got all night and you don't.
>
> "*He left a test. Prove you understand how this place works. The tables, the machines, the people, the business. Top to bottom. Prove it, and the seat's yours.*"
>
> He lets that hang. Then leans forward.
>
> "*One more thing. In this family, reputation is everything. Whatever you hear about the competition, and you will hear things, use it. The cleanest pair of hands gets the crown.*"
>
> He slides a card across the table. Four words on the back.
>
> [[The tables]]. [[The machines]]. [[The floor]]. [[The board]].
>
> "*Oh, and keep an eye on a man called the Viper. Vincent Vane. He's been running operations in this casino that the Don turned a blind eye to. Whether that eye stays blind is up to the next boss.*"
>
> He picks up his drink. The meeting's over.

**Physical element:** The Executor actor gives the mobster the four code phrases and can elaborate on each pillar if asked. The pillars can be tackled in any order.

---

## Summary Table

| Page | Code Phrase | Title | Flags Required | Flags Granted | Clues Granted | Dirt | Status |
|---|---|---|---|---|---|---|---|
| 43 | `start` | Your Godfather is dead | — | `don kay is gone` | CIGAR, SWITCH BLADE, COOL SHADES, BROKEN DRUM CASINO | — | Exists |
| 44 | `the will` | Lay of the land | `don kay is gone` | `i remember` (prompt) | — | — | Exists |
| 45 | `broken drum` | Hey! I'm walking here! | `don kay is gone` | `business time` | BUSINESS | — | Exists |
| 59 | `business in the dark` | A deal is struck | `business time` | `off to don's` (prompt) | — | — | Exists |
| 46 | `move on` | Don's Place | `off to don's` | — | — | — | Needs link |
| — | `the big time` | You own this place | `off to don's` | `in the broken drum` | — | 1 | **New** |
| — | `the executor` | Terms of the will | `in the broken drum` | `met the executor` | THE VIPER | 2 | **New** |
