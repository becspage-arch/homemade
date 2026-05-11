# Tutorial authoring — worker prompt template

This file is the canonical input for any worker session that drafts cooking
tutorials. It defines the locked illustration prompt, the voice rules to
enforce, the structural template, and the upload mechanics. As the
pipeline grows (Phase 6 of the author loop in
`memory/project_content_pipeline.md`), the body-authoring prompt template
lands here too.

Currently locked: the illustration prompt. The body-authoring prompt is
TODO and lands as part of the pilot-batch session.

---

## Locked illustration prompt prefix

**Style:** Style A — Modern botanical.
**Tier:** Flux 1.1 Pro Ultra on fal.ai. Endpoint:
`https://fal.run/fal-ai/flux-pro/v1.1-ultra`. Aspect: `16:9`. Output: PNG.

**Prefix** (paste verbatim, then append `, <subject description>`):

```
Modern botanical illustration in the style of vintage gardening manuals,
clean ink linework with delicate watercolour fills, warm muted palette of
sage green, linen cream, soft terracotta, and walnut brown, generous
white margins on a soft cream background, restrained detail, hand-drawn
quality, no photographic realism, no commercial slickness, calm
composition, soft natural light implied, no text, no letters, no writing,
no labels on the food itself
```

(The last clause — "no text, no letters, no writing, no labels on the food
itself" — is the negative against Flux's tendency to hallucinate text on
bread, jar labels, and packaging. The style-test surfaced this on Style B's
sourdough loaf; the prefix above prevents most of it.)

## Image-tier policy

| Image role | Tier | Cost per image |
|---|---|---|
| Hero (one per tutorial) | Flux 1.1 Pro Ultra | $0.06 ≈ £0.048 |
| Inline illustrations | Flux 1.1 Pro Ultra | $0.06 ≈ £0.048 |
| Diagrams | Flux 1.1 Pro Ultra, label-free; labels typeset over the image in admin | $0.06 ≈ £0.048 |

Schnell is not used for production. The £80 saved at scale isn't worth the
quality drop on finished-food subjects, and the consistency risk is real
across 3,000+ tutorials.

## How to generate images programmatically

The reference script is `docs/illustration-style-test/generate.mjs`. It
reads `FAL_KEY` from `.env.credentials`, takes a subjects + styles array,
and writes PNGs + a log to disk. For bulk authoring this gets adapted into
a per-tutorial generation step inside the worker prompt — see the
`packages/db/scripts/` programmatic upload tooling planned in
`project_content_pipeline.md`.

For a one-off generation (e.g. anchor tutorial heroes), copy the script,
swap the subject array, run with `node`.

## Voice rules

All tutorial bodies follow Section 6b of the brand direction (memory:
`feedback_homemade_voice.md`). Banned-phrase grep + banned-opener grep +
em-dash check + negation-pattern check before any draft commits.

## Body-authoring prompt template

Distilled from the two anchor tutorials (béchamel + strawberry jam). Hand
this to a worker session along with a single brief. The session drafts one
tutorial body as JSON in the shape `packages/db/scripts/upload-tutorial-types.ts`
expects, then uploads it with
`pnpm --filter "@homemade/db" run tutorial:upload <path-to.json>`.

> You are drafting one Homemade cooking tutorial. The brief is below.
> Output is one JSON file matching the
> `TutorialUploadInput` shape declared in
> `packages/db/scripts/upload-tutorial-types.ts`. The brief tells you the
> slug, the title, the category and sub-category, the source attribution,
> the supplies list, the glossary terms, and the rough section outline.
> Your job is the body prose.
>
> **What the body must contain**
>
> A short introduction (two or three paragraphs, no preamble, no
> wind-up). State what the tutorial does, where the difficulty sits, what
> the reader will end up with. Specific numbers where they fit
> (temperatures, weights, yields, times).
>
> Then the structured spine: H2 for `What you need`, an H2 for `Method`
> with one H3 per step, an H2 for `Troubleshooting`, an H2 for
> `Variations`, an H2 for `Where this [thing] lives`. Optionally an H2
> for `Storage` or `A note on safety` between steps and troubleshooting
> if the topic earns it.
>
> Use every applicable custom block from the eight available:
> `infoPanel`, `suppliesCard`, `glossaryTooltip`, `subTutorialCard`,
> `pullQuote`, `productCard`, `varietiesPanel`, `troubleshooter`. Two or
> three info panels per tutorial; one supplies card; one troubleshooter
> with at least four rows; one varieties panel where the technique has
> direct variants; one product card for a real piece of kit; one pull
> quote drawn from a public-domain source. Reference any glossary term
> the first time it appears in the body via a `glossaryTooltip` mark.
> Sub-tutorial cards point at planned slugs; the public renderer
> gracefully degrades when the target doesn't exist yet.
>
> **Voice (strict — `feedback_homemade_voice.md` Section 6b is the bar)**
>
> - British English spelling and idiom throughout. Caster sugar, not
>   superfine. Colour, flavour, sieve, knob of butter, pudding basin,
>   washing-up bowl. Pounds, ounces accepted alongside metric when the
>   reference is older.
> - Banned phrases — never use any of: "honest", "honestly", "frankly",
>   "truthfully", "genuinely" as a filler, "delve into", "at its core",
>   "in the realm of", "tapestry of", "a testament to", "a beacon of",
>   "navigate the complexities", "unlock the secrets", "treasure trove",
>   "game-changer", "speaks volumes", "resonates with", "embrace",
>   "elevate", "foster" non-literal, "cultivate"/"nurture" metaphorical,
>   "vibes". Full list in the memory file.
> - Banned sentence openers — never start a sentence with: "In conclusion",
>   "Furthermore", "Moreover", "Additionally", "With that said",
>   "Having explored", "Let's dive in", "Picture this", or "Imagine"
>   used as an opener.
> - Em dashes: max one per paragraph. Never two in a single sentence.
>   British spacing — that is a space, an em dash, a space ( — ). Use
>   commas, parentheses, or a full stop instead, most of the time.
> - At most one negation construction in the whole body. State things
>   directly. "Not just X but Y" patterns are off.
> - No wrap-up endings. The last sentence is the last useful sentence.
>   No "Happy cooking!", no "Remember, the real magic is …", no
>   philosophical takeaway. Stop when the work is done.
> - Vary paragraph and sentence length. Some short, some long. Avoid the
>   topic-sentence-plus-three-supporting-sentences school-essay rhythm.
> - Avoid tricolons unless one really earns the rhythm. Two examples or
>   four are usually better.
> - Specific over abstract. Concrete numbers (104°C, 800 g, 28 cm pan),
>   concrete kit, concrete tells (wrinkle on a frozen saucer, magnolia
>   colour on the roux, sage in the linen cloth). Avoid "carefully",
>   "gently", "magic", "perfect", "delicious" — the description should
>   make those words unnecessary.
> - Voice references: Alice Waters, Monty Don, Erin Boyle, Nigel Slater,
>   Vita Sackville-West. Calm, knowing, slightly dry. A real person who
>   has done this thing many times explaining it to a friend in their
>   kitchen.
>
> **Sources**
>
> Quote only from public-domain texts (pre-1928, USDA/NCHFP, UK
> Government, Project Gutenberg). Verify quotations against the original
> — paraphrase if memory of the line is shaky. Put attribution in the
> `pullQuote` block's `attribution` attr. Put the full citation list in
> the Tutorial's `sourceNotes` field (the brief gives you these).
>
> **Output shape**
>
> Return one JSON file. Glossary terms referenced by the body must be
> declared in the top-level `glossaryTerms` array with a `slug`, `term`,
> and a one-sentence `definition`. In the body, reference them with the
> mark `{ type: 'glossaryTooltip', attrs: { termSlug: '<slug>' } }`. The
> upload script swaps `termSlug` for the resolved `termId` before insert.
> Hero image path is relative to the JSON file: see the anchor tutorials
> in `packages/db/scripts/anchor-tutorials/` for working examples.
>
> **Self-check before returning**
>
> - `grep -i` for each banned phrase in the JSON. Zero matches.
> - `grep -E '—.*—'` per paragraph: each paragraph contains at most one
>   em dash, never two in one sentence.
> - Read the last paragraph. If it sounds like a wrap-up, cut it.
> - Read the first sentence of the intro. If it starts with "In", "The
>   art of", "Picture this", "Imagine", or names the dish in a way that
>   sounds like a magazine subheading, rewrite it.

## Upload mechanics

The tutorial body, metadata, and hero image upload via
`packages/db/scripts/upload-tutorial.ts`. Input is a JSON file matching
`TutorialUploadInput` (see `packages/db/scripts/upload-tutorial-types.ts`).
The script:

- Resolves the author (`rebecca@homemade.education`) and the category +
  sub-category by slug. Fails loudly if a category slug is missing.
- Creates any glossary terms referenced by the body that don't yet exist,
  using the definitions in the input JSON.
- Pushes the hero image to Cloudflare Images via the same direct-upload
  flow the admin uses, then creates a Media row.
- Inserts the Tutorial as `DRAFT` with `sourceType: PUBLIC_DOMAIN` (or
  whatever the input specifies), and snapshots the first `TutorialVersion`
  to match the admin lifecycle.
- Is idempotent on re-run: a Tutorial with the same `slug` is updated in
  place, with a new version snapshot.

Run:

```bash
pnpm --filter "@homemade/db" run tutorial:upload \
  packages/db/scripts/anchor-tutorials/bechamel.json
```

A worker session producing the JSON should be invoked with this prompt
template, the brief for the specific tutorial, and a short hand-off rule
(commit on the worker's own branch, mention the resulting Tutorial id and
slug in the report so the orchestrator can preview them).
