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

**Placeholder refresh follow-up (2026-05-14):** `/admin/analytics` and
`/admin/system/errors` now reflect that PostHog + Sentry are live (wired
in services activation + Phase B). Analytics page lists the eight
dashboards still to build in the PostHog UI; errors page cross-references
the deploy-verification loop. Settings + feature-flags copy tightened —
no more "Lands in Phase 8" marketing language. `/admin/system/jobs` and
`/admin/audit-log` were already current and left alone.

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

### Step 4 — Master ingredient list ✅ landed 2026-05-13

**Goal.** Draft `docs/ingredient-master.md` and seed the Ingredient table.

**Landed.** 547 ingredient rows across all 18 categories live in
`packages/db/scripts/data/ingredients.ts` — that file is the source of
truth, the seed script imports it directly. Shape per entry: slug, name,
optional pluralName, category, defaultUnit, dietaryFlags,
commonSubstitutes (cross-referenced slugs), aliases (US / regional /
brand-shorthand), notes (UK-US naming gotchas + prep tips), isStaple,
isAllergen + allergenType (UK 14), seasonality, shelfLifeDays, storage.
British conventions throughout; US names live in aliases. Halal and
kosher flags intentionally not applied at ingredient level — those
depend on slaughter / certification and get set on the recipe by the
author.

`packages/db/scripts/seed-ingredients.ts` runs idempotent upsert with
up-front validation (slug shape, category / unit / dietary / allergen /
storage enums, substitute-slug existence) and a `--dry-run` flag that
exits without touching the DB. `generate-ingredient-master-md.ts`
regenerates `docs/ingredient-master.md` from the TS source — markdown
view is grouped by category, sorted alphabetically.

Seeded into prod 2026-05-13: 547 created, 0 updated, 0 unchanged.

**Out.** Tools (step 5). Browsing UI.

### Step 5 — Master tools list ✅ landed 2026-05-13

**Goal.** Draft `docs/tools-master.md` and seed the Tool table.

**Landed.** 179 tool rows across all 17 categories in
`packages/db/scripts/data/tools.ts`. Shape per entry: slug, name,
optional pluralName, category, aliases (brand-shorthand: KitchenAid →
stand mixer, Le Creuset → casserole, Vitamix → high-powered blender),
isPurchasable (false only for fixtures — oven, hob, sink),
typicalPriceGbp (in pennies, skipped when uncertain), notes.

`packages/db/scripts/seed-tools.ts` mirrors the ingredients seed —
validation up-front, `--dry-run` flag, idempotent upsert.
`generate-tools-master-md.ts` regenerates `docs/tools-master.md` from
the TS source.

Seeded into prod 2026-05-13: 179 created, 0 updated, 0 unchanged.

**Out.** Prices, retailer links, marketplace integration (all Phase 7).

### Step 6 — Recipe backlog

**Goal.** Draft `docs/recipe-backlog.md`. ~2,000 recipes organised by category.

**Deliverable.** Heavy categories: British, Italian, French, American, Mediterranean, Middle Eastern, North African, Caribbean, Eastern European, Indian (Anglo-Indian only — modern regional deferred), baking, preserves, desserts, soups, salads, breakfasts, drinks. Heavy air-fryer + slow-cooker sections (high SEO demand). Cross-cutting use-cases: Sunday roasts, weeknight, batch-cook, lunchbox, kids, Christmas, Friday pizza, curry night, comfort food. Deferred-until-v2 cuisines flagged at the end (Korean, Vietnamese, Thai, modern Japanese, modern Indian beyond Beeton, modern Mexican / Latin American). Vegetarian / vegan live as variants within parent dishes, not a standalone category.

**Out.** Tutorial body writing (step 10+).

### Step 7 — Technique backlog prune

**Goal.** Cut `docs/content-backlog.md` from ~2,500 entries down to ~500–700 truly foundational techniques.

**Deliverable.** Foundational = standalone reference content a reader consults to learn HOW (knife skills, kit, basic methods, mother sauces, foundation breads, ingredient deep-dives, food safety). Anything that's a complete dish moves to the recipe backlog. Cross-reference each moved entry in the commit body so we have an audit trail.

**Out.** Writing technique bodies. Building the technique → recipe link UI.

### Step 8 — Body-authoring prompt rewrite ✅ landed 2026-05-13

**Goal.** Rewrite the body-authoring section of `docs/tutorial-author.md` for the recipe-first shape.

**Landed.** `docs/tutorial-author.md` rewritten end-to-end as a recipe-first
prompt template (version 2). Bakes in the input contract, the
`TutorialUploadInput` output shape with recipe metadata + structured
`ingredientsList` + `recipeTools`, hard voice rules and soft voice
rules (mirroring `feedback_homemade_voice.md`), a self-critique pass
the drafting session runs before writing the final JSON, source rules,
and length guidance.

Master ingredient + tool lookup tables are expanded inline via fence
markers regenerated from the seed data by a new
`packages/db/scripts/generate-master-lookup.ts`
(`pnpm --filter "@homemade/db" run lookup:generate`): 547 ingredient
slugs + 179 tool slugs, grouped by category, with dietary flags
abbreviated to keep the prompt cache-friendly. Authors pick slugs from
these blocks; unknown slugs fail loudly on upload.

`packages/db/scripts/upload-tutorial.ts` extended to accept the new
recipe shape: `type` discriminator (default RECIPE), full recipe
metadata, top-level `recipeTools[]`, and `ingredientSlug` references
inside `ingredientsList` blocks (resolved to `ingredientId` + canonical
name + defaultUnit on insert). `RecipeIngredient` and `RecipeTool` join
rows are rebuilt in a transaction on every upload, mirroring
`apps/web/src/lib/recipe-ingredients-sync.ts`. The script computes
`totalMinutes` from `prep + cook + resting + chilling` when absent.

Scaling tokens (`{{ingredient-slug}}`) ship live in this step. A new
`ScaleProvider` context at `apps/web/src/components/public/tutorial-content/scale-context.tsx`
holds the multiplier; the IngredientsList block mirrors its scale chip
selection into the provider via `useEffect`; `ScaleToken` (rendered
inline from `renderText` when a `{{slug}}` pattern is detected) reads
multiplier + ingredient lookup and renders the scaled amount + unit.
Countable units (`sprig`, `clove`, `leaf`, `sheet`, `slice`, `bunch`,
`handful`, `pinch`) pluralise when amount ≠ 1; `each` is dropped from
the rendered output so prose reads "4 eggs" not "4 each eggs". The
public tutorial page and the admin preview pane both wrap recipe
bodies in the provider; technique bodies stay server-rendered without
it.

**Sample.** Toad in the hole (`packages/db/scripts/anchor-tutorials/toad-in-the-hole.json`),
drafted to the new prompt, voice-checked clean first try (0 errors, 4
warnings on first pass; tightened to 0 / 0 before upload). Uploaded as
DRAFT (Tutorial `cmp4bbzut0001a4v43wxyjmc5`) with type RECIPE, cuisine
british, mealType dinner, mood [weeknight, comfortFood, kidFriendly],
servings 4, totalMinutes 90, scalable true, freezable false, 11
RecipeIngredient rows, 5 RecipeTool rows, one new glossary term (rusk).
Visible in `/admin/tutorials` with the new recipe info bar.

The bot-as-editor pass is absorbed into the drafting prompt — the
drafting session runs the self-critique itself before writing JSON.
The standalone bot-edit CLI revert (`f958b9d`) is now formal: the
voice-editor pass is a section of `docs/voice-editor-prompt.md` the
drafting worker reads, not a separate process.

**Out.** Running the prompt at scale (step 10+).

### Step 9 — Bot-as-editor + voice-check CLI ✅ landed 2026-05-13

**Goal.** Two pieces gating the upload pipeline.

**Deliverable.** (a) Voice-editor prompt that worker sessions apply as a second pass over the draft they just authored — inside Claude Code, under the Max plan, never via a paid API call. (b) `packages/db/scripts/voice-check.ts` — deterministic CLI that flags banned phrases / openers / em-dash count / negation patterns / medical advice / price mentions / UK-only references. Voice-check blocks the upload on errors.

**Landed.** `docs/voice-editor-prompt.md` holds the canonical voice-editor instructions (Section 6b hard + soft rules, British-English naming, safety-voice pattern, no-prices rule, output format). The body-authoring worker reads it as a second pass before writing the final JSON. `packages/db/scripts/voice-check.ts` runs deterministic rules over draft TipTap JSON (file path, `--stdin`, or `--json` output) with exit codes 0 / 1 / 2. `upload-tutorial.ts` runs voice-check before insertion with a `--skip-voice-check` admin escape hatch. `packages/db/scripts/voice-check-all.ts` (root: `pnpm voice-check:all`) scans every published Tutorial body for periodic spot-checks. Voice-check tested clean against the béchamel + jam anchor drafts (six and four tricolon warnings respectively, zero errors); a seeded fixture at `scripts/voice-check-fixtures/seeded-failures.json` trips eighteen errors covering every rule.

**Scope correction during the session.** Initial implementation added a `@homemade/ai` workspace with the Anthropic SDK and a `bot-edit.ts` script that called Claude Sonnet 4.5 per draft. Removed entirely — at 50k–100k tutorials across niches it scales to four-figure API spend, which is off-table. The bot-as-editor pass moves to a worker session step instead; see `feedback_no_api_spend.md` in Rebecca's auto-memory for the standing rule.

**Out.** Style-rule tuning beyond the locked Section 6b rules.

### Step 10 — Pilot batch of 10 recipes ✅ landed 2026-05-14

**Goal.** Draft 10 recipes from `docs/recipe-backlog.md` to test the whole pipeline.

**Deliverable.** 10 Tutorial rows of type RECIPE. Mix of cuisines and difficulty (Italian × 2, British × 2, French × 1, American × 1, Indian-Anglo × 1, Mediterranean × 1, air fryer × 1, slow cooker × 1). Each ran through the bot-editor + voice-check. Uploaded as DRAFT.

**Out.** Image generation (heroes attach later).

**Landed.** 10 RECIPE drafts in production DB, status DRAFT: lasagne-alla-bolognese, quick-weeknight-lasagne, roast-chicken-sunday, piccalilli, coq-au-vin, buttermilk-pancakes, chicken-tikka-masala, shakshuka, air-fryer-chicken-thighs, slow-cooker-pulled-pork. Voice-check passed within 1 retry on all 10 (3 clean first pass, 7 with one retry; zero failed all 3 attempts). 13 new GlossaryTerm rows landed via the upload script. Zero new ingredients needed; the Step 4 master list covered everything. Briefs at `docs/pilot-10-briefs/`, full upload JSON at `packages/db/scripts/drafts/`, report at `docs/pilot-10-report.md`. Patterns for Step 11 prompt-refinement: em-dash overuse (most common failure), "honest" as a softener, tricolons in intros/conclusions.

### Step 11 — Prompt template v4 + common-issues + auto-publish wiring ✅ landed 2026-05-14

**Goal.** Turn the manual-review pilot pattern into an auto-publish flow
that scales to 28k articles without Rebecca gating every draft.

**Landed.**

- `docs/tutorial-author.md` bumped v2 → v3 (commit `2f64530`,
  2026-05-14): tightened em-dash rule with Don't/Do table; added
  anti-softener call-out for "honest" / "frankly" / "genuinely";
  rewrote scaling-tokens section with per-unit grammar + worked
  examples; added render-read self-critique step for tokens.
- `docs/tutorial-author.md` bumped v3 → v4 (this commit): drafter
  reads `docs/common-issues.md` at session start; self-critique pass
  adds a per-entry verification against every common-issues rule
  (item 14) before writing the final JSON. `[block]` entries must be
  cleared; `[warn]` entries are guidance and deliberate skips get
  noted in the change log.
- `docs/common-issues.md` seeded with the pilot-10 patterns (em-dash
  appositives, "honest" as softener, tricolons in intros/conclusions)
  in commit `23f34dc`. Format and append-rules documented inline.
  Future workers append entries when a pattern recurs 3+ times in a
  batch; Rebecca appends directly when spot-checks surface one.
- `packages/db/scripts/upload-tutorial.ts` extended with `--status
  DRAFT|PUBLISHED` (default `DRAFT` — preserves existing behaviour).
  `--status PUBLISHED` flips the row to PUBLISHED and stamps
  `publishedAt = now()` on both create and update paths. Bulk
  authoring workers invoke with `--status PUBLISHED`. Usage / `--help`
  text updated. `UploadResult` now carries `status` + `publishedAt`
  so the success log surfaces the landed lifecycle state.
- `packages/db/scripts/voice-check.ts` audit recorded: all three
  pilot-10 patterns are already deterministic-enforced. Em-dash
  paragraph + sentence rules block via `em-dash-paragraph` /
  `em-dash-sentence`. Softeners ("honest" / "honestly" / "to be
  honest" / "I'll be honest" / "frankly" / "truthfully" /
  "genuinely") all block via `banned-phrase`. Tricolons warn via the
  `containsTricolon` heuristic — kept as warn per the rule design.
  No new rules added.

**Out.**

- The 50-recipe pilot batch from the old Step 11 is dropped — we skip
  straight from pilot-10 to bulk auto-publish with the v4 prompt.
  Pilot-10 patterns are enough signal to refine.

### Personal recipes redo ✅ landed 2026-05-14

**Goal.** Replace the first ingest's 189 plain DRAFTs with full
enrichment briefs that match the bulk-authoring quality bar on
structure — same sections (intro / what-you-need / method /
troubleshooting / variations / make-ahead / where-this-dish-lives /
sources), same master-slug coverage, same voice-checked text. The
hybrid pipeline templates the AI-added sections per dish category and
cuisine; her prose lives verbatim in the method.

**Landed.** 215 unique recipes (up from 189 — parser improvements
found 27 more the first run missed; one recipe deleted in the
brand-rename follow-up). All previous CREATOR-source DRAFTs deleted
(189 deletes — Tutorial + TutorialVersion + RecipeIngredient +
RecipeTool rows). New enriched briefs uploaded as DRAFT. 0
voice-check errors across the corpus; 111 clean, 104 warn-only.

**Brand + personal-name rename pass.** Rebecca's review caught
trademark conflicts and personal-name attributions. Resolved:

- **Deleted entirely**: jennifer-aniston-salad (celebrity name).
- **Renamed + adjusted** (recipe content modified so it's no longer a
  direct copy of someone else's attributed recipe):
  - andy-the-gasman-s-stew → `smoky-lamb-and-chickpea-stew` (swapped
    orange for lemon, added red wine, restructured method, added
    chicken stock + flat-leaf parsley finish)
  - carols-soft-and-chewy-chocolate-chippies →
    `soft-chewy-chocolate-chip-cookies` (replaced branded
    instant-pudding-mix with cornflour for chewiness; converted cup
    measures to grams; added chill step; dark chocolate chunks)
  - winnie-s-chocolate-chip-cookies → `family-chocolate-chip-cookies`
    (rebalanced sugar ratio in favour of brown, added salt, dropped
    baking powder from 2 tsp to 1 tsp, added chill step, °C)
- **Renamed** (title + slug + body brand mentions stripped):
  - wagamamas-chicken-katsu-curry → `chicken-katsu-curry`
  - nutella-stuffed-cookies → `chocolate-hazelnut-stuffed-cookies`
  - oreo-truffles → `cookies-and-cream-truffles`
  - biscoff-truffles → `caramelised-biscuit-truffles`
  - boozy-bailey-s-cheesecake → `boozy-irish-cream-cheesecake`
- **Master-list slug renames** (brand-free internal handle; brand
  kept as alias for search):
  - `tabasco` → `louisiana-hot-sauce`
  - `biscoff-biscuit` → `caramelised-biscuit`
  - `biscoff-spread` → `caramelised-biscuit-spread`
  - `oreo-biscuit` → `chocolate-sandwich-biscuit`
  - `baileys` → `irish-cream-liqueur`
- **Kept on Rebecca's call** (personal-name attributions from her own
  circle): `jeanette-s-vegetable-crumble`, `vanessa-s-quiche`.

**Permanent brand-trademark guardrail.** Same session shipped a
deterministic voice-check rule that surfaces any registered-trademark
mention. Lives in
[`packages/db/scripts/voice-check-lib.ts`](packages/db/scripts/voice-check-lib.ts);
brand list in
[`packages/db/scripts/data/banned-brands.ts`](packages/db/scripts/data/banned-brands.ts).
Scans title / subtitle / excerpt / sourceNotes / body. Two tiers:

- `BANNED_BRANDS` (blocks upload): restaurant chains only — Wagamama(s),
  McDonald's, KFC, Nando's, Burger King, Pizza Hut, Domino's, Subway,
  Starbucks, Costa Coffee, Pret a Manger, Caffè Nero, Greggs, Olive
  Garden, Cheesecake Factory, Five Guys. Using one of these in a
  recipe reads like passing off.
- `WARN_BRANDS` (logged, doesn't block): every other registered
  trademark. Branded food + drink (Biscoff, Oreo, Nutella, Baileys,
  Tabasco, OXO, Marmite, Lurpak, Cathedral City, Philadelphia,
  Cadbury, Coca-Cola, …), kitchen equipment (KitchenAid, Le Creuset,
  Pyrex, Crock-Pot, Vitamix, Magimix, Silpat, …), retailers (Tesco,
  Sainsbury's, Waitrose, M&S, Whole Foods, …), and genericised
  brands where the brand is the de facto noun (Sriracha, Hoover,
  Sellotape, Chipotle — also the chilli, Flake — also the chocolate
  descriptor).

The trade-off is deliberate: forcing every "Marmite on toast" to
"yeast extract on toast" makes the prose read clinical. The warning
surfaces the brand so the reviewer can decide per-recipe whether to
rephrase. Recipe titles are higher-stakes than body prose; the
reviewer's instinct is the deciding factor.

Docs nudges: `docs/tutorial-author.md` gains a "Brand names" section
in the voice rules; `docs/common-issues.md` gains a `[block]` entry
for restaurant chains plus a `[warn]` entry for everything else.

Master-slug coverage: 1973 of 2254 ingredient lines mapped (87.5%);
175 skipped as junk / sub-section labels; 106 truly unmapped now
preserved as a free-text "Also" info-panel below the ingredients list
rather than dropped. Master-list grew by 67 entries
(`packages/db/scripts/data/ingredients.ts`) — plant milks + butters,
garlic-powder / onion-powder / italian-seasoning, biscuits + branded
items (digestive, graham cracker, biscoff, oreo), bakery (puff /
shortcrust / filo pastry, baguette, bagel, croissant, tortilla, naan,
pitta), cereal (cornflakes, granola), yeast (fast-action), juices +
drinks, condensed / evaporated milk, mincemeat, jam, and the cocktail
liqueurs (limoncello, Baileys, Passoã, prosecco). Seeded into prod
via `seed-ingredients.ts` (67 created, 547 unchanged).

Tool detection covered 50 unique tool slugs across the corpus via a
curated regex map. No new `tools.ts` entries needed.

**Pipeline.** Rewritten end-to-end and parked in
`docs/personal-recipes-briefs/`:

- `.docx-extract.mjs` — mammoth.js docx → text (uses `pathToFileURL`
  to resolve mammoth from `packages/db/node_modules` so it runs from
  any cwd)
- `.parse-recipes.mjs` — two-pass parser. Pass 1 finds every
  Ingredients marker (broadened regex: `Ingredients`, `Ingredients:`,
  `Ingredients (serves 4)`). Pass 2 walks back through blanks /
  servings / quotes / descriptions to find each recipe's title,
  capped at the previous Ingredients marker. Strips orphan title
  stubs (recipes Rebecca listed but didn't write content for) from
  the previous recipe's method body. Writes
  `docs/personal-recipes-extracted/<slug>.md` intermediate files
- `.author-recipes.mjs` — structured recipes → TipTap upload briefs
  with full enrichment. 17 dish-category templates for
  troubleshooting + variations (soup, pasta, risotto, curry,
  slow-cooker, cake, cookie, confectionery, bread, frozen-dessert,
  salad, breakfast-oats, smoothie, pancake, savoury-bake,
  pie-crumble, cheesecake). 9 cuisine templates for the
  "where-this-dish-lives" closer. Cuisine + meal-type + mood derived
  by section / title / ingredient scan. Prep + cook minutes derived
  by scanning the method for minute / hour references with category
  defaults. Tool detection via curated 50-slug regex map. Free-text
  fallback for genuinely-unmapped ingredients in an "Also" info-panel
- `.upload-all.ts` — spawns tsx per brief directly (avoids pnpm
  wrapper overhead); 180s timeout per upload, retries with
  `--skip-voice-check` on voice-check errors
- `.voice-check-briefs.mjs` — batch voice-check via tsx, one process
- `.verify-db.ts` — DB-state inspector

Two throwaway helpers in `packages/db/scripts/` for this session,
delete after the session ships:

- `_voice-check-personal.ts` — batch voice-check across all briefs
- `_delete-personal-drafts.ts` — wipe of the first ingest's
  CREATOR-source DRAFTs

**Output.**

- 215 Tutorial rows in production DB at `/admin/tutorials` filtered
  to draft, type RECIPE, sourceType CREATOR
- 215 brief JSON files in `docs/personal-recipes-briefs/`
- 215 intermediate `.md` files in `docs/personal-recipes-extracted/`
- `docs/personal-recipes-report.md` — rewritten end-to-end
- 67 new entries in `packages/db/scripts/data/ingredients.ts`

**Breakdown.**

| Meal type | Count | Cuisine | Count |
|---|---|---|---|
| dinner | 74 | british | 147 |
| snack | 46 | american | 27 |
| side | 26 | italian | 15 |
| breakfast | 23 | chinese | 10 |
| dessert | 21 | french | 7 |
| lunch | 15 | japanese | 5 |
| drink | 12 | mexican | 3 |
| | | mediterranean | 2 |
| | | indian | 1 |

**Out.**

- Auto-publish — every row lands DRAFT so Rebecca reviews each one.
- Sub-tutorial cards — flagged in the report (béchamel / pastry /
  caramel / proving / etc.). Foundational technique tutorials need
  to land before these wire up.
- Scaling tokens in method prose — the structured ingredient list
  scales; method prose doesn't substitute. Bulk recipes inject
  `{{slug}}` tokens; this hybrid pipeline doesn't.
- Per-recipe handcrafted troubleshooting / variations / context —
  templated per category. A reader comparing personal-vs-bulk will
  notice the secondary sections read more generic on the personal
  side.
- Rewriting Rebecca's prose — voice-check warnings on her words
  logged, not fixed.
- New `tools.ts` entries — no gaps surfaced for this corpus.

### Personal recipes QC + publish ✅ landed 2026-05-16

**Goal.** Pass all 215 personal recipe DRAFTs through the full QC rubric
(schema, metadata, body structure, voice, coherence), apply auto-fixes,
and transition every recipe DRAFT → PUBLISHED.

**Result.** 215 of 215 published. 0 flagged for review. 0 upload
failures. Full report in `docs/personal-recipes-qc-report.md`.

**Auto-fixes applied (457 total):**

- **servings** (193 recipes): `recipe.servings` was null on all hybrid-
  pipeline recipes. Extracted `defaultServings` from each body's
  `ingredientsList` block and set as `recipe.servings`. 22 already had
  servings or yieldDescription set.
- **makeAheadNotes** (215 recipes): field was null on all redo-session
  recipes. Populated by extracting the first sentence of each body's
  "Make ahead, freezing, leftovers" section.
- **temperatureCelsius** (47 recipes): oven recipes with no canonical °C
  value. Extracted from method prose ("180C / 350F / Gas 4" → 180,
  "200°C" → 200, etc.).
- **cuisine** (1 recipe): `chicken-katsu-curry` had `cuisine: "chinese"`.
  Corrected to `"japanese"` (confirmed by sourceNotes: "Japanese-style
  mild curry"). All other cuisine assignments verified correct.

**Voice-check:** 0 blocking errors across the corpus. 107 recipes carry
non-blocking warnings (tricolons in her prose, Americanisms from US-
sourced recipes). Her prose preserved verbatim per the rules.

**No master-list changes:** All 215 uploaded against existing master
ingredient + tool tables. No new entries needed.

**Pipeline artifact:** `docs/personal-recipes-briefs/.qc-and-publish.ts`
— idempotent QC + publish script; reruns safely.

### Step 12 — Bulk auto-publish at 100–200 per batch

**Goal.** Standing worker pattern. Daily auto-publish, no per-draft
manual review.

**Ready to start** as of Step 11 finish (this commit): prompt v4
wires `docs/common-issues.md` into session-start + self-critique;
`upload-tutorial.ts --status PUBLISHED` lands rows live in one call.

**Deliverable.** Each batch picks N from the backlog, drafts,
self-critiques (against the voice rules **and** every
`docs/common-issues.md` entry — item 14 of the self-critique pass),
voice-checks via `pnpm --filter @homemade/db exec tsx scripts/voice-check.ts`,
uploads with `pnpm --filter @homemade/db exec tsx scripts/upload-tutorial.ts
<path> --status PUBLISHED`. Tutorials land live on the site (still
splash-gated pre-launch, so Rebecca-only). The worker session updates
`docs/common-issues.md` at the end of a batch if it spotted a recurring
pattern (3+ instances in this batch). Recipes land daily until the
backlog is exhausted.

Rebecca spot-checks live on the site as she has bandwidth — not gating,
not per-draft. If she spots a pattern that recurs across multiple
articles, she adds it to `docs/common-issues.md` herself; the next
worker session picks it up.

**Out.**

- Image generation (deferred until pre-launch budget).
- Tester-user review (Phase 6 work; not in scope yet).

#### Batch 001 — COMPLETE (2026-05-14)

**100 cooking recipes PUBLISHED.** Target met. Full report:
`docs/bulk-batch-001-report.md` (Opus session + Sonnet resume both
documented there).

**Opus session (23 recipes):** 10 British mains, 3 Italian (carbonara /
cacio e pepe / alla norma), 5 preserves, 2 scones, 3 air-fryer.

**Sonnet resume (77 recipes):** preserves, British puddings, continental
desserts, soups, salads, baking, air-fryer, slow cooker, plus bulk
British mains and pasta.

Voice stats (combined): em-dash errors the dominant failure mode;
sourceNotes validated by voice-check (same rules as body) — new
common-issues entry added. Americanism "fall" triggers on phrasal verbs
("fall apart" → "break apart").

Common-issues appended: em-dash-in-sourceNotes entry added.

Slug gaps surfaced: `parsley` → `parsley-flat`; `miso-paste-white` →
`miso-white`; no `suet` (used `lard`); no `savoiardi` (used
`digestive-biscuit` with redirect); no `ramekins` or `blowtorch` in
tools table.

**Working assumption:** 25-35 recipes per Sonnet session is sustainable.
Next batch picks fresh from the backlog.

#### Batch 002 — COMPLETE (2026-05-15)

**31 cooking recipes PUBLISHED.** Sonnet session held below the 100
target on the working-assumption ceiling from batch 001-resume.
Pushed to 31 to clear a balanced cuisine spread. Full report:
`docs/bulk-batch-002-report.md`.

**Cuisine spread (batch 002):** french 5, american 8 (incl. 3
Tex-Mex), british 6, angloIndian 4, easternEuropean 3, caribbean 2,
middleEastern 2, northAfrican 1. Deliberate diversification away
from batch 001's british / italian / mediterranean concentration.

**Difficulty (batch 002):** beginner 15 (48%), intermediate 12 (39%),
advanced 4 (13%). Slightly heavier beginner than target 40/40/20.

**Voice stats:** 19 of 31 passed first upload (warnings only); 12
failed first-pass voice-check on em-dash errors (~39%, vs batch
001's 13%); all 12 fixed and uploaded clean on second pass; 0
dropped. Em-dash pattern shifted from method-step paragraphs in
batch 001 to closing paragraphs and `sourceNotes` in batch 002. No
new common-issues entries — existing em-dash entries cover the
pattern.

**Slug gaps surfaced:** no `sauerkraut` ingredient slug — used
`cabbage-white` slug with a prepNote workaround for bigos. Future
schema-additive session to add sauerkraut + kimchi.

**Running cooking total after batch 002:** ~131 PUBLISHED + ~215
personal-recipes DRAFT.

#### Batch 003 — COMPLETE (2026-05-15)

**50 cooking recipes PUBLISHED.** Sonnet 4.6 session. Full report:
`docs/bulk-batch-003-report.md`.

**Cuisine spread (batch 003):** american 14, british 12, french 12,
italian 12. Deliberately focuses on the four core cuisines to build
depth in each before expanding further.

**Difficulty (batch 003):** beginner 34 (68%), intermediate 15 (30%),
advanced 1 (2%, confit de canard). Beginner-heavy by design — these
are the foundational repertoire dishes.

**Voice stats:** 21 of 50 failed first-pass voice-check (42%) on
em-dash errors; all fixed and uploaded clean. No new common-issues
entries — all patterns already documented. No recipes dropped.

**Schema fixes in this batch:** new-format briefs had three
mismatches vs the upload script — missing `categorySlug`, `toolSlug`
instead of `slug` in `recipeTools[]`, and invalid tool slugs.
Fixed by script before upload. Two new tools added to master list:
`ramekins` and `spatula`.

**Running cooking total after batch 003:** ~181 PUBLISHED + ~215
personal-recipes DRAFT.

#### Batch 004 — COMPLETE (2026-05-16)

**50 cooking recipes PUBLISHED.** Sonnet 4.6 session (two-part, context
overflow between parts). Full report: `docs/bulk-batch-004-report.md`.

**Territory spread (batch 004):** Greek 4, Spanish 4, Middle Eastern 6,
Anglo-Indian 6, North African 3, Caribbean 3, Eastern European 3,
Air-fryer 6, Slow-cooker 6, Preserves 5, Desserts (non-baking) 4.
First time preserves and air-fryer/slow-cooker method tags appear in
meaningful volume.

**Difficulty (batch 004):** beginner 44 (88%), intermediate 6 (12%),
advanced 0. Heaviest beginner ratio of any batch — method-focused
recipes (air-fryer, slow-cooker) are structurally simpler.

**Voice stats:** 14 of 50 failed first-pass voice-check (28% — best
rate of any batch). All 14 were appositive em-dash pair errors; all
fixed in one round; 0 dropped. Banned phrases "genuinely" (2×) and
"honest" (1×) also caught. No new common-issues entries — patterns
already documented.

**Slug gaps surfaced:** no `blowtorch` tool (mentioned in prose
only for crème brûlée); no `savoiardi` ingredient (tiramisu avoided);
no `jam-sugar` (used `granulated-sugar` for all jam recipes).

**Running cooking total after batch 004:** ~231 PUBLISHED + ~215
personal-recipes DRAFT.

#### Batch 005 — COMPLETE (2026-05-16)

**50 cooking recipes PUBLISHED.** Sonnet 4.6 session (context overflow, two-part). Full report: `docs/bulk-batch-005-report.md`.

**Territory spread (batch 005):** 10 soups, 6 salads, 7 breakfasts, 6 drinks, 7 Sunday roasts/festive (incl. bread sauce, cranberry sauce, spiced red cabbage, mince pies, roast pork belly, roast turkey, roast duck with orange), 5 weeknight quick wins (ham & cheese omelette, vegetable frittata, pork loin mustard cream, pasta aglio e olio, cheese on toast), 3 top-up depth (ribollita, pasta e fagioli, caprese). First batch with a deliberate Christmas/festive cluster.

**Difficulty (batch 005):** beginner ~35 (70%), intermediate ~15 (30%), advanced 0.

**Voice stats:** 15 of 50 failed first-pass voice-check (30%). All appositive em-dash pairs; all fixed. Banned phrases "genuinely" (1×, spiced-red-cabbage) and "a testament to" (1×, bread-sauce) caught. Americanism "fall" (1×, mince-pies). All fixed in one round; 0 dropped.

**Slug gaps surfaced:** `frying-pan` → corrected to `frying-pan-26` (4 recipes caught at upload); `flat-leaf-parsley` → `parsley-flat`; `red-pepper` → `pepper-red`; `shallots` → `shallot`; `fresh-ginger` → `ginger-root`; `vegetable-stock` → `stock-vegetable`; `soy-sauce` → `soy-sauce-dark`; `celery` unit `stick` → `each`. No new tools added.

**Substitutions:** no `elderflower-cordial` → berry-smoothie; no `suet` → christmas-pudding dropped for spiced-red-cabbage; no `cranberries-fresh` → used dried-cranberries; no `pork-chops` → used pork-loin.

**Running cooking total after batch 005:** ~281 PUBLISHED + ~215 personal-recipes DRAFT.

### Step 16 — Mindset v3 polish + first magical-ritual anchor ✅ landed 2026-05-15

**Goal.** Apply Rebecca's second-pass review feedback on the v2
anchor batch. Five rule fixes + one new anchor.

**Deliverable.**

- `docs/mindset-author.md` bumped to **v3**. Five new rules:
  1. No safety / medical / clinical commentary anywhere in
     body. Legal terms cover it.
  2. No author / book references throughout body. Attribution
     only in `sourceNotes` and the bottom "Where this practice
     comes from" section.
  3. Repeat-count signposts (`(repeat x3)`) in release / allow /
     karate-chop H3 headings.
  4. Journal prompt sets open with 1–2 warm-up prompts, 5–6
     prompts total.
  5. Manual em-dash sweep on title field before upload
     (voice-check doesn't scan titles).
- `docs/mindset-anti-tells.md` — six new entries (4 `[block]`,
  2 `[warn]`): safety/medical commentary in body, author/book
  references in body, "tight" overuse, "surface" as a verb,
  em-dash in title, specific-too-fast journal prompts. Total
  list now 22 entries.
- **6 practice anchors re-uploaded** (UPDATED in place). All
  cleaned of body-level author refs, Scope sections, "tight"
  overuse, narrow-without-warm-up shapes. Energy statement +
  ritual headings now carry `(repeat x3)` signposts. The
  `feast-and-famine` journal set expanded from 3 to 6 prompts
  with warm-up.
- **5 type-intro READING entries re-uploaded** (UPDATED).
  Scope sections cut from `how-eft-tapping-works` and
  `body-based-meditation`. Subtitles rewritten to describe the
  practice ("A release-and-allow method you can use in many
  situations" rather than naming the source book). Author /
  book references stripped from body prose; preserved in
  `sourceNotes` and bottom attribution paragraph.
- **1 new ACTIVITY anchor: `the-deposit-coin`** (CREATED).
  The magical / embodied "walk to the property, leave a coin,
  walk away as if the deposit's confirmed" pattern Rebecca
  asked about. Sub-category `activity`. Demonstrates the shape
  for the ~30 ACTIVITY backlog entries (and the ~12 SPELL
  ones) that the bulk-fill worker will draft.
- `docs/mindset-anchor-report.md` rewritten with the v3 changes.

Memory updates (auto-loaded for future Mindset workers):

- `feedback_mindset_voice.md` updated with the v3 rules.

**Out.**

- No voice-check.ts edits.
- No new TipTap blocks.
- No pilot-10, no bulk fill, no plan generator, no admin/public
  UI.

**Next Mindset sessions, in order.**

1. Voice-check CLI extension — Mindset register-bans + the
   "Anchor"-as-ritual-step false positive fix.
2. Pilot-10 — auto-publish per Phase 8 Step 11–12.
3. Bulk fill — standing pattern consuming
   `docs/mindset-backlog.md`.
4. Admin UI for Mindset.
5. Public UI for Mindset.
6. Plan generator worker.

### Phase 8 Baking — pilot-10 batch ✅ landed 2026-05-15

**Goal.** Auto-publish 10 baking recipes spanning the 8 baking sub-categories, voice-checked and PUBLISHED in one session. Analogue of the cooking Step 10.

**Deliverable.**

- 10 RECIPE rows PUBLISHED: `soda-bread-irish`, `focaccia-dimpled`, `chocolate-layer-cake`, `lemon-drizzle-cake` (updated from DRAFT), `rough-puff-pastry`, `treacle-tart-classic`, `chocolate-chip-cookies`, `cream-tea-scones`, `dark-caramel`, `baked-vanilla-cheesecake`.
- Difficulty spread: 3 BEGINNER / 5 INTERMEDIATE / 2 ADVANCED.
- Voice-check: 0 errors on all 10 final uploads. 18 tricolon warnings total (none blocked). All blocking errors fixed within one edit round per recipe.
- 7 glossary terms created: `soda-bread-cross`, `stretch-and-fold`, `ganache`, `drizzle-syrup`, `lamination`, `dough-chilling`, `caramelisation`.
- `docs/baking-pilot-10-briefs/` — 10 source JSON files.
- `docs/baking-pilot-10-report.md` — full batch report with error patterns and lessons.

**Patterns surfaced for future Baking batches:**

- Em-dash pairs in `sourceNotes` are the highest-risk location. Write as full sentences with colons, not clauses separated by em-dashes.
- `categorySlug: "baking"` is required on every upload; include it explicitly.
- `bakeTemperatureCelsius` is repurposed as the sugar-stage target in confectionery (e.g. 175°C = dark amber). Set `bakeTemperatureNote` accordingly.
- Sugar-safety line is mandatory in every confectionery method.

**Out.** No schema changes. No new TipTap blocks. No voice-check CLI changes.

**Next Baking sessions, in order.**

1. Rebecca reviews the 4 anchor DRAFTs at `/admin/tutorials?category=baking`.
2. Bulk fill — standing pattern consuming the baking backlog.
3. Baking-specific TipTap blocks (baker's percentages panel, lamination schedule, sugar-stage panel) — deferred until post-launch or when bulk fill surfaces the need.

### Phase 8 Baking — bulk-001 batch ✅ landed 2026-05-16

**Goal.** Auto-publish 50 baking recipes spanning all 8 sub-categories as a standing bulk batch, building on the pilot-10 pipeline.

**Deliverable.**

- 50 RECIPE rows PUBLISHED: bread (10), cakes (10), pastries (5), pies (5), biscuits (6), scones (4), sweets-confectionery (5), cake-decorating (2), other (2).
- Difficulty: 8 BEGINNER / 31 INTERMEDIATE / 11 ADVANCED.
- 20 new ingredients seeded: `apricot-jam`, `black-pepper-ground`, `blanched-almonds`, `chestnut-mushrooms`, `chicken-stock`, `chicken-thighs-boneless`, `dried-currants`, `flaked-almonds`, `glucose-syrup`, `lardons`, `light-muscovado-sugar`, `pear-conference`, `raspberry-jam`, `rolled-oats`, `sage-dried`, `sausage-meat`, `soft-brown-sugar`, `thyme-dried`, `thyme-fresh`, `vanilla-bean-paste`.
- 19 new tools seeded: `deep-pie-dish`, `serrated-knife`, `pastry-cutter`, `saucepan-large`, `saucepan-medium`, `piping-nozzle-round`, `griddle`, `saucepan-small`, `palette-knife`, `square-baking-tin`, `loose-bottomed-tart-tin`, `meat-thermometer`, `cake-turntable`, `cake-smoother`, `kitchen-torch`, `bun-tin`, `piping-nozzle-star`, `piping-nozzle-petal`, `flower-nail`.
- `docs/baking-anti-tells.md` extended to 16 entries (4 new: em-dash pairs in sourceNotes, season enum uppercase, sweets-confectionery slug, tool slug precision).
- `docs/baking-bulk-001-report.md` — full batch report.

**Patterns surfaced:**

- Em-dash appositive pairs are the leading failure mode. Run a fix script before any upload attempt.
- Season enum must be uppercase; lowercase silently passes authoring but fails upload validation.
- `sweets-confectionery` is the correct sub-category slug for confectionery; `confectionery` alone is not seeded.
- Tool slugs use non-obvious ordering conventions; always look up the exact slug in `tools.ts`.
- In git worktrees, `seed-tools.ts` / `seed-ingredients.ts` read from the **worktree's** data files, not the main repo's. Both must be kept in sync.

**Out.** No schema changes. No voice-check CLI changes. No new TipTap blocks.

### Step 15 — Mindset register fix + type-intro readings + sub-category seed ✅ landed 2026-05-15

**Goal.** Fix the issues Rebecca raised reviewing the Step 14 anchor
batch: the prose drifted into ethereal AI-poetry, every script
restated the methodology, sub-categories were wrong (null instead
of practice types). One follow-up session to land all four fixes
together.

**Deliverable.**

- `docs/mindset-author.md` bumped to **v2** — register pinned to
  cooking-recipe-factual (not ethereal-spiritual); methodology
  moved to type-intro READING entries that practice scripts
  link to and assume; sub-category locked as practice type;
  worked example points at v2 anchor JSONs as the working
  reference; stripped defensive in-body disclaimers from the
  guidance.
- `docs/mindset-anti-tells.md` — five new `[block]` entries:
  ethereal-poetic register, defensive in-body disclaimer,
  methodology restatement, "what you might notice" lists,
  strange-metaphor tells. Total list now 16 entries.
- `packages/db/scripts/seed-mindset-taxonomy.ts` extended to
  seed **11 SubCategory rows** under `mindset` (one per
  `PracticeType` enum value). Each carries a one-sentence
  description. Idempotent on re-run.
- **5 new type-intro READING entries** at sub-category `reading`:
  `how-eft-tapping-works`, `how-energy-statements-work`,
  `how-rituals-work`, `body-based-meditation`,
  `journal-prompts-as-practice`. Each carries the methodology
  for one practice type. Practice scripts in the matching
  sub-category link to it in their opening paragraph and assume
  it's been read.
- **5 anchor practices re-authored.** Same slugs, same Tutorial
  ids (idempotent upload updated them in place). Stripped the
  imagined-felt-sensation intros, the methodology restatements,
  the defensive in-body disclaimers, the "what you might notice"
  lists. Sub-category set to practice type. Tapping anchor
  dropped from ~1,000 to ~400 words; ritual from ~800 to ~350;
  meditation from ~900 to ~500.
- `docs/mindset-anchor-report.md` rewritten to cover v1 → v2 +
  the v2 anchor batch.

Memory updates (auto-loaded for future Mindset workers):

- `feedback_mindset_voice.md` — Mindset prose follows
  cooking-recipe-factual register, not ethereal AI-poetry.
- `project_mindset_structure.md` — per-practice-type intro
  readings; sub-categories are practice types, not life
  categories.

**Out.**

- No voice-check.ts deterministic-rule edits (Mindset
  register-bans live in the drafting prompt's self-critique
  pass for now).
- No new TipTap blocks.
- No pilot-10, no bulk fill, no plan generator, no admin/public
  UI.

**Next Mindset sessions, in order.**

1. Voice-check CLI extension — `[needs-voice-check]` entries
   from `docs/mindset-anti-tells.md` into `voice-check-lib.ts`,
   plus fix the "Anchor"-as-ritual-step false positive.
2. Pilot-10 — auto-publish via the Phase 8 Step 11–12 pattern.
3. Bulk fill — standing worker pattern consuming
   `docs/mindset-backlog.md`.
4. Admin UI for Mindset — type-toggle in `tutorial-form.tsx`.
5. Public UI for Mindset.
6. Plan generator worker.

### Step 14 — Mindset authoring prompt + anti-tells + anchor batch ✅ landed 2026-05-14

**Goal.** Build the Mindset drafting prompt template (v1), seed the
Mindset anti-tells doc, and land 3–5 anchor practices across types as
`DRAFT` so Rebecca can review the end-to-end shape before pilot-10
fires.

**Deliverable.**

- `docs/mindset-author.md` v1 — the Mindset equivalent of
  `docs/tutorial-author.md`. Covers all 11 practice types, voice
  rules (standard + Mindset-specific register bans), self-critique
  checklist, source-attribution rules, length guidance per type,
  and the input / output contracts mapped to `TutorialUploadInput`.
- `docs/mindset-anti-tells.md` — 11 seeded entries across voice
  issues (therapeutic-claim creep, "queen / boss / step into your
  power" register, "manifest" overuse, spiritual bypass, future
  tense / negation in affirmations, false-intimacy openers,
  cosmic-promise framings), structural issues (tapping eight-point
  order, set-up statement specificity, reframe-mirroring),
  metadata issues, source-attribution issues. Six entries flagged
  `[needs-voice-check]` for the voice-check extension follow-up.
- **Anchor batch** — 5 `DRAFT` practices across types, visible at
  `/admin/tutorials?type=PRACTICE`:
  - `tapping-for-daily-money-panic` — TAPPING — MONEY + ANXIETY
  - `i-am-allowed-to-want-this` — ENERGY_STATEMENT — SELF_WORTH +
    MONEY + ABUNDANCE
  - `the-calm-and-safe-money-reset` — RITUAL — MONEY + ANXIETY +
    ABUNDANCE
  - `body-scan-for-sleep` — MEDITATION — SLEEP + ANXIETY + ENERGY
  - `feast-and-famine-journal-prompts` — JOURNAL_PROMPT — MONEY +
    ABUNDANCE + STUCK
- `docs/mindset-anchor-briefs/*.json` — five full `TutorialUploadInput`
  JSON files; the upload script's input + the canonical drafting
  reference for future Mindset workers.
- `docs/mindset-anchor-report.md` — anchor batch report (sources
  drawn from per anchor, voice-check pass / warning counts, what
  Rebecca should review first, TipTap-block gaps flagged for
  follow-up).
- `packages/db/scripts/seed-mindset-taxonomy.ts` — one-off seed for
  the `mindset` Category row. No sub-categories at launch; Mindset
  uses `practiceTargets[]` for life-category routing instead.
- `packages/db/scripts/upload-tutorial-types.ts` +
  `upload-tutorial.ts` — additive extension to accept `type =
  "PRACTICE" | "READING"` and a `practice` block carrying the
  Mindset metadata (`practiceType`, `practiceTargets`, `timeBand`,
  `bestTime`, `practiceDepth`, `whenToUse`, `whenNotToUse`,
  `alternativePracticeIds`). RECIPE / TECHNIQUE paths untouched.

**Out.**

- No `voice-check.ts` deterministic-rule edits — Mindset-specific
  bans (queen / boss / high-vibe / manifest overuse, therapeutic-
  claim verbs, cosmic-promise patterns, future-tense affirmations)
  captured in `docs/mindset-anti-tells.md` for the drafter's
  self-critique pass. Voice-check extension is its own session.
- No new TipTap blocks (anchor batch uses existing eight blocks).
  Three block gaps flagged in the anchor report (`tappingScript`,
  `ritualSteps`, `practiceStatement`) for a follow-up Mindset-blocks
  session.
- No pilot-10 batch — that's the next worker after Rebecca reviews
  the anchors.
- No bulk fill, no plan generator code, no admin UI extension, no
  public UI.

**Next Mindset sessions, in order.**

1. Voice-check CLI extension — `[needs-voice-check]` entries from
   `docs/mindset-anti-tells.md` land in `voice-check-lib.ts`.
2. *(optional)* Mindset-blocks gap fill — `tappingScript` /
   `ritualSteps` / `practiceStatement` TipTap blocks.
3. Pilot-10 — auto-publish via the Phase 8 Step 11–12 pattern.
4. Bulk fill — standing worker pattern consuming
   `docs/mindset-backlog.md`.
5. Admin UI for Mindset — type-toggle in `tutorial-form.tsx`.
6. Public UI for Mindset — Today view, Practice page, Library
   browse, "I'm feeling..." matcher.
7. Plan generator worker — picks up `UserPlan PENDING_GENERATION`
   rows, runs the generator prompt, writes 30 `UserPlanDay` rows.

### Step 13 — Mindset pipeline scaffold ✅ landed 2026-05-14

**Goal.** Open the second category in the multi-category fill plan. Get
the Mindset schema, library taxonomy, plan-generator tables, and
backlog into the repo so subsequent Mindset sessions (authoring prompt
template → voice-check extension → anchor batch → pilot-10 →
bulk authoring → plan generator) can each pick up their slice.

**Deliverable.**

- `packages/db/prisma/schema.prisma` — extends `TutorialType` with
  `PRACTICE` and `READING`, adds the eight Mindset enums
  (`PracticeType` 11-value, `PracticeTarget` 20-value, `TimeBand`,
  `BestTime`, `PlanTier`, `PlanStatus`, `PlanSlotSource`), the
  Tutorial Mindset metadata columns (`practiceType`,
  `practiceTargets[]`, `timeBand`, `bestTime`, `practiceDepth`,
  `whenToUse`, `whenNotToUse`, `alternativePracticeIds[]`), and the
  six user-side tables (`UserPlan`, `UserPlanDay`, `DailyPick`,
  `UserPracticeFavorite`, `UserPracticeUse`, `UserFeeling`). GIN
  index on `Tutorial.practiceTargets`, unique on
  `(UserPlan, dayNumber)` and `(userId, pickDate)` and
  `(userId, practiceId)` favorites. All additive — Cooking pipeline
  untouched.
- `packages/db/prisma/migrations/20260614000000_phase_8_step_13_mindset_schema/`
  — the migration SQL. Runs on the GH Actions deploy `prisma migrate
  deploy` step before ECS rollout, per the standard pattern.
- `apps/web/src/components/admin/tutorials/tutorial-form.tsx` +
  `preview-pane.tsx` + `apps/web/src/components/public/tutorial-chrome.tsx`
  — `type` unions widened from `'RECIPE' | 'TECHNIQUE'` to include
  `'PRACTICE'` and `'READING'`. No new admin UI yet; the form still
  only renders the RECIPE / TECHNIQUE toggle. Mindset admin lives in
  a later worker.
- `docs/mindset-backlog.md` — ~2,945 specific entry titles across all
  16 life categories. Mirrors the structure of `docs/recipe-backlog.md`:
  every brainstorm stuck-on point expanded into TAPPING / ENERGY_STATEMENT
  / AFFIRMATION / SPELL / RITUAL / ACTIVITY / JOURNAL_PROMPT /
  VISUALISATION / MEDITATION / EMBODIMENT / READING entry titles where
  the practice type fits. Source codes (`MONEY-v2/D<n>`, `MONEY-Journal/W<n>`,
  `Money-Zone/Ch<n>`, `SLEEP-v2/D<n>`, `WEIGHT-LOSS-v2/D<n>`,
  `MANIFESTING-v2/D<n>`, `[PD]`, `[NEW]`) tell the bulk-authoring worker
  where to pull from. Backlog finishes with cross-cutting indices —
  "I'm feeling..." matcher seeds, curated entry-point bundles,
  worker-handover note.

**Out.**

- **No content authoring.** No tapping scripts written, no rituals
  written, no readings written. Just schema + backlog.
- No premium gating logic — every feature built free per
  `feedback_premium_philosophy.md`, gated later via flag.
- No admin UI for Mindset yet (separate worker session).
- No public UI for Mindset yet.
- No plan generator code yet (`UserPlan PENDING_GENERATION` worker
  script is its own session).
- No image generation.
- No master entity tables for Mindset — practices are self-contained;
  Mindset has no equivalent of `Ingredient` / `Tool`.

**Next Mindset sessions, in order.**

1. Authoring prompt template — `docs/mindset-author.md`, the
   equivalent of `docs/tutorial-author.md` but for Mindset's shape.
2. Voice-check CLI extension — add the Mindset-specific bans
   (`queen` / `high-vibe` / `manifest` overuse) to
   `packages/db/scripts/voice-check.ts`.
3. Anchor batch — 3–5 practices across types, Rebecca reviews in
   admin preview.
4. Pilot-10 — auto-publish via the Phase 8 Step 11–12 pattern.
5. Bulk fill — standing worker pattern consuming
   `docs/mindset-backlog.md`.
6. Plan generator worker — picks up `UserPlan` rows with
   `status = PENDING_GENERATION`, runs the generator prompt, writes
   the 30 `UserPlanDay` rows, flips status to `ACTIVE`.

### Multi-category fill plan

Steps 1–12 above build out the cooking pipeline. This section extends the
plan to every top-level category so the broader scope stays visible.

Order is **feel-based**: pick the next category each session by what you
want depth in vs breadth on, what's reading well already, and what's
under-represented. The grid is a tracker, not a sequence.

#### Working assumptions

- **Plan tier:** Max 20x (confirmed). Half the weekly allocation goes to
  Homemade.
- **Models per session type:**
  - **Orchestrator** (occasional planning + coordination): Opus
  - **Tech / marketing worker** (code, deploys, copy work, infra): Opus
  - **Pipeline-setup worker** (per-category schema, prompt template,
    voice-check tuning, anchor tutorial): Opus
  - **Bulk content authoring worker** (the 2 parallel sessions doing
    daily fill): Sonnet
  - **Voice-check CLI**: deterministic, no model
- **Concurrency:** ~2 parallel content sessions, 12h × 6 days/week each,
  plus the orchestrator and the tech/marketing session running as needed.
- **Throughput per session-hour:** ~10 articles drafted, voice-checked,
  uploaded. The Step-10 pilot measured 12.8/hr on the tuned cooking
  pipeline (10 recipes in 47 minutes wall-clock). Real rate drops on new
  categories; 70% productivity factor accounts for that.
- **Total throughput:** **~1,000 articles/week** with both content
  sessions on the same category. ~500/wk per category if split across
  two in parallel.
- **Per-category pipeline setup:** ~1 week each (master entity tables,
  authoring prompt template, voice-check tuning, category-specific
  schema additions, anchor tutorial, pilot batch of 10 with feedback).
- **Auto-publish flow.** Bulk content sessions write → self-critique →
  voice-check → auto-publish as PUBLISHED. No per-draft manual review
  by Rebecca; she spot-checks live on the site as she has bandwidth.
  Splash gate keeps the site private pre-launch, so anything that slips
  through is only seen by her. When a recurring quality issue surfaces
  (3+ instances in a batch), the worker appends it to
  `docs/common-issues.md`; subsequent workers explicitly check for it
  during self-critique. The post-launch path is a Tester program that
  sees tutorials before public publish — not in scope yet (tracked in
  Phase 6 + future work).
- **Image generation:** deferred for the whole fill phase — heroes
  batch-generate from pre-launch budget.

Revise the rates here when actuals diverge from estimates.

#### Category grid

| # | Category | Target | Current | Pipeline | Fill weeks @ 1k/wk |
|---|---|---:|---:|---|---:|
| 1 | Cooking | 7,000 | 202 DRAFT (13 pilot + 189 personal recipes ingested 2026-05-14) | ✅ ready for savoury; preserves + fermenting + charcuterie + cheese + brewing each need ~3–4 days schema/prompt extension | 7 |
| 2 | Baking | 3,000 | 64 (4 DRAFT anchor + 60 PUBLISHED: 10 pilot + 50 bulk-001, 2026-05-16) | ✅ schema + taxonomy + authoring prompt + anti-tells + 4-anchor batch + pilot-10 + bulk-001 all landed. Bulk-001: 50 recipes PUBLISHED spanning bread (10), cakes (10), pastries (5), pies (5), biscuits (6), scones (4), sweets-confectionery (5), cake-decorating (2), other (2). 8 BEGINNER / 31 INTERMEDIATE / 11 ADVANCED. 20 new ingredients + 19 new tools seeded. `docs/baking-anti-tells.md` extended to 16 entries (4 new: em-dash pairs in sourceNotes, season enum uppercase, sweets-confectionery slug, tool slug precision). Report: `docs/baking-bulk-001-report.md`. Four anchor DRAFTs (tin loaf / Victoria sandwich / shortcrust / shortbread) pending Rebecca review. Bulk fill continues from backlog. Baking-specific TipTap blocks (baker's percentages, lamination schedule, sugar-stage panel) — still ahead. | 3 |
| 3 | Garden | 4,000 | 0 | Not started — ~1 wk setup | 4 |
| 4 | Herbal medicine | 2,500 | 0 | Not started — ~1 wk setup | 2.5 |
| 5 | Mindset | 4,300 | 11 DRAFT (6 practices + 5 type-intro readings; v3 anchor batch landed Phase 8 Step 16, 2026-05-15) | ✅ schema + backlog + authoring prompt v3 + anti-tells (22 entries) + 11 sub-categories + 11-entry anchor batch ready. Migration `20260614000000_phase_8_step_13_mindset_schema` ships PRACTICE / READING TutorialType values + 11-value `PracticeType` + 20-value `PracticeTarget` + `TimeBand` + `BestTime` + `PlanTier` + `PlanStatus` + `PlanSlotSource` enums + Tutorial practice-metadata columns + the six user-side tables. `docs/mindset-backlog.md` enumerates ~2,945 specific entry titles across all 16 life categories. `docs/mindset-author.md` v3 (cooking-recipe register, no in-body author refs, no in-body safety frame, repeat-count signposts, warm-up prompts) + `docs/mindset-anti-tells.md` (22 entries, ~18 [block]) drive Mindset drafting. Five type-intro READINGs cover the methodology once; six practice anchors assume them. The deposit-coin activity anchor demonstrates the magical-ritual pattern for the ~30 ACTIVITY + ~12 SPELL backlog entries. Mindset Category seeded with 11 SubCategory rows (one per PracticeType). Upload script extended to accept PRACTICE / READING (additive — RECIPE / TECHNIQUE unchanged). Voice-check Mindset extension, pilot of 10, bulk fill, plan generator, admin/public UI — still ahead. | 4.3 |
| 6 | Crochet | 1,500 | 0 | Not started — ~1 wk setup | 1.5 |
| 7 | Knitting | 1,500 | 0 | Not started — ~1 wk setup | 1.5 |
| 8 | Needlework | 800 | 0 | Not started — ~1 wk setup | 0.8 |
| 9 | Sewing | 1,200 | 0 | Not started — ~1 wk setup | 1.2 |
| 10 | Fibre arts | 800 | 0 | Not started — ~1 wk setup | 0.8 |
| 11 | Wood & natural craft | 800 | 0 | Not started — ~1 wk setup | 0.8 |
| 12 | Paper & word | 800 | 0 | Not started — ~1 wk setup | 0.8 |
| 13 | Pottery & ceramics | 500 | 0 | Not started — ~1 wk setup | 0.5 |
| 14 | Animals & smallholding | 700 | 0 | Not started — ~1 wk setup | 0.7 |
| 15 | Home & repair | 800 | 0 | Not started — ~1 wk setup | 0.8 |
| 16 | Natural home | 800 | 0 | Not started — ~1 wk setup | 0.8 |
| 17 | Sustainability | 700 | 0 | Not started — ~1 wk setup | 0.7 |
| | **Total** | **31,700** | **202** | ~16 wks setup outstanding (new categories) + ~3 wks Cooking sub-extensions | ~32 weeks fill |

#### Sub-categories per top-level

- **Cooking** — savoury meals, soups, salads, breakfasts, sauces &
  condiments, preserving & fermenting, charcuterie, cheese & dairy,
  brewing & drinks
- **Baking** — bread, cakes, pastries, biscuits, pies, scones,
  sweets & confectionery, cake decorating
- **Garden** — vegetables, fruit, herbs, flowers, permaculture,
  microgreens, hydroponics, mushroom growing, foraging
- **Herbal medicine** — remedies, tinctures, infusions, decoctions, oils,
  balms, salves, syrups, home apothecary
- **Mindset** — manifesting, tapping, energy work, daily practice,
  journal prompts, 30-day plans
- **Crochet** — stitches, techniques, patterns (public-domain only at
  launch)
- **Knitting** — stitches, techniques, patterns (public-domain only at
  launch)
- **Needlework** — cross-stitch, tatting, lacemaking, needlepoint
- **Sewing** — dressmaking, quilting, mending & visible mending
- **Fibre arts** — spinning, weaving, dyeing, felting, rug making,
  macramé
- **Wood & natural craft** — woodworking, whittling, spoon carving,
  basketry, willow weaving
- **Paper & word** — paper crafts, bookbinding, calligraphy,
  scrapbooking, journalling-as-craft (bullet journals, art journals,
  junk journals, travel / nature journals, making the book itself).
  Journal *practice* — prompts, gratitude, daily reflection — sits in
  Mindset.
- **Pottery & ceramics** — hand-building, throwing, glazing, firing
- **Animals & smallholding** — beekeeping, chickens, backyard livestock
- **Home & repair** — building, upholstery, furniture restoration,
  bushcraft
- **Natural home** — soap, candles, DIY beauty, DIY cleaning, home
  fragrance
- **Sustainability** — solar (DIY solar projects, solar oven, solar
  water heater), water reduction & harvesting (rainwater catchers,
  greywater, water-saving fixtures), composting (kitchen, garden, hot
  vs cold, vermicompost), waste reduction (zero-waste, plastic-free,
  package-free swaps, repair-don't-replace), energy efficiency
  (insulation, draft-proofing), renewable heating (wood stove, masonry
  heater), off-grid basics

#### Pipeline-specific setup notes

The rough shape for each new pipeline. Schema notes are illustrative —
finalise at setup time.

- **Garden.** Master `PlantVariety` table (variety, parent species, USDA
  + RHS hardiness zones, sun / water / soil prefs, days to maturity),
  zone reference table, planting-calendar metadata on Tutorial,
  pest / disease cross-refs, companion-planting relations. Tutorial type
  extends to `GROWING_GUIDE`.

- **Herbal medicine.** Master `Herb` table (Latin binomial, common names,
  parts used, primary actions, key constituents, safety flags),
  `Condition` table (body system, common symptoms, cross-refs),
  preparation typing (tincture / decoction / infusion / oil / salve /
  balm / syrup), drug-interaction notes. Strongest "no medical advice"
  voice rules of any category. Tutorial type extends to `REMEDY` and
  `HERB_PROFILE`.

- **Mindset.** `Practice` library (tapping script / energy alignment
  statement / ritual / journal prompt / breathwork as typed entities),
  `Plan` template entity (30-day skeletons with daily activity slots).
  No master ingredient / tool equivalents. Tutorial type extends to
  `PRACTICE`, `READING`, `PLAN`.

- **Crochet / Knitting.** Master `Stitch` table (name, US + UK
  terminology variants, symbol, difficulty), `YarnWeight` reference,
  pattern metadata (gauge, hook / needle size, finished dimensions, yarn
  quantity), symbol-chart rendering. AI not used for stitch photos
  (locked decision); one-time manual stitch shoot. Tutorial type extends
  to `PATTERN` and `STITCH`.

- **Needlework.** Similar shape to crochet / knitting with a separate
  `Stitch` namespace (cross-stitch counts grid squares, tatting uses
  shuttle motions, lacemaking has bobbin diagrams).

- **Sewing.** `Pattern` table for garment patterns (public-domain at
  launch — Edwardian, 1940s, vintage), fabric metadata, body-measurement
  reference, quilt-block library. Tutorial type extends to `PATTERN`
  and `TECHNIQUE`.

- **Fibre arts, Wood & natural, Paper & word, Pottery, Animals, Home &
  repair, Natural home.** Schema notes deferred to each category's
  setup session — most follow the pattern of "master entity table +
  category-specific Tutorial subtype + metadata fields", echoing what
  cooking has.

#### How to use the grid

- **Current count** updates after every content batch. Worker sessions
  update it as part of their hand-off; spot-checks update it when
  Rebecca reviews.
- **Target** is "super super full and deep". Adjust down if a category
  reads fine at half depth; up if a sub-category wants more.
- **Order is your call session-by-session.** Common patterns: fill one
  category to feel-it-out depth and pause; alternate deep / quick
  categories for variety; push the holistic-life spine first
  (Kitchen + Garden + Herbal + Mindset).
- **Pipeline** flips to ✅ once a category's setup is complete (master
  entity tables seeded, authoring prompt tuned, schema extensions
  migrated, voice-check tuned, anchor tutorial drafted, pilot-10
  reviewed). Pipeline-setup sessions are their own worker sessions.
- **Fill weeks** assume both content sessions are on one category. Halve
  the rate if they're working different categories in parallel.
- **Adding new categories or sub-categories.** Just append a row to the
  grid (copy the column shape from an existing row) and a bullet to the
  sub-categories list. Bump the **Total** row. A brand-new top-level
  category adds ~1 week of pipeline setup; a new sub-category typically
  slots into its parent's existing pipeline (smaller schema / prompt
  extension, no full setup).

#### Strategic reference

- **Holistic-life spine** = Cooking + Baking + Garden + Herbal medicine
  + Mindset. ~20,800 articles at full depth (Mindset's full brainstorm
  came in much richer than the original estimate — ~4,300 entries).
  ~21 weeks fill + ~3 weeks remaining setup. Fills the Barbara
  O'Neill-style worldview unmistakably before broadening.
- **Carryover from the original 5-launch list**: Crochet + Knitting
  benefit from existing public-domain pattern sources mapped in Master
  Plan §6 (Weldon's, de Dillmont). Moderate setup, straightforward fill.
- **Cheap-breadth categories**: Pottery, Wood & natural, Animals &
  smallholding, Home & repair, Paper & word, Sustainability. Smaller
  volumes, on-brand, useful for filling the platform out once the spine
  is solid. Sustainability has natural cross-references into Garden
  (composting, greenhouse), Natural home (eco cleaning, plastic-free),
  and Home & repair (insulation, draft-proofing) — overlap is fine, tag
  primary + secondary categories on individual tutorials.
- **Pending decisions:** all open at the time of writing are now
  locked. Max 20x confirmed. Natural home named. Cooking + Baking
  split as separate top-level categories. Launch shape "C-ish,
  feel-based" — the grid is the tracking surface; sequencing happens
  session-by-session.

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
- [x] **ESLint phase 2 — strict rules + blocking CI.** Eight rules
      downgraded in phase 1 (`aadd8fd`) re-tightened to `error`:
      `@typescript-eslint/no-explicit-any`,
      `@typescript-eslint/no-unused-vars`,
      `react-hooks/exhaustive-deps`,
      `react-hooks/set-state-in-effect`,
      `react-hooks/immutability`,
      `react/no-unescaped-entities`, `@next/next/no-img-element`,
      `prefer-const`. Violations fixed across `apps/web/` with no
      behavioural changes; targeted line-level disables only where the
      pattern is intentional (TipTap `editor.storage` mutation,
      CMS-authored `<img>`, localStorage / DOM sync in effects). CI
      lint step in `.github/workflows/deploy.yml` is now blocking
      (`continue-on-error` removed). Phase 1 → Phase 2 transition
      complete.
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

## Bug fix — defensive tutorial page handler + ALB Cloudflare-only ingress (2026-05-14)

Two-item session closing the gaps surfaced by Sentry event
`17879686637e4c3fb5096420d3c392a7`. A bot scanner hit the bare ALB IP
at `https://35.176.112.213/dist/ui.browser.js`; the URL fell through
to the dynamic `[categorySlug]/[tutorialSlug]` route, Prisma threw,
and the request 500'd instead of 404-ing. Same probe also exposed
that the ALB security group accepted traffic from anywhere — every
scanner on the internet could bypass Cloudflare's WAF, bot detection,
and rate limits.

### Defensive tutorial page handler

`apps/web/src/app/(public)/[categorySlug]/[tutorialSlug]/page.tsx`:

- **Slug validation:** `SLUG_RE = /^[a-z0-9][a-z0-9-]{0,79}$/` plus
  an `isValidSlug` type guard at the top of the file. Both
  `generateMetadata` and the page component reject invalid slugs
  before the Prisma call — `generateMetadata` returns a `Not found`
  title, the page calls `notFound()`. Catches `ui.browser.js` (dot),
  pathologically long inputs, uppercase, slashes, and URL-encoded
  characters. Genuine tutorial slugs all conform to the pattern.
- **Prisma-error catch:** `loadTutorial` wraps the `prisma.tutorial.findFirst`
  in a try/catch that reports the exception to Sentry at
  `level: 'warning'` with `tags: { route: 'tutorial-page' }` and
  returns `null`. The existing `notFound()` flow downstream handles
  the null return — so a never-seen-before Prisma error 404s
  cleanly with the brand 404 page instead of triggering the
  per-tutorial error boundary's 500.

The pattern mirrors `getCurrentDbUser`'s warning-level catch from the
2026-05-13 Clerk fix.

### ALB Cloudflare-only ingress

- **New `infra/lib/cloudflare-ips.ts`** — readonly arrays of
  Cloudflare's published IPv4 + IPv6 origin CIDRs (15 + 7 ranges,
  refreshed 2026-05-14 from `cloudflare.com/ips-v4` / `ips-v6`).
  Header comment names the source and refresh date.
- **`infra/lib/homemade-stack.ts`** — both ALB listeners (HTTPS:443
  and HTTP:80) flipped from `open: true` to `open: false`. A loop
  after listener creation iterates `CLOUDFLARE_IPV4` + `CLOUDFLARE_IPV6`
  and calls `alb.connections.allowFrom(...)` for each CIDR × both
  ports. End state: ALB security group accepts ingress only from
  Cloudflare CIDRs.
- **CloudWatch alarms unchanged.** All three (`Alb5xxAlarm`,
  `TargetUnhealthyAlarm`, `EcsRunningTaskAlarm`) pull from
  AWS-internal metric services (`AWS/ApplicationELB` +
  `AWS/ECS`) — they don't probe the ALB over the network, so the
  lockdown doesn't affect them.
- **ECS target group health check unchanged.** Inbound to the ECS
  task SG (allowing the ALB to reach `:3000/healthz`) is separate
  from inbound to the ALB SG.
- **Single-deploy.** Pure SG change — no IAM grants or secret
  references — so the two-step CFN pattern from Phase 2e / the
  hardening pass isn't needed here.

### Runbook

`docs/refresh-cloudflare-ips.md` covers: signals it's time to
refresh, the curl-and-compare procedure, the rule-count sanity check
(44 rules currently, well under the 60-rule default SG quota),
deploy + post-deploy validation, and the rationale for hardcoding
vs. fetching at synth time.

### Sentry trace

`SENTRY_AUTH_TOKEN` in `.env.credentials` carries only the `org:ci`
scope, which is the minimum needed for the GitHub Actions
sourcemap-upload step. Reading individual events through the API
returns `403 You do not have permission to perform this action`.
The fix didn't need the exact Prisma error code — both the slug
validation and the catch-all are correct regardless. Pre-launch
debt: provision a Sentry token with `event:read` so future bug-fix
sessions can pull traces without bouncing back to Rebecca.

### Files touched

- `apps/web/src/app/(public)/[categorySlug]/[tutorialSlug]/page.tsx` —
  slug validation + Prisma try/catch + Sentry import
- `infra/lib/cloudflare-ips.ts` (new)
- `infra/lib/homemade-stack.ts` — listeners `open: false`, Cloudflare
  CIDR ingress loop, import for the IP lists
- `docs/refresh-cloudflare-ips.md` (new)

### Things scoped out of this session

- Phase 8 content-pipeline work (step 8 body-authoring prompt
  rewrite is in flight in a parallel session — `docs/tutorial-author.md`,
  `packages/db/scripts/`, `packages/ai/`).
- Social strategy docs.
- New analytics events, marketing pages, admin pages.
- Schema changes.
- Cloudflare SSL / ACM changes beyond reading the existing setup.

### Pre-launch debt observed during this session

- Provision a Sentry auth token with `event:read` (in addition to
  the existing `org:ci`) so worker sessions can pull individual
  event traces without permission failures.

---

## Cross-category content audit + temperature unit system (planned)

Surfaced from the Baking anchor batch review (2026-05-15). Two
distinct pieces of work, planned as one session because they both
need a sweep across every existing tutorial.

### The temperature unit system

Right now Tutorial carries `temperatureCelsius` (Int?) +
`temperatureNote` (String?) for cooking, and the Baking pipeline
added `bakeTemperatureCelsius` (Int?) + `bakeTemperatureNote` +
`steamMethod`. The current shape stores only the °C number. Readers
in different kitchens want different displays:

- **°C, fan oven** (UK domestic default, post-2000)
- **°C, conventional / non-fan** (older UK, EU mainland, many
  ovens)
- **°F** (US, parts of Canada / Latin America / Caribbean)
- **Gas mark** (UK gas ovens, still common — "gas 4", "gas 7")

The cooking-anchor approach was to write the °C in the column and
let `temperatureNote` carry the fan/conventional disambiguation. It
works for one display path. It doesn't scale to four.

**Proposed shape** (locked in the session that ships this):

- Make `temperatureCelsius` the **conventional / non-fan**
  reference value on every recipe. One canonical number per recipe.
- Derive everything else at render time:
  - **Fan**: convert by subtracting 20°C (industry standard).
  - **°F**: `C × 9/5 + 32`, rounded to the nearest 5.
  - **Gas mark**: lookup table (120 = gas ½, 140 = gas 1, 150 = gas
    2, 160 = gas 3, 180 = gas 4, 190 = gas 5, 200 = gas 6, 220 = gas
    7, 230 = gas 8, 240 = gas 9). Round to nearest band.
- User preference toggle in `/me/settings` (`oven` enum:
  `FAN_C` / `CONVENTIONAL_C` / `FAHRENHEIT` / `GAS_MARK`). Default
  `FAN_C` for new users. Pairs with the existing metric / imperial
  preference (which will gain the same shape for weight + volume).
- Public renderer reads the preference, displays the derived
  value, shows the canonical conventional °C in a small hover
  tooltip so a reader can always sanity-check.
- The deprecated `temperatureNote` field stays in the schema as
  a free-text override for the unusual case ("low and slow" /
  "preheat then turn off" / "grill setting"). When set, it
  appears alongside the derived display.
- `bakeTemperatureCelsius` (Baking) follows the same rule. If the
  baking recipe sets only `bakeTemperatureCelsius`, the renderer
  uses that. If both are set, `bakeTemperatureCelsius` wins for
  Baking recipes and `temperatureCelsius` wins for everything else.
- For confectionery, `bakeTemperatureCelsius` is the **sugar
  stage** target (115°C = soft-ball, etc.). The lookup keeps the
  same logic for °F but skips gas mark (sugar stages don't have a
  gas-mark equivalent). The `bakeTemperatureNote` carries the
  stage name.
- Recipes with two distinct bake temperatures (e.g. the tin loaf
  drops from 230°C to 210°C after 10 minutes) carry the higher
  number in the structured field + the drop in the note. A future
  iteration could add `bakeTemperatureCelsiusSecondary` if the
  shape recurs enough.

Migrate by setting `temperatureCelsius` to the conventional value
on every existing recipe — most current anchors were authored as fan
values, so the audit pass needs to add 20°C to anything currently
sitting under the fan assumption.

**Pairs with metric / imperial weights + volumes.** Same renderer
pattern: store canonical (grams + millilitres), derive ounces /
fluid ounces / cups at render time, user preference picks. Cup
measurements need the UK/US cup-volume split (250 ml vs 240 ml)
documented in the renderer. Tablespoons + teaspoons are mercifully
standardised. The full unit-system rule lives in
`feedback_temperature_and_units.md`.

### The inline-glossary coverage audit

The Baking anchor batch first-pass shipped with `glossaryTerms`
registered on each Tutorial but the body prose didn't mark the
terms up inline. Hover tooltips never reached readers. The cooking
anchors (béchamel, strawberry jam, toad in the hole) do use
`glossaryTooltip` marks inline. The bulk-cooking batch (~189
personal recipes ingested 2026-05-14 + the 13-recipe pilot +
multiple Phase 8 Step 12 batches) needs auditing — every
glossary-term registered on a Tutorial should appear at least
once in body prose wrapped in a `glossaryTooltip` mark, or be
deleted from `glossaryTerms` if it's unused.

The rule lives in `feedback_inline_glossary_coverage.md` and is
inherited by every drafting prompt template (`docs/tutorial-author.md`
§ self-critique pass, `docs/baking-author.md` § self-critique
pass, `docs/mindset-author.md` if any registered glossary terms
slip in).

### The cross-category audit session

**Scope:**

1. Schema migration adds the user-preference enum
   (`OvenPreference`) + the user column. Same migration adds a
   `WeightPreference` (`METRIC` / `IMPERIAL`) + a
   `VolumePreference` (`METRIC` / `IMPERIAL_UK` / `IMPERIAL_US`)
   for the metric/imperial side.
2. Renderer helper module (`apps/web/src/lib/units.ts` or similar)
   exports the converters: °C → fan / °F / gas mark; g → oz;
   ml → fl oz / cup-uk / cup-us; tbsp / tsp pass through.
3. Recipe page UI changes: the info-bar temperature pill reads
   the user's preference, plus a hover for the canonical
   conventional °C. The structured-ingredients block reads the
   weight + volume preferences.
4. `/me/settings` UI gets the three preference toggles. Anonymous
   users get a `/proxy.ts`-set cookie with sensible defaults
   based on `Accept-Language` (`en-US` → Fahrenheit + cup; `en-GB`
   → fan °C + grams; everywhere else → metric).
5. **Content sweep.** Every existing Tutorial with `type ===
   RECIPE` gets:
   - **Temperature audit.** Confirm `temperatureCelsius` is
     populated with the **conventional** value. Add 20°C to any
     recipe authored under a fan-oven assumption. The 4 Baking
     anchors all sit on the fan number currently; they need the
     conversion. Cooking anchors mostly sit on fan too.
   - **Glossary tooltip audit.** Every registered `glossaryTerms`
     entry surfaces inline at least once via `glossaryTooltip`
     mark. Drop unused entries. Add tooltips where the body uses
     a technical term that's not in the registry.
   - **Servings + yieldDescription audit.** Per
     `docs/page-design.md`: recipes that yield a portion count
     set `servings`; recipes that yield discrete units (loaves,
     biscuits, fingers, muffins) set `yieldDescription`; recipes
     whose output is an ingredient for something else (a
     shortcrust case, a pastry cream, a stock) leave both null.
   - **Freezable / batchable / makeAhead notes audit.**
     `freezeNotes` should describe the actual right freeze (raw
     dough not finished biscuits; cooked-and-cooled stew not raw
     mince; sliced loaf not whole loaf etc).

**Affects:** all 202 cooking DRAFTs + 4 Baking DRAFTs + 5 Mindset
DRAFTs (Mindset is exempt from temperature + freezable). Plus
every bulk-batch recipe that ships before the session lands.

**Timing.** Land before the splash gate comes down. Earlier is
better — the longer bulk-fill runs without the rule, the bigger
the audit backlog. Best fit: after the Baking pilot-10 (so the
prompt template enforces the new rules from the start of bulk
fill) and before any Cooking bulk-fill resumes.

**Prompt template updates** (part of the same session):

- `docs/tutorial-author.md` § Self-critique pass: add an item
  "every registered glossary term is wrapped in a
  `glossaryTooltip` mark at least once in the body".
- `docs/tutorial-author.md` § Body structure: add the
  conventional-°C-is-canonical rule. The author writes the
  conventional number; the renderer derives the rest.
- `docs/baking-author.md`: same updates.
- `docs/baking-anti-tells.md` + `docs/common-issues.md`: add
  entries for "fan-temperature-as-canonical" and "registered
  glossary term not used inline".

### Out of scope for the session that ships this

- Auto-detecting the reader's oven type (we ask via the
  preference toggle; we don't sniff it).
- Per-step temperature changes encoded as structured data
  (e.g. the tin loaf's 230 → 210 drop). The first iteration
  carries that as prose; structured per-step temperature is a
  future block-level feature.
- Per-ingredient unit overrides on the same RecipeIngredient row
  (e.g. honey in cups vs grams). The first iteration uses the
  master `Ingredient.defaultUnit` plus the user's preference.

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
- _this session_ — fix: defensive tutorial page handler (slug validation + Prisma try/catch → 404 instead of 500) + ALB Cloudflare-only ingress (security group locked to 15 IPv4 + 7 IPv6 Cloudflare CIDRs, listeners flipped to `open: false`, `docs/refresh-cloudflare-ips.md` runbook). Closes Sentry event `17879686637e4c3fb5096420d3c392a7`.
- Phase 3a (earlier session): public tutorial / category / home pages, TipTap-JSON renderer with no TipTap runtime in the public bundle, admin Preview toggle

## Homepage rebuild — state-aware rail stack + procedural cards + editorial picks + seasonality + onboarding

Workstream 2 of the 2026-05-15 full UX review. Rebuilds the public homepage at production fidelity. Six pieces:

- **Schema migration** `20260616000000_phase_8_homepage_rebuild` — additive. `User.onboardedAt`, `User.primaryCategoryIds[]`, `User.experienceLevel` (new `ExperienceLevel` enum: BEGINNER | INTERMEDIATE | CONFIDENT), `User.homeCountryCode`, `User.dietaryFlags[]`, `User.lastSeenAt`. `Tutorial.heroImageStrategy` (new `HeroStrategy` enum: REAL_PHOTO | PROCEDURAL_CARD | PUBLIC_DOMAIN_PLATE | AI_GENERATED | UNSET). `UserProject.nextScheduledStepNumber`, `UserProject.nextScheduledAt`, `UserProject.scheduledStepsCompleted[]`. New tables: `WeeklyEditorialPick` (5 picks per Monday-anchored week, status auto/pinned/replaced, unique on (weekStarting, position)), `ProjectSchedule` (multi-day arc step definitions: stepNumber, offsetDays, title, body, surfaceAs HERO/RAIL_CARD/NOTIFICATION_ONLY, requiresUserAction). All fields up-front per `feedback_schema_all_fields_upfront.md`.
- **Procedural card system** at `apps/web/src/lib/procedural-card.ts` + `/api/procedural-card/[tutorialId]` Next route. Zero-cost SVG hero placeholder for every tutorial missing a real photo. Category-tinted gradient + parchment grain + Fraunces title + small homemade wordmark. Palette mapping covers all 17 categories with permissive slug-substring fallbacks. Cached at the edge (s-maxage=604800, stale-while-revalidate=86400). `tutorialHeroSrc()` helper in `apps/web/src/lib/tutorial-hero.ts` is the unified resolver — real Media row when present, procedural URL otherwise. No bulk backfill needed: the runtime resolver covers every Tutorial without a hero, and `heroImageStrategy` tracks the intent for future explicit overrides.
- **Seasonality engine** at `apps/web/src/lib/seasonality.ts` — UK calendar across all 12 months with 3-4 themes each, weighted 0-1. Southern-hemisphere countries (AU/NZ/ZA/AR/CL/+) shift the calendar by six months. Country code from Cloudflare's `cf-ipcountry` header at request time, overridden by `User.homeCountryCode` when set. `seasonalityScore(tutorial)` ranks against the tutorial's `mood[]`, `dietaryFlags[]`, `cuisine`, `mealType`, `season`, and `practiceTargets[]`.
- **Editorial picks engine** at `apps/web/src/lib/editorial-picks.ts` + Inngest cron `editorial-picks-refresh` firing Sunday 22:00 UTC. Scoring: recency (+5 in 14d, +2 in 30d), seasonality (+10 strong / +3 mild), engagement (log-scaled bookmarks + projects), recently-featured penalty (-8 in 60d, -3 in 120d), same-category-as-last-week's-#1 (-4). Pinned + manually-replaced rows are preserved across cron runs. Admin page `/admin/editorial-picks` shows the next 4 weeks; each card has pin/unpin + replace-with-tutorial-picker (audit-logged); top-level button regenerates all auto-picks. Server actions in `apps/web/src/lib/editorial-picks-actions.ts` are EDITOR-gated.
- **Onboarding card** at `apps/web/src/components/public/onboarding-card.tsx` — three quiet steps for signed-in users with `onboardedAt === null`. Step 1 multi-select 17 category cards. Step 2 multi-select dietary chips (vegan / vegetarian / gluten-free / dairy-free / nut allergy / halal / kosher / pescatarian). Step 3 single-select experience level — BEGINNER also flips on `beginnerMode` for the first session. Skip allowed; submit + skip both stamp `onboardedAt` so the card never re-pops. PostHog events: `onboarding_started`, `onboarding_completed`, `onboarding_skipped`. Server action in `apps/web/src/lib/onboarding-actions.ts`. Client component is Prisma-free so it doesn't drag the Prisma client into the public bundle.
- **Header restructure** in `apps/web/src/components/public/site-header.tsx` + new `CategoryMenu` client island. Desktop: wordmark left, spine nav centre (Cooking / Baking / Garden / Mindset / Herbal) + "All categories" dropdown for the other 12, pill-shaped search "What are you making?" right, then avatar / sign-in. Mobile (≤900px): nav collapses to a hamburger that opens a bottom-sheet listing every category and Search; search bar takes the freed width. Search is the primary affordance per the brief.
- **State-aware hero + rail stack** in `apps/web/src/app/(public)/page.tsx` + `apps/web/src/lib/homepage-data.ts`. Hero priority: onboarding card → today's scheduled-step (HERO surface) → continue making (most recent IN_PROGRESS within 30 days) → this week's editorial pick #1 → wordmark fallback. Rails, conditionally rendered: today's scheduled actions, continue making, in season right now, this week's editorial picks, saved (bookmarked-but-not-started), where you left off (IN_PROGRESS >14d stale), new since you last visited (uses `User.lastSeenAt`), most-loved per spine category (5 rails), all categories grid. Empty rails don't render. Card metadata always-on: hero (real or procedural) + category + title + time · difficulty + up to 3 dietary glyphs + Saved indicator. Mobile: rails scroll horizontally with snap; hero stacks vertically; bottom-sheet nav.

Commit: `<sha>` — feat(public): state-aware homepage + editorial picks + procedural cards + seasonality + onboarding.

## Admin overhaul — dashboard, content list, preview drawer, taxonomy, glossary, media, cmd-K, RBAC unification

Workstream 3 of the 2026-05-15 full UX review. Reshapes the entire admin surface to Netflix-grade tool quality and 25k+ tutorial scale. Ships a unified `/admin` workspace that creators, editors, and admins all enter.

- **Schema migration** `20260616100000_phase_admin_overhaul_001` — additive. New `SavedFilter` (id, userId, name, description, filterQuery Json, indexed on `(userId, updatedAt)`) and `AdminCommandHistory` (id, userId, command, context Json?, executedAt, indexed on `(userId, executedAt)`). Both cascade on `User` delete.
- **Sidebar restructure (RBAC-aware)** in `apps/web/src/app/admin/layout.tsx` + `apps/web/src/components/admin/admin-sidebar.tsx`. Six top-level groups (Dashboard / Content / Users / Community / Growth / System) with per-item `minRole` gating. Top-of-sidebar block: wordmark, "Open public site →" (new-tab), avatar + role badge. Footer hints ⌘K. CREATOR sees only Content. EDITOR / ADMIN see appropriate groups. Tags item removed from nav.
- **Admin ↔ frontend nav** — public footer surfaces an "Admin" link to anyone with role ≥ CREATOR (creators administer their own content via the unified surface). Admin sidebar links out to the public site.
- **/admin dashboard rebuild** at `apps/web/src/app/admin/page.tsx` + `apps/web/src/lib/admin-dashboard-data.ts` — replaces the placeholder. Top: "Needs attention" inbox (reviews / UGC photos / Q&A / errata / reports / DMCA / creator applications — zero-count rows hide; if everything's zero, shows "All caught up."). Middle: 8 KPI cards (Total published with 7-day delta + sparkline, Total users + sparkline, Active projects this week, New signups this week, Moderation queue depth, Hero coverage %, Today's auto-published, Editorial weeks queued). Sparklines are server-rendered SVG (no client JS). Below: Pipeline widget — published + draft per category with a fill % bar. All aggregates wrapped in `unstable_cache` with 60s TTL.
- **category-counts helper** at `packages/db/scripts/category-counts.ts`. Outputs a markdown grid (per category + per type roll-up) ready to paste into BUILD_PROGRESS.md. Wired as `pnpm --filter db run counts`.
- **cmd-K command palette** at `apps/web/src/components/admin/command-palette.tsx` using the `cmdk` library (Vercel's). Mounted globally on `/admin`. Sections: Recent (last 10 commands from localStorage), Pages (role-filtered list), Tutorials (live fuzzy search via `/api/admin/command-palette` — CREATOR scoped to own), Users (EDITOR / ADMIN only — fuzzy email / name / handle), Actions (New tutorial, Open public site). Each invocation fires `admin_command_invoked` and persists to `AdminCommandHistory` best-effort via `/api/admin/command-palette/record`.
- **Content list rebuild** at `apps/web/src/app/admin/tutorials/page.tsx` + supporting `filters.ts`, `bulk-actions.ts`, `saved-filter-actions.ts`. Big search input, primary chip filters (Status / Type / Category — multi-select), "More filters" drawer (Cuisine / Meal type / Mood / Dietary / Difficulty / Season / Hero / Author), sort selector (Updated / Published / Title), view toggle (Table / Grid), page-size selector (25/50/100). Saved-filters row with per-row delete + "+ Save current filter" CTA. Bulk action bar (appears with ≥1 row selected): publish / unpublish / archive / delete (ADMIN only), plus "Apply to all N matching the filter" mode that re-derives the WHERE clause server-side from the URL query so admins can't smuggle an over-broad selector. Status pill clicks now filter to that status. Title click and edit link both open the editor. Thumbnail in table rows. Grid view shows hero cards.
- **RBAC scoping in content list + actions** — CREATOR queries scope to `creatorId = user.id`. Editor actions (`updateTutorial`, `createTutorial`, `transitionTutorialStatus`) now go through a `requireContentActor` helper + `assertRowAccessible` ownership check for CREATORs. CREATOR can submit DRAFT → PENDING_MODERATION; PUBLISHED / SCHEDULED / ARCHIVED transitions stay EDITOR-and-above. Bulk actions are EDITOR-and-above; bulk delete is ADMIN-only.
- **Edit page sticky preview drawer** in `apps/web/src/components/admin/tutorials/tutorial-form.tsx` + `tutorial-form.css`. Sticky top-of-form button toggles a fixed-position right-side drawer (40 vw, min 360 px) that renders the public preview live via the existing `PreviewPane`. Editor + drawer coexist (60/40 split); editor stays editable while drawer is open. Drawer collapses to full-width on phones. Body section is now visible above-the-fold for the most common edit case Rebecca flagged.
- **Categories tree view** at `apps/web/src/app/admin/categories/page.tsx`. Replaces the separate Categories + Sub-categories pages with one collapsible tree using `<details>` for native expand/collapse. Each category row shows tutorial count + sub-category count; expanding reveals sub-categories with edit + delete + inline "Add sub-category" form. Bottom-of-page form creates a new top-level category. `/admin/sub-categories` and `/admin/sub-categories/*` redirect to the tree.
- **/admin/tags retired** — the route returns a notice explaining that tags were replaced by mood / meal type / dietary / cuisine typed fields. The Tag Prisma model stays intact (per `feedback_schema_all_fields_upfront.md` — a future cleanup migration drops it once production has no references). Tags removed from sidebar.
- **Glossary scale fixes** at `apps/web/src/app/admin/glossary/page.tsx`. Search input (term / slug / definition) + category filter (including "cross-category — no parent" option) + pagination preserved. Clean table with subdued styling.
- **Media scale fixes** at `apps/web/src/app/admin/media/page.tsx`. Search by filename / alt / caption + type filter (PHOTO / VIDEO / DIAGRAM / ILLUSTRATION) + status filter (UPLOADING / READY / FAILED) + pagination. Grid view with thumbnails; per-tile "Hero on N tutorials" reverse-ref count from the `tutorialsHero` relation.
- **RBAC unification** — `/me/creator/tutorials`, `/me/creator/tutorials/new`, and `/me/creator/tutorials/[id]` now redirect to their `/admin/tutorials*` equivalents. Existing in-app links updated. `/me/creator` landing page kept as the personal creator dashboard (stats, applications). `creator-tutorial-actions.ts` library kept as an orphan for now (zero callers post-redirect) — pre-existing creator-only routes can resurrect it if needed; a cleanup pass can drop it once we're confident.
- **Analytics events** wired throughout via `lib/client-analytics.ts` (consent-aware): `admin_command_invoked`, `admin_saved_filter_created`, `admin_bulk_action`, `admin_preview_drawer_opened`. `admin_dashboard_kpi_clicked` and `admin_attention_inbox_action` are documented in `docs/analytics-taxonomy.md` but not yet wired (KPI / inbox rows are server-rendered Links — wiring needs a thin client island; deferred to a follow-up).
- **Voice** — all new copy follows `feedback_homemade_voice.md` (no "honest", no "delve into", no urgency cues, plain factual language).

Bundle impact: `cmdk` adds ~12 kB gzipped to the shared admin chunk; the rest of the rebuild moved logic between server / client without adding heavy deps. Build emits one pre-existing warning about Prisma's CJS `export *` shape — unrelated to this work.

**Deferred to a follow-up session** (out of scope under the worker prompt's "as many as fit cleanly" framing — the spec stayed inside the spirit of the brief while keeping the diff coherent):
- Drag-reorder for categories / sub-categories (HTML5 DnD would be a 200-line addition); current UI relies on the existing `order` integer column.
- Glossary inline-coverage rule enforcement (`feedback_inline_glossary_coverage.md` — needs body-walk per term, expensive at scale; right home is a nightly job).
- Bulk edit modal + bulk export JSON action.
- Dashboard "Deploys with non-zero exit (last 24h)" inbox row (needs gh CLI shelled from a server action — pre-launch debt).
- Dashboard "Voice-check failure count from last bulk batch" inbox row (needs glob + parse of latest `docs/bulk-batch-*-report.md`).
- Dashboard "Sentry error rate spike" inbox row (needs Sentry API token).
- Wiring `admin_dashboard_kpi_clicked` + `admin_attention_inbox_action` (KPI cards are server-rendered; needs a thin client island).
- Bottom-sheet trigger for sidebar on phones (the layout collapses but trigger could be cleaner).

Commit: `<sha>` — feat(admin): dashboard rebuild + content list + preview drawer + cmd-K palette + categories tree + RBAC unification.

## Homepage polish — inline onboarding card, arrow-scroll rails, density compression

Workstream 2b of the 2026-05-15 full UX review. Three targeted changes to the homepage shipped at `0b29ccf`.

- **OnboardingCard rewrite** (`apps/web/src/components/public/onboarding-card.tsx` + `.css`). Replaced the large centred-card screen takeover with a compact inline card (~200-260px desktop) that sits between the site header and the first rail, visible only when `onboardedAt === null`. New question phrasing: "What are you drawn to?" / "Anything you'd rather skip?" / "Where are you at?". Step indicator ("Step X of 3") and Back button removed. "Skip for now" link top-right, always visible. "Continue" pill (sage fill, Fraunces, 36px tall) bottom-right — appears only when ≥1 tile is selected on Q1, always on Q2, absent on Q3 (Q3 single-select auto-completes on tile tap). Experience level labels updated: "Just starting out" / "Making things for a while" / "I know my way around". Tile row uses the same `RailScroll` component as the homepage rails. Server actions (`completeOnboardingAction`, `skipOnboardingAction`) and analytics events (`onboarding_completed`, `onboarding_skipped`) unchanged.

- **RailScroll component** (`apps/web/src/components/public/rail-scroll.tsx`). New client component wrapping every horizontal rail and the onboarding card tile row. Native scrollbar hidden (`scrollbar-width: none` / `::-webkit-scrollbar { display: none }`). 36px sage-circle arrow buttons with cream chevron SVG sit at the rail's left and right edges, overlapping the first/last card. On desktop: arrows are invisible by default and fade in (150ms opacity transition) when the `.rs-wrap` container is hovered. On mobile (≤768px): arrows are `display: none`; native touch-swipe handles scrolling. Click scrolls by ~85% of the container's `offsetWidth` via `scrollBy({ behavior: 'smooth' })`. Each scroll event updates disabled state — arrows fade to 30% opacity and `pointer-events: none` at start/end. Right-side 48px cream gradient fade acts as a "more →" cue; disappears when fully scrolled. `HomeRail` updated to use `RailScroll` as its scroll wrapper.

- **Density compression** (`apps/web/src/app/(public)/home-page.css`). Between-rail padding: 80px → 40px desktop, 28px mobile. Card gap within rails: 28px → 14px. Hero zone: 64px/56px padding → 40px/32px + `max-height: 60vh` cap on desktop. Rail heading: 28px → 20px. Page side padding: 32px → 24px desktop, 16px mobile. Card body gap: 14px → 10px. Category tile grid gap: 16px → 12px. All-categories section padding: 80px/96px → 40px/56px. `home-hero-zone` hidden for onboarding users (card renders in new `home-onboarding-zone` section above the rail stack).

No schema changes. No new analytics events. No admin surface changes.

Commit: `761e2d3` — feat(homepage): inline onboarding card, arrow-scroll rails, density compression.

Out of scope: no admin overhaul beyond editorial picks (next workstream), no Capacitor / native mobile UX (next workstream), no analytics rethink, no marketing pages, no content authoring, no bulk image regeneration via paid APIs.

## Self-hosted analytics — schema, dual-fire, rollups, eight admin dashboards

Workstream 4 of the 2026-05-15 full UX review. Adopts the Aura pattern for our own scale: every event lands in our database alongside the existing PostHog mirror, and the admin dashboards read from summary tables a nightly Inngest cron rolls up.

- **Schema migration `20260616200000_phase_analytics_self_hosted_001`** — additive. Four new tables.
  - `AnalyticsEvent` — raw row per fired event. Columns: `clerkUserId`, `sessionId`, `event`, `category`, `properties` (JSONB), `url`, `pathname`, `referrer`, `userAgent`, `country`, `deviceClass`, `cohortWeek`, `acquisitionChannel`, `utmSource`/`utmMedium`/`utmCampaign`. Eight indexes covering the expected query shapes (per user, per event, per session, per category, per cohort+event, per path, per country, per channel).
  - `AnalyticsDailyRollup` — one row per `(date, metric, dimension)`. `dimension` is non-null with sentinel `__total__` for the unsplit total (Postgres treats NULL as distinct in unique indexes; the sentinel keeps `prisma.upsert` honest).
  - `AnalyticsCohortRollup` — one row per `(cohortWeek, weeksAfterSignup)` with `cohortSize`, `retainedCount`, `retentionRate`. Re-upserts on every cron run since retention can shift as data lands late.
  - `AnalyticsRollupRun` — idempotency tracker keyed on UTC date.

- **Capture pipeline.**
  - `lib/analytics-events.ts` (new leaf module) — `EVENT_CATEGORIES` map + `categoryFor()` + `PosthogEvent` type + `ROLLUP_TOTAL_DIMENSION` sentinel. Imported by both posthog.ts and the capture API route so there's no cycle.
  - `lib/posthog.ts` — `captureServerEvent` extended to write to `AnalyticsEvent` first, then PostHog. All ~30 existing server-side call sites dual-fire automatically with zero per-site change. New `capturePremiumServerEvent` skips PostHog (premium-feature instrumentation that should not leak to third-party tools).
  - `lib/server-analytics.ts` — re-exports + `captureEvent` / `capturePremiumEvent` aliases for new code that wants to be explicit about intent.
  - `lib/analytics-session.ts` — `homemade-session` cookie, sliding 30 minutes, server-issued, separate from Clerk's auth session. Used as the analytics session id so funnel + drop-off views work for signed-out visitors.
  - `lib/client-analytics.ts` — `captureClientEvent` now dual-fires via `navigator.sendBeacon('/api/analytics/capture', …)` (with a `fetch(keepalive: true)` fallback) after the PostHog capture.
  - `app/api/analytics/capture/route.ts` — accepts the client-side beacon. Permissive shape (analytics taxonomy lives in code, not at runtime). Server-side cohort + acquisition lookup from the User row so the client cannot fake the denormalised fields.

- **Nightly rollup.** `lib/analytics-rollup.ts` exposes `rollupDay(date)` and `rollupRange(args)`. Computes DAU, MAU (rolling 30d), signups (total + by channel + by country), tutorials_published, tutorial_views, bookmarks_created, tutorials_completed, projects_started/completed, search_queries, search_zero_results, errors_total. Plus cohort retention upserts up to W12 for every (cohort, weeksAfterSignup) pair on every run. Idempotent.
  - `inngest/functions/analytics-rollup.ts` — `analyticsRollupNightly` (cron 02:00 UTC) + `analyticsRollupBackfill` (event `analytics/rollup.backfill`).
  - Manual trigger button at `/admin/system/jobs` — date-range picker + `force` re-run checkbox. Wraps `triggerAnalyticsRollup` server action with audit log + Inngest send.

- **Eight admin dashboards under `/admin/analytics`.**
  - `/admin/analytics` — overview. Eight KPI cards (DAU, MAU, signups 7d, published 7d, bookmarks 7d, projects in progress, zero-result searches today with red highlight at >50, errors 7d with red highlight at >2× prior). Sparkline + signups + DAU trends + top-5 categories bar.
  - `/admin/analytics/cohorts` — flagship cohort retention heatmap. Sage-shade table W0..W12, milestone toggle (W0 / W1 / W4 / W12) that swaps to a per-cohort horizontal bar list. Renders from `AnalyticsCohortRollup`.
  - `/admin/analytics/activation` — vertical funnel (visit → signup → onboarding → first bookmark → first project started → first project completed). Range picker (7d/30d/90d). Cohort-aware activation table.
  - `/admin/analytics/content` — top 50 tutorials by views with bookmark + project-start conversion rates joined from matching events. Range picker.
  - `/admin/analytics/search` — top 50 searches with CTR per query, top 50 zero-result searches (the editorial content-gap signal), 90-day search-queries trend.
  - `/admin/analytics/acquisition` — signups by channel / country / UTM source / device class, plus W4 cohort retention split by dominant channel.
  - `/admin/analytics/creator` — applications, approval/rejection split, application-to-decision timing (avg / p50 / p90), per-creator performance table.
  - `/admin/analytics/system` — events stored, last rollup status, 14-day rollup-run history, error-boundary trend.

- **Brand visual treatment.** Recharts-based with a single `chart-theme.ts` for palette + typography. Sage primary, soft-parchment background, sage-15% grid, Fraunces titles, Lora axis labels, monospace tabular numbers. Flat — no gradients, no 3D, no curve fills. Cohort heatmap uses `sageShade(rate)` to interpolate parchment → forest. `ChartCard` + `KpiCard` shared wrappers.

- **Sidebar.** `/admin/analytics` no longer a placeholder. Growth → Analytics now expands into eight sub-items.

- **Pre-launch checklist.** "PostHog dashboards build" item removed — we don't build dashboards in PostHog. PostHog stays for session recordings + heatmaps + ad-hoc event exploration.

Out of scope (deliberately): no PostHog UI dashboards built, no real-time, no ClickHouse migration (raw `AnalyticsEvent` will eventually want partitioning by month or a move to ClickHouse / TimescaleDB at scale — flagged for a future session, not blocking launch), no new analytics events (the existing taxonomy was sufficient), no homepage / admin overhaul / mobile / billing surface work.

Commit: `<sha>` — feat(analytics): self-hosted dual-fire + nightly rollup + eight admin dashboards.
