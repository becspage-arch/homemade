# img2img Codebase Audit - 2026-06-09

Read-only audit. Nothing was deleted or modified.

## Search terms used

- `img2img` (any case)
- `flux-dev-img2img`
- `denoise` in .ts/.tsx/.js files
- `retrofit` / `upgrade hero` / `swap mockup` in comments
- `@fal-ai/client` usage
- `fal.ai` references
- `fal.subscribe`, `fal.run` calls

## Findings

### img2img / flux-dev-img2img

No code calls `flux-dev-img2img` or any img2img endpoint. The term appears only in:

- `packages/db/prisma/schema.prisma` (3 comment lines): historical comments describing a planned Pipeline B (Stitching Mama mockup upgrade pass) and the `SYNTHETIC_FALLBACK` enum value. These are documentation only.
- `apps/web/src/lib/image-sourcing/flux-schnell.ts` (line 150): a comment noting Fal suggested feeding SVG as image input -- this is a comment, not live code.

### denoise

No files contain `denoise`.

### retrofit / upgrade hero / swap mockup

The word `retrofit` appears in several scripts but always in the context of `voice-retrofit` (tutorial voice pass) or describing a planned image upgrade that was never implemented. No active image-retrofit code exists.

### @fal-ai/client

Not installed. The package.json files across apps/web and packages/db do not reference `@fal-ai/client`.

### Active Fal calls

All Fal HTTP calls go to:

`https://fal.run/fal-ai/flux/schnell`

This is a text-to-image endpoint. It accepts a text `prompt` and returns generated image URLs. No image is sent as input; there is no img2img or inpainting involved.

Files with active Fal calls:

- `apps/web/src/lib/image-sourcing/flux-schnell.ts` -- the sole production Fal integration. Uses `fetch(API, { body: JSON.stringify({ prompt, ... }) })`. Confirmed text-to-image only.
- `packages/db/scripts/seed-crochet-pattern-photos.ts` -- imports from `flux-schnell.ts`. Generates hero images from text prompts.
- `packages/db/scripts/fixup-hero-fill.ts` -- imports from `flux-schnell.ts`. Generates heroes for tutorials that need them.
- `packages/db/scripts/check-fal-balance.ts` -- test script, fires one small generation to check billing status.

### Verdict

No img2img, inpainting, or image-to-image calls exist anywhere in the codebase. Every Fal call is prompt-only text-to-image (flux/schnell). Safe.
