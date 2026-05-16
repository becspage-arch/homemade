# App Store + Play Store listing

Placeholders. Rebecca writes the real copy in a separate session — see
`memory/project_ux_review_briefs.md` for the brand voice the listing has to
sit inside.

## Bundle identity (locked)

- **App name (App Store record):** Homemade Education — the bare "Homemade"
  was already taken in the App Store (see `memory/project_apple_developer.md`).
- **Display name on home screen:** Homemade
- **Bundle ID:** `education.homemade.app`
- **Build number scheme:** `${GITHUB_RUN_NUMBER}.${GITHUB_RUN_ATTEMPT}`
  (set by `.github/workflows/ios-testflight.yml`)
- **Category, iOS:** Food & Drink (primary), Lifestyle (secondary)
- **Category, Android (Play Store):** Food & Drink
- **Age rating:** 4+ (iOS) / Everyone (Android). No mature content. UGC is
  human-moderated before public display.

## Listing copy (placeholders — Rebecca to write)

### App Store

- **Subtitle (≤30 chars):** `[Rebecca to write — e.g. "Recipes, growing, mindset"]`
- **Promotional text (≤170 chars):** `[Rebecca to write]`
- **Description (≤4000 chars):** `[Rebecca to write — see brand voice rules]`
- **Keywords (≤100 chars, comma-separated):** `[Rebecca to write]`
- **What's New (release notes, ≤4000 chars):** `[Rebecca to write per release]`
- **Marketing URL:** https://homemade.education
- **Support URL:** https://homemade.education/legal/contact
- **Privacy Policy URL:** https://homemade.education/legal/privacy

### Google Play

- **Short description (≤80 chars):** `[Rebecca to write]`
- **Full description (≤4000 chars):** `[Rebecca to write]`
- **What's New (≤500 chars):** `[Rebecca to write per release]`
- **Contact email:** rebecca@homemade.education
- **Contact website:** https://homemade.education
- **Privacy policy:** https://homemade.education/legal/privacy

## Assets needed before submission

Source: brand-aligned cream + sage + Fraunces. Regenerable via
`pnpm --filter @homemade/mobile assets:source` (creates the source PNGs
under `apps/mobile/assets/`) followed by
`pnpm --filter @homemade/mobile assets:generate` (chews through them into
every platform-specific size).

- [x] App icon (1024×1024 source — `apps/mobile/assets/icon.png`)
- [x] Splash screen (2732×2732 source — `apps/mobile/assets/splash.png`)
- [x] Android adaptive icon foreground + background tiles
- [ ] Marketing screenshots, iPhone 6.7" — 5–6 frames
- [ ] Marketing screenshots, iPhone 6.1" — 5–6 frames
- [ ] Marketing screenshots, iPad 12.9" — 5–6 frames
- [ ] Marketing screenshots, Android phone — 5–6 frames
- [ ] Marketing screenshots, Android tablet — 5–6 frames
- [ ] App preview video (iOS) — 15–30s, three orientations — **deferred**
- [ ] Feature graphic for Play Store, 1024×500

The screenshot frames should cover: home rail stack, a tutorial in cooking
mode, the saved view, search, the project companion on a recipe with
ingredients ticked off.

## Privacy + data declarations

### App Store privacy nutrition label

- **Identifiers:** Clerk user id linked to the user (sign-in only).
- **Usage data:** product interactions (recipe views, bookmarks, project
  starts) collected via the self-hosted `AnalyticsEvent` table. PostHog
  also collects sessions during the dual-fire transition; this can be
  removed before submission if Rebecca prefers a clean label.
- **Diagnostics:** Sentry (errors only — PII scrubbed in the SDK config).
- **Tracking:** none across third-party apps or websites. No advertising
  identifiers requested. No IDFA prompt needed.
- **Linked to user:** identifiers, contact info (email at sign-in).
- **Not linked:** usage data, diagnostics.

### Google Play data safety form

Mirror of the above. Categories: Personal info (name, email — sign-in
only), App activity (in-app interactions, search queries — analytics).
All data collected is encrypted in transit (HTTPS via Cloudflare → AWS
ALB). Data deletion: user-initiated via `/me/data-rights` (the 30-day
grace flow already shipped in Phase 8a).

## Push notifications

- iOS: APNs via the existing Apple Developer team. Auth key (`.p8`) and
  team ID land in AWS Secrets Manager before first push dispatch.
- Android: FCM. Service account JSON in AWS Secrets Manager. Requires
  Rebecca to register the Homemade app in a Firebase project linked to
  her Google account, then connect that Firebase project to the Play
  Console listing.

Categories the user can opt into (`PUSH_CATEGORIES` in
`apps/web/src/lib/push-notifications.ts`):

- `project_schedule` — sourdough feeds, marinade timings, growing nudges
- `moderation_outcome` — your photo / review / question was approved
- `creator_application` — creator + tester programme updates
- `weekly_digest` — what's in season this week

Defaults to all four enabled when push is first turned on; users adjust in
`/me/settings`.
