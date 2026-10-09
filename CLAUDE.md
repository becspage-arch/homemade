# Homemade — repo-level guide for Claude Code sessions

This file is auto-loaded by every Claude Code session that opens the repo.
It's intentionally short. The project memory (standing rules, the category
sign-off playbook, per-project state and the shared to-do) lives in `notes/` at
the repo root, so every session, cloud or laptop, reads and updates it directly.
Start with `notes/INDEX.md`, `notes/master_orchestrator.md` and `notes/todo.md`
before non-trivial work, and update the relevant note in the same session that
changes the fact it records. (Rebecca's laptop auto-memory and the
`homemade-standards` skill are older copies of the same files, not the source.)

The single canonical build log is `BUILD_PROGRESS.md` at the repo root.
Update it as part of any session that ships a phase or pre-launch debt item.

## Merging: two lanes and the daily train (Rebecca, 5 September 2026)

Every merge to `main` costs a deploy watch, a healthz check and a round of
wake-ups. Those turns are what burn Claude credits, so merges are batched.

1. **Two lanes.** Only a live-site incident, a broken deploy, a customer-facing
   Sentry error or a security fix merges to `main` on its own the moment it is
   green. Everything else rides the day's train: one merge to `main`, once a
   day at a quiet moment, made by the orchestrating session. Docs, handbook and
   `BUILD_PROGRESS.md` changes never merge alone; they ride the train.
2. **Workers never merge to `main`.** A worker does its task in its own git
   worktree on its own branch, verifies locally (typecheck, lint, the tests
   covering the files it touched; a full sweep at most once, only if it changed
   shared code), pushes the branch, and reports the branch name and commit.
   The orchestrator merges the train.
3. **One train, one verification.** The deploy verification below runs once
   for the train, not once per fix. If the train carries a Prisma migration,
   read the migration step of the run before calling it green. The hotfix
   lane keeps its own verification.
4. **Two orchestrators, one to-do.** Each orchestrator session adds a short
   "In flight" block to `BUILD_PROGRESS.md` on its first train (what it owns,
   which files) and reads the other's before starting anything.

## Deploy verification

A session that pushes code to `main` (the orchestrator merging a train, or a
hotfix) is **not done** until the deploy is green. `git push` completing is
not the finish line — the GitHub Actions deploy and a `/healthz` 200 are.
Skip this block only for docs-only commits that demonstrably can't trigger
the deploy.

After any push that targets `main`:

```bash
# Wait for the run to register, then grab its id
sleep 15
RUN_ID=$(gh run list --branch main --workflow deploy.yml --limit 1 \
  --json databaseId -q '.[0].databaseId')

# Block until the run completes; exits non-zero if it failed
gh run watch "$RUN_ID" --exit-status
```

If `gh run watch` exits non-zero:

```bash
gh run view "$RUN_ID" --log-failed
```

Diagnose the root cause from the logs. Fix in code. Commit and push. Repeat
the verification block.

**Cap at 3 retries.** If the third attempt still fails:

- Stop. Don't keep pushing.
- Report to Rebecca with: the run URL, the failure mode, what you tried,
  what you'd try next.
- Don't bypass with `--no-verify`, don't revert unless asked, don't switch
  to a different deploy path.

Once `gh run watch` exits zero, smoke-test:

```bash
curl -sS -o /dev/null -w "%{http_code}\n" https://homemade.education/healthz
```

Must print `200`. If not, the GitHub Actions step succeeded but ECS didn't
take traffic — usually a healthcheck path / env var problem. Investigate the
running task in CloudWatch logs (`/homemade/web`) before declaring done.

When both checks pass, the session is done.

### Don't

- Skip the verification because "the change was tiny."
- Skip because "the previous push worked, this is just docs." Docs commits
  don't normally trigger the deploy, but they CAN if the same commit also
  bumps something else. Always verify.
- Use `--no-verify` on commits to dodge pre-commit hooks. Fix the underlying
  issue.
- Force-push to fix a broken deploy. The retry path is: new commit, new
  push, new run.
- Open a PR and walk away. Nobody opens PRs here; the orchestrator merges the
  daily train to `main` directly, and PRs are not the verification path.

### Edge cases

- A docs-only change that doesn't trigger the deploy workflow can skip
  verification — but explicitly note in the hand-off that no deploy was
  expected.
- If the deploy fails because a secret needs rotating, a Cloudflare DNS
  change is pending, or some other external thing only Rebecca can do, the
  worker stops and hands off rather than retrying.

## A few repo quirks worth knowing on day one

- `pnpm deploy` is a built-in pnpm command — never name a workspace script
  `deploy`. Use `pnpm --filter X exec cdk deploy` for CDK.
- `apps/web/src/proxy.ts` is the Next.js 16 rename of `middleware.ts`.
- Admin lives at `/admin` inside `apps/web`, not a separate app.
- The public tutorial RENDERER stays TipTap-free — the editor (admin) imports
  `@tiptap/*`, and `components/public/tutorial-content/` walks the JSON with
  plain React (type-only `@tiptap/core` imports are erased at build). The one
  runtime `@tiptap/react` import under `components/public/` is the member
  recipe editor, `recipes/recipe-body-editor.tsx`; don't add another.
- Prisma 7's datasource `url` lives in `packages/db/prisma.config.ts`, not in
  the `schema.prisma` `datasource` block.
- Resolving pnpm depends on where the session runs: on Rebecca's laptop the
  harness needs `PATH="$PATH:$HOME/AppData/Roaming/npm"`; in a cloud session it
  is `export PATH=$HOME/.local/bin:$PATH` (which is also where `aws` and `gh`
  live). The workspace pins `pnpm@11.0.9`.
- Running DB/publish ops (tsx importing `@homemade/db`): the database is reached
  only over the Neon WebSocket path (`PG_VIA_HTTPS_PROXY=1`, already in
  `.env.credentials`) — never a tunnel, a listener or `psql`. A worktree resolves
  the package after ONE `pnpm install --frozen-lockfile --prefer-offline` in the worktree
  (~3 min, hardlinks from the global pnpm store; verified — it then queries the
  live DB fine). PREFER this: the session stays fully in its own worktree and
  never touches the shared main checkout. The main checkout also resolves it
  (already installed) and is a fine faster no-install path. Either way, keep any
  shared checkout clean: name throwaway scripts `*.tmp.ts` (gitignored), never
  run `git add -A` there, and PUSH from a clean worktree — never commit a working
  tree full of stray junk/deletions; that's how a deploy gets polluted.
- `packages/db/scripts/*` load `../../.env.credentials` themselves;
  `apps/web/scripts/*` take `HOMEMADE_ENV_FILE`, so run those as
  `cd apps/web && HOMEMADE_ENV_FILE=../../.env.credentials pnpm exec tsx scripts/<x>.ts`.
- Taking a category public is a CODE change: `LAUNCH_VISIBLE_CATEGORY_SLUGS` in
  `packages/db/scripts/enforce-launch-visibility.ts` (today: cooking, baking,
  cross-stitch, needlework). A direct `isPublicVisible` write is reverted on the
  next deploy.

## Cloud sessions

Cloud sessions (`claude --cloud`, claude.ai/code, the mobile app, routines) run
on an Anthropic-managed Ubuntu VM with a **fresh clone of this repo** — never
Rebecca's checkout. Only what's committed here reaches them.

Bootstrap is split in two:

- The cloud **environment setup script** (configured at claude.ai/code, cached
  into the VM snapshot) installs pnpm 11.0.9, the workspace dependencies, the
  Prisma client and the Playwright browsers.
- `scripts/cloud-session-setup.sh` runs from the `SessionStart` hook in
  `.claude/settings.json` on every session. It no-ops unless
  `CLAUDE_CODE_REMOTE=true`, then reconstructs `.env.credentials` from the
  environment variables and tops up anything the cache missed.

Deploy verification applies to cloud sessions exactly as above — `gh` is
authenticated through the GitHub proxy, and `homemade.education` plus
`*.amazonaws.com` are on the environment's allowlist so both `gh run watch` and
the `/healthz` curl work.

### What cloud sessions can't do

- **Paid model calls.** Standing rule (Rebecca, 6 September 2026): all model
  work (planning briefs, authoring, judging images) runs on her Claude Max plan
  in cloud sessions and routines. Deterministic stages (Fargate renders, audits,
  publish scripts) run on the server or as scripts. Never on her laptop. Never
  through per-token Anthropic API calls, with one agreed exception: the
  maker-photo check that runs when a customer uploads a photo. Every autopilot
  gets a budget and a total-fill cost estimate before it is switched on.
  Needlework rendering still uses local Blender until it is moved to Fargate.
- **Anything driving her browser**, including DesignSync.
- **Big builds.** ~4 vCPU / 16 GB RAM / 30 GB disk. A full `turbo build` of the
  monorepo is close to the ceiling; prefer `--filter` to one package.

### This repository is public

`becspage-arch/homemade` is public and stays so until the build is done (free
GitHub Actions minutes). The project memory in `notes/` is public with it, by
Rebecca's decision. Never commit credentials, tokens or keys; `.env.credentials`
and `.secrets/` are gitignored, keep it that way.
