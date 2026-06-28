# Pattern → Photoreal Hero — The Canonical Process

**This is THE process. Every render session follows it exactly. Do not improvise, do not
invent a different process, do not "work out" a pattern from a PDF. If you are unclear on a
step, STOP and ask — do not guess.**

This document exists because the steps kept being re-derived per session, lost, and
improvised, which produced unfaithful renders (e.g. a fixture that inferred stitches from
geometry and turned every flower into French knots). The fix is one written process.

---

## The principle

A render session **NEVER reads a designer's PDF or works anything out.** It ONLY ever
consumes a pattern that is **already in our format**, and it ALWAYS does the same two steps:
**validate, then render.**

The messy, per-pattern work of getting a pattern *out of* whatever the designer's source
looks like and *into* our format is a **separate step (Phase A) that happens first** — never
the render session's job.

---

## Our format — the input contract (identical for every pattern)

A pattern is a list of **elements**. Each element carries:

- **geometry** — the exact shape/path the stitcher works over (in mm).
- **stitch** — the exact stitch type, a slug from our stitch dictionary
  (e.g. `embroidery-long-and-short`, `embroidery-french-knot`).
- **colour** — the exact DMC floss code / hex.

…plus pattern metadata (fabric, finished size, frame, etc.).

This canonical structured data is the **only** thing the render touches. (It is the same
`stitchedElements`-shaped contract the engine + document builder consume — keep it as the
single source of truth so the hero and the pattern document cannot diverge.)

---

## Phase A — Get the pattern INTO our format

**VARIES per pattern. Done BEFORE the render session. Never the render session's job.**

The sources vary by pattern. For the DMC *Countryside* pattern they are:

- **page 2** (the line drawing) = **geometry**
- **page 4** (the stitch guide) = **which stitch**
- **page 3** (the colour key) = **the DMC colours**
- **page 1** (placement) = **which stitch + colour goes on which element**

Another pattern will hold these elsewhere or in a different form — find them.

**Rules (non-negotiable):**
- Read **every** element. Never summarise, never guess.
- **Never infer a stitch from a shape** — read it from the stitch guide. (Inferring stitches
  from geometry is the exact failure that turned Countryside into a "knot meadow".)
- **Extract vector geometry** from the line drawing — never rasterise-and-trace the picture
  (that approach failed for hours).

**Output:** the pattern in our format.

> Later, independent-designer onboarding automates Phase A — a process that reads any
> designer's PDF and extracts geometry/stitch/colour into our format. For now it is a
> deliberate, careful prep step done up front. It is never folded into the render session.

---

## Phase B — Validate, then Render

**ALWAYS IDENTICAL, every pattern. This is the render engine.**

**Step 3 — VALIDATE.** Overlay the our-format pattern's line-art back on the original line
drawing. It must match **exactly**. If it doesn't, the our-format data is wrong — fix Phase A.
**Never render an unverified pattern.**

**Step 4 — RENDER.** The exact stitches → deterministic geometry → Blender path-trace →
locked Fal creative-upscale → fidelity gate → photoreal hero. The full pattern document
(colour guide, floss key, stitch key, steps) comes from the **same** dataset.

---

## The output (always the same)

A photoreal hero faithful to the exact pattern **+** the full pattern document — both derived
from the one our-format dataset, so they can't diverge.

---

## Per-craft adaptation (the principle + two phases are identical; only two things change)

The process above is written around embroidery. For any other craft, only two things change:
**(1)** what "our format" is, and **(2)** what the Step-3 "show me it's right" artifact is. Phases
A and B, and the rule "never render until it's validated", are identical.

### Crochet (and knitting — same shape)
- **No "line drawing to trace."** A crochet/knit pattern is a **stitch program** — rows/rounds of
  stitch instructions. That program *is* the geometry.
- **Our format** = a structured stitch program: rows/rounds, each a sequence of stitch operations
  (stitch-dictionary slug + count + placement / shaping / repeats), colour changes, gauge, finished
  dimensions, yarn + hook/needle. (The `ChartDefinition` / structured-stitch-program shape.)
- **Phase A** = read the written pattern (e.g. a Word doc) — EVERY row, EVERY stitch, **no
  summarising** (expand "repeat to end" to the actual count) — into the structured stitch program.
  Sources vary by pattern: written rows = the program; the stitch key = stitch types; the yarn
  section = colours; gauge + finished size = dimensions.
- **Step 3 — SHOW THE STITCHES (validate):** produce the stitch **SYMBOL CHART** (+ the written
  program) from the our-format data and SHOW it for sign-off. The stitches must be **visible and
  confirmed faithful BEFORE any photo.** (Embroidery's validation artifact is the line-art overlay;
  crochet's is the symbol chart. Same gate: see the stitches, confirm, *then* render.) **Never
  render the photoreal hero before the stitches are signed off** — jumping to the photo while the
  stitches can't be seen is the exact failure this prevents.
- **Step 4 — RENDER:** the photoreal yarn hero, only after sign-off.

The same pattern holds for every future craft: name "our format" and the "show the stitches"
artifact; keep Phases A and B identical.

## What this means in practice

- Two jobs, never mixed: **(A)** produce the pattern in our format (per-pattern, careful,
  every stitch), then **(B)** validate + render (identical every time).
- A render session is handed clean our-format data and does **nothing but validate and
  render**. If it finds itself reading a PDF or guessing a stitch, it has gone off-process —
  STOP.
- Licensed designer patterns used as fixtures are **internal only** — never shipped, sold,
  published, or redistributed.
