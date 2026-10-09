---
name: software-only-build-no-physical-verification
description: No worker session or launch gates on Rebecca physically sewing / cooking / knitting / building anything. Software-only build through launch; initial user feedback loop is the real-world verification.
metadata: 
  node_type: memory
  type: feedback
  originSessionId: b8d36978-1f9b-43c5-85e4-c6330aebef8a
---

Software-only build. No physical hands-on tasks gate a worker session, a phase lock, or launch. Initial user feedback at launch is the real-world verification loop.

**Why:** Rebecca + Claude only. No contractors, no pattern testers, no pilot users pre-launch. Anything proposed as "Rebecca sews this up," "Rebecca cooks this recipe," "Rebecca knits this swatch," "Rebecca assembles this furniture," or any other "Rebecca's hands do the craft" step adds blocking handwork that does not fit the build model and stretches launch indefinitely. Surfaced 2026-06-10 when the freesewing validation memo proposed a Brian body-block sew-up as a pre-lock benchmark; Rebecca corrected: software only through launch, then the user feedback system catches real-world fit, taste, tension, accuracy issues.

**How to apply:** when writing worker prompts, memos, lock decisions, or hand-offs, never propose Rebecca physically does the craft as a verification gate. Pre-launch correctness verifies via code-side assertions only: deterministic outputs, schema checks, dimensional tolerance against published reference charts (CYC, ASTM, recipe-yield tables, gauge swatches, etc.). Real-world correctness verifies via the [[project_user_feedback_loop]] after launch. Applies across all categories: sewing, knitting, crochet, cross-stitch, cooking, woodworking, home repair, smallholding, mindset, needlework.

(Cross-reference note, 2026-09-06: `[[project_user_feedback_loop]]` is not in notes/.)
