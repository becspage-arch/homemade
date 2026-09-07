---
name: Image strategy — procedural cards are FALLBACK ONLY
description: Locked image strategy across all content types — teaching content, chart heroes, finished-piece heroes, fallback cards. Procedural cards remain LAST-RESORT only.
type: feedback
originSessionId: 6c0cfe69-6a03-4d34-a559-3fe119b4afe7
---
**2026-09-06 — read this first.** Two later rules now govern heroes and this file is
background: for PATTERN crafts the hero is the loom's own deterministic render finished by
a locked creative upscale behind a fidelity gate ([[feedback_hero_must_be_exact_pattern]],
playbook Step 2a/2b); for photographic-subject heroes (cooking, baking, tutorial-led
categories) it is generate-first with Flux 1.1 Pro plus a vision gate (playbook Step 2).
Procedural-cards-are-last-resort, designer-assets-are-sacred and the teaching-diagram
sourcing chain below all still stand. ([[project_photo_accuracy_solution]] is not in
notes/; the playbook carries that method, and `[[project_master_todo]]` is not either — the running list is `todo.md`.)

**2026-06-23 UPDATE — for finished recipe/dish HEROES, generation beat stock decisively.** A strict vision pass found ~76% of cooking/baking stock heroes were wrong; the fix is generate-first (Flux Pro v1.1) + Claude vision gate, applied across cooking/baking/cross-stitch. The note below still holds for authoring-time *teaching-content* sourcing, but stock-keyword-search is no longer trusted for dish heroes.

The current image sourcing process during tutorial authoring is good and Rebecca is happy with it. Don't propose replacing it.

**Locked priority order for every tutorial's hero image:**
1. Real photos found during authoring (existing sourcing pipeline: Unsplash, Pexels, Pixabay, etc — the per-category source priority chain in `apps/web/src/lib/image-sourcing/orchestrator.ts`)
2. Public domain (Wikimedia, NLM, OBI, museum open access — embroidery, herbal, botanical etc have lots of this)
3. User-submitted photos (planned for post-launch — "add your photo" CTA after UserProject completion)
4. Editorial photography (way down the line, post-funding)
5. **Procedural cards as last-resort fallback only**

**Why:** All-procedural makes the site feel "too heavy" — too many of them in one view looks sparse and repetitive, not photographic-warm. The Netflix/Spotify register depends on real imagery dominating. Procedurals are the safety net so blank "h" letters never ship, not the default look.

**How to apply:** When designing image flows, never propose procedural-by-default for a category. Authoring-time real-photo sourcing leads. Procedural fallback fires only when the full chain (free stock → PD → AI where reliable) fails. Existing `--no-ai-fallback` flag for the retroactive sweep stays as-is. Future improvements should focus on expanding real-photo sources (Met, V&A, Smithsonian open APIs for PD-strong categories) before falling to procedural.

**STRONGER (2026-05-25):** When presenting options to Rebecca, NEVER list "use procedural cards" as a viable strategy. She has said this repeatedly and gets frustrated when it reappears. Procedural is the invisible safety net that catches a blank "h" letter at the last microsecond — it's not a strategy, not an option, not a recommendation, not even a comparison case. When stock sourcing is failing for a category, the answer is *better stock sources* (drop bad ones, add better ones, fix queries, fall to Flux AI) — never "switch to procedural cards." If procedural is the literal last-resort technical fallback after Flux also fails on a specific image, that's fine to keep in the code; just don't surface it as a decision-time option.

---

**Locked image strategy across content types (CORRECTED 2026-06-09):**

**Teaching content** — process diagrams, technique illustrations, stitch how-to images:
- Public domain primary: Antique Pattern Library, Wikimedia Commons, Internet Archive vintage publishers (Coats & Clark, Weldons, J&P Coats pre-1928), Project Gutenberg craft section, Library of Congress, university archives. The diagram research memo per category lists which sources cover which topics. Dillmont 1886 is the confirmed primary for crochet Foundations + Stitches.
- Accurate stock photos as second option only where public domain coverage fails.
- NO AI SVG generation. Quality from previous tests was unusable.
- For modern techniques not covered by vintage PD (magic ring, JAYG, ergonomics, modern blocking): ship text-only with a "process diagram pending" marker. User-submitted photos fill the gap over time. NEVER commission illustrators (no contractors — hard no per memory).

**Stitch symbol charts** — rendered from the in-house chart engine. Accurate by construction. Never AI-generated.

**Hero images of finished projects** — pattern thumbnails, library cards, completed-piece visuals:

**CRITICAL POLICY — locked in stone:**

1. **Designer-provided heroes are LAW.** If a designer provided their own hero photo, mockup, listing image, or any finished-piece visual — we USE THAT. Stitching Mama mockups (the digital chart-on-fabric-in-hoop renders) STAY. We do not retrofit them. We do not "upgrade" them. We do not run Fal img2img on them. We do not regenerate them. They are the designer's intended visual; we respect it. The only acceptable change is replacing with a user-submitted real stitched photo (post-launch, post-moderation) when one exists.

2. **House-generated heroes come from the in-house chart engine.** The chart engine has the actual chartData — it knows the exact stitches, positions, and colours. It renders X-shapes per cell (cross-stitch) or stitch shapes (crochet) at the correct colours. That render IS the hero. Saved as PNG. Done.

3. **NO Fal img2img for heroes. NO AI image generation for heroes. Ever.** This was tried 2026-06-09 against Stitching Mama mockups and produced wrong stitches plus mis-cropping. The chart engine can see the exact stitches; AI cannot. The chart engine is the only acceptable hero-rendering path for house-generated content.

4. **For crochet specifically:** the finished-piece renderer doesn't exist yet (only cross-stitch's does). It needs writing against real chartData — a software-only renderer that takes row-by-row crochet chartData and outputs the finished motif as SVG/PNG. NO Fal. NO AI. Pure rendering. This is a development task, not an image-generation task.

5. **User-submitted finished-piece photos** replace generated heroes post-launch, post-moderation. They become the gallery primary; the chart-engine render moves to gallery secondary or is retired.

**Procedural fallback cards** — remain LAST-RESORT only, never the default look. Applies regardless of category or content type.

**Worker authoring discipline:**
- Worker prompts authoring content do NOT generate images in-line. They populate `heroPrompt` placeholders.
- A dedicated image worker (refined Worker E) handles ONLY: public domain sourcing for teaching diagrams + in-house chart-engine rendering for stitch previews and pattern thumbnails.
- The image worker NEVER runs Fal img2img against designer-provided heroes. Never retrofits. Never "upgrades."
- The image worker NEVER uses AI image generation for stitch heroes of any kind.
- Idempotent on re-runs.

**Why this matters:** Rebecca has said many times — designer assets are sacred, AI cannot see stitches accurately, the software is the authority for finished-piece renders. When a worker proposes Fal img2img for heroes or retrofitting designer mockups, the answer is NO regardless of how the sample output looks. Policy over preference.

---

**UPDATE 2026-06-15 — anchored-hero policy for craft PATTERN finished-piece heroes.** Supersedes the blanket "NO Fal img2img, ever" (point 3) for THIS specific case; Rebecca approved it after seeing calibration.

- The stitch-exact in-house chart-engine render stays the source of truth AND the in-product chart AND the structural ANCHOR.
- The HERO = that render laid into a shape-aware object base (folded stole / garment flat-lay / motif), then repainted photoreal by Flux dev **img2img at strength 0.72** (img2img, not text2img — the render constrains composition, colour, motif). Vision-gated: if the photo drifts off the render, FALL BACK to the render. No unanchored AI, no procedural.
- Why consistent with the lock: the 2026-06-09 rejection was *unanchored* img2img against designer cross-stitch mockups (every X visible). Anchoring on our own faithful render, for crochet/knit at hero scale, is a different proposition. Designer-provided heroes (Stitching Mama) remain sacred and untouched. img2img only adds the photo look on top of the accurate render; it is never the stitch-exact artefact.
- New hard rule: every PATTERN-type tutorial needs a chart (`chartData`); teaching content (STITCH/READING/TECHNIQUE) does not. Pipeline: `render-pattern-hero.ts` + chart-gap QC folded into `autopilot-preflight.ts`. See BUILD_PROGRESS 2026-06-15 and [[project_master_todo]] §9 for the running gap list.
