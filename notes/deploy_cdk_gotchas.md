---
name: deploy_cdk_gotchas
description: "How ECS env/secrets actually get deployed on Homemade, and why a naive `cdk deploy` will break production. Read before any infra/secret-mounting work."
metadata: 
  node_type: memory
  type: project
  originSessionId: 79a73a49-a84a-4b1b-bda4-97552a94182f
---

The GitHub Actions deploy (`deploy.yml`) does NOT run `cdk deploy`. It builds the
image, pushes to ECR, runs migrations + seed scripts, then
`aws ecs update-service --force-new-deployment` (pulls `latest` into the
*existing* task definition; sets desired-count=2). So the ECS task's
**environment + secrets come only from a manual `cdk deploy`**, run locally with
the Homemade AWS creds. (`pnpm --filter @homemade/infra exec cdk deploy` — never
name a script `deploy`.)

**The ambient shell AWS creds (default profile) point at the Aura account
(074184607195).** For any Homemade aws/cdk command, the cleanest path is the
configured **`aws --profile homemade`** named profile (account `213615929920`,
user `claude-deploy`, region eu-west-2) — verified 2026-07-21 for logs,
CloudWatch metrics, ECS describe/register-task-definition/update-service.
(Alternatively source `.env.credentials`; set `CDK_DEFAULT_ACCOUNT` for cdk.)
Two gotchas on Git-Bash/Windows: paths like `/homemade/web` get MSYS-mangled —
set `MSYS_NO_PATHCONV=1`; and `aws logs tail` crashes on the `▲` in Next.js
banners (`charmap` codec) — set `PYTHONUTF8=1` or use `filter-log-events`.

**Web task sizing (2026-07-21): now `homemade-web:24` at cpu 512 / mem 1024
(0.5 vCPU / 1 GB, ~$36/mo for 2 tasks), CDK source updated to match.** Rebecca
chose this mid size over 1 vCPU/2 GB (~$72/mo) for low cost — few live users, the
504s were crawler bursts not user load. Was 256/512 (0.25 vCPU, ~$18/mo) which
was too starved to render SSR before the ALB timeout — on 2026-07-16 it threw
324 `HTTPCode_ELB_504` over ~4h (targets healthy, 0 conn errors, resp time
peaked 48s) and Search Console flagged "Server error (5xx)". Diagnosis lives in
the ALB CloudWatch metrics (`HTTPCode_Target_5XX_Count` vs `_ELB_5XX_Count` — a
0/nonzero split = capacity/latency, not an app bug), not the app logs. :23 was
derived from the running :22 (copy, change only cpu/mem — preserves all 20
secrets) and rolled via update-service. Because the GitHub deploy uses
`--force-new-deployment` with NO `--task-definition`, out-of-band revisions
persist across code deploys (verified).

**A naive `cdk deploy` rips out production secrets (and can revert Clerk to dev).**
The stack gates most env/secrets behind deploy-time flags, and the deployed
stack was last applied with a specific set. If you don't replicate them, the
synthesized template DROPS whatever you didn't enable. As of the 2026-06-23
go-live the live stack needs these env vars set at deploy time, or `cdk diff`
shows destructive changes:
- `ORIGIN_CERT_ARN=arn:aws:acm:eu-west-2:213615929920:certificate/0d005b14-a834-45bf-b4ee-eaee93d135a1` (omitting it DESTROYS the HTTPS:443 listener → site down)
- `HTTP_PORT_80_REDIRECT=1` (port 80 redirects to HTTPS)
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_Y2xlcmsuaG9tZW1hZGUuZWR1Y2F0aW9uJA` — **Clerk went LIVE 2026-06-23.** The deployed value is now the **pk_live** key (from `.env.credentials`) and Secrets Manager `homemade/clerk-secret-key` now holds the **sk_live** key. Pass the **pk_live** key on any future `cdk deploy` — passing the old pk_test value would REVERT the site to the Clerk dev instance (re-breaks the ~100-user cap + soft-404). All 5 Clerk prod DNS records (`clerk` / `accounts` / `clkmail` / `clk._domainkey` / `clk2._domainkey` → `*.clerk.services`) already resolve in Cloudflare.
- **RECONCILED 2026-07-05: a `cdk deploy` (adding the loom-render Fargate resources, [[project_loom_fargate_render]]) reconciled the CLI revision back to CDK management — WebTask is now `homemade-web:20`, CDK-managed, with pk_live + all MOUNT_* secrets preserved (the full prod env below was passed). So the ":19 via CLI" note below is historical; the drift is closed. A future `cdk deploy` from a clean env still needs the same flags/values or it reverts. Also proved claude-deploy CAN run `cdk deploy` itself (it has `sts:AssumeRole` on the CDK bootstrap roles) — no separate admin identity required.**
- **The Clerk go-live was applied via a CLI-registered task-def revision (`homemade-web:19`), NOT `cdk deploy`.** `claude-deploy` was granted `ecs:RegisterTaskDefinition` + `iam:PassRole` (inline policy `ManageWebTaskDefs`, scoped to the WebTask task+exec roles). The switch derived a new revision from the *running* def (`:17`, the Stripe go-live revision), changed ONLY the Clerk pk env, then `update-service`. Deriving from the live def is the safest task-def-only change — it preserves Stripe/HTTPS/all secrets automatically and never touches the ALB. The stale `:16`-derived `:18` (Stripe-less) was deregistered. Because the env was set via CLI not cdk, the next `cdk deploy` will reconcile `:19` back to CDK-managed and MUST be passed the pk_live value (+ MOUNT_STRIPE_SECRETS=1 etc.) or it reverts.
- MOUNT flags ON in the live task: `MOUNT_CLERK_WEBHOOK_SECRET=1`, `MOUNT_PHASE1_SECRETS=1`, `MOUNT_TYPESENSE_SECRETS=1`, `MOUNT_IMAGE_SOURCING_SECRETS=1`, `MOUNT_STRIPE_SECRETS=1` (post go-live). **`MOUNT_R2_SECRETS` is OFF** — R2 secrets are NOT mounted in the running task; enabling it adds env that isn't there.
- `CLOUDFLARE_IMAGES_DELIVERY_HASH`, `UNSPLASH_APPLICATION_ID` (both from `.env.credentials`).
- desiredCount defaults to 2 (matches the GitHub deploy); CFN may show 1→2, which is a harmless drift-correction.

**Method that works: iterate `cdk diff` until it shows ONLY your intended
change, then deploy.** Derive the correct MOUNT flags by reading the live task
def's actual secrets list (`aws ecs describe-task-definition`), not by guessing.
The two-step secret pattern (Deploy 1 = IAM grant only, no task replacement;
Deploy 2 = `MOUNT_X=1` adds the env + `ecs.Secret` refs) avoids the CFN
circuit-breaker race where new tasks try to pull a secret before the IAM grant
lands. Secret names must not end in `-secret` (breaks the no-suffix ARN form
Fargate uses) — use `…-v2` or `…-key`.

Related: [[feedback_deploy_verification]] (the GitHub-deploy + /healthz
verification still applies to code pushes), [[project_business_model]] (Stripe
go-live state).
