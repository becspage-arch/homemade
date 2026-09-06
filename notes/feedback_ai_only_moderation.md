---
name: All moderation + management is AI-only — never manual editorial review
description: Hard rule. Every moderation flow (recipes, comments, designer submissions, content review, errata, anything community-generated) runs through Claude Code worker sessions. Never propose manual editorial review. Rebecca is solo and has said this many times.
type: feedback
originSessionId: 6c0cfe69-6a03-4d34-a559-3fe119b4afe7
---

**Hard rule: never propose manual editorial review. Anywhere.**

Rebecca is solo. The build is Rebecca + Claude only (per `feedback_no_hiring_yet.md`). She has reiterated this many times across many surfaces and gets frustrated when manual editorial review is proposed:

> "for the millionth time, it is just me. It needs to be all ai"

How to apply: every workflow that involves reviewing user-generated content, submitted designs, recipe uploads, errata reports, designer onboarding, photo submissions, comments, ratings, or any other community input must be designed around Claude Code worker session moderation. NEVER propose:
- "Editorial review queue Rebecca approves"
- "Manual review by an admin"
- "Trusted contributor program with human approval"
- "Spot-check by Rebecca"
- "Editorial pass before publication"

ALWAYS propose:
- "Claude Code worker session runs the moderation pass"
- "AI-assisted approval flow with config-flag tiers"
- "Auto-publish after AI moderation pass; flag low-confidence cases for a follow-up worker"
- "Trust score model that Claude evaluates per submission"

The AI moderation pattern (proven across this project):
- Spawn a Claude Code worker session per batch
- Worker reads submissions, applies voice spec + accuracy + duplicate + copyright + spam checks
- Worker auto-publishes high-confidence content
- Worker flags low-confidence content with reasoning attached
- If anything needs human attention (a true edge case), the worker writes it to project_followup_queue.md so Rebecca sees it at her convenience — not blocking the flow

This rule applies to:
- Recipe uploads (cooking + baking + herbal-medicine + natural-home)
- Designer submissions (sewing + cross-stitch + crochet + knitting + needlework patterns)
- User pattern photos (when the UserPatternPhoto submission UI lights up)
- Errata reports
- Comments + Q+A blocks
- Rating + review systems if/when added
- Any cross-craft community input

This rule does NOT apply to:
- Rebecca's own choices and direction (those are direct)
- One-off ops decisions that need a real human call (those stay with Rebecca)

When in doubt: propose AI moderation. If you're tempted to propose a human reviewer, stop and ask if Claude can do it instead. It almost always can.
