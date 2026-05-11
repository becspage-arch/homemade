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
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

# ---- Builder ----
FROM base AS builder
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /repo/node_modules ./node_modules
COPY --from=deps /repo/apps/web/node_modules ./apps/web/node_modules
COPY . .
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
