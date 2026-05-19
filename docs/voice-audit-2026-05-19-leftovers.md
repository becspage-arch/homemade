# Voice audit 2026-05-19 — leftover violators

After the deterministic sweep (em-dash, jargon, raw-hours, exercising→practising), 241 of 2,310 PUBLISHED tutorials (10.4%) still violate at least one of the 8 voice patterns. These are the ones a deterministic transform can't safely handle — they need LLM judgement or a wider engineering fix first.

## Rule 7 — orientation before depth (91 tutorials)

The first body block isn't a plain-English orientation paragraph. Usually either:

- Body opens with a `heading` block (typical autopilot output before Worker S's fix).
- Body opens with a paragraph that uses domain jargon without a preceding plain-English gloss.
- Body opens with an `infoPanel` or `suppliesCard` (structural block).

**Fix shape:** insert a 2-4 sentence plain-English orientation paragraph at the very top of the body. State what the practice / recipe is and why someone would do it, without jargon. Existing first-block heading stays where it is, demoted to the second block.

Distribution: baking 61, cooking 22, mindset 8.

## Rule 3 — brand-trademark false positives (~139 of the 144 rule-3 hits)

The current `BANNED_BRANDS` / `WARN_BRANDS` list in `packages/db/scripts/data/banned-brands.ts` has entries that overlap with common English words:

- **Anchor** — 137 hits. Verb / noun for boat / general grounding. The brand is also a butter brand. The verb usage is overwhelmingly dominant in our content.
- **Target** — 42 hits. Verb "to target" / noun "the target". The retailer Target only appears in our content as the verb.
- **Pam** — 3 hits. Sometimes a person's name in mindset readings, not the cooking-spray brand.
- **Bird's** — 3 hits. Often "bird's nest" / "bird's eye chilli", not Bird's custard.
- **Flake** — 11 hits. Verb "to flake" / noun "a flake of chocolate", not always the Cadbury Flake bar.

**Fix shape:** scrub the brand list to remove or guard these entries — for example, require a leading capital + specific noun context, or just remove the ambiguous entries entirely. Then re-run the audit; the rule 3 count should drop to ~5-10 real brand hits (Oreo, Cadbury, Marmite, Hellmann's, etc.) which can be swapped via the same `wholeWordReplace` pattern.

## Rule 4 — performing/performed (6 mindset rows)

Skipped from the deterministic sweep because mindset writing legitimately uses "performing outrage" / "performing wealth" / "performing warmth" to describe performative behaviour — exactly the concept the category is critiquing. Blanket `performing → doing` destroys that contrast.

Slugs:
- the-money-zone-method-what-it-is-and-how-it-works
- the-woman-with-money-and-desire-visualisation
- the-woman-who-has-it-and-is-still-her-visualisation
- the-cultural-pairing-of-money-sex-and-good-women-reading
- looking-back-from-the-end-of-your-life-at-the-lineage-you-started
- you-at-the-head-of-the-table-visualisation

**Fix shape:** read each instance in context. If the author meant "the practice is performed" (banned), swap to "the practice is done" or rephrase. If the author meant "performative behaviour" (legitimate), leave or rephrase to "putting on a show of X" / "performing as X" with the meaning preserved.

## Rule 2 — safety blocks (5 leftover anchor / test tutorials)

All five are anchor / test rows in NOT_READY categories that the autopilot hasn't iterated yet. They contain pre-Worker-S "Before you start: PPE / eye protection / first aid" blocks.

Slugs:
- reupholstering-a-drop-in-dining-chair-seat (home-repair)
- three-bin-hot-compost-system (sustainability)
- cold-process-oatmeal-soap (natural-home)
- patching-a-small-plasterboard-hole (home-repair)
- calculating-loft-insulation-depth (home-repair)

**Fix shape:** delete the multi-paragraph safety block. Compress to a single inline step where the action genuinely needs it ("Wear protective gloves and work in a ventilated space."). Leave general site-wide safety to the terms.

## Legacy findings (still flagging, not part of the 8 patterns)

After the sweep, legacy findings stand at:
- americanisms: 291 occurrences
- tricolons: 298 occurrences
- banned-phrase / banned-opener: small

The americanisms count is dominated by "fall" (US for "autumn"), "color"/"flavor"/"favorite" (US spellings). Most are deterministic swaps. A future pass.
