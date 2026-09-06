---
name: premium-vs-free-canonical-access-spec
description: "The single source of truth for what is free (anonymous + free-signed-in) vs premium across Homemade, plus the per-category premium cross-reference. The premium-gate-cleanup session and the paywall (Session F) both read from this. Consolidates the free/premium brainstorm from the locked memories."
metadata: 
  node_type: memory
  type: project
  originSessionId: 3269da7d-3461-4b19-8fd5-c9b792997918
---

Canonical free-vs-premium spec. Consolidates [[feedback_free_signin_carrots]], [[feedback_premium_gate_cleanup]], [[business-model]], [[feedback_premium_philosophy]], [[feedback_premium_translation_is_free]]. Final gating confirmed in the Part B pricing session per [[feedback_premium_philosophy]]. This file is the working spec the cleanup + paywall sessions enforce.

**Checked 2026-09-06 (notes audit).** The framework this spec describes is in the tree:
`hasPremium` / `isPremiumContent` / `isIndependentDesignerContent` / `canAccessPremiumContent`
in `apps/web/src/lib/entitlements.ts`, the components in `apps/web/src/components/premium/`,
and `/premium` — which this file's older sections call unbuilt — now exists at
`apps/web/src/app/(public)/premium/page.tsx`. Stripe checkout is still unbuilt and no user
carries `premiumActive` yet (0 of 8 accounts), so nothing is actually charged. The gating
decisions below are Rebecca's locks and stand as written.

**Revised 2026-06-20** by Rebecca, two material changes from the first draft: (1) the Studio is now FREE-SIGNED-IN, not anonymous — anonymous users view content but cannot use the Studio; (2) ALL printing + downloading (any PDF/print of any content, free or premium) is PREMIUM. This overrides the older "Studio works in anonymous mode" line in [[feedback_free_signin_carrots]] and the "all paper sizes free" line in [[feedback_premium_gate_cleanup]].

## Three tiers

**1. Anonymous (no account)**
- View ALL free content in full: recipe / tutorial / pattern pages, instructions, all pattern info
- View premium content as a PREVIEW only (first part of the page), with a premium icon shown on it in search + category listings
- NO Studio, NO printing, NO downloading

**2. Free signed-in**
- Everything anonymous can view, PLUS the Studio on free content (save progress, row/round counter, notes, work through a pattern)
- PLUS the sign-in carrots: cross-device sync, saved preferences, bookmarks, "I'm making this" projects, public profile + showcase, errata loop, notifications
- Still NO printing / downloading (premium); premium content still preview-only

**3. Premium ($14.99 / £10.99 monthly; $149.99 / £109.99 annual = 2 months free; no free trial — locked 2026-06-20, see [[business-model]])**
- Full premium content: whole pattern page, pattern pieces, Studio use on premium patterns
- ALL printing + downloading — any PDF or print, of ANY content free or premium (universal premium action)
- Custom-fit grading, create-your-own generators, independent-designer patterns, creator content
- Cooking + baking: recipe scaling + meal planner + shopping list (the full planning suite)
- Send Gifts; plus the per-category personalization hooks (below)

Web-first Stripe billing to avoid app-store fees; mobile links to web checkout. Governing rule: build to free standard, free tier has to be insanely good, premium is a short list ([[feedback_premium_philosophy]]).

## Free for everyone (anonymous OR free signed-in)

- View all Homemade-generated content: every recipe, tutorial, technique, reading, and the ~1,000 patterns per category we generate
- Full pattern page for free patterns: instructions, materials, all metadata
- All region derivation: cm/inches, °C/°F/gas mark, grams/oz, UK/US convention ([[feedback_premium_translation_is_free]])
- Baking tin conversion + ingredient substitution
- Lifestyle + step photography, video walkthroughs where the pattern carries them
- Premium content is visible (preview) to everyone with a premium icon — never hidden, just gated past the preview

## Free signed-in only (the Studio + persistence — the signup carrot)

- The Studio on FREE content: counters, charts on-screen, schematics, notes, substitution, collection, gauge log, frog-to-row, markers, repeat tracker, colour save, left-handed mode, session restore, save + resume progress
- Cross-device sync of Stash, projects, preferences
- Saved preferences (UK/US, cm/inches, method, oven, weight/volume, left-handed)
- Bookmarks + "I'm making this" projects (supplies tick-list, notes, reading progress) + "Continue making" homepage strip
- Errata feedback loop (submit, track, get credited)
- Public profile + project showcase (the social layer needs an account)
- Notifications (saved pattern updates, followed-designer publishes)

Note: the Studio working on-screen for a free pattern is free-signed-in; getting that pattern as a PDF or printing it is premium.

## Premium only (locked)

- **Premium content access** — full premium pattern pages + pattern pieces (preview-gated for everyone below premium)
- **Studio on premium content**
- **All printing + downloading** — any PDF/print of any content, free or premium. Universal premium action and a hook in every category
- **Custom-fit grading** on garments (sewing, knitting, crochet) — grade between sizes to your measurements
- **"Design a pattern" — a guided AI pattern builder** (premium; built PER craft / sewing / making category; DISTINCT from the AI Assistant). The flow: the maker SHOWS a photo and/or DESCRIBES what they want → the AI explains back what it intends to build → the maker iterates with the AI until it's right → the AI builds the actual pattern (chart / pieces / instructions) for that craft. This folds the old "from a photo / from scratch / from a described idea" modes into one conversational builder. Build it for every pattern-making category (cross-stitch, crochet, knitting, needlework, sewing, and any other where a pattern is the output). It is NOT the AI Assistant (that helps you work an existing make); this CREATES a new pattern. (`PHOTO_TO_CHART` gate stays.) Plus the amigurumi shape designer.
- **Independent-designer patterns** — separate library funding the designer revenue share
- **Creator content** — permanently premium, never drifts to free; a separate library from Homemade's own
- **Cooking + baking planning suite** — recipe quantity scaling + meal planner + shopping list (tin conversion + substitution stay free)
- **Sending Gifts** — anyone can receive, only premium can send (`PUBLIC_SUBMISSION` designer-side gate also stays)
- **Your very own AI Assistant** (build item, added 2026-06-21) — a per-user AI helper that plans, adapts and troubleshoots as you make, across every category. Site-wide premium feature, not category-specific. This is the real-time AI work (Sessions M/N). On the /premium page, so it MUST be built before premium is purchasable.
- **Membership perks** — Make-a-thons + monthly content drops / seasonal collections (retention pillars, [[business-model]]), apply across all categories. On the /premium page ("Members' Make-a-thons and seasonal collections to join"), so also a build item before charging (Session B territory).

## Premium content preview model

- Premium items appear normally in search + category listings, marked with a premium icon
- The pattern/content page renders the FIRST PART to everyone (anonymous + free), then gates the rest behind premium
- Preview length is TBD — "enough to make them want it." Decide per content type in the paywall session

## Cross-category feature parity (locked 2026-06-20)

A feature CLASS that is premium in any category is premium in EVERY category. Never make a feature free in a thin category to compensate for it having less premium content. Consistency beats padding — a user who does several crafts must see the same free/premium line everywhere, or it reads as arbitrary and confusing.

So the personalization hooks below are PREMIUM in their thin categories, exactly as their equivalents (grading, create-your-own, scaling) are premium in the rich ones. Thin categories get rounded out over time by ADDING more premium features + independent-designer content, not by relaxing the line.

## Per-category premium cross-reference

Universal premium across ALL 18 categories: **creator content** + **send Gifts** + **all printing/downloading** + **Studio-on-premium-content**. The printing/download hook means every category (including the reference ones) has a concrete premium action even before any craft-specific feature. The table lists CRAFT-SPECIFIC premium on top of the universal set. All rows below are LOCKED premium (Rebecca approved all 2026-06-20).

| Category | Craft-specific premium | Depth |
|---|---|---|
| Sewing | Custom grading + hack composer; designer PDF patterns | Richest |
| Knitting | Gauge-aware grading; create-your-own; designer patterns | Rich |
| Crochet | Grading; create-your-own (amigurumi/AI/photo); designer patterns | Rich |
| Cross-stitch | Create-your-own (photo-to-chart); custom palette designer; designer patterns | Rich |
| Needlework | Create-your-own (photo-to-counted-chart); designer patterns | Rich |
| Fibre-arts | Create-your-own (weaving draft / dye calc); custom calculators; designer patterns | Rich |
| Paper-word | Create-your-own (template/SVG generator); designer patterns | Medium |
| Wood-natural-craft | Create-your-own (parametric plan to your dimensions); designer plans | Medium |
| Baking | Recipe scaling + meal planner + shopping list | Medium |
| Cooking | Recipe scaling + meal planner + shopping list | Medium |
| Mindset | Custom plan generator (free daily / paid custom) | Medium |
| Pottery-ceramics | Glaze recipe calc/scaler; kiln firing log; cone/temp tools | Medium |
| Garden | Region-personalized planting calendar + frost dates; bed planner; garden journal + reminders | Medium |
| Herbal-medicine | Dosage-by-bodyweight calc (safety-gated); remedy cabinet; printable remedy cards | Medium |
| Natural-home | Formulation scaler; printable product labels; batch/inventory tracker | Medium |
| Animals-smallholding | Flock/herd records; worming/vaccination reminders; feed/ration calculators | Medium |
| Home-repair | Material + cost calculators to your dimensions; printable cut/shopping lists; cost estimator | Medium |
| Sustainability | Home energy/carbon/water calculators; personalized swap plan; project tracker | Medium |

Pattern crafts (crochet/knitting/cross-stitch/needlework/sewing) also get a **personalised project + materials planner** (added 2026-06-21): work out how much yarn/fabric/floss a make needs, line up a project queue, track your stash. Downloadable + printable. The pattern-craft equivalent of the cooking meal-planner and the reference-category calculators; a gap spotted while building the /premium page. Premium.

**This per-category premium table IS the build checklist.** Every premium feature listed per category (planner, calculators, create-your-own, grading, etc.) is a BUILD ITEM to make during that category's premium-gate step in its sign-off (per [[playbook_category_signoff]]). Don't let any of them be page-promise-only; if it's on the /premium page or in this table, it gets built before the category is signed off.

## Premium build status + gaps (vs the /premium page, 2026-06-21)

The /premium page is the spec; every feature on it must be BUILT before premium is purchasable (no page-promise-only features). Status of the three "finished" categories + the cross-category features:

- **Cooking + baking:** category-specific premium DONE (download/print, recipe scaling, meal planner, shopping list — gate-cleanup worker). No category-specific gap.
- **Cross-stitch:** download/print, Studio-behind-login, photo-to-chart DONE. Project + materials planner DONE 2026-06-21 (live at /me/planner) — built as a SHARED, category-agnostic core (PlannerProject + PlannerStashItem keyed by (craft, patternId); a craft→materials-provider registry at `apps/web/src/lib/planner/types.ts`; cross-stitch is the first adapter reusing estimateSkeinCount). Queue/status is free signed-in; planner view + materials roll-up + stash + PDF export are premium via hasPremium. Other crafts add ONE adapter + one registry line at their sign-offs, no rearchitecting. Remaining cross-stitch: design-from-scratch + the "Design a pattern" AI builder + independent-designer library (plumbing only; designer onboarding deferred until all categories live), plus the cross-category AI Assistant + Make-a-thons.
- **Cross-category features still to build (their own sessions, NOT category sign-off steps):**
  - **The AI Assistant** (plan/adapt/troubleshoot) — real-time AI, Sessions M/N. Big build.
  - **Make-a-thons + seasonal collections** — Session B territory.
  Both are on the page, so both must be built (or trimmed from the page) before charging.
- **Every other category:** gets its full premium set built during its sign-off premium-gate step (the per-category table above is the checklist).

The reference-category trio (locked): a **calculator/planner scaled to your inputs**, **record-keeping with reminders**, and a **printable pack** — all premium, consistent with the rich-category gates. As each thin category is built out it gains more premium features; independent-designer content rounds it out further. None of these features are ever offered free to compensate for thinness (see parity rule above).

## How this gets built

- The premium-gate-cleanup session removes the wrong free-tier gates (MULTI_PATTERN_SAVE etc.) AND enforces the new lines: Studio behind free login, printing/download behind premium, premium-content preview gate.
- Each category's personalization features land as that category is built/signed off — gated premium from the start (no build-free-then-gate for these; the parity rule means the gate is known up front).
- Paywall (Session F) implements the entitlement checks + preview model + Stripe.

## Upgrade UX + the /premium page (decided 2026-06-21)

**The /premium page is conventional, not a value-stack table** (an earlier value-table draft was rejected as off-brand + clumsy). Customers expect: a monthly/annual toggle (annual shown as "2 months free", not a %), Free + Premium tier cards with Premium gently highlighted ("Most loved"), a grouped feature comparison table below the cards, a short FAQ, the guarantee. A third "Family" tier can slot in later for anchoring. Hormozi's method lives in the FRAMING (headline = the dream outcome, one calm comparison-anchor line near the price, the guarantee), NOT in a visible value table. Voice = Alice Waters / Monty Don / Erin Boyle / Nigel Slater; warm, plain, grade 6-8, no banned phrases, no dashes.

**What happens when someone clicks a premium feature (best-practice, conversion-led):**
- Anonymous OR free member clicks a PREMIUM action (print/download, scale recipe, meal planner, shopping list, photo-to-chart, designer pattern, premium content) → show the UPGRADE OFFER directly (contextual UpgradeBlock naming that specific benefit + price + guarantee + CTA to /premium / checkout). Do NOT force a sign-in first — guest checkout converts far better (forced account-before-purchase loses ~26%). Account is created at/after purchase: Stripe Checkout collects the email, the webhook provisions the premium account. Sources: guest-checkout-vs-account research 2026.
- Anonymous clicks a FREE-but-signed-in feature (the Studio, save progress, sync) → StudioAuthGate "sign in free" (this is the free-account carrot, not a paywall).
- Premium content in listings/search → PremiumBadge on the card; opening shows the opening then PreviewGate.
- /premium is the single hub everything links to; its button goes to Stripe Checkout.

## SETTLED 2026-06-30 — do NOT paywall Homemade's own patterns (any tier)

Rebecca asked whether the very top-tier (super-complex, stunning, 100+ colour) cross-stitch /
needlework patterns should be premium like independent-designer patterns. Decision after
world-class-app review: **NO.** Every Homemade-GENERATED pattern stays FREE at every complexity
tier, including the showpieces. Reasons: gating our best content out of free poisons the
"best free making library in the world" promise + kills the SEO/virality moat (showpieces are
the most-shared marketing); the proven model (Spotify/Canva/Strava) gates CAPABILITY +
convenience + paid third-party libraries, not content; designer patterns are premium for a
STRUCTURAL reason (revenue-share to a human) that does NOT apply to our zero-marginal-cost
generated catalogue; and cross-category parity would force paywalling our best recipes too
(obviously wrong). Rebecca's instinct that "the most popular should drive premium" is RIGHT —
the mechanism is the existing **print/download gate** (free to view + stitch on-screen in the
Studio; premium to print the chart / get the PDF — and a 100+ colour showpiece is exactly what
you must print to stitch), plus the tool/designer-library upsell — NOT content-gating. If we want
premium to feel more exclusive, invest in making the INDEPENDENT-DESIGNER + CREATOR libraries
spectacular; that is where "premium gets the most coveted patterns" lives. Premium stays the
locked short list above. Don't re-litigate.

(Cross-reference note, 2026-09-06: `[[business-model]]` is not in notes/; the pricing and tier locks it held are restated in this file.)
