# Knitting specialty techniques — discipline guide

**Guide version:** 2 (K-4.1 author-prompt update — 2026-06-10). v1
shipped with K-1 pipeline-setup (2026-06-09). v2 adds the K-4.1
prose surfaces (i-cord cast-on, tubular cast-on / bind-off
walk-through, pick-up-stitch direction guidance for curved edges,
centre-pull-vs-outside-pull ball mention).

Reference guide for any project-shape author prompt that carries
`KnittingTechniqueDiscipline.SPECIALTY`. Not a standalone author
prompt — read this alongside the appropriate shape prompt.

## Voice — MANDATORY pre-read

Read `docs/voice-spec-quick-reference.md`. Voice rules apply
unchanged.

## Scope

Specialty covers techniques that don't fit colourwork, lace,
cables, or brioche / double-knit. Sub-disciplines bundled here:

- **Modular knitting.** Mitred squares, mitred triangles, square
  and diamond units joined as work progresses.
- **Entrelac.** Diagonal woven-look fabric built from squares
  picked up off each other.
- **Magic loop.** One long circular needle method for small
  in-the-round circumferences.
- **Two-circulars.** Two circular needles holding split stitch
  counts for small in-the-round work.
- **Short rows.** Shaping technique without binding off,
  including German short rows, wrap-and-turn, and Japanese
  short rows.
- **I-cord knitting.** Two- or three-stitch round-knit cord on
  double-pointed needles.
- **Toe-up sock construction (Judy's Magic cast-on).** Out of
  scope for K-4 sock authoring (waits for K-5 grading), but the
  technique itself is reusable on mitten cuffs and toy parts.
- **Provisional cast-on variants.** Crochet-chain provisional,
  long-tail provisional, knitted-on provisional, COWYAK (cast
  on with yarn around knife).
- **Steeking.** Cutting open in-the-round colourwork to convert
  it to flat panels. Out of scope for K-4 garment authoring
  (waits for K-5) but reusable for steeked bags and pillows.

## Modular knitting

Each unit (a square, triangle, or diamond) is worked
independently or picked up from a previous unit.

**Mitred square.**
- Cast on stitches for two sides of the square.
- Decrease at the centre on every other row (one centred double
  decrease).
- Bind off the final stitch.
- Pick up stitches along one or two edges of the finished
  square to start the next.

**Domino square.**
- Same as mitred square but worked in garter stitch with
  pickups that lock into the existing fabric.

State the join method (pick-up-as-you-go or seam after) in the
body.

## Entrelac

Entrelac builds a fabric of diagonal squares. Each row of
squares is picked up off the previous row's squares.

Standard construction:
1. Cast on a multiple of the square stitch count.
2. Tier 1: triangles. Work base triangles by short rows.
3. Tier 2: right-side squares. Pick up stitches along the side
   of the previous tier's triangle / square and work in pattern.
4. Tier 3: wrong-side squares. Mirror the construction.
5. Alternate until the desired length.
6. Final tier: triangles to even off.

State the tier convention plainly. Entrelac is the technique
where readers most often get lost between tiers.

## Magic loop

One long circular needle (80 cm to 100 cm cable) for small
in-the-round work.

Standard convention:
- Cast on the full circumference of stitches.
- Pull a loop of cable through the middle of the stitches so
  half are on the working tip and half on the dormant tip.
- Knit the working half; pull the cable through; rotate; knit
  the next half.

State magic loop in the orientation paragraph for any pattern
worked at a small circumference (mitt, sock, sleeve cuff).

## Two-circulars

Two separate circular needles, each holding half the stitches.

Standard convention:
- Cast on; split stitches evenly across two needles.
- Knit the working half off one needle; pick up the other
  needle and knit the next half.
- Each needle works its own stitches with its own tips.

Two-circulars suits the maker who already owns several circular
needles and doesn't want a long-cable magic-loop needle. State
the method by name in the orientation paragraph.

## Short rows

Short rows shape without binding off. Used for sock heels, bust
darts, shoulder shaping, sweater hems.

**German short rows.** Easiest beginner method.
1. Work to the turning point.
2. Turn the work.
3. With the yarn in front, slip 1 purl-wise.
4. Pull the yarn back over the needle to create a "double
   stitch" (the slipped stitch now sits as a pair).
5. Continue across.
6. When working over the double stitch later, knit (or purl) it
   as a single stitch.

**Wrap-and-turn (W&T).** Traditional method.
1. Work to the turning point.
2. Bring the yarn forward, slip the next stitch, take the yarn
   back.
3. Slip the stitch back to the left needle and turn.
4. Continue.
5. When working over the wrapped stitch later, pick up the
   wrap with the right needle and knit it together with the
   wrapped stitch.

**Japanese short rows.** Loop method.
1. Work to the turning point.
2. Turn the work; place a small loop or marker on the working
   yarn.
3. Continue.
4. When working over the loop later, pull the loop up onto the
   left needle and knit it together with the next stitch.

State which short-row method the pattern uses in the body.
Default to German short rows for beginner-friendly patterns.

## I-cord

A small-circumference knit-on-needles cord.

Standard convention:
1. Cast on 3 (or 4) stitches on a dpn.
2. Knit across.
3. Without turning, slide the stitches to the other end of the
   dpn.
4. Knit across, pulling the working yarn tight from behind.
5. Repeat from step 3.

The yarn jumping across the back of the work closes the cord
into a round tube.

Standard uses: drawstrings, ties, applied i-cord edging,
strap-decorations. State the i-cord use case in the body.

## I-cord cast-on

A K-4.1 prose surface for any pattern that begins with an i-cord
edge (top-down shawls, throws, bags):

I-cord cast-on starts the piece with an applied i-cord already in
place at the cast-on edge. Procedure:

1. Cast on 3 stitches using long-tail or the cable cast-on.
2. Knit 2 stitches.
3. Slip the right needle's stitches back to the left needle.
4. Repeat steps 2-3 for the number of stitches needed.
5. The "third stitch" each time is a yarn-over that becomes the
   permanent edge.

The K-4.1 prompt requires patterns that recommend i-cord edges
to walk through the i-cord cast-on once at the first appearance.

## Tubular cast-on and bind-off walk-through

A K-4.1 prose surface for ribbed pieces:

Tubular cast-on and tubular bind-off match each other and produce
a polished, stretchy rib edge that flows directly into the
ribbing pattern. Standard for sock cuffs, glove cuffs, hat brims
where the rib is the design feature.

**Italian tubular cast-on (most common):**
1. Cast on half the stitch count needed using a waste yarn long-
   tail or backwards-loop cast-on.
2. With the working yarn, knit one row.
3. Knit the next row with the working yarn lifting alternating
   strands from the waste yarn, making the working stitches
   double the count.
4. Drop the waste yarn.
5. Begin the ribbing with k1, p1 alternation.

**Tubular bind-off (matches the cast-on):**
1. With a tapestry needle, set up the live stitches in a knit-
   purl alternation matching the rib.
2. Graft as if using Kitchener stitch, but alternating between
   the front (knit) layer and the back (purl) layer.

State the matching cast-on and bind-off plainly in the body
where the pattern uses ribbed edges. The K-4.1 prompt requires
this walk-through once at first use of the tubular method.

## Pick-up-stitch direction guidance for curved edges

A K-4.1 prose surface for patterns with curved-edge pickup
(hat crowns, sock heels, neckband, sleeve cap):

Direction matters when picking up stitches along a curved or
diagonal edge. State the direction plainly:

- Working from RS, insert the needle from front to back through
  the edge stitch.
- Pull the loop through to the right side.
- Move to the next stitch in the rate stated in the pattern.

State the pickup ratio (e.g. "pick up 2 stitches in every 3 row
ends") for diagonal edges and "1 stitch per edge stitch" for
straight edges. Picking up wrong-side-out flips the visible
texture and produces a visible band of WS stitches showing on
the RS — a common silent failure mode.

State the direction and ratio plainly at every pick-up step in
the Pattern section.

## Centre-pull versus outside-pull ball

A K-4.1 prose surface for body voice in the "What you need"
section, especially for large blanket or shawl patterns:

Yarn comes off a ball or skein two ways:

- **Centre-pull** — the ball doesn't roll; the yarn comes from
  the inside. Many cake-wound yarns ship this way. The end can
  be hard to find the first time and a partial collapse of the
  centre produces a tangled clump.
- **Outside-pull** — the ball or skein rolls as the yarn comes
  off the outside. Cleaner unwinding but the ball needs space
  to roll.

For long projects (blankets, large shawls) name which pull the
pattern assumes in the "What you need" section. State the
trade-off in one sentence: "This pattern is written for an
outside-pull skein wound into a swift or a yarn bowl. Centre-pull
cakes work too but check the cake hasn't collapsed mid-project."

## Provisional cast-on variants

Provisional cast-ons let you recover live stitches at the
start later.

**Crochet-chain provisional.** Crochet a chain, pick up the
stitches into the back bumps of the chain with the working
yarn. Pull the chain free to recover live stitches.

**Long-tail provisional (with smooth waste yarn).** Cast on
with two strands — working yarn as one strand, smooth waste
yarn as the other. Drop the waste yarn after knitting the
first row.

**Knitted-on provisional.** Cast on stitches with a smooth
waste yarn using the knitted cast-on. Knit one row with the
working yarn. Drop the waste yarn.

**COWYAK (cast on with yarn around knife).** Lay the waste
yarn over a needle; with the working yarn, work k1, yo across.
Drop the waste yarn.

State which provisional method the pattern uses in the body.
The garter-tab start that shawl prompts call for is a
crochet-chain provisional with the chain opened up and
picked up around three sides.

## Body voice for specialty sections

- Lead with the technique by name. "This sock is worked toe-up
  with Judy's Magic cast-on" — readers searching for the
  technique find it from the first sentence.
- Walk through the technique step-by-step on first use in the
  pattern.
- Reference the discipline guide (this file) by URL when the
  technique is well-described already; don't re-walk it twice.

## Common faults

- Entrelac tiers mis-aligned: a tier was worked in the wrong
  direction. Frog to the previous tier and restart.
- Magic loop with too-short a cable: the cable pulls the stitches
  tight at the pull-through. Use 80 cm cable minimum for adult
  hand- and head-sized work.
- Short row gaps: the double stitch or wrap wasn't picked up on
  the next pass. Pick up the dropped stitch with a crochet hook
  in its column.
- I-cord pulling tight: the carry yarn at the back was too
  short. Pull the carry yarn less tight.
- Provisional cast-on caught: the working yarn was knitted
  through the chain instead of into the back bumps. Re-work the
  cast-on.

## Cultural attribution

Specialty techniques are mostly modern (twentieth-century)
inventions or refinements:

| Technique | Inventor / origin | Notes |
|---|---|---|
| German short rows | Modern; popularised by Marlene Wagenknecht | Easiest to teach |
| Japanese short rows | Modern; Japanese knitting tradition | Tidy, no wraps |
| Magic loop | Sarah Hauschka, 1990s | Standard now |
| Entrelac | Multiple traditions worldwide; popularised in English by Horst Schulz | Modular ancestor |
| Judy's Magic cast-on | Judy Becker, 2000s | Standard toe-up start |

Where a specialty technique has a named modern source,
acknowledge briefly in the body. Do not claim cultural
authority.

## Sources

Modern reference sources (cite, do not reproduce):

- **Cat Bordhi, *New Pathways for Sock Knitters*** — magic loop
  + toe-up.
- **Carol Anderson, *Wonderful Wallaby*** — knit-in-the-round
  garment construction.
- **Horst Schulz, *Patchwork Knitting*** — modular and entrelac.

## Self-critique additions

Add to the parent shape prompt's self-critique pass:

1. Specialty technique named in the orientation paragraph.
2. Step-by-step walk-through on first use.
3. Short-row method named where used.
4. Provisional cast-on variant named where used.
5. Cable length and cable type stated for magic loop.
6. I-cord cast-on walked through where the pattern uses an
   i-cord edge.
7. Tubular cast-on AND tubular bind-off walked through where
   the pattern uses the tubular method.
8. Pick-up-stitch direction and ratio stated at every pick-up
   step.
9. Centre-pull vs outside-pull mentioned in "What you need" for
   long-yardage patterns.
10. Cultural attribution respectful and bounded.
