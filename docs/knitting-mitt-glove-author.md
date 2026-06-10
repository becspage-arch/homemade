# Knitting mitt and glove authoring — worker prompt template

## Voice — MANDATORY pre-read

Read `docs/voice-spec-quick-reference.md` end-to-end and re-read
`docs/voice-spec-2026-05-21.md` §3.4 (technique) and §3.5 (craft
project).

The voice draws on Elizabeth Zimmermann, Meg Swansen, Barbara
Walker, Beth Brown-Reinsel, and June Hemmons Hiatt. Mary Berry,
Erin Boyle, Barbara O'Neill, Martha Stewart set the register.

Every mitt or glove tutorial opens with one sentence naming the
finished piece, the construction direction, and the hand
circumference it fits.

## Image policy — DO NOT GENERATE IMAGES

Authoring NEVER generates images. Set `hero` unset. See
`memory/feedback_image_strategy.md`. Charts render through
`apps/web/src/lib/knitting/renderer/` per K-2's locked
`KnittingChartData` shape.

## Inline glossary coverage — HARD RULE

Every `glossaryTerms[]` entry appears inline at least once wrapped
in a `glossaryTooltip` mark with `termSlug` set.

## TipTap node rules — HARD

Every text leaf carries `"type": "text"`. Numbered preparation steps
use `orderedList`, never prose.

---

Canonical input for any autopilot fire that drafts a knitting MITT
or GLOVE pattern. Covers fingerless mitts, full mittens, gloves
with fingers, convertible mitts, wrist warmers. Sub-category is
`mitt-glove`.

**Prompt version:** 2 (K-4.1 author-prompt update — 2026-06-10).
v1 shipped with K-1 pipeline-setup (2026-06-09); v2 adds the
K-4.1 cross-cutting requirements and the Persona stuck-check.

## Mitt and glove sizing — single-axis grading

Hand sizing grades against hand circumference (palm, just below the
knuckles) and hand length (wrist crease to fingertip).

| Size | Hand circumference | Hand length |
|---|---|---|
| Child small | 14 cm | 14 cm |
| Child medium | 16 cm | 16 cm |
| Adult small | 18 cm | 18 to 19 cm |
| Adult medium | 20 cm | 19 to 20 cm |
| Adult large | 22 cm | 21 to 22 cm |
| Adult XL | 24 cm | 22 to 23 cm |

Negative ease of 1 to 2 cm at the palm gives a snug fit. State the
ease in the orientation paragraph.

Garment-level grading (with bust, waist, hip, sleeve length) is K-5
territory. Mitts and gloves stay on this single-axis grading and
are safe to author now.

## Thumb gusset reference

**Afterthought thumb (recommended default for first-time mitt
makers).** Knit a piece of waste yarn across the thumb stitches at
the thumb position. Continue past. After binding off the hand,
pick up the live stitches above and below the waste yarn, remove
the waste, work the thumb. Cleanest visual; no in-flight increase
maths to track; the thumb position can be fine-tuned by where
the waste yarn lands. Default to this construction on BEGINNER
patterns.

**Gusseted thumb.** Increase a wedge of stitches alongside the
thumb position over several rounds. Slip the gusset stitches onto
waste yarn when the hand reaches the thumb base. Work the hand
past. Return to the gusset stitches and work the thumb in the
round. Most ergonomic fit. INTERMEDIATE and up.

**Side-of-palm thumb.** Common in vintage patterns. Increase one
stitch on each side of a centre stitch at the thumb edge of the
palm, work the wedge for a few rounds, set aside. Less anatomical
but very fast.

**Peasant thumb.** Knit a thumb hole in the side seam of a flat
mitt as you go. Pick up around it later. Suits seamed designs.

## Input contract — the brief

- `title` — e.g. "Ribbed wool fingerless mitts".
- `slug` — URL slug.
- `type` — always `PATTERN`.
- `subCategorySlug` — always `mitt-glove`.
- `pieceShape` — `FINGERLESS_MITT` | `FULL_MITTEN` |
  `GLOVE_WITH_FINGERS` | `CONVERTIBLE_MITT` | `WRIST_WARMER`.
- `construction` — `IN_THE_ROUND` (default) or `FLAT_SEAMED` (rare).
- `thumbGusset` — `AFTERTHOUGHT` | `GUSSETED` | `SIDE_OF_PALM` |
  `PEASANT`.
- `sizes` — array of hand circumferences to grade,
  `[18, 20, 22]`.
- `techniqueDisciplines` — common combinations:
  `[COLOURWORK]` for Selbu, Sanquhar, Komi, Latvian mittens;
  `[CABLE_ARAN]` for Aran-style mittens;
  `[BRIOCHE_DOUBLEKNIT]` for double-knit mitts.
- `craftStitchSlugs` — every stitch used.
- `craftTechniqueTags` — `magic-loop`, `two-handed-stranded`,
  `thumb-gusset`, `picking-up-stitches`, etc.
- `primaryYarnWeightSlug` — required.
- `primaryNeedleSlug` — required.
- `castOnMethod` — required.
- `bindOffMethod` — required.
- `inTheRoundMethod` — required when in-the-round.
- `terminologyConvention` — `uk` (default) or `us`.
- `gaugeText` — required.
- `gaugeInPatternStitch` — required where the body's stitch
  pattern differs from stockinette.
- `finishedSizeText` — required. State each finished hand
  circumference and length.
- `difficulty` — BEGINNER | INTERMEDIATE | ADVANCED.
- `targetWordCount` — see § "Length guidance".
- `sources` — public-domain references.

## Output contract — `TutorialUploadInput`

```json
{
  "slug": "<slug>",
  "title": "<title>",
  "subtitle": "<one short clause>",
  "excerpt": "<2-3 sentence summary>",
  "type": "PATTERN",
  "categorySlug": "knitting",
  "subCategorySlug": "mitt-glove",
  "difficulty": "INTERMEDIATE",
  "sourceType": "PUBLIC_DOMAIN",
  "sourceNotes": "<plain-text references>",
  "knitting": {
    "primaryYarnWeightSlug": "dk",
    "primaryNeedleSlug": "needle-3-75-mm",
    "castOnMethod": "LONG_TAIL",
    "bindOffMethod": "STANDARD",
    "inTheRoundMethod": "MAGIC_LOOP",
    "gaugeText": "22 sts × 30 rows = 10 × 10 cm in stockinette on 3.75 mm needles, blocked.",
    "gaugeInPatternStitch": null,
    "finishedSizeText": "Hand circumference 18 (20, 22) cm. Hand length 18 (19, 20) cm to the top of the cuff.",
    "terminologyConvention": "uk",
    "craftStitchSlugs": ["knit-stitch", "purl-stitch", "knit-2-together", "make-1-left", "make-1-right"],
    "craftTechniqueTags": ["magic-loop", "thumb-gusset", "picking-up-stitches"],
    "projectShape": "MITT_GLOVE",
    "techniqueDisciplines": [],
    "sizesGraded": [
      { "name": "S", "handCircumference": 18, "handLength": 18 },
      { "name": "M", "handCircumference": 20, "handLength": 19 },
      { "name": "L", "handCircumference": 22, "handLength": 20 }
    ]
  },
  "recipeTools": [
    { "slug": "needle-3-75-mm", "isOptional": false },
    { "slug": "stitch-markers", "isOptional": false },
    { "slug": "waste-yarn", "isOptional": false },
    { "slug": "tapestry-needle", "isOptional": false }
  ],
  "glossaryTerms": [
    { "slug": "thumb-gusset", "term": "Thumb gusset", "definition": "A triangular section of increases alongside the thumb position so the thumb stitches end up worked from the palm rather than poking out at right angles." }
  ],
  "techniqueSlugs": ["long-tail-cast-on", "knit-stitch", "purl-stitch", "magic-loop", "thumb-gusset", "picking-up-stitches"],
  "criticalTechniques": ["long-tail-cast-on", "knit-stitch", "purl-stitch", "magic-loop"],
  "body": { "type": "doc", "content": [] }
}
```

## Body structure — MITT AND GLOVE PATTERN

1. **Opening sentence** — name the finished piece, the
   construction direction, the hand circumference. Voice spec §3.5.
2. **Orientation paragraph** — one paragraph. Construction direction
   AND one clause naming why it was chosen for this mitt or glove
   (in-the-round avoids the seam at the palm where wear would tell;
   flat-and-seamed suits a beginner who hasn't met magic loop).
   Thumb-gusset type and why it was chosen (afterthought is the
   recommended default for first-timers; gusseted is the most
   ergonomic fit). Rough yardage. One practical wear note (driving,
   mobile-phone use, photography).
3. **What you need** — `suppliesCard` block. Yarn weight + total
   grams (account for the second mitt; gloves use more), needle
   size, stitch markers, waste yarn (for afterthought thumbs and
   set-aside gusset stitches), tapestry needle.
4. **Gauge** — H2 "Gauge". Quote `gaugeText` verbatim. Swatch
   instructions. State the concrete numeric consequence — for
   most mitts and gloves at fingering-to-DK weight, "1 stitch
   per 10 cm tight finishes ≈ 1 cm narrower at the palm; over an
   18 cm circumference that's the difference between snug and a
   mitt that won't stay on." Write the actual number, not a
   vague "wrong size".
5. **Stitches used** — H2 "Stitches used". UK and US abbreviations.
6. **Pattern** — H2 "Pattern":
   - **Circle your size** — one sentence near the top of the
     Pattern section: "Before you cast on, circle your size in the
     figures below — every count and measurement reads S (M, L)."
   - **Cast on and cuff** — cast-on method, cast-on count for each
     size, cuff stitch pattern, cuff depth. For long-tail cast-on:
     state the tail-length formula `tail_cm ≈
     (needleCircumferenceMm × stitchCount) / 10 + 15` and a
     worked number for the largest size in this pattern.
   - **Hand** — round-by-round to the thumb gusset start. State
     the thumb position (right or left mitt, or "place at stitch
     X").
   - **Thumb gusset** — pattern-specific. Increase round numbers,
     stitch counts at every increase round.
   - **Hand past the gusset** — set aside or work past the gusset
     stitches per the chosen thumb method.
   - **Finishing the hand** — top decreases (for full mittens) or
     bind off (for fingerless mitts). State which.
   - **Thumb** — pick up the gusset stitches, work the thumb in
     the round, bind off or close at the tip.
   - **Fingers** — only for gloves with fingers. Divide the
     hand stitches into four finger sections, work each in the
     round, close at the tip. State the order (index, middle,
     ring, little) and the number of bridging stitches between
     fingers.
7. **Second mitt or glove — mirror the thumb position.** Mitts
   and gloves are paired. State plainly that the second mitt
   mirrors the first: thumb gusset on the opposite side. Include
   a one-sentence sanity check: "Hold the first mitt up palm-out;
   the thumb sits on your right. The second mitt's thumb sits on
   your left. If both thumbs end up on the same side, you've
   knitted two right mitts." For paired gloves with fingers, name
   the order (index, middle, ring, little) AND state that the
   second glove reverses the order so the fingers match the
   anatomical hand.
   - **Stitch count check-in (after gusset).** Structural prose
     entry: "After the final gusset increase round, you should
     have N (N, N) sts on the hand needle and N (N, N) sts set
     aside for the thumb." Populate
     `knitting.stitchCountCheckpoints` with the matching entry.
   - **Stitch count check-in (after hand decreases or bind-off).**
     Same structure for full mittens at the top of the mitten.
8. **Finishing** — H2 "Finishing". Weaving in ends (palms get a
   lot of wear), light blocking.
   - **Common faults** — `### Common faults` H3 inside the Pattern
     section (place above Finishing). For most mitts and gloves:
     two-of-the-same-hand (both thumbs on the right); thumb gusset
     pulled tight where the increases stacked at the seam line
     instead of the gusset edge; cuff sagging after one wear (cuff
     cast on or bound off too loosely); finger join holes (pick-up
     stitches not snugged at the bridge).
9. **Care** — H2 "Care". Fibre-specific.
10. **What to try next** — variations or related projects.

## Cast-on and bind-off

See `docs/knitting-scarf-cowl-author.md` for the full enum table.
Mitts and gloves commonly use:
- `LONG_TAIL` cast-on with a ribbed cuff.
- `GERMAN_TWISTED` or `ITALIAN_TUBULAR` for an extra-stretchy cuff.
- `STANDARD` bind-off for fingerless mitt tops.
- Top decreases worked to a small live-stitch count, drawn through
  and fastened — no bind-off needed at the mitten tip.

## In-the-round method reference

| Value | Plain English |
|---|---|
| MAGIC_LOOP | One long circular needle. |
| DPN | Four or five double-pointed needles. Traditional. |
| TWO_CIRCULARS | Stitches split across two circular needles. |
| FIXED_CIRCULAR | One circular needle, cable length matches the work. Hands are usually too small. |
| SHORT_CIRCULAR | Rarely usable for hand-sized work. |

Default for hand-sized work is `MAGIC_LOOP` or `DPN`. `DPN` is the
classical choice and many vintage patterns assume it.

## Materials master list

| Mitt or glove type | Yarn weight | Needle | Why |
|---|---|---|---|
| Plain fingerless mitt | DK wool | 3.75 mm | Standard fit, fast |
| Selbu Fair Isle mitten | Fingering wool | 2.5 to 3 mm | Standard colourwork weight |
| Cabled mitten | DK wool | 3.75 mm | Holds cable definition |
| Heavy outdoor mitten | Worsted or aran wool | 4 to 4.5 mm | Warmer; double-thick when felted |
| Glove with fingers | Fingering or sport wool | 2.75 to 3.25 mm | Crisp, fine, dexterous fingers |
| Wrist warmer | Sport or DK wool | 3.5 mm | Light layer |
| Convertible mitt | DK wool | 3.75 mm | Flap folds back, mitt converts to fingerless |

## Pipeline-setup population

Read `Category.knitting`:

- `Category.techniqueSlugs[]` → copy the relevant subset.
- `Category.criticalTechniques[]` → `long-tail-cast-on`,
  `knit-stitch`, `purl-stitch`, `magic-loop` or `dpn-knitting`,
  `thumb-gusset` if applicable, `picking-up-stitches` for
  afterthought thumbs.
- `Category.aliases[]` → copy relevant.

## Length guidance

| Piece | Word count |
|---|---|
| Plain ribbed fingerless mitt | 1,200 – 1,600 |
| Cabled fingerless mitt | 1,500 – 2,000 |
| Full mitten | 1,400 – 1,900 |
| Selbu Fair Isle mitten | 2,000 – 2,700 |
| Glove with fingers | 2,200 – 3,000 |
| Convertible mitt | 2,000 – 2,600 |

Count body prose only.

## Voice rules — hard

Same as `docs/knitting-scarf-cowl-author.md`. Mitt-specific
additions:

- **State the cast-on count for every size** in the body.
- **Number every gusset increase round** with stitch counts at
  the end.
- **State the thumb position** (right-hand or left-hand mitt) for
  patterns that mirror the gusset.
- **Name the in-the-round method** in the orientation paragraph.
- **State the ease** (1 to 2 cm negative) in the orientation
  paragraph.

## Voice rules — soft

- **Named failure modes go in the `### Common faults` H3.** The
  K-4.1 update replaces the "show the failed swatch" pattern with
  a structural prose H3. Mitts that sag at the cuff after a wash,
  gloves that pinch at the gusset, superwash wool that grows
  after the first wash — state the failure mode and the cause as
  named prose in the H3, not as a photo reference.
- **One concrete wear note** — close with "Fits under a coat
  cuff" or "Works for taking photos with a phone" rather than
  marketing language.

## Cultural attribution

Where a mitt or glove draws on a regional tradition (Selbu,
Sanquhar, Komi, Latvian, Estonian Roosimine, Norwegian Twined
knitting) acknowledge by name in the orientation paragraph. Do
not claim cultural authority. One sentence is enough.

## Sources

Format: one bullet per source. Acceptable sources:

- **Weldon's Practical Knitter** — Internet Archive.
- **Therese de Dillmont, *Encyclopedia of Needlework*** —
  Project Gutenberg #20776.
- **Cornelia Mee, *A Manual of Knitting and Crochet* (1846)** —
  Internet Archive.
- **Annichen Sibbern Bøhn, *Norwegian Knitting Designs* (1929)** —
  out of Norwegian copyright, citations only.

For modern fingerless designs (texting mitts, photography mitts)
set `sourceType: "SYNTHESISED"`.

## Self-critique pass

1. Em or en dashes — ZERO.
2. Banned phrases — ZERO.
3. UK terminology consistent.
4. Every `craftStitchSlugs` entry exists and appears in body
   prose.
5. Every `glossaryTerms[]` entry appears inline wrapped in a
   `glossaryTooltip` with `termSlug` set.
6. Every text leaf has `type: text`.
7. Numbered preparation steps use `orderedList`.
8. `gaugeText` quoted verbatim in the Gauge section.
9. Cast-on count stated for every size.
10. Gusset increases numbered with stitch counts at each round.
11. Thumb position stated for mirrored gussets.
12. Cultural attribution respectful and bounded.
13. K-4.1 cross-cutting:
    - Orientation paragraph names construction direction AND
      justifies the choice. Thumb-gusset type AND why.
    - "Circle your size" instruction near the top of the Pattern
      section.
    - Gauge section names the concrete numeric consequence at the
      palm, not "wrong size".
    - Long-tail cast-on: tail-length formula AND worked number
      present.
    - "Mirror your second mitt" callout present, with the palm-
      out sanity check sentence.
    - Stitch count check-in after the gusset AND after the hand
      decreases (full mittens) or bind-off (fingerless).
      `knitting.stitchCountCheckpoints` populated.
    - BEGINNER patterns default to afterthought thumb.
    - `### Common faults` H3 present with 2-4 named failure
      modes in prose.
    - No "see video" / "watch the video" / "see photo" anywhere.
14. **Persona stuck-check (self-critique heuristic — we have no
    in-house knitter, so this is a quality pass, not a verification
    pass).** Read the draft three times, each as a different
    reader.
    - **Beginner (cast on + first knit / first purl only):** flag
      every step where a first-time knitter stops because a skill
      or term is assumed she hasn't built.
    - **Intermediate (k / p / dec / inc, learning charts +
      shaping):** flag where the pattern assumes a skill not yet
      built or where the chart doesn't say what to do.
    - **Master (Walker / Bush / Brown-Reinsel / Hiatt
      literature):** flag where the pattern violates an established
      convention or omits something a competent designer would
      always include.
    Each flag carries a row or section reference and a one-line
    fix. Fix every flag before voice-check, or document why it
    was intentional. Future iteration: when an unpaid tester pool
    exists post-launch, the stuck-check becomes pre-publication
    verification.
