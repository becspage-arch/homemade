# Illustration style test

This folder is a small, self-contained design experiment. The output is a
locked visual language for cooking tutorial illustrations — one style we use
across every tutorial in the cooking category so the site looks like one
coherent thing rather than a collage.

## What this test is for

Cooking is the launch category and the first 1,500 tutorials sit inside it.
Every tutorial needs a hero illustration, plus a handful of inline
illustrations (technique mid-action, supplies still life, ingredient
botanical, diagram, scene). Across the category the illustrations have to:

- Sit alongside Fraunces (display serif) and Lora (body serif) without
  fighting them.
- Use the brand palette (cream, sage, warm taupe, with earth accents) as
  the dominant tones.
- Hold consistency across hundreds of generations.
- Read at thumbnail size on a card as well as full-width on a hero.
- Read as drawn / illustrated, not as AI-generated photography.
- Feel slow-living and warm — the references are Alice Waters, Monty Don,
  Vita Sackville-West, vintage gardening books, mid-century domestic
  manuals. Not commercial food photography. Not Pinterest-modern flat
  vector.

The test runs the same six subjects through four candidate styles, so we can
compare like for like and pick a winner.

## How to run it

1. Open `subjects.md` and read the six test subjects. Each one is chosen to
   stretch a different visual capability (texture, action, labelling, mood).
2. Open `styles.md` and read the four candidate style prompts (A, B, C, D).
3. Pick your image generation tool. As of this brief no image-gen API key
   exists in `.env.credentials`, so the test runs manually — Rebecca uses
   whatever tool she has subscription access to (Midjourney via Discord,
   ChatGPT Plus image generation, etc.) or runs it locally on her hardware.
4. For each of the 24 cells (6 subjects × 4 styles), prompt the model with:
   `<style prompt prefix>, <subject description>`
5. Save each output as `output/<style-letter>/<subject-slug>.png`. The
   folder structure is laid out below.
6. Score each style against the rubric in `rubric.md`.
7. Write a one-paragraph decision note at the top of `rubric.md` and commit.

## Folder structure to populate

```
output/
├── style-a-botanical/
│   ├── 01-sourdough-loaf.png
│   ├── 02-folding-dough.png
│   ├── 03-preserving-supplies.png
│   ├── 04-rosemary-sprig.png
│   ├── 05-fermentation-diagram.png
│   └── 06-morning-kitchen.png
├── style-b-pencil-wash/
│   ├── (same six subjects)
├── style-c-flat/
│   ├── (same six subjects)
└── style-d-etching/
    ├── (same six subjects)
```

## Evaluation rubric

See `rubric.md`. Score each style 1–5 on five criteria. A clear winner
should land 4 or 5 on every row.

## On hiring an illustrator

We are not commissioning a human illustrator regardless of how this test
goes. The constraint is fixed (see `feedback_no_hiring_yet.md` in memory).
If none of the four styles is strong enough at the end of this round, the
fix is to iterate the prompt or run a second round with refined styles, not
to bring someone in.

## Status: images generated

The 24-image grid is in `output/` (6 subjects × 4 styles, all PNG, 16:9).
Generated via fal.ai (Flux 1.1 Pro Ultra) using
`scripts/generate-style-test.mjs`. See `generation-log.md` for prompts,
elapsed time, and seed per cell.

Rebecca's job now: open the grid, score against `rubric.md`, write the
decision paragraph. The grid is the input; the rubric is where the
decision lives.

## Re-running or extending the test

If we want to re-test (different prompt prefixes, different subjects, a
second pass on the winner with refined prompts), the script is reusable.
It reads `FAL_KEY` from
`C:\Users\Rebecca\Projects\code\homemade\.env.credentials`, takes no
arguments, and overwrites whatever is in `output/`.

```
cd C:\Users\Rebecca\Projects\code\homemade
node docs/illustration-style-test/generate.mjs
```

To run a different style or subject set, edit the `STYLES` and `SUBJECTS`
arrays at the top of `generate.mjs` — they are the source of truth, not the
markdown files. Keep `styles.md` and `subjects.md` in sync if the change is
permanent.

## Once the winning style is locked

The winning prefix becomes the canonical Homemade illustration prompt for
cooking. It lives at the top of `docs/tutorial-author.md` so the bulk
authoring worker always uses the same opening prefix when generating hero
and inline illustrations. The reference grid (24 images) gets kept in this
folder as the proof of the choice and as input for future style-prompt
fine-tuning.
