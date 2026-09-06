---
name: derivation-and-translation-are-free-personalization-is-premium
description: "When deciding whether a feature is free or premium, the cut is: derivation / translation / calculation that depends only on the content + a location lookup stays free. Personalization that depends on the user's saved state (their postcode, their plot, their saved schedules) can be premium. Locks the principle surfaced during garden pipeline-setup."
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 9e3f2796-3229-4df1-be4f-32eecdf38d1a
---

Locked 2026-06-10 in the garden pipeline-setup follow-up. Surfaced when reviewing the free-vs-premium split on the "Where this works best" card. The original spec gave free users a friendly disclaimer ("Best for UK + Northern Europe. Not in the UK? Here's how to adjust your timing.") and premium users silent month translation against their location. That was backwards.

## The rule

There are two tiers of region-aware functionality:

1. **Derivation / translation / calculation — FREE.** Anything that depends only on the content + the user's coarse location (country, hemisphere, climate zone) stays free. Month translation, hardiness zone matching, frost-sensitivity warnings, hemisphere flips, unit conversions, currency conversions. The data to compute these is already on the content row + the country lookup; no per-user state needed.

2. **Personalization — can be premium.** Anything that depends on the user's saved per-user state (their postcode, their plot, their saved schedules, their planting history) is fair game for premium. Postcode-specific frost dates, saved plot layout, personalized planting reminders, sow-now alerts against your actual sown dates, "you're in week 4 of growing tomatoes" daily check-ins.

## Why

A user in Sydney reading a March-sowing tomato guide that doesn't translate to September is broken — it's not a "premium feature," it's basic usability. The locked memory [[feedback_premium_philosophy]] says build everything to "free" standard from the start. Coarse location-aware translation IS the free standard for any region-aware content.

The free / premium cut should follow what costs real work or real spend to deliver, not what feels valuable. Translation is content-derived and cheap. Personalization requires per-user state, profile management, and (for postcode lookup) a paid weather/frost-date API at scale — that's where the cost is.

Same shape as [[feedback_free_signin_carrots]]: server-side persistence is signed-in-only but not paywalled. Translation is anonymous-friendly and definitely not paywalled.

## How to apply

- **Region-aware content (garden, herbal, anything seasonal):** translate at render time for everyone. Don't hide month translation behind a paywall. Don't show a friendly disclaimer to free users while premium gets silent translation — that's the worst of both shapes (free users get a worse experience and premium users get a feature that should be a baseline).
- **Personalised reminders / schedules / alerts:** can be premium. These depend on saved per-user state.
- **Coarse location detection:** free. IP-based country / hemisphere lookup is fine to use for everyone.
- **Postcode / fine-grained location:** can be premium. Postcode-to-frost-date involves an external API at scale.

## Worked examples

- "This March-sowing tomato guide translates to September for Southern Hemisphere readers" — FREE.
- "Best for UK + Northern Europe; here's how to adjust your timing" disclaimer that doesn't actually translate — wrong shape; do the translation instead.
- "Sow now: your saved Manchester postcode shows last frost was 12 May" — premium fair game (per-user saved postcode).
- "Hardy in your USDA zone 8 (auto-detected from your country): yes" — FREE (coarse location, no saved state).
- "Reminder: your sown tomatoes should be hardening off this week" — premium fair game (saved sown date).

## Counter-example fixed in the principle

In the garden pipeline-setup brief 2026-06-10, the original spec said: "Free users get a friendly card ('Best for UK + Northern Europe. Not in the UK? Here's how to adjust your timing.'); premium users get silent customisation (month auto-translation, frost-date warnings against their location)."

That gave free users a worse experience than not gating the translation at all (a disclaimer instead of the actual help), while paywalling something cheap to deliver. Corrected: translation goes everywhere; postcode-personalized frost alerts are the premium offer.
