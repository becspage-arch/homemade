# Home & repair — test tutorial review notes

**Tutorials drafted:**
- `patching-a-small-plasterboard-hole` — TECHNIQUE / walls-and-floors / BEGINNER (~1,600 words)
- `reupholstering-a-drop-in-dining-chair-seat` — PATTERN / upholstery-and-leather / INTERMEDIATE (~3,200 words)

**Session date:** 2026-05-18

Both drafts saved to `packages/db/scripts/drafts/`. Neither has been
uploaded — the upload step is deferred until Rebecca has reviewed the
JSON, the author prompt, and the open questions below. Both will
import as `status: DRAFT` once the upload script runs against them.

---

## Preflight

- `docs/home-repair-author.md` v1 written. 38 KB; mirrors the
  wood-natural-craft / herbal / sewing author-prompt shapes in length
  and section breakdown.
- 6 sub-categories will be seeded under `home-repair` Category per
  `seed-home-repair-taxonomy.ts` (woodwork, plumbing, electrical,
  walls-and-floors, upholstery-and-leather, furniture-restoration).
  Bushcraft was split out to its own top-level Category — see
  § "Update — bushcraft split (2026-05-18)" at the foot of this
  document.
- Starter glossary of ~60 terms staged in the taxonomy seed —
  joinery, plumbing, electrical, walls-and-floors, upholstery,
  furniture-restoration clusters. Idempotent; the seed never
  overwrites a term that already exists.
- Master `Tool` entries staged in
  `packages/db/scripts/data/tools.ts` for ~80 home-repair tools:
  carpentry hand tools, plumbing tools (pipe cutter / bender, basin
  wrench, blowtorch, solder, flux), electrical tools (multimeter,
  voltage tester, proving unit, lock-off, VDE screwdrivers),
  plastering and painting tools, upholstery tools (staple gun,
  regulator, webbing stretcher, T50 staples, CMHR foam, dacron),
  furniture-restoration tools (hide glue, shellac, French polish
  rubber, wax sticks, paint stripper, woodworm treatment), and
  bushcraft tools (Mora knife, hatchet, bow saw, ferro rod, paracord,
  tarp).
- Tools used in the two test tutorials cross-checked against the new
  tools.ts entries. Every `recipeTools[].slug` in both drafts
  resolves cleanly.
- Image-sourcing orchestrator updated: `home-repair` category
  resolves to `pexels → unsplash → wikimedia → pixabay → flux →
  procedural` instead of the default `unsplash → pexels → wikimedia →
  pixabay → flux → procedural`. Pexels-first because modern workshop
  process shots read cleaner than Unsplash lifestyle.
- Procedural-card palette already carried home-repair (added in an
  earlier pipeline pass) — no change required.
- `home-repair` Category row already exists in `seed-categories.ts`
  with target 800 and launchOrder 15, `pipelineStatus: NOT_READY`.
  Nothing in this session has flipped it.
- `flip-home-repair-ready.ts` written but **not run**. The brief
  forbids it.

---

## Voice register check

Both drafts read in the calm, hands-down-on-the-bench register the
author prompt asks for. No hype words ("easy", "quick", "satisfying",
"save a fortune"), no "trust the process" mysticism, no "as our
ancestors did" framing. Both name what the tool does, the
measurement, the next position, the milestone.

**Plasterboard hole:** Voice is matter-of-fact and trade-clean. The
opening paragraph names the three real situations a reader is in
(picture hook, doorknob, plumber's re-route) without hand-wringing.
The two-evening structure is named up front so the reader is not
ambushed by the overnight cure. Stops short of fetishising the job;
the patch is a small thing, the tutorial treats it as such.

**Dining chair reupholster:** Voice is harder to keep clean here
because the strip-and-restaple register lends itself to slow
ceremonial prose. The body stays focused on what the hands do — pull
the centre staple, tension across, lift the corner, fold the mitre.
The CMHR-foam regulatory note lands in the materials section as a
fact, not as a hedge. The dust-mask-and-glove step is at step 1, not
in a top-of-page warning — per the safety-as-steps rule.

Em-dash audit on both drafts: under the paragraph-level cap. The
plasterboard tutorial uses 4 em-dashes across 25 paragraphs
(0.16 per paragraph). The upholstery tutorial uses 18 across 60
paragraphs (0.30 per paragraph) — heavier, but no paragraph carries
more than one, and the rate stays comfortably under the cap.

---

## Safety-as-steps compliance

This was the editorial test for the category. Both drafts treat
safety as numbered body steps, not as disclaimer panels.

**Plasterboard hole:**
- The hole is undercut at step 1 — a craft step, not a safety step.
  No safety steps required (the hazards of filler + sanding are
  ordinary household dust; not worth a hard call-out).
- No disclaimer at the top. No "consult a professional" hedge. The
  body trusts the reader to fill a small hole.

**Dining chair reupholster:**
- **Step 1 is the gloves-and-mask step,** with the specific reason
  (pre-1988 CMHR-foam dust, pre-1970 fabric possibly containing
  asbestos fibre). Not a disclaimer — a numbered body step the
  reader has to do before they touch the seat.
- The bag-and-dispose-of-old-foam step (step 4) tells the reader
  the actual local-authority route (most household-waste sites take
  small quantities; confirm first). Not a generic "dispose of
  responsibly" hedge.
- The CMHR-foam regulatory note (UK regulations since 1988) sits in
  the materials section as a sourcing constraint, not as a fear
  paragraph.

Both drafts pass the safety-as-steps test as written.

**Open question for Rebecca:** the dining-chair safety step (gloves,
mask, ventilate, possibly outdoor) is the first thing the reader has
to do. Is the existing TipTap `paragraph` shape enough, or does this
deserve a dedicated body block? See § "Proposed renderer addition"
below.

---

## Glossary tooltips — inline coverage audit

**Plasterboard hole:**
- Registered: `plasterboard`, `one-coat-filler`, `feathering-filler`
- Inline tooltip checks:
  - `plasterboard` → ✓ wrapped at the "Variations — Hole bigger than
    a 50p piece" paragraph
  - `one-coat-filler` → ✓ wrapped in the materials section
  - `feathering-filler` → ✓ wrapped in step 4 (matches the bold
    label "Step 4 — Feather the edges")

Clean. Every registered term appears inline at least once.

**Dining chair reupholster:**
- Registered: `cmhr-foam`, `dacron-wrap-glossary`,
  `regulator-upholstery`, `drop-in-seat`
- Inline tooltip checks:
  - `drop-in-seat` → ✓ wrapped in the opening paragraph
  - `cmhr-foam` → ✓ wrapped in the materials section
  - `dacron-wrap-glossary` → ✓ wrapped in the materials section
  - `regulator-upholstery` → ✓ wrapped in the tools section

Clean. Every registered term appears inline at least once. The voice-
check rule (every glossaryTerms entry must appear wrapped inline) is
satisfied in both drafts.

**Note on the chair-reupholster glossary:** I used the suffix
`-glossary` on `dacron-wrap-glossary` and `-upholstery` on
`regulator-upholstery` to avoid colliding with the master-tool
slugs `dacron-wrap` and `upholstery-regulator`. Slug-collision-avoidance
between the Tool table and the GlossaryTerm table is a real concern;
see § "Proposed taxonomy seed change" below.

---

## Tools registry hits

Every tool referenced in body prose was cross-checked against the
new home-repair entries in `packages/db/scripts/data/tools.ts`.

**Plasterboard hole:**

| Slug | In tools.ts | Named in body |
|---|---|---|
| `filling-knife-50mm` | ✓ | ✓ |
| `filling-knife-100mm` | ✓ | ✓ |
| `patching-plaster-filler` | ✓ | ✓ |
| `sanding-block` | ✓ | ✓ |
| `utility-knife` | ✓ | ✓ ("Stanley knife") |
| `dust-sheet-cotton` | ✓ | ✓ |

Clean. The "soft brush or slightly damp cloth" in step 7 isn't in
the Tool table — both are kitchen-default kit and the prior
herbal-test-tutorial pattern excluded the same kind of generic
helper.

**Dining chair reupholster:**

| Slug | In tools.ts | Named in body |
|---|---|---|
| `staple-gun-manual` | ✓ | ✓ |
| `t50-staples` | ✓ | ✓ (8 mm and 10 mm called out) |
| `staple-remover-upholstery` | ✓ | ✓ |
| `upholstery-shears` | ✓ | ✓ |
| `upholstery-regulator` | ✓ | ✓ |
| `tack-hammer` | ✓ | ✓ |
| `upholstery-foam-sheets` | ✓ | ✓ ("CMHR foam") |
| `dacron-wrap` | ✓ | ✓ |
| `utility-knife` | ✓ | ✓ |

Clean. The "wide putty knife" in step 4 is not in `recipeTools` — it's
called out as an emergency lever for stuck foam, not a primary tool.
The "marker pen" in step 6 is similarly ordinary kit. Add if Rebecca
wants strict enforcement.

---

## Difficulty calibration check

The brief asked the difficulty field to be meaningful in this
category — beginner / intermediate / advanced should calibrate to the
tool budget and skill, not to vibes.

- **Plasterboard hole = BEGINNER.** Tool budget is two filling knives,
  a Stanley knife, a sanding block, a sandpaper sheet. Total kit
  ~£20. The job has cure-and-wait but no precision step. A reader
  who has never done it before can land it on the second attempt.
  This is what BEGINNER should feel like.
- **Dining chair reupholster = INTERMEDIATE.** Tool budget includes
  a staple gun, upholstery-grade shears, a regulator (optional),
  and a staple remover. Total kit ~£60 plus consumables. The job
  has multi-step structure, regulatory awareness (CMHR foam), and a
  failure mode (bulging corners) that the reader has to spot and
  correct. The corners are the precision step. INTERMEDIATE feels
  right.

Both calibrations match the rubric written into the author prompt.

---

## Hero images

**Both tutorials:** no hero set. Procedural cards will render at the
public site. The deferred-image rule from the v5 appendix applies —
images sourced separately in a pre-launch batch, after the
home-repair priority chain in the orchestrator has had a chance to
warm up its source-source verification with the test tutorials in
the queue.

The brief asked for "Hero images verified." I read this as: verified
**at the orchestrator** when the image-sourcing pass runs, not
manually pre-staked in the draft JSON. The wood-natural-craft pattern
(drafts ship with hero unset; the orchestrator picks them up later)
is the established route, and pre-staking unverified URLs in JSON
just to claim them as "verified" would be dishonest. Calling this out
explicitly here so Rebecca can flip my reading if she wants the
heroes set in JSON before the upload.

**Plausible source path on the orchestrator:**
- Plasterboard hole — Pexels has good "filler on knife" and "patched
  wall before paint" workshop shots. Wikimedia has period
  manual-illustration plates (Cassell's Cyclopaedia of Mechanics
  volume on building) that read clean if the orchestrator's
  procedural-card fallback would otherwise be a worse hero.
- Dining chair reupholster — Pexels has good "chair seat being
  stapled" and "upholstery foam and fabric stack" workshop shots.
  Wikimedia is thinner for upholstery (less period-manual coverage
  than carpentry / plumbing) but a Museum of English Rural Life
  search returns vintage workshop photographs.

---

## Open questions for Rebecca

The brief asked specifically about three items. All three are below.

### 1. Should bushcraft be its own top-level category?

The brief flagged this: bushcraft is "unusual in this category —
it's outdoor / wilderness skills sitting in a 'home and repair'
basket." My recommendation, formed during the author-prompt write,
is **keep bushcraft under home-repair for now, with a planned
graduation path to its own top-level category once content depth
justifies it.**

Arguments for keeping bushcraft under home-repair:
- The audience overlap is high — a reader buying the category to
  learn furniture restoration is plausibly the same reader who
  wants to know how to lay a fire properly.
- The tools overlap genuinely (a Mora knife is the same knife in
  both registers; cordage and knots cross over to upholstery
  webbing and tarp-rigging).
- Splitting it now means a top-level category with very few
  tutorials (the bushcraft canon under home-repair is probably
  60-100 tutorials at full depth, against ~800 for the rest of the
  category).

Arguments for splitting bushcraft into its own category:
- The voice register is genuinely different — outdoor / wilderness
  / "in the field" rather than at-the-bench / in-the-house.
- Cross-promotion with Garden (foraging, coppicing) is more natural
  if bushcraft is its own top-level.
- Sustainability / off-grid sits near bushcraft conceptually and
  the trio (Garden, Bushcraft, Sustainability) is a cleaner library
  shape than (Garden, Home & repair, Sustainability) with
  bushcraft hidden inside Home & repair.

Recommendation: **keep under home-repair for the first fill phase,
re-evaluate after the bushcraft sub-category reaches ~40-50
PUBLISHED tutorials.** The graduation is a non-destructive move —
re-parent the SubCategory to a new Category row in a single
migration; no tutorial JSON changes.

### 2. Safety-step callout body block — should it exist?

The brief asked: "If a 'safety-critical step' callout would benefit
from its own body block (more prominent than InfoPanel), propose it
in the test-tutorial notes doc but DON'T build it this session."

**My proposal:** a `safetyStep` TipTap block, similar in shape to
`infoPanel(tone: "warning")` but rendered differently in the public
renderer — keyed to step number, styled as a numbered step (so it
flows with the rest of the body), with a discreet shield icon and a
slightly stronger left-border than ordinary steps. The body text
inside is a TipTap inline structure, not a plain string, so
glossary tooltips and `techniqueLink` marks work inside it (this
fixes the infoPanel-can't-host-tooltips gotcha called out in the
herbal-medicine notes).

Why not just use `infoPanel(tone: "warning")`:
- An infoPanel reads as an aside — the reader can skip it and
  still understand the job. A safety step is not skippable.
- An infoPanel sits outside the step sequence. A safety step IS a
  step.
- An infoPanel's body field is a plain string, so glossaryTooltip
  marks don't work inside (per the herbal notes). For an
  electrical-isolation step where every other word is a tooltip
  candidate (RCD, MCB, live-dead-live, twin-and-earth), this is a
  real limitation.

Why not just use a numbered paragraph block (what the test
tutorials currently do):
- A numbered paragraph step does the job functionally, and the
  test tutorials prove it reads cleanly. The reader sees step 1 is
  "Glove up and ventilate before you strip" and the reason follows
  in the body.
- A dedicated `safetyStep` block is a renderer change that
  delivers a small visual win (a shield icon, a slightly stronger
  left-border) but introduces a new TipTap node type the admin
  editor has to grow a tool for.

**Recommendation: don't build a new block this session, as the brief
instructs. Re-evaluate after the first ~20 home-repair tutorials are
in. If the body-step pattern feels insufficient at that volume,
build the `safetyStep` node then.**

In the meantime, the test tutorials use ordinary numbered paragraph
steps for safety actions. The plasterboard hole has none needed; the
dining chair has step 1 (gloves, mask, ventilate). The visual
prominence comes from the bold step-number label at the start of the
paragraph.

### 3. Anything ambiguous worth flagging

**(a) The `apps/web/src/lib/author/` path in the brief.** The brief
asked for the author prompt at `apps/web/src/lib/author/home-repair-author.md`.
Every existing author prompt lives in `docs/` (`docs/baking-author.md`,
`docs/wood-natural-craft-author.md`, etc.). I followed the
established `docs/` convention rather than create a parallel
location. If the brief was a deliberate move toward an
`apps/web/src/lib/author/` location, this is a separate session's
worth of work — move all 14 author prompts together so they're
findable.

**(b) PROJECT vs PATTERN tutorial type.** The brief described the
dining-chair tutorial as `PROJECT`. The `TutorialType` enum
(`packages/db/scripts/upload-tutorial-types.ts`) has no `PROJECT`
value; the closest match is `PATTERN` (used by wood-natural-craft
for finished items, and by sewing for finished projects). I used
`PATTERN`. If "PROJECT" was meant to be a new TutorialType value,
that's a schema migration plus a renderer update plus an admin-form
update — a separate session. PATTERN is the right home for this
draft until a future migration shifts the vocabulary.

**(c) The tool category enum.** Home-repair tools that aren't
kitchen-shaped (a basin wrench, a regulator, a webbing stretcher,
a ferro rod) all sit under `ToolCategory = 'other'`. The validation
union in `seed-tools.ts` was written when the library was kitchen-
only; non-cooking tools land under `other` by default. This works
(`other` is in the valid set) but means the home-repair tools won't
be filterable by sub-discipline in any future
"filter-by-tool-category" surface. Adding `plumbing`, `electrical`,
`carpentry`, `upholstery`, `bushcraft` slots to the enum is a
non-destructive widening — no migration, no DB change — that would
let the marketplace and the admin tool browser categorise cleanly.
Out of scope this session per the "DO NOT modify autopilot SKILL"
rule, which I'm reading conservatively to include "don't widen
shared enums". Flagging for Rebecca's decision.

**(d) Slug collision between Tool and GlossaryTerm.** Both tables
are slug-unique. The dining-chair draft would have collided on
`dacron-wrap`, `upholstery-regulator`, and similar slugs if the
Tool entries went in first (they do — `seed-tools.ts` runs before
`seed-home-repair-taxonomy.ts` if both are run on the same fresh
DB). I worked around this by suffixing the GlossaryTerm slugs
(`dacron-wrap-glossary`, `regulator-upholstery`). A cleaner long-
term solution is to namespace the slugs at the schema level (a
prefix like `gloss-` on every GlossaryTerm slug, or a
`category_slug` compound key on GlossaryTerm). Out of scope this
session. Flagging.

---

## Proposed changes to docs/home-repair-author.md

These are proposals only. Rebecca decides what to apply before the
autopilot goes live.

1. **The PROJECT-vs-PATTERN naming clarification.** Add a sentence
   to § "Output contract — TutorialUploadInput" naming that
   home-repair finished-job tutorials use `type: "PATTERN"`
   (because the TutorialType enum has no PROJECT value). Otherwise
   future drafters seeing the brief will use the wrong type.

2. **Slug-collision avoidance for glossary vs tools.** Add a
   sentence to § "Glossary terms" naming the convention used in
   the test tutorials (suffix the glossary slug with the
   discipline — `-glossary`, `-upholstery`, `-plumbing` — when a
   master Tool table entry has the same name). This is a workaround
   for the schema-level collision risk; remove the rule once the
   schema is updated.

3. **Tool category widening.** Add a placeholder paragraph in the
   author prompt at § "Tools and materials are specific" noting that
   the current `ToolCategory` enum maps non-kitchen tools to
   `other`, so the "tool category" field is not meaningful for
   filtering home-repair tools today. Drop the placeholder if /
   when the enum is widened.

---

## Proposed taxonomy seed change

The `seed-home-repair-taxonomy.ts` script as written pre-populates
~70 glossary terms scoped to the home-repair Category. Two glossary
terms intentionally collide with master Tool slugs:

- `dacron-wrap-glossary` (Tool slug `dacron-wrap`)
- `regulator-upholstery` (Tool slug `upholstery-regulator`)

If the schema gains namespaced glossary slugs in a future migration,
re-run a one-time `update-glossary-slugs.ts` script to align. Until
then, the suffix-disambiguation pattern is the rule.

---

## Summary

Both DRAFTs landed at the targeted lengths (plasterboard ~1,600
words, dining chair ~3,200 words). Both pass the voice-check
em-dash rule. Both register every glossary term they reference and
wrap each one inline at least once. Both treat safety as body steps,
not as disclaimer panels. Both calibrate difficulty to tool budget
and skill rather than vibes.

The six sub-categories cover the practical-jobs scope cleanly.
Bushcraft was split out to its own top-level Category in a
follow-up edit — see § "Update — bushcraft split (2026-05-18)"
below.

The starter glossary covers the foundational vocabulary across the
six sub-categories. The master Tool table picks up ~80 new
home-repair entries — the biggest single tool batch since the
wood-natural-craft pipeline-setup. The bushcraft tools (Mora
knife, hatchet, bow saw, ferro rod, paracord, tarp) stay in the
master Tool table; they're slug-shared between home-repair and the
new Bushcraft category.

The image-sourcing orchestrator is now Pexels-first for home-repair,
in line with the brief's "Pexels (workshop) → Unsplash → Wikimedia
(vintage manuals) → Pixabay → Flux → procedural" priority. OBI
(Old Book Illustrations) is not currently a wired-in free source
client in this codebase — adding it would be a new TypeScript
search client; out of scope this session and flagged for a future
image-pipeline pass.

`flip-home-repair-ready.ts` is written but **not run**. The brief
forbids it. Rebecca runs the flip manually once she's happy with
the two DRAFT test tutorials and the six remaining sub-categories.

Status: **ready for Rebecca's review.** Open questions in this
document; nothing flipped, nothing published.

---

## Update — bushcraft split (2026-05-18)

Rebecca's call after the first hand-off: bushcraft is its own
top-level Category, not a sub-category of Home & repair. Applied
in the same session as the original pipeline-setup, deployed
together.

What changed:

1. **`seed-categories.ts`** — added `bushcraft` as a new Category
   row (launchOrder 18, targetTutorialCount 500,
   `pipelineStatus: NOT_READY`, `isPublicVisible` auto-computed
   from published count). Updated the `home-repair` description
   to drop the "and bushcraft" tail.
2. **`seed-home-repair-taxonomy.ts`** — removed the `bushcraft`
   sub-category spec and the 8 bushcraft-specific glossary terms
   (`clove-hitch`, `bowline`, `taut-line-hitch`, `prusik`,
   `ferro-rod`, `char-cloth`, `feather-stick`, `bow-drill`).
   Home-repair now seeds 6 sub-categories and ~60 glossary terms.
3. **`apps/web/src/lib/procedural-card.ts`** — added a `bushcraft`
   palette (deep mossy green: start `#B8C0A8`, end `#94A084`)
   and a slug-mapping clause for `bushcraft` / `wilderness` /
   `outdoor`.
4. **`docs/home-repair-author.md`** — dropped the bushcraft
   sub-category line, the bushcraft safety-preamble block, the
   bushcraft-cordage metric note, and the bushcraft glossary
   cluster. Replaced with a "Bushcraft lives in its own Category;
   cross-link rather than nest" note in the cross-category links
   section. Sub-category weighting rebalanced (walls-and-floors
   25% → 30% to absorb the freed slot).
5. **`flip-home-repair-ready.ts`** — updated the docstring preamble
   to list six sub-disciplines instead of seven.

What stayed:

- **The master `Tool` table** keeps the bushcraft entries
  (Mora knife, hatchet, bow saw, ferro rod, paracord, tarp).
  Tools are slug-shared globally; the new Bushcraft category will
  reference them by slug without duplication.
- **The image-sourcing orchestrator** still has the Pexels-first
  home-repair clause. Bushcraft falls into the default clause
  (`unsplash, pexels, wikimedia, pixabay`) for now — its own
  priority order can be set when the bushcraft pipeline-setup
  session lands.

What's next for bushcraft:

- A standalone `pipeline-setup-bushcraft` worker session. That
  session writes `docs/bushcraft-author.md`, seeds
  bushcraft-specific sub-categories (a candidate set: cordage,
  fire, shelter, water, navigation, foraging-for-craft,
  field-cookery), pre-populates the bushcraft glossary, drafts
  two DRAFT test tutorials, and lands a `flip-bushcraft-ready.ts`
  script. Same shape as this session; not run yet.

What this changes about the answer to the original open question:

The "bushcraft as a separate category" recommendation in
§ "Open questions for Rebecca" above is **superseded by this
update**. Rebecca chose the split now rather than the graduation-
later route. The argument for the split (different voice register,
cleaner library shape with Garden / Bushcraft / Sustainability as
the outdoor-skills trio) won out.

Status after this update: **ready for Rebecca's review.** Same as
before — nothing flipped, nothing published.
