# Homemade — Pipeline setup: Paper & word

**Model:** Opus (pipeline-setup batch, per `feedback_model_choice.md`)
**Session title:** `Homemade - Pipeline setup: Paper & word`

## Goal

Land everything Paper & word needs before its first autopilot batch fires. After this session, `Category.pipelineStatus` for `paper-word` flips `NOT_READY → READY`, the round-robin queue picks it up automatically.

## Scope — in

### 1. Authoring prompt — `docs/paper-word-author.md`

Mirror `docs/tutorial-author.md` v5 and `docs/baking-author.md`. Required sections:

- **Voice rules** — factual, anti-AI per `feedback_homemade_voice.md`. Cooking-recipe-clean.
- **Sub-category weighting** — bookbinding (~25%), calligraphy (~20%), papermaking (~15%), marbling (~10%), journalling-as-craft (~10%), papercutting (~5%), zines (~5%), scrapbooking (~5%), origami (~5%, see special note below).
- **Sub-categories** (registered in step 3):
  - `bookbinding` (Coptic, long-stitch, Japanese stab, perfect-bound, pamphlet, accordion, dos-à-dos)
  - `calligraphy` (Foundational, Roman capitals, Italic, Spencerian, Copperplate, uncial)
  - `papermaking` (cotton linter, recycled, embedded inclusions, watermarks, sized paper)
  - `marbling` (suminagashi, carrageenan, oil-on-water, paste paper)
  - `papercutting` (scherenschnitte, jianzhi, paper-cut silhouettes)
  - `journalling-craft` (bullet journal page layouts, junk journals, traveller's notebooks, page-design — NOT prompt content)
  - `zines` (folded mini-zines, perfect-bound zines, photocopy aesthetics, accordion)
  - `scrapbooking` (page layouts, ephemera, mixed-media)
  - `origami` (PD-canon models only — see special note)

- **Journalling scope split — explicit and enforced:**
  - **In scope:** the *making* of journals and journal pages. Page layouts, spreads, hand-lettered headers, sticker placement, washi-tape techniques, ephemera collage, ribbon bookmarks, signature binding.
  - **OUT of scope:** journal *prompts*, reflective questions, "what to write about" content. That is Mindset's domain. The worker must reject any draft that strays into prompt-writing.
  - The authoring prompt must call this out verbatim in a "Scope conflict warning" block.

- **Origami special note — v1 scope:**
  - **Include up to ~30 origami models in v1, ON TOP of the 800 target** for Paper & word.
  - PD-canonical models only. Sources: kindergarten-era origami books (pre-1928), e.g. Kindergarten Gifts and Occupations literature, late-Meiji Japanese origami primers in the public domain, Friedrich Fröbel folds.
  - Each origami tutorial uses a **simple fold renderer** built in step 2 (basic mountain / valley / step-by-step states only — no inside reverse, no petal fold, no advanced manoeuvres).
  - **Build plan deferred work:** "Advanced origami fold renderer (Yoshizawa-Randlett notation: inside reverse fold, outside reverse fold, petal fold, squash fold, sink, swivel) — come back after all 16 category pipelines are setup." Add to BUILD_PROGRESS.md under a "Deferred work" section. Once landed, origami catalogue can expand beyond the initial ~30.

- **PD canon for the rest of Paper & word:**
  - Bookbinding: Cockerell's "Bookbinding and the Care of Books" (1901 — PD), Cyril Davenport, William Matthews historical sources.
  - Calligraphy: Edward Johnston's "Writing & Illuminating & Lettering" (1906 — PD), Spencer's copybooks (1860s), Platt R. Spencer, traditional Roman inscriptional sources.
  - Papermaking: Dard Hunter's "Papermaking" (1943 — copyright status check; if not clear, restrict to earlier sources), Japanese washi tradition texts.
  - Marbling: 19th-century European marbling treatises (e.g. Halfer's "The Progress of the Marbling Art" 1893).
  - Papercutting: Hans Christian Andersen's scherenschnitte (PD by age), traditional Chinese jianzhi pattern books.

- **Safety preamble (per tutorial as relevant):**
  - **Cutting tools:** craft knife (X-Acto / scalpel) with cutting mat, blade-change discipline, blunt blade = danger.
  - **Marbling chemistry:** alum mordant (skin / eye), carrageenan (no respiratory hazard but slippery — wipe spills immediately), pigments (acrylic vs oil distinction, acetone for oil cleanup, ventilation for oil-based work).
  - **Bookbinding adhesives:** PVA + wheat-paste safe; rubber cement / spray adhesive need ventilation; never burn book glues.
  - **Papermaking blender / Hollander beater:** standard kitchen-equipment safety + electrical-water-mix vigilance.

- **Cross-category links:**
  - Papermaking ↔ Sustainability (recycled paper), Wood & natural craft (deckle + mould framing).
  - Bookbinding tools (awl, bone folder, needles) overlap Sewing's tool registry — register once, share.
  - Marbling carrageenan overlaps Fibre arts (felting) — share the materials registry entry.

- **Image rubric (stricter for finished items)** — match technique, era, fold-stage (for origami), binding-stitch (for books). PD calligraphy exemplars + Wikimedia + Internet Archive scans heavily favoured.

### 2. SVG renderers (two)

**(a) Calligraphy exemplar renderer — `apps/web/src/lib/chart-renderers/calligraphy-exemplar.ts`**

Each letter rendered as an SVG showing:
- Final letterform outline
- Numbered stroke order with arrows
- Optional ductus (skeletal stroke spine)
- Guide-lines (cap height, x-height, baseline, descender)

Input is a structured stroke spec per glyph. Seed the renderer with the alphabets used in v1 (Foundational lowercase, Roman capitals, Italic) — calligraphy tutorials reference glyphs by alphabet+letter.

Inline `calligraphyExemplar` ProseMirror node, admin preview at `/admin/dev/calligraphy-preview`.

**(b) Origami fold renderer — basic — `apps/web/src/lib/chart-renderers/origami-fold-basic.ts`**

V1 capability:
- 2D square (top-down view) per step
- Mountain fold (dash-dot line), valley fold (dashed line)
- Arrow showing fold direction (straight, curved)
- Step numbering
- Multi-step diagrams stacked vertically

V1 does NOT support: inside reverse, outside reverse, petal fold, squash fold, sink, swivel, 3D collapse. Those require the advanced renderer that's been deferred. Each origami tutorial declares the maximum complexity it uses; the prompt rejects any tutorial whose folds exceed v1 capability.

Inline `origamiFoldDiagram` ProseMirror node, admin preview at `/admin/dev/origami-fold-preview`.

### 3. Taxonomy seed — `packages/db/scripts/seed-paper-word-taxonomy.ts`

- Upsert the 9 sub-categories above with parent `paper-word`.
- Idempotent, `--dry-run`.

### 4. Master tools + materials registry contribution

**Extend existing tables.**

- **Materials — paper:** cartridge paper (90 / 130 / 220 gsm), watercolour paper (cold-press, hot-press, NOT), tracing paper, vellum, washi (kozo, gampi, mitsumata), bookbinding board (1.5mm / 2mm / 3mm grey board), endpaper stock, marbling alum-mordanted paper.
- **Materials — calligraphy:** sumi ink, walnut ink, iron-gall ink (modern non-corrosive formulation), gouache (for pointed-pen colour work), Higgins Eternal, Pelikan 4001, gum sandarac (paper prep).
- **Materials — adhesives:** PVA (acid-free for archival, regular for non-archival), wheat-paste (cooked at home), methyl cellulose, Japanese rice paste.
- **Materials — marbling:** carrageenan, alum potash (mordant), liquid acrylics (Higgins, Boku-undo sumi), ox-gall, turpentine + linseed oil (oil-based marbling only).
- **Materials — bookbinding thread:** linen thread (waxed), beeswax block (thread-waxing), book cloth, cotton tape (headbands).
- **Materials — origami:** kami (15cm / 20cm standard), washi, foil-backed, duo paper, banknote-size for dollar-folds.
- **Tools — cutting:** craft knife (X-Acto No.1 with No.11 blades), self-healing cutting mat (A4 / A3 / A2), metal ruler (15cm / 30cm / 60cm), guillotine (board cutter — optional), scalpel, hole punch, awl, bookbinding awl.
- **Tools — folding:** bone folder (Teflon / cattle bone), Japanese folding bone, scoring tool.
- **Tools — calligraphy:** broad-edge nibs (Mitchell Roundhand 0-6, Brause Bandzug), pointed nibs (Nikko G, Hunt 101, Gillott 303, Brause EF66), oblique pen holder, straight pen holder, brush pens, fude brush.
- **Tools — bookbinding:** sewing needles (bookbinding needles, blunt-tip), beeswax block, book press / nipping press (DIY plywood-and-bolts acceptable for home), finishing press, plough (advanced), header bands form.
- **Tools — marbling:** marbling tray (food-storage-tub size minimum), stylus (turkey-baster nibbed), comb (DIY wooden), eyedroppers.
- **Tools — papermaking:** mould + deckle (A5 / A4 / A3 sizes), couching cloths (felt or J-cloth), blender (kitchen, dedicated), press boards, sponges, vat.

### 5. Flip pipeline status

`packages/db/scripts/flip-paper-word-ready.ts`:

```sql
UPDATE "Category" SET "pipelineStatus" = 'READY' WHERE slug = 'paper-word';
```

### 6. BUILD_PROGRESS.md updates

- Append "Paper & word pipeline ready" entry with commit refs + 9 sub-categories.
- Append to a "Deferred work" section: "**Advanced origami fold renderer** — Yoshizawa-Randlett notation (inside reverse fold, outside reverse fold, petal fold, squash fold, sink, swivel, 3D collapse). Schedule after all 16 category pipelines are setup. Once landed, expand origami catalogue beyond the v1 ~30 PD-canonical models."

## Scope — out

- **Don't author tutorials.**
- **Don't write journal prompts or reflective questions.** That is Mindset. Worker rejects any draft that drifts into prompt-writing.
- **Don't build the advanced origami renderer.** Deferred to post-pipeline phase per the build plan.
- **Don't include creative writing tutorials** (novel structure, short story craft, poetry). "Word" here is letter-making + page-making + book-making, not the writing itself. If a creative-writing category becomes a thing later, it's separate.

## Deploy verification (mandatory)

After every push:
1. `gh run watch` and confirm CI passes.
2. Fix failures with a new commit.
3. `curl -fsS https://homemade.education/healthz` returns 200.
4. Smoke-test both admin preview pages.
5. Only then report the session done.

## Hand-off style

Short plain-English summary: what landed, what's deferred (advanced origami renderer especially), what the autopilot will start producing, decisions you made.
