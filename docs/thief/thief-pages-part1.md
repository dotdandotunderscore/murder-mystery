# Thief Pages — Part 1: Getting In

All pages: `page_type: text`, `visible_to_roles: ["thief"]` unless noted

---

## #20 — "Double time swing" (code: `start`)

**Required flags:** none
**Grants clues:** CIGARETTE, INSTRUMENT, LOCKPICKS
**Text links:** `[[deliveries entrance]]`, `[[staff door]]`

> The rain is coming down heavy. The background noise might come in useful though.
>
> You are dressed the part, thankfully the house band's uniform is terribly generic, not that anyone pays attention to the help anyway.
>
> But they will pay attention if you try to waltz in through the front doors. You have scoped out a [[deliveries entrance]] and a [[staff door]] that might make for good entry points.

---

## #22 — "Input/Output" (code: `deliveries entrance`)

**visible_to_roles:** null (open to all)
**Required flags:** none
**Grants clues:** SHIPPING MANIFEST

> No good, looks like a shipment of something or other has come in. You don't care much what it contains but over your years in the business you know to swipe clipboards filled with paperwork when you see them.

**Dead end.** Rewards exploration with a tradeable clue but doesn't advance the main path.

---

## #21 — "Part of the crew" (code: `staff door`)

**Required flags:** none

**Prompt:** `I bribe the Chef with a _____`
**Answer:** $5 BILL
**Prompt grants flag:** `in through the staff door`
**Prompt removes clue:** $5 BILL

> Much better, inconspicuous and quiet.
>
> Apart from one man, a Chef on break having a smoke.
>
> "I don't think I have seen you around here before" he grunts. "Who is your shift manager?"
>
> You don't have time for questions like this. He looks like the type to be less inquisitive if his palms are greased, but your wallet is in your other pants.

**Prompt success:** *"A smirk crosses his ugly face as you produce that green gold from your pocket. 'Oh well why didn't you say so, welcome to the [[Broken Drum]]'"*

**Cross-role dependency:** The $5 BILL is not in the Thief's starting inventory. The Investigator starts with it. Players must trade (naturally: CIGARETTE for $5 BILL).

---

## #23 — "Welcome to the Broken Drum Casino" (code: `broken drum`)

**Required flags:** `in through the staff door`
**Missing flag hint:** `"Still need to find a way in without anyone noticing or caring"`
**Grants flags:** `in the broken drum`
**Text links:** `[[Pink Neckerchief]]`

> Poorly lit, dank, and busy with busybodies who don't have the time of day for you. Perfect.
>
> You have been led to believe that your contact will be wearing a [[Pink Neckerchief]], better start looking.

**Physical element:** Player must find a real person wearing a pink neckerchief at the venue. No digital page for "pink neckerchief" — the person tells them to type `dane kidd`.
