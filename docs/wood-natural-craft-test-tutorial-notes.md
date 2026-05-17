# Wood & natural craft — test tutorial review notes

**Tutorials reviewed:**
- `carved-lime-butter-knife` — PATTERN / whittling / seasoned / BEGINNER
- `carved-hazel-tent-peg` — PATTERN / green-woodwork / green / BEGINNER

**Session date:** 2026-05-17

---

## Voice register check

**Butter knife:** Voice is calm and factual throughout. The opening paragraph ("A butter knife is the first whittling project for a reason...") is direct and informational. The cut descriptions name the angle, the grip, and the expected surface result in sequence — no hedging language.

No offending sentences found on a full re-read. The closest candidate is "When the shape looks right to the eye, it is ready for sanding" — this is intentionally qualitative and is the correct instruction for this step (there is no dimensional threshold for "done carving" on a freeform piece). Leave as is.

**Tent peg:** Voice is similarly factual. The paragraph "How to know the wood is green: the cut end surface will show a slight gloss..." is a concrete sensory test rather than a vague instruction — the right register.

One potential register flag: "A hazel tent peg carved in twenty minutes from a freshly coppiced or bought green-hazel rod." (in the excerpt) — the "twenty minutes" figure is a claimed benchmark time. The authoring prompt bans no-time-estimates for the user's own estimates but content body estimates of project time are how readers evaluate scope. This is a legitimate time reference, not a marketing claim. Keep.

No AI-poetry or generic platitudes found in either tutorial.

---

## Safety preamble flow

Both tutorials reproduce the safety block verbatim inside an `infoPanel` block with `tone: "warning"`. Both appear after the opening paragraph, before the wood-and-tools sections.

**Tent peg:** A hatchet-specific safety addition was appended to the standard block: "Hatchet safety: the hatchet is a two-handed operation. Secure the billet on a block or chopping base before striking. Never hold the billet in one hand while swinging with the other. Keep bystanders at twice the handle-length away." This is a body-prose addition within the same `infoPanel`. The authoring prompt says "Reproduce the relevant block from § 'Safety preamble' below **verbatim**" — strictly, the verbatim block should not be modified. The hatchet addition is appended after the verbatim block rather than replacing it, but both sit in the same `infoPanel.body` string.

**Proposal:** The authoring prompt should clarify whether hatchet/axe additions sit in the same infoPanel or a second one. Current rendering (single infoPanel with the standard block + hatchet addition below) reads naturally; splitting would force the reader to read two adjacent warning panels. Recommendation: append hatchet-specific notes as a second paragraph in the same infoPanel, which is what was done.

---

## Cross-link gaps

Both tutorials reference Garden tutorials that do not yet exist:

| Reference | Slug used in `subTutorialCard` | Status |
|---|---|---|
| Garden lime coppicing | `coppicing-lime-tilia` | Does not exist — placeholder |
| Garden hazel coppicing | `coppicing-hazel-corylus` | Does not exist — placeholder |

The upload script will log both to `docs/missing-techniques.md` as per the v5 appendix rules. No action needed in this session; the Garden coppicing worker picks them up from that file.

---

## Tools registry hits

Every tool referenced in body prose was cross-checked against the slugs in `packages/db/scripts/data/tools.ts`.

**Butter knife** (`recipeTools`):

| Slug | In tools.ts | Named in body |
|---|---|---|
| `sloyd-knife` | ✓ | ✓ (sloyd knife) |
| `leather-strop` | ✓ | ✓ (leather strop) |
| `sandpaper-240` | ✓ | ✓ (240 grit) |
| `sandpaper-400` | ✓ | ✓ (400 grit) |
| `sandpaper-600` | ✓ | ✓ (600 grit) |
| `wood-finish-raw-linseed-oil` | ✓ | ✓ (raw linseed oil) |

All clean.

**Tent peg** (`recipeTools`):

| Slug | In tools.ts | Named in body |
|---|---|---|
| `hatchet-small` | ✓ | ✓ (small hatchet) |
| `sloyd-knife` | ✓ | ✓ (sloyd knife) |
| `leather-strop` | ✓ | ✓ (leather strop) |

**One tool named in body prose that is NOT in `recipeTools`:** The chopping block / side-axe block. The tent peg body lists a "chopping block" as a required item (step 2 depends on it; the safety preamble hatchet addition refers to "a block or chopping base"). The `side-axe-block` slug exists in tools.ts. It was not added to `recipeTools` because it's environmental kit (a heavy log section works; it's not typically purchased) rather than hand-tool kit — the same way a chopping board isn't in a cooking recipe's tool list.

**Decision needed by Rebecca:** Should `side-axe-block` (or a note that "any heavy end-grain block or log section serves") be added to `recipeTools` for the tent peg? The authoring prompt says "Every entry in `recipeTools` appears in the master `Tool` table and is named at least once in the body prose" — the inverse check (body names it, recipeTools omits it) is also flagged. If the block is promoted to `recipeTools`, make it `isOptional: false` with a note "any knee-high end-grain block, a log section, or a purpose-made side-axe block".

---

## Glossary tooltips

**Butter knife** — glossaryTerms registered: `seasoned-wood`, `sloyd-knife`, `push-cut`, `thumb-pivot-cut`, `pull-cut`, `stop-cut`, `strop`, `blank`

Inline tooltip check:
- `seasoned-wood` → used inline ("seasoned lime") ✓
- `sloyd-knife` → used inline (tool list entry) ✓
- `push-cut` → used inline ("blade travelling away from the body") ✓
- `thumb-pivot-cut` → used inline ("off-hand thumb on the back of the blade") ✓
- `pull-cut` → used inline ("blade moving toward the body") ✓
- `stop-cut` → used inline ("a short vertical cut into the surface") ✓
- `strop` → used inline ("strop" in the tools list paragraph) ✓
- `blank` → used inline ("What you need — wood" paragraph) ✓

All registered terms used inline; all inline tooltip marks have a corresponding registered term. Clean.

**Tent peg** — glossaryTerms registered: `green-wood`, `billet`, `riven`

Inline tooltip check:
- `green-wood` → used inline (opening paragraph) ✓
- `billet` → used inline (opening paragraph) ✓
- `riven` → used inline (variations section, "rive" with tooltip mark) ✓

All registered terms used inline. Clean.

**Terms used in tent peg body that could benefit from glossary registration but were not registered:**
- "hatchet" — named in tools but not a jargon term; no registration needed
- "coppiced" / "coppice" — a Garden-category term; a cross-category glossary link to the Garden coppicing guide is more appropriate than a wood-craft glossary definition
- "guy rope" — not woodcraft terminology; no registration needed

No used-but-unregistered issues.

---

## Hero images

**Butter knife:**
- **Accepted:** Smörkniven.jpg, Wikimedia Commons. CC0 1.0 (public domain, no attribution required). Creator: VisbyStar. A traditionally made Scandinavian wooden butter knife from Gotland juniper.
- **Species note:** Juniper is darker-grained than lime or basswood. The image shows a hand-made wooden butter knife of the right form; the species difference is visible but the construction method (hand-tool, traditional) matches the tutorial register. If Rebecca prefers a closer species match, a procedural card is the cleaner alternative until a lime or basswood butter knife photo can be found.
- **Rejected candidates:** Pexels "wooden butter knife" results are food photography props — commercially made knives used for butter dishes, not hand-carved pieces. Rejected as construction-method mismatch.

**Tent peg:**
- **Procedural card** — no hero set.
- **Candidates examined:** Wikimedia "Wooden stake holding guy rope.jpg" (public domain, 2004) — insufficient information to confirm this shows a hand-carved peg of the type the tutorial makes, rather than a rough sawn stake. Per authoring prompt: "If a strict-match photo is unobtainable, prefer a procedural card over a misleading photograph." Procedural card is the honest fallback.
- **Future source path:** Museum of English Rural Life (MERL) open-access archive likely has photographs of traditional hazel tent pegs or camping stakes. Worth a dedicated image search before the autopilot phase begins.

---

## Proposed changes to docs/wood-natural-craft-author.md

These are proposals only. Rebecca decides what to apply before the autopilot goes live.

1. **Hatchet safety in the infoPanel** — The current authoring prompt lists a standard safety block and a pyrography safety block, but no hatchet/axe variant. When a tutorial uses a hatchet or carving axe but not a drawknife or spokeshave, the chopping-block safety rule (never hold the billet during hatchet work; bystanders at twice the handle-length) is as critical as the cutting-knife rules. **Proposed addition:** a "hatchet / axe addition" note under § "Safety preamble" specifying that tutorials using any axe-class tool append the bystander and block rules to the standard block within the same infoPanel.

2. **Chopping block in recipeTools guidance** — The current authoring prompt says "Tool list keyed to master-table slugs. Where the project hinges on a specific gouge sweep, name the sweep number. Where a tool is optional, say so." But there's no guidance on environmental kit (blocks, horses, benches) that is needed for the project but typically sourced informally rather than purchased. **Proposed addition:** A note under § "Per-type body shape" step 3 (What you'll need — tools) clarifying that workholding kit (chopping block, shaving horse, side-axe block) should appear in recipeTools with `isOptional: false` and a note like "any knee-high end-grain block works; a purpose-made side-axe block is more stable" when the step depends on it.

3. **Seasoned-wood blank sourcing guidance** — The authoring prompt's sourcing notes under § "Green-wood vs seasoned-wood" are good for green-wood (coppice, windfall, tree-surgeon) but thin for seasoned-wood sourcing. First-time carvers don't know where to buy a seasoned lime blank. **Proposed addition:** Under the seasoned-wood bullet, add: "Seasoned blanks: carving suppliers (Dictum, North Star Whittling, Sculpture House) sell lime, basswood, cherry, and birch blanks specifically sized for first projects. State dimensions so the reader knows what to order."

4. **`woodState` field note** — The brief describes a `woodState` field (green | seasoned | either) but this is not in the `TutorialUploadInput` type — it lives only in the brief metadata and body prose. The authoring prompt says "Return **one JSON document** matching `TutorialUploadInput` exactly" but includes `woodState` in the brief contract without noting it's body-only (not a top-level upload field). **Proposed addition:** A clarification note in § "Input contract — the brief" that `woodState`, `recommendedSpecies`, and `finishSlug` are brief inputs that inform body prose, not upload schema fields.

5. **Image sourcing for tent pegs and utility pegs** — The MERL (Museum of English Rural Life) open-access archive is not listed in the candidate ladder. MERL has strong holdings in traditional rural craft photography including coppice tools, staked fencing, and basket-making kit. **Proposed addition:** Add MERL as a sixth-tier source in § "Image strategy": "6. **Museum of English Rural Life (MERL)** — open-access archive at merl.reading.ac.uk. Strong for traditional rural craft, coppice work, field equipment, basketry tools. Check the CC licence on each image."

---

## Validator fix required (already applied this session)

The `validateInput()` function in `packages/db/scripts/upload-tutorial-types.ts` required `crochet` or `sewing` metadata on all PATTERN rows. Wood-natural-craft PATTERN rows carry neither. The check was updated to only apply to crochet/sewing category slugs specifically. The upload script was also updated to derive `craftType` from `categorySlug` for PATTERN/TECHNIQUE rows without a sewing block — so wood tutorials land with `craftType: 'wood-natural-craft'` for the browse filter index.

This is a necessary scaffold fix; it should be noted when flipping the autopilot pipeline.
