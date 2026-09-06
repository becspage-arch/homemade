---
name: Premium gate cleanup across all categories
description: The existing in-product premium gates contradict the "make the whole thing amazing for everyone" rule. They need to come down across all categories in a separate dedicated step.
type: feedback
originSessionId: crochet-deep-dive-2026-06-08
---

**OVERRIDE 2026-06-20 — see [[project_premium_free_spec.md]] (canonical).**
Two changes since this was written: (1) the Studio is FREE-SIGNED-IN, not
anonymous; (2) ALL printing/downloading (any PDF/print, free or premium
content) is now PREMIUM — so the "print to A4/US Letter/A3/A0/A1 free"
line below is superseded (printing itself is the gate; CUSTOM_PAPER_SIZES
is moot). The gate-removal list (MULTI_PATTERN_SAVE, BRAND_SWAP,
FABRIC_ABOVE_18CT, PALETTE_ABOVE_24) still stands for on-screen Studio use.

The commercial model is locked. Free tier is the full product running on
Homemade-generated content. Premium tier is the things that require real
work or real spend to deliver: custom-fit grading, create-your-own
generators, and independent-designer patterns (which fund the designer
revenue share). Everything else is free for everyone.

That means the existing in-product gates in
`apps/web/src/lib/studio/premium-gates.ts` (set up for cross-stitch
Studio v1) contradict the model. Specifically the gates that need to
come down:

- `MULTI_PATTERN_SAVE` — non-premium can only save 1 pattern
- `BRAND_SWAP` — DMC ↔ Anchor ↔ Madeira reassignment
- `FABRIC_ABOVE_18CT` — high-count fabrics
- `PALETTE_ABOVE_24` — palettes over 24 colours
- `CUSTOM_PAPER_SIZES` — Letter / Legal / A3 PDF (paper sizes are
  free across the board; system picks the right default by pattern
  shape, user can override)

These restrict the free user from a fully-featured Studio for no reason
that survives the new model.

Gates that **stay premium**:

- `PHOTO_TO_CHART` — it's a create-your-own equivalent
- `PUBLIC_SUBMISSION` — designer-side feature, funds revenue share

**STATUS — phase 1 SHIPPED 2026-06-21** (deployed to main, healthz green). Implementation facts a future category-gating pass needs:
- Entitlement: `User.premiumActive` (+ nullable `premiumSince`/`premiumUntil` for Stripe). `hasPremium(user)` in `apps/web/src/lib/entitlements.ts` is THE check (pure, server+client safe). Admin user page toggles `premiumActive` for testing until Stripe (Session F) populates it.
- Framework: `apps/web/src/components/premium/` — `PremiumGate`, `PreviewGate`, `PremiumBadge`, `StudioAuthGate`, `UpgradeBlock`, `PremiumDownloadButton`, plus `PremiumProvider`/`useHasPremium` (wired in `(public)/layout.tsx`). `premium.css` holds the calm styling. Each new category reuses these.
- `lib/studio/premium-gates.ts` `STUDIO_PREMIUM_GATING_ENABLED` is intentionally LEFT FALSE — it's now the SEWING-only mechanism; do not flip it on cross-stitch's behalf. Cross-stitch enforces premium by calling `hasPremium` directly at the call site (PDF/floss-list/photo-to-chart routes + StudioShell prop), so flipping the shared flag never activates sewing's gates early. New categories should follow the same pattern: enforce with `hasPremium`, don't lean on the shared flag.
- `lib/recipes/premium-gates.ts` `RECIPE_PREMIUM_GATING_ENABLED` is now TRUE (live); callers pass real `hasPremium(user)`.
- `PremiumBadge` + `PreviewGate` are built but UNUSED — no premium content exists in the 3 finished categories yet (designer/creator content is the first premium content). Wire them when premium content lands.
- The upgrade CTA links to `/premium`, which DOES NOT EXIST yet (Session F builds the pricing/checkout page). Pre-existing dangling link; left as-is per scope.

**The work — PHASED approach decided 2026-06-20 (supersedes the single-session plan below).** Split into two:
1. **One gate-cleanup worker NOW** handles the cross-cutting gating FRAMEWORK + the three FINISHED categories (cooking, baking, cross-stitch). Framework = Studio behind a free login (auth gate, not premium), printing/downloading any PDF premium (universal), premium-content preview + premium icon in listings, and a single `isPremium` check reading a User flag (Stripe populates it later in Session F). Removes the wrong gates (multi-pattern save, brand swap, fabric>18ct, palette>24, custom paper sizes); keeps PHOTO_TO_CHART + PUBLIC_SUBMISSION. Applies correct free/premium lines to cooking/baking (recipe scaling + meal planner + shopping list premium; printing premium) and cross-stitch.
2. **Every category sign-off from here gains a premium-gate step** (see [[category-sign-off-flow-before-autopilot-resumes]]): (a) build the agreed-missing premium features for that category, (b) wire its gating on the framework. So needlework, crochet, knitting etc. each handle their own gating in their own pass — no separate sweep, no collision with in-flight Studio work.

Original single-session plan (superseded): one dedicated session that walks every category Studio and tutorial flow, identifies every gate, removes or confirms it, cross-stitch first then sweeps every other category as their Studios come online.

This is **not** part of the crochet build. It's its own session,
scheduled after the crochet build lands (so we can confirm against the
new premium model end-to-end).

The premium model summary, for the cleanup session to enforce:

- **Free for everyone:** all ~1,000 patterns we generate per category,
  full Studio (row counter, charts, schematics, notes, yarn substitution,
  hook collection, gauge log, frog-to-row, stitch markers, repeat
  tracker, colour scheme save, left-handed mode, session restore, print
  to A4 / US Letter / A3 / A0 / A1), lifestyle and step photography,
  video walkthroughs where the pattern carries them.
- **Premium:** custom grading on garments, create-your-own
  (amigurumi shape designer, AI-assisted custom pattern, photo-to-
  tapestry-grid), independent-designer patterns (when those come
  online).

Surfaced 2026-06-08 in the crochet deep-dive session.
