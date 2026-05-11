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

(Body-authoring prompt template lands here when the pilot batch is
prepared.)

## Upload mechanics

The tutorial body, metadata, and hero image upload to the admin via the
`packages/db/scripts/` programmatic tooling (planned, not built yet). For
now, anchor tutorials get uploaded by hand via `/admin/tutorials/new` —
once the pipeline is built, that step is automated.
