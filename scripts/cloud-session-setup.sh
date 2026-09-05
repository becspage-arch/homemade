#!/usr/bin/env bash
#
# Cloud session bootstrap for Homemade.
#
# Wired up as a SessionStart hook in .claude/settings.json. It exits immediately
# outside a Claude Code cloud session, so local sessions are untouched.
#
# Heavy provisioning — pnpm install, Prisma engines, Playwright browsers — lives
# in the cloud ENVIRONMENT setup script instead, because that runs once and is
# cached into the VM snapshot. This file is the cheap per-session top-up:
# reconstruct .env.credentials, make sure deps and the Prisma client are there.
#
# Must exit zero. A non-zero exit from a SessionStart hook is noisy and the
# session is more useful degraded than blocked.
set -uo pipefail

[ "${CLAUDE_CODE_REMOTE:-}" = "true" ] || exit 0

cd "${CLAUDE_PROJECT_DIR:-$PWD}" || exit 0

log() { printf '[cloud-setup] %s\n' "$*"; }

# ── 1. Reconstruct .env.credentials ──
# The ops/import tsx scripts under packages/db/scripts/ search upward for a
# .env.credentials file and loadEnv() it with override:true. They fall back to
# process.env when it's missing, but writing the file keeps cloud behaviour
# identical to local — including for any script that reads the path directly.
# The file is gitignored; the VM is ephemeral and isolated.
CRED_KEYS="
DATABASE_URL DIRECT_URL
AWS_REGION AWS_ACCOUNT_ID AWS_ACCESS_KEY_ID AWS_SECRET_ACCESS_KEY
CLOUDFLARE_ACCOUNT_ID CLOUDFLARE_API_TOKEN CLOUDFLARE_ZONE_ID
CLOUDFLARE_IMAGES_DELIVERY_HASH CDN_IMAGE_TRANSFORM_ORIGIN
R2_ACCESS_KEY_ID R2_SECRET_ACCESS_KEY R2_BUCKET R2_PUBLIC_BASE_URL
TYPESENSE_HOST TYPESENSE_ADMIN_API_KEY TYPESENSE_SEARCH_ONLY_API_KEY
UPSTASH_REDIS_REST_URL UPSTASH_REDIS_REST_TOKEN
INNGEST_EVENT_KEY INNGEST_SIGNING_KEY
ANTHROPIC_API_KEY FAL_KEY
UNSPLASH_ACCESS_KEY UNSPLASH_SECRET_KEY UNSPLASH_APPLICATION_ID
PEXELS_API_KEY PIXABAY_API_KEY
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY CLERK_SECRET_KEY
STRIPE_MODE STRIPE_SECRET_KEY STRIPE_PUBLISHABLE_KEY STRIPE_WEBHOOK_SECRET
SENTRY_DSN NEXT_PUBLIC_SENTRY_DSN SENTRY_ORG_SLUG SENTRY_PROJECT_SLUG
SENTRY_AUTH_TOKEN
NEXT_PUBLIC_POSTHOG_KEY NEXT_PUBLIC_POSTHOG_HOST
DOMAIN SPLASH_PASSWORD
PG_VIA_HTTPS_PROXY
LOOM_RENDER LOOM_RENDER_S3_BUCKET LOOM_RENDER_CLUSTER LOOM_RENDER_TASKDEF
LOOM_RENDER_SUBNETS LOOM_RENDER_SECURITY_GROUP LOOM_RENDER_REGION
"

# Prisma migrations need the non-pooled host. The deploy workflow derives it the
# same way, so keep the fallback identical rather than depending on the env var.
if [ -z "${DIRECT_URL:-}" ] && [ -n "${DATABASE_URL:-}" ]; then
  export DIRECT_URL="${DATABASE_URL/-pooler./.}"
fi

# A cloud session can only leave the VM through the HTTP CONNECT proxy, and
# Postgres on 5432 can't traverse it — so tell @homemade/db to reach the same
# database over Neon's WebSocket driver on 443 instead. Nothing else sets this.
if [ -n "${HTTPS_PROXY:-}" ]; then
  export PG_VIA_HTTPS_PROXY=1
fi

written=0
umask 077
: > .env.credentials
for key in $CRED_KEYS; do
  value="${!key:-}"
  [ -n "$value" ] || continue
  printf '%s=%s\n' "$key" "$value" >> .env.credentials
  written=$((written + 1))
done

if [ "$written" -eq 0 ]; then
  rm -f .env.credentials
  log "no credentials in the environment — DB, R2, Typesense and AWS work will fail"
else
  log ".env.credentials written ($written keys)"
fi
umask 022

# ── 1b. Google Search Console service account ──
# .secrets/ is gitignored, so the key can't come from the clone. It travels as
# base64 in GSC_SERVICE_ACCOUNT_JSON_B64 and gets written back out here.
# apps/web/scripts/gsc/gsc.ts reads GSC_KEY_PATH.
if [ -n "${GSC_SERVICE_ACCOUNT_JSON_B64:-}" ]; then
  mkdir -p .secrets
  if printf '%s' "$GSC_SERVICE_ACCOUNT_JSON_B64" | base64 -d > .secrets/gsc-homemade.json 2>/dev/null; then
    chmod 600 .secrets/gsc-homemade.json
    export GSC_KEY_PATH="$PWD/.secrets/gsc-homemade.json"
    echo "GSC_KEY_PATH=$PWD/.secrets/gsc-homemade.json" >> .env.credentials
    log "Search Console key written"
  else
    rm -f .secrets/gsc-homemade.json
    log "GSC_SERVICE_ACCOUNT_JSON_B64 is not valid base64 — Search Console work will fail"
  fi
fi

# ── 2. Dependencies ──
# Normally already present from the cached environment snapshot. This only bites
# on a cache miss or after a lockfile change.
export PATH="$PWD/node_modules/.bin:$PATH"
if [ ! -d node_modules ] || [ pnpm-lock.yaml -nt node_modules ]; then
  log "installing workspace dependencies"
  corepack enable >/dev/null 2>&1
  pnpm install --frozen-lockfile --prefer-offline || log "pnpm install failed — run it manually"
fi

# ── 3. Prisma client ──
# Prisma 7 keeps the datasource url in prisma.config.ts, not schema.prisma.
if [ ! -d node_modules/.prisma/client ] && [ ! -d packages/db/node_modules/.prisma/client ]; then
  log "generating the Prisma client"
  pnpm --filter @homemade/db exec prisma generate || log "prisma generate failed"
fi

log "ready"
exit 0
