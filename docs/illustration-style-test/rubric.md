# Evaluation rubric

Score each style 1–5 on each row below. A clear winner lands 4 or 5 across
all five criteria. A style with one row below 3 is disqualified — that
weakness will show up at scale.

Fill in the scores after generating all 24 images. Write the decision
paragraph at the top once scoring is done and commit.

## Decision (locked 2026-05-11)

**Winning style:** Style A — Modern botanical.

**Tier:** Flux 1.1 Pro Ultra ($0.06/image ≈ £0.048).

**Why:** Style A is the cleanest brand fit. The reference is exactly the
"vintage gardening manual" register the brand direction names. Holds
consistency across the six test subjects better than the other three.
Style B (pencil + wash) was the runner-up — warmer but more variance risk
across bulk generation. Style C (flat) reads commercial. Style D (etching)
reads cold and pastiche. Pro Ultra over Pro standard because Pro standard
drifted toward photo-realistic on the sourdough loaf test — Ultra holds
the illustrated quality reliably. Schnell only good enough for simple
ingredient illustrations, not for hero images.

**Budget at 3,000 tutorials (1 hero + ~1 inline average):** ~£345
including a 20% regeneration buffer.

**Negative prompts to add** (from observations during the test): "no text,
no letters, no writing, no labels on the food itself" — Flux hallucinates
text on bread crusts, jar labels, and packaging.

**Diagram subjects:** generate without labels in the prompt, typeset
labels over the image in admin. Flux misspells label text.

---

## Scoring grid

| Criterion | Style A (Botanical) | Style B (Pencil + wash) | Style C (Flat) | Style D (Etching) |
|---|---|---|---|---|
| Brand fit | | | | |
| Consistency potential | | | | |
| Throughput viability | | | | |
| Defensibility | | | | |
| Quality at thumbnail | | | | |
| **Total** | | | | |

## What each row asks

### Brand fit (1–5)

Does this style sit beside Fraunces (display serif), Lora (body serif), and
the sage / cream / warm taupe palette without fighting them? Does it match
the slow-living, restrained, Alice Waters / Monty Don voice the brand
direction calls for? Does it read as Homemade specifically, rather than as
generic editorial?

- **5 — instant fit.** Looks like the site already does, before the test.
- **3 — adjacent.** Could work after prompt-tuning.
- **1 — wrong register.** Looks like another brand, or like commercial
  food photography, or like Pinterest-modern flat.

### Consistency potential (1–5)

Across the six test subjects, does the style hold together as one visual
language? A loaf and a diagram should clearly come from the same hand.

- **5 — every cell looks like a sibling.** Same hand, same paper, same
  light.
- **3 — most cells hold, one or two drift.** Tunable.
- **1 — every cell looks like a different artist.** No path to fix.

### Throughput viability (1–5)

If we generate this style 1,500 times, will the output stay coherent? Are
there cells where the model clearly struggled (hands, labels,
cross-sections)? Will batch generation drift?

- **5 — every cell is usable straight from the model.** No retouching
  needed.
- **3 — most cells usable, a quarter need regenerating.** Manageable.
- **1 — most cells need manual rescue.** Doesn't scale.

### Defensibility (1–5)

Does the style read as distinctly drawn, illustrated, made? Or could it be
mistaken for AI-generated photography? The brand's edge depends on looking
like a real person made the picture. Photographic AI output is the brand's
worst-case visual.

- **5 — unmistakably illustrated.** No one would call this AI-photo.
- **3 — clearly illustrated but some cells slip into rendered-photo
  territory.**
- **1 — most cells look like AI photographs in disguise.**

### Quality at thumbnail (1–5)

Does the illustration read at the size of a tutorial card (around 300px
wide) in a list view, alongside other thumbnails? Detail that only works at
hero size is a problem because every illustration becomes a thumbnail.

- **5 — reads instantly at thumbnail.** Hero size is a bonus.
- **3 — reads at thumbnail with a moment's attention.** Works but isn't
  doing extra work.
- **1 — needs hero size to make sense.** Disqualifying for lists, indexes,
  search results.

---

## Free-form notes

Use the space below to capture observations that don't fit a score. Things
like:

- Which subjects worked best in each style.
- Which subjects fought every style (probably means the subject needs
  rewriting, not the style).
- Specific tweaks to the winning style's prompt prefix that would tighten
  it for the bulk-authoring run.
- Whether the model needs a negative prompt addition (e.g. `--no photograph`)
  to hold the illustrated register.
- Any cells where the model produced something unexpected and good — worth
  recording the seed if your tool exposes it.

```
[notes here]
```

## After picking a winner

1. Copy the winning style prefix into the top of `docs/tutorial-author.md`
   under a heading `## Locked illustration prompt prefix`.
2. Note any prompt tweaks made during scoring (so the bulk-authoring
   prompt has the most refined version, not the original).
3. Commit `docs/illustration-style-test/` with the scored rubric and the
   24 image files so the choice is documented.
4. The next time we open a worker session to draft tutorials in batch, the
   illustration prompt is fixed input. No further style debate per tutorial.
