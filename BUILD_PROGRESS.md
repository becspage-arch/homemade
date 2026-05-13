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
- ESLint cleanup pass. Phase 1 of the migration shipped in the pre-launch debt sweep: flat-config in `apps/web/eslint.config.mjs`, `pnpm lint` exits 0 on the current codebase with 73 warnings, lint job in CI as a `continue-on-error` step. A follow-up session tightens the downgraded rules (`react-hooks/set-state-in-effect`, `react-hooks/immutability`, `react-hooks/exhaustive-deps`, `react/no-unescaped-entities`, `@next/next/no-img-element`, `@typescript-eslint/no-explicit-any`, `prefer-const`) back to `error` and cleans the violations.
- ~~SubTutorialCard cross-references: deleting a tutorial leaves dead `tutorialId` refs in other tutorials' TipTap JSON.~~ Resolved in the pre-launch debt sweep — `deleteTutorial` now strips matching `subTutorialCard` blocks from every other tutorial's body, snapshotting a `TutorialVersion` first so the strip is reversible. Audit-logged per affected referrer separately from the delete.
- **Typesense CDK secret-mount.** CDK code wired for the three secrets (`homemade/typesense-host`, `homemade/typesense-admin-api-key`, `homemade/typesense-search-only-api-key`) in the pre-launch debt sweep — gated behind `MOUNT_TYPESENSE_SECRETS=1`, IAM grant always present. To turn search on: (a) Rebecca creates a Typesense Cloud cluster and pastes the three values into AWS Secrets Manager under those names; (b) run `pnpm --filter @homemade/infra exec cdk deploy` (IAM-only diff, no task replacement); (c) run `MOUNT_TYPESENSE_SECRETS=1 pnpm --filter @homemade/infra exec cdk deploy` (task replacement; IAM is already in place).
- **Mobile splash asset.** Current splash source is `favicon-1024.png` (1024×1024). Capacitor wants 2732×2732 with content centred in the inner 1200×1200 — replace `apps/mobile/assets/splash.png` and rerun `pnpm --filter @homemade/mobile assets:generate` then `sync`. Same for splitting the icon foreground / background pair into a transparent sage "h" + a sage tile for a proper Android adaptive icon.
- **iOS TestFlight workflow — DISABLED, needs fastlane match rewrite.** The pre-launch debt sweep shipped `.github/workflows/ios-testflight.yml` modelled on Aura's manual-signing pattern (P12 + provisioning profile + ASC API key, all base64-encoded into GitHub Secrets). On Homemade it failed every variant we tried at the macOS keychain `security import` step:
  - `.p12` with the original PowerShell-set password → `MAC verification failed`. Diagnostics later showed PowerShell had written `pw.txt` as UTF-16-LE, so the actual encryption password was 26 bytes of UTF-16, not the 12 ASCII chars typed into GitHub.
  - Regenerated `.p12` with `homemade1234` ASCII inline, GitHub secret length matched → still rejected. (Likely a lookalike-character typo when pasted into the GitHub UI.)
  - Regenerated `.p12` with empty password, `security import -P ""` → still rejected (macOS `security` is famously inconsistent with empty `.p12` passwords).
  - Regenerated `.p12` with hardcoded password `ci` baked into the workflow → still rejected.
  - Regenerated `.p12` with OpenSSL `-legacy` flag (3DES instead of AES-256) → openssl pre-check on the macOS runner now rejected it (because OpenSSL 3 needs the legacy provider explicitly enabled to read legacy `.p12`s as well).
  Conclusion: the manual-signing chain (PowerShell → base64 → GitHub Secret → macOS `security import`) has too many encoding seams. Workflow is left in the repo with `workflow_dispatch` requiring an explicit "I've read BUILD_PROGRESS" input so it can't accidentally fire.
  **Next session's path:** rewrite the workflow around `fastlane match`. Match stores certs + provisioning profiles in their own private encrypted git repo; the workflow only needs `MATCH_PASSWORD` and a `MATCH_GIT_BASIC_AUTHORIZATION` to fetch them, and Match itself handles the keychain installation idempotently. Side benefit: the same Match repo can serve future Aura-style apps.
- **`proxy.ts` matcher leaks bot traffic into Clerk-less renders.** The negative lookahead `.*\.[a-zA-Z]+$` was meant to skip static assets but also skips category-slug-shaped URLs with file-extension-looking suffixes (e.g. `/wp-admin.php`, `/sitemap.xml.html`, `/.env`). Those route to the dynamic `[categorySlug]` page (and other server components calling `getCurrentDbUser()`), which then hits Clerk's `auth()` with no middleware-set context and throws `Clerk: auth() was called but Clerk can't detect …`. Surfaced the day Sentry was wired (2026-05-11) — ~17 occurrences/hour from bot probes, no real-user impact. Fix in a small session: replace the broad regex with an explicit deny-list of asset roots, OR wrap `getCurrentDbUser()` in a try/catch that returns null on Clerk errors. Worth fixing before the splash gate comes down so Sentry's noise floor stays low.

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

## Phase 5 — UGC pipeline & moderation + admin menu restructure

### ✅ Done

**Schema (`20260520000000_phase5_ugc_moderation`):**

- `Review` (one per user+tutorial, status enum `ReviewStatus` =
  PENDING_MODERATION / PUBLISHED / HIDDEN / REMOVED, helpfulCount,
  moderation note). `ReviewHelpful` join row.
- `UGCPhoto` (per-photo row pointing at Media, status enum
  `UGCPhotoStatus` = PENDING_MODERATION / APPROVED / REJECTED,
  `nsfwScore` Float?, `nsfwClassification` String?, rejectionReason).
- `Question`, `Answer`, `QuestionUpvote`. Shared `UGCStatus` enum
  (PENDING_MODERATION / PUBLISHED / HIDDEN / REMOVED). Answers carry an
  `isAuthorAnswer` boolean — true for editor / admin replies, which
  surfaces a "from Homemade" badge on the public Q&A.
- `Errata` (open / addressed / dismissed; nullable userId for future
  anonymous reports).
- `Report` (cross-cutting abuse / spam reports; generic
  `targetType` + `targetId`; reason enum `ReportReason`; status enum
  `ReportStatus`).
- `UserSuspension` history table + denormalised `User.isSuspended`
  Boolean and `User.suspendedUntil` DateTime? for fast filtering.
- `Notification` + `NotificationType` enum — in-app feed under /me.
  Email / push are deferred.

**Role helper:** `requireAdminRole({ minimum: 'EDITOR' | 'ADMIN' })`
replaces the old `isAdmin()` check. Editors can moderate community
content + apply bounded suspensions; permanent bans, role changes,
and audit-log access stay ADMIN-only.

**Admin sidebar restructure** (`apps/web/src/components/admin/admin-shell.tsx` +
`admin-sidebar.tsx`): replaces the flat seven-link nav with the eight
top-level groups from `project_admin_roadmap.md`:

1. Dashboard
2. Content (Tutorials / Categories / Sub-categories / Tags / Glossary / Media)
3. Users (List / Suspensions / Data requests — last is placeholder)
4. Community (Reviews / UGC photos / Q&A / Errata / Reports)
5. Billing (placeholder — Phase 7/8)
6. Marketing (placeholder — Phase 8)
7. Analytics (placeholder — Phase 8 / PostHog)
8. System (Audit log / Settings / Feature flags / Jobs — last three placeholders, group is ADMIN-only)

Group state persists per-user in localStorage. Mobile collapses to a
slide-out drawer with a menu toggle.

**New /admin routes (community moderation):**

- `/admin/reviews` — moderation queue with status filter + approve /
  hide / remove actions. Note required on hide / remove.
- `/admin/ugc-photos` — moderation grid with NSFW score visible per
  photo and a "flagged" badge when score ≥ 0.5. Approve / reject
  actions. Reject reason required.
- `/admin/questions` — Q&A moderation. Approve / hide / remove on each
  question; approve / hide on each answer; admin / editor can post a
  direct answer from the queue that publishes immediately with
  `isAuthorAnswer = true`.
- `/admin/errata` — open queue with mark-addressed (note + edit-tutorial
  link) or dismiss actions.
- `/admin/reports` — cross-cutting abuse queue with status + target
  filters; resolution closes the report and links back to the target's
  primary queue.
- `/admin/users` — list with search + role / suspended filters; row →
  `/admin/users/[id]` activity view with role-change (ADMIN only),
  suspend (EDITOR for bounded, ADMIN for indefinite), un-suspend, plus
  recent reviews / photos / questions / projects and suspension history.
- `/admin/users/suspended` redirects to the suspended filter.
- `/admin/audit-log` — paginated, filterable viewer (actor email /
  action substring / resource substring) for the data we've been
  collecting since Phase 2c. ADMIN-only.

Placeholder routes for the deferred phases all live and render a "lands
in Phase X" note so the sidebar never points at a 404:
`/admin/billing`, `/admin/marketing`, `/admin/analytics`,
`/admin/system/settings`, `/admin/system/feature-flags`,
`/admin/system/jobs`, `/admin/users/data-requests`.

**Public tutorial-page UGC blocks** (added to
`apps/web/src/app/(public)/[categorySlug]/[tutorialSlug]/page.tsx`,
loaded via `apps/web/src/lib/ugc-loader.ts`):

- **Photos** — grid of approved photos with optional captions on
  hover/tap. "Share yours" CTA for signed-in members with a
  `UserProject` (IN_PROGRESS or COMPLETED). Upload via the existing
  Cloudflare direct-upload pattern through a new
  `/api/ugc/photo-upload` endpoint (open to any signed-in member, not
  admin-gated). Submission creates a Media row + UGCPhoto row, runs the
  NSFW pre-screen, and either auto-rejects (≥ 0.9 score) or holds for
  human review (everything else).
- **Reviews** — star summary at the top with average + per-bucket
  distribution. List of PUBLISHED reviews ordered by helpfulCount
  desc. Each review carries a helpful toggle (members), report link,
  and author handle. "Write a review" CTA only enabled for members
  with a COMPLETED UserProject on this tutorial. Composer creates a
  Review row with `PENDING_MODERATION`. One review per user per
  tutorial.
- **Q&A** — published questions sorted by upvotes desc then recent,
  with all PUBLISHED answers nested. ADMIN / EDITOR answers carry a
  "from Homemade" badge. Members can ask, answer, upvote, and report.
- **Errata** — subtle "Spot an issue with this tutorial?" link in the
  tutorial footer; modal with a short body field. Allowed even when
  signed out (per spec; `userId` is nullable).
- **Report** — shared modal accessible from review / photo / question /
  answer items. Reason dropdown + optional description.

**/me extensions** for the signed-in reader:

- `/me/reviews` — every review you've written with its current status
  and moderation note if any.
- `/me/photos` — your photos with status pill and rejection reason
  surfaced when relevant.
- `/me/questions` — your questions and answers with status.
- `/me/notifications` — in-app feed of moderation outcomes
  ("Your review of {tutorial} was published" / "Your photo of
  {tutorial} wasn't approved: {reason}" etc). Unread count in the /me
  nav. Mark-all-as-read button.

**NSFW scanner:** `apps/web/src/lib/nsfw-scan.ts` wraps AWS Rekognition's
`DetectModerationLabels`. Reads `AWS_REGION` / `AWS_DEFAULT_REGION` to
decide whether to even try; gracefully returns
`{ scanned: false, skippedReason }` if region isn't set, the SDK throws,
or the image fetch fails. Threshold map:
≥ 0.9 → auto-reject with a generic reason; 0.5–0.9 → stays
PENDING_MODERATION but the admin queue tags it as "flagged"; < 0.5 →
ordinary PENDING_MODERATION. SDK package
`@aws-sdk/client-rekognition@^3.717.0` added to `apps/web` deps.

**IAM follow-up (deferred):** The ECS task role needs
`rekognition:DetectModerationLabels` to actually scan. Phase 5
**did not edit** `infra/lib/homemade-stack.ts` because the hardening
pass session is in flight and editing the stack from two sessions risks
a CDK conflict. Until that permission is granted, the scanner silently
returns `scanned: false` and photos stay `PENDING_MODERATION` for human
review — exactly the safe default the worker spec called for. When the
hardening pass merges, a small follow-up CDK pass should add a
`Policy.fromStatementJson({ Action: 'rekognition:DetectModerationLabels',
Effect: 'Allow', Resource: '*' })` to the ECS task role using the same
two-step pattern Phase 2e set up. No new ECS secret is needed (no new
secret references), so this can be a single deploy.

**Audit-log new action types:**
`review.approved` / `review.hidden` / `review.removed`,
`photo.approved` / `photo.rejected`,
`question.approved` / `question.hidden` / `question.removed`,
`answer.approved` / `answer.hidden` / `answer.author_posted`,
`errata.addressed` / `errata.dismissed`,
`report.create` (on submission) and `report.resolved`,
`user.role_changed`, `user.suspended`, `user.unsuspended`.

**Build hygiene:**

- `pnpm --filter @homemade/web typecheck` — passes.
- `pnpm --filter @homemade/db typecheck` — passes.
- `pnpm --filter @homemade/web build` — passes. New routes show up in
  the route manifest.
- `pnpm --filter @homemade/web lint` — still broken (ESLint v9 flat-
  config migration is pre-existing pre-launch debt; this session
  doesn't introduce new lint suppressions).
- No TipTap leakage into the public bundle (UGC blocks are plain React
  client islands).

### Out of scope (deferred)

- Legal pages (privacy, terms, cookies, AUP, DMCA, UGC reuse clause) —
  separate session.
- GDPR data export / deletion endpoints — bundled with the legal-pages
  session.
- Email notifications for moderation outcomes — in-app /me feed is
  enough for Phase 5.
- Auto-approval thresholds for trusted users.
- Verified Maker / Pattern Tester roles — Phase 6.
- Public user profile routes at `/u/[handle]` — Phase 6.
- Real-time moderation queue updates (Ably).
- Sentry / PostHog wiring.
- Inngest background jobs (everything runs synchronously / inline).
- Typesense secret-mount (separate hardening follow-up).

### New pre-launch debt items discovered

- **ECS task role needs `rekognition:DetectModerationLabels`.** Until
  granted, NSFW pre-screen no-ops gracefully and every photo gets
  human moderation. Apply via a small follow-up CDK deploy after the
  hardening pass merges.
- **Public UGC photo uploads aren't enabled until legal pages land.**
  The admin queue and upload flow work for test accounts so Rebecca
  can exercise the path; the `/admin/ugc-photos` page surfaces this in
  an admin notice block. When the legal session lands, drop the notice
  and the upload flow is already there.

## Phase 6 — Creator program + pattern testing + public maker profiles

### ✅ Done

**Schema (migrations `20260601000000_phase6_creator_enums` + `20260601000001_phase6_creator_program`):**

- `User` additions: `isCreator` (Boolean, default false), `creatorVerifiedAt` (DateTime?), `isPatternTester` (Boolean, default false). New index on `isCreator`.
- `Tutorial.creatorId` (String? FK to User, `onDelete: SetNull`). Null = Homemade-authored. Index on (creatorId, status, publishedAt desc).
- `TutorialStatus` enum gains `PENDING_MODERATION` (split into its own enum-only migration so the program changes can run in a single transaction — Postgres < 14 forbids using a freshly-added enum value in the same txn).
- `CreatorProfile` — `userId` unique, `bio`, `specialty` (≤200 chars), socials (`websiteUrl`, `instagramHandle`, `youtubeHandle`, `tiktokHandle`, `substackUrl`, `pinterestHandle`), `applicationStatus` (`CreatorApplicationStatus`: NONE/APPLIED/APPROVED/REJECTED), `applicationNote`, `appliedAt`, `decidedAt?`, `decidedById?`, `rejectionReason?`.
- `PatternTest` — `tutorialId` + `creatorId` FKs, `status` (`PatternTestStatus`: DRAFT/RECRUITING/IN_PROGRESS/COMPLETED/CANCELLED), `title`, `briefForTesters`, `maxTesters` (default 5), `recruitingClosesAt?`, `completedAt?`.
- `TestAssignment` — `patternTestId` + `userId` FKs (unique on the pair), `status` (`TestAssignmentStatus`: APPLIED/ACCEPTED/IN_PROGRESS/COMPLETED/WITHDRAWN/REJECTED), `applicationNote?`, `feedback` (Json — structured form payload), lifecycle timestamps + `rejectionReason?`.
- `NotificationType` enum gains: CREATOR_APPLICATION_APPROVED, CREATOR_APPLICATION_REJECTED, CREATOR_TUTORIAL_PUBLISHED, CREATOR_TUTORIAL_REJECTED, CREATOR_TUTORIAL_SUBMITTED, PATTERN_TEST_APPLICATION_ACCEPTED, PATTERN_TEST_APPLICATION_REJECTED, PATTERN_TEST_FEEDBACK_RECEIVED.

**Server actions** consolidated into two libs:

- `apps/web/src/lib/creator-actions.ts` — application submit / decide / profile edit, tester opt-in/opt-out, pattern test CRUD + transitions, tester apply / start / withdraw / submit feedback, creator-tutorial submit-for-moderation + admin moderate, admin revoke / tester toggle.
- `apps/web/src/lib/creator-tutorial-actions.ts` — creator-scoped tutorial create/update/delete (mirrors the admin lib but gated to `tutorial.creatorId === user.id`, defaults `sourceType: CREATOR`).

Notifications fire via the existing `notify()` helper for: application decided, tutorial submitted (admins) / published / sent back, pattern test applicant accepted / rejected, pattern test feedback submitted (to creator).

**Public maker surfaces:**

- `/makers` — directory of approved + verified creators. Card grid (avatar = first letter of name on sage disc, name + verified dot, handle, specialty, published-tutorial count). Sort: "recently active" (default) or "by handle".
- `/makers/[handle]` — creator profile page. Avatar, name + verified dot, specialty, bio, social links rendered as small Lora links (Website / Instagram / YouTube / TikTok / Pinterest / Substack). Their published tutorials below, rendered through the existing `TutorialCard`. 404 if the user isn't an approved + verified creator, or their handle isn't set yet.

**Public pattern test board:**

- `/patterns` — list of `RECRUITING` pattern tests with brief preview, max testers + applicant count, "Apply" CTA. Category filter chips driven by the live `Category` table. Logged-out users see "Sign in to apply"; logged-in non-testers see "Join the tester pool first".
- `/patterns/[id]` — pattern test detail. Eyebrow / title / status pill / creator byline / closes-on date. Full brief in a parchment block. Tutorial summary link. Apply CTA opens a small note-to-the-creator form.

**`/me/creator` subroutes:**

- `/me/creator` — gates the experience: no profile → redirect to `apply`; APPLIED → "Under review" empty state; REJECTED → reason + re-apply link; APPROVED → dashboard with tutorial draft/in-review/published counts, active pattern tests, quick actions, recent activity.
- `/me/creator/apply` — single form: handle (only when not yet set), specialty, bio (≥30 chars), private note to reviewers, socials (all optional). Re-submits update the existing row.
- `/me/creator/profile` — edit bio / specialty / handle / socials. Live edits.
- `/me/creator/tutorials` — list with status filter chips (all / draft / in review / published / archived).
- `/me/creator/tutorials/new` + `/me/creator/tutorials/[id]` — reuses the admin `TutorialForm` + full TipTap editor (same 8 custom blocks, same preview pane). Creator-authored tutorials start in DRAFT; "Submit for review" transitions to `PENDING_MODERATION`. Once PUBLISHED, edits go live immediately (with version snapshots) — explicit scope choice: lower friction over re-moderation cycles.
- `/me/creator/patterns` — list of the creator's pattern tests.
- `/me/creator/patterns/new` + `/me/creator/patterns/[id]` — create / edit form with tutorial picker (creator's own tutorials only). Edit page shows status-transition controls + tabs to applicants and feedback views.
- `/me/creator/patterns/[id]/applicants` — applicant queue with each applicant's existing activity (project count, review count) + note. Accept (subject to remaining slots) or reject with optional note.
- `/me/creator/patterns/[id]/feedback` — aggregated view of completed assignments: per-axis average score cards, average time taken, then each tester's individual notes.

**`/me/tester` subroutes:**

- `/me/tester/apply` — self-serve. One button flips `isPatternTester` on. Lighter than the creator review path per the spec.
- `/me/tester` — dashboard split into Active / Waiting / Past with status pills.
- `/me/tester/assignments` — full list of every assignment the user has.
- `/me/tester/assignments/[id]` — assignment detail with the brief + link to the tutorial, lifecycle buttons (start / withdraw), and the structured feedback form (1–5 scores + comment on pattern clarity / instruction clarity / photo accuracy / supplies accuracy; time taken; what worked / what didn't). Submitted feedback locks the form and shows it back read-only.

**Admin surfaces:**

- New "Creators" group in the sidebar (renders above Billing/Marketing/Analytics for visibility).
- `/admin/creators` — two tabs: "Applications" (APPLIED, sorted oldest first) and "Active creators" (approved + isCreator, sorted by verified date desc). Active-creator rows link to `/makers/[handle]` and offer a "Moderate tutorials" shortcut.
- `/admin/creators/[id]` — application review page. Full profile draft + socials + the applicant's prior reviews / photos / questions / projects so admins can judge quality. Approve / Reject controls. Approval flips `isCreator + creatorVerifiedAt`; rejection requires a note.
- `/admin/creators/moderation` — cross-creator queue of all PENDING_MODERATION creator tutorials. Each row: link into the full admin tutorial editor (read + edit) + inline Publish / Send-back-with-note controls.
- `/admin/patterns` — overview of every pattern test on the platform with status filter chips. Read-only; admin can click the creator link to drill into the user.
- `/admin/users/[userId]` extended with a "Creator program" card: creator status, public profile link, revoke-creator action (ADMIN only), and a tester-pool toggle (EDITOR or above).
- Admin tutorial list now includes a "pending moderation" filter chip + a burnt-sienna PENDING_MODERATION status badge.
- `transitionTutorialStatus` table extended: DRAFT can move to PENDING_MODERATION, PENDING_MODERATION can move to DRAFT or PUBLISHED.

**Public tutorial attribution:**

- `TutorialChrome` accepts an optional `attribution` prop. When the tutorial has a creator, renders "By {creator-name}" with a link to `/makers/[handle]` and a small sage verified dot when applicable. When the tutorial has no creator, renders "By Homemade". The byline sits between the info bar and the actions bar.
- `TutorialCard` accepts an optional `byline` string for the same "By Homemade" or "By {creator}" attribution on cards. Not threaded through everywhere yet — used by the public attribution row on the detail page where it most matters; cards stay clean by default to avoid visual noise on dense grids.

**Build hygiene:**

- `pnpm --filter @homemade/web typecheck` — passes.
- `pnpm --filter @homemade/web build` — passes. All 17 new routes registered.
- Client components type-only use `@homemade/db` enums via local string-union types so the pg adapter doesn't leak into the public bundle (same pattern as the existing `user-controls.tsx`).
- Public bundle stays TipTap-free; the creator editor uses the same admin TipTap module (server-route-gated).

### Open scope choices resolved

- **Creator edits to published tutorials** go live immediately with a `TutorialVersion` snapshot, instead of bouncing back to PENDING_MODERATION on every save. Chose lower friction over churn for typo fixes; the "significant change → resubmit" flag is parked for later if needed.
- **Tester opt-in** is self-serve (one button on `/me/tester/apply`). Admin can still add or remove someone from the pool manually via `/admin/users/[id]`.
- **Application detail URL** uses the `CreatorProfile.id`, not the user id, so application review is a stable URL even before approval. Active-creator rows use `/admin/users/[id]` for ongoing creator management.
- **Creator tutorial moderation queue** is a single cross-creator queue at `/admin/creators/moderation` instead of the per-creator `[id]/moderate-tutorials` shape from the spec. Reads more naturally for admins working through the backlog and keeps the URL space tidy.
- **Public follow / messaging / creator avatars / payouts / analytics** all explicitly deferred per the spec — no scaffolding added.

### Out of scope (deferred to later phases)

- Stripe / payouts — Phase 7.
- Marketplace product listings — Phase 7.
- Email notifications for any creator-program event — Phase 8 (in-app only).
- Per-creator analytics — Phase 8.
- Creator avatar uploads (uses first letter on sage disc for now).
- Creator-to-creator messaging, public follows, royalty tracking.

### New pre-launch debt items

- Creator-tutorial moderation has no preview-with-track-changes — admins read the live editor. Worth a follow-up if review volume grows.
- Pattern-test board has no search or full-text filter (only category chips). Add when volume warrants it.
- The Tutorial.creatorId FK uses `onDelete: SetNull`, so deleting a User row blanks the byline on their tutorials. That's correct for moderation flow but may not be what we want at GDPR-delete time — revisit when the GDPR session lands.

## Phase 8a — Legal compliance bundle (pre-launch gate)

### ✅ Done

**Legal entity config** (`apps/web/src/lib/legal-entity.ts`): single
source of truth for controller name, contact / DPO / legal emails,
postal address, ICO / Companies House / VAT numbers, jurisdiction, and
the policy `effectiveDate`. Every legal page renders from these values.
Set up as sole-trader (`Rebecca Page (trading as Homemade)`) with
`postalAddress` / `icoRegistrationNumber` / `companiesHouseNumber` /
`vatNumber` as null — incorporating later is a one-file change.

**Six legal pages** under `apps/web/src/app/(public)/legal/`:
- `/legal` — index card grid linking to all six.
- `/legal/privacy` — UK GDPR-shaped: who we are, what we collect (four
  categories), lawful bases (contract / consent / legitimate interest /
  legal obligation), per-processor list (Clerk / Neon / AWS / Cloudflare
  / PostHog / Sentry / Inngest / Upstash / Typesense / Google Workspace /
  Anthropic / Stripe), international transfers via SCCs, retention
  periods, your rights including the link to `/me/data-rights` and the
  ICO complaint route, minimum age 16, cookie summary, change-notice
  policy. Table of contents at the top.
- `/legal/terms` — who we are, the service, account rules, AUP link,
  **UGC licence clause** (perpetual / irrevocable / worldwide /
  royalty-free / sublicensable, user keeps ownership, attribution by
  handle, warranty of rights, removal honours future-facing display
  only, GDPR erasure rights sit alongside the licence), our content,
  premium link, disclaimers (food / sharps / pesticides / electrical),
  UK liability cap (£100 floor / 12-month spend ceiling),
  termination, governing law (England and Wales), changes notice.
- `/legal/cookies` — categories (necessary / analytics / error
  monitoring / preferences), named cookies table with purpose / expiry /
  party / category for each, how to manage preferences (banner + browser
  settings), reminder that necessary cookies can't be opted out.
- `/legal/acceptable-use` — what's welcome, then the forbidden list
  (illegal, harassment, spam, copyright, sexually explicit, scraping,
  unauthorised security probing, misrepresentation), reporting flow,
  what happens after a breach.
- `/legal/dmca` — notice procedure with all six required elements,
  what happens next, counter-notice procedure with the four required
  elements, repeat infringer policy, misuse warning. Flagged
  `Designated agent registration pending` with a `TODO(legal)` comment
  because the formal US Copyright Office filing is Rebecca-must-do.
- `/legal/subscription-terms` — premium feature set placeholder,
  billing cycle, auto-renewal, cancellation (effective end of period,
  no pro-rata refunds), **UK Consumer Contracts Regulations 2013
  14-day cooling-off with the digital-services waiver**, refunds,
  price changes (30-day notice), VAT handling (inclusive once
  VAT-registered, exclusive until then), account closure, disputes.

All six render from `LEGAL_ENTITY` constants. Effective + last-updated
dates render via a shared `LegalHeader`; `formatDate` builds the
en-GB long form from ISO parts so server / client agree. Voice rules
audited: no `honest` / `frankly` / `delve` / `embrace` / `nurture` /
`tapestry` / `at its core` / `not just X but Y` etc. British English
throughout (organisation, behaviour, recognise).

**Cookie consent banner** (`apps/web/src/components/public/cookie-banner.tsx`)
mounted in the `(public)` route group layout (NOT the root layout —
services-activation owns root). Two views: compact (Accept all /
Necessary only / Customise — all same visual weight, so refusing is
no harder than accepting) and customise (toggles for analytics + error
monitoring, necessary disabled). Stores `homemade-consent` JSON in
localStorage and, when signed in, mirrors via the `persistConsent`
server action into `User.cookieConsent`. Re-shows when
`CURRENT_CONSENT_VERSION` is bumped (handled by version mismatch on
read). A `reopenCookieBanner()` helper + a `CookiePreferencesButton`
client component let the footer + `/me/data-rights` pop the banner.

**Consent helpers:**
- `apps/web/src/lib/consent.ts` — pure client API: `getConsent`,
  `hasAnalyticsConsent`, `hasErrorMonitoringConsent`, `setConsent`,
  `clearConsent`. Dispatches a `CONSENT_CHANGE_EVENT` on the window so
  the analytics wrappers don't need to poll.
- `apps/web/src/lib/analytics-consent.ts` — wrappers that services-
  activation imports. `applyAnalyticsConsent()` reads consent and calls
  PostHog `opt_in_capturing()` / `opt_out_capturing()` if PostHog is
  on `window`; `installAnalyticsConsentListener()` keeps it in sync
  with future changes; `shouldSendSentryEvent()` is the predicate to
  drop into Sentry's `beforeSend`. All three no-op when the underlying
  SDK is missing, so they survive whatever order services-activation
  lands its init in.
- `apps/web/src/lib/consent-actions.ts` — `persistConsent` server
  action writes `User.cookieConsent` for signed-in users; anonymous
  paths are localStorage-only.

**GDPR data rights centre** (`/me/data-rights`):
- Three sections: Export my data, Delete my account, Manage cookie
  preferences (re-opens banner).
- Listed in the `/me` nav between Notifications and Settings.
- `ExportPanel` shows the latest READY export with download link, bundle
  size and expiry, plus a confirmation step for generating a fresh one.
  Past-export history is collapsed in a `<details>`.
- `DeletionPanel` either shows the schedule-deletion form (optional
  reason) or, when a deletion is in flight, shows the countdown to
  `scheduledFor` with a Cancel button.
- `CookiePreferencesPanel` invokes `reopenCookieBanner()`.

**API routes** under `apps/web/src/app/api/account/`:
- `POST /api/account/export` — fires `requestDataExport()`. Returns
  `{ ok, requestId }` or `{ ok: false, error }`. Throttled to one
  export per hour per user via the existing-request check.
- `POST /api/account/delete` — body `{ action: 'schedule' | 'cancel',
  reason? }`. Defaults to schedule. Wraps the same server actions the
  page uses, so the audit log + suspension toggle are identical.

**`requestDataExport` server action** (`apps/web/src/lib/data-rights-actions.ts`):
- Throttles to 1/h. Creates a `DataExportRequest` row in PROCESSING.
- `buildExportBundle()` (`data-rights.ts`) walks every model that holds
  user-owned content: User, Bookmark, UserProject, Review, Question,
  Answer, UGCPhoto (URLs not bytes), Errata, Notification,
  AuditLog (actorId-authored, last 5000), CreatorProfile, PatternTest,
  TestAssignment. Wraps it as a notice-bearing JSON document.
- Uploads to R2 under `data-exports/{userId}/{uuid}.json` via the
  existing `r2Upload()` helper; the row gets `fileUrl` + `fileKey` +
  `bytes` + `expiresAt = now + 7 days`. Failures flip the row to
  FAILED with the error message.
- Audit-logged as `data_export.created` / `data_export.failed`.
- `expireStaleExports()` runs cheap on-page-load cleanup: any READY
  rows past `expiresAt` are flipped to EXPIRED with `fileUrl` cleared.

**`scheduleAccountDeletion` / `cancelAccountDeletion`:**
- Schedules a `DeletionStatus.SCHEDULED` `AccountDeletionRequest` 30
  days out. Sets `User.deletionScheduledFor`, `User.isSuspended = true`,
  `User.suspendedUntil` so the account is unusable during the grace
  period — cancelling clears all three. The actual hard-delete job
  is intentionally deferred (no Inngest yet); the queue is built so
  Rebecca can run it manually or wire an Inngest cron when services-
  activation lands. Audit-logged as `account_deletion.scheduled` /
  `account_deletion.cancelled` / `account_deletion.cancelled_by_admin`.

**Schema additions** in `phase8a_legal_compliance` migration:
- `User.cookieConsent` (Json?), `User.deletionScheduledFor` (DateTime?),
  `User.deletedAt` (DateTime?, reserved for the future hard-delete job).
- `DataExportRequest` + `DataExportStatus` enum (REQUESTED / PROCESSING
  / READY / EXPIRED / FAILED). Index on `(userId, createdAt)` and
  `(status, expiresAt)`.
- `AccountDeletionRequest` + `DeletionStatus` enum (SCHEDULED / CANCELLED
  / COMPLETED). Unique on `userId` (only one active per user). Index on
  `(status, scheduledFor)`.
- `DmcaTakedownRequest` + `DmcaStatus` enum (RECEIVED / UNDER_REVIEW /
  ACTION_TAKEN / REJECTED / COUNTER_NOTICED). FK on `resolvedById ->
  User` with `onDelete: SetNull`. Index on `(status, createdAt)`.

**Admin pages** — replaced + added:
- `/admin/users/data-requests` — replaced the placeholder. Status-
  filtered table of `DataExportRequest` rows with user, status pill,
  bytes, created / completed / expires timestamps, and any error.
  Read-only for the bundle (it's the user's data).
- `/admin/users/deletion-queue` — new. Filter by status, default
  SCHEDULED. Days-left countdown on each row. Admin-only Cancel button
  (note required) that lifts the suspension and audit-logs as
  `account_deletion.cancelled_by_admin`.
- `/admin/community/dmca` — new. Filter chips for each status, an
  inline intake form to log notices we receive by email (sworn-statement
  checkbox required), plus per-row controls to mark Under review /
  Action taken (note required) / Counter-noticed / Reject (note
  required). All actions audit-logged.

**Admin sidebar** — extended the Users group with "Deletion queue"
(replaced the data-requests placeholder), and the Community group with
"DMCA / takedowns".

**Public site footer** (`site-footer.tsx`) — was a wordmark + tagline
strip; now a three-row footer with brand row, the legal nav (Privacy /
Terms / Cookies / Acceptable use / DMCA / Subscription terms / Cookie
preferences / Data rights for signed-in users), and a fine-print row
with `LEGAL_ENTITY.name` + jurisdiction + ICO registration status.
Server component that reads Clerk session via `auth()` to decide
whether to show the data-rights link.

**Docs:**
- `docs/ico-registration.md` — what ICO is, the £40/year Tier 1 fee,
  the registration URL, the data needed, where to plug the
  registration number once it exists, calendar reminder for renewal,
  and the related external follow-ups list (email aliases / postal
  address / DMCA designated agent / VAT / Companies House).
- `docs/email-aliases-needed.md` — the three aliases (`privacy@`,
  `dpo@`, `legal@`), where to create them in Google Workspace, and
  the Gmail filter setup so each lands in its own label.

**Voice / British English audit:** every page hand-read against the
banned-phrase list in `feedback_homemade_voice.md`. One instance of
"honest" replaced with "plain-spoken". British spellings throughout
(`personalised`, `organisation`, `behaviour`, `recognise`, `licence`
the noun, `license` the verb).

### Out of scope (deferred)

- The hard-delete job that runs after the 30-day grace period — needs
  Inngest, which is Phase 1 deferred. Until that lands, scheduled
  deletions stay SCHEDULED and the account stays suspended until
  Rebecca runs the deletion manually.
- Email notifications for "Your export is ready" / "Your deletion
  was cancelled by an admin" — no email provider wired yet.
- Public DMCA submission form (currently admin-only intake of
  notices Rebecca receives by email).
- Wiring the Sentry / PostHog init to actually call
  `installAnalyticsConsentListener()` and `shouldSendSentryEvent()` —
  belongs to the services-activation session, which owns those
  files. Wrappers are ready and import-stable.

### New pre-launch debt items

- **Hard-delete job**. The 30-day deletion queue is populated and
  visible to admins; the job that actually scrubs PII + sets
  `User.deletedAt` + cascades content removal needs an Inngest cron
  once services-activation lands.
- **DMCA designated agent**. `legal/dmca` flags the registration as
  pending. Rebecca to file with the US Copyright Office
  (`copyright.gov/dmca-directory/`), then the page's "pending" line
  can be replaced with the listed agent.
- **Email aliases**. Privacy / DPO / Legal addresses are linked from
  every legal page but bounce until the aliases exist (`docs/email-
  aliases-needed.md`).
- **ICO registration**. `LEGAL_ENTITY.icoRegistrationNumber = null`
  renders as "pending" in the privacy page footer and the site footer
  fine print. Rebecca to register, then bump the value in
  `legal-entity.ts` (`docs/ico-registration.md`).
- **Public DMCA submission form**. Currently admin-only intake.
  Lower priority than the agent registration but worth adding when
  notice volume justifies it.

### Build hygiene

- `pnpm --filter @homemade/db typecheck` — passes.
- `pnpm --filter @homemade/web typecheck` — passes.
- `pnpm --filter @homemade/web build` — passes (Next.js 16 /
  Turbopack). Pre-existing Prisma `export *` warning unchanged.
- Migration `20260605000000_phase8a_legal_compliance` applies cleanly
  on top of Phase 6.

## Phases 7–8

Plan unchanged.

- Phase 7: Marketplace + creator payouts
- Phase 8: Premium tier, content seeding & launch readiness

---

## Phase 8 — Content pipeline build queue

The pipeline needed to author and publish ~2,000 recipes plus ~500–700 foundational techniques. Steps run in dependency order; each step blocks the next.

Image generation is **deferred** through this whole phase. Bodies are authored without heroes. Heroes batch-generate from budget allocated at pre-launch, attached to existing Tutorial rows in one pass.

### Step 1 — Page-design review and lock

**Goal.** Rebecca walks through the two existing draft tutorials (béchamel + strawberry jam) in admin preview, desktop and mobile. Lists what's missing or wrong. The page design then locks.

**Deliverable.** `docs/page-design.md` — the recipe page and the technique page, every component, every field, every interaction. Header (title, hero, info bar with time / servings / difficulty / dietary tags / freezable badge / batchable badge). Body sections. Sidebar (saved recipes, sticky TOC, project companion). Footer (sources, related, made-by-others). Mobile rules. Print rules. Must support: ingredient scaling, freezable / batchable / make-ahead notes, dietary tags, prep / cook / total time, servings, cuisine and meal-type filters, save-for-later, the eight existing custom blocks, structured ingredients.

**Out.** No code. No schema. Spec only.

### Step 2 — Schema migration ✅ landed

**Goal.** Apply the recipe-side schema as a single Prisma migration.

**Deliverable.** Shipped in migration `20260613000000_phase_8_step_2_recipe_schema`. Adds:

- `TutorialType` enum (`RECIPE` | `TECHNIQUE`) + `Tutorial.type` discriminator. Existing rows default to `TECHNIQUE`; strawberry jam backfilled to `RECIPE`, béchamel stays `TECHNIQUE`.
- Recipe metadata on `Tutorial`: `servings`, `yieldDescription`, `prepMinutes`, `cookMinutes`, `restingMinutes`, `chillingMinutes`, `totalMinutes`, `scalable`, `freezable`, `freezeNotes`, `batchable`, `batchNotes`, `makeAheadNotes`, `dietaryFlags[]`, `cuisine`, `mealType`, `mood[]`, `temperatureCelsius`, `temperatureNote`, `nutritionalInfoPerServing`, `foundational`, `leftoverTutorialId`. All field-up-front per `feedback_schema_all_fields_upfront.md`.
- New tables: `Ingredient` (slug, name, category, defaultUnit, dietaryFlags, commonSubstitutes, aliases, beginnerNote, isStaple, isAllergen + allergenType, seasonality, shelfLifeDays, storage, nutritionalInfoPer100g), `Tool` (slug, name, category, aliases, isPurchasable, typicalPriceGbp, notes), `RecipeIngredient` (cascade-delete on Tutorial, restrict-delete on Ingredient, position, prepNote, isOptional, groupLabel, substitutionAllowed), `RecipeTool` (cascade / restrict pattern, isOptional, notes, position).
- Indexes on `(type, …)` for the public-page filters and `(slug)` / `(category)` on master tables.

Additive only — no column drops, no breaking renames. Existing tutorials still render unchanged.

**Out.** UI changes (Step 3). Master-table seeding (Steps 4 + 5). Bulk re-categorisation of existing tutorials.

### Step 3 — Structured ingredients TipTap block ✅ landed

**Goal.** New `ingredientsList` block with scalable rows referencing master Ingredient rows.

**Deliverable.** Shipped together with Step 2:

- Admin TipTap extension at `apps/web/src/components/admin/editor/extensions/ingredients-list.tsx`. Type-ahead row picker hits `searchIngredients` (admin-only server action); inline "+ create new ingredient" modal calls `createIngredientFromEditor` and adopts the new row into the editing row without leaving the page.
- Toolbar "ingredients" insert button seeds new blocks with the recipe's `defaultServings` from the form state.
- Public client renderer at `apps/web/src/components/public/tutorial-content/blocks/ingredients-list.tsx`. Renders `1× / 2× / 4× / Custom servings` chips, recomputes amounts on change, hides the scaler with a tooltip when `Tutorial.scalable === false`. Each row links to a future `/ingredients/{slug}` page.
- Tutorial-save sync: `apps/web/src/lib/recipe-ingredients-sync.ts` walks the body JSON on every `createTutorial` / `updateTutorial` / creator-side equivalent and rebuilds the `RecipeIngredient` join rows. Free-text rows (no ingredientId) stay in the editorial body but don't mirror to the join table.
- Admin form gains a Type selector + a full Recipe-metadata fieldset (servings, yield, prep/cook/resting/chilling, scalable, freezable + notes, batchable + notes, make-ahead notes, dietary flags, cuisine, meal type, mood, temperature + note, leftover tutorial selector). Technique tutorials see a `foundational` toggle instead.
- Public tutorial page surfaces the recipe metadata in the info bar + a dietary / freezable / batchable / make-ahead badge row when `Tutorial.type === RECIPE`.
- New analytics events documented in `docs/analytics-taxonomy.md` and wired: `ingredients_scaled` (client, on scale chip click) and `ingredient_created_inline` (server, on the inline-create modal). `tutorial_viewed` now also carries `tutorialType`, `cuisine`, `mealType`.

**Out.** Method-narrative `{{tokenId}}` substitution (Step 8). `equipmentList` block — deferred to a future small session per the prompt's explicit decision. Master ingredient / tool seeding (Steps 4 + 5).

### Step 4 — Master ingredient list

**Goal.** Draft `docs/ingredient-master.md` and seed the Ingredient table.

**Deliverable.** 300–500 entries with slug / name / pluralName / defaultUnit / dietaryFlags / commonSubstitutes / notes (UK-US naming gotchas). `packages/db/scripts/seed-ingredients.ts` runs idempotent upsert against dev + prod.

**Out.** Tools (step 5). Browsing UI.

### Step 5 — Master tools list

**Goal.** Draft `docs/tools-master.md` and seed the Tool table.

**Deliverable.** 150–250 entries. `packages/db/scripts/seed-tools.ts`.

**Out.** Prices, retailer links, marketplace integration (all Phase 7).

### Step 6 — Recipe backlog

**Goal.** Draft `docs/recipe-backlog.md`. ~2,000 recipes organised by category.

**Deliverable.** Heavy categories: British, Italian, French, American, Mediterranean, Middle Eastern, North African, Caribbean, Eastern European, Indian (Anglo-Indian only — modern regional deferred), baking, preserves, desserts, soups, salads, breakfasts, drinks. Heavy air-fryer + slow-cooker sections (high SEO demand). Cross-cutting use-cases: Sunday roasts, weeknight, batch-cook, lunchbox, kids, Christmas, Friday pizza, curry night, comfort food. Deferred-until-v2 cuisines flagged at the end (Korean, Vietnamese, Thai, modern Japanese, modern Indian beyond Beeton, modern Mexican / Latin American). Vegetarian / vegan live as variants within parent dishes, not a standalone category.

**Out.** Tutorial body writing (step 10+).

### Step 7 — Technique backlog prune

**Goal.** Cut `docs/content-backlog.md` from ~2,500 entries down to ~500–700 truly foundational techniques.

**Deliverable.** Foundational = standalone reference content a reader consults to learn HOW (knife skills, kit, basic methods, mother sauces, foundation breads, ingredient deep-dives, food safety). Anything that's a complete dish moves to the recipe backlog. Cross-reference each moved entry in the commit body so we have an audit trail.

**Out.** Writing technique bodies. Building the technique → recipe link UI.

### Step 8 — Body-authoring prompt rewrite

**Goal.** Rewrite the body-authoring section of `docs/tutorial-author.md` for the recipe-first shape.

**Deliverable.** Prompt produces JSON matching the updated `TutorialUploadInput`. Bodies include `ingredientsList` blocks, recipe metadata fields, freezer / batch / make-ahead notes, scaling tokens in the method narrative. Voice rules strict (`feedback_homemade_voice.md`).

**Out.** Running the prompt (step 10+).

### Step 9 — Bot-as-editor + voice-check CLI ✅ landed 2026-05-13

**Goal.** Two pieces gating the upload pipeline.

**Deliverable.** (a) Voice-editor prompt that worker sessions apply as a second pass over the draft they just authored — inside Claude Code, under the Max plan, never via a paid API call. (b) `packages/db/scripts/voice-check.ts` — deterministic CLI that flags banned phrases / openers / em-dash count / negation patterns / medical advice / price mentions / UK-only references. Voice-check blocks the upload on errors.

**Landed.** `docs/voice-editor-prompt.md` holds the canonical voice-editor instructions (Section 6b hard + soft rules, British-English naming, safety-voice pattern, no-prices rule, output format). The body-authoring worker reads it as a second pass before writing the final JSON. `packages/db/scripts/voice-check.ts` runs deterministic rules over draft TipTap JSON (file path, `--stdin`, or `--json` output) with exit codes 0 / 1 / 2. `upload-tutorial.ts` runs voice-check before insertion with a `--skip-voice-check` admin escape hatch. `packages/db/scripts/voice-check-all.ts` (root: `pnpm voice-check:all`) scans every published Tutorial body for periodic spot-checks. Voice-check tested clean against the béchamel + jam anchor drafts (six and four tricolon warnings respectively, zero errors); a seeded fixture at `scripts/voice-check-fixtures/seeded-failures.json` trips eighteen errors covering every rule.

**Scope correction during the session.** Initial implementation added a `@homemade/ai` workspace with the Anthropic SDK and a `bot-edit.ts` script that called Claude Sonnet 4.5 per draft. Removed entirely — at 50k–100k tutorials across niches it scales to four-figure API spend, which is off-table. The bot-as-editor pass moves to a worker session step instead; see `feedback_no_api_spend.md` in Rebecca's auto-memory for the standing rule.

**Out.** Style-rule tuning beyond the locked Section 6b rules.

### Step 10 — Pilot batch of 10 recipes

**Goal.** Draft 10 recipes from `docs/recipe-backlog.md` to test the whole pipeline.

**Deliverable.** 10 Tutorial rows of type RECIPE. Mix of cuisines and difficulty (Italian × 2, British × 2, French × 1, American × 1, Indian-Anglo × 1, Mediterranean × 1, air fryer × 1, slow cooker × 1). Each ran through the bot-editor + voice-check. Uploaded as DRAFT.

**Out.** Image generation (heroes attach later).

### Step 11 — Pilot batch of 50

**Goal.** Rebecca's findings from the 10 feed prompt edits. Worker drafts 50 more.

**Deliverable.** 50 more Tutorial rows. Updated prompt template.

**Out.** Bulk scaling.

### Step 12 — Bulk authoring at 100–200 per batch

**Goal.** Standing worker pattern.

**Deliverable.** Each batch picks N from the backlog, drafts, voice-checks, uploads. Rebecca spot-checks ~5 per 100. Recipes land daily until the backlog is exhausted.

**Out.** Image generation (deferred until pre-launch budget).

### Pre-launch — image generation pass

Generate heroes (and inline illustrations where the page design calls for them) in batches once budget is allocated. Update existing Tutorial rows via the upload script (idempotent on re-run). Locked prompts and tier in `docs/tutorial-author.md`. Expected total at 2,000 recipes + 600 techniques: ~£100–£150 for heroes only, ~£260–£400 if inline illustrations come too.

---

## Pre-launch checklist

Definitive list of items that must land before the splash gate comes
down. Most are external (registrations, account aliases, postal-address
decisions) — they don't show up in any failing typecheck or CI run, so
they're easy to forget. Mirrored in
`memory/project_pre_launch_checklist.md` so future sessions read the
same list.

Tick items here as they're done.

### Legal / compliance

- [ ] **ICO registration.** £40/yr Tier 1, online via
      [ico.org.uk/for-organisations/data-protection-fee](https://ico.org.uk/for-organisations/data-protection-fee/).
      After registering, set `LEGAL_ENTITY.icoRegistrationNumber` in
      `apps/web/src/lib/legal-entity.ts`. Runbook:
      `docs/ico-registration.md`.
- [ ] **DMCA designated agent.** $6 one-time via the US Copyright
      Office at
      [copyright.gov/dmca-directory](https://www.copyright.gov/dmca-directory/).
      Gets us US safe-harbour against copyright claims from US users.
      Until done, `/legal/dmca` shows "Designated agent registration
      pending" + there's a `TODO(legal)` comment in
      `apps/web/src/app/(public)/legal/dmca/page.tsx`.
- [ ] **Email aliases — privacy@ / dpo@ / legal@.** Create in Google
      Workspace, forward all three to `rebecca@homemade.education`.
      Every legal-page contact link bounces until these exist.
      Runbook: `docs/email-aliases-needed.md`.
- [ ] **Postal address decision.** Optional pre-launch (UK GDPR
      allows email-only controller contact) but **required once the
      premium tier launches** (E-Commerce Regulations 2002 + Consumer
      Contracts Regulations 2013 require a published geographic
      address the moment we charge money). Options: home address,
      virtual office / mail-forwarding service (~£10-20/month for a
      London address), or registered office service if/when
      incorporating. Until decided, `LEGAL_ENTITY.postalAddress =
      null` renders "available on request" — legally fine for a
      free service.
- [ ] **Legal-copy audit on scope change.** Whenever we add a new
      processor (analytics, support tool, etc.), a new data category
      (voice, location, biometric…), a new feature with IP / privacy
      implications (AI generation, real-time chat, marketplace), a
      new paid feature, or operations in a new jurisdiction, re-read
      `/legal/privacy`, `/legal/terms`, `/legal/cookies` and patch
      anything stale. Bump `LEGAL_ENTITY.effectiveDate` on material
      changes so the "Last updated" pin moves and the cookie banner
      re-shows (version check). Voice rules
      (`feedback_homemade_voice.md`) still apply.

### Identity / incorporation

- [ ] **Companies House decision.** Sole-trader by default;
      incorporating is optional but informs lots of downstream copy
      (limited-liability shield, Companies House number in the
      footer per Companies Act 2006). If incorporating, also
      re-register with ICO under the new entity name and update
      `LEGAL_ENTITY.name` + `companiesHouseNumber`.
- [ ] **VAT registration.** Only triggers above £90k turnover or
      voluntarily. Once registered, set `LEGAL_ENTITY.vatNumber` and
      flip subscription-terms copy from "exclusive" to "inclusive of
      VAT".

### Operations / launch readiness

- [ ] **Splash gate flip.** Either remove the splash gate entirely
      or add `/legal` to `PUBLIC_PATHS` in `apps/web/src/proxy.ts`
      so the policies stay reachable for regulators / journalists
      hitting the URLs without the splash password. Currently the
      gate rewrites `/legal/*` to `/coming-soon` — fine for private
      beta, not for public launch.
- [ ] **Signup allowlist removal.** Pre-launch we restrict Clerk
      signups to the Prisma `SignupAllowlist` table (`/admin/users/
      signup-allowlist`) plus the Clerk dashboard "Restrictions →
      Allowlist" feature (see `docs/clerk-restrictions-setup.md`).
      Belt-and-braces gates live in the Clerk webhook + the JIT
      provisioning fallback in `apps/web/src/lib/get-current-user.ts`,
      both reading the `SIGNUP_ALLOWLIST_ENABLED` constant in
      `apps/web/src/lib/signup-allowlist.ts`. **Launch-day flip:**
      (a) Clerk dashboard Restrictions → Sign-up mode → "Public",
      (b) flip `SIGNUP_ALLOWLIST_ENABLED = false` and redeploy. Once
      stable, the table + helper can be deleted in a follow-up sweep.
- [x] **Hard-delete cron for scheduled account deletions.** Inngest
      function `hard-delete-scheduled-accounts` (cron `0 3 * * *`)
      picks up every `AccountDeletionRequest` whose `scheduledFor` has
      passed, runs the `hardDeleteAccount` helper in
      `apps/web/src/lib/hard-delete-account.ts` (drops user-owned UGC
      + private state inside a transaction, scrubs PII on the `User`
      row, sets `deletedAt + hardDeletedAt`, marks the request
      `COMPLETED`), and audit-logs the result. Tutorials authored by
      the user stay in place — orphaning is editorial. Shipped in the
      pre-launch debt sweep alongside the `User.hardDeletedAt` schema
      addition (`20260606000000_user_hard_deleted_at`).
- [ ] **Analytics consent wiring.** Wrappers at
      `apps/web/src/lib/analytics-consent.ts`:
      `installAnalyticsConsentListener()` (PostHog),
      `shouldSendSentryEvent()` (Sentry `beforeSend`). Need a
      one-line wire-in from each init file
      (`instrumentation-client.ts` for Sentry, `posthog-provider.tsx`
      for PostHog). Without these, PostHog captures + Sentry sends
      regardless of the cookie banner choice.
- [ ] **Credential rotation.** Rotate every secret in
      `.env.credentials` and move to a password manager (AWS keys,
      Cloudflare token, Neon, Clerk, splash password).
- [x] **ESLint flat-config migration (phase 1).** Flat-config lives at
      `apps/web/eslint.config.mjs` (eslint-config-next 16 +
      permissive rule overrides). `pnpm lint` exits 0 on the current
      codebase with 73 warnings, 0 errors. A non-blocking lint step
      runs in CI as `continue-on-error: true`. The rule-tightening +
      violation-cleanup pass is its own session (still pending).
- [ ] **TODO(legal) sweep.** Grep `TODO(legal)` across the repo
      before launch — every comment should have an action taken or a
      conscious "still deferred" decision.

### Done since this checklist was created

_When ticking, move the line here with the date + commit SHA so the
history stays visible._

---

## Phase 1 deferred-services activation — Sentry + PostHog + Inngest + Upstash

Bundled session that ticks the four "wired but not active" services off the
pre-launch debt list and adds rate limiting on every UGC submission path.

### Sentry (error tracking)

- `@sentry/nextjs@10` installed; `apps/web/src/instrumentation.ts`
  (Node + edge) and `apps/web/src/instrumentation-client.ts` (browser)
  initialise Sentry only when `NEXT_PUBLIC_SENTRY_DSN` is set, so local
  dev builds and uncrewed branches no-op cleanly.
- Sample rate: 100% errors, 10% transactions, replays off. PII scrub
  drops cookies, request bodies, IPs, emails. Allowlist of request
  headers: `user-agent`, `referer`, `x-forwarded-host`, `x-vercel-id`.
- `next.config.mjs` wraps in `withSentryConfig` when DSN is present;
  source-map upload runs only when `SENTRY_AUTH_TOKEN` is supplied
  (i.e. on CI). Tunnel route `/monitoring/sentry` dodges ad-blockers.
- `/admin/system/errors` page links out to the 7-day project view in
  the Sentry dashboard.

### PostHog (product analytics)

- `posthog-js` (client) + `posthog-node` (server) installed.
- Client provider at `apps/web/src/components/posthog-provider.tsx`
  initialises lazily, identifies on Clerk sign-in (and resets on sign-
  out), captures `$pageview` manually so App Router transitions count.
- Server lib at `apps/web/src/lib/posthog.ts` exposes
  `captureServerEvent` + `identifyServerUser` + `flushPostHog` with
  fire-and-forget error handling — analytics must never break a
  request.
- Event taxonomy in place for launch funnels: `signup_completed`
  (Clerk webhook), `tutorial_viewed` (tutorial page render),
  `tutorial_started` / `tutorial_completed` / `tutorial_bookmarked` /
  `tutorial_unbookmarked` / `tutorial_published_scheduled`,
  `search_query` (with query, resultCount, filters), `review_submitted`
  / `review_published`, `photo_uploaded` / `photo_approved` /
  `photo_rejected`, `question_asked` / `question_answered`,
  `errata_submitted`.
- Users identified by Clerk userId both server-side and client-side so
  events stitch across surfaces.

### Inngest (background jobs)

- `inngest@4` installed; client at `apps/web/src/inngest/client.ts`,
  serve endpoint at `apps/web/src/app/api/inngest/route.ts`. `proxy.ts`
  bypasses the splash + Clerk gates for `/api/inngest`.
- Three functions registered:
  * **`scheduled-publish-tutorial`** — cron `*/5 * * * *`. Finds rows
    where `status = SCHEDULED AND scheduledFor <= now()`, transitions
    them to `PUBLISHED`, audit-logs each, syncs to Typesense, fires
    PostHog `tutorial_published_scheduled` per row.
  * **`typesense-reindex`** — event-triggered. Wipes + rebuilds all
    three Typesense collections from Prisma. Manual trigger button at
    `/admin/system/jobs`.
  * **`moderation-outcome-notify`** — event-triggered observability
    sink. The in-app `Notification` row is still written synchronously
    by `notify()`; this function exists so future email / push
    delivery can be added without touching every moderation call site.
    Wired from `moderateReview`, `moderateUgcPhoto`, `moderateQuestion`,
    `moderateAnswer`, `resolveErrata`.
- `/admin/system/jobs` page lists the three functions, has the reindex
  trigger button, and links out to the Inngest dashboard.

### Upstash Redis (rate limiting)

- `@upstash/redis` + `@upstash/ratelimit` installed. Helper at
  `apps/web/src/lib/ratelimit.ts` exposes `checkRateLimit(bucket, id)`
  returning `{ allowed: true }` if Redis is unconfigured (graceful
  no-op) or under the cap, otherwise a user-facing message.
- Sliding-window buckets:
  * `reviewSubmission` — 5/hr per user
  * `photoUpload` — 10/hr per user
  * `questionAsked` — 10/hr per user (also covers answer submission)
  * `errataSubmitted` — 5/hr per user (or `anon:<tutorialId>` when
    signed out)
  * `reportSubmitted` — 20/hr per user
  * `searchQuery` — 60/min per IP (IP-keyed because search is open to
    every reader behind the splash cookie)
- Applied in `submitReview`, `submitUgcPhoto`, `submitQuestion`,
  `submitAnswer`, `submitErrata`, `submitReport`, and the `/search`
  server component.
- Fails open: if Redis blips, the action goes through — better to let
  the user submit than to lock them out of their own site.

### Admin /admin/system/* pages

- `/admin/system/errors` — Sentry link-out + last-7-day URL helper.
- `/admin/system/jobs` — function list + reindex trigger + Inngest
  dashboard link.
- `/admin/system/settings` and `/admin/system/feature-flags` remain
  placeholders for now.
- Admin sidebar restructured so `Error log` and `Jobs` are real links
  above the two placeholders.

### Infra — CDK two-step deploy

Four new AWS Secrets Manager entries (`homemade/inngest-event-key`,
`homemade/inngest-signing-key`, `homemade/upstash-redis-url`,
`homemade/upstash-redis-token`) created via the AWS CLI before the
first deploy.

- **Deploy 1** (`cdk deploy` with no MOUNT flag): adds inline
  `secretsmanager:GetSecretValue` policy on the task execution role
  for the four new secret ARNs. Also lands the R2 task env vars
  (`R2_BUCKET`, `R2_PUBLIC_BASE_URL`, `CDN_IMAGE_TRANSFORM_ORIGIN`)
  and R2 IAM grants that the R2 migration commit had staged but not
  yet deployed.
- **Deploy 2** (`MOUNT_PHASE1_SECRETS=1 cdk deploy`): adds the four
  `ecs.Secret.fromSecretsManager` references to the container env.
  Task replacement happens, IAM is already in place.

Same two-step CFN pattern Phase 2e established for the Clerk webhook
secret. Both deploys green first try.

### Build-time secrets flow

`NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST`,
`NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_AUTH_TOKEN`, `SENTRY_ORG_SLUG`,
`SENTRY_PROJECT_SLUG` flow through GitHub Actions secrets → Docker
build-args → `ENV`, mirroring how `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
is plumbed. Set via `gh secret set` from the session.

### pnpm-workspace.yaml

`@sentry/cli`, `core-js`, `protobufjs` added to `allowBuilds` so pnpm
runs their postinstall scripts (Sentry CLI binary download, core-js
banner, protobufjs setup).

### Things scoped out of this session

- Real PostHog dashboards — Phase 8.
- Email + push notification delivery for moderation outcomes — defer.
- Sentry alert rules + Slack integration — Rebecca configures in the
  Sentry dashboard.
- Site-wide HTTP cache layer using Redis — Next.js + Cloudflare are
  enough for now.
- `signin_completed` event — PostHog's built-in `$session_start` covers
  it; if we want our own we can add a sessionStorage-deduped client fire.
- `tutorial_shared` event + share button — Phase 8 polish.
- Cookie consent banner — legal-pages session.

### Pre-launch debt observed during this session

- `CLERK_WEBHOOK_SIGNING_SECRET` is no longer mounted on the task
  (revision 11 dropped it; my deploys carried the gap forward without
  re-mounting because I didn't pass `MOUNT_CLERK_WEBHOOK_SECRET=1`).
  Fix in a tiny follow-up deploy by re-running CDK with
  `MOUNT_CLERK_WEBHOOK_SECRET=1`.
- `.env.credentials` is missing `CLOUDFLARE_IMAGES_DELIVERY_HASH` —
  CDK requires it at deploy time; I exported the known value
  (`qTHUFgOzX6ApY3B_SdLnDA`) inline. Add it to the file proper.
- Inngest Cloud needs the production endpoint registered manually in
  its dashboard. I triggered the initial sync via
  `PUT https://homemade.education/api/inngest` (returns `Successfully
  registered`); after that, Inngest Cloud handles re-syncs on every
  push. Verify in the Inngest dashboard's "Apps" view.

---

## Phase B — comprehensive analytics taxonomy + event wiring

Berkowski-inspired pass that turns the initial-services PostHog taxonomy
into the canonical event catalogue and wires every plausibly-useful
event into the natural code path so we can't lose historical data later.

### Taxonomy doc

- **`docs/analytics-taxonomy.md`** — full event catalogue (~50 events
  across acquisition / activation / engagement / search / content /
  creator program / pattern testing / project lifecycle / cookie
  consent / account lifecycle / friction / moderation), property
  definitions, user properties, seven named funnels (signup, activation,
  content, creator, pattern test creator-side, pattern test tester-side,
  deletion), and eight dashboards for Rebecca to build in PostHog's UI.
  Includes naming conventions + an "adding new events" workflow so
  future phase sessions extend the catalogue rather than diverging.

### Schema additions

- **Migration `20260605000001_phase_b_analytics_user_props`** — `User`
  picks up nine nullable analytics columns:
  - `utmSource` / `utmMedium` / `utmCampaign` / `utmContent` / `utmTerm`
  - `acquisitionChannel`
  - `signupCohortWeek` (ISO `YYYY-Www`)
  - `country` (ISO 3166-1 alpha-2 from Cloudflare `CF-IPCountry`)
  - `deviceClass` (`mobile` / `tablet` / `desktop`)
- All nullable; pre-launch users predate capture, by design. Cohort
  week + acquisition data fill in either on signup (Clerk webhook) or
  on first signed-in page load after acquisition capture (self-healing
  via `persistAcquisitionIfMissing`).

### Helpers

- **`apps/web/src/lib/cohort.ts`** — `isoWeek(date)` returns ISO 8601
  `YYYY-Www`. Pure function; tested implicitly through the webhook +
  acquisition action.
- **`apps/web/src/lib/acquisition.ts`** — `deriveChannel`, `parseUtm`,
  `deriveDeviceClass`, `readStoredAcquisition`, plus the
  localStorage-key constant. Channel lookup is a small explicit table
  (paid_search / paid_social / email / social / referral / organic /
  direct / unknown) — easy to extend per campaign.
- **`apps/web/src/lib/client-analytics.ts`** — `captureClientEvent` is
  the consent-aware client wrapper. No-ops when analytics consent
  hasn't been granted, except for the six `consent_*` events themselves
  which are always allowed (necessary instrumentation of the legal
  flow). Auto-attaches `acquisitionChannel` from localStorage so events
  fired before signup still carry it.
- **`apps/web/src/lib/identify.ts`** — `identifyCurrentUser(user)`
  pushes the canonical user-property bundle to PostHog. Called from
  the `/me` and `/admin` layouts so authenticated sessions always
  have fresh person properties on PostHog.
- **`apps/web/src/lib/acquisition-actions.ts`** —
  `persistAcquisitionIfMissing(payload)` server action. Self-healing:
  every page load is allowed to call it; once `signupCohortWeek` is
  set it's a no-op. Country + deviceClass come from headers so the
  client can't lie about them.

### Client tracking components

- **`components/acquisition-tracker.tsx`** — mounted in the root
  layout. On first visit reads `?utm_*` + `document.referrer`, derives
  channel, persists to `homemade-acquisition` localStorage JSON, and
  fires `acquisition_captured`. When the user signs in (Clerk
  `useUser()` returns a user) calls `persistAcquisitionIfMissing`
  once per browser session.
- **`components/public/tutorial-reader/scroll-depth-tracker.tsx`** —
  mounted on the public tutorial detail page. Fires
  `tutorial_scroll_depth` at 25 / 50 / 75 / 100% scroll thresholds.
  rAF-throttled, deduped per page load.
- **`components/public/form-abandonment-tracker.tsx`** — generic
  wrapper. Fires `form_abandoned` on `pagehide` if the user interacted
  with the form (focus or input) but didn't submit. Wrapped around the
  creator application form; reusable for sign-up wrappers and any
  multi-step form going forward.

### Server-side events wired (incremental on top of services-activation)

- **First-* milestones** — `first_bookmark`, `first_project_started`,
  `first_project_completed`, `first_review_submitted`,
  `first_photo_uploaded`. Each fires from the relevant server action
  exactly once per user by counting prior rows before the insert.
  Carries `isFirst: true` so PostHog dashboards can filter without
  needing PostHog person-property reads.
- **Project lifecycle** — `project_abandoned`, `project_progress_updated`,
  `project_notes_updated`, `project_supplies_checked`,
  `beginner_mode_toggled`. `project_progress_updated` rate is
  controlled by the existing client-side debouncing in
  `reading-progress.tsx` (max once per 5s).
  `tutorial_completed` now carries `timeToCompleteMinutes` derived from
  `startedAt → completedAt`.
- **Creator program** — `creator_application_submitted`,
  `creator_application_approved`, `creator_application_rejected`,
  `creator_status_revoked`, `creator_tutorial_drafted`,
  `creator_tutorial_submitted_for_review`,
  `creator_tutorial_approved`, `creator_tutorial_returned_for_edits`,
  `creator_first_publish`, `creator_profile_viewed`.
- **Pattern testing** — `pattern_test_created`,
  `pattern_test_recruiting_opened`, `pattern_test_completed`,
  `pattern_test_application_submitted`,
  `pattern_test_application_accepted`,
  `pattern_test_application_rejected`, `pattern_test_started`,
  `pattern_test_withdrawn`, `pattern_test_feedback_submitted`.
- **Account-rights lifecycle** — `account_data_export_requested`,
  `account_deletion_scheduled`, `account_deletion_cancelled`.
  `account_deletion_completed` is reserved for the hard-delete cron
  (Session B's scope) — the cron should fire it from inside the
  Inngest function.
- **Cookie consent (client)** — `consent_banner_shown`,
  `consent_accepted_all`, `consent_necessary_only`,
  `consent_customized`, `consent_preferences_changed`. Fire **before**
  PostHog's opt-in/opt-out flip so the decision itself is always
  captured.
- **Friction / errors** — `rate_limit_hit` (every UGC bucket that
  rejects), `nsfw_auto_rejected` (when an upload is auto-rejected by
  the Rekognition score).
- **Engagement (extended)** — `tutorial_viewed` properties expanded
  with `creatorId`, `difficulty`, `season`, `wordCount`, `cohortWeek`,
  `acquisitionChannel`. `signin_completed` / `signout_completed`
  fire from the PostHog provider on auth state change, deduped per
  browser session.

### Funnels

Catalogued in `docs/analytics-taxonomy.md`. Seven named funnels with
explicit step lists: signup, activation, content, creator, pattern
test (creator + tester sides), deletion.

### Privacy

Raw email is **not** sent to PostHog. The Clerk webhook now hashes
the address (FNV-1a 32-bit, 8 hex chars) before pushing as a person
property. Audit-log entries still hold the canonical PII; PostHog
only sees the hash. Decision recorded in the taxonomy doc.

### Out of scope (deferred)

- **Hard-delete cron's `account_deletion_completed` firing.** The
  cron itself is Session B's scope. They wire the event from inside
  the Inngest function once the cron is in place.
- **`account_data_export_downloaded`.** The download link is a static
  signed URL; firing the event needs a click handler that doesn't
  exist yet. Tracked as a follow-up.
- **`payment_failed`.** Phase 7 / 8 placeholder; no firing path yet.
- **`error_boundary_triggered`.** Catalogued in the taxonomy doc but
  no React error boundaries exist on the public surface yet. Add when
  one lands.
- **`search_result_clicked`.** Need a click handler on TutorialCard
  from `/search`. Out of scope for this pass to keep the diff focused.
- **`tutorial_shared`** with `destination` property. Existing event
  is wired but the public share button doesn't surface the
  destination yet; needs the share UI itself.
- **PostHog dashboards.** Documented as instructions for Rebecca; the
  actual dashboard configuration lives in PostHog's UI.

### Build hygiene

- `pnpm --filter @homemade/web typecheck` — passes.
- `pnpm --filter @homemade/db typecheck` — passes.
- `pnpm --filter @homemade/web build` — passes; all routes (including
  the new client trackers) registered.
- No new admin pages; `/admin/system/analytics` placeholder stays a
  placeholder for the Phase 8 dashboard build.

### New pre-launch debt items

- The hard-delete cron needs to call `posthog-node`'s capture from
  inside the Inngest function once it lands (Session B).
- Search-result-click + share-destination events are catalogued but
  unwired; pick up when the click-handling refactor for those
  surfaces happens.

---

## Pre-launch debt sweep — iOS TestFlight + ESLint v9 + CLAUDE.md + SubTutorialCard cleanup + hard-delete cron + Typesense CDK

Bundled session ticking off five pre-launch debt items in one push.

### iOS TestFlight pipeline

- `.github/workflows/ios-testflight.yml` mirrors the Aura iOS workflow
  pattern verbatim (manual signing, `macos-26` runner, fastlane pilot
  upload). Trigger is **manual-only** (`workflow_dispatch`) for now so
  TestFlight builds don't burn App Store Connect API quota on every
  commit.
- Monorepo adaptations: `pnpm install --filter @homemade/mobile`,
  Capacitor sync from `apps/mobile/`, iOS project path
  `apps/mobile/ios/App`, no web build (the wrapper loads
  `https://homemade.education` directly per
  `apps/mobile/capacitor.config.ts`).
- Bundle ID `education.homemade.app` is hard-coded (matches
  `capacitor.config.ts`). `IOS_TEAM_ID` defaults to the Aura team ID
  (`YA5SH43A77` — same Apple Dev account per
  memory/`project_apple_developer.md`); override with GitHub Variable
  `IOS_TEAM_ID` if Homemade ever moves to its own Apple Dev account.
  `IOS_PROVISIONING_PROFILE_NAME` defaults to "Homemade App Store" —
  override with the same-named GitHub Variable.
- Secrets Rebecca pastes before the first run: `IOS_SIGNING_P12_BASE64`,
  `IOS_SIGNING_P12_PASSWORD`, `IOS_PROVISION_PROFILE_BASE64`,
  `APPSTORE_CONNECT_KEY_ID`, `APPSTORE_CONNECT_ISSUER_ID`,
  `APPSTORE_CONNECT_API_KEY_BASE64`. Full runbook in
  `docs/mobile-setup.md` § 1c.

### ESLint flat-config migration (phase 1)

- `apps/web/eslint.config.mjs` — flat-config using
  `eslint-config-next/core-web-vitals` + `eslint-config-next/typescript`
  presets (eslint-config-next 16 ships flat-config exports). Config
  lives inside `apps/web` so it resolves `eslint`,
  `eslint-config-next`, etc. from the workspace's own `node_modules`
  without needing root-level hoisting.
- Permissive rule overrides — Phase 1 goal is "lint runs without
  failing on the existing codebase", not "tighten everything":
  `@typescript-eslint/no-explicit-any` warn,
  `@typescript-eslint/no-unused-vars` warn with `_`-prefix bypass,
  `react-hooks/exhaustive-deps` warn,
  `react-hooks/set-state-in-effect` warn,
  `react-hooks/immutability` warn,
  `react/no-unescaped-entities` warn,
  `@next/next/no-img-element` warn, `prefer-const` warn. All four
  pre-existing errors in the codebase fall under the two React 19
  strict-mode rules; downgraded together so the cleanup session can
  address them with proper refactors.
- Root `pnpm lint` delegates to `pnpm --filter @homemade/web lint`.
  `apps/web/package.json` script changed from `next lint` to
  `eslint .`. Legacy `apps/web/.eslintrc.json` deleted.
- CI lint step in `.github/workflows/deploy.yml` runs the lint as
  `continue-on-error: true` — non-blocking signal visible in the
  Actions UI without gating deploys. Drop `continue-on-error` after
  the cleanup pass tightens rules.
- **Rules downgraded for Phase 1 (cleanup pass owes):** the seven listed
  above. The cleanup session restores them to `error` and fixes the
  violations behind them.

### CLAUDE.md at repo root

- New `CLAUDE.md` at the repo root carries the deploy-verify protocol
  verbatim (`gh run watch` block, 3-retry cap, `/healthz` smoke,
  "don't bypass with `--no-verify`" guidance). Auto-loaded by every
  Claude Code session in the repo, so the rule doesn't depend on the
  orchestrator remembering to brief.
- Also includes a short list of repo quirks worth knowing on day one
  (pnpm-deploy collision, `proxy.ts` rename, admin route layout,
  TipTap-free public bundle, Prisma 7 datasource config, pnpm PATH).

### SubTutorialCard dead-ref strip-and-snapshot

- `deleteTutorial` in `apps/web/src/app/admin/tutorials/actions.ts`
  now walks every other tutorial's `body` JSON for
  `subTutorialCard` nodes whose `attrs.tutorialId` matches the row
  being deleted, snapshots the affected tutorials' current state as
  a `TutorialVersion` (`Pre-strip of N subTutorialCard ref(s) to
  deleted tutorial <slug>`), patches their bodies to remove the
  matching nodes, then deletes the source — all in one transaction
  so a mid-flight failure can't leave the catalogue half-stripped.
- Audit log writes a per-referrer `tutorial.subref_stripped` entry
  alongside the usual `tutorial.delete`, so version history shows
  the edit was driven by the delete (and is reversible from the
  referrer's version history if Rebecca ever needs to undo).
- Recursive JSON walker handles arbitrary nesting — TipTap can put a
  `subTutorialCard` inside any container node.

### Hard-delete cron for AccountDeletionRequest

- `apps/web/src/lib/hard-delete-account.ts` — the `hardDeleteAccount`
  helper Phase 8a left as a TODO. Deletes the user's owned content
  (reviews, ugcPhotos, questions, answers, errata, reports filed,
  bookmarks, userProjects, notifications, reviewHelpfuls,
  questionUpvotes, testAssignments, patternTests, creatorProfile,
  dataExportRequests, suspensions) inside one transaction, then
  scrubs the `User` row's personal fields and stamps `deletedAt +
  hardDeletedAt`. The User row itself is never physically deleted —
  `AuditLog.actorId` keeps a non-null FK on it and audit-log
  integrity outranks PII minimisation. Tutorials authored by the
  user stay in place (editorial value is high; the public layer
  renders an authorless byline once the User's `displayHandle / name`
  are null).
- `apps/web/src/inngest/functions/hard-delete-accounts.ts` —
  `hard-delete-scheduled-accounts` cron, `0 3 * * *` (daily at 03:00
  UTC). Selects `AccountDeletionRequest` rows where `status =
  SCHEDULED AND scheduledFor <= now()`; processes each in its own
  Inngest step so a single failure doesn't stall the queue. Wired
  into the Inngest serve route alongside the existing three
  functions.
- Schema: `User.hardDeletedAt DateTime?` added — bookkeeping stamp
  distinct from `deletedAt` so we can differentiate "scrubbed via
  the cron" from any future admin-initiated soft-delete that might
  reuse `deletedAt`. Migration:
  `20260606000000_user_hard_deleted_at`.
- Email scrub uses `deleted-user+<userId>@homemade.local` to keep
  the unique-email constraint satisfied without retaining the
  original address. Audit log records the redacted email, never the
  original.

### Typesense CDK secret-mount (gated)

- `infra/lib/homemade-stack.ts` now declares three Secrets Manager
  references for `homemade/typesense-host`,
  `homemade/typesense-admin-api-key`,
  `homemade/typesense-search-only-api-key`, adds the
  `-??????`-suffixed IAM grant on the execution role, and
  conditionally mounts them into the container env when
  `MOUNT_TYPESENSE_SECRETS=1`. Mirrors the Phase 2e two-step pattern
  used for the Clerk webhook, R2, and Phase 1 service secrets.
- **CDK was not deployed from this session** — the secrets don't yet
  exist in AWS Secrets Manager. Rebecca's path to enable search in
  production:
  1. Create the Typesense Cloud cluster, drop `TYPESENSE_HOST`,
     `TYPESENSE_ADMIN_API_KEY`, `TYPESENSE_SEARCH_ONLY_API_KEY`
     into `.env.credentials`.
  2. Create the three secrets in AWS Secrets Manager with the names
     above.
  3. `pnpm --filter @homemade/infra exec cdk deploy` — lands the
     IAM grant only; no task replacement.
  4. `MOUNT_TYPESENSE_SECRETS=1 pnpm --filter @homemade/infra exec
     cdk deploy` — adds the secret references; task replaces with
     IAM already in place.

### Things scoped out of this session

- Analytics events for any of the new flows — Session C owns the
  analytics taxonomy wiring across server actions.
- Tightening the ESLint rules and fixing existing violations — its
  own session (see "Pre-launch debt" above).
- Existing admin tutorial moderation flows — untouched beyond the
  `deleteTutorial` dead-ref scanner.
- Mobile splash asset / Android adaptive icon / Android signing
  keystore + Play Console workflow — separate pre-launch debt
  items.
- Schema reshape for the recipes-first content architecture — that
  session owns `packages/db/prisma/schema.prisma`; the
  `User.hardDeletedAt` addition is additive and on a different
  model.

---

## Bug-fix bundle — Clerk auth error on tutorial pages + public error boundaries + analytics loose ends (2026-05-13)

Six-item bundle clearing one production Sentry issue, adding the
public-side error boundaries the analytics taxonomy was waiting on,
and wiring the last five "catalogued but unwired" PostHog events.

### Clerk auth() error on tutorial pages — root cause + fix

- **Root cause** (already documented in pre-launch debt before this
  session): `apps/web/src/proxy.ts` matcher excluded any path ending
  in `.<letters>` via `.*\.[a-zA-Z]+$`. That swallowed bot probes like
  `/wp-admin.php`, `/.env`, `/sitemap.xml.html` — the matcher rule
  meant `clerkMiddleware` never ran for them, but Next still routed
  them to the dynamic `[categorySlug]` page, which calls
  `getCurrentDbUser()` → `currentUser()` → throws "Clerk: auth() was
  called but Clerk can't detect usage of clerkMiddleware()". ~17
  occurrences/hour from bot traffic; no real-user impact, but Sentry
  noise drowned signal.
- **Fix A (matcher):** swap the broad regex for an allowlist of
  actual static-asset extensions:
  `svg|png|jpg|jpeg|gif|webp|avif|ico|css|js|mjs|map|woff|woff2|ttf|otf|wasm|txt|xml|json`.
  Bot probes now go through `clerkMiddleware` and hit the splash gate
  (404 / rewrite to `/coming-soon`) like any other unknown URL.
- **Fix B (defensive try/catch):** `getCurrentDbUser()` wraps
  `currentUser()` in a try/catch that returns `null` on Clerk runtime
  errors and reports a warning-level Sentry exception with
  `tags: { source: 'getCurrentDbUser' }`. Cheap insurance against
  future RSC sub-request edge cases where middleware might not
  surround a server-component call.

Both fixes ship together — matcher is the root cause, defensive
try/catch keeps a future regression from being a 500.

### Public error boundaries

- `apps/web/src/app/(public)/error.tsx` — root client error boundary
  for the entire public route group. Brand-fit fallback ("Something
  went wrong on our end. We've been told, and we'll have a look.")
  with "Try again" (calls `reset()`) and "Back to homepage" links.
- `apps/web/src/app/(public)/[categorySlug]/[tutorialSlug]/error.tsx`
  — tutorial-scoped boundary so a broken tutorial keeps the site
  header / footer and isolates the failure to the article body.
- Both boundaries call `Sentry.captureException(error)` AND
  `captureClientEvent('error_boundary_triggered', { ... })` so the
  PostHog `error_boundary_triggered` dashboard pairs with Sentry's
  view from the user's perspective.
- Brand-fit CSS in `apps/web/src/components/public/site-chrome.css`
  (under `.public-error-boundary`).

### Analytics events — five closed out

All five remaining "catalogued but unwired" events from Phase B now
fire from their natural code paths. The taxonomy doc
(`docs/analytics-taxonomy.md`) was updated in this same commit with
the final property shapes — only `payment_failed` remains
catalogued-but-unwired (Phase 7/8 placeholder).

- **`error_boundary_triggered`** — fires from the two new boundaries
  above with `{ path, errorName, errorMessage (truncated 120),
  digest, scope? }`. `scope: 'tutorial'` on the tutorial boundary,
  omitted on the root one so dashboards can distinguish them.
- **`account_data_export_downloaded`** — `apps/web/src/app/(public)/me/data-rights/export-panel.tsx`
  added an `onClick` to the "Download bundle" anchor that fires
  `{ requestId, bytes, generatedAt }` before the navigation. Fire-
  and-forget, doesn't block the download.
- **`search_result_clicked`** — new
  `apps/web/src/app/(public)/search/search-results.tsx` client
  wrapper around the result grid. Uses `display: contents` on the
  wrapping span so the underlying `TutorialCard` stays as the grid
  item and layout is unchanged. Fires
  `{ query, filters, position, tutorialId, tutorialSlug,
  categorySlug, totalResults }` on capture so the navigation isn't
  delayed. Only wraps actual search hits, not the recently-published
  fallback shown when the page is opened with no query.
- **`tutorial_shared`** — first wire in any form (the event existed
  in the taxonomy but never had a firing path). New
  `apps/web/src/components/public/tutorial-reader/share-button.tsx`:
  on devices that expose `navigator.share`, renders a single Share
  button that opens the OS sheet and fires `destination: 'native'`.
  Otherwise renders a popover menu with copy-link / Twitter (X) /
  Pinterest / Facebook / email — each fires with the matching
  `destination` (`copy_link` / `twitter` / `pinterest` / `facebook`
  / `email`). Click-outside + Escape close the menu. Available on
  every tutorial page for signed-in AND anonymous readers (the
  tutorial actions bar now renders the share button as a baseline,
  with bookmark + project buttons layered in for signed-in users).
- **`account_deletion_completed`** — fires from the per-user step in
  the hard-delete Inngest cron (`apps/web/src/inngest/functions/hard-delete-accounts.ts`)
  after `hardDeleteAccount` succeeds. The cron now also pre-loads
  the user's `clerkId` and the `AccountDeletionRequest.requestedAt`
  alongside the queue. `distinctId` is the Clerk id so the event
  stitches onto the same PostHog person the user's lifecycle has
  been tracked against. Properties:
  `{ userId, daysScheduledFor: 30, requestedAt, completedAt, reason }`.
  `flushPostHog()` runs once at the end of the function so the
  serverless process doesn't tear down before events leave the
  buffer.

### Files touched

- `apps/web/src/proxy.ts` (matcher allowlist)
- `apps/web/src/lib/get-current-user.ts` (try/catch + Sentry)
- `apps/web/src/app/(public)/error.tsx` (new)
- `apps/web/src/app/(public)/[categorySlug]/[tutorialSlug]/error.tsx` (new)
- `apps/web/src/app/(public)/[categorySlug]/[tutorialSlug]/page.tsx` (import + wire share into actions slot)
- `apps/web/src/app/(public)/me/data-rights/export-panel.tsx` (onClick)
- `apps/web/src/app/(public)/search/page.tsx` (use SearchResults wrapper)
- `apps/web/src/app/(public)/search/search-results.tsx` (new)
- `apps/web/src/app/(public)/search/search-page.css` (`.search-result-card-wrap` shim)
- `apps/web/src/components/public/tutorial-reader/share-button.tsx` (new)
- `apps/web/src/components/public/tutorial-reader/tutorial-reader.css` (share menu styles)
- `apps/web/src/components/public/site-chrome.css` (error boundary styles)
- `apps/web/src/inngest/functions/hard-delete-accounts.ts` (event firing)
- `docs/analytics-taxonomy.md` (five rows reworded as wired with final properties)

### Things scoped out of this session

- Recipes-first schema reshape — parallel content-pipeline session
  owns `packages/db/prisma/schema.prisma` and the recipe TipTap
  blocks. This session stayed out of both.
- Public tutorial page layout — only minimum-surgical edits inside
  `page.tsx` (import + actionsSlot tweak); no rearranging sections
  or styling.
- New admin pages or marketing pages.
- Tightening the rules ESLint Phase 1 downgraded — its own session.

### Pre-launch debt observed during this session

- The `proxy.ts` matcher row in BUILD_PROGRESS.md "Pre-launch debt"
  is now closed (the fix landed here). Memory's
  `project_build_state.md` and `feedback_analytics_*` should drop
  that bullet on the next memory refresh.

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
- `8261c89` — feat(public): Phase 4 accounts — bookmarks, projects, reading-progress / TOC / project companion, beginner mode, /me dashboard + settings, signed-in header, supplies substitutions
- Phase 5 — UGC pipeline + moderation queues + admin menu restructure + audit-log viewer
- Phase 6 — creator program + pattern testing + public maker profiles + creator-tutorial moderation flow
- `41e2051` — feat(media): move image pipeline to Cloudflare R2 + Image Transformations
- `a312c78` — feat(infra): activate Sentry + PostHog + Inngest + Upstash rate limits
- `45c78a7` — feat(legal): Phase 8a legal compliance bundle — six legal pages, cookie consent banner + consent helpers, /me/data-rights + export / deletion API, DMCA + deletion + data-export admin queues, schema additions (cookieConsent / deletionScheduledFor / deletedAt + 3 new models)
- `aadd8fd` — chore(prelaunch): pre-launch debt sweep — iOS TestFlight workflow + ESLint v9 flat-config (phase 1) + repo CLAUDE.md + SubTutorialCard dead-ref strip-and-snapshot + hard-delete cron + Typesense CDK secret-mount (gated)
- _this session_ — fix(auth+analytics): narrow `proxy.ts` matcher + defensive `getCurrentDbUser` try/catch (kills Clerk auth() Sentry spam from bot probes) + public error boundaries + wire `tutorial_shared` (new share UI) / `search_result_clicked` / `account_data_export_downloaded` / `error_boundary_triggered` / `account_deletion_completed` (closes the last analytics loose ends from Phase B except `payment_failed`)
- _this session_ — feat(auth): pre-launch signup allowlist — `SignupAllowlist` Prisma model + seed migration (`20260607000000_phase_signup_allowlist`), Clerk webhook + JIT rejection paths that delete the Clerk user via the Backend API on non-allowlisted signup, ADMIN-only `/admin/users/signup-allowlist` CRUD with audit-log + PostHog wiring, `docs/clerk-restrictions-setup.md` runbook for mirroring the list into Clerk's dashboard, three new analytics events
- Phase 3a (earlier session): public tutorial / category / home pages, TipTap-JSON renderer with no TipTap runtime in the public bundle, admin Preview toggle
