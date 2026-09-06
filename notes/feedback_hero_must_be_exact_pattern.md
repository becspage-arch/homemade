---
name: feedback_hero_must_be_exact_pattern
description: "Pattern hero images must depict EXACTLY what the customer will make — no AI drift. AI may only finish a locked deterministic render, gated by a fidelity check."
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 7f6dc8d7-63eb-4e5b-9d5f-92764139c08d
---

For pattern crafts (embroidery, cross-stitch, crochet, knitting, sewing — anything a customer makes), the hero image is a **promise**: "stitch this and you get THIS." It must depict the EXACT pattern — same shapes, placement, stitch types, colours.

**Why:** a maker may spend months on a piece and compare the finished result to the hero. If the hero was an AI reinterpretation that drifted from the actual pattern, they'd be devastated and rightly feel misled. Integrity of this promise is non-negotiable.

**How to apply:** AI may NOT freely generate or reinterpret a pattern hero. The allowed pipeline (proven 2026-06-24, see [[project_loom_engine_build_state]]) is: deterministic loom render = the exact geometry → photoreal Blender base → a LOCKED creative-upscale finish that adds thread texture but cannot move/recolour anything → an automatic Claude-vision FIDELITY GATE that rejects+redoes any output that drifted from the deterministic base. Plain img2img drifts the design → banned for heroes. This refines the old blanket "img2img rejected" ([[image_strategy]], [[photo_accuracy_solution]]): AI-as-locked-finisher-with-verification is allowed; AI-as-free-generator is not. Contrast with photographic-SUBJECT heroes (cooking/baking), where generate-first is fine because there's no exact artifact the customer reproduces.
