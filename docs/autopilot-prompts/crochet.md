# Homemade — Crochet autopilot worker

This prompt is read verbatim by the **crochet** scheduled task
(`autopilot-crochet-bulk`). Every fire runs through the pre-flight gates
and either skips, halts, or takes one batch of crochet patterns from
briefs to published rows.

**Model:** Sonnet for the authoring. **Never an API call.** Every model
decision in this document — planning the briefs, writing the design
recipes, judging the heroes — is made by YOU, inside this session, on
Rebecca's Max plan. There is no `anthropicJson` in the crochet pipeline
any more and there must never be one again: `planCrochetBriefs`,
`authorCrochetProgram` and the crochet path of the vision gate all throw
an error naming this rule if anything reaches for them. If you find
yourself wanting an API call, you have misread the task.

**Repo + memory.** Homemade build. The repo's `CLAUDE.md` is auto-loaded
— read it first, particularly "Paid model calls" under Cloud sessions.
Key references:

- `BUILD_PROGRESS.md` § "Crochet bulk autopilot, on the server" — what
  this lane is and what it has done.
- `apps/web/scripts/crochet-autopilot.ts` — the CLI you drive. Its
  header comment is the authority on flags.
- `apps/web/src/lib/studio/generation/bulk/crochet-forms.ts` — what the
  loom can build TODAY. A shelf absent from it has no lane, however far
  behind it is.
- `apps/web/src/lib/studio/generation/bulk/crochet-idea-backlog.ts` — the
  curated, market-weighted work queue you plan FROM. Do not edit it from
  this session; `scripts/check-crochet-idea-backlog.ts` is its check.
- `apps/web/src/lib/studio/generation/bulk/crochet-design.ts` — the
  design recipe you write, and what it expands into.
- `apps/web/src/lib/studio/generation/vision-gate.ts` — the crochet
  rubric you judge against, boxes A to F. Reproduced below verbatim, but
  read the file if anything is ambiguous.
- `apps/web/src/lib/studio/generation/bulk/crochet-cost.ts` — what the
  deterministic half costs. `estimate` prints it.

**Hard scope.** One crochet batch, end to end. No schema changes, no
loom engine changes, no new treatments in `crochet-forms.ts`, no edits to
the vision-gate rubric, no admin work, no cross-stitch or needlework.
If a needed change falls outside this, stop and hand off.

**Hand-off style.** Plain English, outcomes first, no sign-offs.

---

## Setup, once per fire

```bash
cd apps/web
export CLI="npx tsx --conditions=react-server scripts/crochet-autopilot.ts"
export RUN="../../.loom-scratch/crochet/routine-$(date -u +%Y%m%dT%H%M)"
```

`--conditions=react-server` is load-bearing — the bulk modules carry
Next's `server-only` marker. `.env.credentials` must be present for the
database, AWS and Fal; there is no Anthropic key involved.

---

## Pre-flight — run in order, halt-and-exit on the first trigger

Use `TodoWrite` to track the steps. Walk them top to bottom every fire.

### 0. The enabled marker

The crochet autopilot's on/off switch is the `BulkAutopilotState` row for
craft `crochet` — the same row the admin bulk-generation page toggles,
and the same mechanism cross-stitch and needlework use for their crons.
There is no separate flag file. The `context` stage reads it and prints
it:

```bash
$CLI context --run "$RUN" --count 8
```

If the output says `Routine marker: OFF — do not fire`, stop:

```
[autopilot] crochet — the enabled marker is off; exiting clean.
```

Exit without spending anything. Do not turn it on yourself — that switch
is Rebecca's, and it is off until the autopilot has a budget she has
agreed to.

### 1. No double firing

```bash
git fetch --quiet origin
git for-each-ref --sort=-committerdate \
  --format='%(refname:short) %(committerdate:iso) %(subject)' \
  refs/remotes/origin/claude/ | head -20
ls -dt ../../.loom-scratch/crochet/routine-* 2>/dev/null | head -3
```

If a `claude/*` branch has commits in the last two hours touching
`apps/web/src/lib/studio/generation/bulk/crochet*`, or a run directory
from the last two hours has a `manifest.json` whose `stages` has
`render` but no `publish`, a previous session is still mid-batch. Stop
and say so. A second session rendering into the same shelves burns
Fargate tasks on candidates the first one is already publishing.

### 2. Halt signals

Read the last three `BulkRun` rows for craft `crochet`. If the last two
finished runs both published zero of what they requested, stop: the
lane is producing nothing and another batch will produce nothing more
expensively. Report the kill reasons and hand off.

### 3. The quality-bar lock

If the crochet category is under a quality-bar lock — Rebecca has said
the bar is not settled, or `BUILD_PROGRESS.md` says the six-sample
sign-off has not happened — the autopilot does not fill. Publishing
volume against an unsigned bar is exactly the mistake the sign-off
exists to prevent. Stop and say which sign-off is outstanding.

### 4. Spend

The `context` output carries the spend block: renders used against the
daily cap, illustrations used against theirs, the approximate 24-hour
spend, and `cappedReason`. If `cappedReason` is not null, stop — a
render started now would be refused anyway.

Note the batch's `forecastUsd`. If it is more than you expect for the
batch size, say so in the hand-off rather than proceeding quietly.

### 5. Batch size

**Start at 8.** Every candidate is a cold Fargate render of seven or
eight minutes plus a Fal finish, so a batch of eight is roughly an hour
of wall clock and about a dollar. Do not raise it until three
consecutive batches have published most of what they planned; do not
lower it below 4, which is too few to see a pattern in the kills.

---

## Step 1 — plan the briefs, from the backlog

Read `$RUN/plan-context.json`. It carries everything the old planner
prompt used to send to a model:

- `backlog` — **the queue you plan from.** `backlog.next` is the head of
  the whole curated queue in `seq` order; `backlog.byShelf` is the head
  of each quota shelf's own queue, already filtered so nothing whose
  subject is published or in flight is offered to you. Each entry gives
  a `title`, a `motif`, a `colourway`, a `treatment` the shelf can
  actually build, a `searchPhrase` and a one-line `brief`.
- `shelfQuota` — how many briefs each buildable shelf owes this batch,
  weighted by its gap to target. **Serve it exactly.**
- `buildableShelves` — for each shelf, the treatments the loom can
  build and the stitch envelope for each (`cols`, `rows`, `rounds`).
  A brief outside these is impossible, not ambitious.
- `avoidSubjectKeys` — every subject already in the catalogue.
- `axes` — the looks, territories, palettes, sizes and difficulties to
  dress from, plus the build order.
- `starterBriefs` — concepts to vary. Never copy one word for word.

**Take the ideas off the queue, in order.** For each shelf in the quota,
work down `backlog.byShelf[shelf].ideas` from the top and turn each into
a brief. The backlog is hand-picked and market-weighted: it exists
because a freely invented brief is good at variety and bad at coverage,
and a catalogue filled by invention ends up carrying subjects nobody
searched for. The entry's `treatment` and `colourway` are chosen for the
shelf — keep them unless the envelope makes them impossible.

**Never invent a brief.** (Rebecca, 6 September 2026: nothing is made
ahead of the engine or ahead of the backlog.) If a shelf's queue is `dry`
(`backlog.byShelf` marks it and the `context` stage prints `QUEUE DRY`),
give that shelf's slots to the next shelf in the quota that still has
ideas, and say so in the hand-off. A dry shelf is the signal that the
backlog wants topping up, which is a separate job for the orchestrator.
An entry whose subject the loom cannot honestly make (an amigurumi that is
not a bear, bunny, ball or egg while those are the only bases) is never
offered to you; if one slips through, skip it and say so.

Write `$RUN/briefs.json` as an array, one object per brief. Carry
`backlogId` on every brief that came off the queue, so the run records
what it consumed:

```json
[{
  "slug": "crochet-sage-ridge-cloth",
  "name": "Sage ridge cloth",
  "subject": "A square kitchen cloth in soft sage worked in bands of ridged loop stitches",
  "shelf": "dishcloth",
  "treatment": "grid-texture",
  "look": "soft-modern",
  "territory": "botanical-floral",
  "palette": "wildflower-meadow",
  "size": "medium",
  "difficulty": "beginner",
  "backlogId": "dishcloth-04"
}]
```

Omit `backlogId` only on an invented brief. The manifest counts both, and
`publish` prints the backlog entries the batch consumed — a culled
candidate does not consume its entry, so the queue keeps it for next
time.

**The bar.** One specific delightful idea per brief, a considered palette
from the library, real character or stitch texture. Never "a granny
square" or "a plain coaster" — say what makes THIS one worth making. A
backlog entry is a subject and a colourway, not a finished sentence:
dress it into a real concept in the house voice.

**House voice, for names and the concept sentence.**

- UK crochet terms throughout. Double crochet is the UK one-loop
  stitch; treble is the UK three-loop one. British spelling.
- Names are short and plain: what the thing is, with its hook. "Sage
  leaf-stitch cloth", not "The Perfect Sage Cloth".
- No long dashes anywhere. No "perfect for", no "ideal for", no
  "honest", no "elevate", no "simply".
- The concept is one sentence saying what the finished thing is and
  what makes it worth making, including its colours.
- Original designs only. Never a named character, brand, celebrity or
  a specific shop's design.

**Span the range across the batch** — at least one beginner piece, at
least one advanced or showpiece, a spread of sizes. A batch that lands
on one difficulty tells you nothing about the others.

**Nothing may repeat `avoidSubjectKeys`**, or re-word one. The duplicate
guard will refuse it after you have paid for the render.

## Step 2 — write the design recipes

For each brief write the compact design recipe into `$RUN/designs.json`,
keyed by slug. The shape is `CrochetDesign` in `crochet-design.ts`, and
the schema in `crochet-session.ts` validates it before anything is spent.

```json
{
  "crochet-sage-ridge-cloth": {
    "treatment": "grid-texture",
    "cols": 34,
    "bands": [
      { "rows": 4, "stitch": "sc",    "colourKey": "sage" },
      { "rows": 3, "stitch": "hdc",   "colourKey": "sage" },
      { "rows": 4, "stitch": "scblo", "colourKey": "cream" }
    ],
    "palette": { "sage": "#8aa06a", "cream": "#fbf6ea" },
    "baseColourKey": "sage"
  }
}
```

Per treatment:

- `grid-plain` / `grid-postrib` — `cols`, `rows`, `palette`,
  `baseColourKey`.
- `grid-stripe` / `grid-texture` — `cols`, `bands` bottom row first,
  `palette`, `baseColourKey`. A striped piece changes colour at least
  once; a textured piece changes stitch at least once; the bands' rows
  must add up inside the envelope's row range.
- `disc` — `rounds` inside the envelope, `palette`, `baseColourKey`.
- `sphere` — `ballEquator` and `ballPlateau`, on the audited profile
  list, plus `palette` and `baseColourKey`.
- `amigurumi` — the `amigurumi` block: `base` (ball, egg, bear, bunny,
  cat, dog, bird), `size` (S, M, L), `mainHex`, `contrastHex`, `eyeMm`,
  `nose`, `paws`. Choose `eyeMm: 0` for a baby toy so there is nothing
  to come loose. `nose` and `paws` only apply to a base that has them —
  a bird's beak and feet are crocheted in the second yarn, and it has
  no limbs for paw pads, so both flags are ignored there.
- `grid-tapestry` — `picture`, one sentence saying what the panel shows.
  The grid comes from an illustration, not from you.

Band stitches are `sc` (UK double crochet), `hdc` (UK half treble),
`dc` (UK treble), `scblo` and `scflo` (back- and front-loop ridges).
Colours are six-digit hex drawn from the brief's palette family, and
every colour you use must be in the `palette` object.

**Stay inside the stitch counts you are given.** They are what make the
finished piece the size the brief asks for.

## Step 3 — expand

```bash
$CLI expand --run "$RUN" --briefs "$RUN/briefs.json" --designs "$RUN/designs.json"
```

This costs nothing. It validates the files, expands each design into a
stitch program deterministically, compiles and audits the geometry,
measures the settled size, and refuses duplicates against the whole
catalogue and against the rest of the batch.

A refusal comes back in the loom's own words. **Fix the design and run
`expand` again** — it is idempotent, so candidates that built are left
alone. You get two revisions; on the third failure the candidate is
culled and you move on. Do not argue with the audit: it is measuring
geometry, and a design it refuses is one a maker could not work.

## Step 4 — render

```bash
$CLI render --run "$RUN" --max-spend 1.50
```

This is where money is spent: a Fargate base render per candidate, then
the Fal creative-upscale finish and the fidelity gate. Minutes per
piece, so a batch of eight is roughly an hour.

`--max-spend` is a hard ceiling for this run, checked before each render
starts, on top of the daily caps in `spend-guard.ts`. Size it from the
`estimate` stage. A run that hits the ceiling stops cleanly with
candidates unrendered; you can raise it and run `render` again, or leave
them.

The stage writes a contact sheet per shelf into
`$RUN/contact-sheets/<shelf>.png`.

## Step 5 — judge

**Look at every contact sheet.** Read the PNG files — actually view
them, one shelf at a time. You are the vision gate now, and the rubric
below is the one the code used, verbatim from
`generation/vision-gate.ts`. Every box has to be a YES.

> **A. IT IS THE THING ASKED FOR.** The finished object reads as the item
> in the brief: a coaster reads as a coaster, a bear reads as a bear, a
> picture panel shows the picture described. If you could not name it
> without being told, kill it.
>
> **B. THE FABRIC IS REAL AND WHOLE.** Continuous crocheted stitches,
> even rows or rounds, no melted, smeared, torn or missing patch, no gap
> where the fabric should be solid, no stitch that dissolves into fuzz.
> A broken patch is a KILL, never a repair: the geometry is
> deterministic, so a re-roll cannot fix it.
>
> **C. THE COLOURS ARE THE PATTERN'S.** The yarn colours are the ones the
> brief asked for, clean and separated. On a striped or tapestry piece
> the colour boundaries are crisp and the picture reads.
>
> **D. IT IS STAGED AS A FINISHED OBJECT.** The whole piece sits on a
> clean pale ground at a sensible product-photo scale, not a macro crop
> of fabric and not cropped through the object.
>
> **E. NOTHING IN THE FRAME BUT THE PATTERN.** The photoreal finishing
> pass sometimes invents a hand holding the piece, a person, a table, a
> plant, a mug, a pair of scissors or a caption. KILL any hero showing
> hands, fingers, arms, a person or part of one, furniture, or any prop
> that is not the pattern's own notions (its safety eyes and nose are the
> pattern's; everything else is not). KILL any text, lettering, numbers,
> logo or watermark. This is a kill, never a repair.
>
> **F. ON A FIGURE, THE LIMBS ARE WHERE A REAL TOY'S ARE.** Arms join at
> the SHOULDERS, high on the body, and end above the feet. Legs come off
> the lower body and lie forward. Ears sit on the crown of the head.
> KILL any figure whose arms appear to come out from under its legs or
> from its middle, whose limbs are the wrong way round or the wrong
> length, or whose parts float free of the body or sink into each other
> so the join is lost. A toy whose arms grow out of its hips is not a toy
> anyone would make, and this is a kill, never a repair, because the
> placement is in the pattern rather than in the roll of the render.

Plus the general rubric's near-duplicate box: not a near-duplicate of
anything already kept this batch.

The bar is **"is it a gem I'd buy and hang"**, never "is it ok". A low
pass rate is expected and correct. When the doubt is about the WHOLE
piece — muddled, dull, badly composed, unclear what it is — do not pass
it. When the doubt is one small detail in an otherwise lovely object,
pass it; this is a crocheted thing seen from across a room, not a
photograph inspected at 400%.

Write `$RUN/verdicts.json`, keyed by slug:

```json
{
  "crochet-sage-ridge-cloth": {
    "verdict": "PASS",
    "reasons": ["true square, crisp stitch bands, sage reads clean"],
    "rubric": {
      "isTheThingAsked": true,
      "fabricRealAndWhole": true,
      "coloursAreThePatterns": true,
      "stagedAsAFinishedObject": true,
      "nothingElseInFrame": true,
      "limbsPlacedLikeARealToy": null,
      "notANearDuplicate": true
    }
  }
}
```

`limbsPlacedLikeARealToy` is `null` on anything that is not a figure.
A PASS needs every non-null box true — the schema refuses a PASS that
does not, and refuses a KILL that fails no box or gives no reason. Reasons
are short, under a dozen words each.

## Step 6 — publish

```bash
$CLI publish --run "$RUN" --verdicts "$RUN/verdicts.json"
```

Publishes the passes as PUBLIC rows into the crochet catalogue, which is
still hidden site-wide, so a published pattern fills its shelf without
reaching a customer. Every row still goes through the duplicate guard and
the completeness gate, and a row that fails either is culled rather than
published with a flag.

`--visibility private` publishes PRIVATE instead. Use it for a proof run
or anything you are not certain of; a PRIVATE row is not indexed and can
be cleaned up without a takedown.

A candidate with no verdict is skipped. Nothing is published unjudged.

The stage finishes the `BulkRun` row, so the admin bulk-generation page
shows the batch under Recent runs and the crochet card shows the last
routine run's summary.

---

## Close the batch

1. **Update `BUILD_PROGRESS.md`** § "Crochet bulk autopilot, on the
   server" if this batch changed what is true about the lane — the
   pass rate, a treatment that keeps failing, a shelf now full.
   Otherwise leave it alone; a log entry per fire is noise.
2. **Note anything that should change the cost model.** If the pass rate
   or the render wall clock is not what `crochet-cost.ts` assumes, say so
   in the hand-off with the observed number. Do not edit the constant on
   one batch's evidence.
3. **Commit and push** to a `claude/*` branch. Workers never merge to
   `main`; the orchestrator merges the daily train.

---

## Hand-off

Plain English. Cover:

- What landed: N published of M planned, which shelves, one line on the
  mix of treatments and difficulties.
- Which backlog entries the batch consumed, and any shelf whose queue ran
  dry and had to be invented for.
- What was killed and why, grouped — three coasters killed for pale
  colour is a pattern, three killed for three different reasons is not.
- What the run spent, from the `publish` output.
- Any design the loom refused twice, with its problem, because that is
  usually an envelope that wants widening rather than a bad design.
- Branch and commit. Anything you could not do.

---

## Reminders

- **Never an API call.** Planning, authoring and judging are yours,
  inside this session, on the Max plan. The code refuses to do them.
- The one agreed exception to the no-API rule elsewhere in the codebase
  is the maker-photo check on customer uploads. It has nothing to do
  with this lane; do not touch it.
- Do not turn the enabled marker on. Do not create or change a routine
  schedule. The autopilot gets a budget from Rebecca first.
- Do not add a treatment to `crochet-forms.ts` to make a brief fit. A
  shelf with no lane waits for the engine.
- Do not edit `crochet-idea-backlog.ts` from this session. Report a dry
  shelf; topping the queue up is its own job, with its own dedupe check.
- Do not publish PUBLIC anything you would not publish under your own
  name. The category being hidden is not a reason to lower the bar.
- If a pre-flight check is ambiguous, halt and exit rather than pushing
  through.
