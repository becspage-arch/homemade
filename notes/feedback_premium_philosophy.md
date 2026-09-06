---
name: Premium philosophy — build free, gate later
description: Don't design features as premium-only upfront. Build everything to "free" standard. Premium gating decisions come after the product is built and we can see what fits where.
type: feedback
originSessionId: adb6dccf-b7fe-4e7b-9ec0-dbae9a505a60
---
Build every feature to "free" standard from day one. Decide what's premium
later, once the whole product is built and we can see how features actually
fit together and what users care about most.

**Why:** Designing features as "premium" upfront pre-commits to a paywall
shape before we know whether the feature should sit free, paid, or hybrid.
Easier to gate something later than to build it half-formed because we
assumed it was paywalled. Also keeps the "free has to be insanely good"
rule honest — if every feature is built to free standard from the start,
we can't accidentally underbuild the free tier or build a paid feature
that should actually be free.

**How to apply:**

- Don't add `is_premium` flags, feature gates, or paywall checks when
  designing a feature. Build it for everyone.
- **Exception:** features with real per-user cost (AI generation, API
  spend) are gated by feature flag for Rebecca-as-beta-tester only,
  initially. She pays her own cost. The feature-flag boundary later
  becomes a premium boundary if/when that fits the eventual model.
- When premium thinking comes back (after build), the question is
  which existing features make sense to gate — not what to build new.

**Counter-example from earlier in the build:** in a session on
2026-05-14 the assistant proposed designing the 30-day plan generator as
a "premium feature with beta flag for Rebecca." Rebecca corrected:
"We build everything. Then we can gate things as premium later once we
see how it all fits." That's the rule.
