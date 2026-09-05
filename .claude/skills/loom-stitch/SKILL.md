---
name: loom-stitch
description: Build or verify ONE stitch in the loom yarn-level stitch engine (crochet/knit/macrame). Use for any work on stitch construction, stitch audits, or stitch renders in apps/web/src/lib/loom. Enforces the two hard rules — genuinely stitched (never drawn) and never done until compared against a real reference photo with Rebecca's sign-off.
---

# Loom stitch work — the enforced process

You are working on the loom stitch engine: a deterministic renderer that builds
crochet/knit fabric as ONE continuous strand of yarn, genuinely stitched (loop
through loop, held by self-collision in relaxation), then rendered photoreal.

**Read first, in this order (non-negotiable):**
1. `apps/web/src/lib/loom/crochet/STITCH_ENGINE.md` — the handbook: method, per-stitch state, failure log.
2. This file, fully.
3. If rendering a whole pattern (not a stitch): `apps/web/src/lib/loom/RENDER_PROCESS.md`.

## The two rules that have sunk every careless session

**RULE 1 — The form must EMERGE from genuinely stitched yarn.**
Every stitch is real topology: the strand hooks under the loop below / rings the
stem / passes through the opening — initialised genuinely interlinked, then the
LOOK comes from relaxation (yarn length, bending, self-collision, the table).

Banned, always (§9 of the handbook has the full failure log):
- Pinning worked nodes (`w: 0`) so the relaxer can't move them. Only the
  foundation chain / slip-knot anchor may be pinned.
- Distance/bend constraints between non-neighbouring strand nodes (spring joins).
- Nudging positions/shapes "so it looks right". If the settled result looks
  wrong, the CONSTRUCTION is wrong — fix topology, yarn feed (loop perimeter
  budget!), layering, or slack. Never the symptom.
- Judging structure from renders. Renders lie. Dump settled positions
  (`scripts/loom-ch-debug.ts` is the pattern) and check numbers.

**RULE 2 — A stitch is not done until it has been LOOKED at against reality, and
Rebecca has said so.**
In one turn: download a real swatch photo of the stitch (WebSearch → image URL →
`curl --ssl-no-revoke` into `.loom-scratch/crochet/`), `Read` the photo AND our
render together, compare plainly (name what matches, what doesn't), then post
BOTH as clickable markdown links to Rebecca — she cannot see Read-tool images;
links are how she verifies. Then STOP for her verdict. "Looks good to me" from a
model is worth nothing; only her sign-off flips a stitch to locked.

## The loop for one stitch

1. **Reference first.** Real swatch photo found and downloaded BEFORE building.
   Store its URL in the stitch's `SWATCH_RECIPES` entry (dictionary.ts).
2. **Construct** in `engine/yarnPath.ts` — the stitch is "what the one strand
   does next". Add its `STITCHES` + `SWATCH_RECIPES` entries (dictionary.ts is
   the single source of truth: gauge, rows, view, auditW, reference, status).
   Record every interlock as a `StitchLink` (hook/ring/cross) — the audit
   verifies these; a build with no links auto-fails.
3. **Pipeline:** `cd apps/web && npx tsx scripts/loom-stitch.ts <stitch>`.
   It builds → runs the numeric audit (hard gate) → renders (Blender, minutes,
   ONE at a time, never in parallel) → hero + fidelity gate → prints the report
   block. If the audit fails, fix the construction and rerun — do not bypass.
4. **Compare + report** (Rule 2). Include: both links, the reference link, what
   matches, what differs, your customer verdict. STOP for Rebecca.
5. On her sign-off: set `status: 'locked'` + `lockedOn` in SWATCH_RECIPES,
   update the handbook state table, add any new lesson to the failure log,
   commit. New lessons belong in STITCH_ENGINE.md, not in your head.

## Judgment guardrails (learned the hard way — audit 2026-07-02/03)

- **Density is identity.** sc/hdc pack dense (notches, not holes); dc's posts
  lean together (slits); treble opens into channels. Compare density to the
  reference every time — it's the most common miss in both directions.
- **A loop must be FED enough yarn to contain what passes through it**
  (~2d+2πd of perimeter at collision distance d) or collision expels a strand.
  Chain-style tightness comes from SOFT collision (squashed yarn), never from
  starving the loop.
- **Flatten with the one-sided table (`floorZ`)**, not a strong symmetric plane
  pull (that crushes front/back layering and forces sideways escapes).
- Corner/edge stitches strangle first (least slack off the pinned anchor) —
  the numeric audit catches this; the fix is real slack (e.g. turning chain).
- When a render looks wrong but the audit passes, get NUMBERS before theories.

## Scope tiers (what you may attempt)

- **Combination stitches** (shell, V-stitch, picot, increases, decreases,
  crossed stitches, basketweave): combinations of locked primitives — safe to
  attempt with this process.
- **New-topology stitches** (bobble/puff/popcorn/cluster gathering, magic ring,
  chain-spaces, cables, brand-new craft elements): the risky tier. Extra care:
  reason the real yarn path out loud first, expect several construction
  iterations, verify numerically at every step. If two consecutive construction
  attempts both fail the audit or the look, STOP and write up findings for
  Rebecca instead of churning.
- **Mechanical work** (re-renders, weight sweeps, re-audits): safe for any model.
- **Never** rework a `locked` stitch's construction without Rebecca's explicit
  ask; gauge/recipe changes to locked stitches only via the audit process.

## New crafts (knitting, macrame, …)

Same engine, same rules. Knitting = a new path builder on the same relaxer
(loops through loops, no hook-turn); macrame = knots (same "one strand +
collision holds it"). For each: same dictionary pattern (topology params +
swatch recipe + reference + status), same StitchLink recording so the audit
works, same pipeline, same Rebecca gate. Extend, don't fork.

## Session hygiene

- Work in the loom worktree (`.claude/worktrees/loom-stitch-engine` off branch
  `claude/awesome-bartik-eff04a`), not the main checkout — other sessions use it.
- One Blender render at a time. Run long commands with the Bash tool's
  `run_in_background` option — NEVER shell `&` (the harness then reports
  "completed" immediately while Blender keeps running untracked for many minutes).
- Commit policy — two different things:
  - **Engine/construction fixes that pass the numeric audit: commit immediately**,
    with a message recording the why. Never leave verified fixes uncommitted
    between sessions (the next session may not know they exist).
  - **A stitch's `status: 'locked'` flip: only on Rebecca's explicit sign-off.**
- Reporting renders to Rebecca: clickable links to the PNGs. If file links don't
  render in her client, resize the heroes (Blender's bundled Python +
  `scripts/loom_resize_for_report.py`) and publish OUR renders in a report page /
  Artifact (`scripts/build-loom-report.mjs`); reference photos stay LINKED to
  their source, never embedded or re-published (copyright, calibration-only).
