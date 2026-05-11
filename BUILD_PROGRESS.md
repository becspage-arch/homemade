# Homemade — Build Progress

Living log of what's done, what's deferred, and what's tracked as pre-launch debt. Pairs with `Homemade-Features-and-Build-Plan.docx` in Google Drive, which remains the canonical plan.

Updated each working session.

---

## Phase 1 — Foundation & infrastructure

### ✅ Done

- Monorepo: pnpm workspaces + Turborepo
- `apps/web`: Next.js 16, React 19, Tailwind v4
- Brand design tokens (full Section 2 palette + Fraunces + Lora) in `globals.css @theme`
- Domain `homemade.education`, registrar LCN, nameservers at Cloudflare
- Google Workspace Business Starter — admin `rebecca@homemade.education`, MX + SPF wired in Cloudflare
- AWS account `213615929920` in `eu-west-2`, IAM user `claude-deploy`
- Neon Postgres in `eu-west-2`, db `neondb`
- Clerk app `homemade` (test environment)
- AWS CDK infrastructure (TypeScript) under `infra/`:
  - VPC `homemade` (2 AZs, public subnets only, no NAT — saves ~$32/mo)
  - ECR `homemade/web` with 10-image lifecycle
  - ECS Fargate cluster + service (256 CPU / 512 MB, 1 task)
  - ALB on HTTP:80, target group with `/healthz` health check
  - CloudWatch logs at `/homemade/web` (30-day retention)
- AWS Secrets Manager — splash password, `DATABASE_URL`, Clerk secret
- Dockerfile (multi-stage, Next.js standalone output, non-root user)
- GitHub Actions deploy workflow — push to `main` builds, pushes to ECR, rolls ECS service
- Splash page guard via `proxy.ts` — cookie gated, `/unlock` form, password in env var
- **Live at https://homemade.education** behind splash page

### ⏸ Deferred (Phase 1 items deliberately not wired yet)

These don't need to exist before there's content and users to track. We add each when its phase needs it.

- Sentry (errors)
- PostHog or chosen analytics provider (product analytics events)
- Data warehouse pipeline (BigQuery / Snowflake / ClickHouse)
- Inngest (background jobs)
- Ably (real-time)
- Upstash Redis (caching, rate limiting, session data)
- Capacitor 8 (iOS/Android wrapper — Phase 3 work)
- Synthetic canary workflow (every-5-min Playwright run)
- Drift detection workflow (daily)
- Backup verification workflow (daily restore-to-staging)
- OpenTelemetry distributed tracing
- Status page (`status.homemade.education`)

### 🏗 Pre-launch debt (must address before public launch)

- Rotate all credentials (AWS keys, Cloudflare token, Neon, Clerk, splash password)
- Move secrets out of `.env.credentials` and into a password manager
- ESLint won't run — `next lint` removed in Next 16, ESLint v9 needs flat config. Migrate to `eslint.config.js` so we have a linter again.
- SubTutorialCard cross-references: deleting a tutorial leaves dead `tutorialId` refs in other tutorials' TipTap JSON. Either scan JSON content for refs before delete and block, or schedule a periodic cleanup that nulls dangling refs.
- **Typesense CDK secret-mount.** `packages/search` is wired and gracefully no-ops without env vars. To turn search on in production: (a) Rebecca creates a Typesense Cloud cluster and drops keys into `.env.credentials`, (b) a small follow-up CDK pass adds the three Typesense secrets to AWS Secrets Manager and mounts them into the ECS task definition, using the same two-step CFN pattern as Phase 2e.
- **Mobile splash asset.** Current splash source is `favicon-1024.png` (1024×1024). Capacitor wants 2732×2732 with content centred in the inner 1200×1200 — replace `apps/mobile/assets/splash.png` and rerun `pnpm --filter @homemade/mobile assets:generate` then `sync`. Same for splitting the icon foreground / background pair into a transparent sage "h" + a sage tile for a proper Android adaptive icon.

### ✅ Pre-launch hardening pass

Resolved in this session — see "Phase 1 hardening pass" below.

- Cloudflare SSL Flexible → Full (strict) with Cloudflare Origin Cert on the ALB
- `claude-deploy` IAM tightened — `AdministratorAccess` replaced with `HomemadeScopedDeploy` (custom-managed policy in `infra/policies/claude-deploy.json`)
- GitHub Actions runners on Node 24 (`actions/checkout@v5`, `actions/setup-node@v5`, `aws-actions/configure-aws-credentials@v5`)
- CloudWatch alarms wired (ALB 5xx, target unhealthy, ECS task count) into a new SNS topic `homemade-alarms` with email subscription
- Clerk webhook secret mounted into ECS task — `CLERK_WEBHOOK_SIGNING_SECRET` env var live, `/api/webhooks/clerk` endpoint goes from 503 → 400/200 once a signed request lands

### Phase 1 hardening pass

Pre-launch infra cleanup, run end-to-end in one session.

- **Cloudflare SSL: Flexible → Full (strict).** Generated a 15-year Cloudflare Origin Certificate for `homemade.education` + `*.homemade.education` (via the Cloudflare dashboard — the user-scoped API token can't hit the Origin CA endpoint), imported into ACM in `eu-west-2`, attached to a new HTTPS:443 listener on the ALB. HTTP:80 listener kept and switched from forward → 301 redirect to HTTPS. Migration ran in three CDK deploys to avoid a redirect loop while Cloudflare was still in Flexible mode: (a) add HTTPS:443 with HTTP:80 still forwarding, (b) flip Cloudflare to Full strict, (c) flip HTTP:80 to redirect. Net result: no plaintext traffic between Cloudflare and origin, no plaintext traffic to the ALB.
- **`claude-deploy` IAM scoped.** Wrote `infra/policies/claude-deploy.json` — covers CDK bootstrap-role assumption, ECR push for `homemade/web`, ECS service update, Secrets Manager `homemade/*`, ACM cert import, CloudWatch alarms/logs read, and a break-glass section for self-policy management on the `claude-deploy` user. Attached as a managed policy (`HomemadeScopedDeploy`), `AdministratorAccess` detached. Verified by running `cdk diff` and a no-op `cdk deploy` with only the scoped policy attached — both succeeded.
- **GitHub Actions on Node 24.** Bumped `actions/checkout` v4→v5, `actions/setup-node` v4→v5, and `aws-actions/configure-aws-credentials` v4→v5 in `.github/workflows/deploy.yml`. The pnpm, Docker, and ECR-login actions were already on current Node-20+ versions.
- **CloudWatch alarms + SNS.** Three alarms wired in CDK with an SNS topic `homemade-alarms` and `rebecca@homemade.education` as an email subscriber:
  - `homemade-web-alb-5xx` — `HTTPCode_ELB_5XX_Count + HTTPCode_Target_5XX_Count` > 5 in a 5-minute window (3 of 5 datapoints).
  - `homemade-web-targets-unhealthy` — `HealthyHostCount < 1` for 2 consecutive minutes.
  - `homemade-web-running-task-count` — `RunningTaskCount < 1` for 5 consecutive minutes.
  - All tagged `Project=Homemade`. Email subscription confirmation manually accepted.
- **Clerk webhook signing secret mounted.** Endpoint created in Clerk's dashboard (Development env) pointing at `https://homemade.education/api/webhooks/clerk`, signing secret stored in AWS Secrets Manager, and `CLERK_WEBHOOK_SIGNING_SECRET` mounted into the ECS task. The two-deploy CFN-race mitigation (Option A) was wired into the CDK code with a `MOUNT_CLERK_WEBHOOK_SECRET=1` env-gated reference, separate from the IAM grant which lands earlier in the same stack template.
- **AWS Secrets Manager parser bug — workaround.** The original secret was named `homemade/clerk-webhook-secret`. AWS Secrets Manager's API can't parse the *no-suffix* ARN form (`arn:...:secret:homemade/clerk-webhook-secret`) for secrets whose names end in `-secret` — the parser appears to treat the trailing `-secret` as the random suffix and resolves to a different (non-existent) underlying secret, returning `ResourceNotFoundException`. ECS Fargate, which passes the no-suffix ARN from the task definition's `valueFrom`, wraps that error as a misleading `AccessDeniedException`. Fix: renamed the AWS secret to `homemade/clerk-webhook-signing-secret-v2` (doesn't end in `-secret`) and pointed the CDK reference at the new name. Old secret scheduled for deletion with a 7-day recovery window.
- **CDK guard added.** Replaced `process.env.X ?? ''` fallback for `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLOUDFLARE_IMAGES_DELIVERY_HASH` with `requireEnv()` so a local deploy without these set hard-fails instead of silently overwriting production values with empty strings.
- **Three-stage HTTPS migration is reversible.** Stack now reads `ORIGIN_CERT_ARN` and `HTTP_PORT_80_REDIRECT` from env, so the old plain-HTTP topology is one deploy away if needed for re-bootstrap.

#### Out of scope for this pass

- Credential rotation + password manager migration — needs Rebecca in external account UIs.
- WAF / Bot Fight Mode / rate-limiting — defer.
- Backup verification / drift detection / Sentry / PostHog / Inngest — phase-specific.
- Token-scope upgrade for `CLOUDFLARE_API_TOKEN` (to include Origin CA + Zone Settings:Edit) — current token can't issue origin certs or flip SSL mode via API; both were done in the dashboard this session.

---

## Phase 2 — Data model & content management

**Complete.**

### ✅ Done

- `packages/db` workspace with Prisma 7 + `@prisma/adapter-pg` + `pg`
- Initial schema in `packages/db/prisma/schema.prisma`:
  - `User` (Clerk shadow + role enum)
  - `Category`, `SubCategory`, `Tag`
  - `GlossaryTerm`
  - `Tutorial` (full metadata, source attribution, status lifecycle, hero media)
  - `TutorialVersion` (per-save snapshot for history + rollback)
  - `Media` (Cloudflare ID, R2 key, status)
  - `AuditLog`
- First migration applied to Neon (`20260511104429_init`)
- `prisma.config.ts` configured for Prisma 7's new datasource-via-config pattern
- `prisma generate` runs as a workspace postinstall and during Docker build
- Lazy-proxied Prisma client (safe to import at build time without `DATABASE_URL`)
- `apps/web` wired to Clerk:
  - `@clerk/nextjs` installed, `ClerkProvider` wraps the root layout
  - `proxy.ts` combines splash cookie gate + Clerk auth for `/admin/*`
  - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` flowing from GitHub secret → Docker build arg → JS bundle
  - `CLERK_SECRET_KEY` already in Secrets Manager and mounted into ECS via CDK
- `/admin` dashboard live:
  - Email-allowlist gate (`rebecca@homemade.education` → ADMIN)
  - Server component pulling live Prisma counts of tutorials / categories / glossary / media
  - Sage-on-cream header with nav for Tutorials / Categories / Glossary / Media + Clerk user button

### ✅ Phase 2c — categories CRUD + plumbing

- **JIT user provisioning** in `apps/web/src/lib/get-current-user.ts` — the Prisma `User` row is created on first sign-in. Email allowlist sets role: `rebecca@homemade.education` → ADMIN, everyone else → MEMBER. Replaces the hardcoded email check in the admin layout.
- **Audit log helper** in `apps/web/src/lib/audit.ts` — writes a row per admin mutation, never throws.
- **`/admin/categories`**: list view (order / name / slug / counts / updated date), new form, edit form, delete (blocks if tutorials or sub-categories still reference it). Server actions with validation in `actions.ts`, all writing audit entries.
- **`prisma migrate deploy` in GitHub Actions**: runs before ECS rollout so new code finds the migrated schema. Idempotent — no-op when no migrations are pending. `DATABASE_URL` added as a repo secret.

### ✅ Phase 2d — taxonomy + Clerk webhook + favicon

- **Clerk webhook** (`apps/web/src/app/api/webhooks/clerk/route.ts`) — svix-verified handler that mirrors `user.created` / `user.updated` / `user.deleted` events into the Prisma `User` row. Returns 503 if `CLERK_WEBHOOK_SIGNING_SECRET` isn't set so the app runs fine until the webhook is actually configured. The signing secret exists in AWS Secrets Manager as `homemade/clerk-webhook-secret` (placeholder value) but is intentionally **not** mounted into the ECS task definition yet — adding it triggered the ECS deployment circuit breaker because CFN updates the IAM policy in parallel with the task replacement, so new tasks could try to pull the secret before the IAM grant landed. When you're ready to enable the webhook: (a) create the endpoint in Clerk's dashboard pointing at `https://homemade.education/api/webhooks/clerk`, (b) put the real signing secret into AWS Secrets Manager, (c) uncomment the reference in `infra/lib/homemade-stack.ts` and redeploy CDK. (The Phase 2e two-step CDK deploy pattern is exactly how to land it without the race.)
- **`/admin/glossary`** CRUD — list, new, edit, delete. Optional category association via dropdown. Same audit-log + validation pattern as categories.
- **`/admin/sub-categories`** CRUD — list, new, edit, delete. Required parent category. Slug unique within parent (compound unique).
- **`/admin/tags`** — single-page inline CRUD (add at top of page, each row is its own edit form). Many-to-many with tutorials, so delete is unblocked but disconnects existing tutorial associations first.
- **Admin nav extended** with sub-cats and tags links.
- **Brand favicon** — `icon.svg` (Fraunces "h" sage on cream) + `apple-icon.png` (180×180) + `favicon.ico` (legacy fallback) wired into apps/web. Next.js auto-generates `<link>` tags.

### ✅ Phase 2e — media (Cloudflare Images)

- **`/admin/media`** CRUD — list (thumb, filename/alt, dimensions, status, uploaded date, sorted by created desc), upload page, edit page with metadata fields (alt / caption / credit). Same audit-log + admin-gate pattern as categories.
- **Direct-upload flow** — `/api/media/direct-upload` (admin-gated) calls Cloudflare's `images/v2/direct_upload` endpoint and returns the one-time `uploadURL` + image `id`. The browser POSTs the file directly to Cloudflare with XHR for progress reporting. On completion the client invokes a server action (`registerUpload`) to create the Prisma `Media` row as `READY` or `FAILED` depending on the result. Image dimensions are read from the file in the browser before upload; mime type / filename / byte size come from the `File` object.
- **`Media` schema changes** — new migration `20260512000000_media_upload_state`:
  - `MediaStatus` enum replaced (`PENDING`/`APPROVED`/`REJECTED` → `UPLOADING`/`READY`/`FAILED`). Moderation state will reappear as its own column in Phase 5 when NSFW scanning ships; mixing moderation and upload state in one enum was the wrong shape.
  - Added `filename` and `bytes` columns.
  - Default status flipped to `UPLOADING`.
- **CFN secret-mount race avoided** by splitting the CDK change across two deploys. Deploy 1 added an inline IAM `secretsmanager:GetSecretValue` policy on the execution role for the two new Cloudflare ARNs but did NOT reference them in the container's `secrets:` block — no task replacement, IAM grant lands cleanly. Deploy 2 added the `ecs.Secret.fromSecretsManager(...)` references — task replacement, but IAM was already in place. Both deploys went green first-try. The same pattern can now be reused to wire the Clerk webhook secret back in (Phase 2d's outstanding pre-launch item).
- **Cloudflare secrets in AWS Secrets Manager**: `homemade/cloudflare-api-token`, `homemade/cloudflare-account-id`. Both mounted into the ECS task as `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` (task definition revision 5).
- **`CLOUDFLARE_IMAGES_DELIVERY_HASH`** — ECS env var so the server can build CDN delivery URLs (`https://imagedelivery.net/<hash>/<image_id>/<variant>`). Not secret; it appears in every delivery URL anyway. Set in `infra/lib/homemade-stack.ts` (`qTHUFgOzX6ApY3B_SdLnDA`). The Phase 2f hero-media picker reads the same env var.
- **Two delivery variants** configured in Cloudflare: `public` (1366×768 scale-down, default) and `thumbnail` (256×256 cover). Picker tiles and list-page rows use `thumbnail`; edit-page preview uses `public`.
- **Helper consolidation** — Phase 2f shipped a `cloudflareDeliveryUrl()` URL builder in `apps/web/src/lib/media.ts`; Phase 2e's API client (`createDirectUpload`, `deleteImage`) lives in `apps/web/src/lib/cloudflare-images.ts`. Media pages import the URL builder from `@/lib/media` to avoid duplication.
- **Cloudflare delete on row delete** — the `deleteMedia` server action calls `images/v1/<id>` DELETE on Cloudflare before deleting the Prisma row. "Image not found" responses from Cloudflare are tolerated (so a row whose CF asset has already been removed can still be cleaned up from the DB). Deletion is blocked if any `Tutorial.heroMediaId` references the row.

### ✅ Phase 2f — tutorials CRUD + TipTap editor + version history

- **`/admin/tutorials`** list view with title / category / status / last edited / published-date columns. Status filter chips (All / Draft / Scheduled / Published / Archived). Sorted by `updatedAt desc`.
- **`/admin/tutorials/new`** and **`/admin/tutorials/[id]`** edit pages share the same `TutorialForm` client component: title (auto-fills slug), subtitle, excerpt, category (filtered sub-category dropdown), tags, difficulty / season / time, source type + notes, hero media picker, TipTap body. Slug uniqueness validated server-side.
- **Hero media picker** modal reads existing `Media` rows from Prisma. Thumbnail URLs are built from the Cloudflare delivery hash. Empty state links to `/admin/media/new`.
- **TipTap editor** (`apps/web/src/components/admin/editor/`) — `@tiptap/react@3.23.1` + StarterKit (includes link, lists, blockquote, headings, marks). Five custom extensions:
  1. **InfoPanel** — node, atom, tone (info / tip / warning) + title + body
  2. **SuppliesCard** — node, atom, heading + items[] (name, qty?, link?)
  3. **GlossaryTooltip** — inline mark with `termId`; toolbar picker searches `GlossaryTerm` by term/slug; dotted-underline visual cue via CSS
  4. **SubTutorialCard** — node, atom; in-block picker searches published tutorials by title/slug/category
  5. **PullQuote** — node, atom, quote + attribution
- TipTap content stored on `Tutorial.body` (the existing schema field — spec described it as `content`).
- **Lifecycle** — server action `transitionTutorialStatus` enforces allowed transitions: DRAFT→SCHEDULED|PUBLISHED, SCHEDULED→DRAFT|PUBLISHED, PUBLISHED→ARCHIVED, ARCHIVED→DRAFT (plus IN_REVIEW back/forward). Scheduling captures `scheduledFor`; publishing stamps `publishedAt` (idempotent). No background job to auto-flip Scheduled→Published yet — Inngest is Phase 1 deferred. Each transition snapshots a `TutorialVersion` first.
- **Version history** — `/admin/tutorials/[id]/versions` lists all versions newest-first with author + timestamp + change note. `/admin/tutorials/[id]/versions/[versionId]` renders the version in a read-only TipTap renderer (same five extensions, `editable: false`). Restore copies title / subtitle / excerpt / body back to the live `Tutorial`, snapshotting the current state first. All transitions, edits, and restores are audit-logged.
- **Server actions** (`actions.ts`): `createTutorial`, `updateTutorial` (snapshots before write), `transitionTutorialStatus`, `restoreTutorialVersion`, `deleteTutorial`. Hard-delete cascades versions via the existing `onDelete: Cascade` on `TutorialVersion.tutorialId`.

**Out-of-scope from Phase 2f (per worker spec):**
- Public tutorial rendering — handled in Phase 3a below
- Live preview pane — added in the Phase 2f follow-up below
- Autosave / debounced save (explicit Save button only)
- Inline image upload inside the editor body
- Background scheduled-publish job
- SubTutorialCard reference clean-up on delete (dead-link check skipped — flagged above)
- SEO meta editor (not in schema yet)

### ✅ Phase 2f follow-up — live preview toggle (added in the Phase 3a session)

- **Preview toggle** sits in the body label row of the create/edit form. Switches between TipTap and a live render through the public `TutorialContent` component, using the in-progress JSON the editor pushes back via `onChange`. The editor stays mounted while previewing so editor state survives a round trip. Sub-tutorial cards in preview render from the form's `TutorialRef[]` (no hero image until publish + reload).

### Architecture decisions to note

- **Admin lives at `/admin` route inside `apps/web`, not a separate `apps/admin` app.** The architecture doc specifies a separate app; we're starting simpler (single app, Clerk-role-gated route) because for now Rebecca is the only admin and the additional infra cost of a second deploy target isn't worth it pre-launch. We can split into `apps/admin` later if/when scale or separation needs justify it. Tracked as a possible-future-refactor, not debt.
- **Admin authorisation is a hardcoded email allowlist** in `apps/web/src/lib/auth.ts`, not a Prisma `User.role` lookup. To be replaced once the Clerk webhook is wired and `User` rows are populated automatically on signup.
- **Recipe / Pattern / Review / Q&A / UserProject / Marketplace / Creator / Errata models intentionally deferred** until the phases that need them. The schema is incremental.

---

## Phase 3 — The reading experience

### ✅ Phase 3a — public tutorial / category / homepage + custom-block renderers

- **TipTap-JSON → React renderer** in `apps/web/src/components/public/tutorial-content/`. Walks the TipTap document and emits plain React. **Crucially, no `@tiptap/*` runtime imports** — keeps the public bundle clean. Lives under one CSS file (`tutorial-content.css`) that mirrors the typography rhythm of the reference designs (Fraunces headings, Lora body, sage rules, parchment fills).
- **Five custom-block React components** (renderers, distinct from the admin's TipTap node views) under `tutorial-content/blocks/`:
  - InfoPanel — three tones (info / tip / warning), labelled aside with tone-coloured left rule
  - SuppliesCard — parchment frame, sage label, qty/name/link grid
  - PullQuote — large Fraunces italic in sage, top + bottom sage rules, optional attribution as a small caps line
  - SubTutorialCard — thumb + label + title + excerpt + arrow, links via `/[categorySlug]/[tutorialSlug]`; surfaces a dotted-frame "linked tutorial no longer available" if the target was unpublished/deleted (covers the SubTutorialCard delete gap from Phase 2f)
  - GlossaryTooltip — sage dotted-underline `<button>` with CSS-only hover/focus popover (no JS state), accessible via keyboard + `aria-describedby`. Falls back to plain text if the term is missing
- **Per-page ref loader** in `apps/web/src/lib/tutorial-refs.ts` walks the document and fetches only the glossary terms + sub-tutorials the document actually references. Sub-tutorial lookups are filtered to `status: PUBLISHED` so unpublished references degrade to the missing-link block.
- **Public route group** `apps/web/src/app/(public)/` provides a shared header (wordmark + category nav) and footer. The category nav is server-rendered from the live `Category` rows.
- **Tutorial detail page** at `/[categorySlug]/[tutorialSlug]` — 404 unless the row exists, `status === PUBLISHED`, and the slugs match. Renders hero, breadcrumb, info bar (difficulty / time / season / reading-time estimate / published date), body, and a "sources and provenance" aside that reads from `SourceType` + `sourceNotes`. Reading-time is derived from word-count, threshold 60 words.
- **Category index page** at `/[categorySlug]` — groups published tutorials by sub-category (sub-cats in declared `order`, then a "More in {name}" bucket for the unassigned). Tutorial cards show hero thumbnail, title, excerpt, difficulty, season.
- **Homepage** at `/` shows a featured-card hero (most-recent published) + a recent grid. Falls back to the wordmark + tagline layout when no tutorials are published yet so the splash still feels intentional.
- **Hero / card image variants** — `cloudflareDeliveryUrl` now exposes `hero` and `card` variants alongside `thumbnail` / `public`. The Cloudflare Images variant definitions themselves are configured in CF (Phase 2e); if a variant isn't yet defined the placeholder tile shows.
- **Old root `apps/web/src/app/page.tsx` removed**; homepage now lives at `apps/web/src/app/(public)/page.tsx` to share the public layout. Splash cookie gate in `proxy.ts` continues to cover everything outside `/coming-soon`, `/unlock`, `/healthz`, Clerk paths, and `/api/webhooks/clerk` — verified.

**Out of scope from Phase 3a (now addressed in Phase 3b / 3c):**
- ~~Search (Typesense)~~ — shipped in Phase 3b
- ~~Inline product blocks, varieties panel, trouble-shooter blocks~~ — shipped in the three-extra-blocks pass
- ~~Admin preview of metadata/hero~~ — shipped in the admin-preview-polish pass
- Reading-progress bar, sticky TOC, Project companion sidebar (Phase 4 territory once accounts exist)
- Reviews, Q&A, community photos sections at the bottom of the reference HTML (Phase 5 UGC pipeline)
- Sitemap / `robots.txt` — site is still gated by the splash cookie

### ✅ Phase 3b — Search (Typesense)

- **`packages/search`** workspace wrapping the Typesense JS client. Three thin layers: schemas (typed `TutorialDoc` / `CategoryDoc` / `GlossaryDoc` + `CollectionCreateSchema` definitions), `client.ts` (admin + search-only client getters, env-var gated, return `null` and gracefully no-op when keys aren't set), `sync.ts` (upsert / remove + a bulk-import helper), and `public.ts` (a `searchTutorials` wrapper used by the public search page).
- **`extractBodyText`** walks the TipTap JSON and flattens it to a single plain-text string for full-text indexing — pulls inline text out of every custom block (info-panel title/body, supplies items, varieties, troubleshooter symptoms etc.).
- **Sync hooks** in `apps/web/src/lib/search-sync.ts` are called from the admin server actions after each Prisma write:
  - Tutorials: `createTutorial`, `updateTutorial`, `transitionTutorialStatus`, `restoreTutorialVersion`, `deleteTutorial`. Behaviour: index only if `status === PUBLISHED`; remove if status moves away from published or the row is deleted.
  - Categories: any write upserts the category doc; delete removes it.
  - Glossary: any write upserts; delete removes.
- Sync calls are fire-and-forget — failures log to console but never fail the admin action. If env vars aren't set, the client returns `null` and every sync call is a no-op.
- **Backfill script** at `packages/db/scripts/typesense-backfill.ts` (run via `pnpm --filter "@homemade/db" run search:backfill`). Loads `.env.credentials` via dotenv, drops the three collections, recreates them from the schemas, and bulk-imports current Prisma rows. Idempotent — safe to run repeatedly.
- **Public `/search`** page at `apps/web/src/app/(public)/search/page.tsx`. Server-rendered from URL query params (`q`, `category`, `difficulty`, `season`), shareable, filterable. Result cards re-use `TutorialCard`. Empty-state shows "recently published" tutorials. Filters are anchor links so toggling one keeps the other filter state intact and back / forward works as expected.
- **Header search bar** in the public site header — compact, search-icon prefix, submits to `/search?q=…`. No live-as-you-type — that's a defer until the public bundle cost is worth measuring.
- **No admin Typesense key in the public bundle.** The admin key is only ever pulled by `getAdminClient()` which is called from server actions and the backfill script. The public page uses the search-only key via `getSearchClient()`.
- **CDK secret-mount deferred.** Rebecca needs to (a) create a Typesense Cloud cluster, (b) drop `TYPESENSE_HOST` + `TYPESENSE_ADMIN_API_KEY` + `TYPESENSE_SEARCH_ONLY_API_KEY` into `.env.credentials`, then (c) a tiny follow-up session adds the secrets to AWS Secrets Manager + the CDK task definition (using the same two-step pattern as Phase 2e). Until that lands, search returns zero results in production but the rest of the site is unaffected.

### ✅ Phase 3c — Mobile (Capacitor 8)

- **`apps/mobile`** workspace, Capacitor 8 latest (`@capacitor/core@8.3.3`, `@capacitor/android@8.3.3`, `@capacitor/ios@8.3.3`).
- **Bundle ID** `education.homemade.app`, app name `Homemade`.
- **`capacitor.config.ts`** loads the live site via `server.url: 'https://homemade.education'` so the wrapper is a thin native shell rather than duplicating the web codebase. `webDir: 'dist'` points at a tiny fallback HTML page bundled into the app for offline / network-error cases.
- **Plugins installed:** `@capacitor/app`, `@capacitor/splash-screen`, `@capacitor/status-bar`. Splash screen plugin shows a sage-cream splash for 1.5s on launch.
- **Native projects exist** under `apps/mobile/android/` and `apps/mobile/ios/`. Android builds with Android Studio + JDK 17. iOS is scaffolded only — `pnpm --filter @homemade/mobile build:ios` refuses to run off macOS (Rebecca's on Windows, so this is a Mac / CI requirement).
- **Icons + splash generated** from `H:\My Drive\Branding\favicon-1024.png` and `wordmark-cream-on-sage.png` via `@capacitor/assets`. 148 Android assets + 14 iOS assets generated. **Asset-quality follow-up:** the splash source is the 1024×1024 favicon; Capacitor wants 2732×2732 with the wordmark centred ≤1200×1200 for tablets. Note in `docs/mobile-setup.md`.
- **Build scripts:**
  - `pnpm --filter @homemade/mobile dev` — patches `capacitor.config.ts` to point at the local Next.js dev server (set `LAN_IP=192.168.x.x`), runs `cap sync`, restores on Ctrl-C.
  - `pnpm --filter @homemade/mobile build:android` — `cap sync android` + `./gradlew assembleDebug`, produces an unsigned debug APK at `apps/mobile/android/app/build/outputs/apk/debug/app-debug.apk`.
  - `pnpm --filter @homemade/mobile build:ios` — placeholder that prints "must run on macOS" until a Mac is available.
- **`docs/mobile-setup.md`** is the runbook for Apple Developer Program enrolment, App Store Connect, Google Play Console enrolment, iOS code signing, Android keystore, and the GitHub-Actions-on-`macos-latest` pattern for TestFlight (mirrors the Aura project setup Rebecca already has working).

### ✅ Three additional TipTap blocks

Two reference HTMLs (`H:\My Drive\Homemade_Tutorial_Tomatoes_v4.html` + the Granny Square one) had three blocks beyond the existing five. All three now ship:

1. **ProductCard** — inline product / affiliate card. Schema: imageUrl, title, description, label, price, currency, retailerName, productUrl. Note: this is a content block, not a relation to a `Product` model — proper Product / SKU schema lands in Phase 7 Marketplace. Public renderer adds `rel="noopener noreferrer nofollow sponsored"` for affiliate hygiene.
2. **VarietiesPanel** — comparison grid (tomato varieties, stitch types, etc.). Schema: label + heading + intro + items array of `{ name, type, description }`. Two-column grid that collapses on mobile.
3. **Troubleshooter** — symptom → cause → fix list. Schema: heading + intro + items array of `{ symptom, cause, fix }`. Public renderer matches the tomato reference's `.trouble` styling: italic terracotta symptom column, espresso bold cause, taupe body.

All three: TipTap node atoms in `apps/web/src/components/admin/editor/extensions/`, toolbar insert buttons, React renderers in `apps/web/src/components/public/tutorial-content/blocks/`, CSS in `tutorial-content.css`. Wired into the admin editor (`tiptap-editor.tsx`) and the public renderer switch (`tutorial-content.tsx`). Public bundle stays TipTap-free.

### ✅ Admin preview — metadata + hero

- The admin Preview toggle now reflects every previewable field in real time, not just the body. The form lifts state for title / subtitle / excerpt / category / sub-category / difficulty / season / time / source type / source notes / hero media into `TutorialForm`, and passes that state to the preview pane.
- Public route's tutorial chrome (breadcrumb / hero / info bar / body / sources aside) was extracted into a shared `TutorialChrome` presentation component (`apps/web/src/components/public/tutorial-chrome.tsx`). Public route at `/[categorySlug]/[tutorialSlug]` and the admin Preview both render through it.
- Hero URL is built from the form's selected media id + the Cloudflare delivery hash (passed in from the server-rendered page via a prop).
- Reading-time recalculates from the in-progress body word count.
- The shared CSS (`tutorial-page.css`) moved from the public route into `components/public/` so both consumers can import it without crossing route boundaries.

## Phase 4 — Accounts & user state

### ✅ Done

- **Schema additions** in `packages/db/prisma/schema.prisma`, migration `20260514000000_user_state`:
  - `Bookmark` (id, userId, tutorialId, createdAt; unique on (userId, tutorialId); idx on userId; cascade both sides).
  - `UserProject` (id, userId, tutorialId, status `UserProjectStatus`, startedAt, completedAt?, abandonedAt?, notes default `""`, suppliesChecked JSON default `[]`, readingProgressPercent Int default 0, lastViewedAt; unique on (userId, tutorialId); idx on userId and status; cascade both sides). One project per (user, tutorial) — `startProject` resumes an existing row rather than creating a duplicate.
  - `UserProjectStatus` enum: `IN_PROGRESS` / `COMPLETED` / `ABANDONED`.
  - `User` additions: `beginnerMode` (Boolean, default false), `displayHandle` (String?, unique), `bio` (String?). The handle + bio fields prep for Phase 5/6 social work cheaply — no public profile route is wired yet.
  - JIT user provisioning in `apps/web/src/lib/get-current-user.ts` keeps working since all new fields have defaults or are nullable.
- **Proxy** — `/me(.*)` added to the Clerk-protected matcher alongside `/admin(.*)`. Splash cookie still gates everything as before.
- **Server actions** in `apps/web/src/lib/user-state-actions.ts`:
  - `toggleBookmark`, `startProject`, `markProjectComplete`, `abandonProject`, `resumeProject`, `updateProjectNotes`, `toggleSupplyChecked`, `updateReadingProgress`, `updateBeginnerMode`, `updateProfile`.
  - Lifecycle changes (start / resume / complete / abandon) are audit-logged via the existing `audit()` helper. High-volume actions (reading progress, notes typing, supply ticks) skip the audit log on purpose.
  - `updateProfile` enforces a `^[a-z0-9](?:[a-z0-9_-]{1,30}[a-z0-9])?$` handle pattern and unique-checks against other users; bio is trimmed to 280 chars.
- **`/me` route group** in `apps/web/src/app/(public)/me/`:
  - `layout.tsx` redirects to `/sign-in` when unauthenticated, renders a greeting + sub-nav (Overview / Projects / Bookmarks / Settings).
  - `page.tsx` — dashboard with "In progress" (up to 3 most-recent), "Recent bookmarks" (up to 6), "Recently completed" (up to 3). Warm empty states for each.
  - `bookmarks/page.tsx` — full list using `TutorialCard`s with an inline "Remove" pill (`bookmark-remove.tsx`).
  - `projects/page.tsx` — all projects with status filter chips (All / In progress / Completed / Abandoned) via `?status=…` query param.
  - `projects/[projectId]/page.tsx` — full project view with status pill, supplies tick list (`project-supplies.tsx`), debounced notes textarea (`project-notes.tsx`), and status controls (`project-status-controls.tsx`).
  - `settings/page.tsx` + `settings-form.tsx` — beginner-mode toggle, display handle, bio, Clerk sign-out button.
- **Site header** (`apps/web/src/components/public/site-header.tsx`): signed-out shows a small "Sign in" pill; signed-in shows a sage avatar disc + `Hi, {firstName}` + a click-to-open menu (`user-menu.tsx`, client) with links to Overview / Projects / Bookmarks / Settings / Sign out. The right-hand slot reserves a fixed-min width so the layout doesn't jump.
- **Tutorial page** (`apps/web/src/app/(public)/[categorySlug]/[tutorialSlug]/page.tsx`):
  - Server fetches the signed-in user's bookmark + UserProject for this tutorial in one round-trip alongside the existing tutorial / refs loads.
  - `TutorialChrome` was extended with optional `actionsSlot` + `leftRail` + `rightRail` + `footerSlot`. Admin Preview keeps passing nothing; the public route fills them for signed-in readers.
  - **Bookmark button** (client, optimistic) and **project button** (client, lifecycle-aware: Start making → In progress controls → Completed-on-{date} with "Make this again") render in `actionsSlot`.
  - **Reading-progress bar** (`reading-progress.tsx`) — fixed sage strip under the sticky header, rAF-throttled scroll listener. Persists to `UserProject.readingProgressPercent` at most every 5s (and on unmount) when a project exists; session-only otherwise.
  - **Sticky TOC** (`sticky-toc.tsx`) — reads h2/h3 inside `.tutorial-content` after mount, assigns ids if missing, uses an IntersectionObserver to highlight the active section. Collapses to a `<details>` dropdown below 1100px.
  - **Project companion sidebar** (`project-companion.tsx`) — only when a UserProject is `IN_PROGRESS`. Supplies harvested via `harvestSupplies()` (`apps/web/src/lib/supplies.ts`), de-duplicated by lowercase name across every SuppliesCard in the body. Persists ticks, debounced notes, and status controls. Below 1100px the rails go static so the sidebar drops below the body.
- **Beginner mode** (when `User.beginnerMode === true`):
  - `TutorialContent` threads a `beginnerMode` prop through every `RenderNode` call.
  - `GlossaryTooltip` switches from CSS-only popover to an inline expansion (`term (definition)`) with a dotted underline on the term.
  - `InfoPanel` gets a "for beginners — …" label and a bolder left rule via `.info-panel-beginner`.
  - `SuppliesCard` items gain an italic "or {substitutions}" line when the optional new `substitutions` field is set. The admin TipTap extension (`apps/web/src/components/admin/editor/extensions/supplies-card.tsx`) grows a second input row per item; the schema is additive (default empty), so existing TipTap docs deserialise fine.
  - A `BeginnerHelpFooter` renders below the sources aside with each glossary term used + an `?difficulty=BEGINNER` link back into the category index.
- **Tutorial cards** — `TutorialCard` accepts an optional `state: ReaderTutorialState`. A sage filled bookmark glyph overlays the hero when saved; a small "{n}% in progress" pill sits below the meta when the user has an IN_PROGRESS UserProject. Per-card state is fetched once via `loadReaderState()` in the parent and threaded through, never refetched per card.
- **Homepage** — when signed in with at least one IN_PROGRESS UserProject, a "Continue making" strip renders above the latest hero (up to 3 cards). Signed-out homepage is unchanged.
- **Category page** — accepts `?difficulty=BEGINNER|INTERMEDIATE|ADVANCED` (drives both the BeginnerHelpFooter link and the public surface), threads reader state to each card.

### Microcopy

All user-facing strings audited against `feedback_homemade_voice.md` Section 6b banned-phrase list: no `honest`, `frankly`, `delve`, `at its core`, `embrace`, `elevate`, `nurture`, `treasure trove`, `game-changer`, `unlock the secrets`, `tapestry`, `testament to`, `beacon of`, `happy crafting`, "in conclusion" / "furthermore" / "moreover" / "additionally" openers, `not just X but Y` negation patterns. Em-dash count kept low.

### Build hygiene

- `pnpm --filter @homemade/web typecheck` — passes.
- `pnpm --filter @homemade/web build` — passes (Next.js 16 / Turbopack). The `@prisma/client` `export *` warning is pre-existing.
- `pnpm --filter @homemade/web lint` — still broken (ESLint v9 flat-config migration listed in pre-launch debt).
- Public bundle: the tutorial reader components are split into client modules that only load on signed-in tutorial pages; no TipTap leaks into the public bundle.

### Out of scope (deferred to later phases)

- Reviews, Q&A, errata, user-uploaded photos — Phase 5.
- Following / friending / public profile pages — Phase 6+. Handle + bio fields exist but no `/u/[handle]` route yet.
- Email digests / push notifications — deferred.
- Recommendations engine, streaks / gamification — not on plan.
- Legal pages (privacy, terms, cookies, AUP, DMCA) — separate session.

### New pre-launch debt items discovered

- The supplies-card admin UI gained a `substitutions` input but no CMS-side migration of existing SuppliesCard items. Existing tutorials still render fine (the field is optional and defaults to absent), but if substitution hints become important pre-launch, Rebecca will want a sweep through current content to fill them in.
- Adaptive icons for the reading-progress bar / TOC are CSS-only and may need a re-pass once we have one tutorial with real heading density.

## Phases 5–8

Not started. Plan unchanged.

- Phase 5: UGC pipeline & moderation
- Phase 6: Pattern testing & creator program
- Phase 7: Marketplace
- Phase 8: Premium tier, content seeding & launch readiness

---

## Commit history milestones

- `5d1b5e6` — initial monorepo scaffold
- `20e50c5` — Dockerize for production
- `81aaaff` — AWS CDK infrastructure + GitHub Actions deploy workflow
- `f49abb8` — fix: add `apps/web/public/.gitkeep`
- `cf74228` — fix: unlock route redirects to public origin
- `7924cbb` — fix: force https in unlock redirect origin in production
- `dc2f04c` — docs: BUILD_PROGRESS.md
- `4b7a662` — feat(db): packages/db with Prisma 7 + initial schema + first migration
- `60a38c9` — feat(admin): Clerk auth + first /admin dashboard
- `03ce874` — docs: log Phase 2a + 2b in BUILD_PROGRESS
- `90973ae` — feat(admin): categories CRUD + JIT user provisioning + audit log + migrate-in-CI
- `bfd9dc9` — docs: log Phase 2c
- `568ec8a` — feat(admin): glossary + sub-categories + tags CRUD + Clerk webhook + favicon
- `ef7d528` — fix(infra): defer CLERK_WEBHOOK_SIGNING_SECRET mount (CFN race fix)
- `fac45dc` — feat(admin): /admin/tutorials CRUD + TipTap editor with five custom blocks + version history
- `3db774b` — feat(admin): /admin/media CRUD + Cloudflare Images direct-upload
- `fed610c` — feat(public): tutorial / category / homepage + TipTap-JSON renderer (Phase 3a)
- `13930f1` — Phase 3b Typesense search + Phase 3c Capacitor 8 mobile wrapper + three extra TipTap blocks + admin Preview metadata polish
- _this session_ — feat(public): Phase 4 accounts — bookmarks, projects, reading-progress / TOC / project companion, beginner mode, /me dashboard + settings, signed-in header, supplies substitutions
- Phase 3a (this session): public tutorial / category / home pages, TipTap-JSON renderer with no TipTap runtime in the public bundle, admin Preview toggle
