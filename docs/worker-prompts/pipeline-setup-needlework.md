# Homemade — Pipeline setup: Needlework

**Model:** Opus (pipeline-setup batch, per `feedback_model_choice.md`)
**Session title:** `Homemade - Pipeline setup: Needlework`

## Goal

Land everything Needlework needs before its first autopilot batch fires. After this session, `Category.pipelineStatus` for `needlework` flips `NOT_READY → READY`, the round-robin queue picks it up automatically, and bulk authoring sessions can run with no further setup.

## Scope — in

### 1. Authoring prompt — `docs/needlework-author.md`

Mirror the structure of `docs/tutorial-author.md` v5 and `docs/baking-author.md`. Required sections:

- **Voice rules** — factual, anti-AI per `feedback_homemade_voice.md`. No "grounded, gentle, real" register. Cooking-recipe-clean.
- **Weighting** — cross-stitch ~70%, needlepoint ~15%, tatting + lacemaking ~15% combined. The autopilot batcher should hit those proportions roughly over a fortnight, not per-batch.
- **Counted vs stamped split** — counted (Aida, evenweave, linen) is canonical. Stamped (pre-printed) is beginner-track. Both paths needed.
- **PD canon — chart and pattern sources allowed:**
  - Weldon's Practical Needlework series (all volumes pre-1928)
  - Beeton's Book of Needlework (1870)
  - Therese de Dillmont's Encyclopedia of Needlework (1886)
  - Priscilla Tatting Book, Priscilla Cross-Stitch Book series (pre-1928)
  - Any other clearly-PD pattern source — confirm copyright date on Wikimedia / Project Gutenberg / Internet Archive before citing.
  - **Forbidden** — modern designer charts (Dimensions, DMC modern pattern books, Bothy Threads, Etsy designers, any post-1928 chart). Worker must reject any chart that can't be PD-sourced.
- **Floss colour conventions** — never endorse a single brand. Format: generic colour name + nearest DMC code + nearest Anchor code. e.g. "soft sage (DMC 522 / Anchor 859)". Master materials registry contribution lists every colour the pipeline encounters.
- **Fabric-count guidance** — Aida 14ct is the default beginner cloth; 16ct + 18ct + evenweave 28ct + linen 32ct covered as ability ramps up. Every project specifies fabric count, design count, and finished size in cm.
- **Safety preamble (drop into every tutorial)** —
  - Eye fatigue + lighting: daylight bulb or task lamp + magnifier loupe for fine counts (28ct+).
  - Repetitive strain: hoop/frame use for >30-minute sessions. Posture + 5-min break every 30 mins.
  - Needle storage: needle minder magnet vs pincushion, never loose on furniture (especially with kids/pets).
  - Sharp implements: embroidery scissors are surgical — keep capped, dedicated cloth-only use.
- **Cross-category links** — Sewing (finishing techniques, framing, mounting), Fibre arts (linen / evenweave fabric production, natural-dyed flosses). Each finished-project tutorial lists 2–3 linked tutorials in related categories.
- **Image rubric (stricter for finished items)** — must match the design described (chart, palette, fabric count) not just "looks like cross-stitch". A PD Weldon's illustration of the actual pattern beats a stock-photo of someone else's design. Procedural card preferred over misleading photo. Use Old Book Illustrations + Wikimedia heavily.
- **Sub-categories** — register in `seed-needlework-taxonomy.ts` (see step 3):
  - `cross-stitch` (counted, stamped, blackwork, Assisi, miniature)
  - `needlepoint` (canvaswork, bargello, petit point)
  - `tatting` (shuttle, needle)
  - `lacemaking` (bobbin lace, needle lace)

### 2. Cross-stitch chart renderer (SVG)

Extend the SVG chart-renderer infrastructure that knit/crochet established. Cross-stitch charts are structurally different:

- **Coloured square grid** (one cell per stitch). 10-stitch and 25-stitch reference lines bolder than 1-stitch lines.
- **Floss-key legend** below the chart. Each row: colour swatch · symbol (for B&W printing) · generic name · DMC ref · Anchor ref · skein count estimate.
- **Symbol fallback** for accessibility / monochrome — every colour also has a unique symbol (×, ●, ▲, ◆, …) drawn inside its grid cells so the chart is readable without colour.

Module location: `apps/web/src/lib/chart-renderers/cross-stitch.ts`. Export `renderCrossStitchChart(chart: CrossStitchChart): string` returning an SVG string. The Tutorial body uses an inline `crossStitchChart` ProseMirror node referencing a chart record (similar to how knit charts will work — match that pattern once knit/crochet has landed).

Build a minimal admin preview page at `/admin/dev/cross-stitch-preview` to render a hand-crafted test chart so we can visually verify before any autopilot uses it.

### 3. Taxonomy seed — `packages/db/scripts/seed-needlework-taxonomy.ts`

- Upsert the 4 sub-categories above with parent `needlework`.
- Idempotent (slug-keyed `upsert`), `--dry-run` flag, follows the shape of `seed-baking-taxonomy.ts`.

### 4. Master materials + tools registry contribution

**Extend the existing tables — do not fork.** The sewing pipeline laid down the craft-materials and craft-tools tables. Add to them:

- **Materials** — Aida cloth (counts 11/14/16/18), evenweave (count 25/28/32), linen (count 28/32/36/40), DMC stranded cotton (all colours encountered), Anchor stranded cotton, perle cotton (sizes 5/8/12), tatting thread (sizes 20/40/80), bobbin-lace linen thread.
- **Tools** — embroidery hoops (4"/5"/6"/8"/10"/scroll frame), tapestry needles (sizes 18/20/22/24/26/28), embroidery needles (sharps sizes 5/7/10), tatting shuttle, tatting needle (sizes 5/7), lace bobbins, lace pillow, lace pricker, needle minder magnet, embroidery scissors, magnifier loupe, daylight task lamp.

Each row carries the standard metadata (category-of-use, alternates, where to buy in UK, approximate price). Don't pad with hypothetical materials — only register what the authoring prompt actually expects to reference.

### 5. Flip pipeline status

After everything above is committed + deployed green:

```sql
UPDATE "Category" SET "pipelineStatus" = 'READY' WHERE slug = 'needlework';
```

Write this as a one-off script `packages/db/scripts/flip-needlework-ready.ts` so the operation is auditable. Run it locally against the prod DB (or via a manual `gh workflow run` if there's a pipeline-status workflow already).

### 6. BUILD_PROGRESS.md entry

Append a clear "Needlework pipeline ready" entry with date, commit refs, and the four sub-categories registered.

## Scope — out

- **Don't author tutorials.** This session is pipeline setup only. The autopilot writes the bulk.
- **Don't build a tatting / lacemaking pattern renderer.** Tatting charts are notation-heavy (e.g. "4-3-4-3 clr") and rendered fine as inline code. Lacemaking pricking diagrams are deferred to a later infrastructure session.
- **Don't touch knit / crochet renderers.** Cross-stitch is its own module.
- **No modern designer charts** under any circumstances. PD-only.
- **Don't add Needlework to the homepage rotation.** That happens automatically once `isPublicVisible` flips at 10 published tutorials.

## Deploy verification (mandatory)

After every push:
1. `gh run watch` and confirm CI passes (build, typecheck, prisma migrate deploy if any).
2. If a hook or workflow fails, fix the underlying issue and create a new commit — don't `--no-verify`, don't `--amend`.
3. `curl -fsS https://homemade.education/healthz` returns 200.
4. Smoke-test the admin chart preview page renders without error.
5. Only then report the session done.

## Hand-off style

Report back as a short plain-English summary: what landed (commits, files), what's deferred (advanced renderers), what the autopilot will start producing on its next pick of needlework, and any decisions you needed to make that I should know about. No memo, no "honestly", no jargon dump.
