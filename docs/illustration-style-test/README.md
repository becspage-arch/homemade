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

## On no API key being available right now

`.env.credentials` does not contain `FAL_KEY`, `REPLICATE_API_TOKEN`,
`OPENAI_API_KEY`, or `STABILITY_API_KEY` at the time this brief was
written. So the 24-image grid cannot be generated automatically as part of
this docs session. Rebecca runs the generations manually in whatever tool
she already has access to and drops the PNGs into the `output/` folders.

If a key gets added later, a follow-up worker session can read the prompts
from `styles.md` and the subjects from `subjects.md`, run them through the
provider's API, and fill the folders directly. The brief is structured so
that step is mechanical — same prompt strings, same file names.

## Once the winning style is locked

The winning prefix becomes the canonical Homemade illustration prompt for
cooking. It lives at the top of `docs/tutorial-author.md` so the bulk
authoring worker always uses the same opening prefix when generating hero
and inline illustrations. The reference grid (24 images) gets kept in this
folder as the proof of the choice and as input for future style-prompt
fine-tuning.
