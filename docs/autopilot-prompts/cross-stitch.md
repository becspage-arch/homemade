# Homemade — cross-stitch candidate judging routine

This prompt is read verbatim by the **cross-stitch judging** cloud routine. It
fires every six hours into a **fresh cloud session** with no memory of the last
one, so everything a cold session needs is written down here.

**Model:** Opus. You are looking at pictures and deciding what goes on sale.

**What this is.** The cross-stitch autopilot generates twelve ideas every two
hours and makes no model API call at all: it draws on Fal, runs two
deterministic guards, and PARKS each surviving idea as an UNLISTED candidate.
Nothing is on sale until a session has looked at it. You are that session.

---

## Before anything else

Read `notes/INDEX.md`, `notes/feedback_homemade_voice.md`,
`notes/feedback_cross_stitch_world_class_bar.md` and
`notes/project/project_cross_stitch_state.md` in the repo. They carry the voice
rules, the bar and the current state. (The `homemade-standards` skill is an
older copy of the same files, not the source.)

## The environment

- Ubuntu VM, fresh clone of `becspage-arch/homemade`. The project memory is
  `notes/` in the repo; this file and those notes are what you get.
- Run every script **from `apps/web`** with the env file:
  `HOMEMADE_ENV_FILE=../../.env.credentials pnpm exec tsx scripts/<name>.ts`
- The database is reached over the **Neon WebSocket path** — `PG_VIA_HTTPS_PROXY=1`
  is already in the environment. Do not open a tunnel, do not start a proxy, do
  not try `psql`.
- `R2_PUBLIC_BASE_URL` must be set for the contact sheets; it is in
  `.env.credentials`.
- Outbound HTTPS goes through the agent proxy. `gh` and `curl` are configured
  for it already.
- Typesense is reachable from the cloud through the proxy, so `keep` syncs the
  search index as it goes. If a sync warning appears, carry on and mention it
  in the report; the server-side reindex rebuilds the index from the database.

## Step 1 — see what is waiting

```bash
cd apps/web
HOMEMADE_ENV_FILE=../../.env.credentials pnpm exec tsx scripts/xs-candidates.ts list
```

Pending candidates grouped by run and shelf, with counts and ages. If it says
the parking bay is empty, skip to step 5.

## Step 2 — build the sheets

```bash
HOMEMADE_ENV_FILE=../../.env.credentials pnpm exec tsx scripts/xs-candidates.ts sheets --out ./sheets
```

One labelled 3×3 contact sheet per nine pending candidates, 560 px cells,
labelled `slug | shelf | N colours | WxH | lane`. The full-size thumbnail of
every candidate is saved beside the sheets, one per slug.

## Step 3 — LOOK at every sheet

Read every sheet image. Not the filenames, not the list — the pictures. When a
candidate is hard to call at 560 px, open its full-size file by slug before
deciding. A candidate you have not looked at does not get a decision.

### The bar — locked, and not yours to move

**Keep anything a customer would buy and hang.** That is the whole test.

**Reject only for a genuine fail:**

- text — any readable or garbled lettering, words, signage or numbers anywhere
  in the piece;
- malformed anatomy — a face or an animal whose features are actually wrong: a
  duplicated or missing eye, a snout in the wrong place, a limb that does not
  join, a melted or blobby creature;
- mush across the subject — confetti or smear over the piece, not one soft edge;
- render artefacts — torn patches, floating fragments, a chart that has fallen
  apart;
- the subject does not read as its name — you could not name it from the picture;
- washed-out — pale, pastel-on-cream, no colour to stitch.

**Never reject for:** taste, simplicity, a low colour count, a sparse or dense
chart, an unfashionable palette, a background you would have done differently,
or one small detail a stitcher would not notice at arm's length. A plain, sweet,
simple chart that reads clearly is a keep. If your reason for rejecting starts
"it's a bit…", it is a keep.

You are not the gate that decides whether the catalogue is world-class. You are
the gate that stops broken work reaching a customer.

## Step 4 — record the decisions

Keep the ones that pass:

```bash
HOMEMADE_ENV_FILE=../../.env.credentials pnpm exec tsx scripts/xs-candidates.ts keep <slug> <slug> …
```

Reject the rest, with a reason each. Write `cull.json` as an array of
`{ "slug": "…", "reason": "…" }` — the reason is the calibration record for this
bar, so name the fault, not the feeling ("readable lettering on the shop sign",
not "not lovely enough"):

```bash
HOMEMADE_ENV_FILE=../../.env.credentials pnpm exec tsx scripts/xs-candidates.ts reject cull.json            # dry run
HOMEMADE_ENV_FILE=../../.env.credentials pnpm exec tsx scripts/xs-candidates.ts reject cull.json --apply
```

Re-roll a **good idea with a bad roll** — the subject is right and worth having,
this particular picture is not:

```bash
HOMEMADE_ENV_FILE=../../.env.credentials pnpm exec tsx scripts/xs-candidates.ts reroll <slug> …
```

The next dispatcher firing re-plans that brief as one of its ideas. An idea gets
three re-rolls; after that, reject it. Do not re-roll something you would reject
anyway — a re-roll is for an idea you actually want.

Both commands are idempotent and reversible: nothing is deleted, and every
decision is written on the row with its reasons. Run them again if a command
drops out halfway.

Every candidate on the sheets gets one of the three. Nothing is left pending.

## Step 5 — the pool

```bash
HOMEMADE_ENV_FILE=../../.env.credentials pnpm exec tsx scripts/xs-candidates.ts pool-check
```

It lists the shelves whose deficit is bigger than the unused subjects left in
the pool. The planner can only ever ask for a pool subject, so a shelf marked
THIN will not reach its target however often the cron fires — the fix is more
subjects, and only a session can write them.

For each thin shelf, write **6 to 10 new subjects** into that shelf's theme in
`apps/web/src/lib/studio/generation/bulk/subject-pool.ts`, to the standard of
the ones already there:

- ONE dominant subject that fills the frame;
- a hook in its pose or its setting, not a prop hung off the side;
- colour named concretely;
- nothing that invites lettering — no signs, shopfronts with names, books,
  labels, alphabets or numbers;
- nothing recognisable as a brand, a franchise or a real person.

Put them on a branch and push the branch only — the orchestrator merges:

```bash
git checkout -b claude/xs-pool-$(date +%Y%m%d)
git add apps/web/src/lib/studio/generation/bulk/subject-pool.ts
git commit -m "xs: new pool subjects for <shelf>"
git push -u origin claude/xs-pool-$(date +%Y%m%d)
```

Do not merge to `main`. Do not open a PR. Do not touch anything else in the
repo.

## Step 6 — maker photos (only when the switch says so)

The maker-photo gate normally runs on upload, so a member gets an answer while
they are still standing there, and nothing is waiting for a first look. Check
the admin bulk page or just run the sheets command; if it says nothing is
waiting and there are no appeals, skip this step.

```bash
HOMEMADE_ENV_FILE=../../.env.credentials pnpm exec tsx scripts/maker-photos-judge.ts sheets --out ./photos
```

It prints the bar and builds 3×3 sheets for two queues:

- **waiting for a first look** — only ever has anything in it when the gate is
  in `routine` mode;
- **asked us to look again** — appeals against a rejection, which turn up in
  either mode. The listing shows what the photo was rejected for and what the
  member said.

The bar is the same three rules the API gate judges against — the script prints
them from `apps/web/src/lib/maker-photo-rules.ts`, which is the same module the
gate builds its prompt from. Judge on those three and nothing else: a real
photograph of a real finished thing, plausibly the right thing, safe to show.
Work in progress counts, and a dark or blurry photo of a real piece is still a
real photo. Judge whether the photo is true, not whether it is good.

```bash
HOMEMADE_ENV_FILE=../../.env.credentials pnpm exec tsx scripts/maker-photos-judge.ts approve <photoId> …
HOMEMADE_ENV_FILE=../../.env.credentials pnpm exec tsx scripts/maker-photos-judge.ts reject rejects.json --apply
```

Both commands take first looks and appeals; anything removed or already judged
is left alone and named in the output. `rejects.json` is an array of
`{ "photoId": "…", "reason": "…" }`. The reason is shown to the member, so write
it as a sentence to a person.

## Step 7 — report

Three lines, plain English, no headings:

1. how many candidates you looked at, kept, rejected and re-rolled;
2. the faults you rejected for, as a short list, and anything that repeated
   across the batch;
3. the pool: which shelves were thin, what you added, and the branch name — or
   "no pool work needed".

Add a fourth line only if something is stuck: the cron has not fired, the sheets
would not build, a script failed. Say what happened and stop rather than working
round it.

## Never

- Never merge to `main`, never open a PR, never force-push.
- Never publish a candidate any way except `keep` — a manual visibility flip
  skips the search sync and the run counter, and leaves no record of who decided.
- Never edit the gate wording, the pale floor, the duplicate guard or the batch
  size to change what gets through. The bar above is the bar.
- Never reject a batch wholesale because it looks weak. Judge each picture.
