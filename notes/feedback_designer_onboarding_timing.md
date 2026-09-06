---
name: Independent designer onboarding — queue timing + AI-managed approach
description: Designer onboarding (Worker J + sewing S-7) fires LAST in the full-platform queue, after every craft category has its Studio + content + autopilot live. Rebecca will spec the AI-managed onboarding flow herself when the time comes.
type: feedback
originSessionId: 6c0cfe69-6a03-4d34-a559-3fe119b4afe7
---

**Lock: independent designer onboarding waits until every category is live.**

The order is: finish every craft category (cross-stitch, crochet, knitting, needlework, sewing) with Studio + content + autopilot running. Finish garden + every non-craft category. Confirm everything is humming on autopilot. THEN start designer onboarding.

Why: Rebecca personally managed and onboarded thousands of designers during the online sewing summits she ran when she owned the sewing pattern company. She has specific ideas about the contact flow, the management flow, and how much can be AI / Claude-managed. The designer-onboarding scope wants her direct input before workers spec it. Doing it early on speculation wastes design effort that doesn't match her actual model.

How to apply:
- When listing workers in queue order, Worker J (independent designer onboarding) and sewing's S-7 (sewing-specific designer onboarding) go at the BOTTOM of the queue.
- Do not recommend firing either until Rebecca confirms every category is autopilot-running.
- When Rebecca is ready to start designer onboarding, the first action is to capture her process spec verbatim into a new memory entry, the same way `project_sewing_locked_decisions.md` captured the sewing strategy memo. Then the workers fire against that spec.
- Designer-track-related schema (Pattern.designerId, Pattern.attributionText, Designer table, PatternLicense) already exists from earlier worker passes. It can sit unused until the onboarding flow lights up.

**AI / Claude-managed by default.** Rebecca wants the management overhead as low as possible — designer screening, content quality review, communication, errata coordination — all of these should run through Claude Code worker sessions wherever possible. Human-in-the-loop only for the irreducibly human bits (final approval on borderline content, dispute resolution). When the onboarding worker fires, this is the architectural starting assumption.
