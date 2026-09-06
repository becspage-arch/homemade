---
name: project-crochet-diagrams
description: Locked path for Crochet Foundations process diagrams — hybrid PD-traced + in-house SVG for the modern-technique gaps. Full in-house was rejected on accuracy-confidence grounds.
metadata: 
  node_type: memory
  type: project
  originSessionId: 75347928-e149-425e-b1a3-4ce67984d601
---

Crochet Foundations process diagrams (the ~60-tutorial Foundations content batch) use a hybrid pipeline:

1. **Trace from public domain vintage sources** for the GREEN coverage topics (basics, foundation chain, slip stitch, single / double / half-treble / treble / double treble, increase, decrease basics, working in rounds with slip-stitch join, reading written patterns). Anchor sources in priority order: Project Gutenberg HTML editions (Beeton 1870, Dillmont 1886, Handbook of Wool Knitting and Crochet), Library of Congress IIIF deep-zoom (Crochet-Work Made Easy 1886, Instructions for Crochet Work 1888), Antique Pattern Library PDFs (Weldon's Practical Needlework volumes). All traced as SVG, normalised to brand line weight, drawn in warm taupe ink on transparent background.

2. **In-house SVG from scratch** for the RED gaps (magic ring, modern foundation single / double, JAYG, invisible finish, invisible decrease, invisible join, gauge swatch 10x10 cm convention, blocking methods, modern ergonomics, yarn-weight comparison chart, troubleshooting). Roughly 20 to 25 in-house SVGs.

3. **Hybrid for AMBER** — source partial vintage, complete modern frames in-house in the same style so families blend.

**Hard exclusions.** Do not use Wikimedia Commons SVG for final assets (CC-BY-SA share-alike contaminates the licence chain). Do not use mid-century Coats and Clark (post-1928 copyright risk). Do not use Free Vintage Crochet / Purple Kitty cleaned scans as source of truth; go to LoC / Gutenberg / APL originals. Do not use AI image generation for crochet diagrams (accuracy fails).

**Why hybrid not full in-house.** Rebecca chose hybrid 2026-06-09 because she lacks confidence in AI accuracy for from-scratch crochet drawings across the full ~60-diagram library. Tracing known-good vintage geometry converts the accuracy problem from "draw the right shape" (hallucination-prone) to "follow this existing shape" (mechanical). In-house SVG is limited to the modern-technique cluster where no vintage reference exists.

**2026-06-09 pivot.** Initial pilot attempting hand-written SVG paths produced incoherent scribbles. Rebecca rejected. Then approved the actual Dillmont 1886 engraving register on first sight. Plan shifted to: embed PD raster engravings directly as `<img>` (not trace to SVG, not re-colour). The Victorian engraving look IS the brand register for these diagrams.

**Asset library status.** 15 Dillmont 1886 figures downloaded to `apps/web/public/tutorial-diagrams/crochet/foundations/_sources/dillmont-1886/`. Manifest at `manifest.json` in that dir maps each figure to suggested tutorial topics + lists modern-technique gaps (magic-ring, invisible-finish, JAYG, blocking, yarn-weight chart, ergonomics). Two existing Foundations tutorials wired with image nodes: `how-to-hold-a-crochet-hook` (Fig. 403) and `how-to-work-a-treble` (Fig. 416). Worker A is still authoring more Foundations tutorials; when those land, a follow-up pass embeds the matching Dillmont figure per the manifest. For gaps the manifest lists, those topics ship without diagrams until a real reference is sourced or drawn.

**Credit pattern.** Each image's `title` attr carries: `Fig. {NNN}, Encyclopaedia of Needlework (Thérèse de Dillmont, 1886). Public domain.` Tutorial-level `sourceNotes` field also lists Dillmont alongside the existing Weldon's / Caulfeild & Saward references.

**Wire-up script.** `packages/db/scripts/wire-crochet-foundations-diagrams.ts`. Reads the Dillmont manifest, walks every Foundations tutorial JSON, embeds the matching image where the slug appears in the manifest's `suggestedTopics`, leaves unmatched tutorials alone. Idempotent (skips if image already present). Run with `pnpm --filter "@homemade/db" exec tsx scripts/wire-crochet-foundations-diagrams.ts`. Designed to run multiple times as Worker A drops more Foundations tutorials.

**Irreducible gaps (ship text-only).** Magic ring (Japanese amigurumi, 1950s-60s), invisible finish (modern), join-as-you-go (modern). No PD source exists; no Wikimedia / Flickr CC source is brand-acceptable (CC-BY-SA hobbyist phone photos clash with Dillmont engravings, and step coverage incomplete). Rebecca 2026-06-09 confirmed: ship those text-only with NO "diagrams coming soon" note. Just plain prose. Decision is final until a real solution arrives (community contributor or a future investment).

**Research dead-ends (don't re-run).** Stanford Copyright Renewal Database (CAPTCHA-blocked from WebFetch). WPA / Federal Writers Project (didn't publish craft bulletins, ever). USDA Extension Service (modern fiber-arts content is post-1990 and copyrighted). Spool Cotton "Learn How Book" 1936/1937/1941 originals are not on Internet Archive yet, and per-item Catalog of Copyright Entries verification is too slow without browser access. If future investigation, browser-based Stanford search is the highest-payoff next step.

**How to apply.** When drafting the diagram-implementation worker prompt, encode the hybrid pipeline as the spec. Coordinate with the Foundations text worker on which method each contested technique teaches (magic ring especially — three valid methods) so the diagram matches the text. Two-pass adversarial SVG verification (path-walk + spec-compare) is the accuracy gate until a community crocheter contributor materialises post-launch. Editorial pass from Rebecca catches the obvious wrongs pre-launch.

Related: [[project-content-pipeline]], [[feedback-image-strategy]], [[project-business-model]].
