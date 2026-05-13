# Analytics taxonomy

The canonical event catalogue for Homemade. Pairs with the standing brief
in `memory/project_analytics_strategy.md` (Berkowski's *How to Build a
Billion Dollar App* framing: wire every plausibly-useful event from day
one because historical event data cannot be reconstructed).

This document is the contract between code that fires events and the
PostHog dashboards Rebecca builds on top. **Whenever a new event is
added, update this file in the same commit.**

---

## Naming conventions

- **Event names:** `snake_case`, verb_object or noun_verb (`tutorial_viewed`,
  `creator_application_submitted`). Past tense for "happened" events;
  present for derived states (`activated`).
- **Property names:** `camelCase` (`cohortWeek`, `acquisitionChannel`,
  `tutorialId`). Booleans prefixed `is` (`isFirst`).
- **Distinct IDs:** Clerk userId for identified users, `anon:<stable-id>`
  for anonymous (slug pair on tutorial pages, etc.).
- **Client vs server:** server-side for lifecycle / moderation / DB-write
  events (can't be ad-blocked, fires reliably). Client-side for
  engagement signals (scroll depth, form abandonment, share clicks).
  Both paths flow into the same PostHog project.
- **Standard properties on every event:** `cohortWeek`,
  `acquisitionChannel`. Set automatically by `identify()` so events
  inherit them via PostHog person properties.

## Adding new events

1. Pick a name from the catalogue below if one already exists. Don't
   duplicate.
2. Wire it in the natural code path (server action / API route / client
   handler). Use `captureServerEvent` server-side or
   `captureClientEvent` client-side.
3. Add it to this file under the right section with property list +
   one-line "when it fires."
4. If it adds a property to `User`, add the schema migration and the
   `identifyServerUser` call so PostHog sees the property.
5. If you add a new acquisition / activation event, double-check it's
   wired into the relevant funnel below.

---

## Events

### Acquisition

| Event | Fires when | Properties |
|---|---|---|
| `acquisition_captured` | First visit, after UTM + referrer parse. Client-side. | `utmSource`, `utmMedium`, `utmCampaign`, `utmContent`, `utmTerm`, `referrer`, `landingPath`, `acquisitionChannel`, `deviceClass` |
| `landing_page_viewed` | Pageview on first session entry (one per session). | `path`, `acquisitionChannel`, `deviceClass`, `country` |

Acquisition data is also persisted on the User row at first signup
(see "User properties" below), so funnel queries can join cohort →
channel without scanning event history.

### Activation

| Event | Fires when | Properties |
|---|---|---|
| `signup_completed` | Clerk `user.created` webhook handled. Server-side. | `role`, `acquisitionChannel`, `cohortWeek` |
| `signin_completed` | Identified session detected client-side (deduped per browser session via sessionStorage). | `clerkId` |
| `signout_completed` | Clerk sign-out event in `posthog-provider.tsx`. | — |
| `first_bookmark` | `toggleBookmark` creates a bookmark AND user has no prior bookmarks. Server-side, `isFirst: true`. | `tutorialId`, `isFirst` |
| `first_project_started` | `startProject` creates a UserProject AND user has no prior projects. | `tutorialId`, `projectId`, `isFirst` |
| `first_project_completed` | `markProjectComplete` AND user has no prior COMPLETED projects. | `tutorialId`, `projectId`, `isFirst` |
| `first_review_submitted` | `submitReview` AND user has no prior reviews. | `tutorialId`, `reviewId`, `isFirst` |
| `first_photo_uploaded` | `submitUgcPhoto` AND user has no prior photos. | `tutorialId`, `photoId`, `isFirst` |
| `activated` | Derived: user has signup + first bookmark + first started project within 7 days. Computed in PostHog dashboards from the events above; **not fired from code** (kept here so the dashboard query knows the canonical definition). | — |

`first_*` events are pragmatic — they carry `isFirst: true` and PostHog
filters in dashboards. We don't read-back person properties to gate
them; instead the firing path checks "is this the first one in the
database?" before firing.

### Engagement

| Event | Fires when | Properties |
|---|---|---|
| `$pageview` | App-Router pathname change (auto by `posthog-provider.tsx`). | `$current_url` |
| `$pageleave` | Tab close / navigation away (auto, `capture_pageleave: true`). | — |
| `tutorial_viewed` | Public tutorial page render. Server-side. | `tutorialId`, `tutorialType` (`RECIPE` / `TECHNIQUE`), `categorySlug`, `tutorialSlug`, `authorId`, `creatorId?`, `cuisine?`, `mealType?`, `difficulty`, `season`, `wordCount`, `identified` |
| `ingredients_scaled` | Client-side scale-selector click on the structured ingredients block. Fires once per change. | `tutorialId`, `tutorialSlug`, `fromScale` (e.g. `1×`), `toScale` (e.g. `2×` or `8 servings`) |
| `ingredient_created_inline` | Admin author created a new master `Ingredient` row from the editor's "+ create new" modal. Server-side, fires from `createIngredientFromEditor`. | `ingredientSlug`, `category` |
| `tutorial_scroll_depth` | 25 / 50 / 75 / 100% scroll on a tutorial page. Client-side, deduped per page load via component state. | `tutorialId`, `percent` |
| `tutorial_completed` | `markProjectComplete`. Server-side. | `tutorialId`, `projectId`, `timeToCompleteMinutes?` (derived from startedAt → completedAt) |
| `tutorial_shared` | Client-side share button click. Fires once per chosen destination — native sheet, copy link, or one of the per-network buttons. | `tutorialId`, `tutorialSlug`, `categorySlug`, `destination` (`native` / `copy_link` / `twitter` / `pinterest` / `facebook` / `email`) |
| `tutorial_bookmarked` / `tutorial_unbookmarked` | `toggleBookmark`. | `tutorialId` |
| `feature_used` | Generic feature-reach event. Fired at most once per user per feature per day (sessionStorage-deduped on client). | `feature` (`bookmarks` / `projects` / `search` / `reviews` / `qa` / `pattern_testing` / `beginner_mode` / `share`) |

### Search behaviour

| Event | Fires when | Properties |
|---|---|---|
| `search_query` | Public `/search` server render. Server-side. | `query`, `resultCount`, `filters`, `zeroResult`, `categoryFilter?`, `difficultyFilter?`, `seasonFilter?` |
| `search_result_clicked` | Click on a `TutorialCard` from `/search`. Client-side, fires on capture before navigation. | `query`, `filters` (`{category, difficulty, season}`), `position` (0-indexed), `tutorialId`, `tutorialSlug`, `categorySlug`, `totalResults` |
| `search_no_results_then_left` | Last interaction of a session is a zero-result `search_query`. Derived in PostHog dashboards from `search_query` + `$pageleave` sequence. | — |

### Content performance

| Event | Fires when | Properties |
|---|---|---|
| `tutorial_published_scheduled` | Inngest cron publishes a scheduled tutorial. | `tutorialId`, `wasScheduled: true` |
| `tutorial_completion_rate` | Derived in PostHog: `tutorial_completed` / `tutorial_started` per tutorial. Not fired. | — |

`tutorial_viewed` carries the metadata; PostHog dashboards aggregate
view / bookmark / completion / review counts per tutorial.

### Creator program

| Event | Fires when | Properties |
|---|---|---|
| `creator_application_started` | `/me/creator/apply` page first render (per session). Client-side. | — |
| `creator_application_submitted` | `submitCreatorApplication` succeeds. Server-side. | `specialty` |
| `creator_application_approved` | `decideCreatorApplication(APPROVE)`. Server-side. | `creatorUserId` |
| `creator_application_rejected` | `decideCreatorApplication(REJECT)`. Server-side. | `creatorUserId`, `hasReason: boolean` (reason itself omitted for privacy) |
| `creator_tutorial_drafted` | `createTutorial` from `/me/creator/tutorials/new`. Server-side. | `tutorialId` |
| `creator_tutorial_submitted_for_review` | `submitCreatorTutorialForModeration`. Server-side. | `tutorialId` |
| `creator_tutorial_approved` | `moderateCreatorTutorial(PUBLISH)`. Server-side. | `tutorialId`, `creatorUserId` |
| `creator_tutorial_returned_for_edits` | `moderateCreatorTutorial(SEND_BACK)`. Server-side. | `tutorialId`, `creatorUserId` |
| `creator_first_publish` | First `creator_tutorial_approved` per creator. Server-side, `isFirst: true`. | `tutorialId`, `creatorUserId` |
| `creator_profile_viewed` | `/makers/[handle]` page render. Server-side. | `creatorUserId`, `handle` |
| `creator_status_revoked` | `revokeCreatorStatus`. Server-side. | `creatorUserId` |

### Pattern testing

| Event | Fires when | Properties |
|---|---|---|
| `pattern_test_created` | `createPatternTest`. | `patternTestId`, `tutorialId` |
| `pattern_test_recruiting_opened` | `transitionPatternTestStatus → RECRUITING`. | `patternTestId` |
| `pattern_test_application_submitted` | `applyToPatternTest`. | `patternTestId`, `tutorialId` |
| `pattern_test_application_accepted` | `decideTestApplicant(ACCEPT)`. | `assignmentId`, `patternTestId` |
| `pattern_test_application_rejected` | `decideTestApplicant(REJECT)`. | `assignmentId`, `patternTestId`, `hasReason` |
| `pattern_test_started` | `startTestAssignment`. | `assignmentId`, `patternTestId` |
| `pattern_test_feedback_submitted` | `submitTestFeedback`. | `assignmentId`, `patternTestId`, `timeTakenMinutes?` |
| `pattern_test_withdrawn` | `withdrawTestAssignment`. | `assignmentId`, `patternTestId` |
| `pattern_test_completed` | `transitionPatternTestStatus → COMPLETED`. | `patternTestId` |

### Project lifecycle (user-side)

| Event | Fires when | Properties |
|---|---|---|
| `tutorial_started` | `startProject`. Server-side. | `tutorialId`, `projectId`, `resumed` |
| `project_progress_updated` | `updateReadingProgress`. Server-side. Rate-limited: max once per 30s per project (caller-side throttle in the client). | `projectId`, `tutorialId`, `percent` |
| `project_abandoned` | `abandonProject`. Server-side. | `projectId`, `tutorialId` |
| `project_notes_updated` | `updateProjectNotes`. Rate-limited: max once per 60s per project. | `projectId` |
| `project_supplies_checked` | `toggleSupplyChecked`. Atomic per item. | `projectId`, `checked` |
| `beginner_mode_toggled` | `updateBeginnerMode`. | `value` |

### Cookie consent

| Event | Fires when | Properties |
|---|---|---|
| `consent_banner_shown` | Banner mounts open. Client-side, deduped per page load. | `reason` (`first_visit` / `version_bump` / `reopen`) |
| `consent_accepted_all` | "Accept all" tapped. | — |
| `consent_necessary_only` | "Necessary only" tapped. | — |
| `consent_customized` | "Save preferences" tapped from customise view. | `analytics`, `errorMonitoring` |
| `consent_preferences_changed` | Subsequent banner answer that differs from the stored prefs. | `analyticsBefore`, `analyticsAfter`, `errorMonitoringBefore`, `errorMonitoringAfter` |

Consent events fire **before** analytics opt-in/opt-out so the
banner-decision events themselves are always captured (they're
considered necessary instrumentation of the legal flow, not optional
analytics).

### Account lifecycle

| Event | Fires when | Properties |
|---|---|---|
| `account_data_export_requested` | `requestDataExport` creates a PROCESSING row. | `requestId` |
| `account_data_export_downloaded` | Signed-URL "Download bundle" link click in `/me/data-rights`. Client-side. | `requestId`, `bytes`, `generatedAt` |
| `account_deletion_scheduled` | `scheduleAccountDeletion`. | `scheduledFor` (ISO) |
| `account_deletion_cancelled` | `cancelAccountDeletion`. | — |
| `account_deletion_completed` | Hard-delete Inngest cron fires this for each successful per-user delete, server-side, with the user's Clerk id as the distinctId so it stitches onto the deleted profile. | `userId`, `daysScheduledFor` (30), `requestedAt` (ISO), `completedAt` (ISO), `reason` (nullable, free-text from the deletion request) |

### Friction / error

| Event | Fires when | Properties |
|---|---|---|
| `form_abandoned` | Client-side: any signup / multi-step form where the user opens it, interacts with a field, and navigates away without submitting. Fired on `pagehide`. | `formId` |
| `rate_limit_hit` | `checkRateLimit` returns `allowed: false` in any of the UGC server actions. Server-side. | `bucket`, `tutorialId?` |
| `nsfw_auto_rejected` | `submitUgcPhoto` decision is `auto-reject`. Server-side. | `tutorialId`, `photoId`, `score` |
| `payment_failed` | Phase 7 / 8 placeholder — no firing path yet. | (TBD) |
| `error_boundary_triggered` | React error boundary catches a render error in the `(public)` route group (root + tutorial-scoped boundaries). Client-side. Also reported to Sentry via `Sentry.captureException`. | `path`, `errorName`, `errorMessage` (truncated to 120 chars), `digest` (Next.js error digest, nullable), `scope` (`tutorial` for the per-tutorial boundary, omitted for the root one) |

### Moderation outcomes (existing)

Already wired by Phase 5 / services-activation; properties expanded here.

| Event | Properties |
|---|---|
| `review_submitted` | `tutorialId`, `rating` |
| `review_published` | `reviewId`, `tutorialId` |
| `photo_uploaded` | `tutorialId`, `photoId`, `status` |
| `photo_approved` / `photo_rejected` | `photoId`, `tutorialId` |
| `question_asked` | `tutorialId` |
| `question_answered` | `questionId`, `isAuthorAnswer` |
| `errata_submitted` | `tutorialId` |

---

## User properties

Set via `identifyServerUser` on every authenticated server request
(cached per session in cookies — see `lib/identify.ts`). Set from the
Clerk webhook on `user.created`.

### Identity
- `userId` — Prisma User.id
- `clerkId` — Clerk user id (also the distinctId for events)
- `email` — **hashed** (`sha256(email)` first 16 hex chars) for PII
  safety. Raw email is *not* sent to PostHog. Decided 2026-05-12.
- `displayHandle`
- `name`
- `role` — `MEMBER` / `CREATOR` / `EDITOR` / `ADMIN`
- `isCreator`, `creatorVerified`, `isPatternTester`, `isSuspended`
- `beginnerMode`

### Cohort + acquisition (set once, never updated)
- `signupCohortWeek` — ISO week `YYYY-Www`
- `acquisitionChannel` — `organic` / `direct` / `paid_search` / `paid_social` / `social` / `referral` / `email` / `unknown`
- `utmSource`, `utmMedium`, `utmCampaign`, `utmContent`, `utmTerm`
- `country` — ISO 3166-1 alpha-2 from Cloudflare `CF-IPCountry` header
- `deviceClass` — `mobile` / `tablet` / `desktop` (UA-sniffed at signup)
- `firstSeenAt` — ISO timestamp of first visit / signup

### Subscription (Phase 7 / 8 placeholder)
- `subscriptionTier` — left `null` until premium ships

---

## Funnels

Named funnels for PostHog. Build these as Funnel insights in the
dashboard; the event names below are the steps in order.

### Signup funnel
`landing_page_viewed → signup_completed → first_bookmark` _(first
bookmark used as a proxy for "showed interest beyond signup")_

### Activation funnel
`signup_completed → first_project_started → first_project_completed`

### Content funnel
`tutorial_viewed → (tutorial_bookmarked OR tutorial_started) → tutorial_completed → review_submitted`

### Creator funnel
`creator_application_started → creator_application_submitted → creator_application_approved → creator_tutorial_drafted → creator_tutorial_submitted_for_review → creator_tutorial_approved → creator_first_publish`

### Pattern test funnel — creator side
`pattern_test_created → pattern_test_recruiting_opened → (assignments fill, derived) → pattern_test_completed`

### Pattern test funnel — tester side
`pattern_test_application_submitted → pattern_test_application_accepted → pattern_test_started → pattern_test_feedback_submitted`

### Deletion funnel
`account_deletion_scheduled → ⚠ if cancelled within 30 days, drop out → account_deletion_completed`

---

## Dashboards (to build in PostHog UI)

For Rebecca to wire in the PostHog dashboard. Each maps onto events
above.

1. **D1 / D7 / D30 retention by cohort week.** Retention insight on
   `$pageview` or `signin_completed`, broken down by
   `signupCohortWeek`. Tells us whether onboarding changes are moving
   the curve.
2. **Activation funnel conversion.** Funnel insight on the Activation
   funnel above, broken down by `acquisitionChannel`. Shows which
   acquisition sources actually activate.
3. **Tutorial performance leaderboard.** Table view on
   `tutorial_viewed`, with derived columns for bookmark rate
   (`tutorial_bookmarked` / `tutorial_viewed`), completion rate
   (`tutorial_completed` / `tutorial_started`), and review rate
   (`review_submitted` / `tutorial_completed`). Sort by views or by
   completion rate.
4. **Search zero-results report.** Trend / table on `search_query` with
   `zeroResult: true`, top queries by volume. Content-gap dashboard —
   tells us what readers ask for that we don't have.
5. **Creator funnel.** Funnel insight on the Creator funnel above.
6. **Pattern test fill rate.** Per pattern test, `accepted_assignments
   / max_testers`. Custom SQL insight (PostHog SQL) joining
   `pattern_test_created` events to the assignment events.
7. **Cookie consent acceptance breakdown.** Pie of `consent_accepted_all`
   vs `consent_necessary_only` vs `consent_customized`. Useful for
   estimating the proportion of users we have analytics on.
8. **Error boundary trigger trend.** Time series on
   `error_boundary_triggered` grouped by `path`. Pairs with Sentry but
   tells us which routes are most fragile from the user's perspective.

---

## Where things live in code

- **PostHog server client:** `apps/web/src/lib/posthog.ts` —
  `captureServerEvent`, `identifyServerUser`, `flushPostHog`.
- **PostHog client provider:** `apps/web/src/components/posthog-provider.tsx`.
- **Acquisition capture:** `apps/web/src/lib/acquisition.ts` (channel
  derivation) + `apps/web/src/components/acquisition-tracker.tsx`
  (client component mounted in the root layout) +
  `apps/web/src/app/api/webhooks/clerk/route.ts` (persists captured
  data on `user.created`).
- **Cohort week helper:** `apps/web/src/lib/cohort.ts`.
- **Identify helper:** `apps/web/src/lib/identify.ts` — call from the
  `(public)/me` and `/admin` layouts.
- **Client capture wrapper:** `apps/web/src/lib/client-analytics.ts`
  — thin `posthog.capture` wrapper that respects consent + adds
  standard props.

---

## Things deliberately left out

- **Personally identifiable text in event properties.** Review bodies,
  question bodies, photo captions, rejection reasons — none of those go
  into events. We store IDs and let dashboards join back to Prisma.
- **Raw email in person properties.** Hashed only — see User properties
  above.
- **Direct PostHog dashboard configuration.** Dashboards live in
  PostHog's UI; this doc describes which to build, but the build is
  Rebecca's pass.
- **Auto-capture.** Disabled in the client provider
  (`autocapture: false`). We fire events explicitly because untargeted
  click capture creates noise and burns event budget.
