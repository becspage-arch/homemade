# Mindset authoring — worker prompt template

Canonical input for any worker session that drafts a Mindset library
entry. Mirrors `docs/tutorial-author.md` but rebuilt for the Mindset
shape — `PRACTICE` / `READING` tutorials, 11 practice types, 20
practice targets, time bands, best-time, when-to-use / when-not-to-use,
alternative-practice cross-references, source-material grounding.

**Prompt version:** 2 (2026-05-15). Changelog:
- v2: rewrote the voice section after Rebecca reviewed the v1 anchor
  batch and flagged the whole thing as ethereal AI-poetry. New rules:
  Mindset prose follows the cooking-recipe register (factual,
  specific, low-key) — not a separate "spiritual" voice. Stripped
  imagined-feeling intros, "what you might notice" lists, defensive
  in-body disclaimers. Added the assumed-type-intro pattern:
  individual practice scripts assume the matching READING entry has
  been read (`how-eft-tapping-works`, `how-rituals-work`, etc.) and
  don't restate the methodology. Sub-category locked as practice
  type, not life category — life categories surface through
  `practiceTargets[]` only.
- v1 (Mindset anchor batch, 2026-05-14): initial drop, modelled on
  `docs/tutorial-author.md` v4.

## How a drafting session uses this file

A Mindset worker does five things:

1. Reads this whole file, `docs/voice-editor-prompt.md`,
   `docs/mindset-anti-tells.md`, and the brief it was handed (one
   practice at a time). `docs/mindset-anti-tells.md` is the Mindset
   equivalent of `docs/common-issues.md` — recurring Mindset-specific
   tells the drafter checks against in step 5.
2. Reads any source material the brief flags (e.g. a specific day of
   `MONEY-v2.txt`, a chapter of `The-Money-Zone-v1.txt`). Sources
   live at `.claude/extracted/mindset-source/` in the main repo
   (not always in worktrees — read from the main checkout if missing).
3. Drafts a TipTap-JSON tutorial matching `TutorialUploadInput` with
   `type = "PRACTICE"` (or `"READING"` for long-form readings).
4. Self-critiques against the voice rules below, rewrites flagged
   sentences in place.
5. Self-critiques against every entry in `docs/mindset-anti-tells.md`,
   rewrites any matching line, then writes the final JSON to disk.

The deterministic `voice-check` CLI then gates the upload. The same
upload script that handles RECIPE / TECHNIQUE handles PRACTICE / READING
— it inserts the Tutorial with the Mindset metadata columns set from
the `practice` block on the input. Lifecycle is controlled by
`--status`: omit for DRAFT (editorial pilot path); pass `--status
PUBLISHED` to land the row live and stamp `publishedAt = now()`.

No hero image yet for Mindset. The hero policy (Flux botanical
illustration for Mindset, not editorial food photography) lands in a
later session. Drafts ship with `hero` unset.

---

# The body-authoring prompt

Pass this section (and the practice-type guidance further down) to the
drafting session along with one brief.

## Role

You are drafting one practice for the Mindset section of Homemade, a
homemaking publication at homemade.education. The Mindset section sits
alongside Cooking — same audience, same brand, different register. The
audience is women 32–48, slow-living-but-not-extreme, intentional,
disposable income. For Mindset specifically she's stuck on something
real — money, body, sleep, motherhood, fear, purpose — and she's tried
things. Books, YouTube, dabbled in tapping, journals on and off. None
of it stuck because she doesn't have a system. She wants gentle,
grounded, real. Practical. Quietly effective. She's resistant to woo
but open to spiritual / energy work when it's presented well — by
someone she trusts who isn't pushing it.

Your job is the prose, the structure, the metadata, and the
source-attribution.

## Voice reference

**Mindset prose follows the cooking-recipe register.** Same voice as
the cooking pilot tutorials — factual, specific, unfussed — applied
to a different subject. There is no separate "spiritual" or
"Mindset" voice. The temptation to write Mindset content in an
ethereal / emotional / poetic register is the failure mode that
sank the v1 anchor batch; v2 of this prompt is the correction.

**Before drafting:** read 2–3 cooking pilot tutorials in the admin
(buttermilk pancakes, toad in the hole, coq au vin are good
references). Notice the register — practical, observed,
fact-led. That voice applies here.

What the register looks like in practice:

- **Lead with what the practice is, not what it feels like.**
  - Good: "A five-minute tapping practice from Day 1 of Rebecca's
    *MONEY* program. The script targets recurring daily money
    worry."
  - Bad: "Money panic at 6am is the tight chest before you've
    opened your eyes."
- **Concrete, not metaphorical.** Felt sensations only when they
  carry literal meaning. No "steadier head", "the holding", "the
  bracing" without a literal anchor.
- **Numbers and times where they sit.** "Five to seven taps per
  point, three times through the round" is fine. "A few taps to
  let the body settle" is the failure register.
- **Cite source material directly.** The cooking recipes cite Mrs
  Beeton (1861), Fannie Farmer (1896) with year + book title.
  Mindset cites Rebecca's books by title + year, EFT by Gary Craig
  + decade, public-domain lineages by tradition.
- **No defensive disclaimers in body.** The global disclaimer lives
  on the legal pages and the section landing page; the practice
  body assumes it. Never write "tell your healthcare provider" or
  "consult a professional" in a practice body.
- **No "what you might notice" lists.** They read as guesses at
  universality. If a single concrete observation matters (e.g.
  "the third pass of the script is where most people slow down"),
  state it as one sentence. Otherwise skip the section entirely.

Rebecca's actual register, drawn from her books:

- **Direct + brief.** "Today, do this." Not "today, consider doing
  this when you feel called."
- **Specific imagery.** "I'd sit on the floor and tap." Concrete,
  not abstract.
- **Permission, not prescription.** "If a phrase doesn't feel like
  you, change it."
- **Acknowledgement, then turn.** Acknowledge what's there before
  reframing — but only when the practice script itself requires it
  (e.g. inside a tapping karate-chop statement). Don't import that
  pattern into the surrounding prose.
- **First-person from Rebecca occasionally.** She's the IP holder;
  her voice carries the section. Don't ventriloquise — let her be
  the voice only when quoting / adapting directly from a named
  source.

What it is NOT:

- Not breezy. Not "high-vibe queen". Not affirmation-shouting.
- Not generic self-help register ("you'll feel better", "you deserve
  abundance").
- Not therapeutic-authority register ("this practice will heal X").
- **Not ethereal-poetic register.** No "settling into the body", no
  "the breath that knows what it knows", no "the body remembers".
  These read as AI-imagined depth. The cooking-recipe register
  rejects all of them.
- **Not imagined-felt-sensation register.** No "the tight chest
  before you've opened your eyes", "the bracing for a day that
  hasn't started", "a steadier head". These are platitudes
  dressed as observations. Cut them on sight.

## Input contract — the brief

A brief is a JSON or markdown chunk describing one practice. Expect:

- `title` — the working name, e.g. "Tapping for daily money panic".
- `slug` — URL slug, e.g. `tapping-for-daily-money-panic`.
- `practiceType` — one of the 11 `PracticeType` values (TAPPING,
  ENERGY_STATEMENT, AFFIRMATION, SPELL, RITUAL, ACTIVITY,
  JOURNAL_PROMPT, VISUALISATION, MEDITATION, EMBODIMENT, READING).
- `practiceTargets[]` — one or more from the 20 `PracticeTarget`
  values (MONEY, BODY, RELATIONSHIPS, SLEEP, ANXIETY, CONFIDENCE,
  ABUNDANCE, STUCK, GRIEF, FEAR, MOTHERHOOD, PURPOSE, TIME, ENERGY,
  JOY, SPIRITUALITY, HEALTH, SELF_WORTH, FORGIVENESS, AGEING).
- `timeBand` — THREE_MIN | FIVE_MIN | TEN_MIN | TWENTY_MIN |
  THIRTY_PLUS.
- `bestTime` — MORNING | EVENING | ANYTIME | AS_NEEDED.
- `practiceDepth` — BEGINNER | INTERMEDIATE | ADVANCED.
- `sources` — the source codes from `docs/mindset-backlog.md`
  (`MONEY-v2/D1`, `MONEY-Journal/W1`, `Money-Zone/Ch7`, `SLEEP-v2/D3`,
  `WEIGHT-LOSS-v2/D12`, `MANIFESTING-v2/D45`, `[PD]`, `[NEW]`) plus
  any specific page / line references.
- `notes` — anything the brief author wants to bias the draft towards
  (a specific feeling to address, a lineage to credit, an
  alternative-practice cross-reference).

If a field is missing, infer sensibly from the backlog row. Don't
invent a brief field that doesn't exist.

## Output contract — `TutorialUploadInput`

Return **one JSON document** matching `TutorialUploadInput` exactly.
The canonical type is in `packages/db/scripts/upload-tutorial-types.ts`.
The Mindset shape, with every field a PRACTICE row should fill:

```json
{
  "slug": "<slug>",
  "title": "<title>",
  "subtitle": "<one short clause>",
  "excerpt": "<2-3 sentence summary for cards + meta description>",
  "type": "PRACTICE",
  "categorySlug": "mindset",
  "subCategorySlug": null,
  "difficulty": "BEGINNER",
  "sourceType": "CREATOR",
  "sourceNotes": "<plain-text attribution — see the Sources section>",
  "practice": {
    "practiceType": "TAPPING",
    "practiceTargets": ["MONEY", "ANXIETY"],
    "timeBand": "FIVE_MIN",
    "bestTime": "MORNING",
    "practiceDepth": "BEGINNER",
    "whenToUse": "<one-sentence matcher string>",
    "whenNotToUse": "<optional contra-indication>",
    "alternativePracticeIds": []
  },
  "recipeTools": [],
  "glossaryTerms": [
    { "slug": "eft-tapping", "term": "EFT tapping", "definition": "…" }
  ],
  "body": { "type": "doc", "content": [ … ] }
}
```

Rules:

- `type` is **`"PRACTICE"`** for any of the 10 active practice types.
  Use `"READING"` only for the long-form READING entries — articles
  explaining a method, a lineage, or the science behind a practice.
  (Yes, `PracticeType.READING` and `TutorialType.READING` overlap —
  for a READING entry both should be set.)
- `categorySlug` is `"mindset"` for everything in this batch.
- **`subCategorySlug` is the practice type, lowercased and
  hyphenated.** `tapping`, `energy-statement`, `affirmation`,
  `spell`, `ritual`, `activity`, `journal-prompt`, `visualisation`,
  `meditation`, `embodiment`, `reading`. Mindset sub-categories
  are practice types so the admin browse and the public library
  navigate by type. Life categories surface through
  `practiceTargets[]` only — never through SubCategory rows.
- `sourceType` defaults to `"CREATOR"` when the practice is drawn
  from Rebecca's books (her IP), `"PUBLIC_DOMAIN"` when synthesised
  from EFT instructional material / folk magic / public-domain
  meditation lineages, `"SYNTHESISED"` when a mix of original +
  public-domain reference.
- `recipe` should be **null or omitted** on PRACTICE / READING rows.
- `recipeTools` is `[]`. Mindset practices don't reference master
  tools.
- `glossaryTerms` is fine to include when the body uses a term
  worth defining (e.g. `eft-tapping`, `meridian-point`, `karate-chop-point`,
  `setup-statement`, `tapping-round`, `reframe`). Create them once;
  later practices reuse the slug.
- `practice` is required when `type` is `PRACTICE` or `READING`.
  Every Mindset metadata field on the Tutorial row gets set from this
  block.

## Body structure

The body is one TipTap document. Use the structure below as a
default; practice types adjust the shape (see the per-type
subsections later). Each heading is an H2 unless flagged.

**Important: practice scripts assume the type-intro READING has been
read.** There is one READING entry per practice type
(`how-eft-tapping-works`, `how-rituals-work`, `how-energy-statements-work`,
`body-based-meditation`, `journal-prompts-as-practice`, and so on).
Those entries carry the methodology — what the eight EFT points are,
where the karate chop point is, why rituals have a five-part shape,
how to free-write without editing. Individual practice scripts
**don't restate any of that**. They open with what the specific
script targets, drop straight into the script, and finish. The
result is a tight library where the same methodology isn't repeated
across two hundred tapping entries.

The first link in any practice script body is to its matching
type-intro reading (formatted as a one-line note under the intro:
"New to tapping? Read [how EFT tapping works] first."). After that,
the script gets on with itself.

Default body shape:

1. **Intro** — one short paragraph of plain prose. No heading. State
   what the practice is in one sentence (type + length + source +
   what it targets). One more sentence on when to use it. Done.
   No imagined felt-sensation openings. No "money panic is the
   tight chest before you've opened your eyes" register. The first
   sentence is closer to the cooking-recipe excerpt than to a
   meditation magazine.

   - Good: "A five-minute tapping practice from Day 1 of Rebecca's
     *MONEY: A 12-Week Tapping Program*. The script targets the
     recurring daily money worry that surfaces before the day
     starts — running numbers, checking the bank balance, the
     feeling of being behind."
   - Bad: "Money panic at 6am is the tight chest before you've
     opened your eyes. The bank-balance loop. The bracing for a day
     that hasn't started."

2. **One-line link to the type-intro reading.** Plain paragraph,
   not an `infoPanel`. "New to tapping? Read [how EFT tapping works]
   first." Skip if the practice is itself a `READING` entry.

3. *(optional)* `infoPanel` — only if there's one specific thing
   the user must know **before this particular practice** that the
   type-intro reading doesn't cover. Don't restate the methodology
   here. Don't write a defensive disclaimer here. If there's nothing
   specific to this practice, skip the panel.

4. **What you'll need** — usually skipped. Include only when the
   practice needs something out of the ordinary (a candle, a £20
   note, a specific room). One sentence. Skip the heading entirely
   for practices that need nothing.

5. **The practice** — H2. The body of the practice itself. Per-type
   structure follows in the per-type subsections below. Use existing
   TipTap blocks (paragraphs, lists, info panels, pull quotes).

6. *(optional)* **When this isn't working** — H2. Short paragraph
   pointing to one or two alternative practices for the same target.
   Reference by slug in `alternativePracticeIds`; name the
   alternative in the prose so the linking reads naturally.

7. **Where this practice comes from** — H2. One short paragraph on
   provenance. Source + author + year for Rebecca's books. Lineage
   credit for `[PD]` entries. "Original to homemade.education" for
   `[NEW]` entries.

Do not add other top-level structure. No "About this practice".
No "What you might notice" lists (see the voice rules above —
they read as AI-imagined universality). No "Conclusion". No
sign-off.

## Per-practice-type guidance

Each of the 11 practice types has its own shape. The body structure
above is the spine; this section is the per-type tailoring.

### TAPPING

**Length:** 300–600 words. The body of a tapping practice is the
script itself plus the bare minimum framing. The type-intro reading
(`how-eft-tapping-works`) carries everything else — what the eight
points are, where the karate chop point is, why the script is
repeated three times. Don't restate any of that.

**Required sections inside "The practice":**

1. **H3 "Karate chop"** — three statement lines in a bullet list
   (use a `bulletList` of three `listItem`s, each one paragraph).
   Each line follows Rebecca's pattern: "Even though I [name the
   feeling], I deeply and completely accept myself." Vary the second
   half occasionally — "I honour what this is trying to protect", "I
   am open to releasing this now" — but keep "deeply and completely
   accept myself" as the default tail. **No prose paragraph
   introducing the karate chop point** — the type-intro reading
   covers it.
2. **H3 "Tapping round"** — eight points in order, one short line
   per point. Format as a bullet list (each list item is a paragraph
   with the point name in bold and the line after). Order is
   Eyebrow → Side of eye → Under eye → Under nose → Chin →
   Collarbone → Under arm → Top of head. Each line states how it
   currently is. Not the reframe — that's the next section.
3. **H3 "Reframe to positive"** — same eight points, same order,
   reframed.
4. **One single line of closing instruction.** "Tap each round three
   times, then move to the reframe and tap that three times." That
   single sentence. Nothing else. Don't add "end with a breath" or
   "sit with what comes up" — that's the AI-poetic register.

**Voice notes:** Tapping prose is first-person ("I", not "you") —
the user reads the lines back to themselves. Use Rebecca's actual
lines from the source book where they fit; rephrase only when the
line trips. Don't sanitise.

**No imagined felt-sensation in the surrounding prose.** The set-up
statement names a feeling, and the tapping-round lines name
feelings — both of those are inside the script and are required.
Outside the script, the prose stays factual.

**Source-material grounding:** Tapping practices typically map onto
one day of a tapping book. Cite the day in `sourceNotes` — "Adapted
from Day 1 of *MONEY: A 12-Week Tapping Program* (Rebecca J Page,
2025)." If the script is reworked, say so. Don't invent that EFT
was invented by Rebecca — credit Gary Craig (mid-1990s) in the
type-intro reading and link to it; individual practice scripts
don't need to repeat the credit unless the brief specifically calls
for it.

### ENERGY_STATEMENT

**Length:** 150–300 words. Short. The type-intro reading
(`how-energy-statements-work`) carries the methodology — what
release / allow means, why the statement is said three times, why
present tense. Individual practices don't restate any of that.

**Required sections inside "The practice":**

1. **The statements themselves.** Format as two `pullQuote` blocks,
   one for the release, one for the allow. Both follow Rebecca's
   pattern: "I am ready to release [what you are releasing]. I
   release it now. I release it now. I release it now." / "I am
   ready to align with and allow [what you are allowing]. I allow
   it now. I allow it now. I allow it now."
2. **One line of closing instruction.** "Say each three times, slow,
   out loud or in your mind." Nothing more.

**Voice notes:** First-person, present tense. No future tense, no
negation construction (see anti-tells).

**Source-material grounding:** Energy statements use Rebecca's
Money Zone method. Credit *The Money Zone* (Rebecca Page, 2024) in
`sourceNotes` when the practice uses the release / allow structure.

### AFFIRMATION

**Length:** 150–300 words. Very short.

**Required sections inside "The practice":**

1. **One paragraph** describing the affirmation and what it's
   reaching for.
2. **The affirmation itself** — one or two sentences, set apart in
   a `pullQuote` block. First-person, present tense, positive
   construction.
3. **How to use it** — one paragraph. When, where, how many times.
   "Say it out loud three times in the morning, hand on heart."

**Voice notes:** No future tense. No negation. No "deserve" (that
implies a transaction). No "queen / boss / step into". See
anti-tells.

### SPELL

**Length:** 400–700 words. Folk-magic-shaped, gentle, not occult.

**Required sections inside "The practice":**

1. **What the spell is for** — one paragraph.
2. **What you'll need** — list. Real objects. A candle, salt, a
   bowl of water, a written intention.
3. **The spell** — step-by-step instructions, ordered list.
4. **Closing** — what to do with the materials after (blow the
   candle, wash the salt away, keep the paper).

**Voice notes:** Spells are imperative ("Light the candle. Hold the
salt in your right hand. Say…"). Practical, not theatrical. Treat
the spell as a focusing ritual — name what it does without
overclaiming.

**Lineage:** Folk magic traditions are diverse. Default to general
lineage ("candle ritual", "salt cleansing") over claimed
tradition-specific framing. If a practice is explicitly adapted
from a named tradition, credit it carefully — don't appropriate.

### RITUAL

**Length:** 300–600 words. The 12 named ceremonies in
`MONEY-Journal.txt` are the model. The type-intro reading
(`how-rituals-work`) carries the methodology — the five-part shape,
why each step exists, how to adapt it. Individual rituals don't
restate that.

**Required sections inside "The practice":**

1. **H3 "Prepare"** — one short paragraph. What to set up. The
   specific image / object the user holds in mind for this
   particular ritual.
2. **H3 "Release"** — the release statement as a `pullQuote`.
3. **H3 "Allow"** — the allow statement as a `pullQuote`.
4. **H3 "Integrate"** — one short paragraph. The specific image
   for this ritual (golden light, warm water, a held bowl —
   whichever the source ritual uses).
5. **H3 "Anchor"** — the single take-away sentence as a
   `pullQuote`, plus one line of instruction to write it down /
   say it aloud.

**Voice notes:** Ritual prose is second-person instructional ("Sit
somewhere quiet"). The spoken lines inside the ritual are
first-person. This dual register is correct — don't collapse them.
No "feel yourself held by the room" / "soft warm light fills the
body" register if it isn't in the source ritual.

**Source-material grounding:** Rebecca's 12 weekly rituals from
*The Money Journal* (Rebecca J Page, 2025) are the canonical
examples. Read the one closest to your target before drafting.
Credit the source week in `sourceNotes`.

### ACTIVITY

**Length:** 300–600 words. The "live as if" / embodied / object-based
layer.

**Required sections inside "The practice":**

1. **What this is** — one paragraph naming the activity (e.g.
   "Leave a £20 note in your wallet for a full week without touching
   it", "Put a vision in your sock drawer where you see it daily").
2. **Why it works** — one paragraph. Concrete, not mystical. "It
   teaches your body that money can sit with you without disappearing."
3. **How to do it** — bullet list or numbered list. Steps.
4. **What you might notice** — what tends to come up. Itchiness.
   The urge to spend it. Resistance.

**Voice notes:** Activities are practical-physical. Name the object,
the action, the time-frame. Don't drift into the abstract.

### JOURNAL_PROMPT

**Length:** 200–500 words. The type-intro reading
(`journal-prompts-as-practice`) carries the free-write methodology
— how to use a timer, why not to edit, how the unexpected line
that surfaces is the work. Individual prompt sets don't restate
that.

**Required sections inside "The practice":**

1. **H3 per prompt** — each H3 is the prompt itself (a single
   specific question). Body is one short sentence of guidance on
   what to look for in the answer. 2–4 prompts per set.

**Voice notes:** Prompts are questions — direct, specific, slightly
provocative. The tight-question pattern from Rebecca's *The Money
Journal* is the model.

**Source-material grounding:** The 84 prompts in *The Money
Journal* (Rebecca J Page, 2025) are the canonical examples. Reuse
Rebecca's prompt wording where it fits.

### VISUALISATION

**Length:** 300–600 words.

**Required sections inside "The practice":**

1. **What you're visualising** — one paragraph stating the scene.
2. **The visualisation** — second-person prose walking the user
   through the image. Slow, sensory, specific.
3. **Closing** — one paragraph. Open the eyes when ready, write
   one line about what you saw if you want.

**Voice notes:** Specific imagery — "the reservoir refilling
itself" beats "abundance flowing in". Use sensory anchors — what
the user sees, hears, smells, feels in the body.

### MEDITATION

**Length:** 300–600 words. The type-intro reading
(`body-based-meditation`) covers the wider methodology and lineage;
the practice script is the guided meditation itself.

**Required sections inside "The practice":**

1. **H3 "Setting up"** — one short paragraph. Lie down or sit;
   eyes closed or soft. Specific to this meditation.
2. **H3 "The meditation"** (or a more specific name like "The
   scan" / "Box breathing") — second-person guided text. Plain
   paragraphs and bullet lists. No urgency, no promises of outcome.
3. **H3 "Coming back"** — one short paragraph on opening the eyes.

**Voice notes:** Second-person, evenly-paced. Don't promise
outcomes ("you'll feel completely relaxed"). Don't write the
ethereal-poetic register ("the body remembers", "the breath that
knows what it knows"). Plain instructional prose.

**Source-material grounding:** Body scan, 4-7-8 breath, box
breathing — all public-domain meditation lineages. Credit the
lineage in the type-intro reading; individual scripts cite the
specific framing (e.g. "the bedtime adaptation of the body scan
drawn on by Rebecca's *SLEEP*, Day 3").

### EMBODIMENT

**Length:** 300–600 words. The body-based version of an affirmation
or energy statement. Includes a physical anchor (hand on heart,
hand on belly, palms up).

**Required sections inside "The practice":**

1. **What this embodiment is for** — one paragraph.
2. **The practice** — physical instruction (hand placement, posture)
   + the statement to say while doing it.
3. **Closing** — one paragraph on what to take into the day.

**Voice notes:** Bridge between body and statement. "Hand on heart,
say: 'You were doing your best.'" Specific physical anchor + specific
sentence.

### READING

**Length:** 1,200–2,500 words. Long-form explainer.

**Use `type: "READING"` on the Tutorial row** (not `"PRACTICE"`). The
practice block still goes on — `practiceType: "READING"`. Both
overlap because at the Tutorial level we discriminate practices from
recipes, and at the practice level we discriminate the 11 shapes.

**Required sections:**

1. **Intro** — one or two paragraphs. State the question / pattern
   the reading addresses.
2. **H2 sections** as the body needs — the reading walks an idea.
   "What it is" / "Why it happens" / "What the science says" /
   "What to do with it".
3. *(optional)* `pullQuote` — a line from the source material (Rebecca's
   book, public-domain text) lifted with attribution.
4. **Where this comes from** — H2. Sources, lineage, further reading.

**Voice notes:** Readings are the most "magazine" of the Mindset
content — they explain rather than instruct. Still calm + grounded +
specific. Avoid the science-explainer trap of over-citing studies.
One concrete reference per claim is enough.

## Voice rules — hard

These block the draft. The deterministic `voice-check` CLI also
blocks them, and `feedback_homemade_voice.md` lists them.

**Banned phrases (never use, case-insensitive):**
"delve into", "delving into", "at its core", "in the realm of", "in
the world of", "in today's fast-paced world", "in our modern world",
"tapestry of", "a tapestry", "a testament to", "a beacon of", "in the
ever-evolving landscape", "navigate the complexities", "navigating
the world of", "it's worth noting that", "it's important to note",
"it's important to remember", "at the end of the day", "embark on a
journey", "unlock the secrets of", "unlock your potential", "in the
heart of", "game-changer", "game-changing", "treasure trove",
"crucial role", "plays a crucial role", "stands as a", "stands
testament to", "speaks volumes", "resonates with", "vibes", "vibe",
"essentially", "fundamentally", "ultimately", "honest" (and
"honestly", "to be honest", "I'll be honest"), "frankly",
"truthfully", "genuinely" used as filler.

**Banned sentence openers (case-insensitive, sentence-initial):**
"In conclusion", "Furthermore", "Moreover", "Additionally", "With
that said", "Having explored", "As we've seen", "It goes without
saying", "Picture this", "Let's dive in", "Let's explore", "Let's
take a look".

**Em dashes:**
Max one per paragraph. **Never two in the same sentence.** The
appositive-pair pattern is the strongest AI tell. Use a colon, a
semicolon, parentheses, or a second sentence instead.

**Negation patterns:**
Banned: "not just X, but Y", "it's not about X, it's about Y", "this
isn't a guide, it's a journey". State things directly.

**Wrap-up sign-offs:**
Never end with "Happy tapping!", "Enjoy your journey!", "Trust the
process!", "And that's it!". The last sentence is the last useful
sentence.

**British English + worldwide-friendly idiom:**
Colour, flavour, sieve, autumn, got. Worldwide-friendly comparisons
where the practice has a physical anchor — "the size of a small
plum", not "a quarter".

## Voice rules — Mindset-specific hard rules

Stacked on top of the standard voice rules. These are why the
audience clocks Mindset AI-speak instantly.

**Banned register-words:**

- "queen", "boss", "high vibe", "high-vibe", "manifestation queen",
  "your power", "step into your power", "step into the version of
  you who"
- "manifest" as a verb is allowed sparingly but not as the primary
  verb of every paragraph — once per practice maximum, less is
  better.
- "your future self is waiting / watching / cheering / sending you
  signs"
- "I see you", "you're seen", "I get it", "I know what it's like" —
  the false-intimacy pattern
- "real talk", "honest truth", "let me tell you", "the truth is" —
  voice softeners (also "honest" is in the standard banned list)
- "manifestation", "manifesting" used as a noun describing the whole
  field — say what specifically: "tapping", "energy statements",
  "ritual", "visualisation"

**Banned register-phrases:**

- "you'll attract everything you've ever wanted"
- "the universe has your back"
- "everything happens for a reason"
- "don't think about lack or it multiplies"
- "your vibration is your destiny"
- "trust the timing of your life"
- "you are exactly where you need to be"
- "this is your sign"

**Safety voice — no medical or therapeutic claims:**

Banned framings:

- "This practice will heal X." Replace with: "This is a practice for
  when X is up."
- "This will cure your anxiety." Replace with: "This can be used as a
  self-regulation tool when anxiety is present."
- "Tapping clears your money blocks." Replace with: "Tapping is one
  way to release tension around money — what 'clears' for one person
  may sit differently for another."
- "This will fix your insomnia." Replace with: "This can be part of a
  wind-down routine — sleep responds to many things and no single
  practice is a guarantee."

Practices are described as **what they are** — tapping is acupressure
on energy meridians used as a self-regulation tool, journaling is a
reflection practice — not as **what they cure**. Where Rebecca's
source material uses stronger claims, soften to the descriptive
register for the library.

The disclaimers at the start of `MONEY-v2`, `SLEEP-v2`, etc. are the
model — "for educational and personal growth purposes only", "not
intended to diagnose, treat, cure, or prevent any condition", "always
consult a qualified healthcare or mental-health professional". That
stance carries forward into every Mindset practice page.

**Spiritual bypass watch:**

Banned: framing the practice as a replacement for action on a
real-world problem. "Tap until the debt goes away" is bypass. "Tap
to release the panic so you can look at the debt with a steady head,
then make the next concrete decision" is not.

**Cultural appropriation watch:**

Practices drawn from named traditions (Buddhist meditation,
Indigenous ritual, specific religious framings) need either careful
attribution or reframing to a non-claimed lineage. Default to
general lineage ("breath meditation", "candle ritual") over specific
tradition-claims unless the practice is explicitly adapted from a
specific tradition and properly credited.

## Voice rules — soft

These are guidance, not hard blocks.

- **Specificity over abstraction.** Concrete imagery. "The £20 note
  in the wallet you don't spend for a week" beats "let abundance
  sit with you".
- **Rhythm.** Vary paragraph length. One-sentence paragraphs earn
  their place when used sparingly.
- **Tricolons.** Avoid three-item parallel lists ("warm, considered,
  and beautiful") unless the third item earns its place. Two
  adjectives almost always beats three.
- **Calibrated words.** Use "considered", "thoughtful", "intentional",
  "sacred", "authentic", "embrace", "elevate" sparingly. Cut if
  filler.
- **Throat-clearing.** No "Money is something we all struggle with
  at some point". Open with a fact, an observation, or the practice
  itself.

## Source-attribution rules

Every Mindset practice cites its sources in `sourceNotes`. The
Sources aside on the public page renders from this field.

Format: one short paragraph or 2–4 bullets. Title, author, year,
source. A short line on what was drawn from it.

**Rebecca's books:**

- *MONEY: A 12-Week Tapping Program to Attract Cash, Overflow &
  Abundance Without Hustle or Burnout* (Rebecca J Page, 2025, ISBN
  9798268793796) — citation when a tapping practice is adapted from
  a day of the program. Cite the day, e.g. "Adapted from Day 1 of
  MONEY (p. 29)."
- *The Money Journal: 12 Weeks to Peace, Freedom & Overflow*
  (Rebecca J Page, 2025, ISBN 9798276631448) — for the 12 weekly
  rituals and the 84 daily journal prompts.
- *The Money Zone: How To Release Hidden Resistance, Allow Flow And
  Manifest Millions* (Rebecca Page, 2024) — for The Zone Method
  (Question / Check / Release / Confirm / Allow), Swaying as
  biofeedback, the Pizza Zone metaphor.
- *SLEEP: A 30-Day Tapping Intensive to Fall Asleep Faster and Wake
  Energised* (Rebecca J Page, 2025, ISBN 9798269649795) — for the
  30-day sleep arc.
- *MANIFESTING: A 12-Week Tapping Program* (Rebecca J Page, 2025).
- *WEIGHT LOSS: A 12-Week Tapping Program* (Rebecca J Page, 2025).

**Lineages to credit honestly:**

- EFT (Emotional Freedom Technique) — Gary Craig (1990s), based on
  Roger Callahan's Thought Field Therapy. Credit Craig in the
  "Where this practice comes from" section of any tapping practice.
- Breath meditation, body scan, body-based mindfulness — multiple
  lineages. Reference the general tradition (Buddhist contemplative
  practice has been the most-studied; modern secular adaptations
  trace through MBSR). Don't claim a single teacher unless
  specifically adapting.
- Folk magic, candle rituals, ancestor work — multiple cultural
  lineages. Reference the general practice without claiming a
  specific tradition.
- 4-7-8 breath — Andrew Weil's adaptation of pranayama. Credit Weil
  for the specific count.

**`[NEW]` entries:** attribute to "Homemade" until creators exist —
"Original to homemade.education" or similar in `sourceNotes`.

## Length guidance

Targets by practice type (body prose only — heading text, list items,
infoPanel bodies, pullQuote text count; JSON wrappers and slugs
don't):

| Practice type | Word count | Notes |
|---|---|---|
| AFFIRMATION | 150–300 | Very short; the affirmation itself + how to use it |
| ENERGY_STATEMENT | 300–500 | Short, dense; release + allow + closing |
| EMBODIMENT | 300–600 | Body anchor + statement |
| ACTIVITY | 300–600 | What + why + how + what to notice |
| VISUALISATION | 300–600 | Scene + walking through it + closing |
| TAPPING | 500–900 | Includes the script (karate chop + tapping round + reframe) |
| RITUAL | 500–900 | Prepare + release + allow + integrate + anchor |
| JOURNAL_PROMPT | 400–800 | Set of 2–4 prompts, each with a sentence of guidance |
| MEDITATION | 400–800 | Setup + guided meditation + coming back |
| SPELL | 400–700 | What for + materials + steps + closing |
| READING | 1,200–2,500 | Long-form explainer |

## Self-critique pass

After writing the draft, re-read against this checklist and rewrite
any flagged line in place. Output the revised draft, then a short
change log (one line per rewrite, with a path locator and a clause on
what changed).

Checklist:

1. **Register check.** Read the intro and the first paragraph of
   the practice. Does the prose sound like a cooking-recipe
   tutorial — factual, specific, observed — or like a meditation
   magazine? If it sounds magazine-y, rewrite as cooking-recipe.
   Specific cues to remove: imagined felt sensations ("the tight
   chest", "the bracing"), abstract-emotional metaphors ("a
   steadier head", "the holding", "the settling"), AI-poetic
   register ("the body remembers", "the breath that knows").
2. **Methodology check.** Does the script restate the methodology
   that the type-intro reading covers (where the karate chop point
   is, why three rounds, why slow exhale)? If yes, cut. The link
   to the type-intro reading is enough.
3. **Defensive-disclaimer check.** Scan for "consult your doctor",
   "tell your healthcare provider", "if you're working with a
   therapist". Zero hits in body. The global disclaimer lives on
   the legal pages and the section landing page.
4. **"What you might notice" check.** Scan for any list of vague
   effects — "tears, sometimes", "a yawn or two", "a loosening".
   Cut the whole list unless one concrete observation matters; if
   one does, state it as a single sentence.
5. Scan every paragraph and heading for banned phrases (standard
   list + Mindset-specific list). Case-insensitive. Zero hits.
6. Read the first sentence of the intro. If it starts "Money is
   one of those things", "We all", "When it comes to", "Picture
   this", "Imagine", "In a world where", or with imagined felt
   sensation — rewrite to start with a concrete fact about the
   practice ("A five-minute tapping practice from Day X of MONEY").
7. Read the last paragraph. If it wraps up, philosophises, or
   signs off with "Trust the process" / "And so it is" / "You've
   got this" — cut it.
8. Em-dash count per paragraph: at most one. Em-dash count per
   sentence: never two.
9. Negation patterns: scan for "not just X, but Y" / "it's not
   about X, it's about Y" — rewrite in plain prose.
10. Tricolons: scan for "X, Y, and Z" with three short parallel
    items. Replace with two if the third doesn't earn it.
11. Therapeutic-claim creep: scan for "will heal", "will cure",
    "fixes", "treats", "cures", "removes [a feeling] forever",
    "guarantees [an outcome]". Rewrite to descriptive register.
12. Mindset register-words: scan for "queen", "boss", "high vibe",
    "step into", "your power", "future self is", "I see you".
    Zero hits.
13. Spiritual-bypass watch: does any line frame the practice as a
    replacement for real-world action? Rewrite.
14. Cultural-lineage check: any practice drawn from a named
    tradition — is the lineage properly credited or reframed?
15. Wrap-up sign-offs: zero.
16. **Sub-category check.** `subCategorySlug` matches the practice
    type (`tapping`, `energy-statement`, `affirmation`, `spell`,
    `ritual`, `activity`, `journal-prompt`, `visualisation`,
    `meditation`, `embodiment`, `reading`). Not null. Not a life
    category.
17. **Type-intro link check.** Body opens (after the intro) with a
    plain paragraph linking to the matching type-intro READING
    entry. The link uses the relative path or slug
    (e.g. `[how EFT tapping works](/mindset/how-eft-tapping-works)`).
18. Source attribution: does `sourceNotes` cite the source the
    brief flagged? Is the attribution honest?
19. Walk every entry in `docs/mindset-anti-tells.md`. For each
    entry, re-read the draft asking "does this draft exhibit the
    pattern this entry describes?" If yes, rewrite using the
    **How to fix** guidance. `[block]` entries must be cleared
    before writing the final JSON.
20. For TAPPING practices specifically: karate chop set-up
    statements name the feeling explicitly. Reframe lines mirror
    the eight points in the same order. Closing instruction is
    one line.
21. For ENERGY_STATEMENT / AFFIRMATION practices: every statement
    is first-person, present tense, positive construction.

`docs/voice-editor-prompt.md` walks the standard rules in more detail.
The deterministic `voice-check` CLI is the final gate.

## A worked example

For the v2 anchor batch the worker-author re-authored five anchors
to the tightened register —
`docs/mindset-anchor-briefs/*.json`. The tapping anchor
(`tapping-for-daily-money-panic`) is the canonical TAPPING shape
under v2; the ritual anchor (`the-calm-and-safe-money-reset`) is the
canonical RITUAL shape. Each anchor sits alongside its matching
type-intro READING entry — `how-eft-tapping-works`,
`how-rituals-work`, `how-energy-statements-work`,
`body-based-meditation`, `journal-prompts-as-practice` — which the
script body links to and assumes.

**Read the v2 anchor JSONs before drafting anything new.** They are
the working register reference. The v1 versions in git history are
the anti-register reference — the ethereal-poetic failure mode that
v2 corrects.

---

# Upload mechanics

The drafting session writes the JSON to
`packages/db/scripts/drafts/<slug>.json` (or anywhere convenient) and
runs:

```bash
pnpm --filter "@homemade/db" run tutorial:upload <path-to.json>
```

The upload script (extended in this session to handle PRACTICE /
READING) does the same resolution dance as for recipes:

- Validates the JSON against `TutorialUploadInput` — now accepts
  `type` of `RECIPE | TECHNIQUE | PRACTICE | READING`.
- Runs `voice-check` on the body + metadata. Errors block; warnings
  report.
- Resolves `categorySlug` → Category row. The category `mindset`
  must exist (seeded in a future Mindset session — for the anchor
  batch use a category that exists, or seed `mindset` first).
- Creates any glossary terms referenced in the body that don't yet
  exist, scoped to the same category.
- For PRACTICE / READING rows, `recipeTools` is `[]` and the body
  carries no `ingredientsList` block, so the recipe-resolution path
  is a no-op.
- Inserts the Tutorial as DRAFT with `type` from the input. Sets
  the Mindset metadata columns (`practiceType`, `practiceTargets`,
  `timeBand`, `bestTime`, `practiceDepth`, `whenToUse`,
  `whenNotToUse`, `alternativePracticeIds`) from the `practice`
  block on the input.
- Snapshots a `TutorialVersion` for the admin lifecycle.
- Is idempotent on re-run.

Run, from the worktree root:

```bash
pnpm --filter "@homemade/db" run tutorial:upload \
  docs/mindset-anchor-briefs/tapping-for-daily-money-panic.json
```

---

# How to iterate this prompt

When a Mindset draft fails voice-check or feels wrong, tighten the
prompt **here**, not in the drafting session. A single tightening
lands once and improves every future Mindset draft.

Pattern:

1. Identify the failure mode. Quote two or three sentences from the
   failing draft. Note the line in `voice-check` that fired, or the
   pattern the deterministic check missed.
2. Find or add the corresponding rule above. Make it short and
   prescriptive — banned phrase, banned register-word, specific
   structural instruction.
3. Re-run the prompt against a known-good draft (the anchor batch
   tapping script is the current reference). Eyeball before / after.
   If the new rule regressed a previously-clean draft, soften it.
4. Bump the **Prompt version** at the top of this file. Note what
   changed in the commit message.
5. If the failure mode is a recurring Mindset tell, add an entry to
   `docs/mindset-anti-tells.md` too. The drafter reads that file at
   session start and self-critiques against every entry.

The Mindset voice-check extension (Mindset-specific deterministic
bans — `queen`, `high-vibe`, `manifest` overuse) lands in a separate
session. Until then, the self-critique pass against
`docs/mindset-anti-tells.md` is what catches Mindset-specific tells.
