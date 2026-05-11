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

---

## Phase 2 — Data model & content management

**In progress.**

### ✅ Done

(Will update as items land.)

### Up next

- `packages/db` with Prisma 7
- Full initial Prisma schema covering: `User`, `Tutorial`, `TutorialVersion`, `Category`, `SubCategory`, `Tag`, `Glossary`, `Media`
- First migration against Neon
- Migrations workflow in CI
- Admin route in `apps/web` (gated by Clerk role)
- Tutorial CRUD with rich block editor (TipTap)
- Custom blocks: info panel, supplies card, inline tooltip, chart, sub-tutorial card, pull quote
- Live preview matching production rendering
- Draft / scheduled / published states
- Version history per save with rollback
- Audit log entries for every edit
- Category, sub-category, tag, glossary management UI

### Architecture decisions to note

- **Admin lives at `/admin` route inside `apps/web`, not a separate `apps/admin` app.** The architecture doc specifies a separate app; we're starting simpler (single app, Clerk-role-gated route) because for now Rebecca is the only admin and the additional infra cost of a second deploy target isn't worth it pre-launch. We can split into `apps/admin` later if/when scale or separation needs justify it. Tracked as a possible-future-refactor, not debt.

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
