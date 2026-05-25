# Voice spec — 2026-05-21

Author: strategy / planning session (Opus 4.7). Status: **draft for Rebecca's
review.** Autopilot stays paused until this spec is approved, the retrofit plan
is signed off, and the new author prompt and voice-check rules are in place.

This document expands the rules locked in
`feedback_homemade_voice.md` (the 2026-05-21 additions, in particular the
grade 6-8 / Sources-block / numbered-steps rules) with worked examples per
content type and a concrete retrofit plan for the published library. It does
NOT replace the memory file — the memory file is canonical for the rules; this
spec is the field manual for applying them.

---

## 1. Executive summary

### Where we are

The library has ~3,500 PUBLISHED tutorials across cooking, baking, mindset,
herbal-medicine, home-repair, natural-home, sustainability, animals-smallholding,
sewing, knitting, crochet, pottery-ceramics, fibre-arts, needlework, paper-craft,
gardening, and wood-craft. A 2026-05-19 audit found ~10% violating the rule set
that existed at that point — mostly false-specificness (rule 3) and
orientation-before-depth (rule 7). That audit did NOT check reading level. It
did not flag historical citations in body prose, institutional names in body
prose, year-only references, prose-style sequential steps, or unflagged
clinical/Latin vocabulary.

The published thyme cough syrup tutorial is the canonical exemplar of what's
wrong. Its first paragraph stacks four unexplained references (Culpeper, 1652,
German Commission E, "upper respiratory catarrh") on a reader who has never
made a herbal preparation in her life. It is plagiarism-grade citation density
read out as if it were the recipe. A real reader closes the tab.

### Where we need to be

A Homemade tutorial reads like Mary Berry or Martha Stewart wrote it:
warm-knowledgeable, instruction-led, mostly grade 6-8, with the academic
provenance available — at the bottom, in a Sources block, for the reader who
wants reassurance the content isn't invented.

Concrete tests for whether a paragraph is in register:

- Could a 12-year-old read it aloud and roughly understand?
- Are the longest words 3 syllables or fewer (rare exceptions for unavoidable
  craft terms, all tooltipped)?
- Are sentences mostly 8-15 words?
- Does it sound like a knowledgeable friend explaining at the kitchen table?
- Could a reader skim the page in 30 seconds and know what she is about to
  do, in what order, with what kit?

### Why this matters

The brand's edge is sounding like a real person who knows her craft. AI slop
is about to flood the homemaking internet; Homemade's positioning is the
opposite. The thyme intro reads exactly like a model trying to look credible —
academic citation as a substitute for confidence. We lose the edge on the
first page a new visitor lands on.

### The plan

1. **Lock the spec per content type.** Eight content types, each with an
   opening pattern, worked rewrite of a current bad-register example, a
   Sources-block convention, and a "technical notes" convention for the
   reader who wants depth. See §3.
2. **Retrofit the published library.** Phased Sonnet-worker sweep, prioritising
   herbal-medicine and other academic-citation-prone categories first, then
   the mindset reading pieces, then home-repair / sustainability /
   natural-home, then a lighter pass over cooking / baking which is mostly
   in voice already. See §4.
3. **Update the autopilot author prompt** before unpausing. New text in §5.
4. **Extend voice-check with grade-level, institutional-name, and step-shape
   rules.** Existing script catches ~10%; new rules will catch the rest. See §6.
5. **Open decisions for Rebecca.** See §7.

---

## 2. Voice reference research

Five reference voices, characterised in 3-4 bullets each. The aim is
calibration, not imitation — Homemade's voice is its own composite, but these
voices anchor what "good" looks like in each register.

### Martha Stewart (Living, baking handbooks)

- **Opening pattern.** Most recipe headnotes open with a single short
  declarative on what the dish is or what makes it work. ("Brown butter gives
  these cookies a nutty depth.") She rarely opens with "Let me tell you
  about" or "There's something wonderful about" — the headnote earns the
  reader's attention by being useful.
- **Sentence length.** Mostly 10-18 words, occasional shorter sentences
  for emphasis. No flourishes. Information-dense.
- **Technique handling.** Critical technique surfaces in the headnote in
  plain English ("Chill the dough overnight so the flour fully hydrates"),
  not in academic terms ("the autolyse phase improves enzyme activity").
- **Sources.** Almost never in headnotes. Provenance is implicit — Martha is
  the source. Where she draws on tradition ("a New England classic", "what
  my grandmother called dump cake") she names it in one short clause.
- **Make-ahead and storage.** Always called out. Practical-led.

### Barbara O'Neill (recorded talks, transcribed remedies)

- **Opening pattern.** Names the thing and what it's for in one clause. Then
  one to two clauses on the traditional use, in factual+cultural framing.
  "Honey and onion is an old kitchen cough syrup. Cooks have made it for
  generations."
- **Sentence length.** Spoken-register short. 6-14 words. Pauses where most
  writers would put a comma.
- **Source handling.** Cites tradition, not regulators. ("Mothers have used
  this for centuries.") When she names a study she does it once and moves
  on. She doesn't pile citations.
- **No clinical vocabulary in the body.** Where she could say "antispasmodic"
  or "expectorant" she says "calms the cough" or "loosens the chest". The
  word "catarrh" doesn't appear.
- **No prescriptive dose language.** "A teaspoon, three times a day" framed
  as traditional dose, not medical instruction.

### Nigella Lawson (How to Eat, Cook Eat Repeat)

- **Opening pattern.** Often opens with a sensory cue or a personal moment.
  "The pasta water comes to a boil and rises up excitedly." Recipes have a
  recognisable author behind them.
- **Sentence length.** Variable. Long sensory sentences sit next to short
  declarative ones. Rhythm-aware.
- **Source handling.** Almost none. Nigella's authority is her enjoyment;
  citations would dilute it.
- **Useful caveat for Homemade.** Her warmth is the goal; her looseness is
  not. Homemade tutorials need to be instruction-led even when warm.
  Borrow the sensory register, not the rambling shape.

### Erin Boyle (Reading My Tea Leaves)

- **Opening pattern.** Names a concrete object or situation in the first
  line. "A label that pulls cleanly off the glass jar." No scene-setting,
  no abstraction.
- **Sentence length.** Variable. Often fragments. Always concrete.
- **Source handling.** Essays don't cite. Reading My Tea Leaves is
  observational writing; provenance is irrelevant to the form.
- **Restraint.** No three-item parallel lists, no triadic adjective stacks.
  Two words where most writers would use four. This is the closest live
  example of the rule already in the voice memory.

### Mary Berry (Baking Bible, Baking Special)

- **Opening pattern.** Single-sentence headnote that names the secret to the
  dish in plain English. From the Classic Special Scones recipe: "The secret
  of a good scone is not to have the mixture too dry and not to handle the
  dough too much." Twenty-one words. No headnote padding. No reference to
  any external source. One sentence and the reader knows what matters.
- **Sentence length.** Short. The recipes themselves are usually 5-9 numbered
  steps; each step is 10-20 words.
- **Technique handling.** Inline, plain English, no jargon. "Rub the butter
  in until the mixture resembles fine breadcrumbs." The technique is the
  description; no separate gloss needed.
- **Source handling.** None in body. The book has an editor's introduction
  for context.

### Three most useful insights from the cross-voice read

1. **The most accessible voices put the secret of the dish in the first
   sentence.** Mary Berry's twenty-one words on scones is a complete
   orientation. Homemade tutorials should aim for this density of usefulness
   in the first paragraph — not paragraphs of throat-clearing or citation.
2. **None of the reference voices put academic citations in body prose.**
   Martha doesn't. Barbara doesn't. Nigella doesn't. Mary doesn't. Erin
   doesn't. The instinct to cite Culpeper in the intro is purely an AI-trying-
   to-look-credible tic. Real food and craft writers don't write that way.
3. **Concrete objects beat abstract framing every time.** Boyle opens with a
   label peeling off a jar. Berry opens with the moisture of dough. The
   strongest opening sentence in any tutorial names a real thing — an
   ingredient, a piece of kit, a step, a smell, a yield — not a concept.

---

## 3. Locked voice spec per content type

Each content type has the same backbone (orientation → kit → ordered steps →
sources). The opening pattern, the kit shape, and the sources convention vary
by type. The voice register is constant across all of them: grade 6-8, warm,
instruction-led.

The structural blocks are already defined in
`docs/tutorial-author.md` and enforced by the upload pipeline. This spec
focuses on the prose that goes inside them.

### Common rules across all content types

- **Orientation paragraph first.** One paragraph, 2-4 sentences, plain
  English. What this is, what you get, roughly how long. No jargon, no
  citations, no historical preamble. The reader decides in three lines
  whether to keep going.
- **No academic citations in body prose.** Years (1652, 1882), institutional
  names (German Commission E, BHP, FDA, MHRA, NHS, RHS, USDA), historical
  figures (Culpeper, Beeton, de Dillmont, Caulfeild) — all go to the Sources
  block at the bottom. Never in the orientation, the steps, or the closing.
- **No clinical / Latin / domain Latin vocabulary in body prose.** If the
  word would make a reader reach for a dictionary, it goes in a
  glossaryTooltip or it gets replaced with plain English. "Catarrh" →
  "chest congestion". "Expectorant" → "loosens phlegm". "Decoction" →
  tooltipped or "simmered in water".
- **Sequential steps are an `orderedList`, never prose.** "First. Then.
  Next. Finally." in prose is a numbered list written badly.
- **Sentences mostly 8-15 words.** Vary length — short sentences for
  emphasis, longer ones for sensory moments. Avoid the topic-sentence-plus-
  three pattern.
- **No wrap-up close.** The last useful sentence is the last sentence. No
  "Happy baking", no "Remember that ...", no philosophical sign-off.
- **No safety advice block.** One compressed inline line if the craft
  genuinely demands it. See `feedback_homemade_voice.md` for the safety
  pattern.
- **British spelling. Worldwide-friendly idiom.** No 50p / quarter / pint
  references without context.
- **All glossary entries used inline. All tooltips registered.** Enforced
  by voice-check.

### 3.1 Recipe (cooking + baking)

The default category. The biggest part of the library.

**Locked opening pattern (orientation paragraph):**

```
[What the dish is, in one short clause.] [What it gives you, in one
sentence — texture, flavour, yield, time.] [One sentence on what makes
it work or what to watch for.]
```

Optional second short paragraph: a single sensory or practical note (the
smell at a stage, the colour at finish, the way the kitchen feels). Earn
the second paragraph by having something specific to say. Otherwise stop
at the first.

**Worked rewrite — bad to good.**

Original (real PUBLISHED intro, lightly edited to anonymise):

> "There is something deeply satisfying about a properly made shortcrust
> pastry. In the world of baking, few skills are as foundational as the
> ability to bring together flour, fat, and water into a workable dough.
> The technique has been documented since Hannah Glasse's *The Art of
> Cookery Made Plain and Easy* (1747), and the French term *pâte brisée*
> reflects its place in the continental tradition. Mastering this dough is
> essentially the first step on a journey toward more advanced patisserie."

Rewrite in register:

> "Shortcrust is the basic short pastry — flour, cold butter, a little
> water — for pies, tarts, and quiches. The job is to keep the butter
> cold and stop short of overworking the dough. Get those two right and
> the pastry comes out crisp and tender. About 15 minutes' work; the
> dough needs an hour in the fridge before rolling."

What changed:

- "There is something deeply satisfying" → cut. No throat-clearing.
- "In the world of baking" → banned phrase. Cut.
- Hannah Glasse 1747 → moves to Sources block.
- "pâte brisée" → cut from body. Optional in a Sources note for the
  reader who wants the etymology.
- "essentially the first step on a journey" → banned filler + banned
  metaphor. Cut.
- New first sentence is concrete: what it is and what it's for.
- Practical second sentence: what to watch for.
- Yield + time at the end of the orientation paragraph.

**Sources block convention.** Every PUBLISHED recipe carries a
`sourceNotes` field; the public renderer surfaces it at the bottom of the
page under a "Sources" heading. Format: one bullet per source, plain
prose. Title, author, year, archive identifier where there is one, and
one clause on what was drawn from it. For example:

> Hannah Glasse, *The Art of Cookery Made Plain and Easy* (1747) — Project
> Gutenberg #36405. Short-pastry method and proportions.

Pre-1928 cookery books, USDA / NCHFP, agricultural extension services, and
pre-1928 newspaper columns are the standing acceptable sources for
cooking and baking. Where the source material is thin, set
`sourceType: "SYNTHESISED"` and cite the next-closest text.

**"Technical notes" section convention.** Optional H2 near the bottom,
between Variations and Sources. Use it for the reader who wants the
chemistry / history / etymology, where it would clutter the body. Common
contents:

- The science of why the technique works (gluten development, Maillard,
  emulsion stability).
- The historical or regional origin of the dish, with dates and source
  references.
- The naming convention (etymology of pâte brisée, regional spelling
  variants).

Keep it to one or two short paragraphs. The reader is opting in;
volunteering more than she asked for is the AI tic the spec is fighting.
If there's nothing useful to add, skip the section entirely.

### 3.2 Herbal medicine remedy

The category with the most acute voice problem. The thyme cough syrup is
the canonical bad example.

**Locked opening pattern:**

```
[Name the preparation in plain English: what it is, what it's made of.]
[State factually what tradition has used it for — no efficacy claims.]
[One sentence on what to expect: texture, taste, yield, time.]
```

The pattern from `feedback_homemade_voice.md` already covers most of this
("traditional / cultural framing for remedies"). The clarification for
this spec: NO institutional or historical references in any of the three
sentences. Tradition is named without naming whose tradition.

**Worked rewrite — the canonical bad intro.**

Original (PUBLISHED, [thyme-cough-syrup](docs/herbal-bulk-001-briefs/thyme-cough-syrup.json)):

> "Thyme simmered in water, strained, cooled, and stirred into honey.
> This is the kitchen's oldest cough remedy, the combination of thyme's
> antispasmodic and expectorant action with honey's coating and preserving
> properties makes a syrup that soothes a dry, tickling cough and helps
> loosen stubborn mucus. Culpeper (1652) prescribed thyme for coughs and
> chest complaints; the German Commission E, which reviews traditional
> herbal medicines, confirms its traditional use for upper respiratory
> catarrh. The preparation is quick, about 40 minutes from the kitchen
> to the medicine shelf."

Rewrite in register:

> "Thyme syrup is a sweet, dark syrup of fresh thyme simmered in water
> and stirred into honey. A kitchen tradition long made for dry, tickly
> coughs and a sore chest. The thyme softens the cough; the honey coats
> the throat and keeps the syrup good in the fridge for about three weeks.
> About 40 minutes' work, mostly waiting for the thyme to simmer."

What changed:

- Fragment first sentence ("Thyme simmered in water, strained, cooled, and
  stirred into honey.") → full sentence with what the result is. The
  reader doesn't need to assemble the noun from a list of verbs.
- "kitchen's oldest cough remedy" → "a kitchen tradition long made for".
  Factual + cultural framing. No "oldest" claim we can't substantiate.
- "antispasmodic and expectorant action" → "softens the cough".
- "Culpeper (1652)" → Sources block.
- "German Commission E, which reviews traditional herbal medicines,
  confirms its traditional use for upper respiratory catarrh" → Sources
  block. The "which reviews" gloss is a tell that the writer knows the
  reader doesn't know what the Commission is. If the reader doesn't know,
  the reference doesn't belong in the body.
- "upper respiratory catarrh" → "a sore chest".
- Closing time-and-yield line kept.

**Sources block convention.** Herbal remedies cite:

- One classic herbal — Culpeper (1652), Gerard (1597), Grieve (1931),
  Quincy (1718). Project Gutenberg ID where available.
- One modern monograph review where appropriate — German Commission E,
  ESCOP, EMA HMPC. Named explicitly so the reader can cross-check.
- The category-specific archive if relevant (NCCIH, MHRA traditional-use
  register).

One bullet per source. Plain prose. Two clauses max — citation + what
was drawn from it.

**Medical disclaimer placement.** The single locked phrasing ("Not medical
advice. Consult a medical professional for ongoing or serious symptoms.")
goes once, in an infoPanel at the foot of the body or appended to the
sources block. Not in the orientation. Not after every step. Not in three
variant phrasings across the page.

**"Technical notes" section convention.** Optional H2 between the body
and the Sources block. This is where institutional references, the
clinical pharmacology, the constituents, and the historical context live
— for the reader who came to the page already knowing what an
expectorant is. Two short paragraphs maximum. Keep it factual,
non-prescriptive, no efficacy claims.

Example structure for the thyme syrup:

> ## How it works
>
> Thyme contains volatile oils, mainly thymol and carvacrol, which give
> the herb its strong scent and traditional reputation for soothing a
> cough. Honey is a stable carrier — its low water content and natural
> acidity keep the preparation good for several weeks when refrigerated.
>
> ## Tradition
>
> Thyme has been used in European kitchen medicine for a long time. The
> 17th-century herbalist Nicholas Culpeper wrote about thyme for coughs
> and chest complaints. The German Commission E, a modern review board
> for traditional herbal medicines, lists it for the same use. See the
> Sources block below for citations.

The institutional names are allowed here because they sit under a heading
that signals "opt in for the academic context". The bulk of the page
doesn't carry them.

### 3.3 Mindset practice

Already has a structural spec in
[project_mindset_structure.md](C:\Users\Rebecca\.claude\projects\C--Users-Rebecca-Projects-code-homemade\memory\project_mindset_structure.md)
and a voice rule in
[feedback_mindset_voice.md](C:\Users\Rebecca\.claude\projects\C--Users-Rebecca-Projects-code-homemade\memory\feedback_mindset_voice.md).
The grade 6-8 rule reinforces both.

**Locked opening pattern:**

```
[Name the practice in plain English — what you'll do, in one short
clause.] [State what it's for — one sentence on the intended shift.]
[One sentence on what it'll feel like or how long it'll take.]
```

**Voice register specifics for Mindset bodies:**

- Read factual, like a recipe. Not ethereal, not poetic, not
  ceremony-language. The memory file's wording: "factual / cooking-recipe-
  clean, not ethereal AI-poetry".
- No generic emotional platitudes ("your nervous system is wise", "your
  body knows the way home", "you are safe in this moment").
- No defensive disclaimers in body ("this might feel uncomfortable",
  "go gently with yourself"). Trust the reader.
- No "what you might notice" vague lists. State what to do, what to
  expect. If a sensation is genuinely likely, name it specifically.

**Worked rewrite — bad to good.**

Original (illustrative, drawn from the voice-audit violators):

> "Take a deep breath and let yourself arrive in this moment. Honour the
> wisdom of your body as you settle into this practice. Notice whatever
> arises — a sensation, a thought, an old story — and let it move
> through you with compassion. There is no right way to do this work;
> trust that your nervous system knows what it needs."

Rewrite in register:

> "Sit somewhere quiet for ten minutes. Read each line below out loud,
> once. After each line, pause for two breaths before the next. If a
> line lands as true, stay with it for an extra breath. If it doesn't,
> move on."

What changed:

- "arrive in this moment" → cut. AI ceremony language.
- "honour the wisdom of your body" → cut. Generic platitude.
- "whatever arises" → cut. Vague.
- "your nervous system knows what it needs" → cut. The whole point of a
  written practice is that we're telling her what to do; pretending
  otherwise is dishonest.
- New body is instruction-led: setting, action, pacing rule, decision
  rule.

**Sources block convention.** Most mindset pieces are SYNTHESISED — they
don't cite sources. Where a practice draws on a named tradition (EFT
tapping, hypnotherapy progressive relaxation), one short bullet names
the lineage. No academic studies in body or sources for the bulk of the
practices — Mindset is not making clinical claims.

### 3.4 Craft technique (sewing stitch, knitting cast-on, crochet starting loop, needlework stitch)

Reference content. Short, dense, learn-once-use-everywhere.

**Locked opening pattern:**

```
[Name the technique in plain English: what it is, when you use it.]
[Optional: the other names for it.] [One sentence on what makes it
work or what's hard about it.]
```

**Worked rewrite — bad to good.**

Original (illustrative):

> "The magic ring, also known as the adjustable starting loop or magic
> circle, is a foundational technique in modern crochet that allows the
> crafter to begin a project worked in the round without leaving a hole
> at the centre. The technique was popularised in the mid-twentieth
> century and has since become standard practice in the contemporary
> crochet canon. It involves wrapping the working yarn around the
> fingers, drawing up a loop, and securing the initial round of stitches
> through this loop before pulling the tail to close the centre."

Rewrite in register:

> "Magic ring is the adjustable starting loop for crochet worked in the
> round. You start by wrapping the yarn around two fingers, draw up a
> loop, work the first round of stitches into the loop, then pull the
> tail to close the hole at the centre. The only tricky bit is keeping
> hold of the tail while you work the first round, otherwise the loop
> can come undone."

What changed:

- "foundational technique in modern crochet" → cut. Filler.
- "mid-twentieth century" + "contemporary crochet canon" → Sources block.
- Long noun-phrase opener → plain "Magic ring is the adjustable starting
  loop". Restates the title in plain English.
- New third sentence: what's actually hard about it. Practical, not
  ceremonial.

**Sources block convention.** Pre-1928 needlework manuals (Caulfeild &
Saward 1882, Beeton 1880, de Dillmont 1886) are the standing source set.
One bullet per source, where the technique appears in that manual.

### 3.5 Craft project (pattern: sewing project, granny square, knit jumper)

A finished thing, not just the technique.

**Locked opening pattern:**

```
[Name the finished item: what it is, what it's for, who it fits / how
big it is.] [One sentence on the technique base — which stitches /
seams / construction the project uses.] [Yield + skill level + time.]
```

**Sources block convention.** Sewing patterns cite the construction
method's lineage when relevant (Bishop method, Singer manual, Vintage
pattern archive). Knitting / crochet projects cite the stitch tradition
(traditional Aran, Shetland fine-lace). Where the design is original or
synthesised, set `sourceType: "SYNTHESISED"`.

**"Technical notes" convention.** Optional. For sizing maths,
substitution charts, advanced yardage calculations, or fitting
adjustments that don't belong in the orientation. Headed clearly so
the casual reader can skip it.

### 3.6 Growing guide (gardening)

Calendar-led content. The reader's first question is "when do I do
what?"

**Locked opening pattern:**

```
[Name the crop and the climate / zone assumption.] [State the
sowing-to-harvest arc in plain English — sow in spring, harvest in
late summer.] [One sentence on the conditions it needs — sun, soil,
spacing.]
```

The body uses month-by-month or stage-by-stage headings rather than the
recipe-style Method/H3 pattern. Each heading is a noun phrase or a
calendar marker ("April: sow indoors", "May: plant out", "June: thin").
Within each section, sequential instructions are an `orderedList`.

**Worked rewrite — bad to good.**

Original (illustrative):

> "Solanum lycopersicum, the cultivated tomato, is one of the most
> beloved horticultural subjects in the temperate garden. RHS guidance
> categorises it as a tender annual requiring 18-24°C minimum night
> temperatures for fruit set, with the optimal cultivar selection
> depending on locality. The fruiting habit can be determinate (bush)
> or indeterminate (cordon), with the latter requiring staking and the
> periodic removal of sideshoots through the season."

Rewrite in register:

> "Tomatoes are a warm-summer crop. In the UK you sow indoors in March
> or April, plant out after the last frost in late May, and pick from
> July through October. They need full sun, a deep pot or rich border
> soil, and steady watering once they set fruit. Cordon varieties grow
> tall and need a stake; bush varieties stay low and don't."

What changed:

- "Solanum lycopersicum" → "Tomatoes". Latin name belongs in technical
  notes or a tooltip.
- "RHS guidance" → cut from body. Sources block.
- "tender annual requiring 18-24°C minimum night temperatures for fruit
  set" → "warm-summer crop". Same information, accessible register.
- "determinate (bush) or indeterminate (cordon)" → "cordon varieties
  grow tall ... bush varieties stay low".

**Sources block convention.** RHS guides, US Cooperative Extension
service publications, classic pre-1928 garden books (Jekyll, Sackville-
West, Crisp). One bullet per source.

### 3.7 Home repair / building

Tools-led content. The reader's first question is "what do I need and
how long will it take?"

**Locked opening pattern:**

```
[Name the repair in plain English: what's broken or being built.]
[One sentence on the approach — what kind of fix this is.] [One
sentence on what you need and roughly how long.]
```

The body uses Method/H3 like recipes. Sequential steps inside each H3
are an `orderedList`.

**Worked rewrite — bad to good.**

Original (illustrative):

> "Resolving a perforation in plasterboard is a common domestic
> maintenance task that any competent householder should be capable of
> executing. Before commencing any cutting or fastening operations,
> ensure you have appropriate personal protective equipment including
> eye protection, dust masks rated to FFP2 specification, and gloves
> rated for handling fibrous building materials. The task involves
> measuring the perforation, cutting a patch of equivalent dimensions,
> securing the patch with appropriate adhesive, and finishing with a
> compound coat sanded to surface plane."

Rewrite in register:

> "A plasterboard hole — from a doorknob, a falling shelf bracket, a
> kicked skirting — fixes in an afternoon. You cut a square patch a
> little larger than the hole, glue it in flush with the wall, skim
> the joint with filler, and sand it smooth once it's dry. Most repairs
> use offcuts from a builder's merchant; tools are a craft knife, a
> filler knife, and a sanding block."

What changed:

- "Resolving a perforation in plasterboard" → "A plasterboard hole".
- "any competent householder should be capable of executing" → cut.
  Patronising AI register.
- Whole PPE paragraph → moved to a one-line inline mention if genuinely
  needed in step, or cut entirely (the site-wide terms cover liability).
- "FFP2 specification" → cut. False-specificness.
- "compound coat sanded to surface plane" → "skim the joint with
  filler, and sand it smooth once it's dry".
- Closing tools-and-materials sentence makes the orientation feel
  finished without listing kit in the orientation paragraph.

**Sources block convention.** Pre-1928 building manuals, UK Building
Regs guidance (where the technique is regulated), trade publications
that are openly accessible.

### 3.8 Natural home recipe (soap, candles, balms, cleaners)

Recipe-shaped, but weights matter to the gram. Word precision per
category memory rule: "making" not "cooking" for natural-home.

**Locked opening pattern:**

```
[Name the preparation in plain English: what it is, what's in it.]
[State what it's for and how the result feels / smells / behaves.]
[One sentence on yield + working time + cure time, where cure time
applies.]
```

**Worked rewrite — bad to good.**

Original (illustrative):

> "This cold-process oatmeal soap recipe represents the traditional
> saponification of olive, coconut, and castor oils through the
> careful incorporation of a sodium hydroxide solution into the
> heated fat matrix. The inclusion of colloidal oatmeal at trace
> introduces gentle exfoliation and is traditionally documented to
> soothe sensitive skin (Avena sativa is recognised by the FDA as a
> skin protectant). The 4-6 week cure window allows for the complete
> consumption of free alkali and the development of a mild, hard,
> long-lasting bar."

Rewrite in register:

> "Oatmeal soap is a mild, creamy bar made from olive, coconut, and
> castor oils, with porridge oats stirred through for a soft
> exfoliating finish. It lathers well and is kind on dry or
> sensitive skin. The recipe makes about 1 kg — eight standard bars
> — and takes around an hour to mix; then the bars cure for 4-6
> weeks before they're ready to use."

What changed:

- "saponification" → cut. Implied by "soap". Technical notes if needed.
- "sodium hydroxide solution" → cut from orientation. Appears as "lye"
  in the steps where the reader needs it. "Lye not soda crystals" is
  the canonical specific-pinning rule per the voice memory.
- "Avena sativa is recognised by the FDA" → Sources block. Plus a
  much shorter cultural framing: "kind on dry or sensitive skin".
- "the complete consumption of free alkali" → cut. Technical notes.
- Yield and time made concrete at the close.

**Sources block convention.** Classic soap-making manuals (Failor,
Cavitch — modern but standard), pre-1928 candle / soap manuals where
they exist, herbalism + skin-care archive entries for individual
ingredients.

**Safety note.** Lye handling and hot wax are the two craft-genuine
safety moments. The site-wide rule allows a single compressed inline
line at the step where it matters ("Add lye to water, never water to
lye. The mixture gets hot fast.") — that's the maximum. No PPE list, no
first-aid block.

---

## 4. Retrofit plan for the published library

### 4.1 The shape of the problem

The 2026-05-19 audit found 241 violators across 2,310 published tutorials
(10.4%) on the rule set as it existed then. Adding the 2026-05-21 rules
(grade level, year-only references, institutional names, prose-style
steps, clinical/Latin vocab) will substantially raise that number. Best
guess before the audit re-runs: 30-50% of the published library will
fail the new rule set — heavily skewed toward herbal-medicine, mindset
readings, sustainability long-form, and home-repair (small categories
but high-violation rate).

### 4.2 Two paths to consider

**Path A — Sweep all 3,500 to one register.**

One bulk pass over every published tutorial. Workers re-author each one
against the new spec, regardless of category or current voice quality.

- Pros: complete consistency. No edge cases later. Image audit and
  voice audit ride on top of a single coherent baseline.
- Cons: throws Sonnet sessions at content that's already in voice
  (most of cooking/baking is fine). High token cost. Risks regressing
  good content if the worker over-corrects.

**Path B — Tiered retrofit, prioritised by violation likelihood.**

Run the extended voice-check first to get an accurate violator list,
then sweep in tiers.

- Tier 1 (urgent — academic-citation-prone): herbal-medicine,
  sustainability long-form, home-repair, natural-home, animals-
  smallholding. ~100-200 tutorials, the highest-risk content.
- Tier 2 (mindset readings): the 92 violators flagged in the audit
  plus any new flags from the grade-level rule. ~150-300 tutorials.
  Mostly readings; affirmations and tapping scripts already pass.
- Tier 3 (cooking + baking readings): tutorials whose intros got
  flagged for orientation, false-specificness, or new grade-level.
  ~200-400 tutorials.
- Tier 4 (everything else flagged): a final pass over remaining
  flagged tutorials in any category. ~variable.
- Tier 5 (the clean ones): left alone. Voice-check re-runs catch any
  regressions over time.

**Recommendation: Path B.**

Reasoning:

- The audit data shows category concentration. Mindset and herbal-
  medicine accumulate citation density; cooking and baking mostly do
  not. Sweeping cooking-and-baking adds risk without proportionate
  benefit.
- Token / session count is finite. Worker sessions are the bottleneck;
  spending them where there's a real fix to make is the right call.
- A clean Tier 1 pass on herbal-medicine fixes the most acute brand
  problem (the thyme exemplar Rebecca flagged) without waiting for the
  full library to land.
- Voice-check re-runs after each tier give a measurable closing of the
  violator count — Rebecca can see progress in numbers.

### 4.3 In-place vs DRAFT round-trip

For violators flagged by the extended voice-check, the worker session:

1. Reads the current PUBLISHED body.
2. Rewrites the orientation paragraph, moves citations to Sources,
   converts prose-style steps to `orderedList`, adds tooltips where
   needed, drops disallowed clinical terms.
3. Stores the pre-rewrite body in a new `Tutorial.revisedFrom` field
   (snapshot of the old TipTap JSON + the violation report that
   triggered the rewrite).
4. Updates the live `Tutorial.body` in place. Tutorial stays PUBLISHED.
5. Re-runs voice-check on the new body. Fails the rewrite if it doesn't
   clean — flags for manual review rather than publishing dirty.

In-place is the right answer because:

- Search / SEO doesn't get disrupted by URLs going to draft.
- Users following an "I'm making this" project don't lose the page.
- The retrofit is a fix, not a re-publish — same content, better voice.

The `revisedFrom` snapshot gives us an undo path if a rewrite
regresses, and the violation report on the snapshot is useful audit
data for tightening future rules.

Migration: add `revisedFrom Json?` and `revisedAt DateTime?` to the
`Tutorial` model. One small migration, all backfilled to null.

### 4.4 Throughput

Bulk worker session count is the bottleneck. Estimating throughput:

- One Sonnet worker session can retrofit roughly 30-50 tutorials
  before context fills, when the work is "rewrite the orientation,
  move citations, convert steps to ordered list" rather than full
  re-authoring.
- Tier 1 (~100-200 tutorials, herbal-medicine the priority) →
  3-7 worker sessions.
- Tier 2 (~150-300 tutorials, mindset readings) → 5-10 sessions.
- Tier 3 (~200-400 tutorials, cooking/baking readings) → 7-13
  sessions.
- Tier 4 (variable) → 3-8 sessions.

Sequence: Tier 1 lands first (highest brand risk fix). Voice-check
re-runs after Tier 1 to confirm. Then Tier 2. Then Tier 3. Each tier
sequenced because every tier teaches us how the next tier should be
prompted — Tier 1 worker prompts will get refined based on Tier 1
results.

### 4.5 Sequencing with the image workstream

Per Rebecca's locked order in
[project_ux_review_briefs.md](C:\Users\Rebecca\.claude\projects\C--Users-Rebecca-Projects-code-homemade\memory\project_ux_review_briefs.md)
the broader UX workstream order is performance → homepage → admin →
analytics → mobile. The image relevance workstream is its own thread.

Voice retrofit and image retrofit are independent — voice changes the
prose, images change the heroes. Run them in parallel rather than
sequenced. The single shared concern: don't run a voice retrofit and
an image retrofit on the same tutorial in the same session, because
the `revisedFrom` snapshot would conflate the two fixes. Stagger by
slug.

### 4.6 Worker prompt template (per-tier)

Each retrofit tier needs a worker prompt that:

- Names the tier and the violation list to fix.
- Includes the voice spec (§3 of this doc — the content-type opening
  patterns and worked rewrites).
- Includes the extended voice-check rule list (§6).
- Specifies the in-place update path: read PUBLISHED, snapshot to
  `revisedFrom`, update body, re-run voice-check, fail or commit.
- Caps the session at ~30-50 tutorials.
- Demands the worker stop and hand off if the voice-check still
  fails after one rewrite attempt — no force-publish.

The first worker prompt should be Tier 1 herbal-medicine, drafted as
its own short prompt that follows the master-orchestrator pattern
already in memory.

---

## 5. Updated autopilot author prompt

This text is ready to drop into the bulk-author SKILL once Rebecca
approves the spec. Apply it as a follow-up worker, not in this session.

### 5.1 What changes vs the current `docs/tutorial-author.md`

- Section "Voice rules — hard" gains a "Grade 6-8 register" subsection
  (text below).
- Section "Body structure" gains the per-content-type opening pattern
  table (text below).
- The "Sources" section explicitly forbids historical / institutional
  references appearing anywhere in the body, and requires the
  technical-notes H2 convention.
- The "Method" section requires `orderedList` for sequential steps; no
  "First. Then. Next." prose.
- Banned-phrase list gains the institutional / clinical terms list (see
  §6 below) — these are auto-flagged by voice-check too, but having
  them in the prompt means Sonnet doesn't reach for them in the first
  draft.

### 5.2 New "Grade 6-8 register" subsection (paste verbatim into the SKILL)

```
**Grade 6-8 reading level. Hard rule.**

The bulk of every tutorial reads at grade 6-8 level (~11-14 year old
reading). This is the Mary Berry / Martha Stewart register: warm,
plain-spoken, confident expertise without academic gloss.

Concrete tests for whether a paragraph is in register:

- Could a 12-year-old read it aloud and roughly understand?
- Are the longest words 3 syllables or fewer, with rare exceptions
  for unavoidable craft terms (all tooltipped)?
- Are sentences mostly 8-15 words?
- Does it sound like a knowledgeable friend explaining at the
  kitchen table?

If the answer to any test is no, rewrite the paragraph.

Banned vocabulary in body prose (replace with plain English):

- Clinical / Latin: catarrh, expectorant, antispasmodic, emmenagogue,
  anti-inflammatory (use "calms swelling"), decoction, infusion,
  maceration (tooltip or "simmered in water" / "steeped in water").
- Domain Latin (Solanum lycopersicum, Avena sativa, Thymi herba):
  cut from body, optionally placed in the Sources block or a
  glossaryTooltip.
- Bureaucratic register: "the integration of", "the optimisation of",
  "in the context of", "with respect to", "in relation to".

Banned references in body prose (move to Sources block):

- Year-only references: (1652), (1882), (1908).
- Institutional names: German Commission E, BHP, FDA, MHRA, NHS, RHS,
  USDA, ESCOP, EMA HMPC, NCCIH.
- Historical figures without context: Culpeper, de Dillmont, Beeton,
  Caulfeild, Grieve, Gerard, Quincy.

A historical figure may appear in body prose ONLY if introduced with a
plain-English gloss ("the 17th-century herbalist Nicholas Culpeper")
AND only once per tutorial AND only if genuinely useful. Default is
Sources block, not body.

Banned shapes:

- Three-sentence intro paragraphs that stack four academic references.
- Prose-style sequential instructions ("First, simmer the thyme. Then
  strain it. Add the honey."). Sequential steps are an orderedList.
- "Technical-notes-first" intro paragraphs (chemistry, etymology, or
  history before the orientation). Orientation comes first, always.
```

### 5.3 New "Opening pattern per content type" table (paste into the SKILL)

```
### Opening pattern per content type

The orientation paragraph is the first paragraph of every body. Follow
the pattern for the content type. Three sentences max in the
orientation; an optional second short paragraph with a sensory or
practical note can follow if it earns the second paragraph.

**Recipe (cooking + baking).**
[What the dish is, in one short clause.] [What it gives you, in one
sentence — texture, flavour, yield, time.] [One sentence on what
makes it work or what to watch for.]

**Herbal remedy.**
[Name the preparation: what it is, what it's made of.] [State
factually what tradition has used it for — no efficacy claims.] [One
sentence on what to expect: texture, taste, yield, time.]

**Mindset practice.**
[Name the practice: what you'll do, in one short clause.] [State
what it's for — one sentence on the intended shift.] [One sentence
on what it'll feel like or how long it'll take.]

**Craft technique.**
[Name the technique: what it is, when you use it.] [Optional: the
other names for it.] [One sentence on what makes it work or what's
hard about it.]

**Craft project.**
[Name the finished item: what it is, what it's for, who it fits or
how big it is.] [One sentence on the technique base — which stitches /
seams / construction the project uses.] [Yield + skill level + time.]

**Growing guide.**
[Name the crop and the climate / zone assumption.] [State the
sowing-to-harvest arc in plain English — sow in spring, harvest in
late summer.] [One sentence on the conditions it needs — sun, soil,
spacing.]

**Home repair / building.**
[Name the repair: what's broken or being built.] [One sentence on
the approach — what kind of fix this is.] [One sentence on what you
need and roughly how long.]

**Natural home recipe.**
[Name the preparation: what it is, what's in it.] [State what it's
for and how the result feels / smells / behaves.] [One sentence on
yield + working time + cure time, where cure time applies.]
```

### 5.4 New "Sources block + Technical notes" subsection (paste into the SKILL)

```
### Sources block

The `sourceNotes` field on the upload input is the canonical sources
list. The public renderer surfaces it at the bottom of the page. It is
the ONLY place in the page where historical figures, years, and
institutional names appear.

Format: one bullet per source. Plain prose. Title, author, year,
archive identifier (Project Gutenberg ID, USDA bulletin, etc.) and one
clause on what was drawn from it.

Example:
- Nicholas Culpeper, *The English Physician* (1652) — Project
  Gutenberg #49513. Thyme entry, traditional use for coughs and
  chest complaints.
- Maud Grieve, *A Modern Herbal* (1931) — Botanical.com. Thyme
  monograph, antiseptic and expectorant actions.

If the source material is thin, set `sourceType: "SYNTHESISED"` and
cite the closest text.

### Technical notes (optional)

Optional H2 between the body and the Sources block. Use it when the
reader who wants depth would otherwise drop out of register inside the
body.

Common contents:
- The chemistry of why the technique works.
- The Latin / botanical names of ingredients.
- The historical / regional origin of the dish or practice.
- Institutional references with one clause of context each.

Two short paragraphs maximum. Keep it factual. No efficacy claims, no
medical prescription, no marketing language. If there's nothing useful
to add, skip the section entirely.
```

### 5.5 New "Numbered steps" subsection (paste into the SKILL)

```
### Numbered steps — hard rule

Sequential instructions are an `orderedList` block, not a paragraph
and not a bulletList.

A reader scanning the page must be able to count steps and find her
place. Prose-style sequential instructions ("First, simmer the thyme.
Then strain it. Add the honey.") are a numbered list written badly —
convert to an orderedList of three items.

Exceptions:
- Orientation paragraphs (non-sequential).
- "Where this dish lives" / "How it adapts" sections (non-sequential).
- Single-action notes that don't have follow-on steps.

The Method section of a recipe uses one H3 per stage, with an
orderedList of steps inside each H3 if the stage has more than one
action. Where a stage is one action, a single paragraph is fine.
```

---

## 6. QC voice-check rule additions

Extend `packages/db/scripts/voice-check-lib.ts` with the following rule
set. Each rule fires on body prose chunks (not on Sources blocks, where
this content is allowed).

### 6.1 Year-only references

Pattern: `\((1[6-9]\d{2}|20\d{2})\)` — a four-digit year in parentheses.

```ts
{ pattern: /\((1[6-9]\d{2}|20\d{2})\)/, label: 'year-only reference' }
```

Fires when a year appears in parentheses without a plain-English gloss
preceding it. The "1652" in "(1652)" is the trigger. Allowed in
Sources block; flagged everywhere else.

### 6.2 Institutional names in body prose

A whitelist of institutional names, flagged when they appear anywhere
in body prose. Allowed in Sources block.

```ts
const INSTITUTIONAL_NAMES_WHITELIST = [
  'German Commission E',
  'Commission E',
  'BHP',  // British Herbal Pharmacopoeia
  'British Herbal Pharmacopoeia',
  'FDA',
  'MHRA',
  'NHS',
  'RHS',  // Royal Horticultural Society
  'USDA',
  'NCCIH',
  'ESCOP',
  'EMA HMPC',
  'EMA',
  'Project Gutenberg',  // ok in Sources — flag in body
  'Botanical.com',
]
```

Match strategy: whole-phrase case-insensitive. Fires on any chunk
whose `path` starts with `body >` (not `sourceNotes`).

### 6.3 Historical author names without context

A whitelist of historical author surnames whose appearance in body
prose requires a plain-English gloss within the same sentence ("the
17th-century herbalist Culpeper", "the Victorian needlework manual by
de Dillmont").

```ts
const HISTORICAL_FIGURES = [
  'Culpeper',
  'Gerard',
  'Grieve',
  'Quincy',
  'Beeton',
  'Mrs Beeton',
  'de Dillmont',
  'Caulfeild',
  'Saward',
  'Glasse',
  'Acton',
  'Jekyll',
  'Sackville-West',
]
```

Heuristic: the surname appears in body prose AND the same sentence
does NOT contain a gloss token from `{century, herbalist, manual,
cookery, Victorian, century-,  18th-, 17th-, 19th-, 20th-}`. The
heuristic is loose — false positives are OK because the rule's job is
to surface the line for human review.

### 6.4 Prose-style sequential steps

Heuristic: a paragraph node whose text begins with a step-opener
(`First`, `Then`, `Next`, `Finally`, `After that`, `Lastly`) AND the
paragraph contains another step-opener later in the same paragraph
OR the next sibling paragraph also begins with one.

```ts
const STEP_OPENERS = ['First', 'Then', 'Next', 'Finally', 'After that', 'Lastly']
```

Fires the check `prose-style-steps`. Message: "Sequential instructions
('First...Then...Next...') in prose. Convert to orderedList."

### 6.5 Clinical / Latin vocabulary

Watchlist (case-insensitive whole-word):

```ts
const CLINICAL_VOCAB = [
  { word: 'catarrh', plain: 'chest congestion / mucus build-up' },
  { word: 'expectorant', plain: 'loosens phlegm' },
  { word: 'antispasmodic', plain: 'eases muscle spasm / soothes cramping' },
  { word: 'emmenagogue', plain: 'do not use in body — Sources block only if relevant' },
  { word: 'anti-inflammatory', plain: 'calms swelling' },
  { word: 'decoction', plain: 'simmered in water (or tooltip)' },
  { word: 'infusion', plain: 'steeped in water (or tooltip)' },
  { word: 'maceration', plain: 'soaked in liquid (or tooltip)' },
  { word: 'saponification', plain: 'soap-making chemistry (technical notes only)' },
  { word: 'autolyse', plain: 'rest the flour and water before kneading (or tooltip)' },
  { word: 'determinate', plain: 'bush variety' },
  { word: 'indeterminate', plain: 'cordon variety' },
]
```

Fires `unflagged-jargon` (same kind already in the lib) when the word
appears in body prose AND the text is not wrapped in a glossaryTooltip
mark. The lib already has the wrap-detection logic for glossary
coverage — extend it.

### 6.6 Grade-level (paragraph reading score)

The heaviest new check. Compute a simplified Flesch-Kincaid grade for
each body paragraph; flag anything above grade 9.

Implementation note: a full Flesch-Kincaid implementation is a few
dozen lines (count sentences, words, syllables; apply the formula). A
simpler proxy: average sentence length and average word length per
paragraph, with thresholds calibrated against passing exemplars
(welsh-cakes, fish-and-chips, brown-butter-chocolate-chip-cookies) and
failing exemplars (thyme-cough-syrup, inspecting-a-beehive-in-summer).

Either path:

- Threshold: paragraphs scoring above grade 9 surface as `warn`, not
  `error`, on first roll-out. Some craft / herbal terms unavoidably
  push individual sentences over grade 9 even when in voice; warn-only
  lets the author decide rather than blocking publication.
- After two weeks of running warn-only, promote to `error` for any
  paragraph scoring above grade 11, keeping grade 10 as warn.

The grade-level rule is the single biggest catch — Rebecca's thyme
example fails it cleanly, as do most of the "violators" that the
existing rule set didn't catch.

### 6.7 Rule sequencing / rollout

Apply in this order so the audit numbers move predictably:

1. **Land the year-only + institutional-name + historical-figure
   rules first.** Run the audit. Expect a substantial jump in
   violators in herbal-medicine, mindset readings, sustainability
   long-form.
2. **Land the prose-style-steps rule.** Run the audit. Expect a jump
   in home-repair, growing guides, and any long-form how-to.
3. **Land the clinical-vocab rule.** Run the audit. Expect mostly
   herbal-medicine and natural-home flags.
4. **Land the grade-level rule (warn-only initially).** Run the
   audit. Expect this to surface the long tail of mindset readings
   and any tutorials with academic-bureaucratic register.

Each landing is one commit + one audit re-run. Rebecca sees the
violator count move with each step.

---

## 7. Open decisions for Rebecca

Three decisions are needed before the retrofit fires. Tagging them
here so they don't get lost in the synthesis.

1. **Tiered retrofit or full sweep?** §4.2 recommends Path B (tiered,
   prioritised by violation likelihood). Confirming Path B unblocks
   the Tier 1 herbal-medicine worker.
2. **In-place updates with `revisedFrom` snapshot?** §4.3 recommends
   keeping the tutorials PUBLISHED through the rewrite, snapshotting
   the pre-rewrite body in a new `revisedFrom` field. Confirming
   unblocks the migration that adds the field.
3. **Grade-level rule rollout — warn-only first, then promote?** §6.6
   recommends warn-only initially while the threshold gets calibrated
   against real content, promoting to error after two weeks. Confirming
   sets the rollout cadence.

A fourth, lower-stakes question: **Should "technical notes" sections be
included on every tutorial that has institutional/historical references,
or kept truly optional?** The recommendation is "optional, only where
genuinely useful". The risk is that "optional" becomes "always" once
Sonnet sees the pattern. Confirming "optional" closes that loop.

---

## Appendix A — Worked rewrite quick-reference

Side-by-side rewrites consolidated here for quick reference during
retrofit work. The list is illustrative — actual retrofit prompts will
read this section and apply the patterns to each content piece.

| Type | Original (in register failure) | Rewrite (in register) |
|---|---|---|
| Recipe (shortcrust) | "In the world of baking, few skills are as foundational as ..." | "Shortcrust is the basic short pastry — flour, cold butter, a little water — for pies, tarts, and quiches." |
| Herbal (thyme) | "Culpeper (1652) prescribed thyme for coughs ..." | "Thyme syrup is a kitchen tradition long made for dry, tickly coughs." |
| Mindset (settling) | "Arrive in this moment. Honour the wisdom of your body." | "Sit somewhere quiet for ten minutes. Read each line below out loud, once." |
| Technique (magic ring) | "The magic ring, also known as the adjustable starting loop, is a foundational technique ..." | "Magic ring is the adjustable starting loop for crochet worked in the round." |
| Growing (tomato) | "Solanum lycopersicum, the cultivated tomato ... RHS guidance categorises it as ..." | "Tomatoes are a warm-summer crop. In the UK you sow indoors in March or April." |
| Home repair (plasterboard) | "Resolving a perforation in plasterboard ... appropriate personal protective equipment ..." | "A plasterboard hole fixes in an afternoon. You cut a square patch a little larger than the hole." |
| Natural home (soap) | "This cold-process oatmeal soap recipe represents the traditional saponification of ..." | "Oatmeal soap is a mild, creamy bar made from olive, coconut, and castor oils." |

## Appendix B — What this spec is NOT

- Not a rewrite of `feedback_homemade_voice.md`. The memory file is
  canonical; this is the field manual.
- Not an SDK-driven retrofit plan. All retrofit work runs inside
  Claude Code worker sessions per `feedback_no_api_spend.md`.
- Not an editorial-staff plan. No hiring; the retrofit is Rebecca +
  Claude only per `feedback_no_hiring_yet.md`.
- Not a green light to unpause autopilot. Autopilot stays paused until
  Rebecca approves §3 + §4 + §5 + §6 of this doc, and the new author
  prompt and voice-check rules are in place.
