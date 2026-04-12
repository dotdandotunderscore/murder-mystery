# Mobster Pages - Part 3: The Claim

All pages: `page_type: text`, `visible_to_roles: ["mobster"]`

---

## NEW - "The big chair" (code: `the claim`)

**Required flags:** `proved your nerve`, `beat the house`, `got the seal`, `read the will`, `got the blessing`
**Required flags hints:**
- `"You ain't proved yourself at the tables yet."`
- `"You ain't figured out the machines yet."`
- `"You still need the Don's seal."`
- `"You still need the Don's final word."`
- `"You still need the Don's blessing."`
**Grants flags:** `the new don`

> You done it. The tables, the machines, the people, the dirt. All of it. You walked into this casino tonight as one of six hopefuls and you're about to walk out as the only one that matters.
>
> The Executor is waiting where you left him. Same corner table. Same untouched drink. But something's different. The way he looks at you. Like you're not wasting his time anymore.
>
> "*You got something to show me?*"
>
> Yeah. You got something to show him.
>
> Three things the Don scattered across this place like breadcrumbs for the worthy. The seal that makes it legal. The words that make it true. And the blessing that makes it forever.
>
> Time to lay them on the table and take what's yours.

**Prompt:** `The Don's _____ makes the succession legitimate. His _____ reveals what he truly wanted. And his _____ proves the powers that be approve.`
**Answer:** DON'S SEAL, DON'S FINAL WORD, DON'S BLESSING
**Prompt removes clues:** DON'S SEAL, DON'S FINAL WORD, DON'S BLESSING

**Wrong answer hints:**

| Wrong answer | Hint text |
|---|---|
| FILING OFFICE KEY | `That's what you gave the thief. What did they bring back?` |
| WILL FRAGMENT | `That's what you gave the investigator. What did they bring back?` |
| OFFERING | `That's what you gave the occultist. What did they bring back?` |
| THE VIPER | `The Viper's a problem, not a solution. You traded that name already.` |
| SPECIAL CHIP | `The chip led you somewhere. What did you find there?` |
| CIGAR | `Save it for the victory smoke.` |
| SWITCH BLADE | `Nobody's getting stabbed tonight. Probably.` |

**Generic wrong text:** `Three things. One from the filing office job. One from the hidden will. One from the spirits. You know what they are.`

**Prompt success:**

> The Executor takes each one. Holds it. Studies it. Sets it down.
>
> The seal. The word. The blessing. Three pieces of a puzzle the Don spent his last days building, and you're the one who put it together.
>
> He says nothing for a long time. Then he finishes his drink. First sip all night.
>
> "*The Don would've picked you. I think he did pick you, in his way. The test wasn't about the answers. It was about how you got them. You didn't do the work yourself. You found the right people, put them in the right places, and got it done. That's what a boss does.*"
>
> He stands. First time tonight.
>
> "*There is the matter of the Viper. Vincent Vane. He's been running his own game inside this casino. Killed a man without the family's say-so. That kind of freelancing don't fly under new management. I trust you'll handle it.*"
>
> He extends a hand. You shake it.
>
> The Broken Drum is yours.
>
> Check [[the board]] one last time. See how the family shook out.

**Text links:** `[[the board]]`

---

## Summary Table

| Code Phrase | Title | Type | Flags Required | Flags Granted | Clues Consumed |
|---|---|---|---|---|---|
| `the claim` | The big chair | text | `proved your nerve`, `beat the house`, `got the seal`, `read the will`, `got the blessing` | `the new don` | DON'S SEAL, DON'S FINAL WORD, DON'S BLESSING |

---

## Endgame Notes

**The leaderboard** (`the board`) shows final dirt standings after completion. The mobster with the least dirt has the cleanest reputation. This is a bragging-rights outcome, not a mechanical gate.

**The Viper** is mentioned in the success text as unfinished business. This connects the mobster storyline to the investigator's murder case without requiring the mobster to solve it. The Viper killed Mr. Sage without family authority, which is why he's unfit to be successor. The new Don will "handle it."

**Total dirt collected per mobster across all three parts:** ~9 (1 from Part 1, 8 from Part 2). With 6 mobsters each firing 9 dirt, that's 54 pieces of dirt distributed across the group by endgame.
