---
name: feedback_no_faking_stitch_formation
description: "HARD RULE for the loom stitch engine — the yarn must be genuinely stitched (loop hooked through loop, interlock held by self-collision), never faked with pinned drawn shapes or spring joins"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: fe5bc76c-440f-4f3f-b576-4a8ab5bcb3a2
---

HARD RULE (Rebecca, 2026-06-29): the loom crochet/knit engine must **genuinely stitch the yarn** — one continuous strand folded around as a real hook lays it, each stitch physically hooking under/through the loops of the stitch below, with the interlock **held by self-collision** during relaxation. **No faking the stitch formation.**

Specifically banned (this is the §9 failure-log anti-pattern, and I had drifted back into it for dc):
- **Pinning pre-drawn stitch shapes** to a fixed grid (`w: 0` on post/head nodes) so the relaxer can't move them — that's drawing the stitch, not stitching it.
- **Spring joins** — a bare distance constraint tying a stitch to the head below (`dist.push({a: link, b: belowHead, rest: ...})`) instead of the yarn actually threading through the loop and being held by collision.

The tell that you've drifted: the structure only holds when pinned, and collapses to a braid/mesh when un-pinned. That means there are no **real linked loops** for collision to open into stitches. The fix is topological: build genuine head loops, thread each new stitch under the loop below, delete the pins and springs, and let post height/shape **relax out** of the yarn length + the interlock (a dc feeds more yarn between the same anchors than an sc, so it stands as a taller post).

Pinning the **foundation chain only** (the anchor edge) is acceptable; pinning worked stitches is not.

Related: [[project_loom_stitch_engine]], [[feedback_customer_eye_renders]], [[feedback_render_before_volume]]. See handbook `apps/web/src/lib/loom/crochet/STITCH_ENGINE.md` §9.
