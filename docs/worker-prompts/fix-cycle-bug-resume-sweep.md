# Homemade — Fix apply-media-verdicts cycle bug + resume sweep

**Model:** Sonnet
**Session title:** `Homemade - Fix apply-media-verdicts cycle bug + resume sweep`

## Context

The retroactive image-verification sweep landed three batches yesterday (commits `a8af46d`, `caf99d7`, `bd1f253`, summary in `18ecb22`) and stalled with a cycle bug. Numbers at stop:

- 61 hero `Media` rows stamped `VERIFIED`
- 89 `REJECTED` + re-sourced
- ~476 `UNVERIFIED` still in queue
- Admin coverage on PUBLISHED tutorials: ~11–12%

### The bug

`packages/db/scripts/apply-media-verdicts.ts` line 241:

```ts
const excludeSources: ImageSource[] = media.source ? [media.source as ImageSource] : []
```

`excludeSources` only contains the **single most-recent** rejected source. Each run creates a new `Media` row whose source is whatever the next free-tier slot was. The next sweep round only knows about that latest rejection. So:

1. Run 1: tutorial X has hero from `pexels` → rejected → re-source picks `unsplash` (new Media, UNVERIFIED).
2. Run 2: `unsplash` Media rejected → re-source excludes `unsplash` only → orchestrator returns `pexels` again (because `pexels` is no longer excluded).
3. By run 3, 17 of 32 re-source attempts produced byte-identical images that run 1 had already rejected. No forward progress.

The orchestrator (`apps/web/src/lib/image-sourcing/orchestrator.ts`) already honours `excludeSources` correctly — the bug is purely the `apply-media-verdicts.ts` script not accumulating history across runs.

## Scope — in

### 1. Schema: track exclude history on the Tutorial row

Add to `packages/db/prisma/schema.prisma`:

```prisma
model Tutorial {
  // … existing fields …
  excludedImageSources String[] @default([])
}
```

`String[]` (Postgres native array) holding `ImageSource` slugs that the verification sweep has already rejected for this tutorial (`pexels`, `unsplash`, `wikimedia`, `pixabay`, `flux-schnell`).

Run `pnpm --filter @homemade/db exec prisma migrate dev --name tutorial-excluded-image-sources --create-only`, then `prisma migrate deploy` in CI. Standard additive migration — no backfill needed because `[]` default covers existing rows.

Regenerate Prisma client and commit the generated changes.

### 2. Fix `apply-media-verdicts.ts`

Replace the exclude-sources logic so it:

1. **Reads** `tutorial.excludedImageSources` at the start of regen for each rejected verdict.
2. **Combines** that with the current `media.source` to form the full exclude set.
3. **Caps at 3 distinct rejections**: if the combined exclude set already contains 3+ distinct real-photo sources (anything that isn't `flux-schnell`), skip the free-tier cascade entirely. Easiest implementation: explicitly add the remaining real-photo sources to `excludeSources` so `sourceHeroImage` goes straight to Flux.
4. **Persists** the rejected source back to `tutorial.excludedImageSources` (use Postgres array append — Prisma exposes this via `{ push: '...' }` on a String[] field) **before** calling `sourceHeroImage`. This way even if the script crashes mid-run, the rejection is recorded.

Sketch:

```ts
const REAL_PHOTO_SOURCES = ['unsplash', 'pexels', 'wikimedia', 'pixabay'] as const

// inside the rejected branch, after stamping Media REJECTED:
const priorExcluded = tutorial.excludedImageSources ?? []
const thisRejected = (media.source as ImageSource | null) ?? null
const accumulated = new Set<ImageSource>([
  ...priorExcluded as ImageSource[],
  ...(thisRejected ? [thisRejected] : []),
])

if (thisRejected && !priorExcluded.includes(thisRejected)) {
  await prisma.tutorial.update({
    where: { id: tutorial.id },
    data: { excludedImageSources: { push: thisRejected } },
  })
}

// After 3 distinct real-photo rejections, force Flux:
const realPhotoRejected = REAL_PHOTO_SOURCES.filter((s) => accumulated.has(s))
const excludeForCall: ImageSource[] =
  realPhotoRejected.length >= 3
    ? Array.from(new Set<ImageSource>([...accumulated, ...REAL_PHOTO_SOURCES]))
    : Array.from(accumulated)

const result = await sourceHeroImage(
  { title: tutorial.title, category: tutorial.category.slug, subCategory: tutorial.subCategory?.slug ?? null, ingredients },
  { excludeSources: excludeForCall },
)
```

Also extend the `tutorialsHero` selection in the Media lookup to include the new `excludedImageSources` field on the tutorial — the script currently doesn't fetch it.

Update `ApplySummary` to track a new counter `rejectedForcedToFlux` and surface it in the final log + the JSON report. This is how we'll know how many tutorials hit the cap.

### 3. Resume the sweep via /loop

Once the schema migration + script fix are deployed and green, run the verification sweep loop until the UNVERIFIED hero queue is drained or naturally terminates on QUALITY_DRIFT.

Pattern (already proven, three clean batches landed yesterday):

1. `pnpm --filter @homemade/db exec tsx scripts/verify-media-batch.ts --limit 32` to enqueue a batch.
2. For each entry in the manifest, use the `Read` tool to view the image inline and decide verified / rejected with a short reason. Write verdicts to `docs/image-verification-verdicts.json`.
3. `pnpm --filter @homemade/db exec tsx scripts/apply-media-verdicts.ts` to commit.
4. Commit the docs/ JSON files + any incidental progress notes. Push.
5. `gh run watch` after each push, fix failures, smoke-test `/healthz` returns 200.
6. Loop until either: (a) UNVERIFIED hero queue is empty, (b) you hit QUALITY_DRIFT (>50% rejection rate in a batch), or (c) you hit 20 consecutive batches.

Keep batches at 32 hero rows each — that's the cadence that worked yesterday.

### 4. Verdict rubric (unchanged from yesterday)

Same bar as the previous sweep. Reject if any of:

- Wrong dish / wrong cuisine register
- Stock-photo dish that's recognisably a different recipe than the tutorial
- AI-obvious artefacts (hands with 6 fingers, melting forks, etc.) on a Flux fallback
- Clear watermark / brand text
- Composition is unusable as a hero (cropped, sideways, etc.)

Verified if it's the right dish, right cuisine register, hero-worthy composition. Don't reject for "could be better" — only for "wrong" or "unusable". Treat the 80/20 rule: a passable real photo beats forcing Flux.

For finished craft / sewing / knitting items (when they appear), apply the stricter rubric per the brand decision: must match construction, silhouette, era, and fabric register — not just category. If a real photo is misleading, reject and let it fall through to the procedural card (better off-brand than wrong).

### 5. Sweep report

After the loop ends, write `docs/image-verification-sweep-2026-05-17-cycle-fix.md` with:

- Number of batches landed
- Stamped VERIFIED / REJECTED / REJECTED_USED_PROCEDURAL totals
- How many tutorials hit the 3-rejection cap and got forced to Flux
- Coverage % at end
- Anything noteworthy (categories with high rejection rates, sources that consistently miss, etc.)
- BUILD_PROGRESS update entry

## Scope — out

- **Don't** touch the queue cron or any of the autopilot SKILL.md files. Those are running fine.
- **Don't** touch the verification rubric in the authoring pipeline (`docs/tutorial-author.md` etc.) — it's already wired for new tutorials.
- **Don't** redesign the verdict-file shape or the `verify-media-batch.ts` manifest format — they work.
- **Don't** add new image sources to the orchestrator. Cascade is locked.
- **Don't** start any other workstream (admin widening is already done, craft pipelines are in flight separately).

## Deploy verification (mandatory)

After every push:

1. `gh run watch` and confirm CI passes (build, typecheck, prisma migrate deploy).
2. If a hook or workflow fails, **fix the underlying issue and create a new commit** — don't `--no-verify`, don't `--amend`.
3. `curl -fsS https://homemade.education/healthz` returns 200.
4. Only then report the batch as landed and move to the next loop iteration.

If a deploy fails twice in a row on the same root cause, halt the loop and write the failure into the sweep report + flag it in the hand-off summary.

## Hand-off style

Report back as a short plain-English summary in the session: what landed (counts, commits), what's still unverified (count + likely cause if you spotted a pattern), and any new questions. No memo, no "honestly", no jargon dump. The orchestrator will read the summary and decide what comes next.
