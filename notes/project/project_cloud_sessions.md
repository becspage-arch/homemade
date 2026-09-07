---
name: project_cloud_sessions
description: "How Homemade cloud sessions are configured — env vars, network allowlist, setup script, and what cloud sessions must not be used for"
metadata:
  node_type: memory
  type: project
---

Set up 2026-09-05. Cloud sessions (`claude --cloud`, claude.ai/code, mobile,
routines) run on an Anthropic Ubuntu 24.04 VM (~4 vCPU / 16 GB / 30 GB) with a
**fresh clone from GitHub** — never the D:\code\homemade checkout.

**Cloud environment** (created from the environment selector at claude.ai/code —
the cloud icon above the message box; there is no settings-page URL for it):

- Network access: **Custom**, with "also include default list of common package
  managers" ticked. The defaults already cover npm/PyPI/crates, `amazonaws.com`,
  `binaries.prisma.sh`, `sentry.io` and GitHub. The extra allowlist is:
  `homemade.education`, `*.homemade.education`, `*.neon.tech`, `*.amazonaws.com`,
  `api.cloudflare.com`, `*.r2.cloudflarestorage.com`, `imagedelivery.net`,
  `*.imagedelivery.net`, `*.typesense.net`, `*.upstash.io`, `api.clerk.com`,
  `*.clerk.com`, `*.clerk.accounts.dev`, `api.stripe.com`, `inn.gs`, `*.inn.gs`,
  `api.inngest.com`, `app.inngest.com`, `eu.i.posthog.com`, `*.posthog.com`,
  `*.sentry.io`, `fal.run`, `*.fal.run`, `*.fal.ai`, `*.fal.media`,
  `api.unsplash.com`, `images.unsplash.com`, `api.pexels.com`,
  `images.pexels.com`, `pixabay.com`, `cdn.pixabay.com`, `*.googleapis.com`,
  `commons.wikimedia.org`, `upload.wikimedia.org`, `collectionapi.metmuseum.org`,
  `images.metmuseum.org`, `freesewing.org`, `*.freesewing.org`.
- Environment variables: the whole of `.env.credentials`, plus `DIRECT_URL`
  (= `DATABASE_URL` with `-pooler.` → `.`) and `NEXT_PUBLIC_SENTRY_DSN`
  (= `SENTRY_DSN`). Full parity with local, deliberately.
- Setup script: enables corepack + pnpm 11.0.9, finds the clone by looking for
  `pnpm-workspace.yaml`, then `pnpm install --frozen-lockfile --prefer-offline`
  and `prisma generate`. Runs once, then the filesystem is snapshotted; re-runs
  when the script or allowlist changes, or after ~7 days.

**Why env vars and not API credentials:** the Pro/Max "API credentials" feature
keeps a key outside the sandbox, but only for HTTP header auth. Postgres wire
protocol (Neon) and AWS SigV4 (AWS, R2) can't use it, so those must be plain env
vars. Env vars are readable by anyone using the environment — fine here because
it's a personal environment on Rebecca's own account.

**Repo side** (committed 997b54a9): `scripts/cloud-session-setup.sh` runs from a
`SessionStart` hook in `.claude/settings.json`. It no-ops unless
`CLAUDE_CODE_REMOTE=true`, then rebuilds `.env.credentials` from the environment
variables — the ops tsx scripts in `packages/db/scripts/` search upward for that
file — and tops up anything the environment cache missed.

**Memory travels now — SUPERSEDED 2026-09-06 by Rebecca's decision (see `notes/README.md`).**
The project memory lives in `notes/` in the repo, so every session, cloud or laptop, reads
and updates the same files. The `homemade-standards` skill and the laptop auto-memory are
older fallback copies, not the source. The paragraph this replaces said memory could not
reach the cloud and the skill was the answer; that is no longer how it works.
See [[master_orchestrator]], [[feedback_no_md_handoffs]].

**Don't send to the cloud:** anything driving her browser incl. DesignSync
([[feedback_verify_by_code_not_browser]]), and full-monorepo `turbo build` (close to the
RAM ceiling — use `--filter`).

**Bulk generation IS cloud work now — SUPERSEDED 2026-09-06, see playbook Step 6c.** Every
model step of an autopilot (planning, authoring, judging) runs as a cloud routine on
Rebecca's Max plan; the deterministic stages run on the server or as scripts; nothing runs
on her laptop. Needlework's Blender render is the last piece still tied to a local Blender
until it moves to Fargate. The old line here pointed at
[[feedback_continuous_bulk_mode]], which is itself superseded.

`ANTHROPIC_API_KEY` is **not** in the session environment (checked 2026-09-06 — it is not
in `.env.credentials`; it lives only on ECS via Secrets Manager). [[feedback_no_api_spend]]
applies as Rebecca restated it on 6 September: no per-token API calls at all, with the
maker-photo check on upload as the one agreed exception.

The repo `becspage-arch/homemade` is **public** and stays so until the build is done. The
memory in `notes/` is public with it, by Rebecca's decision; credentials, tokens and keys
never go in.

**Added 2026-09-05 (second pass, commit ab9b4f4a):** two things the first pass
missed. The six `LOOM_RENDER_*` values come from the `HomemadeStack` CloudFormation
outputs (bucket `homemade-loom-render`, cluster `homemade`, task def
`homemade-loom-render:1`, two subnets, one SG, eu-west-2) — they were never copied
into `.env.credentials`, so `LOOM_RENDER=fargate` would have thrown. Now in both
local creds (without `LOOM_RENDER` itself, so local keeps using blender.exe) and
the cloud env (with `LOOM_RENDER=fargate`, since cloud VMs have no Blender).
And `.secrets/gsc-homemade.json` travels as `GSC_SERVICE_ACCOUNT_JSON_B64`, which
the SessionStart hook base64-decodes back to disk and points `GSC_KEY_PATH` at.

**FIXED (checked 2026-09-06).** `apps/web/scripts/gsc/gsc.ts` no longer hard-codes a
Windows path: it walks up from its own directory to the repo root by looking for
`pnpm-workspace.yaml`, and `GSC_KEY_PATH` overrides it. Nothing left to do here.
