---
name: give-steps-not-technical-explanations
description: "Rebecca wants actionable steps when she needs to do something, not technical explanatory notes/asides she doesn't need (flag mechanics, auth-flow internals, build-architecture caveats). Cut the \"two notes worth knowing\" explanations."
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 3269da7d-3461-4b19-8fd5-c9b792997918
---

When handing Rebecca a worker or a task, give her the STEPS she needs to take, and stop there. Don't append technical explanatory notes she didn't ask for (e.g. "it builds behind a CHECKOUT_ENABLED flag off in production", "the guest-checkout-with-Clerk flow may pause"). She said 2026-06-22: "No idea what your notes mean (don't explain, just give me the steps when required)."

**Why:** the internal build mechanics aren't useful to her; they're noise. She wants to know what to DO and when, not how the plumbing works.

**How to apply:**
- Worker prompts: fine to keep the technical detail INSIDE the worker prompt (the worker needs it). But in the chat TO Rebecca, don't summarise the technical caveats afterwards.
- Give her the action steps (do X, then send me Y) and hold.
- If a technical thing genuinely needs her decision, ask it as a plain choice, not an explanation.
- Related: [[feedback_chat_tone_no_techbro]], [[feedback_worker_handoff_style]].
