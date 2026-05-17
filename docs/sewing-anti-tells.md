# Sewing anti-tells

Every Sewing tutorial worker reads this file alongside
`docs/common-issues.md` and `docs/sewing-author.md`. After drafting,
the worker rereads each paragraph against every entry below and
rewrites any line that trips an anti-tell.

These are the patterns that mark Sewing copy as AI-generated, as
imported from a non-UK source, as copyright-creep, or as carelessly
written for a beginner. The lines are not stylistic preferences —
they are failure modes. The deterministic `voice-check` CLI catches
the obvious ones; this file catches the rest.

---

## Voice + register

### 1. Hype + outcome promises

The fabric does what the fabric does; the stitch holds because the
stitch holds. Avoid words that promise an outcome the tutorial cannot
guarantee.

- "Easy" — never. Confidence is the reader's; the tutorial earns it.
- "Simple" — same. Use it only as a literal opposite of "compound"
  ("a simple straight stitch", not "this simple project").
- "Anyone can sew this" — patronising and frequently untrue.
- "Perfect" — no finished item is perfect. "Neat" or "even" or "flat"
  describes a specific quality and earns the line.
- "Quick" — beginners are slow; the framing primes failure.
- "Cute", "adorable", "darling" — Instagram register, not homemaking
  register.
- "Stunning", "gorgeous", "beautiful" — the photograph carries the
  visual; the text describes the construction.

**Why:** Homemade voice (`feedback_homemade_voice.md`) is calm,
factual, hands-down-on-the-table. Sales register breaks it.

### 2. False reassurance

- "Don't worry if…" — replace with the fix.
- "It's okay if…" — same. State what to do.
- "Trust the process" — never. Tell the reader what to do, why, and
  how to know when it's right.

### 3. Heritage-craft tradition-claiming

When a Sewing tutorial teaches a technique with a named tradition
(sashiko, kantha, boro, drawn-thread work, hardanger, Madeira
embroidery), the line that names the tradition either credits the
tradition honestly OR frames the technique as the general
running-stitch / decorative-mending / cutwork variant that it is.

- Reject: "Sashiko-style stitching to give your mending a Japanese
  feel."
- Reject: "We're doing sashiko, the ancient Japanese mending art" on
  a tutorial that does not teach sashiko's specific traditional
  grids and ruler-marked patterns.
- Acceptable: "Decorative running stitch in the style of Japanese
  sashiko mending. The traditional sashiko grid is a separate
  tutorial; here we're doing simple visible mending with the same
  family of stitches."
- Acceptable: "Sashiko" used precisely on a tutorial that teaches the
  traditional method, with `sourceNotes` crediting a public-domain
  sashiko source.

**Why:** Cultural appropriation in craft writing is well-documented.
The fix is honest naming, not avoidance.

---

## Unit precision + UK conventions

### 4. Imperial unit slips

Metric only. Centimetres, metres, grams per square metre, kilograms
for stuffing. Imperial only appears when quoting a public-domain
historical source, and only inline: "36 inches (92 cm)" on the first
reference, metric only after that.

- Reject: "Cut a 1-yard length of fabric."
- Reject: "Use ¼-inch seam allowance."
- Reject: "20-gauge needle" (the gauge system is US; UK uses size 70,
  80, 90, 100, 110 for machine needles — Schmetz / Singer numbering).

### 5. US fabric-name slips

UK and US fabric names diverge enough that the wrong one mis-orients
the reader. The master `Fabric` table uses UK names; reflect that.

- Reject: "muslin" meaning the unbleached medium-weight cotton
  utility cloth (that's calico in UK).
- Reject: "denim" interchangeable with "jean" (the fabric is denim;
  jeans are the trouser).
- Reject: "fleece" without qualifier — UK fleece typically means
  polyester polar fleece (the master slug is `fleece`); the dressmaking
  trade still distinguishes "wool fleece" (the raw fibre, not a
  fabric).

### 6. US notion-name slips

- Reject: "snap" alone — UK is "press stud" or "snap fastener".
- Reject: "zipper" as a noun (the foot is a "zipper foot" — that's
  the standardised name; everywhere else use "zip").
- Reject: "thread weight 50 wt." — fine when sourced; spell out
  "Tex 27 / size 50 polyester thread" first.

### 7. Fabric vagueness — "cotton" without weight + drape

The Sewing master table separates fabrics by weight + drape because
the construction depends on it. A "cotton" called for in a tutorial
is the worst kind of vague — quilting cotton, calico, drill, denim,
canvas all crop up in the cotton column and they do not interchange.

- Reject: "Buy 1 metre of cotton fabric."
- Reject: "Any cotton will work."
- Acceptable: "1 metre of medium-weight cotton (cotton drill or
  cotton twill — 200-280 gsm)."
- Acceptable: "Any quilting-weight cotton, around 115 gsm, in a
  print or solid colour you like."

### 8. Notion brand-shorthand

The master `SewingNotion` table is brand-free. Tutorials follow.

- Reject: "Bondaweb" — write "fusible web" with the slug
  `fusible-web`.
- Reject: "Vilene" — write "fusible interfacing" and pick the
  light / medium master slug.
- Reject: "YKK zip" — write "regular nylon zip" or the size variant.
- Reject: "Liberty lawn" — write "cotton lawn".
- Reject: "Singer needle size 14" — write "size 90 machine needle"
  (the EU Schmetz system the master table uses).

---

## Copyright + sourcing

### 9. Copyright-creep — modern pattern reproduction

PATTERN tutorials at launch are first-principles or public-domain
construction. Any line that smells like reproduction of a modern
published pattern fails.

- Reject: "Following the X pattern by Y…"
- Reject: "Inspired by the Sew Liberated / Closet Core / Tilly &
  the Buttons [or any modern indie pattern brand] pattern…"
- Reject: detailed line-by-line construction matching a known modern
  pattern, even without naming it.

**Why:** The construction sequence + measurements + finishing
sequence of a specific modern pattern is part of what's protected.
Construction techniques themselves are not. When in doubt, write
from the technique up.

### 10. Vague sourcing

Every source quoted gets a specific citation in `sourceNotes`.

- Reject: "drawn from traditional sources" — name them.
- Reject: "based on common practice" — write from first principles
  or cite.
- Reject: "see various Victorian sewing manuals" — name the manual,
  volume, page.

### 11. Pattern-pieces sneaking back in

The scope rule is locked: no fitted-garment patterns at launch.
Anything that requires a paper pattern to cut fails the scope.

- Reject: "Print and tape the attached pattern pieces."
- Reject: "Trace the bodice front from the diagram below."
- Reject: any reference to grading sizes, seam-line markings on a
  paper piece, or notches to match adjacent pieces.
- Reject: any mention of a downloadable PDF pattern.

The only "pattern" PATTERN tutorials should reference is the cutting
plan written in centimetres in the tutorial body.

---

## Construction precision

### 12. "Sewing machine required" without the hand-sewn alternative

A meaningful chunk of the audience does not own a machine. Where a
machine is genuinely required (zip in heavy denim, blackout-lining
seams) say so up front. Otherwise the body names the hand-sewn
equivalent, even briefly.

- Reject: "Stitch along the seam line." (Implicit machine. Beginners
  without a machine bounce.)
- Acceptable: "Machine straight-stitch along the seam line at 2.5 mm
  stitch length. Hand-running stitch at 4 mm spacing works if you
  have no machine — slower but holds the same."

### 13. Pressing skipped or implied

Pressing is a step. New sewers skip it. The construction looks slack
when they do.

- Reject: tutorials where the iron appears once in the equipment
  list and never again in the body.
- Acceptable: at every seam-finishing point, an explicit press
  direction. "Press the seam to one side, toward the back." or
  "Press the seam open."

### 14. Stitch length silence

Stitch length affects everything — gather, basting, seam, top-stitch.
A tutorial that doesn't state the stitch length leaves the reader
guessing.

- Reject: "Sew the seam." (At what stitch length?)
- Acceptable: "Machine straight-stitch at 2.5 mm stitch length."
- Acceptable: "Set the longest stitch length your machine offers
  (typically 4.0-5.0 mm) for the gathering rows."

### 15. Grain direction omitted from the cutting plan

Every piece in the cutting plan states grain. Wovens behave very
differently on the bias.

- Reject: "Cut a 50 × 50 cm square."
- Acceptable: "Cut a 50 × 50 cm square with the 50 cm dimension on
  the warp (long-grain)."

### 16. Right side / wrong side ambiguity

"Place the pieces together" is ambiguous. Beginners don't yet know
the conventions.

- Reject: "Place the two pieces together and stitch."
- Acceptable: "Place the two pieces right sides together (the
  printed face of each touching the other) and stitch."

### 17. "Trim seam allowance" without a measurement

- Reject: "Trim the seam allowance."
- Acceptable: "Trim the seam allowance to 5 mm, leaving 1 cm at the
  corners for the turn-through."

---

## Metadata + structural

### 18. `projectShape` set to a fitted value

The schema doesn't validate this; the author docs and the anti-tells
do. Any PATTERN tutorial that claims a fitted shape is out of scope
at launch.

- Reject: `"projectShape": "fitted-bodice"`
- Reject: `"projectShape": "set-in-sleeve"`
- Reject: `"projectShape": "princess-line"`
- Accept only one of: `rectangle` / `gathered-rectangle` /
  `panel-construction` / `circle` / `from-measurements` /
  `unconstructed`.

### 19. `requiredFabricSlugs` empty on PATTERN

Every PATTERN tutorial names at least one fabric. The slug must
exist in the master Fabric table. If it doesn't, the worker writes
back to the orchestrator with the seed entry to add — not authors
against a missing slug.

### 20. `sewingMethod` defaulted to "machine" without consideration

A drawstring bag works equally well hand-sewn. A blackout-lined
curtain requires a machine. The author thinks about which honestly.

- Reject: defaulting every tutorial to `"sewingMethod": "machine"`
  because it feels right.
- Accept: `"hand-sewn"` for tutorials that don't strictly need a
  machine (running-stitch hems, simple mending, slip-stitched
  bindings, small accessories).
- Accept: `"mixed"` for tutorials that machine the long seams and
  hand-finish the visible parts (slip-stitched hem on a curtain,
  hand-stitched binding on a quilt).

### 21. `bodyMeasurementsRequired` populated on non-clothing patterns

A cushion cover does not have a bust girth. A drawstring bag does not
have a waist. Leave the field empty.

- Reject: `bodyMeasurementsRequired: ['waist']` on a tablecloth.
- Accept: empty on bag / cushion / curtain / soft-toy / kitchen
  linen / accessories / homewares patterns.

### 22. `fabricYardageMetres` missing on PATTERN

Every PATTERN tutorial gives a metres-of-fabric figure for the base
size. The number assumes standard 112 cm fabric width unless the
body says otherwise.

- Reject: `fabricYardageMetres: null` on a PATTERN tutorial.
- Accept: a conservative estimate, in metres, decimal allowed
  (0.6 for a small bag, 2.4 for a curtain pair).

---

## Source-attribution

### 23. Generic Victorian-source claim without volume + page

`sourceNotes` is plain text; the author can be specific.

- Reject: "Drawn from Beeton's Book of Needlework."
- Accept: "Beeton's Book of Needlework (1870), § Tatting, pp 211-218,
  Project Gutenberg etext #25640, for the running-stitch sequence.
  Weldon's Practical Needlework vol. 5 (1888), § Flat-Felled Seams,
  Internet Archive, for the seam construction."

### 24. Modern source attribution without licence-clear status

The licence column is implicit in the source. Anything modern needs
explicit licence-clear status; otherwise it doesn't belong.

- Reject: "After a tutorial by [modern blog or maker]."
- Reject: "Pattern by [a person whose copyright status is not
  established]."
- Accept: "WWII Make Do and Mend pamphlet (UK Board of Trade, 1943) —
  Crown Copyright expired, reproduced in the Public Records Office."
