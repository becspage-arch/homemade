# Anchor tutorial briefs

Two anchor tutorials for Rebecca to hand-author in `/admin/tutorials/new`.
The purpose is to exercise every part of the editor surface and stress-test
the public reading experience before the bulk-authoring pilot starts.

Together these two briefs use all eight custom blocks (info panel, supplies
card, glossary tooltip, sub-tutorial card, pull quote, product card,
varieties panel, troubleshooter), plus paragraphs, headings of every level,
bullet and ordered lists, internal and external links, and inline marks
(bold, italic).

The briefs give Rebecca the spine: structure, supplies list, glossary terms,
sub-tutorial targets, pull quote, sources, and a hero illustration brief.
Rebecca writes the body — the briefs do not draft prose.

---

## Anchor 1 — Béchamel sauce (technique-heavy)

**Working title:** Béchamel — the basic white sauce, and the four it turns
into

### Why this one

Béchamel is the cleanest test of a technique-heavy tutorial. The recipe is
short (butter, flour, milk, salt, nutmeg) but the technique has more
detail than any single line of a recipe captures: the timing of the roux,
the temperature of the milk, the rhythm of the whisk, the way to read
consistency by hand.

It exercises:

- **Varieties panel** — Mornay, Soubise, Mustard, Parsley, Cheese all
  derive from this base. Five direct variations on one recipe. The new
  panel block can show its full range here.
- **Troubleshooter** — five distinct failure modes (lumps, scorched bottom,
  too thick, too thin, raw-flour taste). The new block earns its keep on a
  tutorial like this.
- **Glossary tooltips** — roux, scald, nappe, bain-marie. Words a confident
  cook uses without thinking but a new cook hits and pauses on.
- **Info panel** — at least three. A warning tone for hot milk, a tip tone
  for the temperature of the milk, a note tone for the nutmeg point at the
  end.
- **Sub-tutorial cards** — strong outbound links to the five derivative
  sauces (once those tutorials exist), plus to roux as its own foundational
  tutorial.
- **Product card (the new one)** — a whisk recommendation. Cooking
  tutorials lean on kit cards more than most categories will.
- **Pull quote** — Escoffier wrote about this sauce; a quotation lifts the
  tutorial out of pure technique.

Strong public-domain sourcing across Escoffier, Mrs Beeton, and Eliza Acton.
UK kitchen, no specialist sourcing.

### Target reader

Someone who has cooked but never made a sauce from scratch. They've eaten
this sauce as lasagna béchamel, in cauliflower cheese, in moussaka, in fish
pie. They've used the dried packet version. They're ready to make it
properly and want it explained so the technique transfers to every other
mother sauce.

### Section outline

```
HERO ILLUSTRATION (above the content)

H1 (auto from title field): Béchamel — the basic white sauce, and the four
it turns into

EXCERPT field on the Tutorial row: "A roux, a slow pour of warm milk, a
whisk that doesn't stop. The white sauce that becomes Mornay, Soubise,
mustard, parsley, or cheese with one or two extra ingredients."

INTRODUCTION (2–3 short paragraphs)
- What béchamel is and where it sits in the family of sauces
- Why a confident béchamel earns its place as the first sauce to learn

INFO PANEL (note tone)
- Title: "What 'mother sauce' actually means"
- Body: one paragraph on the five mother sauces and where béchamel fits

H2: What you need

SUPPLIES CARD
- See "Supplies card content" below

PULL QUOTE
- See "Pull quote" below

H2: Method

H3: Step 1 — Scald the milk
- Body paragraph(s)
- INFO PANEL (tip tone): "The milk should be steaming but not
  boiling — about 80°C. A bay leaf and a piece of onion added at this
  stage perfume the milk."

H3: Step 2 — Make the roux
- Body paragraph(s)
- Inline GLOSSARY TOOLTIP on "roux"
- INFO PANEL (warning tone): "Keep the heat moderate. A roux that browns
  past pale gold is a different sauce — fine for gravy, wrong for
  béchamel."

H3: Step 3 — Combine
- Body paragraph(s) on whisking in the warm milk gradually
- Inline GLOSSARY TOOLTIP on "nappe"
- INFO PANEL (tip tone): "Pour in a third of the milk, whisk to a paste.
  Then the second third, whisk to a sauce. Then the last third, whisk
  until smooth."

H3: Step 4 — Cook out the flour
- Body paragraph on simmering for 5–8 minutes, why
- Inline GLOSSARY TOOLTIP on "scald" earlier; "bain-marie" if she chooses
  to mention the finishing method

H3: Step 5 — Season and finish
- Salt, white pepper, a grating of fresh nutmeg
- INFO PANEL (note tone): "Why white pepper, not black: appearance.
  Béchamel should be ivory. Black flecks read as scorched."

H2: Troubleshooting

TROUBLESHOOTER BLOCK
- See "Troubleshooter content" below

H2: Variations

VARIETIES PANEL
- See "Varieties content" below

H2: Sub-tutorials

SUB-TUTORIAL CARD: link to Mornay tutorial (when it exists)
SUB-TUTORIAL CARD: link to Roux foundational tutorial

H2: Where this sauce lives

Two short paragraphs on how the sauce shows up across the kitchen: lasagna,
moussaka, cauliflower cheese, fish pie. Each named dish is a link to that
tutorial (some external for now if the tutorial doesn't yet exist; mark them
internal-pending for later).

PRODUCT CARD
- A balloon whisk recommendation (the new block). Specific
  product / generic recommendation Rebecca chooses.

SOURCES (in the Tutorial row's `sourceNotes` field, rendered in the sources
aside)
- Auguste Escoffier, Le Guide Culinaire (1903), Section II — Sauces, sauce
  béchamel (English translation 1907, public domain)
- Eliza Acton, Modern Cookery for Private Families (1845), Chapter on
  Sauces (Project Gutenberg)
- Mrs Beeton, Book of Household Management (1861), Chapter 4 — Sauces
  (Project Gutenberg #10136)
```

### Supplies card content

```
Heading: What you need

Items:
- Whole milk           600 ml
- Unsalted butter       40 g
- Plain flour           40 g
- Bay leaf               1 (optional but classical)
- Onion                  ¼, peeled (optional, for clouted milk)
- Cloves                 2 (optional)
- Fine sea salt          to taste
- White pepper           to taste
- Nutmeg                 a grating

Equipment:
- Heavy-based saucepan, around 18 cm
- Balloon whisk
- Wooden spoon
- Small saucepan for the milk
- Sieve (if straining)
```

### Glossary terms

Verify against `/admin/glossary` before authoring. Terms that already exist
get linked via the `glossaryTooltip` mark with their existing ID. Terms that
don't exist need creating first in the Glossary admin (with `categoryId`
set to the Cooking category, where applicable).

| Term | Definition (short, for tooltip) | Status |
|---|---|---|
| Roux | A cooked paste of equal parts flour and fat. The thickening base of every classical white and brown sauce. | Verify in admin |
| Scald | To heat milk to just below boiling — small bubbles around the edge, steam rising, surface trembling. | Verify in admin |
| Nappe | The consistency at which a sauce coats the back of a spoon and holds a line drawn through it with a finger. | Verify in admin |
| Bain-marie | A pot of simmering water used as gentle, indirect heat for keeping sauces warm or for gentle cooking. | Verify in admin |
| Mother sauce | One of five classical French base sauces (béchamel, velouté, espagnole, hollandaise, tomate) from which a family of derivatives is built. | Verify in admin |

Action before authoring: open `/admin/glossary`, search each term, create
any that are missing. Cooking category should already exist.

### Sub-tutorial card targets

- Mornay sauce — direct derivative, exists later (planned)
- Roux — foundational technique tutorial (planned)
- Cauliflower cheese — dish that uses béchamel (planned)
- Lasagna alla bolognese — dish that uses béchamel (planned)
- Fish pie — dish that uses béchamel (planned)

All five live in the backlog. If none exist when Rebecca authors this, leave
the sub-tutorial card blocks in place pointing at planned slugs and let the
public renderer show the "linked tutorial no longer available" fallback
until the targets ship. That fallback path is part of what the anchor
exercises.

### Pull quote

> "Béchamel — the most important of all white sauces, the basis of many,
> and itself a finished sauce of great delicacy."
>
> — Auguste Escoffier, *Le Guide Culinaire*, 1903

(One em dash in the body of the quote, attribution separated cleanly. The
attribution line lives in the `attribution` attr.)

### Troubleshooter content

Use the new troubleshooter block. Each row is one symptom plus one or two
sentences of cause and fix.

| Symptom | Cause and fix |
|---|---|
| The sauce is lumpy | Cold milk hit hot roux, or you stopped whisking. Press through a sieve into a clean pan; warm gently while whisking and it will smooth out. Next time, scald the milk first and pour it in three stages. |
| It tastes of raw flour | The roux wasn't cooked long enough, or the finished sauce didn't simmer long enough. Simmer the finished sauce for another five minutes on a low heat, whisking; the taste cooks out. |
| It scorched on the bottom | Heat too high, or it was left without stirring. Pour the unscorched top into a clean pan; do not scrape the bottom. Continue cooking on a lower heat. Bin the burnt pan-bottom rather than rescuing it. |
| It is too thick | You can adjust right at the end: whisk in more warm milk a splash at a time until you hit the consistency you want. |
| It is too thin | Simmer for longer, whisking. The flour starches gel as they heat. If it still hasn't thickened after ten minutes, you've under-floured the roux — make a small second roux in a separate pan and whisk it through. |

### Public-domain sources

Primary:

- **Auguste Escoffier, *Le Guide Culinaire* (1903).** The sauce béchamel
  recipe and surrounding notes are in the "Sauces" section. The English
  translation (Heinemann, 1907) is in the public domain. Rebecca should
  pull the actual line for the pull quote from the original — don't trust
  paraphrased internet sources.
- **Mrs Beeton, *Book of Household Management* (1861), Chapter 4 — Sauces.**
  Project Gutenberg #10136. Beeton's white sauce recipe is leaner than
  Escoffier's; useful as a cross-reference.
- **Eliza Acton, *Modern Cookery for Private Families* (1845), Chapter on
  English Sauces.** Earlier and more conversational than Beeton.

Secondary cross-reference (modern, attributed but not quoted): the
National Center for Home Food Preservation has no béchamel guidance — there
is no preservation question here.

### Hero illustration brief

A still life: a small saucepan on a warm cream cloth, a wooden spoon laid
across the rim, a milk jug just behind, a halved nutmeg and a brass grater
in the front corner. Soft directional window light from the left. The
sauce in the pan should read as ivory, not yellow. Style follows whatever
wins the illustration style test.

---

## Anchor 2 — Strawberry jam (project-heavy)

**Working title:** Strawberry jam — open-pan method, no commercial pectin

### Why this one

Strawberry jam is the cleanest project-heavy tutorial. It runs from buying
the fruit through to a sealed jar on the shelf, with a clear start, a clear
end, and three things to read along the way (the boil, the set, the seal).
Every cooking project has those three elements; this is a good first one to
write the design language for.

It exercises:

- **Supplies card** — properly long. Fruit, sugar, lemon, jars, lids,
  funnel, jam thermometer, saucer in the freezer. The block needs to
  handle a real shopping list.
- **Info panel** — at least three. A warning tone on hot sugar safety
  (the most dangerous thing in a home kitchen), a tip tone on the freezer
  saucer test, a note tone on storage and shelf life.
- **Troubleshooter** — six distinct failure modes (didn't set, set too
  hard, scummy surface, crystallised, mouldy, separated). The block
  earns its keep on a project tutorial.
- **Varieties panel** — direct variants of the technique with one
  ingredient swapped. Raspberry, gooseberry, plum, blackcurrant.
- **Glossary tooltips** — pectin, setting point, sterilise, scum. Words
  every jam recipe uses, easy to gloss over, easy to misread.
- **Sub-tutorial cards** — to the wider preserves family (jelly, marmalade,
  curd) and to the safety underpinning tutorial (water-bath canning
  basics).
- **Product card** — a jam thermometer or a sterilising kit. A real piece
  of kit Rebecca might recommend.
- **Pull quote** — Eliza Acton or Mrs Beeton both wrote evocatively about
  jam making. Choose a short, sharp line.

Strong public-domain sourcing across Beeton, Acton, USDA NCHFP. UK
kitchen, no specialist sourcing (other than jam jars and a thermometer,
both common).

### Target reader

Someone who has eaten supermarket jam and is curious about making their
own, especially during strawberry season. They have a hob, a heavy pan, and
basic equipment. They've heard about pectin and setting point but couldn't
explain either. They want to come away with a row of jars on the shelf and
the confidence to make raspberry jam next week without rereading.

### Section outline

```
HERO ILLUSTRATION (above the content)

H1: Strawberry jam — open-pan method, no commercial pectin

EXCERPT: "A pan of strawberries, sugar, lemon juice, and time. The
classical British jam, the way it sets without a sachet of pectin. About
six jars from a kilo of fruit."

INTRODUCTION (2–3 paragraphs)
- What this tutorial does: full process, fruit to jar
- Strawberry jam's quirk: low natural pectin, so the lemon and the long
  boil do the work
- Yield: roughly six 340 g jars from 1 kg of fruit

INFO PANEL (note tone)
- Title: "Why this jam needs no sachet"
- Body: a paragraph on the pectin in strawberries (low) and why lemon
  juice supplies the rest of what the set needs. Inline GLOSSARY TOOLTIP
  on "pectin".

H2: What you need

SUPPLIES CARD
- See "Supplies card content" below

H2: A note on jars and safety

INFO PANEL (warning tone)
- Title: "Hot sugar burns more deeply than boiling water"
- Body: a paragraph on the temperature (104°C and above) and what to do
  if jam goes on skin. Cold running water for at least ten minutes,
  medical attention if the burn is larger than a coin.

H2: Method

H3: Step 1 — Prepare the fruit
- Hull the strawberries. Halve any that are larger than a 50p piece;
  leave smaller ones whole.
- Weigh the prepared fruit and adjust the sugar pro rata.

H3: Step 2 — Macerate
- Layer fruit and sugar in a wide non-reactive bowl. Cover and leave for
  four hours, or overnight in the fridge.
- Inline GLOSSARY TOOLTIP on "macerate" (or "maceration")
- INFO PANEL (tip tone): "The maceration draws juice from the fruit
  before the heat does. The jam keeps more of the strawberry's whole
  shape and brighter colour as a result."

H3: Step 3 — Sterilise the jars
- Inline GLOSSARY TOOLTIP on "sterilise"
- Bullet list: jars in a low oven (140°C / gas 1) for 20 minutes; lids
  in a small saucepan of just-boiled water for 10 minutes.

H3: Step 4 — Boil
- Tip the macerated fruit and sugar into a heavy preserving pan with the
  lemon juice. Bring slowly to a simmer over a low heat, stirring until
  every grain of sugar has dissolved. Then turn up and bring to a rolling
  boil.
- Set the timer at 8 minutes and start testing.

H3: Step 5 — Test for setting point
- Inline GLOSSARY TOOLTIP on "setting point"
- INFO PANEL (tip tone): "The freezer saucer test is more reliable than
  any thermometer for strawberry jam. Pull the pan off the heat each
  time you test, so the jam doesn't overshoot while you wait."
- Numbered list of three setting-point tests:
  1. The wrinkle test — drop a teaspoon onto a frozen saucer, wait a
     minute, push with a fingertip, look for a wrinkle.
  2. The flake test — lift a wooden spoon, let it drip; jam ready when
     drops merge into flat sheets that fall away cleanly.
  3. The thermometer test — 104°C / 220°F. Less reliable for
     strawberry; the wrinkle test is the source of truth.

H3: Step 6 — Skim and rest
- Pull the pan off the heat. Skim the scum from the surface — inline
  GLOSSARY TOOLTIP on "scum".
- Let the jam stand off the heat for five minutes. The strawberries will
  redistribute through the jam rather than floating to the top.

H3: Step 7 — Jar and seal
- Ladle into the hot, sterilised jars. Use a jam funnel.
- Wipe the rims with a clean cloth dipped in just-boiled water.
- Seal immediately with the hot lids, screwed tight. Listen for the
  click of the safety button pulling down as the jar cools.
- INFO PANEL (note tone): "A water-bath process step extends shelf life
  to 12 months. Sealed-only jars keep for 3 months unopened, 4 weeks
  open in the fridge. See the water-bath canning tutorial."

SUB-TUTORIAL CARD: link to "Water-bath canning basics" tutorial

H2: Storage

- Cool, dark cupboard, 3 months unopened.
- Once opened: keep in the fridge, finish within 4 weeks.
- A water-bath canned jar stretches the shelf life to 12 months sealed.

H2: Troubleshooting

TROUBLESHOOTER BLOCK
- See "Troubleshooter content" below

H2: Variations

VARIETIES PANEL
- See "Varieties content" below

H2: Where this jam lives

A short, concrete paragraph on what to do with the jam beyond toast.
Scones (link to the scones tutorial). Sponge filling (link to Victoria
sandwich). Drizzled on yoghurt with toasted almonds. Bakewell tart
filling (link).

PULL QUOTE
- See "Pull quote" below

PRODUCT CARD
- A jam thermometer recommendation, or a sterilising kit (jar funnel,
  jar tongs, magnetic lid lifter). Specific product Rebecca chooses.

SOURCES (in `sourceNotes`)
- Mrs Beeton, Book of Household Management (1861), Chapter 26 —
  Preserves and Confectionery (Project Gutenberg #10136)
- Eliza Acton, Modern Cookery for Private Families (1845), Chapter on
  Preserves
- USDA / National Center for Home Food Preservation (NCHFP) — Home
  Canning and Jam Making (public-domain US government guidance)
```

### Supplies card content

```
Heading: What you need

Ingredients:
- Strawberries, ripe         1 kg (hulled weight)
- Granulated sugar            800 g (or 1 kg for a firmer set)
- Lemon, juiced               1 large
- Knob of unsalted butter     a teaspoon (optional, helps with scum)

Equipment:
- Heavy preserving pan        wide and shallow, around 28 cm
- Wooden spoon                long-handled
- Slotted spoon               for skimming
- Jam funnel                  for clean filling
- Jam thermometer             optional but useful
- Saucer in the freezer       for the wrinkle test
- Clean glass jam jars        6 × 340 g, with new lids
- Kitchen cloth               clean, for wiping rims
- Tea towel or tray           a stable surface to fill on
```

### Glossary terms

| Term | Definition (short, for tooltip) | Status |
|---|---|---|
| Pectin | A natural gum in fruit (highest in apple, citrus pith, redcurrant) that sets jam when boiled with sugar and acid. Strawberries are low in pectin, which is why this recipe leans on lemon. | Verify in admin |
| Setting point | The temperature and consistency at which a hot jam will set as it cools. Typically 104°C and the wrinkle on a frozen saucer. | Verify in admin |
| Sterilise | To heat a clean glass jar to a temperature that kills the microbes left after washing. A low oven for 20 minutes is the home-kitchen standard. | Verify in admin |
| Scum | The foam of denatured fruit proteins and air that rises during boiling. Skim it for a clearer jam. A small knob of butter at the start reduces how much forms. | Verify in admin |
| Macerate | To soak fruit in sugar (or salt, or acid) so that juice draws out by osmosis before any heat is applied. | Verify in admin |

Action before authoring: open `/admin/glossary`, search each term, create
any that are missing. Cooking category.

### Sub-tutorial card targets

- Water-bath canning basics — safety underpinning (planned)
- Raspberry jam — natural cross-reference (planned)
- Plain scones — what to spread the jam on (planned)
- Victoria sandwich — what to fill with the jam (planned)
- Bakewell tart — another destination dish (planned)

### Pull quote

> "Of all the preserves which the housewife is called upon to make in the
> course of the year, the strawberry jam is, perhaps, the most welcome to
> the family."
>
> — Mrs Beeton, *Book of Household Management*, 1861

(Verify in PG #10136 before publishing — paraphrase if memory of the line
isn't exact.)

### Troubleshooter content

| Symptom | Cause and fix |
|---|---|
| The jam didn't set | Either you didn't reach setting point, or there wasn't enough pectin and acid. Return the jam to the pan with the juice of another lemon, bring to a rolling boil, retest at 8 minutes. Some batches of strawberries are simply lower-pectin than others. |
| It set rock hard | You overshot setting point. Loosen by warming in the pan with a splash of warm water; whisk until smooth, re-jar while hot. |
| The strawberries floated to the top | The jam wasn't rested before jarring. Five minutes off the heat lets the fruit redistribute. Next batch, build that five minutes into the timing. |
| The surface is scummy | Skim with a slotted spoon while the jam is still hot. A teaspoon of unsalted butter stirred in at the start of cooking reduces how much scum forms. |
| Sugar crystals on the surface or in the jar | Sugar didn't fully dissolve before the rolling boil. Next time, hold the pan on a low heat until you cannot feel a single grain on the back of the spoon, then turn up. |
| Mould appeared on top of an unopened jar | The seal failed. Either the jar wasn't sterile, the rim was sticky and broke the seal, or the lid was not new. Bin the whole jar — mould on jam isn't a "cut around it" situation. The seal point also fails if a jar cools in a draught. |

### Public-domain sources

Primary:

- **Mrs Beeton, *Book of Household Management* (1861), Chapter 26 —
  Preserves and Confectionery.** Project Gutenberg #10136. The strawberry
  jam recipe and the surrounding paragraph on which fruits set easily
  remain the British reference.
- **Eliza Acton, *Modern Cookery for Private Families* (1845), Chapter on
  Preserves.** Earlier than Beeton, more detail on the science of setting.
- **USDA / National Center for Home Food Preservation, *Complete Guide to
  Home Canning* (Bulletin 539).** Public-domain US government publication.
  Use this as the source for the water-bath times in the cross-linked
  canning tutorial; for the jam itself, USDA confirms the safe acidity of
  the strawberry + lemon ratio in this recipe.

### Hero illustration brief

A linen tea towel laid across a kitchen table in afternoon light. Three
jars of finished jam (deep ruby, slightly opaque, with whole strawberry
halves visible), a sprig of strawberry leaves to the side, a wooden spoon
streaked with jam laid across one jar's rim, a small lemon half. Cream
and sage palette with the jam's red as the warm accent.

---

## Cross-cutting checklist before authoring

Before Rebecca sits down to write either body, run through:

- All glossary terms exist in `/admin/glossary` (search each term;
  create any that are missing; note the term IDs).
- The Cooking category exists in `/admin/categories`; check what
  sub-category each tutorial belongs to (Sauces for béchamel; Preserves
  for strawberry jam).
- A hero media is uploaded in `/admin/media` — the illustration brief
  above is the prompt for that upload.
- Sources go into the Tutorial row's `sourceType` (set to PUBLIC_DOMAIN
  for both) and `sourceNotes` (the bullet list under "Public-domain
  sources" above).
- The TipTap editor has all eight custom block types available. Three of
  them (product card, varieties panel, troubleshooter) are landing in
  the in-flight blocks session. Verify they're in the toolbar before
  starting to author.

## What we expect to learn from these two

The point of the anchor pair is to surface page-design problems and
TipTap-schema gaps before bulk authoring exposes them at scale. After
publishing both, Rebecca reads them as a customer. Likely findings:

- Where the page reads cluttered (too many blocks in a row).
- Which custom blocks need a denser or sparser visual treatment.
- Which paragraphs want a different heading level for clean TOC scroll.
- Whether the sources aside is too quiet or too prominent.
- Whether the supplies card wants splitting into ingredients-and-equipment
  rather than one mixed list.
- Whether the troubleshooter rows want internal anchors so they can be
  linked to from "see troubleshooter" lines elsewhere.

Findings feed the page-design iteration round (step 3 of the author loop
in `project_content_pipeline.md`).
