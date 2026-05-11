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

- Upgrade Cloudflare SSL from **Flexible** → **Full (strict)** with a Cloudflare Origin Certificate + HTTPS listener on ALB
- Tighten the `claude-deploy` IAM user — drop `AdministratorAccess` for a scoped policy once the resource set stabilises
- Rotate all credentials (AWS keys, Cloudflare token, Neon, Clerk, splash password)
- Move secrets out of `.env.credentials` and into a password manager
- GitHub Actions: switch to Node 24 (`FORCE_JAVASCRIPT_ACTIONS_TO_NODE24=true` or upgrade action versions)
- Add CloudWatch alarms (task failure, ALB 5xx, ECS service unhealthy)
- ESLint won't run — `next lint` removed in Next 16, ESLint v9 needs flat config. Migrate to `eslint.config.js` so we have a linter again.
- SubTutorialCard cross-references: deleting a tutorial leaves dead `tutorialId` refs in other tutorials' TipTap JSON. Either scan JSON content for refs before delete and block, or schedule a periodic cleanup that nulls dangling refs.

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
- Public tutorial rendering — Phase 3
- Live preview pane
- Autosave / debounced save (explicit Save button only)
- Inline image upload inside the editor body
- Background scheduled-publish job
- SubTutorialCard reference clean-up on delete (dead-link check skipped — flagged above)
- SEO meta editor (not in schema yet)

### Architecture decisions to note

- **Admin lives at `/admin` route inside `apps/web`, not a separate `apps/admin` app.** The architecture doc specifies a separate app; we're starting simpler (single app, Clerk-role-gated route) because for now Rebecca is the only admin and the additional infra cost of a second deploy target isn't worth it pre-launch. We can split into `apps/admin` later if/when scale or separation needs justify it. Tracked as a possible-future-refactor, not debt.
- **Admin authorisation is a hardcoded email allowlist** in `apps/web/src/lib/auth.ts`, not a Prisma `User.role` lookup. To be replaced once the Clerk webhook is wired and `User` rows are populated automatically on signup.
- **Recipe / Pattern / Review / Q&A / UserProject / Marketplace / Creator / Errata models intentionally deferred** until the phases that need them. The schema is incremental.

---

## Phases 3–8

Not started. Plan unchanged.

- Phase 3: The reading experience (tutorial page, homepage, category pages, search)
- Phase 4: Accounts & user state
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
