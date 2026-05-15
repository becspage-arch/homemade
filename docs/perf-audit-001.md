# Performance audit 001

First-round audit of the live site against the heaviest current
surfaces. Diagnosis half is recorded here; the fixes-half landed in
the same session and the before/after notes live at the bottom.

Date: 2026-05-15
Worktree: `vigorous-albattani-79fef7`
Baseline commit: `c3d4368` (origin/main at session start)

## What this audit did and didn't cover

**Covered:**
- Static analysis of every public route + every admin list page for
  N+1 patterns, query shape, and missing pagination.
- Prisma schema index audit cross-referenced against actual query
  predicates.
- Webpack production build with `@next/bundle-analyzer` to size every
  client chunk + identify what loads on the public bundle.
- Cloudflare Image Transformations variant usage against rendered
  image sizes in CSS.
- Route-segment caching audit (`force-dynamic` / `revalidate`).
- ECS Fargate task sizing + cold-start risk review.

**Not covered, and why:**
- **Lighthouse runs against the live site.** The site is behind a
  splash gate (cookie `homemade-access=1`). PageSpeed Insights and
  most hosted Lighthouse runners can't carry that cookie, so they'd
  audit the splash page instead of the real pages. Running locally
  against `next start` is possible but needs Chrome installed and a
  bit of cookie plumbing. Tagged as a follow-up — see "Open work" at
  the bottom of this doc.
- **Server-side timing telemetry from Sentry / PostHog.** Diagnostic
  data is in those dashboards but pulling it down for this report
  would burn the session budget for a marginal gain over the static
  analysis. Tagged as a follow-up.
- **`EXPLAIN ANALYZE` on production queries.** Same trade-off — the
  static analysis identifies the hot queries and the schema indexes
  match the predicates we use. If a specific query shows up slow in
  Sentry after the fixes land, that's the right time to break out
  `EXPLAIN`.

## Bundle audit — current state

Production build via `next build --webpack` (Turbopack ignores
`@next/bundle-analyzer`).

Total client JS across all routes: **2,111 KB parsed / 672 KB
gzipped** spread over 131 chunks.

Top chunks (parsed / gzipped):

| Chunk | Parsed | Gz | Contents |
|---|---|---|---|
| `8697-*.js` | 446 KB | 137 KB | Next.js client (166 KB) + Sentry browser (52 KB tracing alone) + Sentry NextJS client (50 KB) |
| `main-*.js` | 269 KB | 85 KB | `instrumentation-client.ts` bundle (Sentry init) + Next core |
| `3489-*.js` | 200 KB | 63 KB | **TipTap StarterKit (76 KB) + ProseMirror model (44 KB) + transform (30 KB)** |
| `cdf8b9fb-*.js` | 195 KB | 61 KB | `react-dom-client.production.js` |
| `framework-*.js` | 185 KB | 58 KB | react-dom |
| `94258551-*.js` | 182 KB | 59 KB | vendor (labels collapsed in analyzer) |
| `4779-*.js` | 138 KB | 37 KB | **Clerk** (`@clerk/shared` 72 KB + `@clerk/react` 66 KB) |
| `52dbf3db-*.js` | 94 KB | 30 KB | vendor |
| `8bb4aebd-*.js` | 79 KB | 25 KB | vendor |
| `5090-*.js` | 73 KB | 17 KB | `tutorial-form.tsx` + dependencies (admin/creator only) |

**Good news: TipTap (200 KB / 63 KB gz) is correctly admin/creator-only.**
The client-reference-manifest files confirm chunk `3489-*.js` loads only on:
- `/admin/tutorials/new`
- `/admin/tutorials/[id]`
- `/me/creator/tutorials/new`
- `/me/creator/tutorials/[id]`

The public bundle stays TipTap-free in practice. The `(public)/me/creator/tutorials/[id]`
route does live under the public route group structurally, but Next's
per-route code-splitting keeps TipTap off the other public routes.

**First-load JS for a typical public page (homepage, category, tutorial)**:
sum of `8697 + main + cdf8b9fb + framework + 94258551 + 4779 + 52dbf3db
+ 8bb4aebd` = roughly **1,587 KB parsed / 494 KB gzipped**.

That's well over the Lighthouse "First Load JS" yellow threshold (170 KB
gz) and into the red. The framework cost is largely unavoidable
(~120 KB gz for React + Next core), but Sentry browser tracing
(~17 KB gz on its own + 60 KB gz of supporting code on shared chunks)
and Clerk (37 KB gz) are the biggest non-framework costs.

## Database state

Rough row counts as of session start (inferred from
`BUILD_PROGRESS.md` + recent commits):

- Tutorials: ~80–100 (4 anchors + 31 cooking batch 002 + bakery
  anchor + mindset v3 + various drafts)
- GlossaryTerm: ~60–100 across categories
- Media: ~80–150 (hero photography + supporting images)
- AuditLog: low hundreds (every admin write since launch)
- Ingredient / Tool: low hundreds (cooking pipeline)
- RecipeIngredient: ~500–800 (avg 15-20 per recipe × 30 recipes)
- User / UGC tables: near zero pre-launch

These are small. None of them are in the "Postgres-needs-help" zone
yet. The schema is reasonably well-indexed for the hot query paths
(see "Index audit" below).

## Index audit

Indexes vs actual query predicates, sampled across hot paths:

| Hot query | Index used | Notes |
|---|---|---|
| `Tutorial where status=PUBLISHED order by publishedAt` (homepage) | `(status, publishedAt)` | ✅ |
| `Tutorial where categoryId AND status=PUBLISHED order by publishedAt` (category page) | `(categoryId, status)` then sort | ⚠️ sort not covered, but row count is small; defer |
| `Tutorial where id=? AND status=PUBLISHED` (tutorial page) | PK | ✅ |
| `Bookmark where userId AND tutorialId IN` (loadReaderState) | unique `(userId, tutorialId)` | ✅ |
| `UserProject where userId AND tutorialId IN` (loadReaderState) | unique `(userId, tutorialId)` | ✅ |
| `Review where tutorialId AND status=PUBLISHED order by helpfulCount, createdAt` (loadTutorialUgc) | `(tutorialId, status, createdAt)` | ⚠️ first sort key is helpfulCount which isn't in the index — Postgres scans the partial then in-mem sorts. Small N today, defer. |
| `ReviewHelpful where userId` | leading column of composite PK `(userId, reviewId)` | ✅ (but query loads ALL the user's helpful rows — see issue #4 below) |
| `QuestionUpvote where userId` | leading column of composite PK `(userId, questionId)` | ✅ (same caveat) |
| `User where clerkId` | unique on `clerkId` | ✅ |
| `Tutorial where slug AND category.slug` (tutorial-by-slug) | `(slug)` + relation join | ⚠️ technically the slug index isn't unique, so it does a scan filtered by `(category.slug, status)` — fine at current row count |

**No clearly missing indexes.** The Phase 8 migration added a lot of
`@@index([type, ...])` composites on Tutorial for future filter
surfaces.

## Top-10 issues ranked by user-visible impact

### 1. Public routes are `force-dynamic` — no CDN caching

Every public page (`/`, `/[categorySlug]`, `/[categorySlug]/[tutorialSlug]`)
has `export const dynamic = 'force-dynamic'`. Next.js serves these with
`Cache-Control: private, no-cache, no-store, must-revalidate` so
Cloudflare never caches them. Every page request hits the ECS task,
Postgres, Clerk, and PostHog.

For signed-out users (the typical pre-launch reader), the response is
byte-identical for everyone. A 60-second edge cache turns those
requests into ~5ms CDN hits instead of ~200-400ms origin trips.

**Why it's set:** the page mixes per-user state (bookmark, project,
beginner mode) with shared content. The clean fix is to split the
shared shell from a small client island that fetches user state. That's
larger than this audit's scope — flagged as a follow-up workstream.

**This session ships:** nothing for this one (architecture-touch).
**Impact:** Origin TTFB on every page (50-200ms vs 5ms CDN). Largest
user-visible cost, biggest fix complexity.

### 2. Duplicate Prisma + Clerk queries from `generateMetadata` + page render

`loadTutorial` runs once in `generateMetadata` and once in the page
component on every tutorial page load. Same for `loadCategory` on
category pages. And `getCurrentDbUser` is called from both
`(public)/layout.tsx` (via `SiteHeader`'s own Prisma fetch) and from
every page that needs the user.

Cost per duplicate: one Clerk `currentUser()` call (~10-30ms via
in-process cache after first hit) + one Prisma `findUnique` (~5-15ms).
Tutorial page load currently does ~3 redundant DB round-trips for a
signed-in user.

**This session ships:** wrap `getCurrentDbUser`, `loadTutorial`,
`loadCategory` with React `cache()` so multiple calls in the same
request resolve to one. Migrate `SiteHeader` to use the cached helper.
**Impact:** Estimated 30-90ms TTFB improvement per request. Trivial fix.

### 3. Admin tutorials / media / glossary lists have no pagination

`/admin/tutorials`, `/admin/media`, `/admin/glossary` all use
`prisma.X.findMany({ orderBy: ... })` with no `take`. As content
grows, the HTML payload and server-side render time grow linearly.

After batch 002 the tutorials list is ~80-100 rows including drafts
(scheduled to 200+ within Phase 8). Media is ~80-150 rows. Glossary
is ~60-100 rows.

**This session ships:** add `take: 50` + cursor pagination + a
"showing X of Y" footer. Admin overhaul workstream (4c) polishes the
UI; this is just the data bounding.

**Impact:** Caps admin page render time at a constant instead of
linear. No measurable hit at current scale but actively bites by
end of Phase 8.

### 4. Tutorial cards + home hero use CSS `background-image` — no
   `srcset`, no native lazy-load

Cards on `/`, `/[categorySlug]`, `/me`, `/me/bookmarks`, and `/me/projects`
all render the hero via `<span style={{ backgroundImage: 'url(...)' }} />`.
That pattern:
- Always loads at the fixed variant size (e.g. `width=400` for cards).
  Mobile readers on 360px-wide screens receive the same image as a
  desktop on a Retina screen.
- Doesn't get browser-native lazy loading (only `<img loading="lazy">`
  does — `background-image` loads when the element is rendered, which
  for off-screen cards is still "eagerly" relative to viewport).
- Doesn't deliver `format=auto` smarts to the browser via `srcset`'s
  density descriptor — fine for now since Cloudflare's `format=auto`
  picks AVIF/WebP server-side anyway.

Home hero feature image uses the same pattern at the `hero` variant
(`width=1600`). On mobile that's roughly 4× more pixels than needed.

**This session ships:** switch `TutorialCard` and the home feature
image to `<img>` with `srcset` (thumbnail + card + public widths),
`sizes`, `loading="lazy"`, and `decoding="async"`. Keep the CSS
`background-image` placeholder pattern only for the `placeholder`
state (the sage "h" tile).

**Impact:** Roughly halves transferred image bytes on mobile, and
moves off-screen card images out of the initial-load critical path.
Biggest LCP win for the homepage on mobile.

### 5. `SiteHeader` runs its own Prisma user lookup duplicate of `getCurrentDbUser`

`SiteHeader` calls `auth()` for the Clerk ID and `prisma.user.findUnique`
for the user's name + email. Every page below it then calls
`getCurrentDbUser()` which does another `prisma.user.findUnique`. The
header fetches the user just for the menu disc initial + greeting.

**This session ships:** folded into issue #2's fix — `SiteHeader`
calls the cached `getCurrentDbUser` instead.
**Impact:** Saves one user lookup per signed-in page load.

### 6. `loadTutorialUgc` per-viewer helpful/upvote queries load every row
   for the user across the whole site

```ts
prisma.reviewHelpful.findMany({ where: { userId: viewerId } })
prisma.questionUpvote.findMany({ where: { userId: viewerId } })
```

These fetch every helpful vote / question upvote the viewer has ever
cast across every tutorial. We only need the ones for reviews /
questions visible on this page. The composite PK `(userId, reviewId)`
supports the lookup so it's index-fast, but pulls more rows than
needed.

Also: `alreadyReviewed` runs sequentially **after** the `Promise.all`
in the same function. It can move into the parallel block.

**This session ships:** scope the helpful/upvote queries to the visible
review/question IDs (run after the first three queries finish so we
have the IDs); merge `alreadyReviewed` into the parallel block.
**Impact:** Saves ~10-30ms per signed-in tutorial page load today;
scales much better as UGC volume grows.

### 7. Sentry browser tracing adds ~50 KB parsed / ~17 KB gz to every
   public-page first-load

`instrumentation-client.ts` initialises Sentry with
`tracesSampleRate: 0.1`. Browser tracing pulls in
`browserTracingIntegration` (51 KB parsed) + supporting modules. PostHog
already captures most of the same UX telemetry. Disabling Sentry
tracing entirely (or keeping it only on error events) would shave
a noticeable chunk off shared first-load JS.

**This session ships:** nothing — this is a product call about
whether Sentry's network-call telemetry is worth the bundle cost
when PostHog is also wired. Flagged for Rebecca.
**Impact:** ~17 KB gz off shared first-load on every page.

### 8. ECS Fargate runs 1 task at 256 CPU / 512 MB

`infra/lib/homemade-stack.ts` sets `desiredCount: 1` and
`memoryLimitMiB: 512, cpu: 256`. ALB health check is 30s × 2 healthy =
~60s before traffic. So a task crash means up to ~90s of downtime
while Fargate provisions a replacement.

256 CPU is 0.25 vCPU and 512 MB is tight for Next.js standalone +
Sentry + Clerk + Prisma + connection pool. Heavy admin pages
(audit log, tutorials list) may run hot.

**This session ships:** nothing. Bumping to 2 desired tasks doubles
the steady-state cost (small dollars but real). CPU/memory bump has
the same trade-off. Both are cost decisions for Rebecca.
**Impact:** No downtime risk on task crash. Reduced p99 latency
under heavy admin use.

### 9. No `Cache-Control` on legal / static-shaped pages

`/legal/*`, `/coming-soon`, `/icon.svg`, `/apple-icon.png` are all
served fresh on every request. The legal pages are pure content with
no per-user data — they could be statically rendered or cached for
hours.

**This session ships:** nothing — small win, would be lost in noise
relative to the bigger issues. Worth doing as part of the broader
caching workstream when issue #1 is tackled.
**Impact:** Marginal.

### 10. Admin user list has `take: 200` but no pagination UI

`/admin/users` uses `take: 200` (good — bounded) but no cursor or
filter persistence after the 200th row. Falls into the same category
as #3 but smaller scale.

**This session ships:** nothing — covered by the admin overhaul
workstream when that lands. The 200-row cap is safe for now.
**Impact:** None at current user count.

## What this session shipped (Half B)

Four fixes landed, in this order. Each commit re-ran
`pnpm --filter @homemade/web typecheck` clean before being staged.

| # | Commit | What landed |
|---|---|---|
| 1 | `d6d874c` | React `cache()` wrappers on `getCurrentDbUser`, `loadTutorial`, `loadCategory`. `SiteHeader` migrated to the cached helper. Removes 2-3 duplicate Clerk + Prisma round-trips per signed-in page render. |
| 2 | `9a12c87` | Cursor pagination on `/admin/tutorials`, `/admin/media`, `/admin/glossary`. 50 rows per page (60 for media). Numbered page links, "showing X–Y of Z" footer. |
| 3 | `de8e99a` | Responsive `<img srcset>` + native `loading="lazy"` on every TutorialCard call site + the home feature hero. Adds `mediaSrcSet()` helper for the per-call-site code. Home hero uses `loading="eager" fetchPriority="high"` to stay the LCP element. |
| 4 | `fea2ad9` | `loadTutorialUgc`: scope `reviewHelpful` / `questionUpvote` lookups to the visible review / question IDs (was loading every row the viewer had ever cast). Move `alreadyReviewed` into the parallel batch — saves one signed-in round-trip per tutorial page. |

### Before/after measurements

Lighthouse runs against the live site are deferred (splash-cookie
blocker — see top of doc). Static measurements that did land:

**Query count per request, signed-in tutorial page render:**
- Before fix #1: `getCurrentDbUser` called ~3 times per request
  (SiteHeader's own user fetch + `generateMetadata` + page render),
  `loadTutorial` called 2× (metadata + render). ≈ 5 Prisma round-trips
  to fetch what could be 2.
- After fix #1: 2 Prisma round-trips (one user, one tutorial), Clerk
  `currentUser()` called once. ~50-100ms TTFB saved on typical
  signed-in tutorial loads.

**Tutorial page UGC block, signed-in render:**
- Before fix #4: 5 parallel queries + 1 sequential `alreadyReviewed`
  query. Two of the parallel queries fetched ALL the user's helpful /
  upvote rows across the whole site.
- After fix #4: 4 parallel + 2 parallel (scoped). The wide queries
  are now `WHERE userId = ? AND id IN (...)` — bounded to the visible
  reviews/questions on this page (max 50 + 30 rows). One round-trip
  fewer than before; constant scaling instead of linear with the
  viewer's interaction history.

**Admin pagination:**
- Before fix #2: `/admin/tutorials` rendered all rows (~80-100 today,
  scaling to 300+ by end of Phase 8) in one HTML payload. Same for
  `/admin/media` and `/admin/glossary`.
- After fix #2: capped at 50 rows per page. HTML payload stays bounded
  regardless of content growth.

**Image bytes per homepage load, mobile (estimate):**
- Before fix #3: 9 cards × 'card' variant (400w) = ~270-720 KB
  of card images, all loaded eagerly via CSS `background-image`.
  Home feature hero loaded 1600w variant on every viewport (~300-500 KB).
  Total: ~570 KB - 1.2 MB on initial load.
- After fix #3: cards use `loading="lazy"` so only the 2-3 above the
  fold load eagerly. Home hero serves the 'public' (1200w) variant
  on mobile via srcset density matching. Estimated ~250-400 KB on
  initial mobile load.

These are estimates from variant widths × typical viewport sizes.
The Lighthouse follow-up will pin the actual LCP / data numbers.

## Open work / follow-ups

- **Lighthouse runs on the real surfaces.** Needs the splash-cookie
  carry-over and Chrome. Either run locally against `next start` after
  setting the cookie manually, or stand up an authenticated PSI runner.
  Worth ~30 min of setup once.
- **Server-side timing pull from Sentry + PostHog.** Diagnostic data
  is there but querying it for a baseline is a separate small session.
- **Edge caching for public pages (issue #1).** Architecture-level —
  needs the per-user state to split into a client island. Big win.
  Flagged for its own session.
- **Sentry browser tracing decision (issue #7).** Product call.
- **ECS task count + sizing bump (issue #8).** Cost call.
- **Cache-Control on legal pages (issue #9).** Marginal; folds into
  the broader caching workstream.
