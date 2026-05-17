# Homemade — Pipeline setup: Fibre arts

**Model:** Opus (pipeline-setup batch, per `feedback_model_choice.md`)
**Session title:** `Homemade - Pipeline setup: Fibre arts`

## Goal

Land everything Fibre arts needs before its first autopilot batch fires. After this session, `Category.pipelineStatus` for `fibre-arts` flips `NOT_READY → READY`, the round-robin queue picks it up automatically, and bulk authoring sessions can run with no further setup.

## Scope — in

### 1. Authoring prompt — `docs/fibre-arts-author.md`

Mirror the structure of `docs/tutorial-author.md` v5 and `docs/baking-author.md`. Required sections:

- **Voice rules** — factual, anti-AI per `feedback_homemade_voice.md`. Cooking-recipe-clean.
- **Sub-category weighting** — felting heaviest (~30%), then spinning (~20%), weaving (~20%), dyeing (~15%), macramé (~10%), rug-making (~5%). Felting carries the bulk because it's lowest-barrier and photographs well.
- **Basketry is EXCLUDED from fibre arts.** Basketry lives in `wood-natural-craft`. The prompt must say this verbatim and forbid the autopilot from drafting any basketry tutorial under this category.
- **Sub-categories** (registered in step 3):
  - `felting` (wet felting, needle felting, nuno, hat-shaping, wet-felted vessels)
  - `spinning` (drop spindle, supported spindle, wheel — Saxony / castle / e-spinner, fibre prep: carding, combing, blending)
  - `weaving` (frame loom, rigid heddle, 4-shaft, tapestry, inkle, card weaving)
  - `natural-dyeing` (plant dyes, mineral mordants, indigo, eco-printing)
  - `macrame` (knot library, plant hangers, wall hangings)
  - `rug-making` (hooked, latch-hook, rag rugs, locker hook)
- **Weaving draft renderer (SVG)** — see step 2. Weaving tutorials reference drafts via inline `weavingDraft` node.
- **Macramé knot renderer (SVG)** — see step 2. Knot library is the foundation: start with the 10 fundamental knots (square, half-hitch L+R, lark's head, double half-hitch L+R, alternating square, gathering, overhand, figure-8, rya/ghiordes), then build projects from those.
- **Natural-dyeing cross-link rules** — every natural-dye tutorial MUST cross-link:
  - Dye-plant source tutorial in Garden (e.g. "weld for yellow" links to the Garden weld-growing tutorial)
  - Mordant safety in Herbal medicine (alum, iron, copper — heat + skin + lung-safety considerations)
- **Mordant safety preamble (drop into every dyeing tutorial)** —
  - Ventilation: dye-pot work outdoors or in a kitchen with extractor on, never in a closed bathroom.
  - Dedicated dye-pots + utensils, never returned to food use. Stainless steel or enamelled — never aluminium for iron mordant; never copper pot for non-copper mordant.
  - Gloves + apron + closed-toe shoes. Alum is the gentlest mordant; iron + copper need long gloves to mid-forearm.
  - Children + pets out of the dye-work area.
  - Wastewater disposal: alum + plant-dye baths can compost; iron + copper baths require thinking through (small home quantities are usually fine down a foul drain — never into a storm drain or stream).
- **Safety preamble (non-dyeing fibre work)** —
  - Spinning wheel: keep loose hair + clothing back from drive band + flyer.
  - Felting needles are barbed and brutal on fingers — finger guards or sponge backing.
  - Wool dust from carding/combing: damp-mop, not dry sweep.
- **PD canon for fibre arts** — late-Victorian / Edwardian weaving manuals (Hooper's "Hand-Loom Weaving"), Mary Atwater's drafts (some PD, check dates), early-20C felting manuals, plus traditional Japanese / Andean / West African pattern references where image rights allow. Modern designers off-limits.
- **Image rubric (stricter for finished items)** — fibre art finished pieces are wildly varied; an off-brand photo is worse than a procedural card. Match fibre type, technique, era, structure. Wikimedia textile collections (V&A open-access, Met open-access) heavily favoured.

### 2. SVG renderers (two)

Extend the chart-renderer infrastructure knit/crochet established:

**(a) Weaving draft renderer — `apps/web/src/lib/chart-renderers/weaving-draft.ts`**

Standard 4-block draft layout:
- Threading grid (top): warp threads × shafts (typically 4 or 8 shafts). Cells filled to indicate which shaft each warp thread passes through.
- Tie-up grid (top-right): shafts × treadles. Cells filled to indicate which shafts each treadle lifts.
- Treadling grid (right): treadles × picks (rows). Cells filled to indicate which treadle each pick uses.
- Drawdown grid (bottom-right, generated): the pattern that emerges when the three above are read together. Worker computes this from the other three.

Inline `weavingDraft` ProseMirror node, admin preview page at `/admin/dev/weaving-draft-preview`.

**(b) Macramé knot renderer — `apps/web/src/lib/chart-renderers/macrame-knot.ts`**

Each knot rendered as an SVG diagram: cords coloured/numbered, arrows showing direction of over/under, final state. Start with the 10 fundamental knots listed above. The renderer takes a structured knot-spec and outputs the diagram — sketch the type as:

```ts
interface MacrameKnotSpec {
  knotType: 'square' | 'half-hitch-left' | 'half-hitch-right' | …
  cordCount: 2 | 4
  showSteps: boolean  // multi-step diagram vs single final state
}
```

Inline `macrameKnot` ProseMirror node, same admin preview pattern.

### 3. Taxonomy seed — `packages/db/scripts/seed-fibre-arts-taxonomy.ts`

- Upsert the 6 sub-categories above with parent `fibre-arts`.
- Idempotent, `--dry-run`, follows `seed-baking-taxonomy.ts` shape.

### 4. Master materials + tools registry contribution

**Extend existing tables — do not fork.**

- **Materials** — wool roving (Merino, Romney, BFL, Shetland, Corriedale), pre-felt batt, mohair locks, alpaca top, silk hankies, linen thread (weaving warp), cotton warp, dye plants list (weld, madder, woad, indigo, walnut hulls, onion skins, oak galls, logwood — cross-ref Garden), mordants (alum potash, alum acetate, iron sulphate, copper sulphate, cream of tartar, soda ash), carrageenan (felting + marbling overlap with Paper & word), olive oil soap.
- **Tools** — drop spindle (top-whorl, bottom-whorl), supported spindle, spinning wheel (Saxony, castle, e-spinner), niddy-noddy, swift, ball winder, hand cards, drum carder, blending board, hackle, combs, frame loom, rigid heddle loom, 4-shaft floor loom, inkle loom, tapestry loom, shuttles (boat, stick, end-feed), reed, heddles, raddle, warping board / mill, felting needles (sizes 36/38/40), felting mat, palm fitter, dye-pot (dedicated), thermometer (dedicated), pH strips, gloves, apron, macramé board, T-pins.

### 5. Flip pipeline status

`packages/db/scripts/flip-fibre-arts-ready.ts`:

```sql
UPDATE "Category" SET "pipelineStatus" = 'READY' WHERE slug = 'fibre-arts';
```

### 6. BUILD_PROGRESS.md entry

Append "Fibre arts pipeline ready" entry with commit refs + the 6 sub-categories.

## Scope — out

- **Don't author tutorials** — pipeline setup only.
- **Don't build basketry tutorials or taxonomy.** Basketry is Wood & natural craft.
- **Don't build a tablet-weaving / band-weaving renderer separately** — card weaving uses the standard draft layout from the weaving renderer with a tweak. Keep it in the main renderer.
- **Don't touch knit / crochet renderers.**
- **Don't add Fibre arts to homepage rotation** — auto-flips at 10 published.

## Deploy verification (mandatory)

After every push:
1. `gh run watch` and confirm CI passes.
2. Fix failures with a new commit, never `--no-verify` / `--amend`.
3. `curl -fsS https://homemade.education/healthz` returns 200.
4. Smoke-test both admin chart preview pages.
5. Only then report the session done.

## Hand-off style

Short plain-English summary: what landed, what's deferred, what the autopilot will start producing, decisions you made that I should know.
