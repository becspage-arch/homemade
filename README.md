# Homemade

The home of making things yourself.

- Web: `apps/web` (Next.js 16, Tailwind v4)
- Canonical planning docs live in Google Drive (`I:\My Drive\Homemade\`)

## Local commands

```bash
pnpm install
pnpm dev       # not used in this project — we deploy direct to homemade.education
pnpm build     # used to check the app compiles before pushing
pnpm typecheck
pnpm lint
pnpm format
```

## Deploy flow

Every push to `main` builds a Docker image, pushes it to ECR, and rolls out an
ECS Fargate service. The live site is **homemade.education**. There is no local
dev workflow — everything is direct-to-production while we're pre-launch and
behind the splash-page guard.

A `homemade-access` cookie is required to see anything beyond the
`coming soon` page. Set the cookie by visiting `/unlock` and entering the
password stored in the `SPLASH_PASSWORD` env var.
