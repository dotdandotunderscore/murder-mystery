# Investigator Pages — Part 1: Getting In

All pages: `page_type: text`, `visible_to_roles: ["investigator"]`

---

## #13 — "A long dark night" (code: `start`)

**Required flags:** none
**Grants clues:** NOTEBOOK, $5 BILL, PENCIL
**Text links:** `[[smoke]]`

> Seven o'clock. Give or take. You lose track of time when you haven't had a smoke.
>
> The steps to the Broken Drum Casino stretch out ahead of you, slick with rain that's been falling since before you started caring.
>
> Mrs. Sage hired you three days ago. Beautiful woman. The kind of beautiful that makes you forget she's paying by the hour. Her husband vanished two weeks back and the trail — what little of it there was — went cold at these doors.
>
> You figure the man's in there right now. Gambling away her money, drinking away his conscience, keeping company with someone younger. That's usually the story. Boring story. But she's paying, and your landlord doesn't accept apologies.
>
> First things first though. Your nerves are shot and your hands won't stop shaking. You need a [[smoke]].

---

## #18 — "Undercover, again" (code: `shelter`)

**Required flags:** none
**Grants flags:** `got out of the rain`
**Grants clues:** LIGHTER

> A doorway. Good enough. You duck under it and let the rain do what it wants without you.
>
> You pull out your reds. Soaked through. Every last one of them. The universe has a sense of humour and it isn't funny.
>
> Your lighter, though — still in your breast pocket, dry and faithful. Engraved with your initials. It's the one nice thing you own that nobody's tried to take from you yet.
>
> No use to you without something to smoke. You're going to have to find someone willing to trade.

---

## #17 — "Time to clear your mind" (code: `smoke`)

**Required flags:** `got out of the rain`
**Missing flag hint:** `"Need to find some [[shelter]]"`

**Prompt:** `I use my _____ to light my _____`
**Answer:** LIGHTER, CIGARETTE
**Prompt grants flag:** `had your fix`
**Prompt removes clue:** CIGARETTE

> You pat your coat down. Cigarettes — yes. You always have cigarettes. Nobody without cigarettes in this city has any friends.
>
> But no lighter. You must have left it at the office. Or the bar. Or one of the dozen places you've been trying to forget this week.
>
> Someone in this place has got to have a light. People don't come to a casino without vices, and where there are vices there are flames. Ask around. Somebody here will help you out — for a price. Everything has a price in a place like this.
>
> Light your [[cigarette]] with a [[lighter]] and get your head straight.

**Prompt success:** *"Three deep breaths in. Much better. Time to cross the threshold of the [[Broken Drum]]."*

---

## #19 — "Welcome to the Broken Drum Casino" (code: `broken drum`)

**Required flags:** `had your fix`
**Missing flag hint:** `"I can't think straight yet, need to [[smoke]]"`
**Grants flags:** `in the broken drum`
**Text links:** `[[Mr. Sage]]`

> So this is the Broken Drum. Chandeliers, champagne, and enough diamonds to blind you at forty paces. Everyone here is smiling. Nobody here is happy.
>
> A waiter drifts past with a tray of drinks. You take one. Then another. You're no champagne drinker but it's free, and free is your favourite flavour.
>
> Somewhere in this crowd of silk and self-importance, [[Mr. Sage]] is spending his wife's money and his own borrowed time. Time to start asking questions. You're good at that. It's the answers you have trouble with.
