# Homemade — Pipeline setup: Wood & natural craft

**Model:** Opus (pipeline-setup batch, per `feedback_model_choice.md`)
**Session title:** `Homemade - Pipeline setup: Wood & natural craft`

## Goal

Land everything Wood & natural craft needs before its first autopilot batch fires. After this session, `Category.pipelineStatus` for `wood-natural-craft` flips `NOT_READY → READY`, the round-robin queue picks it up automatically, and bulk authoring sessions can run with no further setup.

## Scope — in

### 1. Authoring prompt — `docs/wood-natural-craft-author.md`

Mirror `docs/tutorial-author.md` v5 and `docs/baking-author.md`. Required sections:

- **Voice rules** — factual, anti-AI per `feedback_homemade_voice.md`. Cooking-recipe-clean.
- **Sub-category weighting** — whittling + spoon carving (~30%), green-woodwork (~20%), basketry + willow weaving (~20%), seasoned-wood projects (~15%), pyrography (~10%), other (~5%).
- **Sub-categories** (registered in step 3):
  - `whittling` (knife-only projects, push cuts, pull cuts, stop cuts)
  - `spoon-carving` (green-wood, axe-to-knife progression, kolrosing finish)
  - `green-woodwork` (chairs, stools, mallets — shaving horse, drawknife, froe work)
  - `seasoned-wood` (boxes, frames, furniture small-scale, joinery basics)
  - `basketry-willow` (round + square baskets, hurdles, garden structures — includes willow weaving)
  - `pyrography` (wood burning, design transfer, shading techniques)
- **Green-wood vs seasoned-wood distinction is explicit per tutorial.** Frontmatter flag `woodState: 'green' | 'seasoned' | 'either'`. Spoon-carving = green, mallets = green, boxes = seasoned, baskets = green willow.
- **Species sourcing cross-links** — every project specifies the wood species and links to:
  - Garden (growing / coppicing tutorials for sycamore, lime, ash, hazel, willow, oak)
  - Foraging (windfall / felled-tree harvesting tutorials in Garden)
- **PD canon strong** — late-Victorian / Edwardian craft manuals, Cassell's Cyclopaedia of Mechanics, Bealer's "The Tools That Built America" (1970s — check), early-20C carpentry textbooks. Roy Underhill is post-1928 and copyrighted — reference his techniques but do not reproduce his diagrams.
- **Safety preamble (non-negotiable on every cutting tutorial)** —
  - **Grip:** four-finger grip on the work, thumb-push grip on the knife, never any cut where the blade is moving toward a body part.
  - **Cut direction:** push cuts (blade away from body), thumb-pivot cuts (controlled with off-hand thumb), pull cuts (toward body) — pull cuts only with the work braced against the chest and the blade arc unable to reach anything vital.
  - **Sharpening:** a dull tool is more dangerous than a sharp one. Strop every 15 minutes of carving, hone weekly, oilstone monthly.
  - **First-aid:** styptic / pressure / elevation. Severe cuts (visible fat, can't close with pressure) → A&E, not a plaster.
  - **Workspace:** stable seat (carving stool), good light, no children or pets within arm-and-blade reach.
- **Pyrography-specific safety** —
  - Ventilation: open window minimum, extractor fan ideal. Some woods (yew, oleander, treated lumber) release toxic fumes — explicit allowed-woods list.
  - Burner unit hot for ~15 mins after switch-off — designated cooling stand.
  - Eye protection if grinding tips.
- **Tool list is large** — see step 4. Each tutorial references tools by master-registry slug.
- **Cross-category links** — Garden (coppicing, foraging, species selection), Home & repair (joinery overlap), Sustainability (waste-wood recovery).
- **Image rubric** — finished wood items photograph well and Wikimedia + PD scans + museum open-access have abundant references. Strict on era and species — a photo of a power-tool-routed bowl isn't an acceptable illustration for a hand-carved kuksa. Procedural card preferred over misleading photo.

### 2. No chart renderer needed

Wood & natural craft tutorials use step-photos / diagrams. No symbolic chart renderer required. If a tutorial needs a specific diagram (joinery angle, fold geometry of woven willow base), use an SVG inserted as a static `Media` row with `type: ILLUSTRATION` — same as cooking process diagrams.

### 3. Taxonomy seed — `packages/db/scripts/seed-wood-natural-craft-taxonomy.ts`

- Upsert the 6 sub-categories above with parent `wood-natural-craft`.
- Idempotent, `--dry-run`.

### 4. Master tools + materials registry contribution — large batch

**Extend existing tables — do not fork.** This category contributes the biggest single tool batch yet.

- **Tools — knives:** sloyd knife, hook knife (small / medium / large), marking knife, twca cam, detail knife, chip-carving knife.
- **Tools — gouges:** swept (Nos. 3 / 5 / 7 / 9 / 11) × sizes (6mm / 12mm / 20mm / 30mm). Spoon gouges, fishtail gouges, V-tools (45° / 60° / 90°), veiners.
- **Tools — chisels:** firmer (6mm / 12mm / 19mm / 25mm), bevel-edge (same sizes), mortise (6mm / 9mm / 12mm), skew chisel.
- **Tools — axes:** carving axe (Hultafors, Gränsfors styles), splitting axe / maul, broad axe, side axe, hatchet (small).
- **Tools — drawknives, scorps, spokeshaves:** straight drawknife, curved drawknife, inshave / scorp, flat spokeshave, round-bottom spokeshave, travisher.
- **Tools — green-wood specifics:** froe, beetle / club, wedges, shaving horse, pole lathe, side-axe block, billhook (Yorkshire / Devon / Kent patterns).
- **Tools — measuring + marking:** combination square, sliding bevel, marking gauge, marking knife, dividers, calipers.
- **Tools — sharpening:** Japanese waterstones (1000 / 4000 / 8000), oilstone (combination India), strop (leather + compound), slipstones for gouges.
- **Tools — pyrography:** solid-tip burner (entry), nichrome-wire burner (intermediate), interchangeable tips (shading point, writing point, calligraphy nib, ball stylus).
- **Tools — basketry:** bodkin, rapping iron, secateurs, sharp knife, soaking trough.
- **Materials — wood species:** sycamore (spoons), lime / basswood (carving), birch (utensils, kuksa), cherry (treen), walnut (treen — note tannins reaction with iron), oak (joinery — note tannins), ash (handles, chairs), elm (chair seats), beech (mallets, tool handles), hazel (greenwood structures), willow (basketry — multiple cultivars: salix triandra, salix viminalis, salix purpurea), pine (utility), yew (carving — TOXIC dust + sap warning).
- **Materials — finishes:** food-safe (raw linseed oil, walnut oil, beeswax-and-mineral-oil board butter, pure tung oil), non-food (boiled linseed oil, Danish oil, shellac, polyurethane).
- **Materials — abrasives:** sandpaper (80 / 120 / 180 / 240 / 320 / 400 / 600 grit), card scrapers, steel wool (000 / 0000).

Each row gets the standard registry metadata. Don't pad — only register what the authoring prompt expects.

### 5. Flip pipeline status

`packages/db/scripts/flip-wood-natural-craft-ready.ts`:

```sql
UPDATE "Category" SET "pipelineStatus" = 'READY' WHERE slug = 'wood-natural-craft';
```

### 6. BUILD_PROGRESS.md entry

Append "Wood & natural craft pipeline ready" entry with commit refs + sub-categories.

## Scope — out

- **Don't author tutorials.**
- **Don't include power tools beyond what's essential** (a cordless drill is fine for hole-drilling). No table saws, no routers as primary methods — this category is the hand-tool register.
- **Don't write timber-frame house-building tutorials.** That's Home & repair.
- **Don't write upholstery / furniture restoration tutorials.** That's Home & repair.
- **Don't write basketry under Fibre arts.** Basketry is here.
- **No bushcraft survival skills** (fire-by-friction, shelter building, etc.). Bushcraft lives in Home & repair per the seed description.

## Deploy verification (mandatory)

After every push:
1. `gh run watch` and confirm CI passes.
2. Fix failures with a new commit.
3. `curl -fsS https://homemade.education/healthz` returns 200.
4. Only then report the session done.

## Hand-off style

Short plain-English summary: what landed, what the autopilot will start producing, decisions you made that I should know.
