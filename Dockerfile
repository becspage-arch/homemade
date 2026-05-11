# syntax=docker/dockerfile:1.7

# ---- Base ----
FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat
RUN corepack enable && corepack prepare pnpm@11.0.9 --activate
WORKDIR /repo

# ---- Deps ----
FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/web/package.json apps/web/
COPY apps/mobile/package.json apps/mobile/
COPY packages/search/package.json packages/search/
# Note: infra/ is excluded from the Docker build context via .dockerignore.
# pnpm install treats the missing workspace package as a no-op.
# packages/db: copy package.json + prisma schema + config so the postinstall
# step (prisma generate) has everything it needs to produce the typed client.
COPY packages/db/package.json packages/db/
COPY packages/db/prisma packages/db/prisma
COPY packages/db/prisma.config.ts packages/db/
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

# ---- Builder ----
FROM base AS builder
# NEXT_PUBLIC_* env vars are embedded at build time into the JS bundle.
# Pass the Clerk publishable key as a build arg from CI.
ARG NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
# PostHog public key + host (NEXT_PUBLIC_* — bundled into the browser).
ARG NEXT_PUBLIC_POSTHOG_KEY
ENV NEXT_PUBLIC_POSTHOG_KEY=$NEXT_PUBLIC_POSTHOG_KEY
ARG NEXT_PUBLIC_POSTHOG_HOST
ENV NEXT_PUBLIC_POSTHOG_HOST=$NEXT_PUBLIC_POSTHOG_HOST
# Sentry DSN is safe to expose to the browser; auth token + slugs are used
# at build time only for source-map upload (withSentryConfig reads them).
ARG NEXT_PUBLIC_SENTRY_DSN
ENV NEXT_PUBLIC_SENTRY_DSN=$NEXT_PUBLIC_SENTRY_DSN
ARG SENTRY_AUTH_TOKEN
ENV SENTRY_AUTH_TOKEN=$SENTRY_AUTH_TOKEN
ARG SENTRY_ORG_SLUG
ENV SENTRY_ORG_SLUG=$SENTRY_ORG_SLUG
ARG SENTRY_PROJECT_SLUG
ENV SENTRY_PROJECT_SLUG=$SENTRY_PROJECT_SLUG
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /repo/node_modules ./node_modules
COPY --from=deps /repo/apps/web/node_modules ./apps/web/node_modules
COPY --from=deps /repo/packages/db/node_modules ./packages/db/node_modules
COPY --from=deps /repo/packages/search/node_modules ./packages/search/node_modules
COPY . .
# Bump Node heap: pnpm 11's pre-script `verify-deps-before-run` runs an
# in-process install that re-triggers prisma generate; the Phase 6 schema
# pushes this past Node's default ~2GB heap on the GHA builder.
ENV NODE_OPTIONS=--max-old-space-size=4096
RUN pnpm --filter @homemade/web build

# ---- Runner ----
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

# Next.js standalone output for a monorepo lays the tree as:
#   /repo/apps/web/.next/standalone/   <- everything needed to run, with server.js at apps/web/server.js
#   /repo/apps/web/.next/static        <- needs to live at apps/web/.next/static next to server.js
#   /repo/apps/web/public              <- needs to live at apps/web/public
COPY --from=builder --chown=nextjs:nodejs /repo/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /repo/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=nextjs:nodejs /repo/apps/web/public ./apps/web/public

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["node", "apps/web/server.js"]
