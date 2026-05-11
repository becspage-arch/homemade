# Candidate styles

Four candidate styles, each phrased as a prefix you prepend to the subject
description when prompting. The order is A–D; we test all four through the
full subject set before scoring.

The palette references are the same across all four styles, because the
palette is locked: cream (`#F5F0E8`), sage (`#6B7558`), soft sage
(`#8C9778`), forest (`#3D4A2E`), warm taupe (`#A89B85`), walnut
(`#5F4A36`), honey (`#C9A876`), terracotta (`#B85C3A`), dusty blush
(`#D4A89A`). What varies is the visual treatment.

The prompt template for every cell of the test is:

```
<style prefix below>, <subject description from subjects.md>
```

---

## Style A — Modern botanical illustration

**Reference:** vintage gardening books (early 20th-century RHS plates,
Marianne North), Vita Sackville-West's garden books, contemporary
botanical artists who maintain pre-Raphaelite precision.

**Prompt prefix:**

```
Modern botanical illustration in the style of vintage gardening
manuals, clean ink linework with delicate watercolour fills, warm
muted palette of sage green, linen cream, soft terracotta, and walnut
brown, generous white margins on a soft cream background, restrained
detail, hand-drawn quality, no photographic realism, no commercial
slickness, calm composition, soft natural light implied
```

**Worked example for subject 04 (rosemary sprig):**

```
Modern botanical illustration in the style of vintage gardening
manuals, clean ink linework with delicate watercolour fills, warm
muted palette of sage green, linen cream, soft terracotta, and walnut
brown, generous white margins on a soft cream background, restrained
detail, hand-drawn quality, no photographic realism, no commercial
slickness, calm composition, soft natural light implied, a single
sprig of rosemary, leaves and stem detailed, against a plain warm
cream background, slight shadow underneath
```

**Why this could win:** strongest brand fit on paper. The reference is
exactly the visual language the master plan calls for.

**Where it could fall down:** botanical style is forgiving for plants and
ingredients (subject 04) but might struggle for action scenes (subject 02)
and may look fussy in a diagram (subject 05).

---

## Style B — Editorial pencil and wash

**Reference:** 1950s domestic manuals, Mary Cassatt's domestic scenes if
they were illustrated rather than painted, Elizabeth David first editions
where Juliet Renny illustrated, Edward Bawden, Eric Ravilious.

**Prompt prefix:**

```
Editorial illustration in soft pencil outline with light watercolour
wash, palette of sage green, linen cream, warm taupe, honey, and a
single accent of terracotta or dusty blush, hand-lettered details
where labels appear, the quality of a mid-twentieth-century domestic
manual brought up to date, restrained and unhurried composition,
visible paper texture, no photographic realism, no flat vector
```

**Worked example for subject 02 (hands folding dough):**

```
Editorial illustration in soft pencil outline with light watercolour
wash, palette of sage green, linen cream, warm taupe, honey, and a
single accent of terracotta or dusty blush, hand-lettered details
where labels appear, the quality of a mid-twentieth-century domestic
manual brought up to date, restrained and unhurried composition,
visible paper texture, no photographic realism, no flat vector, a
pair of hands folding bread dough on a wooden board, dough
mid-stretch, flour dusted across the surface, sleeves rolled to the
forearms, side-on view, the action caught mid-motion
```

**Why this could win:** the warmest of the four, the most human, the
most likely to hold action subjects well. The Bawden / Ravilious lineage
is precisely the slow-living-not-twee register Homemade wants.

**Where it could fall down:** pencil and wash is hard to keep consistent
across hundreds of generations. The hand-drawn quality may drift more
than the other styles.

---

## Style C — Flat illustration

**Reference:** contemporary editorial illustration (NYT cooking section
illustrations, Cup of Jo, Yotam Ottolenghi's UK cookbook illustrations).
Bold shapes, limited palette, matte texture.

**Prompt prefix:**

```
Flat editorial illustration with bold simplified shapes, limited
palette of sage green, linen cream, warm taupe, and a single warm
accent of terracotta, no outlines or very fine outlines, matte paper
texture, contemporary feel without being corporate, no gradients, no
photographic detail, no shiny vector look, calm and warm composition
```

**Worked example for subject 01 (sourdough loaf):**

```
Flat editorial illustration with bold simplified shapes, limited
palette of sage green, linen cream, warm taupe, and a single warm
accent of terracotta, no outlines or very fine outlines, matte paper
texture, contemporary feel without being corporate, no gradients, no
photographic detail, no shiny vector look, calm and warm composition,
a round country-style sourdough loaf, golden-brown crust scored with
a wheat pattern across the top, sitting on a wire cooling rack, a
linen tea towel underneath, soft window light from the left
```

**Why this could win:** the most defensible against AI-photo drift. Flat
shapes don't try to pretend to be photographs, so the "looks AI" risk
shrinks. Reads cleanly at thumbnail size.

**Where it could fall down:** flat illustration is the most overused
style in food editorial right now. It may not feel distinct enough to
hold Homemade's positioning. Texture and warmth are hardest to land here.

---

## Style D — Etching / engraving

**Reference:** old herbals (Gerard's Herball, Culpeper), 19th-century
technical manuals, the line drawings in Pre-Raphaelite-era cookery books.
Fine hatching, monochrome with one accent colour.

**Prompt prefix:**

```
Fine etching and engraving style illustration with detailed cross-
hatching, monochrome warm walnut brown ink on cream paper, with a
single accent of sage green, the quality of a 19th-century botanical
herbal or technical manual, restrained classical composition, no
shading via gradient — shading via hatching only, no photographic
realism, no flat vector look
```

**Worked example for subject 05 (fermentation diagram):**

```
Fine etching and engraving style illustration with detailed cross-
hatching, monochrome warm walnut brown ink on cream paper, with a
single accent of sage green, the quality of a 19th-century botanical
herbal or technical manual, restrained classical composition, no
shading via gradient — shading via hatching only, no photographic
realism, no flat vector look, a labelled cross-section diagram of a
jar of fermenting sauerkraut at three different stages of
fermentation, shown as three jars side by side, each jar showing the
cabbage, the brine line, and the bubble activity, labels in a serif
typeface point to the brine line, the bubble layer, and the weighted
plate
```

**Why this could win:** strongest defensibility — no one else in food
editorial uses this. Holds diagrams beautifully. Reads as old, slow,
considered.

**Where it could fall down:** may feel too cold or too archaic. Risk of
looking like a pastiche rather than a contemporary voice. Hardest of the
four for action subjects (folding dough).

---

## Notes on running the prompts

- Use the same seed across all four styles for a given subject if your
  tool exposes seeds (Midjourney does not by default; Flux and SDXL do).
- Generate at least two outputs per cell and keep the better one. If both
  are weak, regenerate before scoring.
- Aspect ratio: hero illustrations land at 16:9. Run the test at 16:9 for
  every cell so the comparison is fair.
- If the tool offers a "no text" or "no watermark" instruction, add it.
- If the tool keeps producing photographic results despite the prompt, add
  `--no photograph`, `--no photo`, `--no realistic` to the negative.

The point of testing the same six subjects through all four styles is to
make the comparison apples-to-apples. Don't tune the subject prompt per
style — the style prefix is what changes, the subject stays the same.
