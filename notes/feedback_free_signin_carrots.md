---
name: free-tier-sign-in-carrots-sync-is-free-not-premium
description: "Server-side cross-device sync, multi-device project progress, and saved preferences are reasons a free user signs in. They are NOT behind the paywall. Anonymous use stays full-featured locally; sign-in unlocks persistence and cross-device. Premium is reserved for things that take real work or real spend to deliver."
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 8c388de1-e20d-4a69-99a1-a2c7fa389b60
---

Locked 2026-06-09 in the knitting deep-dive session. Surfaced when
Rebecca said server-side sync should not be premium because free
users need reasons to log in, and seeing progress on multiple
devices is one of them.

**OVERRIDE 2026-06-20 — see [[project/project_premium_free_spec]] (canonical).**
The "Studio works in anonymous mode" rule below was reversed: the Studio
is now FREE-SIGNED-IN, not anonymous. Anonymous users VIEW free content
(full pattern pages, instructions, all info) but cannot use the Studio,
save progress, print, or download. The Studio itself is now the primary
signup carrot. Also: all printing/downloading is premium. The sync /
prefs / projects carrots below still hold.

## The rule

There are three tiers of access:

1. **Anonymous (no account):** full Studio works locally on the
   device. Row counter, charts, schematics, notes — all functional
   in browser storage. Sign-in is offered as a reason to persist,
   not a wall to use the product.
2. **Free signed-in:** everything in anonymous + server-side
   persistence + cross-device sync + saved preferences + Stash
   continuity. This is the carrot that gets people to sign in.
3. **Premium:** the small set of features that take real work or
   real spend to deliver. See [[feedback_premium_gate_cleanup]] for
   the locked list (custom grading, create-your-own generators,
   independent-designer patterns).

## Sign-in carrots (free signed-in features)

These are the reasons a free user creates an account. None of them
are paywalled:

- **Server-side cross-device sync** of Stash, projects, and
  preferences. Start a pattern on the tablet at home, continue on
  the phone at work.
- **Multi-device project progress.** Row counter state, notes per
  row, completed pieces, project phase all sync.
- **Saved preferences:** UK / US convention, cm / inches, method
  (magic loop / DPN / two-circs), oven preference, weight + volume
  preference, left-handed mode.
- **Stash continuity** across devices and sessions.
- **Errata feedback loop** — only signed-in users can submit
  errata, see their submission status, get credited.
- **Public profile + project showcase** — the social layer requires
  an account because it's social.
- **Notifications** when a saved pattern updates or when a designer
  the user follows publishes new work.

## Why this matters for product design

- **Don't paywall persistence.** A feature being signed-in-only is
  a different thing from being premium-only. Server-side
  persistence is universally signed-in; that doesn't make it
  premium.
- **Don't lock features behind sign-in that genuinely work
  locally.** The row counter works in anonymous mode. The Studio
  works in anonymous mode. Sign-in is a continuity offer.
- **Premium gates list stays small.** Per
  [[feedback_premium_gate_cleanup]], premium is reserved for
  custom grading, create-your-own generators, and independent-
  designer patterns. Server-side sync is NOT on that list.

## How to apply when designing a Studio

- Anonymous flow: full Studio with local storage.
- Sign-in upsell moment: "Want this on your phone too? Sign in
  free to sync." Warm, not pushy.
- Sign-in does not unlock new functionality; it unlocks the
  functionality already working being persistent and cross-device.
